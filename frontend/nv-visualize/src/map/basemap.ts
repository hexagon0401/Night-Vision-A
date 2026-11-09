import type { StyleSpecification } from 'maplibre-gl';

export const DETAIL_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
// Runtime styling of the upstream style; retain its sources, attribution and fonts.
export function flatBlack(input: StyleSpecification): StyleSpecification {
  const style = structuredClone(input);
  for (const layer of style.layers) {
    if (layer.type === 'background') layer.paint = { 'background-color': '#050505' };
    if (layer.type === 'fill') layer.paint = { ...layer.paint, 'fill-color': /water/i.test(layer.id) ? '#050505' : '#141414' };
    if (layer.type === 'line') layer.paint = { ...layer.paint, 'line-color': /road|transport/i.test(layer.id) ? '#666666' : '#999999' };
    if (layer.type === 'symbol') layer.paint = { ...layer.paint, 'text-color': '#e7e7e5', 'text-halo-color': '#101010', 'text-halo-width': 1 };
    // OSM buildings remain flat; no terrain/extrusion or satellite imagery.
    if (layer.type === 'fill-extrusion') layer.layout = { ...layer.layout, visibility: 'none' };
  }
  return style;
}
