import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.domain.entities.reading_session_book import ReadingSessionBook
from app.domain.repositories.reading_session_book_repository import (
    ReadingSessionBookRepository,
)
from app.infrastructure.db.models.reading_session_book import ReadingSessionBookModel


def _to_entity(model: ReadingSessionBookModel) -> ReadingSessionBook:
    return ReadingSessionBook(
        session_id=model.session_id,
        book_id=model.book_id,
        added_at=model.added_at,
    )


class SQLAlchemyReadingSessionBookRepository(ReadingSessionBookRepository):
    def __init__(self, session: Session):
        self.session = session

    def add(self, link: ReadingSessionBook) -> ReadingSessionBook:
        model = ReadingSessionBookModel(
            session_id=link.session_id,
            book_id=link.book_id,
            added_at=link.added_at,
        )

        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)

        return _to_entity(model)

    def get_book_in_session(
        self,
        session_id: uuid.UUID,
        book_id: uuid.UUID,
    ) -> Optional[ReadingSessionBook]:
        model = (
            self.session.query(ReadingSessionBookModel)
            .filter(
                ReadingSessionBookModel.session_id == session_id,
                ReadingSessionBookModel.book_id == book_id,
            )
            .first()
        )

        return _to_entity(model) if model else None

    def list_by_session(
        self,
        session_id: uuid.UUID,
    ) -> List[ReadingSessionBook]:
        models = (
            self.session.query(ReadingSessionBookModel)
            .filter(
                ReadingSessionBookModel.session_id == session_id,
            )
            .order_by(ReadingSessionBookModel.added_at)
            .all()
        )

        return [_to_entity(model) for model in models]

    def delete_book_in_session(
        self,
        session_id: uuid.UUID,
        book_id: uuid.UUID,
    ) -> None:
        model = (
            self.session.query(ReadingSessionBookModel)
            .filter(
                ReadingSessionBookModel.session_id == session_id,
                ReadingSessionBookModel.book_id == book_id,
            )
            .first()
        )

        if model is None:
            raise ValueError("ReadingSessionBook not found")

        self.session.delete(model)
        self.session.commit()