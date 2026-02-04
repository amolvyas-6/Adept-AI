from uuid import UUID
from pathlib import Path
import shutil
from fastapi import APIRouter, Depends, File, Form, UploadFile
from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.dependencies.s3Client import get_s3_client
from app.services.documents import (
    deleteDocumentById,
    getAllDocuments,
    getDocumentById,
    getDocumentFileURL,
    uploadNewDocument,
)

router = APIRouter(
    prefix="/documents", tags=["documents"], dependencies=[Depends(get_current_user)]
)


@router.get("/")
def listDocuments(
    courseId: UUID | None = None,
    search: str | None = None,
    universityId: UUID | None = None,
    db=Depends(get_supabase_client),
):
    documents = getAllDocuments(courseId, search, universityId, db)
    return {
        "success": True,
        "data": documents,
        "message": "Documents retrieved successfully",
    }


@router.get("/{documentId}")
def getDocument(
    documentId: UUID,
    db=Depends(get_supabase_client),
    s3=Depends(get_s3_client),
):
    document = getDocumentById(documentId, db)
    url = getDocumentFileURL(documentId, s3)
    return {
        "success": True,
        "data": {
            "document": document,
            "url": url,
        },
        "message": "Document retrieved successfully",
    }


@router.post("/")
async def createDocument(
    document: UploadFile = File(...),
    title: str | None = Form(None),
    unit: int = Form(..., ge=0, le=5),
    courseId: UUID = Form(...),
    current_user=Depends(get_current_user),
    db=Depends(get_supabase_client),
    s3=Depends(get_s3_client),
):

    document = uploadNewDocument(title, unit, courseId, document, current_user, db, s3)
    return {
        "success": True,
        "data": document,
        "message": "Document uploaded successfully",
    }


@router.delete("/{documentId}")
def deleteDocument(
    documentId: UUID,
    db=Depends(get_supabase_client),
    s3=Depends(get_s3_client),
):

    document = deleteDocumentById(documentId, db, s3)
    return {
        "success": True,
        "data": document,
        "message": "Document deleted successfully",
    }
