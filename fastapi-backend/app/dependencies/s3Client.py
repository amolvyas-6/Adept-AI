import os

import boto3

CLOUDFLARE_R2_ENDPOINT = os.getenv("CLOUDFLARE_R2_ENDPOINT")
CLOUDFLARE_R2_ACCESS_KEY_ID = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID")
CLOUDFLARE_R2_SECRET_ACCESS_KEY = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")

s3 = boto3.client(
    service_name="s3",
    endpoint_url=CLOUDFLARE_R2_ENDPOINT,
    aws_access_key_id=CLOUDFLARE_R2_ACCESS_KEY_ID,
    aws_secret_access_key=CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    region_name="auto",
)


def get_s3_client():
    return s3
