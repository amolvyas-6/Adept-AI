import os
import shutil
from pathlib import Path
from uuid import UUID, uuid4

from app.schemas.core import BaseUser
from app.schemas.documents import Document, DocumentBase, DocumentWithURL
from app.utils.rag import RAGUtility
from fastapi import HTTPException, UploadFile
from mypy_boto3_s3 import S3Client
from supabase import Client


def getAllDocuments(
    courseId: UUID | None,
    search: str | None,
    universityId: UUID | None,
    db: Client,
) -> list[Document]:
    courseIds = None
    if universityId:
        query = db.table("courses").select("id").eq("university_id", str(universityId))
        courses = query.execute().data
        courseIds = [course["id"] for course in courses]

    query = db.table("documents").select(
        "*, profiles!documents_user_id_fkey1(full_name), courses(name, code)"
    )

    if courseId:
        query = query.eq("course_id", str(courseId))

    if search:
        query = query.ilike("title", f"%{search}%")

    if courseIds is not None:
        if len(courseIds) == 0:
            return []

        query = query.in_("course_id", [str(courseId) for courseId in courseIds])

    response = query.execute()

    flattened_data = []
    for item in response.data:
        flattened_item = {
            "id": item["id"],
            "title": item["title"],
            "user_id": item["user_id"],
            "course_id": item["course_id"],
            "unit": item["unit"],
            "created_at": item["created_at"],
            "uploaded_by": (
                item["profiles"]["full_name"] if item.get("profiles") else None
            ),
            "course_name": item["courses"]["name"] if item.get("courses") else None,
            "course_code": item["courses"]["code"] if item.get("courses") else None,
        }
        flattened_data.append(flattened_item)

    return [Document.model_validate(item) for item in flattened_data]


def getDocumentById(
    documentId: UUID,
    db: Client,
    s3: S3Client,
) -> DocumentWithURL:
    query = (
        db.table("documents")
        .select("*, profiles!documents_user_id_fkey1(full_name), courses(name, code)")
        .eq("id", str(documentId))
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    data = response.data[0]
    flattened_item = {
        "id": data["id"],
        "title": data["title"],
        "user_id": data["user_id"],
        "course_id": data["course_id"],
        "unit": data["unit"],
        "created_at": data["created_at"],
        "uploaded_by": (
            data["profiles"]["full_name"] if data.get("profiles") else None
        ),
        "course_name": (data["courses"]["name"] if data.get("courses") else None),
        "course_code": (data["courses"]["code"] if data.get("courses") else None),
    }

    url = getDocumentFileURL(documentId, s3)
    flattened_item["url"] = url

    return DocumentWithURL.model_validate(flattened_item)


def uploadNewDocument(
    title: str | None,
    unit: int,
    courseId: UUID,
    file: UploadFile,
    currentUser: BaseUser,
    ragUtility: RAGUtility,
    db: Client,
    s3: S3Client,
) -> DocumentBase:

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    temp_dir = Path(__file__).parent.parent / "temp"
    document_id = str(uuid4())
    temp_file_path = temp_dir / f"{document_id}.pdf"
    try:
        with open(temp_file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        bucketName = os.getenv("SUPABASE_S3_BUCKET_NAME")
        key = f"documents/{document_id}"
        s3.upload_file(
            Filename=str(temp_file_path),
            Bucket=bucketName,
            Key=key,
            ExtraArgs={"ContentType": "application/pdf"},
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

        return DocumentBase.model_validate(response.data[0])

    finally:
        if temp_file_path.exists():
            temp_file_path.unlink()


def deleteDocumentById(
    documentId: UUID,
    ragUtility: RAGUtility,
    db: Client,
    s3: S3Client,
) -> DocumentBase:
    key = f"documents/{documentId}"
    bucketName = os.getenv("SUPABASE_S3_BUCKET_NAME")
    s3.delete_object(Bucket=bucketName, Key=key)

    document_images = s3.list_objects_v2(
        Bucket=bucketName, Prefix=f"images/{documentId}/"
    )
    if "Contents" in document_images:
        for image in document_images["Contents"]:
            s3.delete_object(Bucket=bucketName, Key=image["Key"])

    ragUtility.delete_from_collection(documentId)

    query = db.table("documents").delete().eq("id", str(documentId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentBase.model_validate(response.data[0])


def getDocumentFileURL(
    documentId: UUID,
    s3: S3Client,
):
    bucketName = os.getenv("SUPABASE_S3_BUCKET_NAME")
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
