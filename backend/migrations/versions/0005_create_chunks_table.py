"""create chunks table

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-8

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "chunks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "processing_run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("processing_runs.id"),
            nullable=False,
        ),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("page_start", sa.Integer(), nullable=False),
        sa.Column("page_end", sa.Integer(), nullable=False),
        sa.Column("chapter_title", sa.String(), nullable=True),
        sa.Column("content", sa.String(), nullable=False),
    )
    op.create_index("ix_chunks_processing_run_id", "chunks", ["processing_run_id"])


def downgrade():
    op.drop_index("ix_chunks_processing_run_id", table_name="chunks")
    op.drop_table("chunks")