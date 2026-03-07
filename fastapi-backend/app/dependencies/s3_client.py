import os

import boto3

S3_ENDPOINT = os.getenv("SUPABASE_S3_ENDPOINT")
S3_ACCESS_KEY = os.getenv("SUPABASE_S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.getenv("SUPABASE_S3_SECRET_ACCESS_KEY")

s3 = boto3.client(
    service_name="s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_ACCESS_KEY,
    region_name="ap-south-1",
)


def get_s3_client():
    return s3
