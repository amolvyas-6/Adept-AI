import os
from pathlib import Path
from uuid import UUID

from app.utils.rag import RAGUtility
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama


class LLM:
    def __init__(self, rag_utility: RAGUtility):
        self.rag_utility = rag_utility
        self.CHAT_HISTORY_LIMIT = 10

        # MODEL = "qwen3:latest"
        # self.chat_model = ChatOllama(model=MODEL, reasoning=False)
        CHAT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
        self.chat_model = ChatGroq(
            model=CHAT_MODEL,
            api_key=os.getenv("GROQ_API_KEY"),
        )

        self.system_message = SystemMessage(
            content="""
                You are an expert Technical Documentation Analyst. 
                Your goal is to answer user questions based strictly on the provided context.
                - If the answer is not in the context, state "Data not available."
                - Analyze the provided image to support your textual evidence.
            """
        )

    def query(
        self, user_query: str, document_ids: list[UUID], chat_history: list[dict] = []
    ):
        context_text, context_images, context_metadata = self.rag_utility.query(
            user_query, document_ids, k=3
        )
        yield {"metadata": context_metadata}

        human_message_content = (
            [{"type": "text", "text": f"SYSTEM CONTEXT\n {context_text}"}]
            + context_images
            + [{"type": "text", "text": f"USER QUESTION: {user_query}"}]
        )

        for i in range(
            max(0, len(chat_history) - self.CHAT_HISTORY_LIMIT), len(chat_history)
        ):
            message = chat_history[i]
            if message["role"] == "assistant":
                chat_history[i] = AIMessage(
                    content=message["content"],
                )
            elif message["role"] == "user":
                chat_history[i] = HumanMessage(
                    content=message["content"],
                )

        human_message = HumanMessage(content=human_message_content)
        for chunk in self.chat_model.stream(
            [self.system_message] + chat_history + [human_message]
        ):
            yield {"content": chunk.content}


if __name__ == "__main__":
    # rag_utility = RAGUtility()
    # file_path = Path("Unit 2.pdf")
    # print(str(file_path))
    # rag_utility.insert_to_collection(file_path)

    llm = LLM(rag_utility=None)
    query = "why do we need planning?"
    for chunk in llm.query(query, document_ids=[]):
        if "content" in chunk:
            print(chunk["content"], end="", flush=True)
        elif "metadata" in chunk:
            print("Context Metadata:", chunk["metadata"])
