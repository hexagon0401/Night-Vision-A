// @vitest-environment jsdom
import { expect, test, vi } from "vitest";
import { readFileSync } from "node:fs";
vi.mock("../src/map/renderer", () => ({ createMap: vi.fn() }));
import { mount } from "../src/app/shell";
import { readPayload } from "../src/cases/model";
import type { MapCallbacks } from "../src/map/renderer";
const payload = () =>
  readPayload(
    JSON.parse(readFileSync("public/demo/synthetic-case.json", "utf8")),
  );
function setup() {
  const root = document.createElement("div");
  document.body.append(root);
  let callbacks: MapCallbacks;
  const map = {
    update: vi.fn(),
    focus: vi.fn(),
    project: () => ({ x: 100, y: 200 }),
    destroy: vi.fn(),
  };
  const cleanup = mount(root, payload(), (_container, events) => {
    callbacks = events;
    return map;
  });
  const click = (selector: string) =>
    root.querySelector<HTMLButtonElement>(selector)!.click();
  return {
    root,
    map,
    cleanup,
    click,
    pick: (ids: string[]) => callbacks.pick(ids),
  };
}

test("default Explore is map first, explicitly synthetic, with no automatic panels", () => {
  const s = setup();
  expect(s.root.textContent).toContain("SYNTHETIC DATA");
  expect(s.root.querySelector<HTMLElement>(".evidence")!.hidden).toBe(true);
  expect(s.root.querySelector<HTMLElement>(".tool-panel")!.hidden).toBe(true);
  expect(s.map.update.mock.lastCall![0].showLinks).toBe(false);
  s.cleanup();
  expect(s.map.destroy).toHaveBeenCalled();
  s.root.remove();
});

test("select, pin/unpin, Escape and mutually exclusive tools work", () => {
  const s = setup();
  s.click('[data-panel="cases"]');
  expect(s.root.querySelectorAll(".candidate-row")).toHaveLength(3);
  s.click(".candidate-row");
  expect(s.root.querySelector<HTMLElement>(".evidence")!.hidden).toBe(false);
  expect(s.root.querySelector<HTMLElement>(".tool-panel")!.hidden).toBe(true);
  expect(s.root.textContent).toContain("UNCALIBRATED");
  s.click(".pin");
  expect(s.root.querySelector(".evidence.pinned")).not.toBeNull();
  s.click(".pin");
  expect(s.root.querySelector(".evidence.pinned")).toBeNull();
  s.click('[data-panel="sources"]');
  expect(s.root.querySelector<HTMLElement>(".evidence")!.hidden).toBe(true);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  expect(s.root.querySelector<HTMLElement>(".tool-panel")!.hidden).toBe(true);
  s.cleanup();
  s.root.remove();
});

test("search filters markers and candidate list; relation layer remains inferred", () => {
  const s = setup();
  const input = s.root.querySelector<HTMLInputElement>('input[type="search"]')!;
  input.value = "cusum";
  input.dispatchEvent(new Event("input"));
  expect(s.map.update.mock.lastCall![0].candidates).toHaveLength(1);
  s.click('[data-panel="layers"]');
  const boxes = s.root.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  boxes[1].checked = true;
  boxes[1].dispatchEvent(new Event("change"));
  expect(s.map.update.mock.lastCall![0].showLinks).toBe(true);
  expect(
    s.map.update.mock.lastCall![0].links.every(
      (link: { status: string }) => link.status === "inferred",
    ),
  ).toBe(true);
  s.cleanup();
  s.root.remove();
});

test("deck picks select a candidate while clusters open a focused choice list", () => {
  const s = setup();
  const ids = payload().analysis.anomalies.map((a) => a.anomaly_id);
  s.pick(ids);
  expect(s.root.querySelector<HTMLElement>(".tool-panel")!.hidden).toBe(false);
  expect(s.root.querySelector<HTMLElement>(".evidence")!.hidden).toBe(true);
  s.pick([ids[0]]);
  expect(s.root.querySelector<HTMLElement>(".evidence")!.hidden).toBe(false);
  expect(s.map.focus).toHaveBeenCalled();
  s.cleanup();
  s.root.remove();
});
