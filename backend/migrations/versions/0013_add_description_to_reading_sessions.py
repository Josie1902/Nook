"""add description to reading_sessions

Revision ID: 0013
Revises: 0012
Create Date: 2026-09-14
"""

from alembic import op
import sqlalchemy as sa


revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "reading_sessions",
        sa.Column("description", sa.Text(), nullable=True),
    )


def downgrade():
    op.drop_column("reading_sessions", "description")