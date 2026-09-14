from typing import Any
import uuid
from datetime import datetime

from pydantic import BaseModel


class AskQuestionRequest(BaseModel):
    content: str


class RetrievalMatchResponse(BaseModel):
    chunk_id: uuid.UUID
    book_id: uuid.UUID

    content: str

    page_start: int
    page_end: int

    score: float
    rank: int
    provenance: dict[str, Any] | None = None


class AskQuestionResponse(BaseModel):
    message_id: uuid.UUID
    retrieval_id: uuid.UUID
    query: str
    created_at: datetime
    results: list[RetrievalMatchResponse]