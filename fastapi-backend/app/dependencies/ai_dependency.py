from app.utils.agent import LLM
from app.utils.rag import RAGUtility

rag = RAGUtility()
llm = LLM(rag_utility=rag)


def getLLM():
    return llm


def getRAG():
    return rag
