-- PR1 REVIEW PROPOSAL ONLY. Not registered in Worker migrations or database initialization.
-- Derived from user handoff v3.2; schema/validators must run before any future write.
-- Do not apply on production without separate owner approval.
-- Fresh addition after existing migrations 0001..0003. Do NOT also install the prior
-- reference-only `code/sql/0004_ontology_draft.sql`; reconcile before deployment.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS nv2_sources (
  source_id TEXT PRIMARY KEY,
  canonical_url TEXT,
  publisher TEXT,
  content_hash TEXT,
  source_kind TEXT NOT NULL CHECK(source_kind IN ('original','derived','unknown')),
  derived_from_source_id TEXT REFERENCES nv2_sources(source_id),
  independence_group TEXT,
  published_at_utc TEXT, indexed_at_utc TEXT, acquired_at_utc TEXT,
  license_status TEXT NOT NULL CHECK(license_status IN ('approved','metadata_only','pending','prohibited','unknown')),
  access_status TEXT NOT NULL CHECK(access_status IN ('opened','metadata_only','failed','restricted','not_fetched')),
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata_json))
);
CREATE INDEX IF NOT EXISTS idx_nv2_source_published ON nv2_sources(published_at_utc);
CREATE INDEX IF NOT EXISTS idx_nv2_source_hash ON nv2_sources(content_hash);

CREATE TABLE IF NOT EXISTS nv2_entities (
  entity_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('event','vessel','aircraft','satellite_scene','camera','facility','organization','location','person_public','document','anomaly')),
  display_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('observed','documented','reported','inferred','scenario','refuted','unresolved')),
  privacy_class TEXT NOT NULL CHECK(privacy_class IN ('public','restricted','non_sensitive_public_context')),
  attributes_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(attributes_json)),
  created_at_utc TEXT, updated_at_utc TEXT NOT NULL,
  synthetic INTEGER NOT NULL DEFAULT 0 CHECK(synthetic IN (0,1))
);
CREATE INDEX IF NOT EXISTS idx_nv2_entities_kind ON nv2_entities(kind,updated_at_utc DESC);

CREATE TABLE IF NOT EXISTS nv2_identifiers (
  identifier_id TEXT PRIMARY KEY, entity_id TEXT NOT NULL REFERENCES nv2_entities(entity_id),
  namespace TEXT NOT NULL, identifier_value TEXT NOT NULL,
  valid_from_utc TEXT, valid_to_utc TEXT,
  status TEXT NOT NULL,
  CHECK(valid_from_utc IS NULL OR valid_to_utc IS NULL OR valid_from_utc<=valid_to_utc)
);
CREATE INDEX IF NOT EXISTS idx_nv2_ident_ns ON nv2_identifiers(namespace,identifier_value);
CREATE INDEX IF NOT EXISTS idx_nv2_ident_entity ON nv2_identifiers(entity_id);

