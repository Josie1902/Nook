"""rename citation author to book_author

Revision ID: 0018
Revises: 0017
Create Date: 2026-09-18

"""

from alembic import op

revision = "0018"
down_revision = "0017"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.alter_column(
        "citations",
        "author",
        new_column_name="book_author",
    )


def downgrade() -> None:
    op.alter_column(
        "citations",
        "book_author",
        new_column_name="author",
    )