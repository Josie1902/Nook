from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.infrastructure.db.session import SessionLocal

from app.core.settings import settings

from app.domain.entities.user import User
from app.infrastructure.auth.better_auth_session_repository import BetterAuthSessionRepository

# S3 storage depedency
from app.infrastructure.repositories.book_repository import SQLAlchemyBookRepository
from app.infrastructure.repositories.processing_run_repository import SQLAlchemyProcessingRunRepository
from app.infrastructure.storage.s3_pdf_storage import S3PdfStorage

# Celery task publisher dependency
from app.infrastructure.tasks.celery_task_publisher import CeleryTaskPublisher
from app.worker.celery_app import celery_app
from app.infrastructure.repositories.reading_session_book_repository import SQLAlchemyReadingSessionBookRepository
from app.infrastructure.repositories.reading_session_repository import SQLAlchemyReadingSessionRepository
from app.infrastructure.repositories.chunk_search_repository import SQLAlchemyChunkSearchRepository
from app.infrastructure.repositories.message_repository import SQLAlchemyMessageRepository
from app.infrastructure.repositories.retrieval_repository import SQLAlchemyRetrievalRepository

# RAG
from app.infrastructure.llm.factory import get_llm_client
from app.infrastructure.llm.stages.answer_generator import LLMAnswerGenerator
from app.infrastructure.llm.stages.book_recommender import LLMBookRecommender
from app.infrastructure.llm.stages.research_generator import LLMResearchGenerator
from app.infrastructure.embedding.factory import create_embedding_provider
from app.infrastructure.repositories.citation_repository import SQLAlchemyCitationRepository


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_session_repository(
    db: Session = Depends(get_db),
) -> BetterAuthSessionRepository:
    return BetterAuthSessionRepository(db)

def get_current_user(
    request: Request,
    session_repository: BetterAuthSessionRepository = Depends(
        get_session_repository
    ),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    session_token = request.cookies.get("better-auth.session_token")

    if not session_token:
        raise credentials_exception

    token_id = session_token.split(".", 1)[0]

    user = session_repository.get_user_by_session_token(
        token_id
    )

    if user is None:
        raise credentials_exception

    return user


def get_book_repository(db: Session = Depends(get_db)) -> SQLAlchemyBookRepository:
    return SQLAlchemyBookRepository(db)

def get_processing_run_repository(
    db: Session = Depends(get_db),
) -> SQLAlchemyProcessingRunRepository:
    return SQLAlchemyProcessingRunRepository(db)

def get_pdf_storage() -> S3PdfStorage:
    return S3PdfStorage(
        endpoint_url=settings.S3_ENDPOINT_URL,
        public_endpoint_url=settings.S3_PUBLIC_ENDPOINT_URL,
        access_key=settings.S3_ACCESS_KEY,
        secret_key=settings.S3_SECRET_KEY,
        bucket=settings.S3_BUCKET,
        region=settings.S3_REGION,
    )

def get_task_publisher() -> CeleryTaskPublisher:
    return CeleryTaskPublisher(celery_app)

def get_reading_session_repository(db: Session = Depends(get_db)) -> SQLAlchemyReadingSessionRepository:
    return SQLAlchemyReadingSessionRepository(db)


def get_reading_session_book_repository(
    db: Session = Depends(get_db),
) -> SQLAlchemyReadingSessionBookRepository:
    return SQLAlchemyReadingSessionBookRepository(db)


def get_message_repository(db: Session = Depends(get_db)) -> SQLAlchemyMessageRepository:
    return SQLAlchemyMessageRepository(db)


def get_retrieval_repository(db: Session = Depends(get_db)) -> SQLAlchemyRetrievalRepository:
    return SQLAlchemyRetrievalRepository(db)


def get_chunk_search_repository(db: Session = Depends(get_db)) -> SQLAlchemyChunkSearchRepository:
    return SQLAlchemyChunkSearchRepository(db)

def get_embedding_provider():
    return create_embedding_provider()

def get_answer_generator():
    return LLMAnswerGenerator(
        get_llm_client(),
        settings.LLM.rag,
    )


def get_book_recommender():
    return LLMBookRecommender(
        get_llm_client(),
        settings.LLM.rag,
    )


def get_research_generator():
    return LLMResearchGenerator(
        get_llm_client(),
        settings.LLM.rag,
    )


def get_citation_repository(db: Session = Depends(get_db)) -> SQLAlchemyCitationRepository:
    return SQLAlchemyCitationRepository(db)