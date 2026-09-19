import boto3
from botocore.exceptions import ClientError

from app.application.storage.pdf_storage import PdfStorage


class S3PdfStorage(PdfStorage):
    def __init__(self, endpoint_url: str, public_endpoint_url:str, access_key: str, secret_key: str, bucket: str, region: str):
        self._client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )
        self._bucket = bucket
        self._ensure_bucket()
        self._public_client = boto3.client(
            "s3",
            endpoint_url=public_endpoint_url,  # http://localhost:8333
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )

    def _ensure_bucket(self) -> None:
        try:
            self._client.head_bucket(Bucket=self._bucket)
        except ClientError:
            self._client.create_bucket(Bucket=self._bucket)

    def upload(self, storage_key: str, content: bytes) -> None:
        self._client.put_object(Bucket=self._bucket, Key=storage_key, Body=content)

    def retrieve(self, storage_key: str) -> bytes:
        response = self._client.get_object(Bucket=self._bucket, Key=storage_key)
        return response["Body"].read()

    def delete(self, storage_key: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=storage_key)

    def generate_presigned_url(self, storage_key: str, expires_in: int = 900) -> str:
        return self._public_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": self._bucket,
                "Key": storage_key,
            },
            ExpiresIn=expires_in,
        )