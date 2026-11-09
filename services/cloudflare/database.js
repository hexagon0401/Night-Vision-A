import schema from "./migrations/0001_monitor.sql";
const initialized = new WeakMap();
export async function initialize(db) {
  if (!initialized.has(db)) {
    const promise = (async () => {
      try {
        const row = await db
          .prepare("SELECT value FROM settings WHERE key='schema_version'")
          .first();
        if (row?.value === "1") return;
      } catch {}
      // Initial schema only; future destructive changes require explicit reviewed migrations.
      const statements = schema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("PRAGMA"));
      await db.batch(statements.map((s) => db.prepare(s)));
      await db
        .prepare("INSERT OR REPLACE INTO settings VALUES('schema_version','1')")
        .run();
    })();
    initialized.set(db, promise);
    promise.catch(() => initialized.delete(db));
  }
  await initialized.get(db);
}
