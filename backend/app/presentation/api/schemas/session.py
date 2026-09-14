import uuid
from datetime import datetime
from typing import List

from pydantic import BaseModel


class UpdateSessionRequest(BaseModel):
    topic: str


class AddBookRequest(BaseModel):
    book_id: uuid.UUID


class SessionResponse(BaseModel):
    id: uuid.UUID
    topic: str
    mode: str
    created_at: datetime


class SessionBookResponse(BaseModel):
    book_id: uuid.UUID
    added_at: datetime


class ResearchSelectionBookResponse(BaseModel):
    book_id: uuid.UUID
    title: str
    author: str | None = None
    reason: str
    selected: bool = True


class ResearchSelectionResponse(BaseModel):
    mode: str
    topic: str
    description: str
    books: List[ResearchSelectionBookResponse]


class ResearchRequest(BaseModel):
    input: str


class ResearchRefineRequest(BaseModel):
    topic: str
    description: str
    book_ids: List[uuid.UUID] = []
    comments: str | None = None


class ResearchConfirmRequest(BaseModel):
    topic: str
    description: str
    book_ids: List[uuid.UUID] = []


class SessionDetailResponse(BaseModel):
    id: uuid.UUID
    topic: str
    mode: str
    created_at: datetime
    books: List[SessionBookResponse]