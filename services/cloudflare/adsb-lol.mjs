/**
 * Night Vision / adsb.lol: owner-only, Cloudflare TrafficHub DO-scoped reference.
 * Version 1.2 (core quota module retained from v1.1) — limits supplied from authenticated provider Usage page on 2026-11-13.
 * Portable ESM: does not deploy, read real secrets, or make network calls in tests.
 *
 * CALL ONLY THROUGH A SERIALIZED DO QUEUE. All actual usage here is this DO's own
 * attempted calls, NOT the provider dashboard's authoritative/account-wide usage.
 */
const API_ORIGIN = 'https://api.adsb.lol';
const SOURCE_URL = 'https://www.adsb.lol/docs/open-data/api';
const MAX_BYTES = 3_000_000;
const MAX_ROWS = 5_000;
const POSITION_MAX_AGE_MS = 120_000;
const CACHE_TTL_MS = 60_000;
const MIN_GAP_MS = 30_000;
const DEFAULT_DAILY_LIMIT = 300;
const DAY_MS = 86_400_000;
const MODES = new Set(['point','closest','hex','callsign','reg','type','squawk','mil','pia','ladd','status']);

/** Verified against the owner's supplied authenticated Usage page, not inferred tier. */
export const PROVIDER_CAPS = Object.freeze({
  s30:20, minute:120, hour:1000, day:1000, week:5000, month:10000,
  dayBytes:1_000_000_000, monthBytes:4_000_000_000,
});
/** Self-imposed headroom. Restrict this DO; does not protect another client using the same key. */
export const LOCAL_CAPS = Object.freeze({
  s30:18, minute:100, hour:900, day:950, week:4700, month:9500,
  dayBytes:850_000_000, monthBytes:3_400_000_000,
});

class AdsbError extends Error {
  constructor(code,status=400,retryAfter=0) {super(code);this.code=code;this.status=status;this.retryAfter=retryAfter;}
}
export const adsbJson=(value,status=200,retryAfter=0)=>{
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  if(retryAfter>0)headers['Retry-After']=String(Math.ceil(retryAfter));
  return new Response(JSON.stringify(value),{status,headers});
};
const numberIn=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max?value:null;
const maybeNumber=(value)=>typeof value==='number'&&Number.isFinite(value)?value:null;
const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):null;
const fixed=value=>Number(value.toFixed(5)).toString();
const range=(value,min,max,code)=>{
  if(typeof value!=='string'||value.trim()===''||!/^-?\d+(?:\.\d+)?$/.test(value))throw new AdsbError(code);
  const n=Number(value);
  if(!Number.isFinite(n)||n<min||n>max)throw new AdsbError(code);
  return n;
};

/** Deliberate allowlist: no arbitrary URL / path / host / secret from the caller. */
export function parseAdsbRequest(uri) {
  const params=new URL(uri).searchParams,mode=params.get('mode')??'point';
  if(!MODES.has(mode))throw new AdsbError('invalid_mode');
  if(mode==='status')return {mode,path:'',cacheKey:'status',selection:{}};
  if(mode==='point'||mode==='closest') {
    const lat=range(params.get('lat'),-85,85,'invalid_coordinates');
    const lon=range(params.get('lon'),-180,180,'invalid_coordinates');
    const radius=range(params.get('radius_nm')??'125',1,250,'invalid_radius');
    if(!Number.isInteger(radius))throw new AdsbError('invalid_radius');
    const path=`/v2/${mode}/${fixed(lat)}/${fixed(lon)}/${radius}`;
    return {mode,path,cacheKey:path,selection:{lat,lon,radius_nm:radius}};
  }
  if(['mil','pia','ladd'].includes(mode))return {mode,path:`/v2/${mode}`,cacheKey:mode,selection:{}};
  const value=params.get('value')??'';
  const rules={hex:/^[a-fA-F0-9]{6}$/,callsign:/^[A-Z0-9]{2,12}$/i,reg:/^[A-Z0-9-]{2,15}$/i,type:/^[A-Z0-9]{2,6}$/i,squawk:/^[0-7]{4}$/};
  if(!rules[mode].test(value))throw new AdsbError('invalid_identifier');
  const safe=value.toUpperCase(),path=`/v2/${mode}/${encodeURIComponent(safe)}`;
  return {mode,path,cacheKey:path,selection:{value:safe}};
}

/** Retry-After may be seconds or HTTP-date; never truncate a month-long cooldown. */
export function parseRetryAfter(value,now=Date.now()) {
  if(value===null||value===undefined||String(value).trim()==='')return 3600;
  const numeric=Number(value);const seconds=Number.isFinite(numeric)&&numeric>=0
    ?numeric:(Number.isFinite(Date.parse(value))?(Date.parse(value)-now)/1000:3600);
  return Math.max(60,Math.min(366*86400,Math.ceil(seconds)));
}

