from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct, Filter, FieldCondition, MatchAny
from dotenv import load_dotenv
import os
import uuid

from sentence_transformers import SentenceTransformer

load_dotenv()

class RAGUtility:
    def __init__(self, collection_name: str = "documents"):
        qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        qdrant_port = int(os.getenv("QDRANT_PORT", 6333))
        self.qdrant_client = QdrantClient(host=qdrant_host, port=qdrant_port)

        embedding_model = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        self.embedder = SentenceTransformer(embedding_model)
        self.collection_name = collection_name
        
        if not self.qdrant_client.collection_exists(collection_name):
            self.qdrant_client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=self.embedder.get_sentence_embedding_dimension(),
                    distance=Distance.COSINE
                )
            )
    
    def insert_to_collection(self, vectors, payloads):
        self.qdrant_client.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload=payload
                ) for vector, payload in zip(vectors, payloads)
            ]
        )
    
    def search_similar(self, query_vector, top_k: int = 5, document_ids: list[str] | None = None):
        search_filter = None
        if document_ids:
            search_filter = Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchAny(any=document_ids)
                    )
                ]
            )

        results = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            filter=search_filter,
            limit=top_k
        )
        return results


if __name__ == "__main__":
    ragUtility = RAGUtility()
    print(ragUtility.qdrant_client.get_collections())
