/** Presentation follows reported estimates, never an inferred risk or live status. */
export interface EventRecord {
  id: string; country: string; day: string; end_day?: string; title: string;
  kind: string; precision?: number; lat: number | null; lon: number | null;
  low?: number | null; best?: number | null; high?: number | null;
  actors?: string[]; conflict_type?: string; dataset?: string; upstream_id?: string;
  version?: string; upstream_estimates?: {low:number|null;best:number|null;high:number|null};
  fatality_validation?: string; source_url: string; acquired_at?: string; hash: string;
}
export type EventPalette = 'red' | 'amber' | 'mono';
export const magnitudeLabels = ['미상', '0명', '1–9명', '10–49명', '50명 이상'];
const palettes: Record<EventPalette, string[]> = {
 red: ['#8c9299','#a99d98','#bb8074','#cf6659','#df4d45'],
 amber: ['#8c9299','#a99f8d','#bfa16d','#d4a34e','#e8ac44'],
 mono: ['#777f88','#a1a1a1','#b9b9b9','#d3d3d3','#f2f2f0'],
};
export function eventMagnitude(r: Pick<EventRecord,'kind'|'best'|'fatality_validation'>) {
 const n=r.best;
 return r.kind!=='ucdp'||r.fatality_validation==='invalid_provider_estimates'||!Number.isFinite(n)||n==null||n<0 ? 0 : n===0?1:n<10?2:n<50?3:4;
}
export function eventAppearance(r: Pick<EventRecord,'kind'|'best'|'fatality_validation'>, palette:EventPalette, scale=1) {
 const level=eventMagnitude(r);
 return {color:palettes[palette][level],radius:[4.5,4.5,6,8,10][level]*scale};
}
export function conflictLabel(r: EventRecord) {
 if(r.kind!=='ucdp')return '보고된 사건';
 return ({'1':'국가 기반 무력분쟁','2':'비국가 행위자 간 분쟁','3':'민간인 대상 일방적 폭력'} as Record<string,string>)[r.conflict_type??'']??'분쟁 유형 미제공';
}
export function eventPeriod(r: EventRecord) {return r.day+(r.end_day&&r.end_day!==r.day?' ~ '+r.end_day:'');}
