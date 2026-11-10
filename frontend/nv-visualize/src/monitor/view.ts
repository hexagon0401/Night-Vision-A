import { accountControl, readSession } from "../ui/controls";
import { createMap, type MapPort } from "../map/renderer";
interface EventRecord {
  id: string;
  country: string;
  day: string;
  end_day?: string;
  title: string;
  kind: string;
  precision?: number;
  lat: number | null;
  lon: number | null;
  low?: number | null;
  best?: number | null;
  high?: number | null;
  version?: string;
  upstream_estimates?: {low: number|null; best:number|null; high:number|null};
  fatality_validation?:string;
  source_url: string;
  acquired_at?: string;
  hash: string;
}
const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  value = "",
  cls = "",
) => {
  const e = document.createElement(tag);
  e.textContent = value;
  e.className = cls;
  return e;
};
const link = (label: string, href: string) => {
  const e = el("a", label);
  e.href = href;
  return e;
};
async function api(path: string, body?: unknown) {
  const r = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) {
    const messages: Record<string, string> = {
      database_not_configured: "데이터베이스 연결이 필요합니다.",
      github_login_required: "GitHub 로그인이 필요합니다.",
      github_not_configured: "GitHub 로그인 앱 연결이 필요합니다.",
      nim_not_enabled: "NIM 키 등록과 무료 API 활성화가 필요합니다.",
      nim_quota_or_model_unavailable:
        "모델 접근 권한 또는 무료 한도를 확인하세요.",
      nim_quota_or_access_paused:
        "무료 한도 또는 접근 오류로 오늘의 새 AI 호출이 중단됐습니다.",
      nim_truncated_response: "AI 응답이 길이 한도에서 잘렸습니다. 기존 통계 탐지는 유지됩니다.",
      invalid_ai_response: "AI 응답 형식을 검증하지 못했습니다. 결과를 채택하지 않았습니다.",
      nim_transport_failure: "NIM 연결이 지연되거나 중단됐습니다. 기존 통계 탐지는 유지됩니다.",
      monitor_data_unavailable: "먼저 공급원의 정상 자료 수집이 필요합니다.",
      ai_daily_budget_exhausted: "오늘의 AI 사용 한도에 도달했습니다.",
      service_unavailable:
        "서비스 연결을 확인할 수 없습니다. 기존 자료는 유지됩니다.",
    };
    throw new Error(
      messages[d.error] ??
        "요청을 처리할 수 없습니다. 잠시 후 다시 시도하세요.",
    );
  }
  return d;
}
function stateLabel(value:string) {
 return ({complete:'정상 완료',running:'실행 중',failed:'실패',skipped:'건너뜀',setup_required:'설정 필요',backfill_pending:'초기 자료 수집 진행 중',available:'응답 검증 완료',responded:'응답 수신 · 검증 전',unavailable:'사용 불가'} as Record<string,string>)[value]??value;
}
function failureLabel(value:string) {
 return ({ucdp_auth_rejected:'UCDP 토큰이 거부됐습니다. GitHub 감시 작업의 UCDP_ACCESS_TOKEN을 확인하세요.',ucdp_version_unavailable:'설정한 UCDP 자료 버전을 찾지 못했습니다.',ucdp_rate_limited:'UCDP 요청 한도에 도달했습니다.',ucdp_upstream_failure:'UCDP 제공기관 응답 오류',nim_truncated_response:'AI 응답이 출력 한도에서 잘림',nim_quota_or_model_unavailable:'모델 접근 권한 또는 무료 한도 문제',nim_transport_failure:'NIM 연결 지연 또는 중단',invalid_ai_response:'AI 응답 형식 검증 실패','UCDP_ACCESS_TOKEN and NV_UCDP_ENABLED=true required':'GitHub 저장소의 비밀 설정에 UCDP_ACCESS_TOKEN을 등록해야 합니다.','RSS not enabled; metadata terms review required':'RSS 연결과 이용 조건 검토가 필요합니다.','next run resumes saved page; last published data retained':'다음 회차에서 이어받습니다. 이전 정상 자료는 유지됩니다.'} as Record<string,string>)[value]??value;
}
function when(value: string | null) {
  return value
    ? new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) +
        " KST"
    : "아직 없음";
}

