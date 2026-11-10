import {test,expect,vi,afterEach} from 'vitest';
afterEach(()=>vi.unstubAllGlobals());
import {eventMagnitude,eventAppearance,eventPeriod,conflictLabel,type EventRecord} from '../src/monitor/events';
test('event magnitudes separate unknown, zero and reported fatality estimates',()=>{
 const base={kind:'ucdp'};
 expect([null,0,1,9,10,49,50,100].map(best=>eventMagnitude({...base,best}))).toEqual([0,1,2,2,3,3,4,4]);
 expect(eventMagnitude({...base,best:10,fatality_validation:'invalid_provider_estimates'})).toBe(0);
 expect(eventMagnitude({kind:'rss',best:100})).toBe(0);
 expect(eventAppearance({...base,best:50},'red').radius).toBeGreaterThan(eventAppearance({...base,best:1},'red').radius);
 expect(eventAppearance({...base,best:10},'amber').color).not.toBe(eventAppearance({...base,best:10},'mono').color);
 expect(eventAppearance({...base,best:10},'red',1.3).radius).toBe(10.4);
});
test('presentation preserves date ranges and provider conflict classifications without claiming live status',()=>{
 const r={kind:'ucdp',day:'2026-01-01',end_day:'2026-01-03',conflict_type:'3'} as EventRecord;
 expect(eventPeriod(r)).toBe('2026-01-01 ~ 2026-01-03');
 expect(conflictLabel(r)).toBe('민간인 대상 일방적 폭력');
 expect(conflictLabel({...r,conflict_type:'999'})).toBe('분쟁 유형 미제공');
});

import {attachOverlay} from '../src/map/overlay';
import type {MapData} from '../src/map/renderer';
test('selection stays in map source and picking chooses the closest event at the current camera',()=>{
 vi.stubGlobal('window',{matchMedia:()=>({matches:false})});
 let packet:any;const layers:any[]=[];let source:any;const picked:string[]=[];
 const map:any={getSource:()=>source,isStyleLoaded:()=>true,addSource:()=>{source={setData:(data:any)=>{packet=data;}}},addLayer:(layer:any)=>layers.push(layer),project:([x,y]:number[])=>({x,y}),on:()=>{},once:()=>{}};
 const overlay=attachOverlay(map,{pick:()=>{},event:id=>picked.push(id),move:()=>{},error:()=>{},ready:()=>{},dismiss:()=>{}},()=>{});
 const data:MapData={events:[{id:'far',lon:0,lat:0,precision:2,color:'#cf6659',radius:8},{id:'near',lon:8,lat:0,precision:1,color:'#e1e1dc',radius:6}],selected:'near',candidates:[],links:[],showLinks:false,showMarkers:true};
 overlay.render(data);
 expect(packet.features.find((f:any)=>f.properties.id==='near').properties.selected).toBe(true);
 expect(packet.features.find((f:any)=>f.properties.id==='far').properties.selected).toBe(false);
 expect(layers.some(layer=>layer.id==='nv-event-selection')).toBe(true);
 overlay.pick(7,0);expect(picked).toEqual(['near']);
 overlay.render({...data,selected:null});expect(packet.features.some((f:any)=>f.properties.selected)).toBe(false);
});
