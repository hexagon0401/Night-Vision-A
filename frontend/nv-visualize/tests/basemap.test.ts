import { test, expect } from 'vitest';
import { flatBlack } from '../src/map/basemap';
test('detail styling retains source attribution and label definitions', () => {
 const style:any={version:8,sources:{world:{type:'vector',url:'https://tiles.openfreemap.org/planet',attribution:'OpenStreetMap'}},glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',layers:[{id:'city',type:'symbol',source:'world','source-layer':'place',layout:{'text-field':['get','name']}},{id:'road',type:'line',source:'world','source-layer':'transportation'}]};
 const out=flatBlack(style);
 expect(out.sources).toEqual(style.sources); expect(out.glyphs).toBe(style.glyphs);
 expect(out.layers[0].layout).toEqual(style.layers[0].layout);
 expect(out.layers[1].paint).not.toEqual(style.layers[1].paint);
});

import pinned from '../src/map/detail-style.json';
test('ocean and land stay visibly distinct without terrain or sprite dependencies', () => {
 const background=pinned.layers.find(l=>l.id==='background')!.paint as any;
 const water=pinned.layers.find(l=>l.id==='water')!.paint as any;
 const gray=(hex:string)=>parseInt(hex.slice(1,3),16);
 expect(gray(background['background-color'])-gray(water['fill-color'])).toBeGreaterThanOrEqual(24);
 expect(pinned.layers.length).toBeLessThan(25);
 expect(pinned.layers.some(l=>l.id==='roads')).toBe(true);
 expect(pinned.layers.some(l=>l.id==='label_city')).toBe(true);
 expect(JSON.stringify(pinned)).not.toMatch(/fill-pattern|icon-image|fill-extrusion|hillshade/);
});
