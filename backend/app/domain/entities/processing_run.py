import uuid

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional


class ProcessingRunStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    VALIDATION_REQUIRED = "validation_required"


class ProcessingRunStage(str, Enum):
    METADATA = "metadata"
    CHUNKING = "chunking"
    EMBEDDING = "embedding"
    FINALIZING = "finalizing"


@dataclass
class ProcessingRun:
    book_id: uuid.UUID
    config_version: str

    id: uuid.UUID = field(default_factory=uuid.uuid4)

    status: ProcessingRunStatus = ProcessingRunStatus.PENDING

    current_stage: Optional[ProcessingRunStage] = None

    # Processing progress and diagnostic counters for this run,
    # e.g. pages/chunks/embeddings processed and total counts.
    metrics: dict[str, Any] = field(default_factory=dict)

    error_code: Optional[str] = None
    error_message: Optional[str] = None
    error_details: Optional[dict[str, Any]] = None

    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
