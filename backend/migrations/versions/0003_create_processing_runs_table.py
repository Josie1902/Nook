"""create processing_runs table

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "processing_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("book_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("books.id", ondelete="CASCADE"), nullable=False),
        # TODO: link to processing config table, we currently don't have it yet
        # sa.Column("config_version", sa.String(), sa.ForeignKey("processing_configs.version", ondelete="RESTRICT"), nullable=False),
        sa.Column("config_version", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("current_stage", sa.String(), nullable=True),
        sa.Column("metrics", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("error_code", sa.String(), nullable=True),
        sa.Column("error_message", sa.String(), nullable=True),
        sa.Column("error_details", postgresql.JSONB(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("id", "book_id", name="uq_processing_runs_id_book_id"),
    )

    op.create_index("ix_processing_runs_book_id", "processing_runs", ["book_id"])

    op.create_index(
        "processing_runs_one_active_per_book",
        "processing_runs",
        ["book_id"],
        unique=True,
        postgresql_where=sa.text("status IN ('pending', 'running')"),
    )


def downgrade():
    op.drop_index("processing_runs_one_active_per_book", table_name="processing_runs")
    op.drop_index("ix_processing_runs_book_id", table_name="processing_runs")
    op.drop_table("processing_runs")
