import {createMap,type MapPort} from '../map/renderer';
interface EventRecord {id:string;country:string;day:string;end_day?:string;title:string;kind:string;precision?:number;lat:number|null;lon:number|null;low?:number|null;best?:number|null;high?:number|null;version?:string;source_url:string;acquired_at?:string;hash:string}
const el=<K extends keyof HTMLElementTagNameMap>(tag:K,value='',cls='')=>{const e=document.createElement(tag);e.textContent=value;e.className=cls;return e;};
const link=(label:string,href:string)=>{const e=el('a',label);e.href=href;return e;};
async function api(path:string,body?:unknown){
 const r=await fetch(path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const d=await r.json();if(!r.ok)throw new Error(d.error??'연결 실패');return d;
}
function when(value:string|null){return value?new Date(value).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})+' KST':'아직 없음';}

export function mountMonitor(root:HTMLElement):()=>void {
 root.innerHTML='<main class="workspace monitor"><div class="map" role="region" aria-label="세계 분쟁 지도"></div><header class="topbar"><a class="brand" href="/?view=monitor">NIGHT VISION<small>출처 기반 지속 감시</small></a><nav aria-label="감시 도구"></nav></header><div class="map-message" role="status"></div><section class="monitor-panel" aria-label="감시 현황"></section><section class="monitor-evidence" aria-label="사건 상세" hidden></section><footer class="statusbar"><span>REPORTED · UNCALIBRATED</span><span>OpenFreeMap · OpenStreetMap</span></footer></main>';
 const panel=root.querySelector<HTMLElement>('.monitor-panel')!,detail=root.querySelector<HTMLElement>('.monitor-evidence')!,nav=root.querySelector('nav')!,message=root.querySelector<HTMLElement>('.map-message')!;
 let records:EventRecord[]=[],cases:{id:string;country:string}[]=[],selected:EventRecord|null=null,destroyed=false,user:any=null;
 const map=createMap(root.querySelector<HTMLElement>('.map')!,{pick:()=>{},move:()=>{},dismiss:()=>{},ready:()=>{},error:()=>{message.textContent='지도 연결을 확인하세요.';},basemap:detailed=>{message.hidden=detailed;message.textContent=detailed?'':'상세 지도 연결 실패 · 윤곽 지도 표시 중';},event:id=>{const r=records.find(r=>r.id===id);if(r)showEvent(r);}});
 const button=(name:string,action:()=>void)=>{const b=el('button',name);b.onclick=action;return b;};
 const login=link('GitHub 로그인','/api/auth/github');nav.append(link('합성 실험','/?case=synthetic'),link('USGS Alpha','/?case=alpha'),login,button('새로고침',()=>void refresh()),button('NIM 연결 진단',()=>{
  if(!user){message.hidden=false;message.textContent='GitHub 로그인 후 허용 계정으로 진단할 수 있습니다.';return;}
  message.hidden=false;message.textContent='NIM 연결 진단 중…';void api('/api/v2/admin/nim-test',{}).then(d=>{message.textContent='NIM 연결 정상 · '+d.model;}).catch(e=>{message.textContent='NIM 연결 상태: '+e.message;});
 }));
 const country=document.createElement('select');country.setAttribute('aria-label','국가 선택');const all=el('option','전 세계');all.value='';country.append(all);
 const from=document.createElement('input');from.type='date';from.setAttribute('aria-label','시작일');
 const to=document.createElement('input');to.type='date';to.setAttribute('aria-label','종료일');
 const filters=el('div','','monitor-filters');filters.append(country,from,to,button('조회',()=>void loadEvents()));
 const resultList=el('div','','monitor-events'),status=el('div','','monitor-status'),summary=el('div','','monitor-summary');
 panel.append(el('h1','세계 분쟁 감시'),status,filters,summary,resultList);
 const updateMap=()=>map.update({candidates:[],links:[],selected:null,showMarkers:true,showLinks:false,events:records.filter((r):r is EventRecord&{lat:number;lon:number}=>r.lat!==null&&r.lon!==null).map(r=>({id:r.id,lat:r.lat,lon:r.lon,precision:r.precision??7}))});
 function displayAI(parent:HTMLElement,data:any){
  parent.replaceChildren();const result=data?.result;
  if(!result){parent.append(el('p','AI 요약이 아직 없습니다. 자료 조회와 규칙 기반 감시는 계속 사용할 수 있습니다.'));return;}
  parent.append(el('p',`AI 해석 · ${data.model??''} · 분석 ${when(data.analyzed_at)}${data.cached?' · 재사용':''}`,'muted'));
  for(const [key,label] of [['summary','요약'],['alternatives','대안 설명'],['counterevidence','반증 검토'],['unknowns','미확인 사항']]){
   const values=result[key]??[];if(values.length){parent.append(el('h3',label));for(const item of values){parent.append(el('p',item.text));parent.append(el('small','출처: '+(item.source_ids??[]).join(', ')));}}
  }
  parent.append(el('p','AI 해석은 독립 검증이나 사실 확정을 의미하지 않습니다.','muted'));
 }
 function showEvent(r:EventRecord){
  selected=r;detail.hidden=false;detail.replaceChildren(button('닫기',()=>{detail.hidden=true;}),el('h2',r.title));
  detail.append(el('p',`${r.country} · ${r.day}${r.end_day&&r.end_day!==r.day?' ~ '+r.end_day:''}`),el('p',`자료: ${r.kind.toUpperCase()} ${r.version??''} · REPORTED`));
  if(r.kind==='ucdp')detail.append(el('p',`사망자 추정: 최저 ${r.low??'미상'} / 최적 ${r.best??'미상'} / 최고 ${r.high??'미상'}`));
  detail.append(el('p',r.lat===null?'위치 미상':r.precision===1?'제공기관 보고 지점 · 독립 현장검증 아님':'대략적 보고 위치 · 원의 크기는 실제 오차 범위가 아닙니다.'));
  detail.append(el('p','수집: '+when(r.acquired_at??null)),el('small','원본 해시: '+r.hash));
  try{const url=new URL(r.source_url);if(url.protocol==='https:'&&!url.username&&!url.password){const a=link('원문·제공기관',url.href);a.target='_blank';a.rel='noopener noreferrer';detail.append(a);}}catch{}
  const c=cases.find(c=>c.country===r.country);
  if(c){detail.append(link('관련 추이·Trace','/?case=live&id='+encodeURIComponent(c.id)));const result=el('div');detail.append(button('AI 분석',()=>{
   if(!user){result.textContent='GitHub 로그인 후 허용된 계정으로 분석할 수 있습니다.';return;}
   result.textContent='자료 기반 분석 중…';void api('/api/v2/ai/analyze',{case_id:c.id}).then(d=>displayAI(result,d)).catch(e=>{result.textContent='AI 사용 불가: '+e.message;});
  }),result);}
  if(r.lat!==null&&r.lon!==null)map.focus([[r.lon,r.lat]]);
 }
 async function loadEvents(){
  const params=new URLSearchParams();if(country.value)params.set('country',country.value);if(from.value)params.set('from',from.value);if(to.value)params.set('to',to.value);
  try{const d=await api('/api/v2/events?'+params);if(destroyed)return;records=d.records;updateMap();resultList.replaceChildren(el('p',`${records.length}건${d.limited?' · 표시 제한 있음, 국가·기간을 좁혀주세요.':''}`));for(const r of records)resultList.append(button(`${r.day} · ${r.title}`,()=>showEvent(r)));if(!records.length)resultList.append(el('p','해당 범위에 게시된 자료가 없습니다. 사건이 없다는 뜻은 아닙니다.'));}
  catch(e){resultList.textContent='자료 조회 불가: '+(e as Error).message;}
 }
 async function refresh(){
  try{
   const d=await api('/api/v2/status');if(destroyed)return;
   status.replaceChildren(el('p',`하루 ${d.runs_per_day}회 · 마지막 성공 ${when(d.last_success)}`),el('p',`다음 예정 ${when(d.next_scheduled_at)} · 예약 실행은 지연될 수 있습니다.`));
   if(d.stale)status.append(el('p','정상 분석이 없거나 5시간 이상 지났습니다.','muted'));
   for(const p of d.providers){const m=p.metadata;status.append(el('p',`${p.provider}: ${m.coverage_start??'?'} ~ ${m.coverage_end??'?'} · ${m.records??'?'}건${m.limited?' · 보유 범위 제한':''}`));}
   if(!d.providers.length)status.append(el('p','공급원 연결·최초 수집 대기 중입니다.'));
   const history=el('details');history.append(el('summary','최근 감시 실행 이력'));
   for(const r of d.runs)history.append(el('p',`${when(r.started)} · ${r.state} · ${r.error??''}`));status.append(history);
   const overview=await api('/api/v2/overview');const previous=country.value;country.replaceChildren(all);for(const r of overview.countries){const o=el('option',`${r.country} (${r.events})`);o.value=r.country;country.append(o);}country.value=previous;
   cases=(await api('/api/v2/cases')).cases;
   const me=await api('/api/auth/me');user=me.user;login.textContent=user?`${user.login} · 로그아웃`:'GitHub 로그인';login.onclick=user?(e=>{e.preventDefault();void api('/api/auth/logout',{}).then(()=>refresh());}):null;
   const s=await api('/api/v2/monitor-summary');displayAI(summary,s.result);
   await loadEvents();
  }catch(e){if(!destroyed){status.replaceChildren(el('p','운영 기능 설정 대기: '+(e as Error).message),link('키·데이터베이스 설정 안내','/setup.html'));}}
 }
 void refresh();const timer=setInterval(()=>void refresh(),300000);
 return()=>{destroyed=true;clearInterval(timer);map.destroy();};
}