CREATE TABLE IF NOT EXISTS nv2_observations (
  observation_id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES nv2_entities(entity_id),
  provider_id TEXT NOT NULL, observed_at_utc TEXT,
  acquired_at_utc TEXT, recorded_at_utc TEXT,
  geometry_json TEXT CHECK(geometry_json IS NULL OR json_valid(geometry_json)),
  geometry_source_id TEXT REFERENCES nv2_sources(source_id),
  lat REAL, lon REAL, precision_m REAL,
  geometry_role TEXT NOT NULL,
  visibility_policy TEXT NOT NULL CHECK(visibility_policy IN ('public','restricted','delayed_public','aggregated_only')),
  status TEXT NOT NULL CHECK(status IN ('observed','documented','reported','inferred','scenario','refuted','unresolved')),
  measurements_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(measurements_json)),
  CHECK((lat IS NULL AND lon IS NULL) OR (lat IS NOT NULL AND lon IS NOT NULL AND lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180)),
  CHECK(precision_m IS NULL OR precision_m >= 0),
  CHECK((geometry_json IS NULL AND geometry_source_id IS NULL AND geometry_role='unlocated' AND precision_m IS NULL) OR (geometry_json IS NOT NULL AND geometry_source_id IS NOT NULL AND geometry_role!='unlocated'))
);
CREATE INDEX IF NOT EXISTS idx_nv2_obs_entity_time ON nv2_observations(entity_id,observed_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_nv2_obs_provider_time ON nv2_observations(provider_id,observed_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_nv2_obs_public_geo ON nv2_observations(visibility_policy,lat,lon,observed_at_utc);

CREATE TABLE IF NOT EXISTS nv2_claims (
  claim_id TEXT PRIMARY KEY,
  statement TEXT NOT NULL,
  language TEXT, status TEXT NOT NULL, review_state TEXT NOT NULL,
  event_from_utc TEXT, event_to_utc TEXT,
  examined_span TEXT, limitations_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(limitations_json))
);
CREATE TABLE IF NOT EXISTS nv2_relations (
  relation_id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES nv2_entities(entity_id),
  predicate TEXT NOT NULL,
  object_id TEXT NOT NULL REFERENCES nv2_entities(entity_id),
  status TEXT NOT NULL, resolution_state TEXT NOT NULL CHECK(resolution_state IN ('proposed','accepted','rejected')),
  valid_from_utc TEXT, valid_to_utc TEXT,
  CHECK(valid_from_utc IS NULL OR valid_to_utc IS NULL OR valid_from_utc<=valid_to_utc)
);
CREATE INDEX IF NOT EXISTS idx_nv2_rel_subj ON nv2_relations(subject_id,predicate);
CREATE INDEX IF NOT EXISTS idx_nv2_rel_obj ON nv2_relations(object_id,predicate);

-- Source link table: application enforces record_kind ↔ record_id referential integrity
-- because SQLite cannot foreign-key to multiple target tables.
CREATE TABLE IF NOT EXISTS nv2_record_sources (
  record_kind TEXT NOT NULL CHECK(record_kind IN ('entity','identifier','observation','relation','claim','anomaly')),
  record_id TEXT NOT NULL, source_id TEXT NOT NULL REFERENCES nv2_sources(source_id),
  role TEXT NOT NULL DEFAULT 'MENTIONS', quote_span TEXT,
  PRIMARY KEY (record_kind,record_id,source_id,role)
);
CREATE INDEX IF NOT EXISTS idx_nv2_record_sources_source ON nv2_record_sources(source_id);

CREATE TABLE IF NOT EXISTS nv2_evidence_links (
  evidence_link_id TEXT PRIMARY KEY, claim_id TEXT NOT NULL REFERENCES nv2_claims(claim_id),
  source_id TEXT NOT NULL REFERENCES nv2_sources(source_id),
  role TEXT NOT NULL CHECK(role IN ('SUPPORTS','CONTRADICTS','MENTIONS','DERIVED_FROM','UNVERIFIED_MATCH')),
  quote_span TEXT, status TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nv2_evidence_claim ON nv2_evidence_links(claim_id);

CREATE TABLE IF NOT EXISTS nv2_anomalies (
  candidate_id TEXT PRIMARY KEY, entity_id TEXT REFERENCES nv2_entities(entity_id),
  detector TEXT NOT NULL, metric TEXT NOT NULL, baseline_json TEXT NOT NULL CHECK(json_valid(baseline_json)),
  score REAL, calibration TEXT NOT NULL DEFAULT 'uncalibrated', status TEXT NOT NULL,
  review_state TEXT NOT NULL DEFAULT 'candidate', created_at_utc TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS nv2_anomaly_observations (
  candidate_id TEXT NOT NULL REFERENCES nv2_anomalies(candidate_id),
  observation_id TEXT NOT NULL REFERENCES nv2_observations(observation_id),
  PRIMARY KEY(candidate_id,observation_id)
);
CREATE TABLE IF NOT EXISTS nv2_identity_candidates (
  candidate_id TEXT PRIMARY KEY,
  left_entity_id TEXT NOT NULL REFERENCES nv2_entities(entity_id),
  right_entity_id TEXT NOT NULL REFERENCES nv2_entities(entity_id),
  algorithm TEXT NOT NULL, features_json TEXT NOT NULL CHECK(json_valid(features_json)),
  state TEXT NOT NULL CHECK(state IN ('proposed','rejected','approved')),
  reviewed_by TEXT, reviewed_at_utc TEXT,
  CHECK(left_entity_id != right_entity_id),
  CHECK(state!='approved' OR (reviewed_by IS NOT NULL AND reviewed_at_utc IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS nv2_module_runs (
  module_run_id TEXT PRIMARY KEY, case_id TEXT NOT NULL, module_id TEXT NOT NULL,
  executor TEXT NOT NULL CHECK(executor IN ('deterministic_adapter','inline_skill','mcp_remote_verified','not_executed')),
  state TEXT NOT NULL CHECK(state IN ('completed','partial','blocked','not_executed')),
  input_hash TEXT, output_hash TEXT, receipt_json TEXT CHECK(receipt_json IS NULL OR json_valid(receipt_json)),
  started_at_utc TEXT, completed_at_utc TEXT, error_code TEXT
);
CREATE INDEX IF NOT EXISTS idx_nv2_modules_case ON nv2_module_runs(case_id,module_id,started_at_utc DESC);
