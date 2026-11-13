import {iconFromAIS,iconFromICAOType} from './traffic-classification.mjs';
import type { Map as LibreMap, GeoJSONSource } from "maplibre-gl";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { MapData, MapCallbacks } from "./renderer";
import type { Point } from "../cases/model";

// One MapLibre context for basemap, events and Trace. No second WebGL canvas.
export function attachOverlay(map: LibreMap, callbacks: MapCallbacks, onReady: () => void) {
  const source = "nv-overlay",trafficSource="nv-traffic";
  const ids = ["nv-ontology-fill","nv-ontology-outline","nv-ontology-points","nv-ontology-selected","nv-evidence-points","nv-evidence-lines","nv-evidence-areas","nv-footprints","nv-direct", "nv-inferred", "nv-scenario", "nv-events", "nv-nearby", "nv-traffic-icons", "nv-traffic-selected", "nv-event-selection", "nv-markers", "nv-counts"];
  const pendingIcons=new Set<string>(),failedIcons=new Set<string>();
  const loadIcon=(id:string)=>{if(map.hasImage?.(id)||pendingIcons.has(id)||failedIcons.has(id))return;pendingIcons.add(id);map.loadImage(`${import.meta.env.BASE_URL}assets/nightvision/png/2x/${id}.png`).then(({data})=>{if(destroyed)return;if(!map.hasImage(id))map.addImage(id,data,{pixelRatio:2});lastRendered=undefined;if(latest)render(latest);}).catch(()=>failedIcons.add(id)).finally(()=>pendingIcons.delete(id));};
  let lastRendered: MapData | undefined;
  let latest: MapData | undefined, destroyed = false, notified = false;
  const arc = (points: Point[], progress: number): Point[] => {
    if (points.length < 2) return points;
    const start = points[0], end: Point = [...points[1]];
    while (end[0] - start[0] > 180) end[0] -= 360;
    while (end[0] - start[0] < -180) end[0] += 360;
    const a = map.project(start), b = map.project(end), dx = b.x-a.x, dy = b.y-a.y;
    const length = Math.hypot(dx,dy)||1, bend = Math.min(90,length*.2);
    const c = {x:(a.x+b.x)/2-dy/length*bend,y:(a.y+b.y)/2+dx/length*bend};
    return Array.from({length:33},(_,i) => {
      const t=progress*i/32, p=map.unproject([(1-t)**2*a.x+2*(1-t)*t*c.x+t*t*b.x,(1-t)**2*a.y+2*(1-t)*t*c.y+t*t*b.y]);
      return [p.lng,p.lat];
    });
  };
  const groupMarkers = (data:MapData) => {
    const markers: {point:Point;ids:string[]}[] = [];
    if (data.showMarkers) for (const c of data.candidates) {
      if (!c.point) continue;
      const p=map.project(c.point), existing=markers.find(m=>{const q=map.project(m.point);return Math.hypot(q.x-p.x,q.y-p.y)<19;});
      if (existing) existing.ids.push(c.anomaly.anomaly_id);
      else markers.push({point:c.point,ids:[c.anomaly.anomaly_id]});
    }
    if (data.trace?.point) markers.splice(0,markers.length,{point:data.trace.point,ids:data.selected?[data.selected]:[]});
    return markers;
  };
  const render = (data: MapData) => {
    latest = data;
    for(const n of data.nearby??[])if(['vessel','aircraft'].includes(n.kind))loadIcon(n.kind==='vessel'?iconFromAIS(n.ship_type):iconFromICAOType(n.aircraft_type));
    if (destroyed) return;
    if(map.getSource(source)&&lastRendered===data&&!data.trace&&!data.candidates.some(c=>c.point))return;
    if (!map.getSource(source)) {
      if (!map.isStyleLoaded()) return;
      map.addSource(source,{type:"geojson",data:{type:"FeatureCollection",features:[]}});
      map.addSource(trafficSource,{type:"geojson",data:{type:"FeatureCollection",features:[]}});
      map.addLayer({id:'nv-ontology-fill',type:'fill',source,filter:['all',['==',['get','kind'],'ontology-object'],['==',['geometry-type'],'Polygon']],paint:{'fill-color':['match',['get','object_kind'],'satellite_scene','#a89fc7','#8fb7aa'],'fill-opacity':.14}});
      map.addLayer({id:'nv-ontology-outline',type:'line',source,filter:['all',['==',['get','kind'],'ontology-object'],['==',['geometry-type'],'Polygon']],paint:{'line-color':['case',['get','object_selected'],'#fff','#a89fc7'],'line-width':['case',['get','object_selected'],2,1]}});
      map.addLayer({id:'nv-ontology-points',type:'circle',source,filter:['all',['==',['get','kind'],'ontology-object'],['==',['geometry-type'],'Point']],paint:{'circle-radius':7,'circle-color':['match',['get','object_kind'],'vessel','#d1a568','aircraft','#86b6d8','camera','#8fba9f','event','#c87970','#b7b8bc'],'circle-stroke-color':'#e8ecee','circle-stroke-width':1}});
      map.addLayer({id:'nv-ontology-selected',type:'circle',source,filter:['all',['==',['get','kind'],'ontology-object'],['==',['geometry-type'],'Point'],['==',['get','object_selected'],true]],paint:{'circle-radius':12,'circle-opacity':0,'circle-stroke-color':'#fff','circle-stroke-width':1.5}});
      for (const [id,kind,dash] of [["nv-direct","direct",null],["nv-inferred","inferred",[5,4]],["nv-scenario","scenario",[1,5]]] as const)
        map.addLayer({id,type:"line",source,filter:["==",["get","kind"],kind],paint:{"line-color":kind==="direct"?"#ecece8":"#a7a7a7","line-width":1.5,...(dash?{"line-dasharray":[...dash]}:{})}});
    map.addLayer({id:'nv-footprints',type:'fill',source,filter:['==',['get','kind'],'satellite'],paint:{'fill-color':'#9a91bf','fill-opacity':.12,'fill-outline-color':'#aaa0d0'}});

      map.addLayer({id:'nv-evidence-areas',type:'fill',source,filter:['all',['==',['get','kind'],'evidence'],['==',['geometry-type'],'Polygon']],paint:{'fill-color':'#a2b7ca','fill-opacity':.12}});
      map.addLayer({id:'nv-evidence-lines',type:'line',source,filter:['all',['==',['get','kind'],'evidence'],['==',['geometry-type'],'LineString']],paint:{'line-color':['match',['get','evidence_status'],'inferred','#c99b61','scenario','#b69ad1','#9bb9cc'],'line-width':2,'line-dasharray':[3,2]}});
      map.addLayer({id:'nv-evidence-points',type:'circle',source,filter:['all',['==',['get','kind'],'evidence'],['==',['geometry-type'],'Point']],paint:{'circle-radius':6,'circle-color':'#9bb9cc','circle-stroke-color':'#fff','circle-stroke-width':1}});
      map.addLayer({id:"nv-events",type:"circle",source,filter:["==",["get","kind"],"event"],paint:{"circle-radius":["get","radius"],"circle-color":["get","color"],"circle-opacity":["case",["==",["get","precision"],1],.9,.55],"circle-stroke-color":["case",["get","selected"],"#ffffff",["get","color"]],"circle-stroke-width":["case",["get","selected"],2,1]}});
      map.addLayer({id:"nv-nearby",type:"circle",source:trafficSource,filter:["==",["get","kind"],"nearby"],paint:{"circle-radius":["case",["in",["get","category"],["literal",["vessel","aircraft"]]],2.5,7],"circle-color":["match",["get","category"],"aircraft","#d1d7db","vessel","#d1d7db","#8fba9f"],"circle-stroke-color":"#fff","circle-stroke-width":1.5}});
      for(const selected of [false,true])map.addLayer({id:selected?'nv-traffic-selected':'nv-traffic-icons',type:'symbol',source:trafficSource,filter:['all',['==',['get','kind'],'nearby'],['in',['get','category'],['literal',['vessel','aircraft']]],['==',['get','aisSelected'],selected]],layout:{'icon-image':['get','icon_id'],'icon-size':['interpolate',['linear'],['zoom'],1,selected?.4:.16,8,selected?.5:.38],'icon-allow-overlap':selected,'icon-ignore-placement':selected,'icon-rotate':['coalesce',['get','bearing'],0],'icon-rotation-alignment':'map','icon-pitch-alignment':'map'},paint:{'icon-opacity':['case',['get','direction_known'],1,.65]}});
      map.addLayer({id:"nv-event-selection",type:"circle",source,filter:["all",["==",["get","kind"],"event"],["==",["get","selected"],true]],paint:{"circle-radius":["+",["get","radius"],5],"circle-color":"#ffffff","circle-opacity":0,"circle-stroke-color":"#f2f2f0","circle-stroke-width":2}});
      map.addLayer({id:"nv-markers",type:"circle",source,filter:["==",["get","kind"],"marker"],paint:{"circle-radius":["case",[">",["get","count"],1],12,7],"circle-color":["case",["get","selected"],"#ebebe6","#181818"],"circle-stroke-color":"#ebebe6","circle-stroke-width":1.2}});
      map.addLayer({id:"nv-counts",type:"symbol",source,filter:["all",["==",["get","kind"],"marker"],[">",["get","count"],1]],layout:{"text-field":["to-string",["get","count"]],"text-font":["Noto Sans Regular"],"text-size":11,"text-allow-overlap":true},paint:{"text-color":"#f2f2f0"}});
    }
    lastRendered=data;
    const features: Feature<Geometry>[] = [];
    const point = (p:Point,properties:Record<string,unknown>) => features.push({type:"Feature",geometry:{type:"Point",coordinates:p},properties});
    for(const f of data.footprints??[])features.push({type:'Feature',geometry:f.geometry,properties:{kind:'satellite',id:f.id}});
    for(const f of data.evidenceFeatures??[])features.push({...f,properties:{...f.properties,kind:'evidence'}});
    for(const f of data.ontologyFeatures?.features??[])features.push({...f,properties:{...f.properties,object_kind:f.properties?.object_kind??f.properties?.kind,object_selected:f.properties?.object_id===data.selectedObject,kind:'ontology-object'}});
    const markers=groupMarkers(data);
    for (const m of markers) point(m.point,{kind:"marker",ids:JSON.stringify(m.ids),count:m.ids.length,selected:m.ids.includes(data.selected??"")});
    for (const e of data.events??[]) point([e.lon,e.lat],{kind:"event",id:e.id,precision:e.precision,color:e.color??"#e1e1dc",radius:e.radius??5,selected:e.id===data.selected});
    traffic(data.nearby??[]);
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const path of data.trace?.paths??(data.showLinks?data.links:[])) {
      const coordinates=data.trace?arc(path.points,reduced?1:data.trace.progress):path.points;
      if (coordinates.length<2) continue;
      features.push({type:"Feature",geometry:{type:"LineString",coordinates},properties:{kind:["observed","documented"].includes(path.status)?"direct":path.status==="scenario"?"scenario":"inferred"}});
    }
    (map.getSource(source) as GeoJSONSource).setData({type:"FeatureCollection",features} as FeatureCollection);
    if (!notified) {notified=true;map.once("render",onReady);}
  };
  const traffic=(items:NonNullable<MapData['nearby']>)=>{if(latest)latest.nearby=items;const target=map.getSource(trafficSource) as GeoJSONSource|undefined;if(!target)return;for(const n of items)if(['vessel','aircraft'].includes(n.kind))loadIcon(n.kind==='vessel'?iconFromAIS(n.ship_type):iconFromICAOType(n.aircraft_type));target.setData({type:'FeatureCollection',features:items.map(n=>({type:'Feature',id:n.id,geometry:{type:'Point',coordinates:[n.lon,n.lat]},properties:{kind:'nearby',category:n.kind,id:n.id,aisSelected:n.selected===true,icon_id:n.kind==='vessel'?iconFromAIS(n.ship_type):iconFromICAOType(n.aircraft_type),bearing:n.heading_deg??n.course_deg??0,direction_known:Number.isFinite(n.heading_deg)||Number.isFinite(n.course_deg)}}))});};
  const reload = () => {if(latest) render(latest);};
  map.on("style.load",reload);
  return {
    render,traffic,
    pick(x:number,y:number) {
      if(!latest) return null;
      // Project canonical points at the current camera; worker tile updates may
      // still contain clusters from the previous zoom for a frame.
      for(const m of groupMarkers(latest)) {
        const p=map.project(m.point);
        if(Math.hypot(p.x-x,p.y-y)<=22) {callbacks.pick(m.ids);return m;}
      }
      if(latest.ontologyFeatures?.features.length){
        const matches=map.queryRenderedFeatures?.([[x-9,y-9],[x+9,y+9]],{layers:['nv-ontology-points','nv-ontology-fill']})??[];
        const match=matches[0];if(match?.properties?.object_id){callbacks.object?.({...match.properties,kind:match.properties.object_kind});return match;}
        const point=(latest.ontologyFeatures.features.filter(f=>f.geometry.type==='Point').map(f=>{const p=map.project((f.geometry as import('geojson').Point).coordinates as Point);return {f,d:Math.hypot(p.x-x,p.y-y)};}).filter(v=>v.d<=12).sort((a,b)=>a.d-b.d))[0]?.f;
        if(point){callbacks.object?.(point.properties??{});return point;}
      }
      const nearby=(latest.nearby??[]).map(e=>{const p=map.project([e.lon,e.lat]);return {e,d:Math.hypot(p.x-x,p.y-y)};}).filter(({d})=>d<=11).sort((a,b)=>a.d-b.d)[0]?.e;
      if(nearby){callbacks.nearby?.(nearby.id);return nearby;}
      const event=(latest.events??[]).map(e=>{const p=map.project([e.lon,e.lat]);return {e,d:Math.hypot(p.x-x,p.y-y)};}).filter(({e,d})=>d<=Math.max(10,(e.radius??5)+3)).sort((a,b)=>a.d-b.d)[0]?.e;
      if(event){callbacks.event?.(event.id);return event;}
      return null;
    },
    destroy() {
      destroyed=true;map.off("style.load",reload);
      for (const id of [...ids].reverse()) if(map.getLayer(id)) map.removeLayer(id);
      if(map.getSource(source)) map.removeSource(source);
      if(map.getSource(trafficSource))map.removeSource(trafficSource);
    },
  };
}
