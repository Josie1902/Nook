"""make file_hash non-null

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-06
"""

from alembic import op
import sqlalchemy as sa


revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "books",
        "file_hash",
        existing_type=sa.String(length=64),
        nullable=False,
    )


def downgrade():
    op.alter_column(
        "books",
        "file_hash",
        existing_type=sa.String(length=64),
        nullable=True,
    )