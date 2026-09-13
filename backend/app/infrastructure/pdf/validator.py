from io import BytesIO

from pypdf import PdfReader

from app.core.settings import settings

from app.infrastructure.pdf.exceptions import (
    FileTooLargeError,
    InvalidPDFError,
    UnsupportedPDFError,
)


PDF_MAGIC_BYTES = b"%PDF-"


def validate_pdf(content: bytes) -> None:
    """
    Validate that the uploaded content is a supported PDF.

    Checks:
    1. File is not empty
    2. File size is within configured limit
    3. File has a valid PDF signature
    4. PDF can be structurally parsed
    5. PDF contains at least one page
    6. PDF contains extractable text
    """

    if not content:
        raise InvalidPDFError("File is empty")

    # 1. File size
    if len(content) > settings.max_pdf_size_bytes:
        raise FileTooLargeError(
            f"File exceeds the maximum size of "
            f"{settings.MAX_PDF_SIZE_MB} MB"
        )

    # 2. PDF signature
    if not content.startswith(PDF_MAGIC_BYTES):
        raise InvalidPDFError("File is not a PDF")

    # 3. Structural validation
    try:
        reader = PdfReader(BytesIO(content))

        if len(reader.pages) == 0:
            raise InvalidPDFError("PDF contains no pages")

        # 4. MVP only supports text-based PDFs
        has_text = any(
            page.extract_text()
            for page in reader.pages
        )

        if not has_text:
            raise UnsupportedPDFError(
                "Scanned PDFs are not supported"
            )

    except (InvalidPDFError, UnsupportedPDFError):
        raise

    except Exception as exc:
        raise InvalidPDFError(
            "Invalid or corrupted PDF"
        ) from exc