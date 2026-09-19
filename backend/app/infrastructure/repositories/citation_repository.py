import uuid
from typing import List

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.domain.entities.citation import Citation
from app.domain.repositories.citation_repository import CitationRepository
from app.infrastructure.db.models.citation import CitationModel
from app.application.use_cases.dtos import CitationBoundingBoxDTO, CitationDTO, CitationLocationDTO
from app.infrastructure.db.models.chunk import ChunkProvenanceModel

def _to_entity(model: CitationModel) -> Citation:
    return Citation(
        id=model.id,
        message_id=model.message_id,
        book_title=model.book_title,
        book_author=model.book_author,
        page_start=model.page_start,
        page_end=model.page_end,
        quote=model.quote,
        order=model.order,
        book_id=model.book_id,
        chunk_id=model.chunk_id,
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
                book_author=citation.book_author,
                page_start=citation.page_start,
                page_end=citation.page_end,
                quote=citation.quote,
                order=citation.order,
            )
            for citation in citations
        ]

        self.session.add_all(models)
        self.session.commit()

        for model in models:
            self.session.refresh(model)

        return [_to_entity(model) for model in models]

    def list_by_message(
        self,
        message_id: uuid.UUID,
    ) -> list[CitationDTO]:
        rows = (
            self.session.query(
                CitationModel,
                func.json_agg(
                    func.json_build_object(
                        "page",
                        ChunkProvenanceModel.page_number,
                        "bounding_boxes",
                        ChunkProvenanceModel.bounding_boxes,
                    )
                )
                .filter(
                    ChunkProvenanceModel.chunk_id.is_not(None),
                )
                .label("locations"),
            )
            .outerjoin(
                ChunkProvenanceModel,
                ChunkProvenanceModel.chunk_id == CitationModel.chunk_id,
            )
            .filter(
                CitationModel.message_id == message_id,
            )
            .group_by(
                CitationModel.id,
            )
            .order_by(
                CitationModel.order,
            )
            .all()
        )
    
        return [
            CitationDTO(
                id=citation.id,
                book_id=citation.book_id,
                book_title=citation.book_title,
                book_author=citation.book_author,
                quote=citation.quote,
                page_start=citation.page_start,
                page_end=citation.page_end,
                order=citation.order,
                locations=[
                    CitationLocationDTO(
                        page=location["page"],
                        bounding_boxes=[
                            CitationBoundingBoxDTO(
                                left=box["left"],
                                top=box["top"],
                                right=box["right"],
                                bottom=box["bottom"],
                            )
                            for box in location["bounding_boxes"]
                        ],
                    )
                    for location in (locations or [])
                ],
            )
            for citation, locations in rows
        ]