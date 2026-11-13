/**
 * Night Vision 24/7 adsb.lol scheduled collection reference for an existing TrafficHub DO.
 * Cloudflare Durable Object alarm, NOT a permanently running Node/server loop.
 * No calls until owner enables + saves at least one real watch region.
 * This module does not grant auth; public access must stay read-only and owner-only writes
 * must be checked in the outer Worker. Offline tests use a fake DO and fake provider.
 */
import {handleAdsbLolDO} from './adsb-lol.mjs';

export const BASE_INTERVAL_MS=6*60_000; // 240 nominal baseline calls per complete UTC day
export const FOCUS_INTERVAL_MS=90_000; // 40 requests/hour when explicitly enabled
export const FOCUS_MAX_CALLS_PER_DAY=60;
export const FRESH_MS=120_000; // Existing aircraft PowerReserve hard gap/ingest age
export const MAX_REGIONS=8;
export const MAX_PARTITION_ROWS=250;
export const MAX_INTERVAL_MS=60*60_000;
const UTC_DAY=86_400_000;
const DEFAULT_MONTH_BYTES=3_400_000_000; // matches reference provider adapter local cap
const FOCUS_BYTE_RESERVE=0.10;
const UTC_NEXT_MONTH=at=>{const d=new Date(at);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1);};

export function alignNext(now,step=BASE_INTERVAL_MS){
  if(!Number.isSafeInteger(step)||step<60_000)return NaN;
  return (Math.floor(now/step)+1)*step; // skip missed slots; no catch-up
}
const isNum=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
const slug=s=>typeof s==='string'&&/^[a-z0-9_-]{1,32}$/.test(s);
const cleanId=s=>{if(!slug(s))throw Error('invalid_watch_region_id');return s;};
export function validateWatchRegions(regions){
  if(!Array.isArray(regions)||regions.length>MAX_REGIONS)throw Error('invalid_watch_regions');
  const names=new Set();
  return regions.map(r=>{
    if(!r||!slug(r.id)||r.id==='focus'||names.has(r.id)||!isNum(r.lat,-85,85)||!isNum(r.lon,-180,180)||!Number.isInteger(r.radius_nm)||r.radius_nm<1||r.radius_nm>250)
      throw Error('invalid_watch_region');
    names.add(r.id);
    return {id:r.id,lat:r.lat,lon:r.lon,radius_nm:r.radius_nm,label:typeof r.label==='string'?r.label.slice(0,80):r.id};
  });
}
function validateFocus(f,now){
  if(f==null||f.enabled===false)return null;
  if(f.enabled!==true)throw Error('invalid_focus');
  const expires=Number(f.expires_at??now+90*60_000);
  if(!Number.isFinite(expires)||expires<=now||expires>now+90*60_000)throw Error('invalid_focus_expiry');
  const mode=f.mode;
  if(mode==='hex'){
    if(!/^[0-9a-f]{6}$/i.test(f.value??''))throw Error('invalid_focus_hex');
    return {mode,value:String(f.value).toUpperCase(),expires_at:expires};
  }
  if(mode==='point'){
    const [r]=validateWatchRegions([{id:'focus_point',lat:f.lat,lon:f.lon,radius_nm:f.radius_nm??125}]);
    return {mode,lat:r.lat,lon:r.lon,radius_nm:r.radius_nm,expires_at:expires};
  }
  throw Error('invalid_focus_mode');
}
export const toAdsbQuery=selection=>{
  const p=new URLSearchParams({mode:selection.mode});
  if(selection.mode==='point'){
    p.set('lat',String(selection.lat));p.set('lon',String(selection.lon));p.set('radius_nm',String(selection.radius_nm));
  }else if(selection.mode==='hex')p.set('value',selection.value);
  else throw Error('unsupported_scheduled_mode');
  return 'https://traffic.internal/adsb?'+p;
};

