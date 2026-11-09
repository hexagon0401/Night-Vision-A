import maplibregl, {
  type StyleSpecification,
  type IControl,
} from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer, PathLayer, TextLayer } from "@deck.gl/layers";
import {
  PathStyleExtension,
  type PathStyleExtensionProps,
} from "@deck.gl/extensions";
import type { Candidate, CandidateLink, Point } from "../cases/model";

export interface MapData {
  candidates: Candidate[];
  links: CandidateLink[];
  selected: string | null;
  showMarkers: boolean;
  showLinks: boolean;
}
export interface MapPort {
  update(data: MapData): void;
  focus(points: Point[]): void;
  project(point: Point): { x: number; y: number };
  destroy(): void;
}
export interface MapCallbacks {
  pick(ids: string[]): void;
  move(): void;
  ready(): void;
  error(): void;
  dismiss(): void;
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
      data: "/geography/countries.geojson",
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
    maxZoom: 12,
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
    const pick = (info: { object?: Marker }) => {
      if (info.object) callbacks.pick(info.object.ids);
    };
    overlay.setProps({
      layers: [
        new PathLayer<CandidateLink, PathStyleExtensionProps<CandidateLink>>({
          id: "candidate-relations",
          data: data.showLinks ? data.links : [],
          pickable: false,
          getPath: (d) => d.points,
          getColor: [167, 167, 167],
          getWidth: 1.5,
          widthUnits: "pixels",
          getDashArray: [5, 4],
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
  map.on("move", () => {
    render();
    callbacks.move();
  });
  map.on("click", (event) => {
    if (!overlay.pickObject({ x: event.point.x, y: event.point.y, radius: 14 }))
      callbacks.dismiss();
  });
  map.on("error", () => callbacks.error());
  return {
    update(value) {
      data = value;
      render();
    },
    focus(points) {
      if (!points.length) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (points.length === 1)
        map.flyTo({ center: points[0], zoom: 9, duration: reduce ? 0 : 700 });
      else {
        const bounds = new maplibregl.LngLatBounds(points[0], points[0]);
        for (const point of points) bounds.extend(point);
        map.fitBounds(bounds, {
          padding: 100,
          maxZoom: 9,
          duration: reduce ? 0 : 700,
        });
      }
    },
    project(point) {
      return map.project(point);
    },
    destroy() {
      destroyed = true;
      map.remove();
    },
  };
}
