import {loadContext,safeLink,type Bundle} from './client';
const groups=[['기사·원출처',['gdelt_doc','ucdp_existing']],['사진·거리뷰',['panoramax','mapillary_street_photo']],['위성',['earth_search_stac','nasa_worldview']],['공개 카메라',['us_road_cameras_official','windy_webcams_v3']],['해상·AIS',['noaa_ais_archive','aisstream']],['항공·ADS-B',['opensky','adsb_lol']],['공식·보조',['ucdp_existing']]] as const;
const states:Record<string,string>={ok:'자료 조회됨',empty:'검색 결과 없음',irrelevant:'관련성 낮음',key_required:'접근 키 필요',terms_pending:'이용 조건 확인 대기',rate_limited:'조회 한도·동시 요청 제한',historical_unavailable:'과거 자료 없음',temporarily_failed:'공급원 연결 실패',disabled:'연결 비활성'};
const timeLabels:Record<string,string>={event_time:'사건 당시 기간',post_event:'사건 이후',present_context:'현재 주변 상황',unknown:'사건 이전 또는 시점 정합 미확인'};
const node=(tag:string,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e;};
export function contextDrawer(host:HTMLElement,eventId:string,expectedHash?:string){
 const controller=new AbortController();let disposed=false,bundle:Bundle|null=null,current=0,pending=false,queued:string|undefined;
 const root=node('section','','context-drawer');root.setAttribute('aria-label','사건 자료 탐색');const title=node('h3','사건 자료 탐색'),summary=node('p','기사·과거 위성자료를 확인하고 있습니다.','context-state'),tabs=node('div','','context-tabs'),content=node('div','','context-content'),controls=node('div','','event-actions');
 summary.setAttribute('role','status');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','사건 자료 종류');
 const filter=document.createElement('select');filter.setAttribute('aria-label','자료 시간 구분');for(const [v,t] of [['','모든 시점'],['event_time','사건 당시'],['post_event','사건 이후'],['present_context','현재 주변 상황'],['unknown','이전·미확인']]){const o=document.createElement('option');o.value=v;o.textContent=t;filter.append(o);}filter.onchange=()=>render();
 const relation=document.createElement('select');relation.setAttribute('aria-label','자료 관련성');for(const [v,t]of [['','모든 관련성'],['candidate','사건 연결 후보'],['context_only','맥락 자료'],['direct','직접 근거'],['corroborating','관찰 지지'],['contradictory','상충 자료']]){const o=document.createElement('option');o.value=v;o.textContent=t;relation.append(o);}relation.onchange=()=>render();
 const exportButton=node('button','탐색 자료 저장') as HTMLButtonElement;exportButton.onclick=()=>{if(!bundle)return;const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='NV-event-context.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const review=node('button','수동 조사 검토 요청') as HTMLButtonElement;review.onclick=async()=>{review.disabled=true;try{const r=await fetch('/api/v2/events/'+encodeURIComponent(eventId)+'/context/review',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}',signal:controller.signal});if(!r.ok)throw Error();summary.textContent='검토 요청 저장됨 · 자동 사실 승격이나 외부 조사 모듈 실행은 수행하지 않습니다.';}catch{if(!disposed)summary.textContent='검토 요청은 허용된 GitHub 계정 로그인이 필요합니다.';}finally{review.disabled=false;}};
 controls.append(exportButton,review);const filters=node('div','','context-filters');filters.append(filter,relation);root.append(title,summary,tabs,filters,content,controls);host.append(root);
 groups.forEach(([label],index)=>{const button=node('button',label) as HTMLButtonElement;button.setAttribute('role','tab');button.id='context-tab-'+index;button.setAttribute('aria-controls','context-results');button.onclick=()=>{current=index;render();void request(groups[index][1].join(','));};tabs.append(button);});content.id='context-results';content.setAttribute('role','tabpanel');
 tabs.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?6:(current+(e.key==='ArrowLeft'?6:1))%7;(tabs.children[next] as HTMLButtonElement).click();(tabs.children[next] as HTMLButtonElement).focus();};
 function render(){
  if(!bundle||disposed)return;const ids:readonly string[]=groups[current][1];
  Array.from(tabs.children).forEach((e,i)=>{e.setAttribute('aria-selected',String(i===current));(e as HTMLElement).tabIndex=i===current?0:-1;});content.setAttribute('aria-labelledby','context-tab-'+current);content.replaceChildren();
  const precision=bundle.event_ref.location.where_prec;content.append(node('p',`발생 기간 ${bundle.event_ref.interval.from} ~ ${bundle.event_ref.interval.to} · ${precision===1?'원보고 지점 · 독립 검증 아님':'대략 위치 또는 위치 미확인'}`,'muted'));
  for(const run of bundle.provider_runs.filter(p=>ids.includes(p.provider_id))){const state=node('div','','context-provider-state');state.append(node('strong',run.provider_id),node('span',states[run.status]??run.status,'badge'));if(run.diagnostics_code)state.append(node('small',run.diagnostics_code));if(run.cached)state.append(node('small','캐시 자료 · '+run.completed_at_utc+(run.diagnostics_code?.includes('stale')?' · 갱신 지연':'')));if(run.retry_after_utc)state.append(node('small','재시도 가능 '+run.retry_after_utc));const policyLink=safeLink(run.policy_url);if(policyLink){const a=node('a','제공기관 이용 조건') as HTMLAnchorElement;a.href=policyLink;a.target='_blank';a.rel='noopener noreferrer';state.append(a);}content.append(state);}
  const items=bundle.items.filter(i=>ids.includes(i.provider_id)&&(!filter.value||i.temporal_role===filter.value)&&(!relation.value||i.evidence_role===relation.value));
  for(const item of items.slice(0,4)){
   const card=node('article','','context-card'),badges=node('div','','event-badges');badges.append(node('span',timeLabels[item.temporal_role]??item.temporal_role,'badge'),node('span',item.evidence_role==='candidate'?'사건 연결 후보':'맥락 자료 · 사건 증거 미확정','badge'));
   card.append(badges,node('h4',item.title));
   const url=safeLink(item.url);if(url){const a=node('a','원출처에서 보기') as HTMLAnchorElement;a.href=url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
   card.append(node('p',`관측·촬영 ${item.observed_from_utc??'미확인'}\n원문 게시 ${item.published_at_utc??'미확인'}\nNV 조회 ${item.acquired_at_utc}`));
   if(item.satellite){const s=item.satellite as Record<string,unknown>;card.append(node('p',`${s.platform} · GSD ${s.gsd_m??'미상'}m · 구름 ${s.cloud_pct??'미상'}%`));}
   if(item.attribution)card.append(node('small',item.attribution));for(const warning of item.warnings)card.append(node('p',warning,'muted'));content.append(card);
  }
  if(items.length>4)content.append(node('p',`${items.length}건 중 4건 표시 · 전체 메타데이터는 탐색 자료 저장으로 확인할 수 있습니다.`));
  if(!items.length)content.append(node('p','현재 조건에 표시할 자료가 없습니다. 자료 부재는 사건 부재를 의미하지 않습니다.','muted'));
 }
 async function request(include?:string){
  if(disposed)return;if(pending){queued=include;return;}pending=true;root.setAttribute('aria-busy','true');
  try{const next=await loadContext(eventId,controller.signal,include,'',expectedHash);if(disposed)return;bundle=next;summary.textContent=`발견 ${next.counts.total}건 · 연결 후보 ${next.counts.candidate} · 맥락 ${next.counts.context_only} · 접근 제한 ${next.counts.inaccessible}개 공급원`;render();}
  catch(e){if(!disposed)summary.textContent=(e as Error).message;}finally{pending=false;root.setAttribute('aria-busy','false');if(queued&&!disposed){const next=queued;queued=undefined;void request(next);}}
 }
 void request();return ()=>{disposed=true;controller.abort();root.remove();};
}
