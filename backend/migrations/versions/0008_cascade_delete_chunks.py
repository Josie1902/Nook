"""cascade deletes for processing run artifacts

Revision ID: 0008

Revises: 0007

Create Date: 2026-09-12

"""

from alembic import op


revision = "0008"
down_revision = "0007"

branch_labels = None
depends_on = None


def upgrade():
    # processing_runs -> chunks
    op.drop_constraint(
        "chunks_processing_run_id_fkey",
        "chunks",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "chunks_processing_run_id_fkey",
        "chunks",
        "processing_runs",
        ["processing_run_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # chunks -> chunk_embeddings
    op.drop_constraint(
        "chunk_embeddings_chunk_id_fkey",
        "chunk_embeddings",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "chunk_embeddings_chunk_id_fkey",
        "chunk_embeddings",
        "chunks",
        ["chunk_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade():
    # chunks -> chunk_embeddings
    op.drop_constraint(
        "chunk_embeddings_chunk_id_fkey",
        "chunk_embeddings",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "chunk_embeddings_chunk_id_fkey",
        "chunk_embeddings",
        "chunks",
        ["chunk_id"],
        ["id"],
    )

    # processing_runs -> chunks
    op.drop_constraint(
        "chunks_processing_run_id_fkey",
        "chunks",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "chunks_processing_run_id_fkey",
        "chunks",
        "processing_runs",
        ["processing_run_id"],
        ["id"],
    )