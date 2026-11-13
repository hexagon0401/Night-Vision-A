/** Owner controls receive readiness booleans only; provider keys stay on the server. */
type Region={id:string;label:string;lat:number;lon:number;radius_nm:number};
const el=<K extends keyof HTMLElementTagNameMap>(tag:K,value='')=>{const node=document.createElement(tag);node.textContent=value;return node;};
const time=(at:number|string|null)=>at?new Date(at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})+' KST':'대기';
const bytes=(n:number)=>((n??0)/1_000_000).toFixed(2)+' MB';
export function adsbOwnerControl(host:HTMLDetailsElement){
 const root=el('details');root.className='adsb-owner';root.hidden=true;root.append(el('summary','항공기 수집 관리 · 소유자'));
 const status=el('div'),form=el('form'),regions=el('div'),message=el('p');message.setAttribute('role','status');form.append(el('p','실제 감시 지역을 1~8개 지정하세요. 한 회차에 한 지역을 조회합니다. 6분 간격 · 하루 공통 300회 · 수신 범위는 불완전합니다.'),regions);
 let config:any=null,disposed=false,loaded=false,busy=false;const abort=new AbortController();
 const fields:(()=>Region)[]=[];
 function addRegion(region?:Region){
  if(fields.length>=8)return;
  const row=el('fieldset');row.className='adsb-region';row.append(el('legend','감시 지역 '+(fields.length+1)));
  const input=(name:string,value:string,type='text',min?:string,max?:string)=>{const label=el('label',name),node=el('input');node.type=type;node.value=value;node.required=true;if(type==='number'){node.step='any';if(min)node.min=min;if(max)node.max=max;}label.append(node);row.append(label);return node;};
  const id=input('지역 ID (영문·숫자)',region?.id??'');id.pattern='[a-z0-9_-]{1,32}';const label=input('지역 이름',region?.label??'');label.maxLength=80;
  const lat=input('위도',region?String(region.lat):'','number','-85','85'),lon=input('경도',region?String(region.lon):'','number','-180','180'),radius=input('반경 (해리)',region?String(region.radius_nm):'125','number','1','250');radius.step='1';
  const read=()=>({id:id.value,label:label.value,lat:Number(lat.value),lon:Number(lon.value),radius_nm:Number(radius.value)});fields.push(read);
  const remove=el('button','지역 삭제');remove.type='button';remove.onclick=()=>{fields.splice(fields.indexOf(read),1);row.remove();};row.append(remove);regions.append(row);
 }
 const add=el('button','감시 지역 추가');add.type='button';add.onclick=()=>addRegion();form.append(add);
 const focus=el('fieldset');focus.append(el('legend','집중 수집 · 90초 간격 / 하루 최대 60회'));
 const modeLabel=el('label','집중 대상'),mode=el('select');for(const [value,name]of [['off','사용 안 함'],['region','위의 첫 번째 감시 지역'],['hex','항공기 ICAO24']]){const option=el('option',name);option.value=value;mode.append(option);}modeLabel.append(mode);
 const hexLabel=el('label','ICAO24 (6자리)'),hex=el('input');hex.pattern='[a-fA-F0-9]{6}';hex.maxLength=6;hexLabel.append(hex);hexLabel.hidden=true;mode.onchange=()=>{hexLabel.hidden=mode.value!=='hex';hex.required=mode.value==='hex';};
 const minutesLabel=el('label','집중 수집 유지 (분)'),minutes=el('input');minutes.type='number';minutes.min='1';minutes.max='90';minutes.value='30';minutesLabel.append(minutes);focus.append(modeLabel,hexLabel,minutesLabel);form.append(focus);
 const actions=el('div');actions.className='adsb-actions';const save=el('button','설정 저장 · 수집 중지'),start=el('button','예약 수집 시작'),stop=el('button','수집 중지'),refresh=el('button','상태 확인');for(const button of [save,start,stop,refresh])button.type='button';actions.append(save,start,stop,refresh);form.append(actions,message);root.append(status,form);host.append(root);
 async function readStatus(){const r=await fetch('/api/v2/adsb/admin/status',{cache:'no-store',signal:abort.signal});if(!r.ok)return null;const d=await r.json();return d.config?d:null;}
 function render(d:any,fill=false){
  config=d.config;status.replaceChildren();const badge=el('strong',d.provider_paused?'제공처 중지 · 소유자 확인 필요':!d.provider_selected||!d.enabled?'실행 설정 비활성':!d.configured?'키 연결 필요':config.enabled?'예약 수집 켜짐':'예약 수집 중지');badge.className='adsb-badge';status.append(badge);
  const dl=el('dl');dl.className='ais-fields';const quota=d.quota??{};
  for(const [label,value]of [['키 연결',d.secret_binding??'미등록'],['최근 정상 수집',time(config.last_success_at)],['다음 수집',time(d.next_collection_at)],['공유 알람',time(d.next_alarm_at)],['집중 수집 횟수',`${config.focus_used??0} / 60`],['집중 수집 종료',time(config.focus?.expires_at)],['오늘 요청',`${quota.used??0} / ${quota.limit??300}`],['이번 달 요청',`${quota.windows?.month?.used??0} / 9,500`],['오늘 내려받음',bytes(quota.data?.day_bytes)],['이번 달 내려받음',`${bytes(quota.data?.month_bytes)} / 3,400 MB`],['최근 상태',config.last_status??'미설정'],['중지 사유',({repeated_429:'호출 제한 2회 연속 · 제공처 확인 필요',upstream_auth_failed:'키 또는 접근 권한 확인 필요',upstream_payload_too_large:'제공처 응답 크기 제한 초과'} as Record<string,string>)[d.pause_reason]??'없음'],['호출 제한 해제',time(d.next_allowed_at)]])dl.append(el('dt',label),el('dd',String(value)));
  status.append(dl,el('small','사용량은 이 NV 수집기의 기록입니다. 제공처 계정 전체 사용량은 제공처 대시보드에서 확인하세요.'));
  for(const region of d.collection?.regions??[]){status.append(el('p',`${region.label} · ${region.radius_nm}해리 · 최근 수집 ${time(region.last_snapshot_at)} · 최근 결과 ${region.count??0}대 / 신선한 위치 ${region.fresh_count??0}대`));}
  start.disabled=busy||!d.provider_selected||!d.enabled||!d.configured||d.provider_paused;
  if(fill){regions.replaceChildren();fields.length=0;for(const region of config.regions??[])addRegion(region);if(!fields.length)addRegion();if(config.focus){mode.value=config.focus.mode==='hex'?'hex':'region';hex.value=config.focus.value??'';mode.onchange?.(new Event('change'));}}
 }
 async function submit(enabled:boolean,retain=false){
  if(busy)return;if(!retain&&!form.reportValidity())return;
  if(enabled&&!window.confirm('등록한 지역의 예약 수집을 시작합니다. 수동·예약·집중 수집은 하루 300회 및 월간 데이터 예산을 공유합니다. 시작할까요?'))return;
  const selected:Region[]=retain?(config?.regions??[]):fields.map(read=>read());let target:any=null;
  if(enabled&&mode.value!=='off'){const duration=Number(minutes.value);if(!Number.isInteger(duration)||duration<1||duration>90){message.textContent='집중 수집 유지 시간은 1~90분입니다.';return;}const expires_at=Date.now()+duration*60000;
   if(mode.value==='hex')target={enabled:true,mode:'hex',value:hex.value,expires_at};
   else if(selected[0])target={enabled:true,mode:'point',lat:selected[0].lat,lon:selected[0].lon,radius_nm:selected[0].radius_nm,expires_at};
  }
  busy=true;for(const b of [save,start,stop,refresh])b.disabled=true;message.textContent='저장 중';
  try{const r=await fetch('/api/v2/adsb/admin/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled,regions:selected,focus:target}),signal:abort.signal});const d=await r.json();if(!r.ok)throw Error(d.error??'save_failed');if(disposed)return;render(d);message.textContent=enabled?'예약 수집을 시작했습니다. 다음 수집 시각을 확인하세요.':'설정을 저장하고 수집을 중지했습니다.';}
  catch(e){if(!disposed)message.textContent='저장 실패 · '+(e as Error).message;}
  finally{busy=false;if(!disposed){for(const b of [save,stop,refresh])b.disabled=false;const d=await readStatus().catch(()=>null);if(d&&!disposed)render(d);}}
 }
 save.onclick=()=>void submit(false);start.onclick=()=>void submit(true);stop.onclick=()=>void submit(false,true);refresh.onclick=()=>{void readStatus().then(d=>{if(d&&!disposed)render(d);}).catch(()=>{message.textContent='상태 연결을 확인해주세요.';});};form.onsubmit=e=>e.preventDefault();
 const load=()=>{if(!host.open||loaded||disposed)return;loaded=true;void readStatus().then(d=>{if(d&&!disposed){root.hidden=false;render(d,true);}}).catch(()=>{loaded=false;});};host.addEventListener('toggle',load);if(host.open)load();
 return ()=>{disposed=true;abort.abort();host.removeEventListener('toggle',load);root.remove();};
}
