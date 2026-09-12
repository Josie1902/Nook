import uuid
from typing import List

from sqlalchemy.orm import Session

from app.domain.entities.chunk import Chunk, ChunkProvenance
from app.domain.repositories.chunk_repository import ChunkRepository
from app.infrastructure.db.models.chunk import ChunkModel, ChunkProvenanceModel


def _to_entity(model: ChunkModel) -> Chunk:
    return Chunk(
        id=model.id,
        processing_run_id=model.processing_run_id,
        chunk_index=model.chunk_index,
        page_start=model.page_start,
        page_end=model.page_end,
        chapter_title=model.chapter_title,
        content=model.content,
    )


class SQLAlchemyChunkRepository(ChunkRepository):
    def __init__(self, session: Session):
        self.session = session

    def add_many(
        self,
        chunks: list[Chunk],
        provenance: list[ChunkProvenance],
    ) -> list[Chunk]:
    
        chunk_models = [
            ChunkModel(
                id=chunk.id,
                processing_run_id=chunk.processing_run_id,
                chunk_index=chunk.chunk_index,
                page_start=chunk.page_start,
                page_end=chunk.page_end,
                chapter_title=chunk.chapter_title,
                content=chunk.content,
            )
            for chunk in chunks
        ]
    
        provenance_models = [
            ChunkProvenanceModel(
                chunk_id=p.chunk_id,
                page_number=p.page_number,
                bounding_boxes=[
                    {
                        "left": box.left,
                        "top": box.top,
                        "right": box.right,
                        "bottom": box.bottom,
                    }
                    for box in p.bounding_boxes
                ],
            )
            for p in provenance
        ]
    
        self.session.add_all(chunk_models)
        self.session.add_all(provenance_models)
        self.session.commit()
    
        return [_to_entity(model) for model in chunk_models]

    def count_by_processing_run(self, processing_run_id: uuid.UUID) -> int:
        return (
            self.session.query(ChunkModel)
            .filter(ChunkModel.processing_run_id == processing_run_id)
            .count()
        )

    def list_by_processing_run(self, processing_run_id: uuid.UUID) -> List[Chunk]:
        models = (
            self.session.query(ChunkModel)
            .filter(ChunkModel.processing_run_id == processing_run_id)
            .order_by(ChunkModel.chunk_index)
            .all()
        )
        return [_to_entity(m) for m in models]