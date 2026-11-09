import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/tokens.css";
import { mount } from "./app/shell";
import { readPayload } from "./cases/model";
const root = document.querySelector<HTMLDivElement>("#app")!;
root.textContent = "Night Vision · 합성 사례를 불러오는 중입니다.";
fetch("/demo/synthetic-case.json")
  .then((response) => {
    if (!response.ok) throw new Error("Demo unavailable");
    return response.json();
  })
  .then((value) => mount(root, readPayload(value)))
  .catch(() => {
    root.textContent = "사례를 불러올 수 없습니다. 새로고침해 주세요.";
  });
