import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.domain.entities.book import Book, ProcessingStatus
from app.domain.repositories.book_repository import BookRepository
from app.infrastructure.db.models.book import BookModel


def _to_entity(model: BookModel) -> Book:
    return Book(
        id=model.id,
        user_id=model.user_id,
        filename=model.filename,
        storage_key=model.storage_key,
        mime_type=model.mime_type,
        file_size=model.file_size,
        file_hash=model.file_hash,
        title=model.title,
        author=model.author,
        description=model.description,
        isbn=model.isbn,
        publication_year=model.publication_year,
        cover_url=model.cover_url,
        tags=list(model.tags or []),
        processing_status=ProcessingStatus(model.processing_status),
        active_processing_run_id=model.active_processing_run_id,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _apply(model: BookModel, book: Book) -> None:
    model.user_id = book.user_id
    model.filename = book.filename
    model.storage_key = book.storage_key
    model.mime_type = book.mime_type
    model.file_size = book.file_size
    model.file_hash = book.file_hash
    model.title = book.title
    model.author = book.author
    model.description = book.description
    model.isbn = book.isbn
    model.publication_year = book.publication_year
    model.cover_url = book.cover_url
    model.tags = list(book.tags)
    model.processing_status = book.processing_status.value
    model.active_processing_run_id = book.active_processing_run_id


class SQLAlchemyBookRepository(BookRepository):
    def __init__(self, session: Session):
        self.session = session

    def add(self, book: Book) -> Book:
        model = BookModel(
            id=book.id,
            created_at=book.created_at,
            updated_at=book.updated_at,
        )

        _apply(model, book)

        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)

        return _to_entity(model)

    def get_by_id(self, book_id: uuid.UUID) -> Optional[Book]:
        model = self.session.get(BookModel, book_id)

        if model is None:
            return None

        return _to_entity(model)

    def list_by_user(self, user_id: uuid.UUID) -> List[Book]:
        models = (
            self.session
            .query(BookModel)
            .filter(BookModel.user_id == user_id)
            .all()
        )

        return [_to_entity(model) for model in models]

    def update(self, book: Book) -> Book:
        model = self.session.get(BookModel, book.id)

        if model is None:
            raise ValueError("Book not found")

        _apply(model, book)

        self.session.commit()
        self.session.refresh(model)

        return _to_entity(model)