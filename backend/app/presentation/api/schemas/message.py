from typing import Any
import uuid
from datetime import datetime

from pydantic import BaseModel


class AskQuestionRequest(BaseModel):
    content: str


class BoundingBoxResponse(BaseModel):
    left: float
    top: float
    right: float
    bottom: float


class ChunkProvenanceResponse(BaseModel):
    chunk_id: uuid.UUID
    page_number: int
    bounding_boxes: list[BoundingBoxResponse]


class RetrievalMatchResponse(BaseModel):
    chunk_id: uuid.UUID
    book_id: uuid.UUID
    content: str
    page_start: int
    page_end: int
    score: float
    rank: int
    provenance: list[ChunkProvenanceResponse]


class CitationResponse(BaseModel):
    id: uuid.UUID
    book_title: str
    book_author: str
    page_start: int
    page_end: int
    quote: str


class AskQuestionResponse(BaseModel):
    message_id: uuid.UUID
    assistant_message_id: uuid.UUID
    answer: dict[str, Any]
    retrieval_id: uuid.UUID
    query: str
    created_at: datetime
    results: list[RetrievalMatchResponse]
    citations: list[CitationResponse]