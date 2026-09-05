from app.application.exceptions.base import ApplicationError


class DuplicateBookError(ApplicationError):
    """Raised when a book with the same file hash already exists for the user."""