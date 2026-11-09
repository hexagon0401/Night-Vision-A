"""Bounded GETs with inherited proxy/TLS trust; URLs and credentials never logged."""
from dataclasses import dataclass, replace
from contextlib import contextmanager
import logging
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import os
import random
import re
import time

import httpx

from nv_engine.sources.config import Manifest
from .state import CachedResponse, CollectorState, digest, json_bytes


class FetchError(RuntimeError):
    """Safe machine-readable failure; never attach raw HTTP exceptions or URLs."""


@dataclass(frozen=True)
class Fetched:
    body: bytes
    body_hash: str
    fetched_at: datetime
    from_cache: bool


@contextmanager
def redact_http_logs(secret):
    class Redact(logging.Filter):
        def filter(self, record):
            if secret:
                record.msg = record.getMessage().replace(secret, '[REDACTED]')
                record.args = ()
            return True
    logger = logging.getLogger('httpx')
    filter_ = Redact()
    logger.addFilter(filter_)
    try:
        yield
    finally:
        logger.removeFilter(filter_)


class Fetcher:
    def __init__(self, state: CollectorState, client: httpx.Client | None = None,
                 now=lambda: datetime.now(timezone.utc), sleep=time.sleep,
                 jitter=lambda: random.uniform(0, 0.25)):
        self.state, self.now, self.sleep, self.jitter = state, now, sleep, jitter
        self.client = client or httpx.Client(follow_redirects=False, trust_env=True)
        self.owns_client = client is None

    def close(self):
        if self.owns_client:
            self.client.close()

    def _credential(self, manifest: Manifest) -> str | None:
        if not manifest.credential_env:
            return None
        value = os.environ.get(manifest.credential_env)
        if not value:
            raise FetchError(f'missing_credential:{manifest.credential_env}')
        if manifest.provider == 'firms' and not re.fullmatch(r'[a-zA-Z0-9]{32}', value):
            raise FetchError('invalid_FIRMS_MAP_KEY_format')
        return value

    def fetch(self, manifest: Manifest) -> Fetched:
        if not manifest.enabled:
            raise FetchError('live_collection_disabled')
        if not manifest.rights.reviewed:
            raise FetchError('source_rights_review_required')
        secret = self._credential(manifest)
        # Credentials partition the cache but never appear in stored keys, metadata or URLs.
        key = digest(json_bytes([manifest.endpoint, manifest.params,
                                 digest(secret.encode()) if secret else None]))
        previous = self.state.cached(key)
        now = self.now()
        if previous and 0 <= (now - previous.checked_at).total_seconds() < manifest.ttl_seconds:
            return self._cached(previous, manifest)
        url = manifest.endpoint.replace('{credential}', secret or '')
        headers = {'User-Agent': 'NightVision/2.0 bounded-collector'}
        if secret and manifest.provider == 'ucdp':
            headers['x-ucdp-access-token'] = secret
        if previous:
            if previous.etag:
                headers['If-None-Match'] = previous.etag
            if previous.last_modified:
                headers['If-Modified-Since'] = previous.last_modified
        for attempt in range(manifest.max_attempts):
            delay = self.state.reserve(manifest.provider, self.now().timestamp(), manifest.min_interval_seconds)
            if delay > manifest.max_retry_delay_seconds:
                raise FetchError('retry_deferred_by_provider_quota')
            self.sleep(delay)
            retry = None
            try:
                with redact_http_logs(secret), self.client.stream('GET', url, params=manifest.params, headers=headers,
                                        timeout=manifest.timeout_seconds, follow_redirects=False) as response:
                    if response.status_code == 304:
                        if not previous:
                            raise FetchError('unexpected_304_without_cache')
                        self.state.cache(key, replace(previous, checked_at=self.now()))
                        return self._cached(previous, manifest)
                    if response.status_code in (408, 429, 500, 502, 503, 504):
                        retry = self._retry_after(response.headers.get('Retry-After'))
                        if retry is not None:
                            self._defer(manifest.provider, retry)
                        failure = f'http_{response.status_code}'
                    elif response.status_code != 200:
                        raise FetchError(f'http_{response.status_code}')
                    else:
                        chunks, length = [], 0
                        for chunk in response.iter_bytes():
                            length += len(chunk)
                            if length > manifest.max_bytes:
                                raise FetchError('response_size_limit')
                            chunks.append(chunk)
                        body = b''.join(chunks)
                        if secret and secret.encode() in body:
                            raise FetchError('credential_echo_rejected')
                        acquired = self.now()
                        body_hash = self.state.put_blob(body)
                        def safe_header(name):
                            value = response.headers.get(name)
                            return value if value and len(value) <= 200 and (not secret or secret not in value) else None
                        self.state.cache(key, CachedResponse(body_hash, acquired, acquired,
                                                            safe_header('ETag'), safe_header('Last-Modified')))
                        self.state.log_fetch(manifest.source_id, key, body_hash, acquired,
                                             {'mode': 'live', 'manifest': manifest.model_dump(mode='json')})
                        return Fetched(body, body_hash, acquired, False)
            except (httpx.HTTPError, httpx.InvalidURL, UnicodeError):
                failure = 'transport_failure'
            # Raw exception values, redirect locations and bodies are never exposed.
            if retry is not None and retry > manifest.max_retry_delay_seconds:
                raise FetchError('retry_deferred_by_retry_after')
            if attempt + 1 == manifest.max_attempts:
                raise FetchError(failure) from None
            wait = retry if retry is not None else min(2 ** attempt + self.jitter(), manifest.max_retry_delay_seconds)
            self.sleep(wait)
        raise FetchError('attempt_budget_exhausted')

    def _cached(self, previous: CachedResponse, manifest: Manifest) -> Fetched:
        body = self.state.read_blob(previous.body_hash)
        if len(body) > manifest.max_bytes:
            raise FetchError('response_size_limit')
        return Fetched(body, previous.body_hash, previous.fetched_at, True)

    def _defer(self, provider: str, delay: float):
        with self.state.connection() as db:
            db.execute('BEGIN IMMEDIATE')
            row = db.execute('SELECT next_at FROM quota WHERE provider=?', (provider,)).fetchone()
            db.execute('INSERT OR REPLACE INTO quota VALUES (?,?)',
                       (provider, max(self.now().timestamp() + delay, row[0] if row else 0)))

    def _retry_after(self, value: str | None) -> float | None:
        if value is None:
            return None
        try:
            return max(0.0, float(int(value)))
        except (ValueError, OverflowError):
            try:
                parsed = parsedate_to_datetime(value)
                if parsed.tzinfo is None:
                    return None
                return max(0.0, (parsed - self.now()).total_seconds())
            except (ValueError, TypeError, OverflowError):
                return None
