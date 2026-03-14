from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.orchestrator import NovaFlowOrchestrator
from backend.automation import NovaFlowAutomation
from backend.safety import NovaFlowSafety
import uvicorn
import asyncio

app = FastAPI(title="NovaFlow API")

# Enable CORS for the Vite dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = NovaFlowOrchestrator()
automation = NovaFlowAutomation()
safety = NovaFlowSafety()

class GoalRequest(BaseModel):
    goal: str

@app.get("/status")
async def get_status():
    return {"status": "online", "agent": "NovaFlow"}

@app.post("/execute")
async def execute_goal(request: GoalRequest):
    # 1. Decompose Goal
    steps = await orchestrator.decompose_goal(request.goal)
    
    # 2. Start Session (assuming first step provides starting point or we use a default)
    # For demo: starting at google if no URL found
    await automation.start_session("https://www.google.com")
    
    # 3. Simulate execution loop (Simplified for now)
    results = []
    # Implementation of step-by-step execution with safety checks would go here
    
    return {
        "goal": request.goal,
        "steps": steps,
        "live_view_url": automation.get_live_view_url()
    }

@app.get("/live-view")
async def get_live_view():
    return {"url": automation.get_live_view_url()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
