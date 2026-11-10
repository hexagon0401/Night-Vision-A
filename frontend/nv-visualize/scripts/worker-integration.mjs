import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import {reserve} from "../../../services/cloudflare/ai.js";
import {selectModel} from "../../../services/cloudflare/nim.js";
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const built = await build({
  absWorkingDir:fileURLToPath(new URL('..',import.meta.url)),
  entryPoints: ["../../services/cloudflare/worker.js"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
  loader: { ".sql": "text" },
});
// Diagnostics only inside the isolated mock runtime; production never reveals exception text.
const script = built.outputFiles[0].text.replace(
  '"service_unavailable"',
  "String(error.stack)",
);
const rsa=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',rsa.publicKey),kid:'beta-test-key',alg:'RS256'};
async function workload(overrides={}){const now=Math.floor(Date.now()/1000);const header=Buffer.from(JSON.stringify({alg:'RS256',kid:jwk.kid})).toString('base64url');const claims=Buffer.from(JSON.stringify({iss:'https://token.actions.githubusercontent.com',aud:'https://example.test/beta',iat:now,exp:now+300,repository:'hexagon0401/Night-Vision-A',repository_id:'1204033173',ref:'refs/heads/main',event_name:'workflow_dispatch',workflow_ref:'hexagon0401/Night-Vision-A/.github/workflows/beta-comparison.yml@refs/heads/main',run_id:'42',sha:'test-sha',...overrides})).toString('base64url');const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',rsa.privateKey,new TextEncoder().encode(header+'.'+claims));return header+'.'+claims+'.'+Buffer.from(signature).toString('base64url');}
let nimCalls = 0;
let profileId = 82876856;
let nimStatus = 200;
let finishReason='stop';
const mf = new Miniflare(
  await convertV4MiniflareOptions({
    workers: [
      {
        name: "nv",
        modules: true,
        script,
        compatibilityDate: "2026-01-01",
        d1Databases: ["DB"],
        bindings: {
          NV_INGEST_TOKEN: "test-internal",
          GITHUB_CLIENT_ID: "test-client",
          GITHUB_CLIENT_SECRET: "test-secret",
          GITHUB_ALLOWED_USER_IDS: "82876856",
          NVIDIA_API_KEY_A: "test-nim-A",
          NVIDIA_API_KEY_B: "test-nim-B",
          NIM_ENABLED: "true",
          NIM_MODEL: "test-model",
          NIM_REVIEW_MODEL: "test-model",
        },
        outboundService: async (request) => {
          const u = new URL(request.url);
          if(u.hostname==='token.actions.githubusercontent.com')return Response.json({keys:[jwk]});
          if (u.hostname === "github.com")
            return Response.json({ access_token: "test-provider-token" });
          if (u.hostname === "api.github.com")
            return Response.json({ id: profileId, login: "owner" });
          if (u.hostname === "integrate.api.nvidia.com") {
            const input = await request.json();
            const reviewing = input.messages[0].content.includes(
              "Review reasoning errors",
            ) || input.messages[0].content.includes("critique agent");
            assert.equal(
              request.headers.get("Authorization"),
              reviewing ? "Bearer test-nim-B" : "Bearer test-nim-A",
            );
            nimCalls++;
            if (nimStatus !== 200)
              return new Response("provider limit", { status: nimStatus });
            if(input.messages[0].content.includes('Framework: NV Engine 2.0')){
             const packet=JSON.parse(input.messages[1].content),round=Number(input.messages[0].content.match(/iteration (\d)\/3/)[1]);
             if(reviewing)assert.ok(packet.previous_analysis);
             if(!reviewing&&round>1)assert.ok(packet.previous_evaluation);
             const report=reviewing?{verdict:'revise',critique:'Synthetic critique [S:src_beta_test]',source_ids:['src_beta_test'],rubric:Array.from({length:9},(_,i)=>({criterion:'test '+i,score:1,max:2})),research_requests:[]}:{sections:Object.fromEntries(['PLANNER','L0','L1','L2','L2.5','L3','L4','RETRO'].map(p=>[p,'Synthetic source-bound test '+p+' [S:src_beta_test]'])),source_ids:['src_beta_test'],hypotheses:[{id:'H1',claim:'synthetic claim',falsifier:'counterexample',status:'open'}],changes:'test revision',research_requests:[]};
             return Response.json({model:'resolved-test-model',usage:{prompt_tokens:100,completion_tokens:50},choices:[{finish_reason:'stop',message:{content:JSON.stringify(report)}}]});
            }
            return Response.json({
              usage:{prompt_tokens:20,completion_tokens:10},
              choices: [
                {
                  finish_reason:finishReason,
                  message: {
                    content: JSON.stringify({
                      summary: [],
                      alternatives: [],
                      counterevidence: [],
                      unknowns: [],
                    }),
                  },
                },
              ],
            });
          }
          return new Response("unexpected outbound", { status: 500 });
        },
      },
    ],
  }),
);
try {
  const db = await mf.getD1Database("DB");
  const origin = "https://example.test";
  const req = (path, body, headers = {}) =>
    mf.dispatchFetch(origin + path, {
      redirect: "manual",
      method: body === undefined ? "GET" : "POST",
      headers: {
        ...(body === undefined
          ? {}
          : { "Content-Type": "application/json", Origin: origin }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  const internal = (path, body) =>
    req("/api/internal/" + path, body, {
      Authorization: "Bearer test-internal",
    });
  const initialStatus=await(await req('/api/v2/status')).json();
  assert.equal(initialStatus.ai_configured,true);assert.equal(initialStatus.ai_enabled,true);
  assert.equal(initialStatus.monitoring_state,'not_started');
  const emptySummary=await(await req('/api/v2/monitor-summary')).json();
  assert.equal(emptySummary.statistical.mode,'statistical');assert.equal(emptySummary.statistical.providers.length,0);
  assert.equal((await internal('monitor-ai',{})).status,200);assert.equal(nimCalls,0,'uninitialized data must not consume inference');
  const monitorToken=await workload({aud:origin+'/monitor',event_name:'schedule',workflow_ref:'hexagon0401/Night-Vision-A/.github/workflows/monitor.yml@refs/heads/main'});
  const monitorHeaders={Authorization:'Bearer '+monitorToken};
  assert.equal((await req('/api/internal/run',{id:'run:oidc-test',started:new Date().toISOString(),state:'skipped'},monitorHeaders)).status,200);
  assert.equal((await req('/api/internal/beta/start',{},monitorHeaders)).status,401,'monitor identity is not beta authority');
  assert.equal((await req('/api/internal/run',{}, {Authorization:'Bearer '+await workload()})).status,401,'beta identity is not monitor authority');
  assert.equal((await req('/api/internal/run',{}, {Authorization:'Bearer '+await workload({aud:origin+'/monitor',event_name:'pull_request',workflow_ref:'hexagon0401/Night-Vision-A/.github/workflows/monitor.yml@refs/heads/main'})})).status,403,'PR workflows cannot publish');
  assert.equal((await req("/api/internal/start", {})).status, 401);
  assert.equal((await req("/api/v2/ai/analyze", { case_id: "x" })).status, 401);
  const snapshot = {
    id: "snapshot:test",
    provider: "ucdp",
    expected: 1,
    metadata: { coverage: "bounded test" },
  };
  assert.equal((await internal("start", snapshot)).status, 200);
  assert.equal((await internal("publish", { id: snapshot.id })).status, 409);
  const record = {
    id: "ucdp:1",
    country: "Test",
    day: "2026-01-01",
    end_day: "2026-01-01",
    kind: "ucdp",
    version: "26.1",
    title: "reported",
    hash: "a".repeat(64),
    lat: 12,
    lon: 22,
    low: 0,
    best: 0,
    high: 0,
    precision: 2,
    source_url: "https://ucdp.uu.se/",
  };
  assert.equal(
    (await internal("batch", { id: snapshot.id, records: [record] })).status,
    200,
  );
  const payload = JSON.parse(
    readFileSync("public/demo/alpha-case.json", "utf8"),
  );
  const exports = {
    observed: readFileSync("public/exports/alpha-observed.zip").toString(
      "base64",
    ),
    all: readFileSync("public/exports/alpha-all.zip").toString("base64"),
  };
  assert.equal(
    (
      await internal("case", {
        id: snapshot.id,
        country: "Test",
        payload,
        exports,
      })
    ).status,
    200,
  );
  assert.equal(
    (await internal("batch", { id: snapshot.id, records: [record] })).status,
    200,
  );
  assert.equal((await internal("publish", { id: snapshot.id })).status, 200);
  assert.equal((await (await req("/api/v2/events")).json()).records.length, 1);
  const exported = await req(
    "/api/v2/cases/" + encodeURIComponent(payload.case.case_id) + "/export",
  );
  assert.equal(exported.status, 200);
  assert.equal(new Uint8Array(await exported.arrayBuffer())[0], 80);
  // Incomplete replacement never changes the published head.
  await internal("start", {
    ...snapshot,
    id: "snapshot:incomplete",
    expected: 2,
  });
  assert.equal(
    (await internal("publish", { id: "snapshot:incomplete" })).status,
    409,
  );
  assert.equal((await (await req("/api/v2/events")).json()).records.length, 1);
  const start = await req("/api/auth/github");
  assert.equal(start.status, 302);
  const redirect = new URL(start.headers.get("Location"));
  const state = redirect.searchParams.get("state");
  const stateCookie = start.headers.get("Set-Cookie").split(";")[0];
  assert.equal(
    (await req("/api/auth/github/callback?state=" + state + "&code=test"))
      .status,
    400,
  );
  const callback = await req(
    "/api/auth/github/callback?state=" + state + "&code=test",
    undefined,
    { Cookie: stateCookie },
  );
  assert.equal(callback.status, 302, await callback.clone().text());
  const session = callback.headers
    .getSetCookie()
    .find((x) => x.startsWith("__Host-nv-session="))
    .split(";")[0];
  assert.equal(
    (
      await req(
        "/api/auth/github/callback?state=" + state + "&code=test",
        undefined,
        { Cookie: stateCookie },
      )
    ).status,
    400,
  );
  const me = await (
    await req("/api/auth/me", undefined, { Cookie: session })
  ).json();
  assert.equal(me.user.user_id, "82876856");
  const nim = await req("/api/v2/admin/nim-test", {}, { Cookie: session });
  assert.equal(nim.status, 200, await nim.clone().text());
  assert.equal(
    (await req("/api/v2/admin/nim-test", {}, { Cookie: session })).status,
    200,
  );
  assert.equal(nimCalls, 1, "cache must avoid repeated NIM requests");
  assert.equal(
    (
      await req(
        "/api/v2/admin/nim-test",
        {},
        { Cookie: session, Origin: "https://evil.test" },
      )
    ).status,
    403,
  );
  profileId = 999;
  const forbidden = await req("/api/auth/github");
  const forbiddenState = new URL(
    forbidden.headers.get("Location"),
  ).searchParams.get("state");
  assert.equal(
    (
      await req(
        "/api/auth/github/callback?state=" + forbiddenState + "&code=test",
        undefined,
        { Cookie: forbidden.headers.get("Set-Cookie").split(";")[0] },
      )
    ).status,
    403,
  );
  profileId = 82876856;
  nimStatus = 429;
  assert.equal(
    (
      await req(
        "/api/v2/ai/analyze",
        { case_id: payload.case.case_id },
        { Cookie: session },
      )
    ).status,
    429,
  );
  const callsAfterPause = nimCalls;
  assert.equal(
    (
      await req(
        "/api/v2/ai/analyze",
        { case_id: payload.case.case_id },
        { Cookie: session },
      )
    ).status,
    429,
  );
  assert.equal(nimCalls, callsAfterPause);
  await db.prepare("DELETE FROM settings WHERE key LIKE 'nim-paused:%'").run();
  nimStatus = 200;
  const beforeReview = nimCalls;
  const reviewed = await (await internal("monitor-ai", {})).json();
  assert.equal(reviewed.reviewed, 1);
  assert.equal(
    nimCalls - beforeReview,
    3,
    "monitor summary, primary case interpretation and reviewer must be distinct even with the same model",
  );
  assert.equal(
    (
      await db
        .prepare(
          "SELECT count FROM quotas WHERE day=date('now') AND bucket='review'",
        )
        .first()
    ).count,
    1,
  );
  await db
    .prepare("UPDATE snapshots SET metadata=? WHERE id=?")
    .bind(JSON.stringify({ coverage: "new test evidence" }), snapshot.id)
    .run();
  // Workload-authenticated full beta loop, not a public AI bypass.
  const betaInput={topic:'SYNTHETIC TEST red sea',cutoff:new Date(Date.now()-1000).toISOString(),framework_sha256:'a'.repeat(64),sources:[{id:'src_beta_test',title:'SYNTHETIC TEST',url:'https://www.imo.org/test',excerpt:'SYNTHETIC TEST evidence only',publisher_family:'imo.org',published_at:'2026-01-01T00:00:00Z'}]};
  assert.equal((await req('/api/internal/beta/start',betaInput)).status,401);
  assert.equal((await req('/api/internal/beta/start',betaInput,{Authorization:'Bearer '+await workload({ref:'refs/heads/fork'})})).status,403);
  assert.equal((await req('/api/internal/beta/start',betaInput,{Authorization:'Bearer '+await workload({exp:Math.floor(Date.now()/1000)-1})})).status,401);
  const betaHeaders={Authorization:'Bearer '+await workload()};
  const begin=await req('/api/internal/beta/start',betaInput,betaHeaders);assert.equal(begin.status,200,await begin.clone().text());const beta=await begin.json();
  assert.equal((await req('/api/internal/beta/step',{id:beta.id,step:1},betaHeaders)).status,409);
  await db.prepare("UPDATE quotas SET count=0 WHERE day=date('now') AND bucket='review'").run();
  const betaBefore=nimCalls;
  const first=await Promise.all([req('/api/internal/beta/step',{id:beta.id,step:0},betaHeaders),req('/api/internal/beta/step',{id:beta.id,step:0},betaHeaders)]);
  assert.deepEqual(first.map(r=>r.status).sort(),[200,409]);
  for(let step=1;step<6;step++){const response=await req('/api/internal/beta/step',{id:beta.id,step},betaHeaders);assert.equal(response.status,200,await response.clone().text());}
  assert.equal(nimCalls-betaBefore,6);
  assert.equal((await req('/api/internal/beta/step',{id:beta.id,step:5},betaHeaders)).status,200);assert.equal(nimCalls-betaBefore,6,'resume must not charge completed steps');
  const final=await(await req('/api/v2/beta/'+beta.id)).json();assert.equal(final.state,'complete');assert.equal(final.steps.length,6);assert.equal(final.steps[5].output.provider_model,'resolved-test-model');
  assert.equal((await req('/api/internal/beta/start',{...betaInput,topic:'different'},betaHeaders)).status,429);
  await db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').bind('nim-health:nvidia/nemotron-3.5-lightning-30b-a3b',JSON.stringify({error:'nim_truncated_response'})).run();
  const selected=await selectModel({DB:db,NIM_REVIEW_MODEL:'meta/llama-3.3-70b-instruct'},'nvidia/nemotron-3.5-lightning-30b-a3b');
  assert.equal(selected.model,'mistralai/mistral-large-2-instruct');assert.equal(selected.shared_model_with_critic,true);
  assert.equal((await selectModel({DB:db},'meta/llama-3.3-70b-instruct','critic')).model,'mistralai/mistral-large-2-instruct');
  await db.prepare("DELETE FROM settings WHERE key='nim-health:nvidia/nemotron-3.5-lightning-30b-a3b'").run();
  // Six major calls plus at most two bounded retries; the global cap stays 40.
  await db.prepare("UPDATE quotas SET count=7 WHERE bucket='user:beta' AND day=date('now')").run();
  const retryReservations=await Promise.allSettled([reserve(db,'beta'),reserve(db,'beta')]);
  assert.equal(retryReservations.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await db.prepare("SELECT count FROM quotas WHERE bucket='user:beta' AND day=date('now')").first()).count,8);
  // A length-truncated provider response is never accepted as a successful report.
  await db.prepare("DELETE FROM ai_results WHERE kind='case'").run();
  finishReason='length';
  const truncated=await req('/api/v2/ai/analyze',{case_id:payload.case.case_id},{Cookie:session});
  assert.equal(truncated.status,502);assert.equal((await truncated.json()).error,'nim_truncated_response');
  const health=(await(await req('/api/v2/status')).json()).ai_health;
  assert.equal(health[0].finish_reason,'length');assert.equal(health[0].usage.completion_tokens,10);
  const stillAvailable=await(await req('/api/v2/monitor-summary')).json();
  assert.equal(stillAvailable.statistical.records,1);assert.ok(stillAvailable.statistical.candidates>0);
  assert.ok(!JSON.stringify(health).includes('test-nim-A'));
  finishReason='stop';
  assert.equal((await req('/api/v2/ai/analyze',{case_id:payload.case.case_id},{Cookie:session})).status,200);
  // Race competing global reservations using actual D1 transactions.
  await db
    .prepare("INSERT OR REPLACE INTO quotas VALUES(date('now'),'nim',39)")
    .run();
  const before = nimCalls;
  await Promise.all([internal("monitor-ai", {}), internal("monitor-ai", {})]);
  assert.equal(
    nimCalls - before,
    1,
    "concurrent requests must not exceed the global budget",
  );
  const after = nimCalls;
  assert.equal((await internal("monitor-ai", {})).status, 200);
  assert.equal(
    nimCalls,
    after,
    "cached results remain available after quota is exhausted",
  );
  assert.equal(
    (
      await db
        .prepare(
          "SELECT count FROM quotas WHERE day=date('now') AND bucket='nim'",
        )
        .first()
    ).count,
    40,
  );
  await req("/api/auth/logout", {}, { Cookie: session });
  assert.equal(
    (await (await req("/api/auth/me", undefined, { Cookie: session })).json())
      .user,
    null,
  );
  console.log(
    "Worker integration passed: actual D1, atomic publication, idempotence, OAuth state/session/CSRF, NIM cache/quotas, logout",
  );
} finally {
  await mf.dispose();
}
