import uuid
from datetime import datetime, timezone

from sqlalchemy import ARRAY, DateTime, ForeignKey, Integer, String, ForeignKeyConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base


class BookModel(Base):
    __tablename__ = "books"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[str] = mapped_column(
        String,
        ForeignKey('public.user.id'), # Note: the table name follows naming convention set by BetterAuth
        nullable=False,
        index=True,
    )

    # Original uploaded PDF information.
    filename: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    storage_key: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    file_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    # User-confirmed / editable metadata.
    title: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )
    author: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )
    description: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )
    isbn: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )
    publication_year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    cover_url: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
        default=list,
    )

    # Overall/latest processing state of the book.
    #
    # Pipeline stages such as "metadata", "chunking", and "embedding"
    # belong to ProcessingRun.current_stage.
    processing_status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="pending",
    )

    # Points to the latest/current processing run.
    #
    # The database uses a composite foreign key:
    # (active_processing_run_id, id)
    #     -> processing_runs(id, book_id)
    #
    # This guarantees that the active processing run belongs
    # to this same book.
    active_processing_run_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        # TODO: ProcessingRun temporarily disabled.
        # Composite foreign key to ensure that the active processing run belongs to this book.
        ForeignKeyConstraint(
            ["active_processing_run_id", "id"],
            ["processing_runs.id", "processing_runs.book_id"],
            ondelete="SET NULL",
        ),
        # ISBN must be unique within a user's library. 
        UniqueConstraint( 
            "user_id", 
            "isbn", 
            name="books_user_isbn_key",
        ),
        # File hash must be unique within a user's library.
        # Prevents the same PDF from being uploaded twice by the same user.
        UniqueConstraint(
            "user_id",
            "file_hash",
            name="books_user_file_hash_key", 
        ),
    )
