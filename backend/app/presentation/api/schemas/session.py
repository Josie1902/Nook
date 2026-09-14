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


class SessionDetailResponse(BaseModel):
    id: uuid.UUID
    topic: str
    mode: str
    created_at: datetime
    books: List[SessionBookResponse]