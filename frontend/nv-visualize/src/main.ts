import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/tokens.css";
import { mount } from "./app/shell";
import { readPayload } from "./cases/model";
const base = import.meta.env.BASE_URL;
const root = document.querySelector<HTMLDivElement>("#app")!;
let cleanup: (() => void) | undefined;
async function load(kind: string) {
  const allowed = kind === "alpha" ? "alpha" : "synthetic";
  cleanup?.();
  root.textContent = "Night Vision · 사례를 불러오는 중입니다.";
  try {
    const response = await fetch(`${base}demo/${allowed}-case.json`);
    if (!response.ok) throw new Error("Case unavailable");
    cleanup = mount(root, readPayload(await response.json()));
    const select = document.createElement("select");
    select.setAttribute("aria-label", "사례 선택");
    for (const [value, label] of [
      ["synthetic", "Synthetic lab"],
      ["alpha", "USGS Taiwan Alpha"],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    }
    select.value = allowed;
    select.onchange = () => {
      history.replaceState(null, "", `?case=${select.value}`);
      void load(select.value);
    };
    root.querySelector("nav")!.prepend(select);
  } catch {
    root.textContent = "사례를 불러올 수 없습니다. 새로고침해 주세요.";
  }
}
void load(new URL(location.href).searchParams.get("case") ?? "synthetic");
