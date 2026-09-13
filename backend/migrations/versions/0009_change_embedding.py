"""change embedding dimensions to 768

Revision ID: 0009
Revises: 0008
Create Date: 2026-09-12
"""

from alembic import op
from pgvector.sqlalchemy import Vector


revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None

EMBEDDING_DIMENSIONS = 384


def upgrade():
    op.alter_column(
        "chunk_embeddings",
        "embedding",
        type_=Vector(EMBEDDING_DIMENSIONS),
        existing_nullable=False,
    )


def downgrade():
    op.alter_column(
        "chunk_embeddings",
        "embedding",
        type_=Vector(1536),
        existing_nullable=False,
    )