from fastapi import Request
from fastapi.responses import JSONResponse

from app.application.exceptions.base import ApplicationError
from app.infrastructure.pdf.exceptions import PDFError


APPLICATION_STATUS_CODES = {
    "BookAlreadyExistsError": 409,
    "BookNotFoundError": 404,
}


PDF_STATUS_CODES = {
    "InvalidPDFError": 400,
    "UnsupportedPDFError": 400,
    "FileTooLargeError": 413,
}


async def application_error_handler(
    request: Request, # request is not used but is included for consistency with FastAPI' params
    exc: Exception,
) -> JSONResponse:
    status_code = APPLICATION_STATUS_CODES.get(
        type(exc).__name__,
        400,
    )

    return JSONResponse(
        status_code=status_code,
        content={
            "code": type(exc).__name__,
            "message": str(exc),
        },
    )


async def pdf_error_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    status_code = PDF_STATUS_CODES.get(
        type(exc).__name__,
        400,
    )

    return JSONResponse(
        status_code=status_code,
        content={
            "code": type(exc).__name__,
            "message": str(exc),
        },
    )


async def unexpected_error_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    # logger.exception("Unhandled exception", exc_info=exc)

    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred.",
        },
    )