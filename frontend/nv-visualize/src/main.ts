import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/tokens.css";
import "./styles/workbench.css";
import { mount } from "./app/shell";
import { readPayload } from "./cases/model";
import { mountMonitor } from "./monitor/view";
import { sharedMap, disposeMap } from "./map/shared";
import { accountControl, enhanceControls } from "./ui/controls";
import {mountBeta} from './beta/view';
const root = document.querySelector<HTMLDivElement>("#app")!;
let cleanup: (() => void) | undefined,
  enhanceCleanup: (() => void) | undefined,
  accountCleanup: (() => void) | undefined,
  generation = 0;
const routeKey=()=>{const url=new URL(location.href);url.searchParams.delete('object');url.hash='';url.searchParams.sort();return url.href;};
let renderedRoute='';
async function render() {
  renderedRoute=routeKey();
  const current = ++generation,
    url = new URL(location.href);
  cleanup?.();
  enhanceCleanup?.();
  accountCleanup?.();
  if(url.searchParams.get('view')==='beta')cleanup=mountBeta(root);
  else if (url.searchParams.get("view") === "monitor" || (!url.searchParams.has("view")&&!url.searchParams.has("case")))
    cleanup = mountMonitor(root, sharedMap);
  else {
    const kind =
      url.searchParams.get("case") === "alpha"
        ? "alpha"
        : url.searchParams.get("case") === "live"
          ? "live"
          : "synthetic";
    root.textContent = "Night Vision · 사례를 불러오는 중입니다.";
    try {
      const response = await fetch(
        kind === "live"
          ? "/api/v2/cases/" +
              encodeURIComponent(url.searchParams.get("id") ?? "")
          : `${import.meta.env.BASE_URL}demo/${kind}-case.json`,
      );
      if (!response.ok) throw Error();
      const payload = readPayload(await response.json());
      if (current !== generation) return;
      cleanup = mount(root, payload, sharedMap);
      const nav = root.querySelector("nav")!;
      const monitoring = document.createElement("a");
      monitoring.href = "/?view=monitor";
      monitoring.textContent = "지속 감시";
      nav.prepend(monitoring);
      const menu = document.createElement("details");
      menu.className = "utility-menu";
      const summary = document.createElement("summary");
      summary.textContent = "실험실";
      const select = document.createElement("select");
      select.setAttribute("aria-label", "사례 선택");
      for (const [value, label] of [
        ...(kind === "live" ? [["live", "선택한 UCDP 추이"]] : []),
        ["synthetic", "Synthetic lab"],
        ["alpha", "USGS Taiwan Alpha"],
      ]) {
        const o = document.createElement("option");
        o.value = value;
        o.textContent = label;
        select.append(o);
      }
      select.value = kind;
      select.onchange = () => navigate("?case=" + select.value);
      menu.append(summary, select);
      const beta=document.createElement('a');beta.href='/?view=beta';beta.textContent='베타 비교';menu.append(beta);nav.append(menu);
      accountCleanup = accountControl(nav);
    } catch {
      if (current === generation)
        root.textContent = "사례를 불러올 수 없습니다. 새로고침해 주세요.";
    }
  }
  if (current === generation) enhanceCleanup = enhanceControls(root);
}
function navigate(href: string) {
  history.pushState(null, "", href);
  void render();
}
root.addEventListener("click", (event) => {
  const a = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
  if (
    !a ||
    a.target ||
    a.hasAttribute("download") ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  )
    return;
  const to = new URL(a.href);
  if (
    to.origin === location.origin &&
    to.pathname === new URL(import.meta.env.BASE_URL, location.origin).pathname
  ) {
    event.preventDefault();
    navigate(to.href);
  }
});
window.addEventListener("popstate", () => {if(routeKey()!==renderedRoute)void render();});
window.addEventListener("pagehide", () => {
  cleanup?.();
  disposeMap();
});
void render();
