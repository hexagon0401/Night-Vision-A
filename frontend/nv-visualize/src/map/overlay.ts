import type { Map as LibreMap, IControl } from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer, PathLayer, TextLayer } from "@deck.gl/layers";
import {
  PathStyleExtension,
  type PathStyleExtensionProps,
} from "@deck.gl/extensions";
import type { MapData, MapCallbacks } from "./renderer";
import type { Point, CandidateLink } from "../cases/model";
interface Marker {
  point: Point;
  ids: string[];
}
export function attachOverlay(
  map: LibreMap,
  callbacks: MapCallbacks,
  onReady: () => void,
) {
  let destroyed = false;
  const overlay = new MapboxOverlay({
    interleaved: false,
    layers: [],
    onAfterRender: onReady,
  });
  map.addControl(overlay as unknown as IControl);
  const arc = (points: Point[], progress: number): Point[] => {
    if (points.length < 2) return points;
    const start = points[0],
      end: [number, number] = [points[1][0], points[1][1]];
    while (end[0] - start[0] > 180) end[0] -= 360;
    while (end[0] - start[0] < -180) end[0] += 360;
    const a = map.project(start),
      b = map.project(end),
      dx = b.x - a.x,
      dy = b.y - a.y,
      length = Math.hypot(dx, dy) || 1;
    const bend = Math.min(90, length * 0.2),
      c = {
        x: (a.x + b.x) / 2 - (dy / length) * bend,
        y: (a.y + b.y) / 2 + (dx / length) * bend,
      };
    return Array.from({ length: 33 }, (_, i) => {
      const t = (progress * i) / 32;
      const p = map.unproject([
        (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
        (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
      ]);
      return [p.lng, p.lat] as Point;
    });
  };
  const render = (data: MapData) => {
    if (destroyed) return;
    const markers: Marker[] = [];
    if (data.showMarkers)
      for (const candidate of data.candidates) {
        if (!candidate.point) continue;
        const projected = map.project(candidate.point);
        const existing = markers.find((marker) => {
          const p = map.project(marker.point);
          return Math.hypot(p.x - projected.x, p.y - projected.y) < 19;
        });
        if (existing) existing.ids.push(candidate.anomaly.anomaly_id);
        else
          markers.push({
            point: candidate.point,
            ids: [candidate.anomaly.anomaly_id],
          });
      }
    if (data.trace?.point) {
      markers.splice(0, markers.length, {
        point: data.trace.point,
        ids: data.selected ? [data.selected] : [],
      });
    }
    const pick = (info: { object?: Marker }) => {
      if (info.object) callbacks.pick(info.object.ids);
    };
    const paths = data.trace?.paths ?? (data.showLinks ? data.links : []);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const path = (d: CandidateLink) =>
      data.trace ? arc(d.points, reduced ? 1 : data.trace.progress) : d.points;
    overlay.setProps({
      layers: [
        new ScatterplotLayer<{
          id: string;
          lat: number;
          lon: number;
          precision: number;
        }>({
          id: "reported-events",
          data: data.events ?? [],
          pickable: true,
          stroked: true,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: (d) => (d.precision === 1 ? 4 : 11),
          radiusUnits: "pixels",
          getFillColor: (d) =>
            d.precision === 1 ? [225, 225, 220, 200] : [180, 180, 180, 35],
          getLineColor: [220, 220, 220, 180],
          getLineWidth: 1,
          lineWidthUnits: "pixels",
          onClick: (info) => {
            if (info.object) callbacks.event?.(info.object.id);
          },
        }),
        new PathLayer<CandidateLink>({
          id: "direct-relations",
          data: paths.filter((d) =>
            ["observed", "documented"].includes(d.status),
          ),
          getPath: path,
          getColor: [236, 236, 232],
          getWidth: 1.5,
          widthUnits: "pixels",
        }),
        new PathLayer<CandidateLink, PathStyleExtensionProps<CandidateLink>>({
          id: "candidate-relations",
          data: paths.filter(
            (d) => !["observed", "documented"].includes(d.status),
          ),
          pickable: false,
          getPath: path,
          getColor: [167, 167, 167],
          getWidth: 1.5,
          widthUnits: "pixels",
          getDashArray: (d) => (d.status === "scenario" ? [1, 5] : [5, 4]),
          dashJustified: true,
          extensions: [new PathStyleExtension({ dash: true })],
        }),
        new ScatterplotLayer<Marker>({
          id: "candidate-markers",
          data: markers,
          pickable: true,
          autoHighlight: false,
          getPosition: (d) => d.point,
          getRadius: (d) => (d.ids.length > 1 ? 12 : 7),
          radiusUnits: "pixels",
          stroked: true,
          getLineWidth: 1.2,
          lineWidthUnits: "pixels",
          getFillColor: (d) =>
            d.ids.includes(data.selected ?? "")
              ? [235, 235, 230]
              : [24, 24, 24],
          getLineColor: [235, 235, 230],
          onClick: pick,
          updateTriggers: { getFillColor: data.selected },
        }),
        new TextLayer<Marker>({
          id: "cluster-count",
          data: markers.filter((m) => m.ids.length > 1),
          getPosition: (d) => d.point,
          getText: (d) => String(d.ids.length),
          getSize: 11,
          getColor: [242, 242, 240],
          fontFamily: "system-ui",
          getTextAnchor: "middle",
          getAlignmentBaseline: "center",
          pickable: false,
        }),
      ],
    });
  };
  return {
    render,
    pick: (x: number, y: number) => overlay.pickObject({ x, y, radius: 14 }),
    destroy() {
      destroyed = true;
      map.removeControl(overlay as unknown as IControl);
    },
  };
}
