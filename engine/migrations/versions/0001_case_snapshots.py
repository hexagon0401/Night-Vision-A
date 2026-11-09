"""Initial canonical snapshot store; no historical fixtures are imported."""
from alembic import op
import sqlalchemy as sa

revision = '0001_case_snapshots'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'case_snapshots',
        sa.Column('revision', sa.String(64), primary_key=True),
        sa.Column('case_id', sa.String(128), nullable=False),
        sa.Column('schema_version', sa.String(32), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('created_at_utc', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_case_snapshots_case_id', 'case_snapshots', ['case_id'])


def downgrade():
    op.drop_index('ix_case_snapshots_case_id', table_name='case_snapshots')
    op.drop_table('case_snapshots')
