import { test, expect } from 'vitest';
import { flatBlack } from '../src/map/basemap';
test('detail styling retains source attribution and label definitions', () => {
 const style:any={version:8,sources:{world:{type:'vector',url:'https://tiles.openfreemap.org/planet',attribution:'OpenStreetMap'}},glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',layers:[{id:'city',type:'symbol',source:'world','source-layer':'place',layout:{'text-field':['get','name']}},{id:'road',type:'line',source:'world','source-layer':'transportation'}]};
 const out=flatBlack(style);
 expect(out.sources).toEqual(style.sources); expect(out.glyphs).toBe(style.glyphs);
 expect(out.layers[0].layout).toEqual(style.layers[0].layout);
 expect(out.layers[1].paint).not.toEqual(style.layers[1].paint);
});
