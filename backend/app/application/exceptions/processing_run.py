from typing import Any


class ProcessingError(Exception):
    def __init__(
        self,
        message: str,
        *,
        error_code: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        # Initialise the base Exception with the message.
        #
        # This matters for normal Python exception behaviour and, more
        # importantly here, gives the exception a reconstructible
        # Exception.args value for Celery serialization.
        super().__init__(message)

        self.message = message
        self.error_code = error_code
        self.details = details or {}

    def __reduce__(self):
        # Tell pickle how to reconstruct the exception.
        #
        # Celery serializes exceptions when a task fails. By default,
        # pickle may try to reconstruct this exception using its
        # constructor arguments. Our constructor has keyword-only
        # arguments, so explicitly returning (type(self), (message,))
        # guarantees that reconstruction starts with the required
        # positional message argument.
        #
        # The third value restores the remaining attributes through
        # self.__dict__.
        return type(self), (self.message,), self.__dict__


class MetadataExtractionError(ProcessingError):
    pass


class TextExtractionError(ProcessingError):
    pass


class ChunkingError(ProcessingError):
    pass


class EmbeddingError(ProcessingError):
    pass