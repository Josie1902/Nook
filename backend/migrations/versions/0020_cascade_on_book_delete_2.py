"""make citation foreign keys nullable

Revision ID: 0020
Revises: 0019
Create Date: 2026-09-20
"""

from alembic import op
import sqlalchemy as sa


revision = "0020"
down_revision = "0019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "citations",
        "book_id",
        existing_type=sa.UUID(),
        nullable=True,
    )

    op.alter_column(
        "citations",
        "chunk_id",
        existing_type=sa.UUID(),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "citations",
        "chunk_id",
        existing_type=sa.UUID(),
        nullable=False,
    )

    op.alter_column(
        "citations",
        "book_id",
        existing_type=sa.UUID(),
        nullable=False,
    )