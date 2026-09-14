import uuid
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.retrieval.ports import (
    ChunkSearchMatch,
    ChunkSearchRepository,
)
from app.domain.entities.chunk import BoundingBox, ChunkProvenance
from app.infrastructure.db.models.book import BookModel
from app.infrastructure.db.models.chunk import ChunkModel, ChunkProvenanceModel
from app.infrastructure.db.models.chunk_embedding import ChunkEmbeddingModel
from app.infrastructure.db.models.processing_run import ProcessingRunModel


class SQLAlchemyChunkSearchRepository(ChunkSearchRepository):
    def __init__(self, session: Session):
        self.session = session

    def search(
        self,
        book_ids: List[uuid.UUID],
        query_embedding: List[float],
        top_k: int,
    ) -> List[ChunkSearchMatch]:
        if not book_ids:
            return []

        distance = ChunkEmbeddingModel.embedding.cosine_distance(
            query_embedding
        )

        stmt = (
            select(
                ChunkModel.id.label("chunk_id"),
                BookModel.id.label("book_id"),
                BookModel.title.label("book_title"),
                BookModel.author.label("book_author"),
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

        chunk_ids = [row.chunk_id for row in rows]

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

        provenance_by_chunk: dict[uuid.UUID, list[ChunkProvenance]] = {}

        for row in provenance_rows:
            bounding_boxes = tuple(
                BoundingBox(
                    left=box["left"],
                    top=box["top"],
                    right=box["right"],
                    bottom=box["bottom"],
                )
                for box in row.bounding_boxes
            )

            provenance_by_chunk.setdefault(row.chunk_id, []).append(
                ChunkProvenance(
                    chunk_id=row.chunk_id,
                    page_number=row.page_number,
                    bounding_boxes=bounding_boxes,
                )
            )

        return [
            ChunkSearchMatch(
                chunk_id=row.chunk_id,
                book_id=row.book_id,
                book_title=row.book_title,
                book_author=row.book_author,
                content=row.content,
                page_start=row.page_start,
                page_end=row.page_end,
                score=1 - float(row.distance),
                provenance=tuple(
                    provenance_by_chunk.get(row.chunk_id, [])
                ),
            )
            for row in rows
        ]