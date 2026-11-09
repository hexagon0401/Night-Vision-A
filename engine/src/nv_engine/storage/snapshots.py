"""Append-only, content-addressed snapshots. Never create tables implicitly."""
import hashlib
import json
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String, Table, Column, MetaData, select
from sqlalchemy.engine import Connection

from nv_engine.models import CaseBundle

metadata = MetaData()
case_snapshots = Table(
    'case_snapshots', metadata,
    Column('revision', String(64), primary_key=True),
    Column('case_id', String(128), nullable=False, index=True),
    Column('schema_version', String(32), nullable=False),
    Column('payload', JSON, nullable=False),
    Column('created_at_utc', DateTime(timezone=True), nullable=False),
)


def canonical_bytes(bundle: CaseBundle) -> bytes:
    # Revalidate even a model mutated after construction. Array order is meaningful.
    validated = CaseBundle.model_validate(bundle.model_dump(mode='json'))
    return json.dumps(validated.model_dump(mode='json'), sort_keys=True,
                      separators=(',', ':'), ensure_ascii=False, allow_nan=False).encode()


def save_snapshot(connection: Connection, bundle: CaseBundle) -> str:
    """Caller owns transaction. Identical retries are idempotent, never overwrite."""
    payload_bytes = canonical_bytes(bundle)
    revision = hashlib.sha256(payload_bytes).hexdigest()
    payload = json.loads(payload_bytes)
    if connection.dialect.name == 'sqlite':
        from sqlalchemy.dialects.sqlite import insert
    elif connection.dialect.name == 'postgresql':
        from sqlalchemy.dialects.postgresql import insert
    else:
        raise ValueError('snapshot storage supports SQLite and PostgreSQL only')
    connection.execute(insert(case_snapshots).values(
        revision=revision, case_id=payload['case_id'],
        schema_version=payload['schema_version'], payload=payload,
        created_at_utc=datetime.now(timezone.utc),
    ).on_conflict_do_nothing(index_elements=['revision']))
    existing = connection.execute(select(case_snapshots.c.payload).where(
        case_snapshots.c.revision == revision)).scalar_one()
    if existing != payload:
        raise ValueError('snapshot hash collision or corrupted payload')
    return revision


def load_snapshot(connection: Connection, revision: str) -> CaseBundle:
    payload = connection.execute(select(case_snapshots.c.payload).where(
        case_snapshots.c.revision == revision)).scalar_one_or_none()
    if payload is None:
        raise KeyError(revision)
    bundle = CaseBundle.model_validate(payload)
    if hashlib.sha256(canonical_bytes(bundle)).hexdigest() != revision:
        raise ValueError('snapshot integrity mismatch')
    return bundle