/** Owner-only operation. Do not enable auto mode from anonymous GET requests. */
export async function configureAdsbAutopilot(hub,command,{now=Date.now()}={}){
  if(!command||typeof command!=='object'||typeof command.enabled!=='boolean')throw Error('invalid_autopilot_command');
  const regions=validateWatchRegions(command.regions);
  if(command.enabled&&!regions.length)throw Error('watch_regions_required');
  const focus=validateFocus(command.focus,now);
  const existing=await hub.state.storage.get('adsb:auto')??{};
  const sameRegions=JSON.stringify(regions)===JSON.stringify(existing.regions??[]);
  const sameFocus=JSON.stringify(focus)===JSON.stringify(existing.focus??null);
  const cfg={
    enabled:command.enabled,regions,focus,
    cursor:sameRegions?(existing.cursor??0):0,
    base_at:command.enabled?(sameRegions&&existing.enabled&&Number.isFinite(existing.base_at)?existing.base_at:alignNext(now)):null,
    focus_at:command.enabled&&focus?(sameFocus&&existing.enabled&&Number.isFinite(existing.focus_at)?existing.focus_at:now+FOCUS_INTERVAL_MS):null,
    focus_used_day:existing.focus_used_day===new Date(now).toISOString().slice(0,10)?existing.focus_used_day:new Date(now).toISOString().slice(0,10),
    focus_used:existing.focus_used_day===new Date(now).toISOString().slice(0,10)?(existing.focus_used??0):0,
    ema_bytes:existing.ema_bytes??null,
    last_month_bytes:existing.last_month_bytes??0,
    meter_month:existing.meter_month??new Date(now).toISOString().slice(0,7),
    backoff_at:existing.backoff_at??0,
    last_status:existing.last_status??'configured',
    last_request_at:existing.last_request_at??null,
    last_success_at:existing.last_success_at??null,
  };
  await hub.state.storage.put('adsb:auto',cfg);
  return {enabled:cfg.enabled,regions:cfg.regions,focus:cfg.focus,base_at:cfg.base_at,focus_at:cfg.focus_at};
}

/** Monthly data pacing is based on actual RESPONSE bytes tracked by this DO, not provider dashboard. */
export function adaptiveInterval({now=Date.now(),ema_bytes=null,month_bytes=0,month_limit=DEFAULT_MONTH_BYTES}={}){
  if(!isNum(ema_bytes,1,10_000_000))return BASE_INTERVAL_MS;
  const daysRemaining=Math.max(0,(UTC_NEXT_MONTH(now)-now)/UTC_DAY);
  const bytesForBaseline=Math.max(0,(month_limit-month_bytes)*(1-FOCUS_BYTE_RESERVE));
  if(bytesForBaseline<ema_bytes*1.2)return MAX_INTERVAL_MS;
  const neededMs=UTC_DAY*daysRemaining*ema_bytes*1.15/bytesForBaseline;
  return Math.max(BASE_INTERVAL_MS,Math.min(MAX_INTERVAL_MS,Math.ceil(neededMs/60_000)*60_000));
}

/** Return only the earliest unblocked due time for the *one* existing DO alarm. */
export function nextAutopilotDue(cfg,now=Date.now()){
  if(!cfg?.enabled||!cfg.regions?.length)return null;
  const focusEligible=cfg.focus && cfg.focus.expires_at>now && (cfg.focus_used_day!==new Date(now).toISOString().slice(0,10)||(cfg.focus_used??0)<FOCUS_MAX_CALLS_PER_DAY);
  const due=Math.min(cfg.base_at??Infinity,focusEligible?(cfg.focus_at??Infinity):Infinity);
  if(!Number.isFinite(due))return null;
  return Math.max(now+1000,due,cfg.backoff_at??0);
}

