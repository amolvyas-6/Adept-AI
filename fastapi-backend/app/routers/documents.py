from typing import Annotated
from uuid import UUID

from app.dependencies.ai_dependency import getRAG
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.s3_client import get_s3_client
from app.dependencies.supabase_client import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.documents import Document, DocumentBase, DocumentWithURL
from app.services.documents import (
    delete_document_by_id,
    get_all_documents,
    get_document_by_id,
    upload_new_document,
)
from app.utils.rag import RAGUtility
from fastapi import APIRouter, Depends, File, Form, UploadFile
from mypy_boto3_s3 import S3Client
from supabase import Client

router = APIRouter(
    prefix="/documents", tags=["documents"], dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_documents(
    db: Annotated[Client, Depends(get_supabase_client)],
    course_id: UUID | None = None,
    search: str | None = None,
    university_id: UUID | None = None,
) -> ApiResponse[list[Document]]:
    documents = get_all_documents(course_id, search, university_id, db)
    return ApiResponse(
        success=True, data=documents, message="Documents retrieved successfully"
    )


@router.get("/{document_id}")
def get_document(
    document_id: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    s3: Annotated[S3Client, Depends(get_s3_client)],
) -> ApiResponse[DocumentWithURL]:
    document = get_document_by_id(document_id, db, s3)

    return ApiResponse(
        success=True, data=document, message="Document retrieved successfully"
    )


@router.post("")
async def create_document(
    current_user: Annotated[BaseUser, Depends(get_current_user)],
    rag_utility: Annotated[RAGUtility, Depends(getRAG)],
    db: Annotated[Client, Depends(get_supabase_client)],
    s3: Annotated[S3Client, Depends(get_s3_client)],
    document_data: Annotated[DocumentBase, Form()],
    document: Annotated[UploadFile, File(...)],
) -> ApiResponse[DocumentBase]:

    new_document = upload_new_document(
        document_data,
        document,
        current_user,
        rag_utility,
        db,
        s3,
    )
    return ApiResponse(
        success=True,
        data=new_document,
        message="Document uploaded successfully",
    )


@router.delete("/{document_id}")
def delete_document(
    document_id: UUID,
    rag_utility: Annotated[RAGUtility, Depends(getRAG)],
    db: Annotated[Client, Depends(get_supabase_client)],
    s3: Annotated[S3Client, Depends(get_s3_client)],
) -> ApiResponse[DocumentBase]:

    document = delete_document_by_id(document_id, rag_utility, db, s3)
    return ApiResponse(
        success=True,
        data=document,
        message="Document deleted successfully",
    )