export function mountMonitor(
  root: HTMLElement,
  factory: typeof createMap = createMap,
): () => void {
  root.innerHTML =
    '<main class="workspace monitor"><div class="map" role="region" aria-label="세계 분쟁 지도"></div><header class="topbar"><a class="brand" href="/?view=monitor"><img src="/branding/night-vision-logo.png" alt="네 렌즈의 NV 헬멧"/><span>NIGHT VISION<small>출처 기반 지속 감시</small></span></a><nav aria-label="감시 도구"></nav></header><div class="map-message" role="status"></div><section class="monitor-panel" aria-label="감시 현황"></section><section class="monitor-evidence" aria-label="사건 상세" hidden></section><footer class="statusbar"><span>REPORTED · UNCALIBRATED</span><span>OpenFreeMap · OpenStreetMap</span></footer></main>';
  const panel = root.querySelector<HTMLElement>(".monitor-panel")!,
    detail = root.querySelector<HTMLElement>(".monitor-evidence")!,
    nav = root.querySelector("nav")!,
    message = root.querySelector<HTMLElement>(".map-message")!;
  const notice = el('button','감시 연결 확인 중…','monitor-notice');
  notice.setAttribute('aria-label','감시 상태 확인');
  notice.onclick=()=>{panel.hidden=false;};
  root.querySelector('main')!.append(notice);
  let records: EventRecord[] = [],
    cases: { id: string; country: string }[] = [],
    selected: EventRecord | null = null,
    destroyed = false,
    user: any = null;
  const map = factory(root.querySelector<HTMLElement>(".map")!, {
    pick: () => {},
    move: () => {},
    dismiss: () => {},
    ready: () => {},
    error: () => {
      message.textContent = "지도 연결을 확인하세요.";
    },
    basemap: (detailed) => {
      message.hidden = detailed;
      message.textContent = detailed
        ? ""
        : "상세 지도 연결 실패 · 윤곽 지도 표시 중";
    },
    event: (id) => {
      const r = records.find((r) => r.id === id);
      if (r) showEvent(r);
    },
  });
  const button = (name: string, action: () => void) => {
    const b = el("button", name);
    b.onclick = action;
    return b;
  };
  panel.hidden = true;
  const accountCleanup = accountControl(nav);
  nav.append(
    link("합성 실험", "/?case=synthetic"),
    link("USGS Alpha", "/?case=alpha"),
    button("현황", () => {
      panel.hidden = !panel.hidden;
    }),
    button("새로고침", () => void refresh()),
    button("NIM 연결 진단", () => {
      if (!user) {
        message.hidden = false;
        message.textContent =
          "GitHub 로그인 후 허용 계정으로 진단할 수 있습니다.";
        return;
      }
      message.hidden = false;
      message.textContent = "NIM 연결 진단 중…";
      void api("/api/v2/admin/nim-test", {})
        .then((d) => {
          message.textContent = "NIM 연결 정상 · " + d.model;
        })
        .catch((e) => {
          message.textContent = "NIM 연결 상태: " + e.message;
        });
    }),
  );
  const utility = document.createElement("details");
  utility.className = "utility-menu";
  const utilityTitle = el("summary", "메뉴"),
    utilityItems = el("div", "", "menu-items");
  const account = nav.querySelector(".account-control");
  for (const node of Array.from(nav.children))
    if (node !== account && node.textContent !== "현황")
      utilityItems.append(node);
  utility.append(utilityTitle, utilityItems);
  utilityItems.append(link('베타 비교','/?view=beta'));
  nav.append(utility);
  if (account) nav.append(account);
  const country = document.createElement("select");
  country.setAttribute("aria-label", "국가 선택");
  const all = el("option", "전 세계");
  all.value = "";
  country.append(all);
  const from = document.createElement("input");
  from.type = "date";
  from.setAttribute("aria-label", "시작일");
  const to = document.createElement("input");
  to.type = "date";
  to.setAttribute("aria-label", "종료일");
  const filters = el("div", "", "monitor-filters");
  filters.append(
    country,
    from,
    to,
    button("조회", () => void loadEvents()),
  );
  const resultList = el("div", "", "monitor-events"),
    status = el("div", "", "monitor-status"),
    summary = el("div", "", "monitor-summary");
  panel.append(
    el("h1", "세계 분쟁 감시"),
    status,
    filters,
    summary,
    resultList,
  );
  const updateMap = () =>
    map.update({
      candidates: [],
      links: [],
      selected: null,
      showMarkers: true,
      showLinks: false,
      events: records
        .filter(
          (r): r is EventRecord & { lat: number; lon: number } =>
            r.lat !== null && r.lon !== null,
        )
        .map((r) => ({
          id: r.id,
          lat: r.lat,
          lon: r.lon,
          precision: r.precision ?? 7,
        })),
    });
  function displayAI(parent: HTMLElement, data: any) {
    parent.replaceChildren();
    const result = data?.result;
    if (!result) {
      parent.append(
        el(
          "p",
          "AI 요약이 아직 없습니다. 자료 조회와 규칙 기반 감시는 계속 사용할 수 있습니다.",
        ),
      );
      return;
    }
    parent.append(
      el(
        "p",
        `AI 해석 · ${data.model ?? ""} · 분석 ${when(data.analyzed_at)}${data.cached ? " · 재사용" : ""}`,
        "muted",
      ),
    );
    for (const [key, label] of [
      ["summary", "요약"],
      ["alternatives", "대안 설명"],
      ["counterevidence", "반증 검토"],
      ["unknowns", "미확인 사항"],
    ]) {
      const values = result[key] ?? [];
      if (values.length) {
        parent.append(el("h3", label));
        for (const item of values) {
          parent.append(el("p", item.text));
          parent.append(
            el("small", "출처: " + (item.source_ids ?? []).join(", ")),
          );
        }
      }
    }
    if(data.fallback_reason) parent.append(el('p',`분석 모델 대체: ${data.requested_model} → ${data.model}. 같은 모델을 분석과 검토에 사용한 경우 두 결과의 일치는 독립 검증이 아닙니다.`));
    parent.append(
      el(
        "p",
        "AI 해석은 독립 검증이나 사실 확정을 의미하지 않습니다.",
        "muted",
      ),
    );
  }
  function showEvent(r: EventRecord) {
    selected = r;
    detail.hidden = false;
    detail.replaceChildren(
      button("닫기", () => {
        detail.hidden = true;
      }),
      el("h2", r.title),
    );
    detail.append(
      el(
        "p",
        `${r.country} · ${r.day}${r.end_day && r.end_day !== r.day ? " ~ " + r.end_day : ""}`,
      ),
      el("p", `자료: ${r.kind.toUpperCase()} ${r.version ?? ""} · REPORTED`),
    );
    if (r.kind === "ucdp")
      detail.append(
        el(
          "p",
          `사망자 추정: 최저 ${r.low ?? "미상"} / 최적 ${r.best ?? "미상"} / 최고 ${r.high ?? "미상"}`,
        ),
      );
    if(r.fatality_validation==='invalid_provider_estimates') detail.append(el('p',`원본 사망자 추정값을 유효한 범위로 확정할 수 없어 사망자 집계에서 제외했습니다. 원본 보존: ${JSON.stringify(r.upstream_estimates)}. 미상으로 처리하며 0명으로 바꾸지 않습니다.`));
    detail.append(
      el(
        "p",
        r.lat === null
          ? "위치 미상"
          : r.precision === 1
            ? "제공기관 보고 지점 · 독립 현장검증 아님"
            : "대략적 보고 위치 · 원의 크기는 실제 오차 범위가 아닙니다.",
      ),
    );
    detail.append(
      el("p", "수집: " + when(r.acquired_at ?? null)),
      el("small", "원본 해시: " + r.hash),
    );
    try {
      const url = new URL(r.source_url);
      if (url.protocol === "https:" && !url.username && !url.password) {
        const a = link("원문·제공기관", url.href);
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        detail.append(a);
      }
    } catch {}
    const c = cases.find((c) => c.country === r.country);
    if (c) {
      detail.append(
        link("관련 추이·Trace", "/?case=live&id=" + encodeURIComponent(c.id)),
      );
      const result = el("div");
      detail.append(
        button("AI 분석", () => {
          if (!user) {
            result.textContent =
              "GitHub 로그인 후 허용된 계정으로 분석할 수 있습니다.";
            return;
          }
          result.textContent = "자료 기반 분석 중…";
          void api("/api/v2/ai/analyze", { case_id: c.id })
            .then((d) => displayAI(result, d))
            .catch((e) => {
              result.textContent = "AI 사용 불가: " + e.message;
            });
        }),
        result,
      );
    }
    if (r.lat !== null && r.lon !== null) map.focus([[r.lon, r.lat]]);
  }
  async function loadEvents() {
    const params = new URLSearchParams();
    if (country.value) params.set("country", country.value);
    if (from.value) params.set("from", from.value);
    if (to.value) params.set("to", to.value);
    try {
      const d = await api("/api/v2/events?" + params);
      if (destroyed) return;
      records = d.records;
      updateMap();
      resultList.replaceChildren(
        el(
          "p",
          `${records.length}건${d.limited ? " · 표시 제한 있음, 국가·기간을 좁혀주세요." : ""}`,
        ),
      );
      for (const r of records)
        resultList.append(button(`${r.day} · ${r.title}`, () => showEvent(r)));
      if (!records.length)
        resultList.append(
          el(
            "p",
            "해당 범위에 게시된 자료가 없습니다. 사건이 없다는 뜻은 아닙니다.",
          ),
        );
    } catch (e) {
      resultList.textContent = "자료 조회 불가: " + (e as Error).message;
    }
  }
  async function refresh() {
    try {
      const [d, overview, caseData, me, s] = await Promise.all([
        api("/api/v2/status"),
        api("/api/v2/overview").catch(() => ({ countries: [] })),
        api("/api/v2/cases").catch(() => ({ cases: [] })),
        readSession(),
        api("/api/v2/monitor-summary").catch(() => ({ result: null })),
        loadEvents(),
      ]);
      if (destroyed) return;
      status.replaceChildren(
        el(
          "p",
          `하루 ${d.runs_per_day}회 · 마지막 성공 ${when(d.last_success)}`,
        ),
        el(
          "p",
          `다음 예정 ${when(d.next_scheduled_at)} · 예약 실행은 지연될 수 있습니다.`,
        ),
      );
      if (d.stale)
        status.append(
          el("p", "정상 분석이 없거나 5시간 이상 지났습니다.", "muted"),
        );
      if (d.unconfirmed_slots?.length)
        status.append(
          el(
            "p",
            `최근 24시간 실행 기록 미확인 ${d.unconfirmed_slots.length}회 · 비활성화·지연·누락 여부를 실행 이력에서 확인하세요.`,
            "muted",
          ),
        );
      for (const p of d.providers) {
        const m = p.metadata;
        status.append(
          el(
            "p",
            `${p.provider}: ${m.coverage_start ?? "?"} ~ ${m.coverage_end ?? "?"} · ${m.records ?? "?"}건${m.limited ? " · 보유 범위 제한" : ""}`,
          ),
        );
      }
      if (!d.providers.length)
        status.append(el("p", "공급원 연결·최초 수집 대기 중입니다."));
      const invalidEstimates=d.providers.reduce((n:number,p:any)=>n+(p.metadata.invalid_fatality_estimates??0),0);
      if(invalidEstimates) status.append(el('p',`사망자 추정값 미확정 ${invalidEstimates}건 · 미상으로 집계하며 원본 값은 보존합니다.`));
      const lastRun=d.runs?.[0];
      notice.textContent = !d.providers.length ? '수집 대기 · 현황에서 연결 확인' : d.stale ? '자료 갱신 지연 · 현황 확인' : '감시 자료 게시됨 · 현황 확인';
      if (!d.providers.length) {
        status.append(el('p','현재 지도에 사건이 없는 이유는 최초 수집이 완료되지 않았기 때문입니다.'));
        const workflow=link('GitHub 감시 실행·설정 열기','https://github.com/hexagon0401/Night-Vision-A/actions/workflows/monitor.yml');
        workflow.target='_blank';workflow.rel='noopener noreferrer';status.append(workflow);
      }
      for (const [provider,value] of Object.entries(lastRun?.providers??{})) {
        const p=value as {state:string;reason?:string};
        status.append(el('p',`${provider}: ${stateLabel(p.state)} · ${failureLabel(p.reason??'')}`));
      }
      status.append(el('p',!d.ai_enabled?'AI 비활성 · 통계 탐지는 별도로 동작합니다.':!d.ai_health?.length?'AI 키 등록됨 · 실제 모델 연결은 아직 검증 전입니다.':'AI 연결 상태'));
      for(const h of d.ai_health??[]) status.append(el('p',`${h.model}: ${stateLabel(h.state)} · ${failureLabel(h.error??'응답 확인')} · ${when(h.checked_at)}`));
      const history = el("details");
      history.append(el("summary", "최근 감시 실행 이력"));
      for (const r of d.runs)
        history.append(
          el("p", `${when(r.started)} · ${stateLabel(r.state)} · ${failureLabel(r.error ?? "")}`),
        );
      status.append(history);

      const previous = country.value;
      country.replaceChildren(all);
      for (const r of overview.countries) {
        const o = el("option", `${r.country} (${r.events})`);
        o.value = r.country;
        country.append(o);
      }
      country.value = previous;
      cases = caseData.cases;
      user = me.user;
      displayAI(summary, s.result);
      if(s.statistical) {
        const stat=s.statistical;
        summary.prepend(el('h3','통계 기반 현황 · AI와 별도'),el('p',stat.providers.length?`게시 자료 ${stat.records}건 · 이상징후 후보 ${stat.candidates}개`:'최초 수집 대기 중'),el('p',stat.note));
      }
    } catch (e) {
      if (!destroyed) {
        notice.textContent="감시 연결 오류 · 현황 확인";
        status.replaceChildren(
          el("p", "운영 기능 설정 대기: " + (e as Error).message),
          link("키·데이터베이스 설정 안내", "/setup.html"),
        );
      }
    }
  }
  void refresh();
  const timer = setInterval(() => void refresh(), 300000);
  const authChanged = () => void refresh();
  window.addEventListener("nv:auth-change", authChanged);
  return () => {
    destroyed = true;
    clearInterval(timer);
    window.removeEventListener("nv:auth-change", authChanged);
    accountCleanup();
    map.destroy();
  };
}
