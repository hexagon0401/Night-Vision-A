"""Persistent cache, process-shared pacing, and idempotent record registry."""
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import uuid

from .types import CollectedRecord


def digest(body: bytes) -> str:
    return hashlib.sha256(body).hexdigest()


def json_bytes(value) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()


@dataclass(frozen=True)
class CachedResponse:
    body_hash: str
    fetched_at: datetime
    checked_at: datetime
    etag: str | None
    last_modified: str | None


class CollectorState:
    def __init__(self, root: Path):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
        (self.root / 'blobs').mkdir(exist_ok=True, mode=0o700)
        with self.connection() as db:
            db.executescript('''
                CREATE TABLE IF NOT EXISTS cache (
                    request_key TEXT PRIMARY KEY, body_hash TEXT NOT NULL,
                    fetched_at TEXT NOT NULL, checked_at TEXT NOT NULL, etag TEXT, last_modified TEXT);
                CREATE TABLE IF NOT EXISTS quota (provider TEXT PRIMARY KEY, next_at REAL NOT NULL);
                CREATE TABLE IF NOT EXISTS records (record_key TEXT PRIMARY KEY, payload TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS fetches (
                    fetch_id TEXT PRIMARY KEY, provider TEXT NOT NULL, request_key TEXT NOT NULL,
                    body_hash TEXT NOT NULL, fetched_at TEXT NOT NULL, metadata TEXT NOT NULL);
            ''')

    @contextmanager
    def connection(self):
        db = sqlite3.connect(self.root / 'collector.sqlite3', timeout=30)
        try:
            with db:
                yield db
        finally:
            db.close()

    def put_blob(self, body: bytes) -> str:
        key = digest(body)
        target = self.root / 'blobs' / key
        # Write a complete temporary file then atomically link it into the hash namespace.
        temporary = self.root / 'blobs' / f'.{uuid.uuid4().hex}.tmp'
        try:
            with temporary.open('xb') as stream:
                stream.write(body)
            try:
                os.link(temporary, target)
            except FileExistsError:
                if target.read_bytes() != body:
                    raise ValueError('content-addressed blob integrity failure')
        finally:
            temporary.unlink(missing_ok=True)
        return key

    def read_blob(self, key: str) -> bytes:
        if len(key) != 64 or any(c not in '0123456789abcdef' for c in key):
            raise ValueError('invalid blob key')
        body = (self.root / 'blobs' / key).read_bytes()
        if digest(body) != key:
            raise ValueError('content-addressed blob integrity failure')
        return body

    def cached(self, request_key: str) -> CachedResponse | None:
        with self.connection() as db:
            row = db.execute('SELECT body_hash,fetched_at,checked_at,etag,last_modified FROM cache WHERE request_key=?', (request_key,)).fetchone()
        return CachedResponse(row[0], datetime.fromisoformat(row[1]), datetime.fromisoformat(row[2]), row[3], row[4]) if row else None

    def cache(self, key: str, entry: CachedResponse):
        with self.connection() as db:
            db.execute('INSERT OR REPLACE INTO cache VALUES (?,?,?,?,?,?)',
                       (key, entry.body_hash, entry.fetched_at.isoformat(), entry.checked_at.isoformat(), entry.etag, entry.last_modified))

    def log_fetch(self, provider: str, request_key: str, body_hash: str, acquired: datetime, metadata: dict):
        with self.connection() as db:
            db.execute('INSERT INTO fetches VALUES (?,?,?,?,?,?)',
                       (uuid.uuid4().hex, provider, request_key, body_hash, acquired.isoformat(), json_bytes(metadata).decode()))

    def reserve(self, provider: str, now: float, interval: float) -> float:
        with self.connection() as db:
            db.execute('BEGIN IMMEDIATE')
            row = db.execute('SELECT next_at FROM quota WHERE provider=?', (provider,)).fetchone()
            when = max(now, row[0] if row else now)
            db.execute('INSERT OR REPLACE INTO quota VALUES (?,?)', (provider, when + interval))
            return when - now

    def remember(self, record: CollectedRecord) -> tuple[CollectedRecord, bool]:
        with self.connection() as db:
            inserted = db.execute('INSERT OR IGNORE INTO records VALUES (?,?)',
                                  (record.record_key, record.model_dump_json())).rowcount == 1
            payload = db.execute('SELECT payload FROM records WHERE record_key=?', (record.record_key,)).fetchone()[0]
        retained = CollectedRecord.model_validate_json(payload)
        self.read_blob(retained.payload_hash)
        self.read_blob(retained.response_hash)
        return retained, inserted
