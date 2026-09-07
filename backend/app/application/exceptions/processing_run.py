from typing import Any
from backend.app.domain.entities.processing_run import ProcessingRunStage


class ProcessingError(Exception):
    def __init__(
        self,
        *,
        error_code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.error_code = error_code
        self.details = details or {}

class MetadataExtractionError(ProcessingError):
    pass


class TextExtractionError(ProcessingError):
    pass


class ChunkingError(ProcessingError):
    pass


class EmbeddingError(ProcessingError):
    pass