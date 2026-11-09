import maplibregl, {
  type StyleSpecification,
  type IControl,
} from "maplibre-gl";
import { DETAIL_STYLE, flatBlack } from './basemap';
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer, PathLayer, TextLayer } from "@deck.gl/layers";
import {
  PathStyleExtension,
  type PathStyleExtensionProps,
} from "@deck.gl/extensions";
import type { Candidate, CandidateLink, Point } from "../cases/model";

export interface MapData {
  events?: {id:string;lat:number;lon:number;precision:number}[];
  candidates: Candidate[];
  links: CandidateLink[];
  selected: string | null;
  showMarkers: boolean;
  showLinks: boolean;
  trace?: { paths: CandidateLink[]; progress: number; point: Point | null };
}
export interface MapPort {
  update(data: MapData): void;
  focus(points: Point[], animate?: boolean): void;
  stop?(): void;
  project(point: Point): { x: number; y: number };
  destroy(): void;
}
export interface MapCallbacks {
  pick(ids: string[]): void;
  move(): void;
  ready(): void;
  error(): void;
  dismiss(): void;
  basemap?(detailed: boolean): void;
  event?(id:string): void;
}
interface Marker {
  point: Point;
  ids: string[];
}

export const style: StyleSpecification = {
  version: 8,
  sources: {
    countries: {
      type: "geojson",
      data: `${import.meta.env.BASE_URL}geography/countries.geojson`,
      attribution: "Natural Earth · public domain",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#050505" },
    },
    {
      id: "land",
      type: "fill",
      source: "countries",
      paint: { "fill-color": "#080808" },
    },
    {
      id: "borders",
      type: "line",
      source: "countries",
      paint: {
        "line-color": "#C9C9C9",
        "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0.5, 8, 0.85],
      },
    },
  ],
};

export function createMap(
  container: HTMLElement,
  callbacks: MapCallbacks,
): MapPort {
  const map = new maplibregl.Map({
    container,
    style,
    center: [127, 35],
    zoom: 4.2,
    minZoom: 1,
    maxZoom: 18,
    attributionControl: false,
    pitchWithRotate: false,
    dragRotate: false,
  });
  map.addControl(
    new maplibregl.AttributionControl({ compact: true }),
    "bottom-right",
  );
  let basemapLoaded = false;
  let ready = false;
  const overlay = new MapboxOverlay({
    interleaved: false,
    layers: [],
    onAfterRender: () => {
      if (basemapLoaded && !ready) {
        ready = true;
        container.dataset.mapReady = "true";
        callbacks.ready();
      }
    },
  });
  map.addControl(overlay as unknown as IControl);
  let data: MapData = {
    candidates: [],
    links: [],
    selected: null,
    showMarkers: true,
    showLinks: false,
  };
  let destroyed = false;
  let detailed = false;
  let failedDetail = false;
  const detailAbort = new AbortController();
  const detailTimeout = setTimeout(() => detailAbort.abort(), 12000);
  void fetch(DETAIL_STYLE, { signal: detailAbort.signal }).then(async response => {
    if (!response.ok) throw new Error('map unavailable');
    const value = flatBlack(await response.json());
    if (!destroyed) { detailed = true; map.setStyle(value); }
  }).catch(() => { if (!destroyed) { failedDetail = true; callbacks.basemap?.(false); } })
    .finally(() => clearTimeout(detailTimeout));
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
  const render = () => {
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
        new ScatterplotLayer<{id:string;lat:number;lon:number;precision:number}>({
          id:'reported-events',data:data.events??[],pickable:true,stroked:true,
          getPosition:d=>[d.lon,d.lat],getRadius:d=>d.precision===1?4:11,radiusUnits:'pixels',
          getFillColor:d=>d.precision===1?[225,225,220,200]:[180,180,180,35],getLineColor:[220,220,220,180],getLineWidth:1,lineWidthUnits:'pixels',
          onClick:info=>{if(info.object)callbacks.event?.(info.object.id);}
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
  map.on("load", () => {
    basemapLoaded = true;
    render();
  });
  map.on('idle', () => { if (detailed && !failedDetail) { container.dataset.basemap = 'detailed'; callbacks.basemap?.(true); } });
  map.on("move", () => {
    render();
    callbacks.move();
  });
  map.on("click", (event) => {
    if (!overlay.pickObject({ x: event.point.x, y: event.point.y, radius: 14 }))
      callbacks.dismiss();
  });
  map.on("error", () => {
    if (detailed && !failedDetail) {
      failedDetail = true; detailed = false; map.setStyle(style);
      container.dataset.basemap = 'fallback'; callbacks.basemap?.(false);
    } else if (!failedDetail) callbacks.error();
  });
  return {
    update(value) {
      data = value;
      render();
    },
    stop() {
      map.stop();
    },
    focus(points, animate = true) {
      if (!points.length) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (points.length === 1)
        map.flyTo({
          center: points[0],
          zoom: 7,
          duration: reduce || !animate ? 0 : 700,
        });
      else {
        const bounds = new maplibregl.LngLatBounds(points[0], points[0]);
        for (const point of points) bounds.extend(point);
        map.fitBounds(bounds, {
          padding: 100,
          maxZoom: 8,
          duration: reduce || !animate ? 0 : 700,
        });
      }
    },
    project(point) {
      return map.project(point);
    },
    destroy() {
      destroyed = true;
      detailAbort.abort(); clearTimeout(detailTimeout);
      map.remove();
    },
  };
}
