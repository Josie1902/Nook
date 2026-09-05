from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.infrastructure.db.session import SessionLocal

from app.core.settings import settings

# S3 storage depedency
from app.infrastructure.repositories.book_repository import SQLAlchemyBookRepository
from app.infrastructure.storage.s3_pdf_storage import S3PdfStorage

# Celery task publisher dependency
from app.infrastructure.tasks.celery_task_publisher import CeleryTaskPublisher
from app.worker.celery_app import celery_app

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

def get_book_repository(db: Session = Depends(get_db)) -> SQLAlchemyBookRepository:
    return SQLAlchemyBookRepository(db)

def get_pdf_storage() -> S3PdfStorage:
    return S3PdfStorage(
        endpoint_url=settings.S3_ENDPOINT_URL,
        access_key=settings.S3_ACCESS_KEY,
        secret_key=settings.S3_SECRET_KEY,
        bucket=settings.S3_BUCKET,
        region=settings.S3_REGION,
    )

def get_task_publisher() -> CeleryTaskPublisher:
    return CeleryTaskPublisher(celery_app)