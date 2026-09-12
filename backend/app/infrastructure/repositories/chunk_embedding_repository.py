import uuid
from typing import List

from sqlalchemy.orm import Session

from app.domain.entities.chunk_embedding import ChunkEmbedding
from app.domain.repositories.chunk_embedding_repository import ChunkEmbeddingRepository
from app.infrastructure.db.models.chunk_embedding import ChunkEmbeddingModel


def _to_entity(model: ChunkEmbeddingModel) -> ChunkEmbedding:
    return ChunkEmbedding(
        id=model.id,
        chunk_id=model.chunk_id,
        provider=model.provider,
        model=model.model,
        embedding=list(model.embedding),
    )


class SQLAlchemyChunkEmbeddingRepository(ChunkEmbeddingRepository):
    def __init__(self, session: Session):
        self.session = session

    def add_many(self, embeddings: List[ChunkEmbedding]) -> List[ChunkEmbedding]:
        models = [
            ChunkEmbeddingModel(
                id=e.id,
                chunk_id=e.chunk_id,
                provider=e.provider,
                model=e.model,
                embedding=e.embedding,
            )
            for e in embeddings
        ]
        self.session.add_all(models)
        self.session.commit()
        for m in models:
            self.session.refresh(m)
        return [_to_entity(m) for m in models]

    def count_by_chunk_ids(self, chunk_ids: List[uuid.UUID]) -> int:
        if not chunk_ids:
            return 0
        return (
            self.session.query(ChunkEmbeddingModel)
            .filter(ChunkEmbeddingModel.chunk_id.in_(chunk_ids))
            .count()
        )