export function normalizeAdsb(data,receivedAt=Date.now()) {
  if(!data||!Array.isArray(data.ac))throw new AdsbError('upstream_schema_invalid',502);
  const value=Number(data.now),upstreamNow=value>1e12?value:value>1e9?value*1000:NaN;
  if(!Number.isFinite(upstreamNow)||Math.abs(receivedAt-upstreamNow)>180_000)throw new AdsbError('upstream_time_invalid',502);
  const rows=new Map();
  for(const ac of data.ac.slice(0,12_000)) {
    if(!ac||typeof ac!=='object'||!/^[0-9a-f]{6}$/i.test(ac.hex??''))continue;
    const lat=numberIn(ac.lat,-85,85),lon=numberIn(ac.lon,-180,180);
    const seenPos=numberIn(ac.seen_pos,0,86400);
    if(lat===null||lon===null||seenPos===null)continue;
    const observed=upstreamNow-seenPos*1000;
    if(observed>receivedAt+10_000||receivedAt-observed>POSITION_MAX_AGE_MS)continue;
    const hex=ac.hex.toLowerCase(),callsign=clean(ac.flight,20)||null;
    const row={
      id:`aircraft:${hex}`,kind:'aircraft',icao24:hex,lat,lon,
      title:callsign??clean(ac.r,20)??hex.toUpperCase(),callsign,
      registration:clean(ac.r,20),aircraft_type:clean(ac.t,10)?.toUpperCase()??null,
      speed_knots:numberIn(ac.gs,0,1500),course_deg:numberIn(ac.track,0,359.99999),heading_deg:numberIn(ac.true_heading,0,359.99999),
      altitude_baro_ft:maybeNumber(ac.alt_baro),altitude_geom_ft:maybeNumber(ac.alt_geom),on_ground:ac.alt_baro==='ground',
      vertical_rate_fpm:maybeNumber(ac.baro_rate),squawk:clean(ac.squawk,4),
      position_source:clean(ac.type,32),emitter_category:clean(ac.category,8),
      observed_at:new Date(observed).toISOString(),observation_time_method:'provider_now_minus_seen_pos',
      provider:'adsb.lol',source_url:SOURCE_URL,license:'ODbL-1.0',
    };
    const old=rows.get(hex);if(!old||Date.parse(old.observed_at)<observed)rows.set(hex,row);
    if(rows.size>=MAX_ROWS)break;
  }
  return [...rows.values()];
}

async function readJSONBounded(response,onBytes=()=>{}) {
  const headerSize=Number(response.headers.get('Content-Length'));
  if(Number.isFinite(headerSize)&&headerSize>MAX_BYTES) {
    // Provider accounting may differ from downloaded bytes: charge conservative ceiling.
    onBytes(MAX_BYTES);throw new AdsbError('upstream_payload_too_large',502);
  }
  if(!response.body)throw new AdsbError('upstream_empty_body',502);
  const reader=response.body.getReader(),chunks=[];let length=0;
  while(true){
    const {value,done}=await reader.read();if(done)break;
    length+=value.byteLength;onBytes(value.byteLength);
    if(length>MAX_BYTES){await reader.cancel();throw new AdsbError('upstream_payload_too_large',502);}
    chunks.push(value);
  }
  const payload=new Uint8Array(length);let offset=0;
  for(const chunk of chunks){payload.set(chunk,offset);offset+=chunk.byteLength;}
  try{return JSON.parse(new TextDecoder().decode(payload));}
  catch{throw new AdsbError('upstream_invalid_json',502);}
}

