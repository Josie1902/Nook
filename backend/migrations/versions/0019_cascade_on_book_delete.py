"""cascade on book delete

Revision ID: 0019
Revises: 0018
Create Date: 2026-09-20

"""

from alembic import op

revision = "0019"
down_revision = "0018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint(
        "citations_book_id_fkey",
        "citations",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "citations_book_id_fkey",
        "citations",
        "books",
        ["book_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.drop_constraint(
        "citations_chunk_id_fkey",
        "citations",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "citations_chunk_id_fkey",
        "citations",
        "chunks",
        ["chunk_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "citations_book_id_fkey",
        "citations",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "citations_book_id_fkey",
        "citations",
        "books",
        ["book_id"],
        ["id"],
    )

    op.drop_constraint(
        "citations_chunk_id_fkey",
        "citations",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "citations_chunk_id_fkey",
        "citations",
        "chunks",
        ["chunk_id"],
        ["id"],
    )