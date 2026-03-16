import os
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Connection Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "novaflow"

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def get_database():
    if db.client is None:
        db.client = AsyncIOMotorClient(MONGODB_URL)
        db.db = db.client[DATABASE_NAME]
    return db.db

async def close_database():
    if db.client:
        db.client.close()
