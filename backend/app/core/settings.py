import uuid

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    S3_ENDPOINT_URL: str
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET: str
    S3_REGION: str = "us-east-1"

    MAX_PDF_SIZE_MB: int = 20

    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    PROCESS_CONFIG_VERSION: str

    @property
    def max_pdf_size_bytes(self) -> int:
        return self.MAX_PDF_SIZE_MB * 1024 * 1024

settings = Settings()