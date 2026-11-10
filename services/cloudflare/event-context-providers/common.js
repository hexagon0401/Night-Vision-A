export const statuses=['ok','empty','irrelevant','key_required','terms_pending','rate_limited','historical_unavailable','temporarily_failed','disabled'];
export const roles=['direct','corroborating','candidate','context_only','contradictory'];
export function safeURL(value) {
 try {const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!/^([\d.]+|localhost|.*\.local)$/i.test(u.hostname)&&!u.hostname.includes(':')?u.href:null;}catch{return null;}
}
export const shift=(day,n)=>new Date(Date.parse(day+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
export const iso=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():null;
export function temporal(record,time,live=false) {if(live)return 'present_context';const day=iso(time)?.slice(0,10);return !day?'unknown':day>=record.day&&day<=record.end_day?'event_time':day>record.end_day?'post_event':'unknown';}
export function item(provider,kind,id,title,url,now) {
 return {id:provider+':'+id,kind,provider_id:provider,source_id:provider+':'+id,title:String(title).slice(0,500),url:safeURL(url),thumbnail_url:null,description:null,publisher:null,author:null,acquired_at_utc:now,published_at_utc:null,observed_from_utc:null,observed_to_utc:null,location:{lat:null,lon:null,accuracy_m:null,geometry_geojson:null,location_claim:null},satellite:null,camera:null,temporal_role:'unknown',evidence_role:'context_only',relation_reasons:[],disconfirming_checks:['Same place or date is not proof of incident identity.'],relevance:{tier:'unscored',feature_scores:{}},media_license_status:'link_only',attribution:null,source_independence_group:null,warnings:[],raw_source_ref:null};
}
export async function boundedJSON(url,options={},max=1000000) {
 const response=await fetch(url,{...options,redirect:'manual',signal:AbortSignal.timeout(10000)});
 if(response.status===429){const seconds=Number(response.headers.get('retry-after'));const e=new Error('rate_limited');e.retry=new Date(Date.now()+(Number.isFinite(seconds)&&seconds>0?Math.min(seconds,86400):3600)*1000).toISOString();throw e;}
 if(!response.ok)throw new Error('upstream_http_'+response.status);
 if(!response.headers.get('content-type')?.includes('json'))throw new Error('upstream_not_json');
 const reader=response.body.getReader();let size=0;const chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error('upstream_size_limit');chunks.push(value);}}finally{await reader.cancel();}
 const buffer=new Uint8Array(size);let at=0;for(const c of chunks){buffer.set(c,at);at+=c.length;}return JSON.parse(new TextDecoder().decode(buffer));
}
export function bbox(record) {
 if(![1,2].includes(record.precision)||!Number.isFinite(record.lat)||!Number.isFinite(record.lon)||Math.abs(record.lat)>85||Math.abs(record.lon)>179.5)return null;
 const d=record.precision===1?.15:.3;return [record.lon-d,record.lat-d,record.lon+d,record.lat+d];
}
export function validGeometry(g){
 if(g===null)return true;if(g?.type!=='Polygon'||!Array.isArray(g.coordinates)||g.coordinates.length>20)return false;
 return g.coordinates.every(r=>Array.isArray(r)&&r.length>=4&&r.length<=1000&&r.every(p=>Array.isArray(p)&&p.length===2&&Number.isFinite(p[0])&&Math.abs(p[0])<=180&&Number.isFinite(p[1])&&Math.abs(p[1])<=90)&&r[0][0]===r.at(-1)[0]&&r[0][1]===r.at(-1)[1]);
}
export function validateBundle(b) {
 if(b?.schema_version!=='event_context.v1'||!/^ucdp:[\w.:-]{1,175}$/.test(b.event_ref?.id)||!/^[a-f0-9]{64}$/.test(b.event_ref.original_hash)||!Array.isArray(b.items)||b.items.length>100||!Array.isArray(b.provider_runs)||b.provider_runs.length>20)throw new Error('invalid_context_bundle');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(b.event_ref.interval?.from)||b.event_ref.interval.from>b.event_ref.interval.to||!iso(b.generated_at_utc)||!validGeometry(b.event_ref.location?.geometry_geojson))throw new Error('invalid_event_context_reference');
 const ids=new Set();for(const i of b.items){if(!i||ids.has(i.id)||!safeURL(i.url)||i.thumbnail_url!==null||!roles.includes(i.evidence_role)||!['event_time','post_event','present_context','unknown'].includes(i.temporal_role)||!iso(i.acquired_at_utc)||typeof i.title!=='string'||i.title.length>500||!Array.isArray(i.warnings)||!Array.isArray(i.relation_reasons)||!b.provider_runs.some(p=>p.provider_id===i.provider_id))throw new Error('invalid_context_item');if(i.location&&((i.location.lat!==null&&(!Number.isFinite(i.location.lat)||Math.abs(i.location.lat)>90))||(i.location.lon!==null&&(!Number.isFinite(i.location.lon)||Math.abs(i.location.lon)>180))||!validGeometry(i.location.geometry_geojson)))throw new Error('invalid_context_geometry');ids.add(i.id);if(['cctv','adsb','ais'].includes(i.kind)&&i.temporal_role==='present_context'&&i.evidence_role!=='context_only')throw new Error('live_not_historical_evidence');if(i.satellite?.asset_url!==undefined&&i.satellite.asset_url!==null)throw new Error('unapproved_asset');}
 for(const p of b.provider_runs)if(!statuses.includes(p.status)||typeof p.cached!=='boolean'||!iso(p.completed_at_utc)||!Number.isInteger(p.fetched_count)||p.fetched_count<0)throw new Error('invalid_provider_run');
 for(const role of roles)if(b.counts[role]!==b.items.filter(i=>i.evidence_role===role).length)throw new Error('invalid_counts');if(b.counts.total!==b.items.length)throw new Error('invalid_counts');return b;
}
