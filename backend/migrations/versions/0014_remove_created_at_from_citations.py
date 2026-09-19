"""remove created_at from citations

Revision ID: 0014
Revises: 0013
Create Date: 2026-09-17

"""
from alembic import op
import sqlalchemy as sa

revision = "0014"
down_revision = "0013"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("citations", "created_at")


def downgrade():
    op.add_column(
        "citations",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
    )