from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.presentation.api.health import router as health_router
from app.presentation.api.books import router as books_router

from app.application.exceptions.base import ApplicationError
from app.infrastructure.pdf.exceptions import PDFError
from app.presentation.api.exception_handlers import (
    application_error_handler,
    pdf_error_handler,
    unexpected_error_handler,
)

app = FastAPI()

# ─────────────────────────────
# Cors Middleware
# ─────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────
# Add Routers
# ─────────────────────────────
app.include_router(health_router)
app.include_router(books_router)

# ─────────────────────────────
# Application Error Handlers
# ─────────────────────────────
app.add_exception_handler(
    ApplicationError,
    application_error_handler,
)

# ─────────────────────────────
# Infrastructure Handlers
# ─────────────────────────────
app.add_exception_handler(
    PDFError,
    pdf_error_handler,
)

# ─────────────────────────────
# Unexpected Error Handler
# ─────────────────────────────
app.add_exception_handler(
    Exception,
    unexpected_error_handler,
)