import os
import shutil
from pathlib import Path
from uuid import UUID, uuid4

from app.utils.rag import RAGUtility
from fastapi import HTTPException, UploadFile
from supabase import Client


def getAllDocuments(
    courseId: UUID | None,
    search: str | None,
    universityId: UUID | None,
    db: Client,
):
    courseIds = None
    if universityId:
        query = db.table("courses").select("id").eq("university_id", str(universityId))
        courses = query.execute().data
        courseIds = [course["id"] for course in courses]

    query = db.table("documents").select("*, profiles(full_name), courses(name, code)")

    if courseId:
        query = query.eq("course_id", str(courseId))

    if search:
        query = query.ilike("title", f"%{search}%")

    if courseIds is not None:
        if len(courseIds) == 0:
            return []

        query = query.in_("course_id", [str(courseId) for courseId in courseIds])

    response = query.execute()
    return response.data


def getDocumentById(
    documentId: UUID,
    db: Client,
):
    query = (
        db.table("documents")
        .select("*, profiles(full_name), courses(name, code)")
        .eq("id", str(documentId))
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    return response.data[0]


def uploadNewDocument(
    title: str | None,
    unit: int,
    courseId: UUID,
    file: UploadFile,
    currentUser,
    ragUtility: RAGUtility,
    db: Client,
    s3,
):

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    temp_dir = Path(__file__).parent.parent / "temp"
    document_id = str(uuid4())
    temp_file_path = temp_dir / f"{document_id}.pdf"
    try:
        with open(temp_file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        bucketName = os.getenv("CLOUDFLARE_R2_BUCKET_NAME")
        key = f"documents/{document_id}"
        s3.upload_file(
            Filename=str(temp_file_path),
            Bucket=bucketName,
            Key=key,
        )
        ragUtility.insert_to_collection(temp_file_path, docId=UUID(document_id))

        userId = currentUser.id
        if not title:
            title = temp_file_path.stem

        query = db.table("documents").insert(
            {
                "id": str(document_id),
                "title": title,
                "unit": unit,
                "course_id": str(courseId),
                "user_id": str(userId),
            }
        )
        response = query.execute()
        if len(response.data) == 0:
            raise HTTPException(
                status_code=500, detail="Failed to create document record"
            )

        return response.data[0]

    finally:
        if temp_file_path.exists():
            temp_file_path.unlink()


def deleteDocumentById(
    documentId: UUID,
    ragUtility: RAGUtility,
    db: Client,
    s3,
):
    key = f"documents/{documentId}"
    bucketName = os.getenv("CLOUDFLARE_R2_BUCKET_NAME")
    s3.delete_object(Bucket=bucketName, Key=key)

    ragUtility.delete_from_collection(documentId)

    query = db.table("documents").delete().eq("id", str(documentId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    return response.data[0]


def getDocumentFileURL(
    documentId: UUID,
    s3,
):
    bucketName = os.getenv("CLOUDFLARE_R2_BUCKET_NAME")
    key = f"documents/{documentId}"
    url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": bucketName,
            "Key": key,
        },
        ExpiresIn=3600,
    )
    return url
