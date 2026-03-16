from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from orchestrator import NovaFlowOrchestrator
from automation import NovaFlowAutomation
import uvicorn
import os
from dotenv import load_dotenv

# Import routers
from auth import app as auth_app
from projects import router as projects_router

load_dotenv()

app = FastAPI(title="NovaFlow API")

# Enable CORS for the Vite/Next.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect routers
app.include_router(projects_router)
app.mount("/auth", auth_app) # Keep auth as a sub-app or include its routes

orchestrator = NovaFlowOrchestrator()
automation = NovaFlowAutomation()

@app.get("/status")
async def get_status():
    return {"status": "online", "agent": "NovaFlow", "version": "2.0-aws"}

# New simplified goal execution for NovaFlow
class GoalRequest(BaseModel):
    goal: str

@app.post("/execute")
async def execute_goal(request: GoalRequest):
    steps = await orchestrator.decompose_goal(request.goal)
    return {
        "goal": request.goal,
        "steps": steps,
        "status": "plan_generated"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
