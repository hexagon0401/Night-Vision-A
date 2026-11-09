import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import {
  candidates,
  candidateLinks,
  readPayload,
  safeSourceUrl,
} from "../src/cases/model";
const fixture = () =>
  JSON.parse(readFileSync("public/demo/synthetic-case.json", "utf8"));
test("generated payload preserves three candidates and actual sourced point anchors", () => {
  const data = readPayload(fixture());
  const items = candidates(data);
  expect(items).toHaveLength(3);
  for (const item of items) {
    expect(
      item.points.some((p) => JSON.stringify(p) === JSON.stringify(item.point)),
    ).toBe(true);
  }
  expect(candidateLinks(data).every((link) => link.status === "inferred")).toBe(
    true,
  );
});
test("unknown latest coordinates do not inherit an older point", () => {
  const data = readPayload(fixture());
  for (const row of data.case.observations ?? []) row.location = null;
  expect(candidates(data).every((item) => item.point === null)).toBe(true);
  expect(candidateLinks(data)).toHaveLength(0);
});
test("rejects mixed case origins and unsafe evidence links", () => {
  const data = fixture();
  data.analysis.data_origin = "source_backed";
  expect(() => readPayload(data)).toThrow();
  expect(safeSourceUrl("javascript:alert(1)")).toBeNull();
  expect(safeSourceUrl("https://user:password@example.invalid")).toBeNull();
  expect(safeSourceUrl("https://example.invalid/")).toBe(
    "https://example.invalid/",
  );
});

test("a point without its geometry source cannot masquerade as located evidence", () => {
  const data = readPayload(fixture());
  for (const row of data.case.observations ?? [])
    if (row.location) row.location.source_id = null;
  expect(candidates(data).every((item) => item.point === null)).toBe(true);
});
