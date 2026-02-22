import os
import uuid
from pathlib import Path

import pymupdf
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchAny,
    PayloadSchemaType,
    VectorParams,
)

load_dotenv()


class RAGUtility:
    def __init__(self, collection_name: str = "documents"):
        # qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        # qdrant_port = int(os.getenv("QDRANT_PORT", 6333))
        # self.qdrant_client = QdrantClient(host=qdrant_host, port=qdrant_port)
        self.qdrant_client = QdrantClient(
            url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY")
        )
        self.collection_name = collection_name
        if not self.qdrant_client.collection_exists(self.collection_name):
            self.qdrant_client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=384,
                    distance=Distance.COSINE,
                ),
            )

            self.qdrant_client.create_payload_index(
                collection_name=self.collection_name,
                field_name="metadata.docId",
                field_schema=PayloadSchemaType.UUID,
            )

        EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
        self.embedder = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL, show_progress=True
        )

        self.vector_store = QdrantVectorStore(
            self.qdrant_client,
            collection_name=self.collection_name,
            embedding=self.embedder,
        )

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1200, chunk_overlap=200
        )

    def insert_to_collection(self, file_path: Path, docId: uuid.UUID):
        docs = self._parse_pdf(file_path, docId)
        self.vector_store.add_documents(docs)

    def delete_from_collection(self, docId: uuid.UUID):
        filter = Filter(
            must=[
                FieldCondition(
                    key="metadata.docId",
                    match=MatchAny(any=[str(docId)]),
                )
            ]
        )
        self.qdrant_client.delete(
            collection_name=self.collection_name,
            points_selector=FilterSelector(filter=filter),
        )

    def query(self, query: str, document_ids: list[uuid.UUID], k: int = 3):
        document_filter = Filter(
            must=[
                FieldCondition(
                    key="metadata.docId",
                    match=MatchAny(any=[str(doc_id) for doc_id in document_ids]),
                )
            ]
        )

        rag_results = self.vector_store.similarity_search(
            query, filter=document_filter, k=k
        )

        context_text = ""
        context_images = []
        context_metadata = []
        for result in rag_results:
            if result.metadata["type"] == "text":
                context_text += f"SOURCE: {result.metadata['title']} PAGE: {result.metadata['page']} \n"
                context_text += f"CONTENT: {result.page_content}\n\n"
            elif result.metadata["type"] == "image":
                context_images.append(
                    {
                        "type": "image_url",
                        "image_url": result.metadata["image_url"],
                    }
                )

            metadata = {
                "source": result.metadata["title"],
                "page": result.metadata["page"],
                "type": result.metadata["type"],
                "docId": result.metadata["docId"],
            }
            context_metadata.append(metadata)

        return context_text, context_images, context_metadata

    def _parse_pdf(self, file_path: Path, docId: uuid.UUID):
        file = pymupdf.open(str(file_path))
        text = []
        images = []
        for page in file:
            text.append(page.get_text())
            images.append(page.get_images())

        docs = self.text_splitter.create_documents(
            text,
            metadatas=[
                {"page": i, "docId": docId, "type": "text", "title": file_path.stem}
                for i in range(len(text))
            ],
        )
        return docs


if __name__ == "__main__":
    rag_utility = RAGUtility()

    uuid_str = "123e4567-e89b-12d3-a456-426614174000"  # Example UUID string
    rag_utility.insert_to_collection(Path("Unit 2.pdf"), uuid.UUID(uuid_str))
    results = rag_utility.query(
        "What is the main topic of the document?", [uuid.UUID(uuid_str)]
    )
    print(results)
