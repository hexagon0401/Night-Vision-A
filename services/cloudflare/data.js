import {
  requireValue,
  ApiError,
  body,
  stmt,
  rows,
  json,
  schedule,
} from "./core.js";
const ident = (s) =>
  typeof s === "string" && /^[a-zA-Z0-9_.:-]{1,180}$/.test(s);
const date = (s) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s));
export function validateRecord(r) {
  requireValue(
    r &&
      ident(r.id) &&
      typeof r.country === "string" &&
      r.country.length <= 160 &&
      date(r.day),
    "invalid_record",
  );
  requireValue(
    ["ucdp", "rss", "gdelt", "firms"].includes(r.kind),
    "invalid_provider",
  );
  requireValue(
    typeof r.source_url === "string" && r.source_url.length <= 2000,
    "invalid_source",
  );
  const u = new URL(r.source_url);
  requireValue(
    u.protocol === "https:" && !u.username && !u.password,
    "invalid_source",
  );
  requireValue(
    typeof r.hash === "string" && /^[a-f0-9]{64}$/.test(r.hash),
    "invalid_hash",
  );
  requireValue(
    typeof r.title === "string" && r.title.length <= 4000,
    "invalid_title",
  );
  requireValue(
    (r.lat === null && r.lon === null) ||
      (Number.isFinite(r.lat) &&
        Math.abs(r.lat) <= 90 &&
        Number.isFinite(r.lon) &&
        Math.abs(r.lon) <= 180),
    "invalid_location",
  );
  if (r.kind === "ucdp") {
    requireValue(
      date(r.end_day) && r.end_day >= r.day && typeof r.version === "string",
      "invalid_ucdp_dates",
    );
    for (const key of ["low", "best", "high"])
      requireValue(
        r[key] === null || (Number.isSafeInteger(r[key]) && r[key] >= 0),
        "invalid_fatalities",
      );
    if (r.low !== null && r.high !== null)
      requireValue(r.low <= r.high, "invalid_fatalities");
    requireValue(
      Number.isInteger(r.precision) && r.precision >= 1 && r.precision <= 7,
      "invalid_precision",
    );
  }
  requireValue(JSON.stringify(r).length <= 20000, "record_limit");
  return r;
}
export function validateCase(p) {
  requireValue(
    p?.case?.data_origin === "source_backed" &&
      p.analysis?.case_id === p.case.case_id &&
      Array.isArray(p.analysis.anomalies),
    "invalid_case",
  );
  requireValue(ident(p.case.case_id), "invalid_case_id");
  const names = [
    "sources",
    "claims",
    "events",
    "entities",
    "observations",
    "anomalies",
    "narratives",
  ];
  requireValue(
    names.every((k) => Array.isArray(p.case[k])) &&
      names.reduce((n, k) => n + p.case[k].length, 0) <= 4096 &&
      p.case.observations.length <= 2048,
    "case_budget",
  );
  requireValue(
    new TextEncoder().encode(JSON.stringify(p)).length <= 1800000,
    "case_size",
  );
  if (p.map_context)
    requireValue(
      Array.isArray(p.map_context) &&
        p.map_context.length <= 250 &&
        p.map_context.every((r) => {
          validateRecord(r);
          return true;
        }),
      "invalid_map_context",
    );
  return p;
}
export async function ingest(request, env, path) {
  const d = await body(request);
  const db = env.DB;
  if (path === "/api/internal/start") {
    requireValue(
      ident(d.id) &&
        ident(d.provider) &&
        Number.isInteger(d.expected) &&
        d.expected >= 0 &&
        d.expected <= 20000 &&
        d.metadata &&
        JSON.stringify(d.metadata).length <= 10000,
      "invalid_snapshot",
    );
    const existing = await stmt(
      db,
      "SELECT * FROM snapshots WHERE id=?",
      d.id,
    ).first();
    if (existing) {
      requireValue(
        existing.provider === d.provider &&
          existing.expected === d.expected &&
          existing.metadata === JSON.stringify(d.metadata),
        "snapshot_conflict",
        409,
      );
      return json({ id: d.id, state: existing.state });
    }
    const { n } = await stmt(db, "SELECT COUNT(*) n FROM records").first();
    requireValue(n + d.expected <= 60000, "storage_record_limit", 429);
    await stmt(
      db,
      "INSERT INTO snapshots(id,provider,created,expected,metadata) VALUES(?,?,?,?,?)",
      d.id,
      d.provider,
      new Date().toISOString(),
      d.expected,
      JSON.stringify(d.metadata),
    ).run();
    return json({ id: d.id, state: "staging" });
  }
  if (path === "/api/internal/batch") {
    requireValue(
      ident(d.id) && Array.isArray(d.records) && d.records.length <= 50,
      "invalid_batch",
    );
    const s = await stmt(
      db,
      "SELECT * FROM snapshots WHERE id=?",
      d.id,
    ).first();
    requireValue(s?.state === "staging", "snapshot_not_staging", 409);
    const records = d.records.map(validateRecord);
    const existing = records.length
      ? await rows(
          db,
          `SELECT id,body FROM records WHERE snapshot=? AND id IN (${records.map(() => "?").join(",")})`,
          d.id,
          ...records.map((r) => r.id),
        )
      : [];
    const index = new Map(existing.map((r) => [r.id, r.body]));
    for (const r of records) {
      const old = index.get(r.id);
      requireValue(!old || old === JSON.stringify(r), "record_conflict", 409);
      index.set(r.id, JSON.stringify(r));
    }
    const { n } = await stmt(
      db,
      "SELECT COUNT(*) n FROM records WHERE snapshot=?",
      d.id,
    ).first();
    requireValue(
      n + records.filter((r) => !existing.some((e) => e.id === r.id)).length <=
        s.expected,
      "snapshot_count_limit",
    );
    if (records.length)
      await db.batch(
        records.map((r) =>
          stmt(
            db,
            "INSERT OR IGNORE INTO records VALUES(?,?,?,?,?,?,?,?)",
            d.id,
            r.id,
            r.country,
            r.day,
            r.lat,
            r.lon,
            r.kind,
            JSON.stringify(r),
          ),
        ),
      );
    return json({ accepted: records.length });
  }
  if (path === "/api/internal/case") {
    requireValue(ident(d.id) && typeof d.country === "string", "invalid_case");
    const p = validateCase(d.payload);
    const s = await stmt(
      db,
      "SELECT state FROM snapshots WHERE id=?",
      d.id,
    ).first();
    requireValue(s?.state === "staging", "snapshot_not_staging", 409);
    requireValue(
      d.exports &&
        ["observed", "all"].every(
          (k) =>
            typeof d.exports[k] === "string" &&
            d.exports[k].length <= 1500000 &&
            /^UEs[A-Za-z0-9+/=]+$/.test(d.exports[k]),
        ),
      "invalid_exports",
    );
    const priority = Math.max(
      0,
      ...p.analysis.anomalies.map((a) =>
        Number.isFinite(a.score) ? Math.abs(a.score) : 0,
      ),
    );
    await db.batch([
      stmt(
        db,
        "INSERT OR REPLACE INTO cases VALUES(?,?,?,?,?)",
        d.id,
        p.case.case_id,
        d.country,
        JSON.stringify(p),
        priority,
      ),
      ...["observed", "all"].map((scope) =>
        stmt(
          db,
          "INSERT OR REPLACE INTO exports VALUES(?,?,?,?)",
          d.id,
          p.case.case_id,
          scope,
          d.exports[scope],
        ),
      ),
    ]);
    return json({ accepted: true });
  }
  if (path === "/api/internal/publish") {
    requireValue(ident(d.id), "invalid_snapshot");
    const s = await stmt(
      db,
      "SELECT * FROM snapshots WHERE id=?",
      d.id,
    ).first();
    requireValue(s, "unknown_snapshot", 404);
    if (s.state === "published") return json({ published: true, id: d.id });
    const { n } = await stmt(
      db,
      "SELECT COUNT(*) n FROM records WHERE snapshot=?",
      d.id,
    ).first();
    requireValue(n === s.expected, "incomplete_snapshot", 409);
    await db.batch([
      stmt(db, "UPDATE snapshots SET state='published' WHERE id=?", d.id),
      stmt(
        db,
        "INSERT INTO heads VALUES(?,?) ON CONFLICT(provider) DO UPDATE SET snapshot=excluded.snapshot",
        s.provider,
        d.id,
      ),
    ]);
    // Keep only the committed snapshot per provider and a bounded staging window.
    await stmt(
      db,
      "DELETE FROM snapshots WHERE id NOT IN (SELECT snapshot FROM heads) AND (state='published' OR created < datetime('now','-2 days'))",
    ).run();
    return json({ published: true, id: d.id });
  }
  if (path === "/api/internal/run") {
    requireValue(
      ident(d.id) &&
        ["running", "complete", "failed", "skipped"].includes(d.state) &&
        typeof d.started === "string" &&
        JSON.stringify(d).length <= 20000,
      "invalid_run",
    );
    await stmt(
      db,
      "INSERT INTO runs VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET completed=excluded.completed,state=excluded.state,body=excluded.body",
      d.id,
      d.started,
      d.completed ?? null,
      d.state,
      JSON.stringify(d),
    ).run();
    await stmt(
      db,
      "DELETE FROM runs WHERE started < datetime('now','-30 days')",
    ).run();
    return json({ recorded: true });
  }
  if (path === "/api/internal/aggregates") {
    requireValue(
      ident(d.provider) && Array.isArray(d.rows) && d.rows.length <= 50,
      "invalid_aggregates",
    );
    for (const r of d.rows)
      requireValue(
        typeof r.country === "string" &&
          date(r.day) &&
          Number.isInteger(r.events) &&
          r.events >= 0,
        "invalid_aggregate",
      );
    if (d.rows.length)
      await db.batch(
        d.rows.map((r) =>
          stmt(
            db,
            "INSERT INTO aggregates VALUES(?,?,?,?) ON CONFLICT(provider,country,day) DO UPDATE SET body=excluded.body WHERE aggregates.body<>excluded.body",
            d.provider,
            r.country,
            r.day,
            JSON.stringify(r),
          ),
        ),
      );
    await stmt(
      db,
      "DELETE FROM aggregates WHERE day < date('now','-13 months')",
    ).run();
    return json({ accepted: d.rows.length });
  }
  throw new ApiError(404, "not_found");
}
export async function publicData(url, env) {
  const path = url.pathname,
    db = env.DB;
  if (path === "/api/v2/status") {
    const providers = await rows(
      db,
      "SELECT s.provider,s.created,s.metadata FROM heads h JOIN snapshots s ON s.id=h.snapshot",
    );
    const runs = await rows(
      db,
      "SELECT * FROM runs ORDER BY started DESC LIMIT 24",
    );
    const last = runs.find((r) => r.state === "complete");
    return json({
      configured: true,
      ...schedule(new Date(), env.MONITOR_RUNS_PER_DAY ?? 12),
      providers: providers.map((p) => ({
        ...p,
        metadata: JSON.parse(p.metadata),
      })),
      runs: runs.map((r) => JSON.parse(r.body)),
      last_success: last?.completed ?? null,
      stale: !last || Date.now() - Date.parse(last.completed) > 5 * 3600000,
      ai_configured: !!env.NVIDIA_API_KEY,
      github_configured: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    });
  }
  if (path === "/api/v2/events") {
    const country = url.searchParams.get("country") ?? "";
    requireValue(country.length <= 160, "invalid_country");
    const from = url.searchParams.get("from") ?? "0000-01-01",
      to = url.searchParams.get("to") ?? "9999-12-31";
    requireValue(date(from) && date(to) && from <= to, "invalid_dates");
    let sql =
      "SELECT r.body FROM records r JOIN heads h ON r.snapshot=h.snapshot WHERE r.day BETWEEN ? AND ?";
    const args = [from, to];
    if (country) {
      sql += " AND r.country=?";
      args.push(country);
    }
    sql += " ORDER BY r.day DESC,r.id LIMIT 501";
    const records = await rows(db, sql, ...args);
    return json({
      records: records.slice(0, 500).map((r) => JSON.parse(r.body)),
      limited: records.length > 500,
    });
  }
  if (path === "/api/v2/overview") {
    const data = await rows(
      db,
      "SELECT r.country,COUNT(*) events,MIN(r.day) first_day,MAX(r.day) last_day FROM records r JOIN heads h ON r.snapshot=h.snapshot GROUP BY r.country ORDER BY events DESC",
    );
    return json({ countries: data });
  }
  if (path === "/api/v2/cases")
    return json({
      cases: await rows(
        db,
        "SELECT c.id,c.country FROM cases c JOIN heads h ON c.snapshot=h.snapshot ORDER BY c.country,c.id LIMIT 500",
      ),
    });
  if (path.startsWith("/api/v2/cases/")) {
    if (path.endsWith("/export")) {
      const id = decodeURIComponent(
          path.slice("/api/v2/cases/".length, -"/export".length),
        ),
        scope = url.searchParams.get("scope") ?? "observed";
      requireValue(
        ident(id) && ["observed", "all"].includes(scope),
        "invalid_export",
      );
      const r = await stmt(
        db,
        "SELECT e.body FROM exports e JOIN heads h ON e.snapshot=h.snapshot WHERE e.id=? AND e.scope=?",
        id,
        scope,
      ).first();
      requireValue(r, "unknown_export", 404);
      const bytes = Uint8Array.from(atob(r.body), (c) => c.charCodeAt(0));
      return new Response(bytes, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition":
            'attachment; filename="NV_foundry_' + scope + '.zip"',
          "Cache-Control": "no-store",
        },
      });
    }
    const id = decodeURIComponent(path.slice("/api/v2/cases/".length));
    requireValue(ident(id), "invalid_case");
    const r = await stmt(
      db,
      "SELECT c.body FROM cases c JOIN heads h ON c.snapshot=h.snapshot WHERE c.id=?",
      id,
    ).first();
    requireValue(r, "unknown_case", 404);
    return json(JSON.parse(r.body));
  }
  if (path === "/api/v2/monitor-summary") {
    const result = await stmt(
      db,
      "SELECT * FROM ai_results WHERE kind='monitor' ORDER BY created DESC LIMIT 1",
    ).first();
    return json({
      result: result ? JSON.parse(result.body) : null,
      analyzed_at: result?.created ?? null,
    });
  }
  throw new ApiError(404, "not_found");
}
