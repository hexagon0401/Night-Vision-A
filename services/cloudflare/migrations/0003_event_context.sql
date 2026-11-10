CREATE TABLE IF NOT EXISTS event_context_cache(event_id TEXT NOT NULL,provider_id TEXT NOT NULL,event_hash TEXT NOT NULL,provider_version TEXT NOT NULL,fetched_at TEXT NOT NULL,expires_at TEXT NOT NULL,status TEXT NOT NULL,body TEXT NOT NULL,PRIMARY KEY(event_id,provider_id,event_hash,provider_version));
CREATE INDEX IF NOT EXISTS event_context_expiry ON event_context_cache(expires_at);
CREATE TABLE IF NOT EXISTS context_locks(slot INTEGER PRIMARY KEY,job TEXT UNIQUE NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS context_reviews(id TEXT PRIMARY KEY,event_id TEXT NOT NULL,event_hash TEXT NOT NULL,created TEXT NOT NULL,user_id TEXT NOT NULL,body TEXT NOT NULL);
