CREATE TABLE IF NOT EXISTS beta_runs (
 id TEXT PRIMARY KEY, day TEXT NOT NULL UNIQUE, topic TEXT NOT NULL, cutoff TEXT NOT NULL,
 created TEXT NOT NULL, state TEXT NOT NULL, input TEXT NOT NULL, models TEXT NOT NULL,
 owner_run TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS beta_steps (
 run_id TEXT NOT NULL REFERENCES beta_runs(id), step INTEGER NOT NULL CHECK(step BETWEEN 0 AND 5),
 state TEXT NOT NULL, input_hash TEXT, lease_until INTEGER, output TEXT, error TEXT,
 PRIMARY KEY(run_id,step)
);
