import sys
import pymongo
import gridfs
import ollama
from prompts import SYSTEM_PROMPT

MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "novaflow_video"

def analyze_frame(image_source):
    """
    Analyzes a given image source (bytes or path) using Ollama's LLaVA model.
    """
    response = ollama.chat(
        model='llava',
        messages=[
            {
                'role': 'system',
                'content': SYSTEM_PROMPT
            },
            {
                'role': 'user',
                'content': 'Analyze this image carefully.',
                'images': [image_source]
            }
        ]
    )
    return response['message']['content']

def check_pending_frames(video_id=None):
    """
    Checks the MongoDB GridFS for frames that are marked as pending_audit,
    runs them through the analyzer, and updates their status.
    """
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    fs = gridfs.GridFS(db)
    metadata_col = db["frame_metadata"]

    query = {"status": "pending_audit"}
    if video_id:
        query["video_id"] = video_id
        
    pending_frames = list(metadata_col.find(query).sort("frame_number", 1))
    
    if not pending_frames:
        print(f"No pending frames found{' for video ' + video_id if video_id else ''}.")
        return
        
    print(f"Found {len(pending_frames)} pending frames. Starting LLaVA analysis via Ollama...")
    
    for meta in pending_frames:
        vid = meta['video_id']
        fnum = meta['frame_number']
        print(f"\nAnalyzing frame {fnum} from video {vid}...")
        
        try:
            # 1. Retrieve image bytes from GridFS
            gridfs_id = meta["gridfs_id"]
            frame_bytes = fs.get(gridfs_id).read()
            
            # 2. Analyze the image bytes
            report = analyze_frame(frame_bytes)
            
            print(f"--- FRAME {fnum} ANALYSIS REPORT ---")
            print(report)
            print("-" * 40)
            
            # 3. Update MongoDB
            metadata_col.update_one(
                {"_id": meta["_id"]},
                {"$set": {
                    "status": "audited",
                    "analysis_report": report
                }}
            )
            print(f"-> Successfully updated database status to 'audited'.")
            
        except Exception as e:
            print(f"-> Error auditing frame {fnum}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1]
        
        # Test a local image file
        if target.endswith(('.jpg', '.png', '.jpeg')):
            print(f"Analyzing local file: {target}...")
            print(analyze_frame(target))
        # Test a specific video ID from DB
        else:
            check_pending_frames(video_id=target)
    else:
        # Audit all pending frames from any video
        print("Auditing all pending frames in the database...")
        check_pending_frames()