/** Network access isolated here; x-api-key is exclusively a secret header. */
export async function requestAdsbProvider(selection,secret,{fetchImpl=fetch,now=Date.now(),onBytes=()=>{}}={}) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try {
    const response=await fetchImpl(API_ORIGIN+selection.path,{
      method:'GET',redirect:'manual',signal:controller.signal,
      headers:{'x-api-key':secret,Accept:'application/json','User-Agent':'NightVision/ADSB (+https://github.com/hexagon0401/Night-Vision-A)'}
    });
    if(response.status===429)throw new AdsbError('upstream_rate_limited',429,parseRetryAfter(response.headers.get('Retry-After'),now));
    if(response.status===401||response.status===403)throw new AdsbError('upstream_auth_failed',502);
    if(!response.ok)throw new AdsbError('upstream_unavailable',502);
    return normalizeAdsb(await readJSONBounded(response,onBytes),now);
  } catch(error) {
    if(error instanceof AdsbError)throw error;
    throw new AdsbError('upstream_timeout_or_network',502);
  } finally {clearTimeout(timer);}
}
const utcDay=now=>new Date(now).toISOString().slice(0,10);
const utcWeek=now=>{
  const today=new Date(now),midnight=Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate());
  return new Date(midnight-((today.getUTCDay()+6)%7)*DAY_MS).toISOString().slice(0,10);
};
const utcMonth=now=>new Date(now).toISOString().slice(0,7);
const nextMonth=now=>{const d=new Date(now);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1);};
const weekBoundary=now=>Date.parse(utcWeek(now)+'T00:00:00Z')+7*DAY_MS;
const nextFixed=(now,ms)=>Math.floor(now/ms)*ms+ms;
const slot=(item,key)=>item?.key===key?{...item}:{key,used:0,bytes:0};
const quotaState=(stored,now)=>({
  s30:slot(stored?.s30,String(Math.floor(now/30_000))),
  minute:slot(stored?.minute,String(Math.floor(now/60_000))),
  hour:slot(stored?.hour,String(Math.floor(now/3_600_000))),
  day:slot(stored?.day,utcDay(now)),
  week:slot(stored?.week,utcWeek(now)),
  month:slot(stored?.month,utcMonth(now)),
  lastAttempt:stored?.lastAttempt??0,blockedUntil:stored?.blockedUntil??0,
  rateLimitStreak:stored?.rateLimitStreak??0,manualReview:stored?.manualReview??false,pauseReason:stored?.pauseReason??null,
});
const summary=(q,cfg)=>({
  scope:'this_traffic_hub_only_not_provider_account',
  day:q.day.key,used:q.day.used,limit:cfg.dailyLimit,
  windows:Object.fromEntries(['s30','minute','hour','day','week','month'].map(k=>[k,{key:q[k].key,used:q[k].used,local_limit:k==='day'?cfg.dailyLimit:LOCAL_CAPS[k],provider_limit:PROVIDER_CAPS[k]}])),
  data:{day_bytes:q.day.bytes,month_bytes:q.month.bytes,local_day_max_bytes:LOCAL_CAPS.dayBytes,local_month_max_bytes:LOCAL_CAPS.monthBytes,provider_day_max_bytes:PROVIDER_CAPS.dayBytes,provider_month_max_bytes:PROVIDER_CAPS.monthBytes},
  note:'Other consumers of this API key are not visible; provider dashboard is authoritative.',
});
const safeConfig=env=>{
  const raw=Number(env.ADSB_LOL_DAILY_LIMIT),requested=Number.isInteger(raw)&&raw>0?raw:DEFAULT_DAILY_LIMIT;
  return {dailyLimit:Math.max(1,Math.min(DEFAULT_DAILY_LIMIT,requested)),minGap:MIN_GAP_MS};
};
function nextBudgetGate(q,cfg,now) {
  for(const [key,max,end] of [
    ['s30',LOCAL_CAPS.s30,nextFixed(now,30_000)],
    ['minute',LOCAL_CAPS.minute,nextFixed(now,60_000)],
    ['hour',LOCAL_CAPS.hour,nextFixed(now,3_600_000)],
    ['day',cfg.dailyLimit,nextFixed(now,DAY_MS)],
    ['week',LOCAL_CAPS.week,weekBoundary(now)],
    ['month',LOCAL_CAPS.month,nextMonth(now)]
  ])if(q[key].used>=max)return {status:key==='day'?'daily_budget':key==='month'?'monthly_budget':key==='week'?'weekly_budget':'window_budget',next:end};
  // Reserve one maximum-size response before calling; charge actual measured bytes after.
  if(q.day.bytes+MAX_BYTES>LOCAL_CAPS.dayBytes)return {status:'daily_data_budget',next:nextFixed(now,DAY_MS)};
  if(q.month.bytes+MAX_BYTES>LOCAL_CAPS.monthBytes)return {status:'monthly_data_budget',next:nextMonth(now)};
  return null;
}
const liveCache=(data,now,q,cfg)=>({
  ...data.data,items:data.data.items.filter(x=>now-Date.parse(x.observed_at)<POSITION_MAX_AGE_MS),
  cached:true,quota:summary(q,cfg),
});

/**
 * Call only through a shared, serialized TrafficHub DO queue:
 * this.adsbQueue=(this.adsbQueue??Promise.resolve()).catch(()=>{})
 *   .then(()=>handleAdsbLolDO(request,this));return this.adsbQueue;
 */
export const adsbKey=env=>env['ADSB_API-KEY']||env.ADSB_LOL_API_KEY;

