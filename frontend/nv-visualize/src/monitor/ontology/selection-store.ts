import type {OntologyEntity, OntologyIdentifier, OntologyObservation, OntologyClaim, OntologyRelation, OntologySource, OntologyAnomaly} from '../../contracts/ontology-v2';
export type Kind=OntologyEntity['kind'];
export interface Dossier {
 schema_version:'nv-dossier/2.0';synthetic:boolean;object:OntologyEntity;identifiers:OntologyIdentifier[];
 latest_observation:OntologyObservation|null;timeline:OntologyObservation[];claims:OntologyClaim[];
 relations:OntologyRelation[];sources:OntologySource[];anomalies:OntologyAnomaly[];
 coverage:{total_observations:number;more_possible?:boolean;next_cursor?:string|null};
 diagnostics:{historical_track_available?:boolean;[key:string]:unknown};
}
export type Pick={object_id:string;kind:Kind|null};
export type Selection={phase:'idle'}|{phase:'loading';pick:Pick}|{phase:'loaded';pick:Pick;dossier:Dossier}|{phase:'error';pick:Pick;error:string};
export const validID=(id:unknown):id is string=>typeof id==='string'&&id.length>=3&&id.length<=256&&/^[A-Za-z][A-Za-z0-9:._@-]+$/.test(id);
export const kinds=new Set<Kind>(['event','vessel','aircraft','satellite_scene','camera','facility','organization','location','person_public','document','anomaly']);
export const statuses=new Set(['observed','documented','reported','inferred','scenario','refuted','unresolved']);
export function featurePick(props:Record<string,unknown>):Pick|null{
 const kind=props.object_kind??props.kind;if(!validID(props.object_id)||!kinds.has(kind as Kind)||!statuses.has(String(props.status??props.evidence_status)))return null;
 let sources=props.source_ids;if(typeof sources==='string'){try{sources=JSON.parse(sources);}catch{return null;}}
 if(!Array.isArray(sources)||!sources.length||sources.length>500||!sources.every(validID))return null;
 return {object_id:props.object_id,kind:kind as Kind};
}
export function validGeometry(value:unknown):boolean{
 if(!value||typeof value!=='object')return false;const g=value as {type?:string;coordinates?:unknown};let size=0;
 const point=(p:unknown):boolean=>Array.isArray(p)&&p.length===2&&++size<=20000&&p.every(n=>typeof n==='number'&&Number.isFinite(n))&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
 const polygon=(p:unknown):boolean=>Array.isArray(p)&&p.length>0&&p.length<=20&&p.every(r=>Array.isArray(r)&&r.length>=4&&r.length<=1000&&r.every(point)&&JSON.stringify(r[0])===JSON.stringify(r.at(-1)));
 return g.type==='Point'?point(g.coordinates):g.type==='Polygon'?polygon(g.coordinates):g.type==='MultiPolygon'&&Array.isArray(g.coordinates)&&g.coordinates.length>0&&g.coordinates.length<=20&&g.coordinates.every(polygon);
}
const plain=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const validSources=(ids:unknown)=>Array.isArray(ids)&&ids.length<=500&&ids.every(validID)&&new Set(ids).size===ids.length;
export function readDossier(value:unknown,id:string,kind:Kind|null=null):Dossier{
 const d=value as Dossier;if(d?.schema_version!=='nv-dossier/2.0'||d.object?.entity_id!==id||!kinds.has(d.object.kind)||(kind!==null&&d.object.kind!==kind)||!statuses.has(d.object.status)||typeof d.object.display_name!=='string'||typeof d.synthetic!=='boolean')throw Error('객체 응답의 식별자를 검증하지 못했습니다.');
 for(const key of ['identifiers','timeline','claims','relations','sources','anomalies'] as const)if(!Array.isArray(d[key])||d[key].length>1000)throw Error('객체 자료 형식을 검증하지 못했습니다.');
 if(!d.coverage||!Number.isInteger(d.coverage.total_observations)||d.coverage.total_observations<0||!plain(d.diagnostics)||!plain(d.object.attributes)||!validSources(d.object.source_ids))throw Error('관측 범위를 검증하지 못했습니다.');
 const sources=new Set(d.sources.map(s=>s.source_id));if(sources.size!==d.sources.length||d.sources.some(s=>!validID(s.source_id)))throw Error('출처 식별자를 검증하지 못했습니다.');
 for(const o of [...d.timeline,...(d.latest_observation?[d.latest_observation]:[])]){if(!o||o.entity_id!==id||!validID(o.observation_id)||!statuses.has(o.status)||!validSources(o.source_ids)||!o.source_ids.length||!o.source_ids.every(s=>sources.has(s))||!plain(o.measurements))throw Error('다른 객체의 관측 자료 또는 누락된 출처가 포함되어 있습니다.');if(o.geometry!==null&&(!validGeometry(o.geometry)||!o.source_ids.includes(o.geometry_source_id??'')||d.object.kind==='person_public'))throw Error('출처가 연결된 지오메트리를 검증하지 못했습니다.');}
 if(d.coverage.next_cursor!==undefined&&d.coverage.next_cursor!==null&&(typeof d.coverage.next_cursor!=='string'||d.coverage.next_cursor.length>1000))throw Error('관측 페이지를 검증하지 못했습니다.');
 return d;
}
export async function fetchDossier(id:string,signal:AbortSignal,cursor?:string):Promise<Dossier>{
 const query=cursor?'?cursor='+encodeURIComponent(cursor):'';const r=await fetch('/api/v2/ontology/objects/'+encodeURIComponent(id)+query,{signal,credentials:'same-origin',cache:'no-store'});
 if(!r.ok)throw Error(r.status===404?'객체를 찾지 못했습니다. 목록을 갱신하세요.':r.status===503?'객체 자료가 준비되지 않았습니다. 기존 사건 탐색을 사용할 수 있습니다.':'객체 연결을 확인할 수 없습니다.');return readDossier(await r.json(),id);
}
export class SelectionStore{
 private controller:AbortController|null=null;private generation=0;private disposed=false;private listeners=new Set<(state:Selection)=>void>();private current:Selection={phase:'idle'};
 constructor(private requester:(id:string,signal:AbortSignal)=>Promise<Dossier>=fetchDossier){}
 get state(){return this.current;}
 subscribe(fn:(state:Selection)=>void){this.listeners.add(fn);fn(this.current);return()=>{this.listeners.delete(fn);};}
 private set(state:Selection){this.current=state;for(const fn of this.listeners)fn(state);}
 async select(pick:Pick){if(!validID(pick.object_id))throw Error('잘못된 객체 ID입니다.');if(this.disposed)return;const generation=++this.generation;this.controller?.abort();const controller=new AbortController();this.controller=controller;this.set({phase:'loading',pick});try{const result=readDossier(await this.requester(pick.object_id,controller.signal),pick.object_id,pick.kind);if(controller.signal.aborted||generation!==this.generation||this.disposed)return;this.set({phase:'loaded',pick,dossier:result});}catch(e){if(!controller.signal.aborted&&generation===this.generation&&!this.disposed)this.set({phase:'error',pick,error:(e as Error).message});}}
 clear(){this.generation++;this.controller?.abort();this.controller=null;this.set({phase:'idle'});}
 dispose(){this.disposed=true;this.clear();this.listeners.clear();}
}
