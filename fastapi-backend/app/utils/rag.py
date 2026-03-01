import os
import uuid
from pathlib import Path

import pymupdf
from app.dependencies.s3Client import get_s3_client
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
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

        SUMMARY_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
        self.summary_model = ChatGroq(
            model=SUMMARY_MODEL,
            api_key=os.getenv("GROQ_API_KEY"),
        )

        self.vector_store = QdrantVectorStore(
            self.qdrant_client,
            collection_name=self.collection_name,
            embedding=self.embedder,
        )

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1200, chunk_overlap=200
        )

        self.s3_client = get_s3_client()

        self.CONFIDENCE_THRESHOLD = 0.65

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

        rag_results = self.vector_store.similarity_search_with_relevance_scores(
            query, filter=document_filter, k=k
        )

        context_text = ""
        context_images = []
        context_metadata = []
        for result, score in rag_results:
            if score < self.CONFIDENCE_THRESHOLD:
                continue
            if result.metadata["type"] == "text":
                context_text += f"SOURCE: {result.metadata['title']} PAGE: {result.metadata['page']} \n"
                context_text += f"CONTENT: {result.page_content}\n\n"
            elif result.metadata["type"] == "image":
                context_images.append(
                    {
                        "type": "image_url",
                        "image_url": {"url": result.metadata["image_url"]},
                    }
                )

            metadata = {
                "source": result.metadata["title"],
                "page": result.metadata["page"],
                "type": result.metadata["type"],
                "docId": str(result.metadata["docId"]),
            }
            context_metadata.append(metadata)

        return context_text, context_images, context_metadata

    def _parse_pdf(self, file_path: Path, docId: uuid.UUID):
        file = pymupdf.open(str(file_path))
        doc_texts = []
        images = []
        for page in file:
            page_text = page.get_text()
            page_images = page.get_images(full=True)

            if len(page_text) > 100:
                doc_texts.append({"page_no": page.number, "content": page_text})

            if len(page_images) > 0:
                for img in page_images:
                    xref = img[0]
                    base_image = file.extract_image(xref)
                    image_bytes, image_ext = base_image["image"], base_image["ext"]
                    image_name = f"{str(docId)}-page{page.number}_img{xref}.{image_ext}"
                    image_path = Path(__file__).parent.parent / "temp" / image_name
                    try:
                        with open(image_path, "wb") as img_file:
                            img_file.write(image_bytes)

                        key = f"images/{str(docId)}/{image_name.split('-')[-1]}"
                        self.s3_client.upload_file(
                            Filename=str(image_path),
                            Bucket=os.getenv("SUPABASE_S3_BUCKET_NAME"),
                            Key=key,
                            ExtraArgs={"ContentType": f"image/{image_ext}"},
                        )

                        image_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{os.getenv('SUPABASE_S3_BUCKET_NAME')}/{key}"
                        image_summary = self.get_summary(image_url)
                        images.append(
                            {
                                "page_no": page.number,
                                "image_url": image_url,
                                "content": image_summary,
                            }
                        )
                    finally:
                        if image_path.exists():
                            image_path.unlink()

        docs = self.text_splitter.create_documents(
            [page["content"] for page in doc_texts],
            metadatas=[
                {
                    "page": page["page_no"],
                    "docId": docId,
                    "type": "text",
                    "title": file_path.stem,
                }
                for page in doc_texts
            ],
        )

        img_docs = self.text_splitter.create_documents(
            [img["content"] for img in images],
            metadatas=[
                {
                    "page": img["page_no"],
                    "docId": docId,
                    "type": "image",
                    "title": file_path.stem,
                    "image_url": img["image_url"],
                }
                for img in images
            ],
        )

        return docs + img_docs

    def get_summary(self, image_url):
        system_message = SystemMessage(
            content="""You are an expert image analyst. Analyze the provided image and summarize its key information in a concise manner. 
            If the image contains text, extract and summarize the textual content.
            If the image contains diagrams or charts, describe their main features and insights.
            Provide a clear and informative summary based solely on the visual information in the image."""
        )
        human_message = HumanMessage(
            content=[{"type": "image_url", "image_url": {"url": image_url}}]
        )
        print("Human Message Content:", human_message)
        response = self.summary_model.invoke([system_message, human_message])
        return response.content


if __name__ == "__main__":
    rag_utility = RAGUtility()

    uuid_str = "123e4567-e89b-12d3-a456-426614174000"  # Example UUID string

    rag_utility.insert_to_collection(Path("Unit 2.pdf"), uuid.UUID(uuid_str))
    results = rag_utility.query(
        "What is the main topic of the document?", [uuid.UUID(uuid_str)]
    )
    print(results)
