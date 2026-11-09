import { test, expect } from "vitest";
import { validateAnswer } from "../../../services/cloudflare/ai.js";
import { validateRecord } from "../../../services/cloudflare/data.js";
import { schedule } from "../../../services/cloudflare/core.js";
test("AI rejects invented citations, links and coordinate pairs", () => {
  const good = {
    summary: [{ text: "자료에 기록됨", source_ids: ["source:1"] }],
    alternatives: [],
    counterevidence: [],
    unknowns: [],
  };
  expect(validateAnswer(good, new Set(["source:1"]))).toBe(good);
  expect(() => validateAnswer(good, new Set())).toThrow("ai_unknown_source");
  expect(() =>
    validateAnswer(
      {
        ...good,
        summary: [
          { text: "https://invented.example", source_ids: ["source:1"] },
        ],
      },
      new Set(["source:1"]),
    ),
  ).toThrow();
  expect(() =>
    validateAnswer({ ...good, events: [] }, new Set(["source:1"])),
  ).toThrow();
});
test("day schedule defaults to 12 and supports 24 without invalid rates", () => {
  expect(schedule(new Date("2026-01-01T00:18:00Z"), 12).next_scheduled_at).toBe(
    "2026-01-01T02:17:00.000Z",
  );
  expect(schedule(new Date("2026-01-01T00:18:00Z"), 24).next_scheduled_at).toBe(
    "2026-01-01T01:17:00.000Z",
  );
  expect(() => schedule(new Date(), 25)).toThrow();
});
test("ingestion rejects credential URLs and invalid geography", () => {
  const record = {
    id: "ucdp:1",
    country: "Test",
    day: "2026-01-01",
    end_day: "2026-01-01",
    kind: "ucdp",
    version: "26.1",
    title: "reported",
    hash: "a".repeat(64),
    lat: null,
    lon: null,
    low: 0,
    best: 0,
    high: 0,
    precision: 7,
    source_url: "https://ucdp.uu.se/",
  };
  expect(validateRecord(record)).toBe(record);
  expect(() =>
    validateRecord({ ...record, source_url: "https://secret@ucdp.uu.se/" }),
  ).toThrow();
  expect(() => validateRecord({ ...record, lat: 300, lon: 0 })).toThrow();
});
