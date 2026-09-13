"""create chunk provenance table
Revision ID: 0006
Revises: 0005
Create Date: 2026-09-08
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "chunk_provenance",
        sa.Column(
            "chunk_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("chunks.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "page_number",
            sa.Integer(),
            primary_key=True,
        ),
        sa.Column(
            "bounding_boxes",
            postgresql.JSONB(),
            nullable=False,
        ),
    )


def downgrade():
    op.drop_table("chunk_provenance")