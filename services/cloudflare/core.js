export class ApiError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
  }
}
export function requireValue(ok, code = "invalid_request", status = 400) {
  if (!ok) throw new ApiError(status, code);
}
export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export const sha = async (value) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
export const random = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
export async function secretEqual(a, b) {
  if (!a || !b) return false;
  return (await sha(a)) === (await sha(b));
}
export async function internal(request, env) {
  requireValue(
    await secretEqual(
      request.headers.get("Authorization"),
      env.NV_INGEST_TOKEN ? "Bearer " + env.NV_INGEST_TOKEN : null,
    ),
    "internal_auth_required",
    401,
  );
}
export function sameOrigin(request) {
  requireValue(
    request.headers.get("Origin") === new URL(request.url).origin,
    "origin_required",
    403,
  );
}
export async function body(request, max = 4000000) {
  requireValue(
    request.headers.get("Content-Type")?.split(";")[0] === "application/json",
    "json_required",
    415,
  );
  if (Number(request.headers.get("Content-Length")) > max)
    throw new ApiError(413, "body_limit");
  const reader = request.body?.getReader();
  requireValue(reader, "body_required");
  let n = 0;
  const parts = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    n += value.length;
    if (n > max) {
      await reader.cancel();
      throw new ApiError(413, "body_limit");
    }
    parts.push(value);
  }
  const all = new Uint8Array(n);
  let at = 0;
  for (const p of parts) {
    all.set(p, at);
    at += p.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(all));
  } catch {
    throw new ApiError(400, "invalid_json");
  }
}
export const stmt = (db, sql, ...args) => db.prepare(sql).bind(...args);
export const rows = async (db, sql, ...args) =>
  (await stmt(db, sql, ...args).all()).results;
export function utcDay() {
  return new Date().toISOString().slice(0, 10);
}
export function schedule(now = new Date(), runs = 12) {
  const n = Number(runs);
  requireValue(Number.isInteger(n) && n >= 1 && n <= 24, "invalid_schedule");
  const midnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const slots = Array.from(
    { length: n },
    (_, i) => new Date(midnight + (Math.floor((i * 24) / n) * 60 + 17) * 60000),
  );
  return {
    runs_per_day: n,
    next_scheduled_at: (
      slots.find((d) => d > now) ?? new Date(midnight + 86400000 + 17 * 60000)
    ).toISOString(),
    timing: "best_effort",
  };
}
