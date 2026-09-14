import uuid
from typing import List

from sqlalchemy.orm import Session

from app.domain.entities.citation import Citation
from app.domain.repositories.citation_repository import CitationRepository
from app.infrastructure.db.models.citation import CitationModel


def _to_entity(model: CitationModel) -> Citation:
    return Citation(
        id=model.id,
        message_id=model.message_id,
        book_title=model.book_title,
        book_author=model.author,
        page_start=model.page_start,
        page_end=model.page_end,
        quote=model.quote,
        order=model.order,
        book_id=model.book_id,
        chunk_id=model.chunk_id,
        created_at=model.created_at,
    )


class SQLAlchemyCitationRepository(CitationRepository):
    def __init__(self, session: Session):
        self.session = session

    def add_many(self, citations: List[Citation]) -> List[Citation]:
        models = [
            CitationModel(
                id=citation.id,
                message_id=citation.message_id,
                book_id=citation.book_id,
                chunk_id=citation.chunk_id,
                book_title=citation.book_title,
                author=citation.book_author,
                page_start=citation.page_start,
                page_end=citation.page_end,
                quote=citation.quote,
                order=citation.order,
                created_at=citation.created_at,
            )
            for citation in citations
        ]

        self.session.add_all(models)
        self.session.commit()

        for model in models:
            self.session.refresh(model)

        return [_to_entity(model) for model in models]

    def list_by_message(self, message_id: uuid.UUID) -> List[Citation]:
        models = (
            self.session.query(CitationModel)
            .filter(CitationModel.message_id == message_id)
            .order_by(CitationModel.order)
            .all()
        )

        return [_to_entity(model) for model in models]