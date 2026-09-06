"""create books table

Revision ID: 0001
Revises:
Create Date: 2026-08-16
"""

# Note: the Alembic migration should represent the same database schema as
# what has been defined under infrastrucure/db/models/book.py.

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "books",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.Text(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("filename", sa.String(), nullable=False),
        sa.Column("storage_key", sa.String(), nullable=False),
        sa.Column("mime_type", sa.String(), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("file_hash", sa.String(64), nullable=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("author", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("isbn", sa.String(), nullable=True),
        sa.Column("publication_year", sa.Integer(), nullable=True),
        sa.Column("cover_url", sa.String(), nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"), # postgresql represents an empty array as {}
        sa.Column("processing_status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("active_processing_run_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "isbn", name="books_user_isbn_key"),
        sa.UniqueConstraint("user_id", "file_hash", name="books_user_file_hash_key"),
    )
    op.create_index("ix_books_user_id", "books", ["user_id"]) # use the index to quickly locate the relevant row
    # DONE: Composite FK added after processing_runs table is created:
    # op.create_foreign_key(
    #     "books_active_processing_run_fkey",
    #     "books",
    #     "processing_runs",
    #     ["active_processing_run_id", "id"],
    #     ["id", "book_id"],
    #     ondelete="SET NULL",
    # ),


def downgrade():
    op.drop_index("ix_books_user_id", table_name="books")
    op.drop_table("books")