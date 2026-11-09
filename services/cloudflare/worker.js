import {
  ApiError,
  json,
  internal,
  stmt,
  sameOrigin,
  body,
  requireValue,
} from "./core.js";
import { ingest, publicData } from "./data.js";
import { auth, requireUser } from "./auth.js";
import { analyzeCase, monitorSummary, reason } from "./ai.js";
import { initialize } from "./database.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (!url.pathname.startsWith("/api/")) {
        const response = await env.ASSETS.fetch(request);
        const headers = new Headers(response.headers);
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("Referrer-Policy", "no-referrer");
        headers.set(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.openfreemap.org https://assets.openfreemap.com; connect-src 'self' https://*.openfreemap.org https://assets.openfreemap.com; font-src 'self' data:; object-src 'none'; frame-ancestors 'none'",
        );
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }
      if (!env.DB)
        return json(
          {
            configured: false,
            error: "database_not_configured",
            setup_url: "/setup.html",
          },
          503,
        );
      await initialize(env.DB);
      if (url.pathname.startsWith("/api/auth/"))
        return await auth(request, env, url);
      if (url.pathname.startsWith("/api/internal/")) {
        await internal(request, env);
        if (request.method !== "POST")
          throw new ApiError(405, "method_not_allowed");
        if (url.pathname === "/api/internal/monitor-ai") {
          try {
            return json(await monitorSummary(env));
          } catch (e) {
            return json({
              state: "ai_unavailable",
              error: e instanceof ApiError ? e.message : "ai_failed",
            });
          }
        }
        if (url.pathname === "/api/internal/ucdp-permit") {
          const result = await stmt(
            env.DB,
            "INSERT INTO quotas VALUES(date('now'),'ucdp',1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1 WHERE count<500 RETURNING count",
          ).first();
          requireValue(result, "ucdp_daily_budget_exhausted", 429);
          return json({ permitted: true });
        }
        return await ingest(request, env, url.pathname);
      }
      if (url.pathname === "/api/v2/ai/analyze") {
        requireValue(request.method === "POST", "method_not_allowed", 405);
        sameOrigin(request);
        const user = await requireUser(request, env);
        const d = await body(request, 2000);
        requireValue(
          typeof d.case_id === "string" && d.case_id.length <= 180,
          "invalid_case",
        );
        return json(await analyzeCase(env, d.case_id, user.user_id));
      }
      if (url.pathname === "/api/v2/admin/setup") {
        await requireUser(request, env);
        return json({
          database: true,
          nim_key: !!env.NVIDIA_API_KEY,
          nim_enabled: env.NIM_ENABLED === "true",
          secondary_key: !!env.NVIDIA_SECONDARY_API_KEY,
          model: env.NIM_MODEL,
          review_model: env.NIM_REVIEW_MODEL,
          github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
          ingest_key: !!env.NV_INGEST_TOKEN,
        });
      }
      if (url.pathname === "/api/v2/admin/nim-test") {
        requireValue(request.method === "POST", "method_not_allowed", 405);
        sameOrigin(request);
        const user = await requireUser(request, env);
        return json(
          await reason(
            env,
            {
              sources: [],
              task: "Connection diagnostic. All four arrays can be empty; do not invent facts.",
            },
            user.user_id,
            "diagnostic",
          ),
        );
      }
      if (request.method !== "GET")
        throw new ApiError(405, "method_not_allowed");
      return await publicData(url, env);
    } catch (error) {
      return json(
        {
          error:
            error instanceof ApiError ? error.message : "service_unavailable",
        },
        error instanceof ApiError ? error.status : 503,
      );
    }
  },
};
