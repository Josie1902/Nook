from app.application.exceptions.base import ApplicationError


class DuplicateBookError(ApplicationError):
    """Raised when a book with the same file hash already exists for the user."""

class BookNotFoundError(ApplicationError):
    """Raised when a book is not found in the repository."""

class BookProcessingError(ApplicationError):
    """Raised when there is an error during the processing of a book."""