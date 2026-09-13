from typing import List

from app.application.embedding.ports import EmbeddingProvider
from app.domain.entities.chunk import Chunk
from app.domain.entities.chunk_embedding import ChunkEmbedding
from app.domain.repositories.chunk_embedding_repository import ChunkEmbeddingRepository

BATCH_SIZE = 100


class EmbedBookChunksUseCase:
    def __init__(
        self,
        chunk_embedding_repository: ChunkEmbeddingRepository,
        embedding_provider: EmbeddingProvider,
    ):
        self.chunk_embedding_repository = chunk_embedding_repository
        self.embedding_provider = embedding_provider

    def execute(self, chunks: List[Chunk]) -> None:
        if not chunks:
            raise ValueError("No chunks to embed")

        for i in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[i : i + BATCH_SIZE]
            vectors = self.embedding_provider.embed([c.content for c in batch])

            embeddings = [
                ChunkEmbedding(
                    chunk_id=chunk.id,
                    provider=self.embedding_provider.provider_name,
                    model=self.embedding_provider.model,
                    embedding=vector,
                )
                for chunk, vector in zip(batch, vectors)
            ]
            self.chunk_embedding_repository.add_many(embeddings)

        chunk_ids = [c.id for c in chunks]
        actual_count = self.chunk_embedding_repository.count_by_chunk_ids(chunk_ids)
        if actual_count != len(chunk_ids):
            raise ValueError(
                f"Chunk embedding verification failed: expected {len(chunk_ids)}, found {actual_count}"
            )