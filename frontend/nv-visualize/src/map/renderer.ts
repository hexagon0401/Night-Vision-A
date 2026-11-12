import maplibregl, {
  type StyleSpecification,
} from "maplibre-gl";
import detailStyle from "./detail-style.json";
import type { Candidate, CandidateLink, Point } from "../cases/model";

export interface MapData {
  nearby?: {id:string; lat:number; lon:number; kind:string}[];
  events?: { id: string; lat: number; lon: number; precision: number; color?: string; radius?: number }[];
  candidates: Candidate[];
  links: CandidateLink[];
  selected: string | null;
  showMarkers: boolean;
  showLinks: boolean;
  trace?: { paths: CandidateLink[]; progress: number; point: Point | null };
}
export interface MapPort {
  center(): {lat:number; lon:number};
  update(data: MapData): void;
  focus(points: Point[], animate?: boolean): void;
  stop?(): void;
  resize?(): void;
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
  event?(id: string): void;
  nearby?(id:string):void;
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
      paint: { "fill-color": "#202020" },
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
  let restored: { center: Point; zoom: number } = {
    center: [127, 35],
    zoom: 4.2,
  };
  try {
    const saved = JSON.parse(localStorage.getItem("nv:camera:v1") ?? "null");
    if (
      saved &&
      Array.isArray(saved.center) &&
      saved.center.length === 2 &&
      saved.center.every(Number.isFinite) &&
      Math.abs(saved.center[0]) <= 180 &&
      Math.abs(saved.center[1]) <= 85 &&
      Number.isFinite(saved.zoom) &&
      saved.zoom >= 1 &&
      saved.zoom <= 18
    )
      restored = saved;
  } catch {}
  const map = new maplibregl.Map({
    container,
    style: detailStyle as unknown as StyleSpecification,
    localIdeographFontFamily: "sans-serif",
    center: restored.center,
    zoom: restored.zoom,
    minZoom: 1,
    maxZoom: 18,
    attributionControl: false,
    pitchWithRotate: false,
    dragRotate: false,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    fadeDuration: 0,
  });
  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution:
        '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://github.com/hyperknot/openfreemap-styles/blob/main/LICENSE.md">Liberty / OpenMapTiles style</a> (CC BY 4.0, monochrome adaptation)',
    }),
    "bottom-right",
  );
  let basemapLoaded = false;
  let ready = false;
  let data: MapData = {
    candidates: [],
    links: [],
    selected: null,
    showMarkers: true,
    showLinks: false,
  };
  let destroyed = false;
  let detailed = true,
    failedDetail = false;
  let overlay:
    | {
        render(data: MapData): void;
        pick(x: number, y: number): unknown;
        destroy(): void;
      }
    | undefined;
  let overlayLoading = false,
    overlayReady = false;
  const needed = () =>
    Boolean(
      data.nearby?.length ||
      data.events?.length ||
      data.trace?.point ||
      (data.links.length && data.showLinks) ||
      data.candidates.some((c) => c.point),
    );
  const markReady = () => {
    if (basemapLoaded && (!needed() || overlayReady) && !ready) {
      ready = true;
      container.dataset.mapReady = "true";
      callbacks.ready();
    }
  };
  const render = () => {
    if (destroyed) return;
    if (overlay) {
      overlay.render(data);
      return;
    }
    if (!needed()) {
      markReady();
      return;
    }
    if (overlayLoading) return;
    overlayLoading = true;
    void import("./overlay")
      .then((module) => {
        if (destroyed) return;
        overlay = module.attachOverlay(map, callbacks, () => {
          overlayReady = true;
          markReady();
        });
        overlay.render(data);
      })
      .catch(() => {
        overlayLoading = false;
        callbacks.error();
      });
  };
  map.on("load", () => {
    basemapLoaded = true;
    render();
    markReady();
  });
  map.on("idle", () => {
    if (detailed && !failedDetail) {
      container.dataset.basemap = "detailed";
      callbacks.basemap?.(true);
    }
  });
  map.on("moveend", () => {
    try {
      const c = map.getCenter();
      localStorage.setItem(
        "nv:camera:v1",
        JSON.stringify({ center: [c.lng, c.lat], zoom: map.getZoom() }),
      );
    } catch {}
  });
  map.on("move", () => {
    render();
    callbacks.move();
  });
  map.on("click", (event) => {
    if (!overlay?.pick(event.point.x, event.point.y)) callbacks.dismiss();
  });
  const fallback = () => {
    if (detailed && !failedDetail) {
      failedDetail = true;
      detailed = false;
      map.setStyle(style);
      container.dataset.basemap = "fallback";
      callbacks.basemap?.(false);
    }
  };
  // A missing glyph or a single transient tile must not discard the whole basemap.
  let detailErrors = false;
  const deadline = window.setTimeout(() => {
    if (!destroyed && (!basemapLoaded || detailErrors)) fallback();
  }, 12000);
  map.on("error", (event) => {
    const failure = event as typeof event & { sourceId?: string; tile?: unknown };
    if (detailed && failure.sourceId === "openmaptiles") {
      detailErrors = true;
      if (!failure.tile) fallback(); // TileJSON/source failure; tile errors get a grace period.
    } else if (!detailed && failure.sourceId === "countries") callbacks.error();
  });
  return {
    center:()=>{const c=map.getCenter();return {lat:c.lat,lon:c.lng};},
    update(value) {
      data = value;
      render();
    },
    stop() {
      map.stop();
    },
    resize() {
      map.resize();
    },
    focus(points) {
      if (!points.length) return;
      // Instant selection avoids queuing intermediate zoom tiles on slower GPUs.
      if (points.length === 1) map.jumpTo({center:points[0],zoom:7});
      else {
        const bounds=new maplibregl.LngLatBounds(points[0],points[0]);
        for(const point of points) bounds.extend(point);
        map.fitBounds(bounds,{padding:100,maxZoom:8,duration:0});
      }
    },
    project(point) {
      return map.project(point);
    },
    destroy() {
      destroyed = true;
      clearTimeout(deadline);
      overlay?.destroy();
      map.remove();
    },
  };
}
