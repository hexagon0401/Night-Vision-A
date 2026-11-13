import type {MapPort} from '../map/renderer';
export type Ship={id:string;kind:string;lat:number;lon:number;mmsi:string;title:string;observed_at:string;speed_knots?:number|null;course_deg?:number|null;heading_deg?:number|null;source_url?:string;selected?:boolean};
export const MAX_AGE=300000;
export function freshShips(items:Ship[],now=Date.now()){
 const latest=new Map<string,Ship>();
 for(const s of items){const at=Date.parse(s.observed_at);if(!/^\d{9}$/.test(s.mmsi)||!Number.isFinite(at)||at>now+10000||now-at>=MAX_AGE||!Number.isFinite(s.lat)||!Number.isFinite(s.lon)||Math.abs(s.lat)>85||Math.abs(s.lon)>180)continue;if(!latest.has(s.mmsi)||Date.parse(latest.get(s.mmsi)!.observed_at)<at)latest.set(s.mmsi,s);}
 return [...latest.values()];
}
export function viewport(map:MapPort){const b=map.bounds?.();if(!b||!b.every(Number.isFinite)||b[2]<=b[0]||b[3]<=b[1]||b[2]-b[0]>1||b[3]-b[1]>1||b[0]<-180||b[2]>180||b[1]<-85||b[3]>85)return null;return b;}
const text=(tag:string,value:string)=>{const e=document.createElement(tag);e.textContent=value;return e;};
export function liveAis(host:HTMLElement,map:MapPort,state:HTMLElement,detail:HTMLElement,onShips:(ships:Ship[])=>void){
 let enabled=false,disposed=false,busy=false,version=0,ships:Ship[]=[],selected:string|null=null,lastSuccess:number|null=null,lastObserved:number|null=null,lastAttempt:number|null=null,lastError='',coverageNote='',abort=new AbortController(),pending:ReturnType<typeof setTimeout>|null=null;
 const render=()=>{
  if(!enabled)return;
  const now=Date.now();ships=freshShips(ships,now);onShips(ships.map(s=>({...s,selected:s.id===selected})));
  const observed=Math.max(0,...ships.map(s=>Date.parse(s.observed_at)));if(observed)lastObserved=Math.max(lastObserved??0,observed);const age=lastObserved?Math.max(0,Math.floor((now-lastObserved)/1000)):null;
  state.dataset.state=!navigator.onLine?'offline':lastError?'disconnected':age!==null&&age>90?'delayed':busy?'loading':'ready';
  state.textContent=(!navigator.onLine?'네트워크 끊김':lastError|| (busy?'수신 확인 중':age!==null&&age>90?'관측 지연':'주기 조회'))+` · ${ships.length}척`+(age===null?' · 관측 없음':` · 최근 관측 ${age}초 전`)+(lastSuccess?' · 마지막 조회 성공 '+new Date(lastSuccess).toLocaleTimeString('ko-KR'):'')+coverageNote;
  if(!selected)return;detail.hidden=false;detail.replaceChildren(text('strong',ships.find(s=>s.id===selected)?.title??'선택한 선박'));
  const ship=ships.find(s=>s.id===selected);if(!ship){detail.append(text('p','위치 만료 또는 현재 범위 밖 · 지도에서 제거됨'));return;}
  const dl=document.createElement('dl');dl.className='ais-fields';
  for(const [label,value] of [['MMSI',ship.mmsi],['속도',ship.speed_knots==null?'미확인':ship.speed_knots+' kn'],['진행 방향',ship.course_deg==null?'미확인':ship.course_deg+'°'],['선수 방향',ship.heading_deg==null?'미확인':ship.heading_deg+'°'],['관측 시각',new Date(ship.observed_at).toLocaleString('ko-KR')],['관측 지연',Math.max(0,Math.floor((now-Date.parse(ship.observed_at))/1000))+'초'],['출처','AISstream · 제공기관 보고'],['연결',state.dataset.state==='disconnected'||state.dataset.state==='offline'?'연결 끊김 · 마지막 위치 유지 중':'60초 간격 표본 조회']]){dl.append(text('dt',label),text('dd',value));}detail.append(dl,text('small','약 1km 단위 좌표 · 5분 경과 시 제거 · 이동 경로 아님'));
  const a=text('a','AISstream 원출처') as HTMLAnchorElement;a.href='https://aisstream.io/';a.target='_blank';a.rel='noopener noreferrer';detail.append(a);
 };
 async function load(){
  if(disposed||!enabled||document.hidden)return;
  const bounds=viewport(map);if(!bounds){abort.abort();version++;busy=false;ships=[];lastError='선박을 보려면 지도 범위를 약 100km 이내로 확대하세요';render();return;}
  if(!navigator.onLine){lastError='네트워크 끊김';render();return;}if(busy)return;
  busy=true;const current=++version;abort=new AbortController();lastAttempt=Date.now();lastError='';render();
  try{const q=new URLSearchParams({type:'vessels',lat:String((bounds[1]+bounds[3])/2),lon:String((bounds[0]+bounds[2])/2),radius:'50',bbox:bounds.join(',')});const r=await fetch('/api/v2/nearby?'+q,{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(20000)]),cache:'no-store'});if(!r.ok)throw Error('선박 연결 끊김');const d=await r.json();if(disposed||!enabled||current!==version)return;
   if(!['ok','empty'].includes(d.status))throw Error(d.status==='key_required'?'AIS 키 설정 확인':d.status==='rate_limited'?'조회 한도 · 자동 재시도 대기':d.status==='disabled'?'선박 공급원 비활성':'선박 연결 끊김');
   if(!Array.isArray(d.items))throw Error('선박 응답 형식 오류');const merged=new Map(ships.map(s=>[s.mmsi,s]));for(const s of freshShips(d.items)){const old=merged.get(s.mmsi);if(!old||Date.parse(s.observed_at)>=Date.parse(old.observed_at))merged.set(s.mmsi,s);}ships=[...merged.values()].filter(s=>s.lon>=bounds[0]&&s.lon<=bounds[2]&&s.lat>=bounds[1]&&s.lat<=bounds[3]);lastSuccess=Date.now();lastError='';const diag=d.source_diagnostics;coverageNote=diag?.timed_positions>0&&diag?.accepted_objects===0?' · 위치 '+diag.timed_positions+'건 수신, 민간 선종 확인 대기':'';
  }catch(e){if(current===version&&(e as Error).name!=='AbortError')lastError=(e as Error).message;}finally{if(current===version){busy=false;render();}}
 }
 const move=()=>{if(!enabled)return;abort.abort();version++;busy=false;ships=[];lastObserved=null;render();if(pending)clearTimeout(pending);pending=setTimeout(()=>{pending=null;void load();},800);};
 const visibility=()=>{if(document.hidden){abort.abort();version++;busy=false;}else{render();if(enabled)void load();}};
 const pick=(e:Event)=>{if(!enabled)return;const id=(e as CustomEvent<string>).detail;if(ships.some(s=>s.id===id)){selected=id;render();host.querySelector<HTMLDetailsElement>('.layer-control')!.open=true;}};
 const online=()=>{if(enabled)void load();};const offline=()=>render();
 host.addEventListener('nv:map-move',move);host.addEventListener('nv:nearby-pick',pick);document.addEventListener('visibilitychange',visibility);window.addEventListener('online',online);window.addEventListener('offline',offline);
 const timer=setInterval(()=>{if(!enabled||document.hidden)return;render();if(!lastAttempt||Date.now()-lastAttempt>=60000)void load();},1000);
 return {setEnabled(value:boolean){enabled=value;abort.abort();version++;busy=false;ships=[];lastObserved=null;lastSuccess=null;lastError='';coverageNote='';selected=null;detail.hidden=true;onShips([]);if(value)void load();else state.textContent='꺼짐';},refresh(){void load();},dispose(){disposed=true;enabled=false;abort.abort();clearInterval(timer);if(pending)clearTimeout(pending);host.removeEventListener('nv:map-move',move);host.removeEventListener('nv:nearby-pick',pick);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('online',online);window.removeEventListener('offline',offline);onShips([]);}};
}
