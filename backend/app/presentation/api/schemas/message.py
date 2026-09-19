from datetime import datetime
import uuid
from pydantic import BaseModel


class AskQuestionRequest(BaseModel):
    content: str


class AnswerSegmentResponse(BaseModel):
    text: str
    citation_ids: list[uuid.UUID]


class BoundingBoxResponse(BaseModel):
    left: float
    top: float
    right: float
    bottom: float


class CitationLocationResponse(BaseModel):
    page: int
    bounding_boxes: list[BoundingBoxResponse]


class CitationResponse(BaseModel):
    id: uuid.UUID
    book_id: uuid.UUID
    book_title: str
    book_author: str
    quote: str
    page_start: int
    page_end: int
    order: int
    locations: list[CitationLocationResponse]


class AskQuestionResponse(BaseModel):
    message_id: uuid.UUID
    assistant_message_id: uuid.UUID
    segments: list[AnswerSegmentResponse]
    citations: list[CitationResponse]

class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: dict
    error_message: str | None
    created_at: datetime