export async function handleAdsbLolDO(request,hub,{fetchImpl=fetch,now=Date.now()}={}) {
  let selection;
  try{selection=parseAdsbRequest(request.url);}
  catch(error){return adsbJson({status:'invalid_request',error:error.code??'invalid_request'},error.status??400);}
  const env=hub.env,storage=hub.state.storage,cache=hub.adsbCache??(hub.adsbCache=new Map());
  const cfg=safeConfig(env),q=quotaState(await storage.get('adsb:quota'),now);
  if(selection.mode==='status')return adsbJson({status:'ok',enabled:env.ADSB_LOL_ENABLED==='true',configured:!!adsbKey(env),
    quota:summary(q,cfg),provider_paused:q.manualReview,pause_reason:q.pauseReason,rate_limit_streak:q.rateLimitStreak,
    next_allowed_at:Math.max(q.blockedUntil,q.lastAttempt+cfg.minGap)>now?new Date(Math.max(q.blockedUntil,q.lastAttempt+cfg.minGap)).toISOString():null});
  if(env.ADSB_LOL_ENABLED!=='true')return adsbJson({status:'disabled',items:[],error:'adsb_disabled'},503);
  if(!adsbKey(env))return adsbJson({status:'key_required',items:[],error:'adsb_key_required'},503);
  if(['mil','pia','ladd'].includes(selection.mode)&&env.ADSB_LOL_ALLOW_GLOBAL_FILTERS!=='true')return adsbJson({status:'disabled',items:[],error:'global_filters_disabled'},403);
  const cached=cache.get(selection.cacheKey);
  if(cached&&cached.expiresAt>now){const value=liveCache(cached,now,q,cfg);value.status=value.items.length?'ok':'empty';return adsbJson(value);}
  if(q.manualReview)return adsbJson({status:'provider_paused',error:'manual_review_required',items:[],quota:summary(q,cfg)},503);
  const gate=nextBudgetGate(q,cfg,now);
  if(gate)return adsbJson({status:gate.status,items:[],next_allowed_at:new Date(gate.next).toISOString(),quota:summary(q,cfg)},429,Math.ceil((gate.next-now)/1000));
  const until=Math.max(q.lastAttempt+cfg.minGap,q.blockedUntil);
  if(until>now)return adsbJson({status:'cooldown',items:[],next_allowed_at:new Date(until).toISOString(),quota:summary(q,cfg)},429,Math.ceil((until-now)/1000));
  for(const key of ['s30','minute','hour','day','week','month'])q[key].used++;
  q.lastAttempt=now;
  // Commit BEFORE fetch. Network failure also spends an upstream attempt.
  await storage.put('adsb:quota',q);
  let observedBytes=0;
  try {
    const items=await requestAdsbProvider(selection,adsbKey(env),{fetchImpl,now,onBytes:n=>{observedBytes+=n;}});
    q.rateLimitStreak=0;
    const payload={status:items.length?'ok':'empty',provider:'adsb.lol',mode:selection.mode,
      selection:selection.selection,queried_at:new Date(now).toISOString(),items,cached:false,
      coverage:'receiver_dependent_incomplete',license:'ODbL-1.0',source_url:SOURCE_URL,
      note:'Only source-reported locations; observed_at approximated using provider now − seen_pos. No inferred trajectory.',
    };
    cache.set(selection.cacheKey,{expiresAt:now+CACHE_TTL_MS,data:payload});
    while(cache.size>64)cache.delete(cache.keys().next().value);
    return adsbJson({...payload,quota:summary({...q,day:{...q.day,bytes:q.day.bytes+observedBytes},month:{...q.month,bytes:q.month.bytes+observedBytes}},cfg)});
  } catch(error) {
    const e=error instanceof AdsbError?error:new AdsbError('upstream_unavailable',502);
    if(e.status===429){
      q.rateLimitStreak++;
      q.blockedUntil=Math.max(q.blockedUntil,now+e.retryAfter*1000);
      if(q.rateLimitStreak>=2){q.manualReview=true;q.pauseReason='repeated_429';}
    }
    if(e.code==='upstream_payload_too_large'||e.code==='upstream_auth_failed'){q.manualReview=true;q.pauseReason=e.code;}
    return adsbJson({status:q.manualReview?'provider_paused':e.status===429?'rate_limited':'temporarily_failed',items:[],error:e.code,
      next_allowed_at:e.status===429?new Date(q.blockedUntil).toISOString():null,quota:summary(q,cfg)},
      q.manualReview?503:e.status,e.retryAfter);
  } finally {
    q.day.bytes+=observedBytes;q.month.bytes+=observedBytes;
    await storage.put('adsb:quota',q);
  }
}
