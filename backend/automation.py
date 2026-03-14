import os
import boto3
from nova_act import NovaActClient
from dotenv import load_dotenv

load_dotenv()

class NovaFlowAutomation:
    def __init__(self):
        self.client = NovaActClient(
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        self.session_id = None

    async def start_session(self, url: str):
        print(f"Starting Nova Act session at {url}")
        # In a real scenario, nova-act starts a browser session
        self.session_id = await self.client.create_session(initial_url=url)
        return self.session_id

    async def execute_action(self, instruction: str):
        if not self.session_id:
            raise Exception("Session not started")
        
        print(f"Executing: {instruction}")
        # Using nova.act() native loop for visual reasoning
        result = await self.client.act(
            session_id=self.session_id,
            goal=instruction,
            visual_context=True # Key feature: uses visual reasoning to find elements
        )
        return result

    def get_live_view_url(self):
        if self.session_id:
            return self.client.get_live_view_url(self.session_id)
        return None

if __name__ == "__main__":
    # Placeholder for local testing
    pass
