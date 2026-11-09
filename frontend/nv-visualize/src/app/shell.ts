import { traceView } from "../trace/view";
import { sceneLinks } from "../cases/model";
import type { Frame } from "../trace/player";
import type { Source } from "../contracts/generated";
import {
  candidates,
  candidateLinks,
  evidenceSources,
  safeSourceUrl,
  type CasePayload,
  type Candidate,
} from "../cases/model";
import { createMap, type MapPort, type MapCallbacks } from "../map/renderer";
function text<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  value: string,
  className = "",
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.textContent = value;
  e.className = className;
  return e;
}
function button(label: string, action: () => void, aria?: string) {
  const e = text("button", label);
  e.type = "button";
  if (aria) e.setAttribute("aria-label", aria);
  e.onclick = action;
  return e;
}
export function mount(
  root: HTMLElement,
  payload: CasePayload,
  factory: typeof createMap = createMap,
): () => void {
  const base = import.meta.env.BASE_URL;
  const items = candidates(payload),
    links = candidateLinks(payload);
  const state: {
    selected: Candidate | null;
    panel: "cases" | "sources" | "layers" | "trace-sources" | "export" | null;
    pinned: boolean;
    query: string;
    markers: boolean;
    links: boolean;
  } = {
    selected: null,
    panel: null,
    pinned: false,
    query: "",
    markers: true,
    links: false,
  };
  root.innerHTML = `<main class="workspace" aria-label="Night Vision 탐색"><div class="map" role="region" aria-label="지정학 지도"></div>
 <header class="topbar"><a class="brand" href="${base}" aria-label="Night Vision 홈"><img src="${base}branding/night-vision-logo.png" alt="네 개 렌즈의 NV 헬멧"/><span>NIGHT VISION<small>CONTEXT THROUGH EVIDENCE</small></span></a><nav aria-label="지도 도구"><span class="mode">Explore</span><button class="trace">Trace</button><input type="search" aria-label="후보 검색" placeholder="Search candidates"/><button data-panel="cases">Cases</button><button data-panel="layers">Layers</button><button data-panel="sources">Sources</button><button data-panel="export">Export</button></nav></header>
 <div class="demo-label">SYNTHETIC DATA <span>· 합성 탐지 실험</span></div><div class="map-message" role="status">지도를 불러오는 중입니다.</div>
 <section class="tool-panel" aria-label="탐색 도구" hidden></section><section class="evidence" aria-label="후보 증거" hidden></section>
 <footer class="statusbar"><span><span data-mode>OFFLINE DEMO</span> <b>·</b> <span data-count></span></span><span class="footer-detail">UNCALIBRATED <b>·</b> EXPLORE</span><span>Natural Earth · WGS84</span></footer></main>`;
  const panel = root.querySelector<HTMLElement>(".tool-panel")!,
    evidence = root.querySelector<HTMLElement>(".evidence")!,
    message = root.querySelector<HTMLElement>(".map-message")!;
  let map: MapPort;
  let currentFrame: Frame | null = null;
  let previousStep = "";
  const trace = traceView(
    root,
    (frame) => {
      currentFrame = frame;
      const target = frame.step.camera_target;
      if (previousStep !== frame.step.step_id) {
        previousStep = frame.step.step_id;
        if (target)
          map.focus([[target.longitude, target.latitude]], frame.playing);
      }
      updateMap();
    },
    () => map.stop?.(),
    () => {
      state.panel = "trace-sources";
      render();
    },
    () => {
      trace.close();
      state.panel = null;
      currentFrame = null;
      previousStep = "";
      render();
    },
  );
  function updateMap() {
    map.update({
      events: payload.map_context,
      candidates: currentFrame
        ? filtered().filter(
            (item) =>
              item.anomaly.anomaly_id === state.selected?.anomaly.anomaly_id,
          )
        : filtered(),
      links,
      selected: state.selected?.anomaly.anomaly_id ?? null,
      showMarkers: state.markers,
      showLinks: state.links,
      trace: currentFrame
        ? {
            paths: sceneLinks(
              payload,
              currentFrame.step.visible_relation_ids ?? [],
            ),
            progress: currentFrame.progress,
            point: currentFrame.step.camera_target
              ? [
                  currentFrame.step.camera_target.longitude,
                  currentFrame.step.camera_target.latitude,
                ]
              : null,
          }
        : undefined,
    });
  }
  const filtered = () =>
    items.filter((item) =>
      (item.name + " " + item.anomaly.detector)
        .toLowerCase()
        .includes(state.query.toLowerCase()),
    );
  const position = () => {
    if (!state.selected || state.pinned) return;
    const bounds = root.getBoundingClientRect();
    const p = state.selected.point
      ? map.project(state.selected.point)
      : { x: bounds.width / 2, y: bounds.height / 2 };
    const width = Math.min(340, bounds.width - 32);
    evidence.style.left = `${Math.max(16, Math.min(p.x + 18, bounds.width - width - 16))}px`;
    evidence.style.top = `${Math.max(120, Math.min(p.y - 40, bounds.height - evidence.offsetHeight - 64))}px`;
  };
  const close = () => {
    state.selected = null;
    state.pinned = false;
    render();
  };
  const select = (item: Candidate) => {
    if (currentFrame) {
      trace.close();
      currentFrame = null;
      previousStep = "";
    }
    state.selected = item;
    state.panel = null;
    state.pinned = false;
    render();
    map.focus(
      item.points.length ? item.points : item.point ? [item.point] : [],
    );
  };
  const callbacks: MapCallbacks = {
    basemap(detailed) {
      message.hidden = detailed;
      if (!detailed) message.textContent = '상세 지도 연결 실패 · 윤곽 지도로 표시 중입니다. 도로·지명은 연결 복구 후 표시됩니다.';
      const credit = root.querySelector('.statusbar > span:last-child');
      if (credit) credit.textContent = detailed ? 'OpenFreeMap · OpenStreetMap · WGS84' : 'Natural Earth · 윤곽 지도';
    },
    pick(ids) {
      const group = items.filter((item) =>
        ids.includes(item.anomaly.anomaly_id),
      );
      if (group.length === 1) select(group[0]);
      else {
        state.panel = "cases";
        state.selected = null;
        render();
        map.focus(group.flatMap((item) => (item.point ? [item.point] : [])));
      }
    },
    move: () => position(),
    ready: () => {
      message.hidden = true;
      root.dataset.ready = "true";
      if(payload.map_context?.length)map.focus(payload.map_context.map(r=>[r.lon,r.lat]),false);
    },
    error: () => {
      message.hidden = false;
      message.textContent =
        "지도를 표시할 수 없습니다. Cases에서 후보 증거를 열 수 있습니다.";
    },
    dismiss: () => {
      if (!currentFrame && state.selected && !state.pinned) close();
    },
  };
  map = factory(root.querySelector<HTMLElement>(".map")!, callbacks);
  function renderSources(
    container: HTMLElement,
    sources: Source[] = payload.case.sources,
  ) {
    for (const source of sources) {
      const d = text("details", "", "source-record");
      d.append(
        text(
          "summary",
          `${source.publisher} · ${source.source_id.split(":").at(-1)?.slice(0, 8)}`,
        ),
        text("p", `발행 계열 · ${source.publisher_family}`),
        text("p", source.license),
        text(
          "code",
          `Published UTC: ${source.published_at_utc ?? "unknown"} / Retrieved UTC: ${source.retrieved_at_utc}`,
        ),
      );
      const url = safeSourceUrl(source.url);
      if (url && payload.case.data_origin !== "synthetic") {
        const a = text("a", "원문 열기");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        d.append(a);
      } else
        d.append(text("p", "SYNTHETIC SOURCE · 실제 출처 연결 없음", "muted"));
      d.append(
        text("code", source.source_id),
        text("code", `SHA256 ${source.content_hash}`),
      );
      container.append(d);
    }
  }
  function render() {
    root.querySelector(".demo-label")!.textContent =
      payload.case.data_origin === "synthetic"
        ? "SYNTHETIC DATA · 합성 탐지 실험"
        : payload.case.case_id.startsWith('case:ucdp:') ? 'UCDP · 보고 자료 · 날짜별 집계 · UNCALIBRATED' : "SOURCE-BACKED ALPHA · USGS Taiwan · uncalibrated";
    root.querySelector("[data-mode]")!.textContent =
      payload.case.data_origin === "synthetic"
        ? "OFFLINE DEMO"
        : payload.case.case_id.startsWith('case:ucdp:') ? 'SOURCE-BACKED UCDP' : "ARCHIVED ALPHA";
    root.querySelector("[data-count]")!.textContent =
      `${filtered().length} CANDIDATES · ${payload.case.sources.length} SOURCES`;
    root
      .querySelectorAll<HTMLButtonElement>("[data-panel]")
      .forEach((e) =>
        e.setAttribute(
          "aria-expanded",
          String(state.panel === e.dataset.panel),
        ),
      );
    panel.replaceChildren();
    panel.hidden = !state.panel;
    if (state.panel) {
      const top = text("div", "", "card-heading");
      top.append(
        text(
          "h2",
          state.panel === "cases"
            ? "탐지 후보"
            : state.panel === "sources" || state.panel === "trace-sources"
              ? "출처"
              : "레이어",
        ),
        button(
          "×",
          () => {
            state.panel = null;
            render();
          },
          "도구 닫기",
        ),
      );
      panel.append(top);
      if (state.panel === "cases") {
        panel.append(text("p", "미보정 관측 패턴 · 근거 확인 필요", "muted"));
        for (const item of filtered()) {
          const entry = button("", () => select(item));
          entry.className = "candidate-row";
          entry.dataset.candidateId = item.anomaly.anomaly_id;
          entry.append(
            text("strong", item.name),
            text(
              "small",
              `${item.anomaly.detector} · ${item.point ? "관측 위치 있음" : "DATA GAP · 위치 없음"}`,
            ),
          );
          panel.append(entry);
        }
        if (!filtered().length)
          panel.append(text("p", "검색에 맞는 후보가 없습니다."));
      }
      if (state.panel === "sources" || state.panel === "trace-sources") {
        panel.append(
          text(
            "p",
            payload.case.data_origin === "synthetic"
              ? "SYNTHETIC DATA · 출처·위치는 합성 입력입니다."
              : payload.case.case_id.startsWith('case:ucdp:') ? 'UCDP 보고 자료 · 집계 경계는 사건 시각이 아닙니다. 통계 후보는 미보정입니다.' : "USGS 공식 자료 · 통계 후보는 미보정입니다.",
            "muted",
          ),
        );
        const ids =
          state.panel === "trace-sources" && currentFrame
            ? new Set(
                payload.case.claims
                  ?.filter((c) =>
                    currentFrame!.step.evidence_claim_ids.includes(c.claim_id),
                  )
                  .flatMap((c) => c.provenance.source_ids),
              )
            : null;
        renderSources(
          panel,
          ids
            ? payload.case.sources.filter((s) => ids.has(s.source_id))
            : payload.case.sources,
        );
      }
      if (state.panel === "layers") {
        for (const [name, label] of [
          ["markers", "후보 마커"],
          ["links", "후보 관계 · INFERRED"],
        ] as const) {
          const row = text("label", "", "check-row");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = state[name];
          checkbox.onchange = () => {
            state[name] = checkbox.checked;
            render();
          };
          row.append(checkbox, document.createTextNode(label));
          panel.append(row);
        }
        panel.append(
          text("p", "관계선: 회색 점선 · 시공간 동시 관측 후보", "muted"),
          text("p", "통계 후보 점수는 확률이 아닙니다.", "muted"),
        );
      }
    }
    if (state.panel === "export") {
      panel.querySelector("h2")!.textContent = "Foundry CSV Bundle";
      panel.append(
        text(
          "p",
          "추론·시나리오는 기본 제외됩니다. ZIP의 검증 보고서와 출처 정보를 먼저 확인하세요.",
          "muted",
        ),
      );
      const include = document.createElement("input");
      include.type = "checkbox";
      const label = text("label", "", "check-row");
      label.append(include, document.createTextNode("추론·시나리오 포함"));
      panel.append(label);
      const link = text("a", "Download Foundry CSV ZIP");
      link.className = "export-download";
      link.download = "";
      const kind =
        payload.case.data_origin === "synthetic" ? "synthetic" : "alpha";
      const live=payload.case.case_id.startsWith('case:ucdp:');
      const update = () =>
        (link.href = live?`/api/v2/cases/${encodeURIComponent(payload.case.case_id)}/export?scope=${include.checked?'all':'observed'}`:`${base}exports/${kind}-${include.checked ? "all" : "observed"}.zip`);
      include.onchange = update;
      update();
      panel.append(
        link,
        text(
          "p",
          "실제 Foundry 업로드·온톨로지 생성은 별도 검증이 필요합니다.",
          "muted",
        ),
      );
    }
    evidence.hidden = !state.selected || currentFrame !== null;
    evidence.replaceChildren();
    evidence.classList.toggle("pinned", state.pinned);
    if (state.selected && !currentFrame) {
      const item = state.selected;
      const top = text("div", "", "card-heading");
      top.append(text("h2", item.name), button("×", close, "증거 닫기"));
      evidence.append(
        top,
        text("p", "INFERRED · UNCALIBRATED", "eyebrow"),
        text("p", "근거 확인이 필요한 미보정 관측 패턴입니다."),
      );
      const date = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(item.anomaly.window_end_utc));
      evidence.append(
        text("p", `${date} KST`, "muted"),
        text(
          "p",
          `근거 관측 ${item.anomaly.observation_ids.length} · 출처 ${item.sourceIds.length} · 발행 계열 ${new Set(evidenceSources(payload, item).map((s) => s.publisher_family)).size} · 신뢰도 UNKNOWN`,
          "muted",
        ),
      );
      if (!item.point)
        evidence.append(
          text(
            "p",
            "DATA GAP · 최신 관측 위치가 확인되지 않았습니다.",
            "data-gap",
          ),
        );
      if (item.anomaly.detector === "spatial-component")
        evidence.append(
          text("p", "마커는 구성 관측점 중 하나를 표시합니다.", "muted"),
        );
      const method = text("details", "", "method");
      method.append(
        text("summary", "분석 근거"),
        text("p", item.anomaly.baseline_description),
        text("code", item.anomaly.anomaly_id),
      );
      evidence.append(method);
      renderSources(evidence, evidenceSources(payload, item));
      const pin = button(
        state.pinned ? "고정 해제" : "증거 고정",
        () => {
          state.pinned = !state.pinned;
          render();
        },
        "증거 고정 전환",
      );
      pin.setAttribute("aria-pressed", String(state.pinned));
      pin.className = "pin";
      evidence.append(pin);
      if (state.pinned) {
        evidence.style.left = "";
        evidence.style.top = "";
      } else position();
    }
    updateMap();
  }
  root.querySelectorAll<HTMLButtonElement>("[data-panel]").forEach(
    (e) =>
      (e.onclick = () => {
        const next = e.dataset.panel as typeof state.panel;
        state.panel = state.panel === next ? null : next;
        state.selected = null;
        state.pinned = false;
        render();
      }),
  );
  root.querySelector<HTMLInputElement>('input[type="search"]')!.oninput = (
    e,
  ) => {
    state.query = (e.target as HTMLInputElement).value;
    render();
  };
  root.querySelector<HTMLButtonElement>(".trace")!.onclick = () => {
    const item = state.selected ?? items[0];
    if (!item) return;
    const narrative = payload.case.narratives?.find(
      (n) => n.anomaly_id === item.anomaly.anomaly_id,
    );
    if (narrative) {
      state.selected = item;
      state.panel = null;
      trace.start(narrative);
      render();
    }
  };
  const escape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      trace.pause();
      state.panel = null;
      if (!currentFrame) state.selected = null;
      state.pinned = false;
      render();
    }
  };
  window.addEventListener("keydown", escape);
  window.addEventListener("resize", position);
  render();
  return () => {
    window.removeEventListener("keydown", escape);
    window.removeEventListener("resize", position);
    trace.destroy();
    map.destroy();
  };
}