async function persistSnapshot(hub,id,items,now){
  // Two storage banks: write all chunks first, flip the pointer only on completion.
  cleanId(id);
  const storage=hub.state.storage,metaKey='adsb:auto:snapshot:'+id+':meta';
  const prev=await storage.get(metaKey),bank=prev?.bank==='a'?'b':'a';
  const safeItems=items.slice(0,5000),chunks=[];let chunk=[],bytes=2;
  for(const row of safeItems){const size=new TextEncoder().encode(JSON.stringify(row)).length+1;
    if(chunk.length&&(chunk.length>=MAX_PARTITION_ROWS||bytes+size>110_000)){chunks.push(chunk);chunk=[];bytes=2;}
    chunk.push(row);bytes+=size;
  }
  if(chunk.length)chunks.push(chunk);const parts=chunks.length;
  for(let p=0;p<parts;p++)await storage.put('adsb:auto:snapshot:'+id+':'+bank+':'+p,chunks[p]);
  await storage.put(metaKey,{bank,parts,at:now,count:safeItems.length});
}
export async function readAdsbAutopilotSnapshot(hub,{now=Date.now()}={}){
  const storage=hub.state.storage,cfg=await storage.get('adsb:auto');
  const out=new Map(),regions=cfg?.regions??[];
  const ids=[...regions.map(r=>r.id),...(cfg?.focus&&cfg.focus.expires_at>now?['focus']:[])];
  let lastSnapshot=0;const snapshots=[];
  for(const id of ids){
    if(!slug(id))continue;
    const meta=await storage.get('adsb:auto:snapshot:'+id+':meta');
    if(!meta||!Number.isFinite(meta.at)||meta.at>now+10000||!['a','b'].includes(meta.bank)||!Number.isInteger(meta.parts)||meta.parts<0||meta.parts>100)continue;
    lastSnapshot=Math.max(lastSnapshot,meta.at);let freshCount=0;
    if(now-meta.at>=FRESH_MS+10000){snapshots.push({id,last_snapshot_at:new Date(meta.at).toISOString(),count:meta.count,fresh_count:0});continue;}
    for(let p=0;p<meta.parts;p++){
      const items=await storage.get('adsb:auto:snapshot:'+id+':'+meta.bank+':'+p);
      if(!Array.isArray(items))continue;
      for(const row of items){
        const at=Date.parse(row?.observed_at);
        if(!/^aircraft:[0-9a-f]{6}$/.test(row?.id??'')||!Number.isFinite(at)||at>now+10000||now-at>=FRESH_MS)continue;
        freshCount++;const previous=out.get(row.id);
        if(!previous||Date.parse(previous.observed_at)<at)out.set(row.id,row);
      }
    }
    snapshots.push({id,last_snapshot_at:new Date(meta.at).toISOString(),count:meta.count,fresh_count:freshCount});
  }
  const sourceStatus=cfg?.last_status;
  const failures=new Set(['rate_limited','provider_paused','key_required','disabled','temporarily_failed','internal_error','daily_budget','weekly_budget','monthly_budget','daily_data_budget','monthly_data_budget','window_budget','cooldown']);
  return {status:out.size?'ok':!regions.length?'setup_required':failures.has(sourceStatus)?sourceStatus:'empty',provider:'adsb.lol',items:[...out.values()].slice(0,10000),queried_at:new Date(now).toISOString(),source_url:'https://www.adsb.lol/docs/open-data/api',license:'ODbL-1.0',
    collection_mode:'scheduled_regions',coverage:'selected_regions_only_receiver_dependent',
    schedule:{enabled:!!cfg?.enabled,base_interval_ms:BASE_INTERVAL_MS,effective_interval_ms:adaptiveInterval({now,ema_bytes:cfg?.ema_bytes,month_bytes:cfg?.last_month_bytes??0}),regions:regions.map(x=>({id:x.id,label:x.label,radius_nm:x.radius_nm,...snapshots.find(s=>s.id===x.id)})),next_at:nextAutopilotDue(cfg,now),last_status:cfg?.last_status??'not_configured',last_snapshot_at:lastSnapshot?new Date(lastSnapshot).toISOString():null},
    note:'No full-world coverage; latest source observations only. Positions older than 120 seconds are hidden; no fabricated movement.'};
}

/**
 * Run a maximum of ONE candidate external request per alarm invocation.
 * Call under the SAME serialized TrafficHub DO queue used for manual requests.
 * One-time alarm handler can be invoked >=1 times; due markers are committed first.
 */
