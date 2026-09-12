import uuid
from typing import List

from app.domain.entities.chunk import Chunk
from app.domain.repositories.chunk_repository import ChunkRepository
from app.application.chunking.ports import PdfChunker
from docling_core.types.doc.document import DoclingDocument

from app.application.exceptions.processing_run import ChunkingError


class ChunkBookUseCase:
    def __init__(
        self,
        chunk_repository: ChunkRepository,
        chunking_service: PdfChunker,
    ):
        self.chunk_repository = chunk_repository
        self.chunking_service = chunking_service

    def execute(
        self,
        processing_run_id: uuid.UUID,
        doc: DoclingDocument,
    ) -> List[Chunk]:
        chunks, provenances = self.chunking_service.chunk(
            processing_run_id,
            doc,
        )

        if not chunks:
            raise ChunkingError("No chunks produced from extracted text")

        persisted = self.chunk_repository.add_many(
            chunks,
            provenances,
        )

        actual_count = self.chunk_repository.count_by_processing_run(
            processing_run_id
        )

        if actual_count != len(persisted):
            raise ChunkingError(
                f"Chunk persistence verification failed: "
                f"expected {len(persisted)}, found {actual_count}"
            )

        return persisted
