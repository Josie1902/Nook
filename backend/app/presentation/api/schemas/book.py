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