export async function runAdsbAutopilot(hub,{now=Date.now(),fetchImpl=fetch}={}){
  const storage=hub.state.storage,cfg=await storage.get('adsb:auto');
  if(!cfg?.enabled||!cfg.regions?.length)return {status:'idle',next_at:null};
  const currentMonth=new Date(now).toISOString().slice(0,7);
  if(cfg.meter_month!==currentMonth){cfg.meter_month=currentMonth;cfg.last_month_bytes=0;}
  if(hub.env.NV_AIRCRAFT_PROVIDER!=='adsb_lol'||hub.env.ADSB_LOL_ENABLED!=='true')return {status:'runtime_disabled',next_at:null};
  const day=new Date(now).toISOString().slice(0,10);
  if(cfg.focus_used_day!==day){cfg.focus_used_day=day;cfg.focus_used=0;}
  if(cfg.focus&&cfg.focus.expires_at<=now){cfg.focus=null;cfg.focus_at=null;await storage.put('adsb:auto',cfg);}
  const next=nextAutopilotDue(cfg,now);
  const earliest=Math.min(cfg.base_at??Infinity,cfg.focus&&(cfg.focus_used??0)<FOCUS_MAX_CALLS_PER_DAY?(cfg.focus_at??Infinity):Infinity);
  if((cfg.backoff_at??0)>now||earliest>now)return {status:'not_due',next_at:next};
  let selection,identity;
  if(cfg.focus&&(cfg.focus_used??0)<FOCUS_MAX_CALLS_PER_DAY&&(cfg.focus_at??Infinity)<=now){
    selection=cfg.focus;identity='focus';cfg.focus_used++;cfg.focus_at=now+FOCUS_INTERVAL_MS;
    // Concurrent baseline slot is skipped, never fired seconds later.
    if((cfg.base_at??Infinity)<=now)cfg.base_at=alignNext(now,adaptiveInterval({now,ema_bytes:cfg.ema_bytes,month_bytes:cfg.last_month_bytes??0}));
  }else if((cfg.base_at??Infinity)<=now){
    const region=cfg.regions[cfg.cursor%cfg.regions.length];selection={mode:'point',lat:region.lat,lon:region.lon,radius_nm:region.radius_nm};identity=region.id;
    cfg.cursor=(cfg.cursor+1)%cfg.regions.length;
    cfg.base_at=alignNext(now,adaptiveInterval({now,ema_bytes:cfg.ema_bytes,month_bytes:cfg.last_month_bytes??0}));
  }else{return {status:'not_due',next_at:next};}
  cfg.last_request_at=new Date(now).toISOString();
  await storage.put('adsb:auto',cfg); // idempotency before outbound; never catch-up burst
  let result={status:'unexpected'};
  try{
    const response=await handleAdsbLolDO(new Request(toAdsbQuery(selection)),hub,{fetchImpl,now});
    const data=await response.json();
    result={status:data.status??'failed',http_status:response.status,source:identity,cached:!!data.cached,count:data.items?.length??0};
    if(response.ok&&['ok','empty'].includes(data.status)){
      // Fresh observation list only; no historical or extrapolated tracks saved.
      await persistSnapshot(hub,identity,data.items??[],now);
      cfg.last_success_at=new Date(now).toISOString();
      const currentBytes=data.quota?.data?.month_bytes;
      const month=new Date(now).toISOString().slice(0,7);
      if(cfg.meter_month!==month){cfg.meter_month=month;cfg.last_month_bytes=0;}
      if(Number.isFinite(currentBytes)){
        const prior=cfg.last_month_bytes??0,used=Math.max(0,currentBytes-prior);
        cfg.last_month_bytes=currentBytes;
        if(used>0)cfg.ema_bytes=cfg.ema_bytes==null?used:Math.round(cfg.ema_bytes*0.75+used*0.25);
      }
    }
    if(data.next_allowed_at&&Number.isFinite(Date.parse(data.next_allowed_at)))cfg.backoff_at=Math.max(cfg.backoff_at??0,Date.parse(data.next_allowed_at));
    if(['provider_paused','key_required','disabled'].includes(data.status))cfg.enabled=false;
    cfg.last_status=result.status;
  }catch{
    result={status:'internal_error',source:identity};cfg.last_status=result.status;
    cfg.backoff_at=Math.max(cfg.backoff_at??0,now+15*60_000);
  }finally{
    await storage.put('adsb:auto',cfg);
  }
  return {...result,next_at:nextAutopilotDue(cfg,now)};
}
