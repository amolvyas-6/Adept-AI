from typing import Annotated
from uuid import UUID

from app.dependencies.aiDependency import getRAG
from app.dependencies.authDependency import get_current_user
from app.dependencies.s3Client import get_s3_client
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.documents import Document, DocumentBase, DocumentWithURL
from app.services.documents import (
    deleteDocumentById,
    getAllDocuments,
    getDocumentById,
    uploadNewDocument,
)
from app.utils.rag import RAGUtility
from fastapi import APIRouter, Depends, File, Form, UploadFile
from mypy_boto3_s3 import S3Client
from supabase import Client

router = APIRouter(
    prefix="/documents", tags=["documents"], dependencies=[Depends(get_current_user)]
)


@router.get("/")
def listDocuments(
    db: Annotated[Client, Depends(get_supabase_client)],
    courseId: UUID | None = None,
    search: str | None = None,
    universityId: UUID | None = None,
) -> ApiResponse[list[Document]]:
    documents = getAllDocuments(courseId, search, universityId, db)
    return ApiResponse(
        success=True, data=documents, message="Documents retrieved successfully"
    )


@router.get("/{documentId}")
def getDocument(
    documentId: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    s3: Annotated[S3Client, Depends(get_s3_client)],
) -> ApiResponse[DocumentWithURL]:
    document = getDocumentById(documentId, db, s3)

    return ApiResponse(
        success=True, data=document, message="Document retrieved successfully"
    )


@router.post("/")
async def createDocument(
    current_user: Annotated[BaseUser, Depends(get_current_user)],
    ragUtility: Annotated[RAGUtility, Depends(getRAG)],
    db: Annotated[Client, Depends(get_supabase_client)],
    s3: Annotated[S3Client, Depends(get_s3_client)],
    document_data: Annotated[DocumentBase, Form()],
    document: Annotated[UploadFile, File(...)],
) -> ApiResponse[DocumentBase]:

    new_document = uploadNewDocument(
        document_data.title,
        document_data.unit,
        document_data.courseId,
        document,
        current_user,
        ragUtility,
        db,
        s3,
    )
    return ApiResponse(
        success=True,
        data=new_document,
        message="Document uploaded successfully",
    )


@router.delete("/{documentId}")
def deleteDocument(
    documentId: UUID,
    ragUtility: Annotated[RAGUtility, Depends(getRAG)],
    db: Annotated[Client, Depends(get_supabase_client)],
    s3: Annotated[S3Client, Depends(get_s3_client)],
) -> ApiResponse[DocumentBase]:

    document = deleteDocumentById(documentId, ragUtility, db, s3)
    return ApiResponse(
        success=True,
        data=document,
        message="Document deleted successfully",
    )
