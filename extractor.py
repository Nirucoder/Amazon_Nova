import sys
import subprocess
import ffmpeg
import pymongo
import gridfs
import io
from datetime import datetime

# Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "novaflow_video"
FPS = 1
MAX_DURATION = 60  # seconds

def get_video_duration(file_path):
    try:
        probe = ffmpeg.probe(file_path)
        # Check for video stream
        video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
        
        if not video_stream:
            print(f"Warning: No video stream found in {file_path}. This file might be audio-only.")
            return None
            
        # Get duration from stream or format
        duration = video_stream.get('duration')
        if duration is None:
            duration = probe.get('format', {}).get('duration')
            
        return float(duration) if duration else 0.0
    except Exception as e:
        print(f"Error probing video: {e}")
        return None

def extract_and_store(file_path, video_id=None):
    if not video_id:
        video_id = f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    duration = get_video_duration(file_path)
    if duration is None:
        return
    
    if duration > MAX_DURATION:
        print(f"Video duration {duration}s exceeds limit of {MAX_DURATION}s. Rejecting.")
        return

    # Connect to MongoDB
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    fs = gridfs.GridFS(db)
    metadata_col = db["frame_metadata"]

    print(f"Extracting frames from {file_path} for video_id: {video_id}...")

    # Extraction process using FFmpeg
    # We pipe the output to stdout in jpeg format
    process = (
        ffmpeg
        .input(file_path)
        .filter('fps', fps=FPS)
        .output('pipe:', format='image2pipe', vcodec='mjpeg', qscale=2)
        .run_async(pipe_stdout=True, pipe_stderr=True)
    )

    import threading
    def log_stderr(stderr):
        for line in iter(stderr.readline, b''):
            print(f"FFMPEG_STDERR: {line.decode().strip()}")

    stderr_thread = threading.Thread(target=log_stderr, args=(process.stderr,))
    stderr_thread.daemon = True
    stderr_thread.start()

    frame_count = 0
    buffer = bytearray()
    
    # 1MB buffer for reading large 8K JPEG frames
    CHUNK_SIZE = 1024 * 1024 

    while True:
        chunk = process.stdout.read(CHUNK_SIZE)
        if not chunk and not buffer:
            if process.poll() is not None:
                break
            continue
        
        buffer.extend(chunk)
        
        while True:
            # Find JPEG markers
            start = buffer.find(b"\xff\xd8")
            if start == -1:
                # No start marker, if we are at the end, clear buffer
                if not chunk and process.poll() is not None:
                    buffer.clear()
                break
            
            # Remove anything before the start marker
            if start > 0:
                del buffer[:start]
            
            # For 8K, we search for the end marker. 
            # We want to be careful not to find a false positive, but usually \xff\xd9 is unique enough at the end of a block.
            end = buffer.find(b"\xff\xd9")
            if end == -1:
                # Incomplete frame, need more data
                break
                
            # Full frame found
            frame_data = bytes(buffer[:end+2])
            del buffer[:end+2]
            
            # Store in GridFS
            try:
                gridfs_id = fs.put(frame_data, filename=f"{video_id}_frame_{frame_count}.jpg")
                
                # Store metadata
                metadata_col.insert_one({
                    "video_id": video_id,
                    "frame_number": frame_count,
                    "timestamp": frame_count / FPS,
                    "gridfs_id": gridfs_id,
                    "status": "pending_audit",
                    "created_at": datetime.now()
                })
                
                print(f"Stored frame {frame_count}")
                frame_count += 1
            except Exception as e:
                print(f"Error storing frame {frame_count}: {e}")
            
        if not chunk and process.poll() is not None:
            break

    process.wait()
    print(f"Extraction complete. Total frames stored: {frame_count}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extractor.py path/to/video.mp4 [video_id]")
        sys.exit(1)
    
    path = sys.argv[1]
    vid = sys.argv[2] if len(sys.argv) > 2 else None
    extract_and_store(path, vid)
