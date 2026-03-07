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


def get_all_documents(
    course_id: UUID | None,
    search: str | None,
    university_id: UUID | None,
    db: Client,
) -> list[Document]:
    course_ids = None
    if university_id:
        query = db.table("courses").select("id").eq("university_id", str(university_id))
        courses: list[dict] = query.execute().data  # type: ignore
        course_ids = [course["id"] for course in courses]

    query = db.table("documents").select(
        "*, profiles!documents_user_id_fkey1(full_name), courses(name, code)"
    )

    if course_id:
        query = query.eq("course_id", str(course_id))

    if search:
        query = query.ilike("title", f"%{search}%")

    if course_ids is not None:
        if len(course_ids) == 0:
            return []

        query = query.in_("course_id", [str(courseId) for courseId in course_ids])

    response = query.execute()

    flattened_data = []
    data: list[dict] = response.data  # type: ignore
    for item in data:
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


def get_document_by_id(
    document_id: UUID,
    db: Client,
    s3: S3Client,
) -> DocumentWithURL:
    query = (
        db.table("documents")
        .select("*, profiles!documents_user_id_fkey1(full_name), courses(name, code)")
        .eq("id", str(document_id))
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    data: dict = response.data[0]  # type: ignore
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

    url = get_document_file_url(document_id, s3)
    flattened_item["url"] = url

    return DocumentWithURL.model_validate(flattened_item)


def upload_new_document(
    document_data: DocumentBase,
    file: UploadFile,
    current_user: BaseUser,
    rag_utility: RAGUtility,
    db: Client,
    s3: S3Client,
) -> DocumentBase:

    title = document_data.title
    unit = document_data.unit
    course_id = document_data.course_id

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    temp_dir = Path(__file__).parent.parent / "temp"
    document_id = str(uuid4())
    temp_file_path = temp_dir / f"{document_id}.pdf"
    try:
        with open(temp_file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        bucket_name = os.getenv("SUPABASE_S3_BUCKET_NAME", "")
        key = f"documents/{document_id}"
        s3.upload_file(
            Filename=str(temp_file_path),
            Bucket=bucket_name,
            Key=key,
            ExtraArgs={"ContentType": "application/pdf"},
        )
        rag_utility.insert_to_collection(temp_file_path, docId=UUID(document_id))

        user_id = current_user.id
        if not title:
            title = temp_file_path.stem

        query = db.table("documents").insert(
            {
                "id": str(document_id),
                "title": title,
                "unit": unit,
                "course_id": str(course_id),
                "user_id": str(user_id),
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


def delete_document_by_id(
    document_id: UUID,
    rag_utility: RAGUtility,
    db: Client,
    s3: S3Client,
) -> DocumentBase:
    key = f"documents/{document_id}"
    bucket_name = os.getenv("SUPABASE_S3_BUCKET_NAME", "")
    s3.delete_object(Bucket=bucket_name, Key=key)

    document_images = s3.list_objects_v2(
        Bucket=bucket_name, Prefix=f"images/{document_id}/"
    )
    for image in document_images.get("Contents", []):
        s3.delete_object(Bucket=bucket_name, Key=image["Key"])  # type: ignore

    rag_utility.delete_from_collection(document_id)

    query = db.table("documents").delete().eq("id", str(document_id))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentBase.model_validate(response.data[0])


def get_document_file_url(
    document_id: UUID,
    s3: S3Client,
):
    bucket_name = os.getenv("SUPABASE_S3_BUCKET_NAME", "")
    key = f"documents/{document_id}"
    url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": bucket_name,
            "Key": key,
        },
        ExpiresIn=3600,
    )
    return url
