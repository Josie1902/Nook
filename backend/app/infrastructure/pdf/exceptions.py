class PDFError(Exception):
    """Base exception for PDF processing errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)

class InvalidPDFError(PDFError):
    """Raised when an uploaded file is not a valid PDF."""


class FileTooLargeError(PDFError):
    """Raised when an uploaded file exceeds the maximum allowed size."""


class UnsupportedPDFError(PDFError):
    """Raised when a valid PDF is not supported by the application."""