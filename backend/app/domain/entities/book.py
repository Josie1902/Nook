import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional


class ProcessingStatus(str, Enum):
    # Book has been created, but processing has not started yet.
    PENDING = "pending"
    # A processing run is currently in progress.
    RUNNING = "running"
    # The latest processing run completed successfully.
    COMPLETED = "completed"
    # The latest processing run failed.
    FAILED = "failed"
    # The latest processing run was cancelled.
    CANCELLED = "cancelled"


@dataclass
class Book:
    user_id: str

    # == Book is uploaded as a file ==
    filename: str
    storage_key: str
    # For the MVP, this should be application/pdf.
    mime_type: str
    # Original file size in bytes.
    file_size: int

    # Unique identifier for the book.
    id: uuid.UUID = field(default_factory=uuid.uuid4)

    # SHA-256 hash of the original PDF.
    # Used for duplicate-file detection within the user's library.
    # Nullable during initial book creation.
    file_hash: Optional[str] = None

    # User-confirmed / editable book metadata.
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    publication_year: Optional[int] = None
    cover_url: Optional[str] = None

    # Topics or tags associated with the book.
    tags: List[str] = field(default_factory=list)

    # Current/latest processing state of the book.
    #
    # This represents the overall lifecycle state.
    # The individual pipeline stage is tracked by ProcessingRun.current_stage.
    processing_status: ProcessingStatus = ProcessingStatus.PENDING

    # Points to the latest/current processing run.
    #
    # Nullable while the book is initially being created before
    # a processing run has been established.
    active_processing_run_id: Optional[uuid.UUID] = None

    # Timestamp when the book was created.
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Timestamp when the book was last updated.
    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
