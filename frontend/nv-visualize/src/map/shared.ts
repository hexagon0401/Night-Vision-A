import { createMap, type MapCallbacks, type MapPort } from "./renderer";
let host: HTMLDivElement | undefined,
  map: MapPort | undefined,
  current: MapCallbacks | undefined;
const empty = {
  candidates: [],
  links: [],
  selected: null,
  showMarkers: false,
  showLinks: false,
};
export const sharedMap: typeof createMap = (container, callbacks) => {
  if (!host) {
    host = document.createElement("div");
    host.className = "map";
    host.setAttribute("role", "region");
    host.setAttribute("aria-label", "지정학 지도");
  }
  container.replaceWith(host);
  current = callbacks;
  if (!map)
    map = createMap(host, {
      pick: (ids) => current?.pick(ids),
      move: () => current?.move(),
      ready: () => current?.ready(),
      error: () => current?.error(),
      dismiss: () => current?.dismiss(),
      basemap: (d) => current?.basemap?.(d),
      event: (id) => current?.event?.(id),
    });
  else {
    map.resize?.();
    queueMicrotask(() => {
      if (current === callbacks) {
        if (host?.dataset.mapReady === "true") callbacks.ready();
        callbacks.basemap?.(host?.dataset.basemap === "detailed");
      }
    });
  }
  const instance = map;
  return {
    center: () => instance.center(),
    update: (d) => instance.update(d),
    focus: (p, a) => instance.focus(p, a),
    stop: () => instance.stop?.(),
    project: (p) => instance.project(p),
    destroy() {
      if (current === callbacks) {
        current = undefined;
        instance.stop?.();
        instance.update(empty);
        host?.remove();
      }
    },
  };
};
export function disposeMap() {
  map?.destroy();
  host?.remove();
  map = undefined;
  host = undefined;
  current = undefined;
}
