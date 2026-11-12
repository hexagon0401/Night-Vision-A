import {mountOntology,isMappedLegacyEvent} from './ontology/workbench';
import {readEvidenceMap} from './evidence-map';
import {enginePanel} from './engine-panel';
import {layerControl,type LayerPoint} from './layers';
import {mountNearby} from "./nearby";
import {contextDrawer} from "./context/drawer";
import { accountControl, readSession } from "../ui/controls";
import { createMap, type MapPort } from "../map/renderer";
import {icon} from "../ui/controls";
import {X, ArrowUpRight, MapPin, CalendarDays, Users, ShieldCheck, FileText, ChevronRight, BrainCircuit, Activity} from "lucide";
import {type EventRecord,type EventPalette,eventAppearance,eventMagnitude,eventPeriod,conflictLabel,magnitudeLabels} from "./events";
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
function readPreference(key:string,allowed:string[],fallback:string) {try{const value=localStorage.getItem(key);return value&&allowed.includes(value)?value:fallback;}catch{return fallback;}}
function savePreference(key:string,value:string) {try{localStorage.setItem(key,value);}catch{}}
function stateLabel(value:string) {
 return ({complete:'정상 완료',running:'실행 중',failed:'실패',skipped:'건너뜀',setup_required:'설정 필요',backfill_pending:'초기 자료 수집 진행 중',available:'응답 검증 완료',responded:'응답 수신 · 검증 전',unavailable:'사용 불가',withheld:'근거 검증 보류'} as Record<string,string>)[value]??value;
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
  notice.onclick=()=>{panel.hidden=false;setPanelTab('overview');};
  root.querySelector('main')!.append(notice);
  let ontologyUI:ReturnType<typeof mountOntology>|null=null;let ontologyFeatures:import("geojson").FeatureCollection<import("geojson").Geometry>={type:"FeatureCollection",features:[]};let ontologySelection:string|null=null;let ontologyEnabled=false;
  let disposeContext=()=>{};let disposeEngine=()=>{};let evidenceFeatures:import("geojson").Feature<import("geojson").Geometry>[]=[];let layerEvents=true;let layerPoints:LayerPoint[]=[];let layerFootprints:any[]=[];
  let nearbyItems:{id:string;lat:number;lon:number;kind:string}[]=[];
  let disposeNearby=()=>{};
  let records: EventRecord[] = [],
    cases: { id: string; country: string }[] = [],
    selected: EventRecord | null = null,
    palette: EventPalette = readPreference("nv-event-palette", ["red","amber","mono"], "red") as EventPalette,
    markerScale = Number(readPreference("nv-event-scale", ["0.8","1","1.3"], "1")),
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
    object:(props)=>ontologyUI?.selectFeature(props),
    nearby:(id)=>root.querySelector('main')?.dispatchEvent(new CustomEvent('nv:nearby-pick',{detail:id})),
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
      disposeNearby();
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
  const mapImport=document.createElement('input');mapImport.type='file';mapImport.accept='.json,application/json';mapImport.hidden=true;mapImport.setAttribute('aria-label','NV2 근거 지도 JSON');mapImport.onchange=async()=>{const file=mapImport.files?.[0];if(!file)return;message.hidden=false;try{if(file.size>2000000)throw Error('2MB 이하 JSON을 선택하세요.');evidenceFeatures=readEvidenceMap(JSON.parse(await file.text()));updateMap();message.textContent=`근거 지도 ${evidenceFeatures.length}개 표시 · 파일 출처는 별도 검증 필요`;}catch(e){message.textContent=(e as Error).message;}mapImport.value='';};utilityItems.append(button('NV2 근거 지도 가져오기',()=>mapImport.click()),mapImport,button('가져온 근거 지도 지우기',()=>{evidenceFeatures=[];updateMap();}));
  const nearbyButton=button('주변 현황',()=>{panel.hidden=true;detail.hidden=true;disposeNearby();const opened=mountNearby(root.querySelector('main')!,map,(items)=>{nearbyItems=items;updateMap();});disposeNearby=opened;});
  nav.append(nearbyButton,utility);
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
  const panelHeader=el('div','','inspector-header');const panelClose=button('현황 닫기',()=>{panel.hidden=true;});panelClose.className='icon-button';panelClose.prepend(icon(X));panelHeader.append(el('h1','세계 분쟁 감시'),panelClose);
  const tabs=el('div','','monitor-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','감시 패널');
  const overviewPane=el('div'),eventsPane=el('div'),aiPane=el('div'),statistics=el('div','','monitor-statistics');
  const panes={overview:overviewPane,events:eventsPane,ai:aiPane};
  function setPanelTab(name:keyof typeof panes){for(const [key,pane] of Object.entries(panes)){pane.hidden=key!==name;const tab=tabs.querySelector<HTMLButtonElement>(`[data-tab="${key}"]`);if(tab){tab.setAttribute('aria-selected',String(key===name));tab.tabIndex=key===name?0:-1;}}panel.scrollTop=0;}
  for(const [key,label] of [['overview','현황 요약'],['events','사건 목록'],['ai','AI 해석']] as const){
    const tab=button(label,()=>setPanelTab(key));tab.dataset.tab=key;tab.setAttribute('role','tab');tab.id='monitor-tab-'+key;tab.setAttribute('aria-controls','monitor-pane-'+key);tabs.append(tab);
    const pane=panes[key];pane.id='monitor-pane-'+key;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',tab.id);
  }
  tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=Array.from(tabs.querySelectorAll<HTMLButtonElement>('button'));const current=buttons.indexOf(document.activeElement as HTMLButtonElement);const next=e.key==='Home'?0:e.key==='End'?2:(current+(e.key==='ArrowLeft'?2:1))%3;buttons[next].click();buttons[next].focus();});
  overviewPane.append(status,statistics);eventsPane.append(filters,resultList);aiPane.append(el('h2','자료 기반 AI 해석','section-label'),summary);
  panel.append(panelHeader,tabs,overviewPane,eventsPane,aiPane);setPanelTab('overview');
  const updateMap = () =>
    map.update({
      ontologyFeatures:layerEvents?ontologyFeatures:{...ontologyFeatures,features:ontologyFeatures.features.filter(f=>(f.properties?.kind??f.properties?.object_kind)!=='event')},selectedObject:ontologySelection,
      nearby:[...layerPoints,...nearbyItems].filter((v,i,a)=>a.findIndex(x=>x.id===v.id)===i),
      footprints:layerFootprints,
      evidenceFeatures,
      candidates: [],
      links: [],
      selected: selected?.id ?? null,
      showMarkers: true,
      showLinks: false,
      events: (layerEvents?records:[]).filter(r=>!ontologyEnabled||!isMappedLegacyEvent(r,ontologyFeatures))
        .filter(
          (r): r is EventRecord & { lat: number; lon: number } =>
            r.lat !== null && r.lon !== null,
        )
        .map((r) => ({
          id: r.id,
          lat: r.lat,
          lon: r.lon,
          precision: r.precision ?? 7,
          ...eventAppearance(r,palette,markerScale),
        })),
    });
  const disposeLayers=layerControl(root.querySelector('main')!,map,(events,points,footprints)=>{layerEvents=events;layerPoints=points;layerFootprints=footprints;updateMap();},(type)=>{disposeNearby();panel.hidden=true;detail.hidden=true;disposeNearby=mountNearby(root.querySelector('main')!,map,(items)=>{nearbyItems=items;updateMap();},type);});
  ontologyUI=mountOntology(root.querySelector('main')!,map,(features,selected,enabled)=>{ontologyFeatures=features;ontologySelection=selected;ontologyEnabled=enabled;updateMap();},()=>{panel.hidden=true;detail.hidden=true;disposeNearby();});
  const legend=el('details','','event-legend');
  const legendTitle=el('summary','사건 표시');legendTitle.prepend(icon(Activity));legend.append(legendTitle);
  const legendBody=el('div','','legend-body');
  const paletteSelect=document.createElement('select');paletteSelect.setAttribute('aria-label','사건 색상');
  for(const [value,label] of [['red','적갈색'],['amber','황토색'],['mono','흑백']]){const o=el('option',label);o.value=value;paletteSelect.append(o);}paletteSelect.value=palette;
  const scaleSelect=document.createElement('select');scaleSelect.setAttribute('aria-label','사건 표시 크기');
  for(const [value,label] of [['0.8','작게'],['1','기본'],['1.3','크게']]){const o=el('option',label);o.value=value;scaleSelect.append(o);}scaleSelect.value=String(markerScale);
  const paletteLabel=el('label','색상');paletteLabel.append(paletteSelect);const scaleLabel=el('label','크기');scaleLabel.append(scaleSelect);
  const keys=el('div','','legend-keys');
  function updateLegend(){keys.replaceChildren();for(let i=0;i<5;i++){const row=el('div');const dot=el('span','','event-swatch');dot.style.background=eventAppearance({kind:'ucdp',best:[null,0,1,10,50][i]},palette).color;dot.style.width=dot.style.height=[7,7,9,11,13][i]+'px';row.append(dot,el('span',magnitudeLabels[i]));keys.append(row);}}
  paletteSelect.onchange=()=>{palette=paletteSelect.value as EventPalette;savePreference('nv-event-palette',palette);updateLegend();updateMap();for(const r of records){const dot=resultList.querySelector<HTMLElement>(`[data-event-id="${CSS.escape(r.id)}"] .event-swatch`);if(dot)dot.style.background=eventAppearance(r,palette).color;}};
  scaleSelect.onchange=()=>{markerScale=Number(scaleSelect.value);savePreference('nv-event-scale',scaleSelect.value);updateMap();};
  legendBody.append(el('strong','사망자 최적 추정치'),keys,paletteLabel,scaleLabel,el('p','사건별 보고 추정치 기준입니다. 위험도·분쟁 전체 규모·위치 오차 반경을 나타내지 않습니다.'));
  legend.append(legendBody);root.querySelector('main')!.append(legend);updateLegend();
  const escapeSelection=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!detail.hidden)clearSelection();};
  root.addEventListener('keydown',escapeSelection);
  function displayAI(parent: HTMLElement, data: any) {
    parent.replaceChildren();
    if(data?.status==='withheld') {
      parent.append(el('p','AI 응답이 근거 검증을 통과하지 못해 표시하지 않습니다. 통계 기반 현황·Trace는 계속 사용할 수 있습니다.'),el('small',`${data.model} · 검증 보류: ${data.validation_error??'응답 형식/출처 연결'}`));
      return;
    }
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
        const card=el('section','','ai-card');card.append(el('h3',label));
        for(const item of values){card.append(el('p',item.text));const citations=el('details','','ai-citations');citations.append(el('summary',`인용 출처 ${(item.source_ids??[]).length}개`),el('small',(item.source_ids??[]).join(', ')));card.append(citations);}parent.append(card);
      }
    }
    if(data.generation?.format_adaptations?.length) parent.append(el('p','응답 형식만 정리했습니다. 생략된 검토 항목은 검토 완료를 뜻하지 않으며, 없는 인용은 추가하지 않습니다.'));
    if(data.shared_model_with_critic) parent.append(el('p','분석·검토는 같은 모델의 서로 다른 역할입니다. 두 응답의 일치는 독립 검증이 아닙니다.'));
    if(data.fallback_reason) parent.append(el('p',`분석 모델 대체: ${data.requested_model} → ${data.model}. 같은 모델을 분석과 검토에 사용한 경우 두 결과의 일치는 독립 검증이 아닙니다.`));
    parent.append(
      el(
        "p",
        "AI 해석은 독립 검증이나 사실 확정을 의미하지 않습니다.",
        "muted",
      ),
    );
  }
  function clearSelection() {
    disposeContext();disposeEngine();
    selected=null;detail.hidden=true;updateMap();syncSelection();nav.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
  }
  function syncSelection() {
    for(const node of Array.from(resultList.querySelectorAll<HTMLButtonElement>('[data-event-id]'))) {
      node.setAttribute('aria-pressed',String(node.dataset.eventId===selected?.id));
    }
  }
  function showEvent(r: EventRecord, focusMap=true) {
    if(ontologySelection)ontologyUI?.clear();
    if(focusMap)disposeNearby();
    disposeContext();
    selected=r;detail.hidden=false;if(focusMap)panel.hidden=true;
    updateMap();syncSelection();
    const header=el('div','','inspector-header');
    const close=button('닫기',clearSelection);close.className='icon-button';close.prepend(icon(X));
    header.append(el('span','사건 상세','eyebrow'),close);
    const badges=el('div','','event-badges');
    badges.append(el('span','선택됨','badge badge-selected'),el('span',r.kind.toUpperCase(),'badge'),el('span','기록된 사건','badge badge-recorded'),el('span','현재 상태 미확인','badge badge-unknown'));
    const h=el('h2',r.title,'event-title');h.tabIndex=-1;
    const meta=el('div','','event-meta');
    const place=el('span',r.country);place.prepend(icon(MapPin));const date=el('span',eventPeriod(r));date.prepend(icon(CalendarDays));meta.append(place,date);
    const type=el('p',conflictLabel(r),'event-type');
    const hero=el('section','','event-impact');hero.setAttribute('aria-label','사망자 추정');
    hero.append(el('span','보고된 사망자 추정','eyebrow'));
    const heroValue=el('div','','impact-value');heroValue.append(el('strong',r.best==null?'미상':r.best.toLocaleString('ko-KR')),el('span',r.best==null?'추정값 미제공':'명 · 최적 추정치'));hero.append(heroValue);
    const range=el('div','','estimate-range');
    for(const [label,value] of [['최저',r.low],['최적',r.best],['최고',r.high]] as const) {
      const cell=el('div');cell.append(el('span',label),el('strong',value==null?'미상':value.toLocaleString('ko-KR')+'명'));range.append(cell);
    }
    hero.append(range,el('small','제공기관의 추정 범위이며 독립적으로 확인된 수치가 아닙니다.'));
    disposeEngine();detail.replaceChildren(header,badges,h,meta,type);
    if(r.kind==='ucdp')detail.append(hero);
    if(r.fatality_validation==='invalid_provider_estimates')detail.append(el('p','원본 추정치의 범위가 일관되지 않아 미상으로 표시합니다. 사망자 집계에서 제외하며 0명으로 바꾸지 않습니다.','inline-notice'));
    const actors=el('section','','event-section');const actorsTitle=el('h3','관련 당사자');actorsTitle.prepend(icon(Users));actors.append(actorsTitle);
    const names=(r.actors??[]).filter(Boolean);
    if(names.length)for(const [i,name] of names.entries()) {const row=el('div','','actor-row');row.append(el('span',String(i+1).padStart(2,'0'),'actor-number'),el('span',name));actors.append(row);}
    else actors.append(el('p','원자료에 별도 당사자 정보가 없습니다.','muted'));
    detail.append(actors);
    const more=el('details','','event-disclosure');
    const moreTitle=el('summary','무슨 일이 있었나요?');moreTitle.prepend(icon(FileText));more.append(moreTitle);
    more.append(el('p',`${eventPeriod(r)}, ${r.country}에서 ${conflictLabel(r)} 유형의 사건이 ${r.kind.toUpperCase()} 자료에 기록됐습니다.`));
    if(names.length)more.append(el('p','원자료에 기재된 당사자: '+names.join(' / ')));
    more.append(el('p','현재 자료는 사건의 날짜·당사자·피해 추정치를 제공합니다. 개별 상황 서술과 공식 사건명, 실시간 진행·종료 여부는 제공하지 않아 단정하지 않습니다.','muted'));
    detail.append(more);
    const location=el('div','','location-note');location.prepend(icon(MapPin));location.append(el('p',r.lat===null?'위치 미상':r.precision===1?'제공기관 보고 지점 · 독립 현장검증 아님':'대략적 보고 위치 · 지도 원의 크기는 실제 위치 오차 반경이 아닙니다.'));detail.append(location);
    const actions=el('div','','event-actions');
    try {const url=new URL(r.source_url);if(url.protocol==='https:'&&!url.username&&!url.password){const a=link('UCDP 원자료',url.href);a.target='_blank';a.rel='noopener noreferrer';a.append(icon(ArrowUpRight));actions.append(a);}}catch{}
    const c=cases.find(c=>c.country===r.country);
    if(c) {const trace=link('관련 추이·Trace','/?case=live&id='+encodeURIComponent(c.id));trace.append(icon(ChevronRight));actions.append(trace);}
    detail.append(actions);
    const contextHost=el('div'),investigate=button('사건 자료 탐색',()=>{investigate.disabled=true;disposeContext=contextDrawer(contextHost,r.id,r.hash);contextHost.scrollIntoView({block:'nearest',behavior:'instant'});});
    investigate.className='investigate-button';const copy=button('링크 복사',()=>{const url=new URL(window.location.href);url.searchParams.set('view','monitor');url.searchParams.set('event',r.id);void navigator.clipboard.writeText(url.href).then(()=>copy.textContent='복사됨').catch(()=>copy.textContent='링크 복사 실패');});
    const contextActions=el('div','','event-actions');contextActions.append(investigate,copy);detail.append(contextActions,contextHost);const engineHost=el('div');const engineButton=button('NV 엔진으로 검토',()=>{engineButton.disabled=true;disposeEngine();disposeEngine=enginePanel(engineHost,r.id);});contextActions.prepend(engineButton);detail.append(engineHost);
    const provenance=el('details','','event-disclosure verification');const provenanceTitle=el('summary','출처·검증 정보');provenanceTitle.prepend(icon(ShieldCheck));provenance.append(provenanceTitle);
    const facts=el('dl','','event-facts');
    for(const [k,v] of [['자료 버전',`${r.kind.toUpperCase()} ${r.version??'미제공'}`],['자료 구분',r.dataset==='candidate'?'잠정 자료 (Candidate)':r.dataset==='annual'?'연간 확정 자료':'미제공'],['원본 사건 ID',r.upstream_id??r.id],['수집 시각',when(r.acquired_at??null)],['진행 상태','미확인 · 기록 날짜는 현재 상태를 뜻하지 않음'],['원본 해시',r.hash]])facts.append(el('dt',k),el('dd',v));
    if(r.upstream_estimates)facts.append(el('dt','보존된 원본 추정치'),el('dd',JSON.stringify(r.upstream_estimates)));
    provenance.append(facts);detail.append(provenance);
    if(c) {
      const ai=el('section','','event-section event-ai');const title=el('h3','자료를 더 깊이 읽기');title.prepend(icon(BrainCircuit));const result=el('div','','ai-result');
      const analyze=button('AI 분석',()=>{
        if(!user){result.textContent='GitHub 로그인 후 허용된 계정으로 분석할 수 있습니다.';return;}
        analyze.disabled=true;result.textContent='자료 기반 분석 중…';result.setAttribute('aria-busy','true');
        void api('/api/v2/ai/analyze',{case_id:c.id}).then(d=>displayAI(result,d)).catch(e=>{result.textContent='AI 사용 불가: '+e.message;}).finally(()=>{analyze.disabled=false;result.setAttribute('aria-busy','false');});
      });analyze.prepend(icon(BrainCircuit));ai.append(title,el('p','이 국가의 집계 추이와 이상징후 후보를 분석합니다. 선택한 단일 사건의 원인이나 실시간 상태를 확정하지 않습니다.','muted'),analyze,result);result.setAttribute('aria-live','polite');detail.append(ai);
    }
    if(focusMap&&r.lat!==null&&r.lon!==null)map.focus([[r.lon,r.lat]]);
    if(focusMap)h.focus({preventScroll:true});
  }
  async function loadEvents() {
    const params = new URLSearchParams();
    params.set('limit',country.value||from.value||to.value?'500':'100');
    if (country.value) params.set("country", country.value);
    if (from.value) params.set("from", from.value);
    if (to.value) params.set("to", to.value);
    try {
      const d = await api("/api/v2/events?" + params);
      if (destroyed) return;
      records = d.records;
      if(selected) {
        const current=records.find(r=>r.id===selected!.id);
        if(current)showEvent(current,false);else clearSelection();
      }
      updateMap();
      resultList.replaceChildren(
        el(
          "p",
          `${records.length}건${d.limited ? " · 표시 제한 있음, 국가·기간을 좁혀주세요." : ""}`,
        ),
      );
      for (const r of records) {
        const row=button('',()=>showEvent(r));row.className='event-list-card';row.dataset.eventId=r.id;
        row.setAttribute('aria-label',`${r.day} · ${r.title}`);
        const top=el('div','','event-list-meta');const dot=el('span','','event-swatch');dot.style.background=eventAppearance(r,palette).color;
        top.append(dot,el('span',r.country),el('time',r.day));
        const bottom=el('div','','event-list-bottom');bottom.append(el('span',conflictLabel(r)),el('strong',r.best==null?'피해 미상':`최적 ${r.best}명`));
        row.append(top,el('strong',r.title,'event-list-title'),bottom);resultList.append(row);
      }
      syncSelection();
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
      const metric=(label:string,value:string)=>{const cell=el('div','','status-metric');cell.append(el('span',label),el('strong',value));return cell;};
      const statusGrid=el('div','','status-metrics');statusGrid.append(metric('감시 주기',`하루 ${d.runs_per_day}회`),metric('수집 상태',!d.providers.length?'연결 대기':d.stale?'갱신 지연':'자료 게시됨'));
      const times=el('dl','','status-times');times.append(el('dt','마지막 성공'),el('dd',when(d.last_success)),el('dt','다음 예정'),el('dd',when(d.next_scheduled_at)));
      status.replaceChildren(statusGrid,times,el('small','예약 실행은 지연·누락될 수 있습니다. 자료 날짜와 확인 시각은 다릅니다.'));
      if(d.stale)status.append(el('p','정상 분석이 없거나 5시간 이상 지났습니다.','inline-notice'));
      if(d.unconfirmed_slots?.length)status.append(el('p',`최근 24시간 실행 기록 미확인 ${d.unconfirmed_slots.length}회 · 실행 이력을 확인하세요.`,'inline-notice'));
      for(const p of d.providers){
        const m=p.metadata,card=el('section','','provider-card');
        const head=el('div','','provider-header');head.append(el('strong',p.provider.toUpperCase()),el('span',m.limited?'범위 제한':'자료 게시됨','badge'));
        const count=el('div','','provider-count');count.append(el('strong',Number(m.records??0).toLocaleString('ko-KR')),el('span','기록된 사건'));
        card.append(head,count,el('p',`${m.coverage_start??'?'} ~ ${m.coverage_end??'?'}`,'muted'),el('small','자료가 다루는 기간 · 현재의 실시간 상황을 뜻하지 않음'));status.append(card);
      }
      const lastRun=d.runs?.[0];
      notice.textContent=!d.providers.length?'수집 대기 · 현황에서 연결 확인':d.stale?'자료 갱신 지연 · 현황 확인':'감시 자료 게시됨 · 현황 확인';
      if(!d.providers.length){status.append(el('p','공급원 연결·최초 수집 대기 중입니다. 현재 지도에 사건이 없는 이유는 최초 수집이 완료되지 않았기 때문입니다.','inline-notice'));const workflow=link('GitHub 감시 실행·설정 열기','https://github.com/hexagon0401/Night-Vision-A/actions/workflows/monitor.yml');workflow.target='_blank';workflow.rel='noopener noreferrer';status.append(workflow);}
      const invalidEstimates=d.providers.reduce((n:number,p:any)=>n+(p.metadata.invalid_fatality_estimates??0),0);
      if(invalidEstimates)status.append(el('p',`사망자 추정값 미확정 ${invalidEstimates}건 · 미상으로 집계하며 원본 값은 보존합니다.`,'inline-notice'));
      const connections=el('details','','event-disclosure');connections.append(el('summary','공급원·AI 연결 상태'));
      for(const [provider,value] of Object.entries(lastRun?.providers??{})){const p=value as {state:string;reason?:string};const row=el('div','','connection-row');row.append(el('strong',provider.toUpperCase()),el('span',stateLabel(p.state),'badge'),el('small',failureLabel(p.reason??'')));connections.append(row);}
      connections.append(el('p',!d.ai_enabled?'AI 비활성 · 통계 탐지는 별도로 동작합니다.':!d.ai_health?.length?'AI 키 등록됨 · 실제 모델 연결은 아직 검증 전입니다.':'AI 연결 상태','muted'));
      for(const h of d.ai_health??[]){const row=el('div','','connection-row');row.append(el('strong',h.model),el('span',stateLabel(h.state),'badge'),el('small',`${failureLabel(h.error??'응답 확인')} · ${when(h.checked_at)}`));connections.append(row);}status.append(connections);
      const history=el('details','','event-disclosure');history.append(el('summary','최근 감시 실행 이력'));
      for(const r of d.runs){const row=el('div','','connection-row');row.append(el('span',when(r.started)),el('span',stateLabel(r.state),'badge'),el('small',failureLabel(r.error??'')));history.append(row);}status.append(history);

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
      const requestedEvent=new URL(window.location.href).searchParams.get('event');
      if(requestedEvent&&!selected&&/^ucdp:[\w.:-]{1,175}$/.test(requestedEvent)) {
        const record=await api('/api/v2/events/'+encodeURIComponent(requestedEvent)).catch(()=>null);
        if(record&&!destroyed){if(!records.some(r=>r.id===record.id))records.push(record);showEvent(record);}
      }
      displayAI(summary, s.result);
      if(s.statistical) {
        const stat=s.statistical;
        const grid=el('div','','status-metrics statistical-metrics');grid.append(metric('게시 자료',`${stat.records.toLocaleString('ko-KR')}건`),metric('이상징후 후보',`${stat.candidates.toLocaleString('ko-KR')}개`));
        statistics.replaceChildren(el('h3','통계 기반 현황 · AI와 별도','section-label'),grid,el('small',stat.note));
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
    disposeContext();
    disposeNearby();
    destroyed = true;
    clearInterval(timer);
    window.removeEventListener("nv:auth-change", authChanged);
    root.removeEventListener("keydown",escapeSelection);
    ontologyUI?.dispose();disposeLayers();disposeEngine();accountCleanup();
    map.destroy();
  };
}
