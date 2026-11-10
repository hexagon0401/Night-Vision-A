import schema from "./migrations/0001_monitor.sql";
import betaSchema from './migrations/0002_beta.sql';
import contextSchema from './migrations/0003_event_context.sql';
const initialized = new WeakMap();
export async function initialize(db) {
  if (!initialized.has(db)) {
    const promise = (async () => {
      try {
        const row = await db
          .prepare("SELECT value FROM settings WHERE key='schema_version'")
          .first();
        if (Number(row?.value)>=3) return;
      } catch {}
      // Additive idempotent schemas only; destructive changes require explicit review.
      const statements = schema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("PRAGMA"));
      await db.batch(statements.map((s) => db.prepare(s)));
      await db.batch(betaSchema.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
      await db.batch(contextSchema.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
      await db
        .prepare("INSERT OR REPLACE INTO settings VALUES('schema_version','3')")
        .run();
    })();
    initialized.set(db, promise);
    promise.catch(() => initialized.delete(db));
  }
  await initialized.get(db);
}
