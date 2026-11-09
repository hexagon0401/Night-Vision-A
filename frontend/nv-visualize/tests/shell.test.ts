// @vitest-environment jsdom
import { expect, test } from "vitest";
import { mount } from "../src/app/shell";

test("foundation renders accessible branding and honest readiness without live cases", () => {
  const root = document.createElement("div");
  mount(root);
  expect(root.querySelector("h1")?.textContent).toBe("Night Vision 2.0");
  expect(root.querySelector("img")?.getAttribute("src")).toBe("/branding/night-vision-logo.png");
  expect(root.querySelector('[role="status"]')?.textContent).toContain("NO FEED CONNECTED");
  expect(root.querySelector("main")?.textContent).toContain("아직 연결되지 않았습니다");
  expect(root.querySelector("canvas")).toBeNull();
});
