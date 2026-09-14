import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.retrieval.ports import (
    ChunkSearchMatch,
    ChunkSearchRepository,
)
from app.domain.entities.chunk import BoundingBox, ChunkProvenance
from app.infrastructure.db.models.book import BookModel
from app.infrastructure.db.models.chunk import (
    ChunkModel,
    ChunkProvenanceModel,
)
from app.infrastructure.db.models.chunk_embedding import ChunkEmbeddingModel
from app.infrastructure.db.models.processing_run import ProcessingRunModel


class SQLAlchemyChunkSearchRepository(ChunkSearchRepository):
    def __init__(self, session: Session):
        self.session = session

    def search(
        self,
        book_ids: list[uuid.UUID],
        query_embedding: list[float],
        top_k: int,
    ) -> list[ChunkSearchMatch]:
        if not book_ids:
            return []

        distance = ChunkEmbeddingModel.embedding.cosine_distance(
            query_embedding
        )

        stmt = (
            select(
                ChunkModel.id,
                BookModel.id,
                BookModel.title,
                ChunkModel.content,
                ChunkModel.page_start,
                ChunkModel.page_end,
                distance.label("distance"),
            )
            .join(
                ChunkEmbeddingModel,
                ChunkEmbeddingModel.chunk_id == ChunkModel.id,
            )
            .join(
                ProcessingRunModel,
                ProcessingRunModel.id == ChunkModel.processing_run_id,
            )
            .join(
                BookModel,
                BookModel.active_processing_run_id == ProcessingRunModel.id,
            )
            .where(BookModel.id.in_(book_ids))
            .order_by(distance)
            .limit(top_k)
        )

        rows = self.session.execute(stmt).all()

        if not rows:
            return []

        chunk_ids = [row[0] for row in rows]

        provenance_stmt = (
            select(
                ChunkProvenanceModel.chunk_id,
                ChunkProvenanceModel.page_number,
                ChunkProvenanceModel.bounding_boxes,
            )
            .where(ChunkProvenanceModel.chunk_id.in_(chunk_ids))
            .order_by(
                ChunkProvenanceModel.chunk_id,
                ChunkProvenanceModel.page_number,
            )
        )

        provenance_rows = self.session.execute(provenance_stmt).all()

        provenance_by_chunk: dict[
            uuid.UUID, list[ChunkProvenance]
        ] = {}

        for row in provenance_rows:
            chunk_id = row[0]

            provenance_by_chunk.setdefault(chunk_id, []).append(
                ChunkProvenance(
                    chunk_id=chunk_id,
                    page_number=row[1],
                    bounding_boxes=tuple(
                        BoundingBox(
                            left=box["left"],
                            top=box["top"],
                            right=box["right"],
                            bottom=box["bottom"],
                        )
                        for box in row[2]
                    ),
                )
            )

        return [
            ChunkSearchMatch(
                chunk_id=row[0],
                book_id=row[1],
                book_title=row[2],
                content=row[3],
                page_start=row[4],
                page_end=row[5],
                score=1 - float(row[6]),
                provenance=tuple(provenance_by_chunk.get(row[0], [])),
            )
            for row in rows
        ]