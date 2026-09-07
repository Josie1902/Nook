import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class BookResponse(BaseModel):
    id: uuid.UUID
    filename: str
    mime_type: str
    file_size: int
    title: Optional[str]
    author: Optional[str]
    description: Optional[str]
    isbn: Optional[str]
    publication_year: Optional[int]
    cover_url: Optional[str]
    tags: List[str]
    processing_status: str
    created_at: datetime
    updated_at: datetime


class BookMetadataUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    publication_year: Optional[int] = None
    cover_url: Optional[str] = None
    tags: Optional[List[str]] = None


class BookMetadataResponse(BookMetadataUpdate):
    id: uuid.UUID
    processing_status: str
    processing_run_status: str