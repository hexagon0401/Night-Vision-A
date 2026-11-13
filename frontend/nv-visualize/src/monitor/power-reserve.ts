/** Display-only replay of confirmed observations. Never extrapolates a route. */
export type TrafficKind='vessels'|'aircraft';
export type TrafficObject={id:string;kind:string;lat:number;lon:number;title:string;observed_at:string;mmsi?:string;icao24?:string;heading_deg?:number|null;course_deg?:number|null;speed_knots?:number|null;ship_type?:number;aircraft_type?:string|null;source_url?:string;provider?:string;ship_name?:string|null;flag_country?:string|null;flag_mid?:string|null;[key:string]:unknown};
type Point={time:number;lat:number;lon:number;heading:number|null;course:number|null};
type Track={latest:TrafficObject;points:Point[]};
export type ReplayObject=TrafficObject&{selected?:boolean;playback_at:string;observation_from:string;observation_to:string;interpolated:boolean;reserve_ms:number;waiting:boolean};
export const MAX_DELAY=600000;
export const angle=(a:number|null,b:number|null,t:number)=>a===null||b===null?a:((a+(((b-a+540)%360)-180)*t)%360+360)%360;
const dir=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<360?n:null;
export function position(a:Point,b:Point,t:number){
 const rad=Math.PI/180,vec=(p:Point)=>[Math.cos(p.lat*rad)*Math.cos(p.lon*rad),Math.cos(p.lat*rad)*Math.sin(p.lon*rad),Math.sin(p.lat*rad)],u=vec(a),v=vec(b),omega=Math.acos(Math.max(-1,Math.min(1,u.reduce((s,n,i)=>s+n*v[i],0))));
 if(omega<1e-9)return {lat:a.lat,lon:a.lon};if(Math.PI-omega<1e-6)return {lat:a.lat,lon:a.lon};
 const x=Math.sin((1-t)*omega)/Math.sin(omega),y=Math.sin(t*omega)/Math.sin(omega),p=u.map((n,i)=>x*n+y*v[i]);return {lon:Math.atan2(p[1],p[0])/rad,lat:Math.atan2(p[2],Math.hypot(p[0],p[1]))/rad};
}
export function inside(lon:number,lat:number,b:number[]){return lat>=b[1]&&lat<=b[3]&&(b[0]<=b[2]?lon>=b[0]&&lon<=b[2]:lon>=b[0]||lon<=b[2]);}
export class PowerReserve{
 tracks=new Map<string,Track>();cursor=0;delay:number;target:number;revision=0;private lastWall=0;
 constructor(public kind:TrafficKind){this.delay=this.target=kind==='vessels'?120000:180000;}
 get gap(){return this.kind==='vessels'?300000:120000;}
 setDelay(ms:number){this.target=Math.max(this.kind==='vessels'?120000:180000,Math.min(MAX_DELAY,ms));}
 tick(now:number,starved=false){
  if(!this.lastWall){this.cursor=now-this.delay;this.lastWall=now;return;}
  const elapsed=Math.max(0,now-this.lastWall);this.lastWall=now;
  if(starved)this.target=Math.min(MAX_DELAY,Math.max(this.target,this.delay)+elapsed);
  const desired=now-this.target;
  // Build reserve by holding the clock; release it at at most 1.1x. Never rewind.
  this.cursor=Math.max(this.cursor,Math.min(desired,this.cursor+elapsed*1.1));this.delay=Math.max(0,now-this.cursor);
 }
 ingest(items:TrafficObject[],now=Date.now()){
  for(const item of items){const time=Date.parse(item?.observed_at);if(!item||!(item.kind==='aircraft'?/^[a-f0-9]{6}$/.test(item.icao24??''):/^\d{9}$/.test(item.mmsi??''))||!Number.isFinite(time)||time>now+10000||now-time>this.gap||!Number.isFinite(item.lat)||!Number.isFinite(item.lon)||Math.abs(item.lat)>85||Math.abs(item.lon)>180)continue;
   const track=this.tracks.get(item.id);if(track&&Date.parse(track.latest.observed_at)>time)continue;
   const p={time,lat:item.lat,lon:item.lon,heading:dir(item.heading_deg),course:dir(item.course_deg)};
   if(track){const last=track.points.at(-1)!;if(last.time===time)track.points[track.points.length-1]=p;else track.points.push(p);track.latest=item;track.points=track.points.slice(-32);}else this.tracks.set(item.id,{latest:item,points:[p]});
  }
  this.revision++;this.prune(now);
 }
 remove(ids:string[]){for(const id of ids)this.tracks.delete(id);if(ids.length)this.revision++;}
 prune(now:number){
  for(const [id,t]of this.tracks){t.points=t.points.filter(p=>now-p.time<=MAX_DELAY+this.gap);if(!t.points.length){this.tracks.delete(id);this.revision++;}}
  while(this.tracks.size>10000)this.tracks.delete(this.tracks.keys().next().value!);
  // At most 200k compact samples per layer, with two endpoints retained per object.
  let count=[...this.tracks.values()].reduce((s,t)=>s+t.points.length,0);if(count>200000)for(const t of this.tracks.values()){const drop=Math.min(t.points.length-2,count-200000);if(drop>0){t.points.splice(0,drop);count-=drop;}if(count<=200000)break;}
 }
 sample(id:string,interpolate=true):ReplayObject|null{
  const track=this.tracks.get(id);if(!track)return null;const points=track.points;let a=points[0],b=a;
  for(const p of points){if(p.time<=this.cursor)a=p;else{b=p;break;}b=a;}
  if(this.cursor-a.time>this.gap)return null;
  const valid=b.time>a.time&&b.time-a.time<=this.gap&&this.cursor>=a.time&&this.cursor<=b.time;
  const t=valid?(this.cursor-a.time)/(b.time-a.time):0,p=valid&&interpolate?position(a,b,t):{lat:a.lat,lon:a.lon};let end=valid?b.time:a.time;
  for(const point of points.filter(p=>p.time>end)){if(point.time-end>this.gap)break;end=point.time;}
  return {...track.latest,...p,heading_deg:valid&&interpolate?angle(a.heading,b.heading,t):a.heading,course_deg:valid&&interpolate?angle(a.course,b.course,t):a.course,playback_at:new Date(this.cursor).toISOString(),observation_from:new Date(a.time).toISOString(),observation_to:new Date(valid?b.time:a.time).toISOString(),interpolated:valid&&interpolate,reserve_ms:Math.max(0,end-Math.max(a.time,this.cursor)),waiting:!valid};
 }
 candidates(bounds:number[]){return [...this.tracks].filter(([,t])=>t.points.some(p=>inside(p.lon,p.lat,bounds))).map(([id])=>id);}
 visible(bounds:number[],selected:string|null=null,ids:Iterable<string>=this.tracks.keys(),interpolate=true){const rows:ReplayObject[]=[];for(const id of ids){const t=this.tracks.get(id);if(!t)continue;
   // Cheap culling before spherical interpolation; include endpoints and selected.
   if(id!==selected&&!t.points.some(p=>inside(p.lon,p.lat,bounds)))continue;const s=this.sample(id,interpolate);if(s&&(inside(s.lon,s.lat,bounds)||id===selected))rows.push({...s,selected:id===selected});
  }return rows;}
}
// Session-only reserve survives view remounts; raw positions never go to disk.
export const reserves={vessels:new PowerReserve('vessels'),aircraft:new PowerReserve('aircraft')};
