import os

from pymongo import MongoClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client: MongoClient = MongoClient(MONGODB_URI, uuidRepresentation="standard")

db = client.get_database(os.getenv("MONGODB_DB_NAME", "test"))


def get_chat_collection():
    return db["chats"]
