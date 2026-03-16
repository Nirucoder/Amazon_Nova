import os
import subprocess
import pymongo
import gridfs
from dotenv import load_dotenv

# Load configurations
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "novaflow_video"

client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]
fs = gridfs.GridFS(db)
metadata_col = db["frame_metadata"]

def reconstruct_video(video_id, output_filename="final_compliant_video.mp4"):
    """
    Downloads all frames (preferring remediated versions) and stitches them using FFmpeg.
    """
    print(f"Starting reconstruction for Video: {video_id}...")
    
    # 1. Fetch all frames sorted by frame number
    frames = list(metadata_col.find({"video_id": video_id}).sort("frame_number", 1))
    
    if not frames:
        print("No frames found for this video ID.")
        return
    
    # 2. Setup temporary directory for frames
    temp_dir = f"temp_frames_{video_id}"
    os.makedirs(temp_dir, exist_ok=True)
    
    print(f"Downloading {len(frames)} frames to temporary directory...")
    
    for f in frames:
        frame_num = f["frame_number"]
        # Determine which gridfs_id to use (remediated has priority)
        gridfs_id = f.get("clean_gridfs_id") or f.get("gridfs_id")
        
        try:
            frame_data = fs.get(gridfs_id).read()
            # Save using sequential naming for FFmpeg
            frame_path = os.path.join(temp_dir, f"frame_{frame_num:04d}.jpg")
            with open(frame_path, "wb") as file:
                file.write(frame_data)
        except Exception as e:
            print(f"Error downloading frame {frame_num}: {e}")

    # 3. Trigger FFmpeg
    # Command: ffmpeg -y -framerate 1 -i temp_frames/frame_%04d.jpg -c:v libx264 -pix_fmt yuv420p output.mp4
    input_pattern = os.path.join(temp_dir, "frame_%04d.jpg")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-framerate", "1",
        "-i", input_pattern,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        output_filename
    ]
    
    print(f"Running FFmpeg: {' '.join(ffmpeg_cmd)}")
    try:
        subprocess.run(ffmpeg_cmd, check=True)
        print(f"Success! Final video created: {output_filename}")
        
        # 4. Optional: Upload to S3 (skipped in local POC but ready for production)
        # s3.upload_file(output_filename, BUCKET_NAME, f"results/{output_filename}")
        
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg failed: {e}")
    finally:
        # Cleanup temp directory
        # import shutil
        # shutil.rmtree(temp_dir)
        pass

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python video_stitcher.py video_id [output_name.mp4]")
    else:
        vid = sys.argv[1]
        out = sys.argv[2] if len(sys.argv) > 2 else "final_compliant_video.mp4"
        reconstruct_video(vid, out)
