import { test, expect } from "vitest";
import { nimKeys } from "../../../services/cloudflare/credentials.js";

test("A/B runtime secrets work with legacy compatibility and deterministic precedence", () => {
  expect(nimKeys({ NVIDIA_API_KEY_A: "a", NVIDIA_API_KEY_B: "b" })).toEqual({
    primary: "a",
    secondary: "b",
    review: "b",
  });
  expect(nimKeys({ NVIDIA_API_KEY: "legacy" })).toEqual({
    primary: "legacy",
    secondary: undefined,
    review: "legacy",
  });
  expect(
    nimKeys({
      NVIDIA_API_KEY_A: "a",
      NVIDIA_API_KEY: "old",
      NVIDIA_API_KEY_B: "b",
      NVIDIA_SECONDARY_API_KEY: "old-b",
    }),
  ).toEqual({ primary: "a", secondary: "b", review: "b" });
  expect(nimKeys({ NVIDIA_API_KEY_B: "b" }).primary).toBeUndefined();
});
import { validateAnswer } from "../../../services/cloudflare/ai.js";
import { validateRecord } from "../../../services/cloudflare/data.js";
import {
  schedule,
  unconfirmedSlots,
} from "../../../services/cloudflare/core.js";
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
test("unconfirmed slots are distinguished from a never-activated monitor", () => {
  const now = new Date("2026-01-01T08:00:00Z");
  expect(unconfirmedSlots(now, 12, [])).toEqual([]);
  expect(
    unconfirmedSlots(now, 12, [{ started: "2026-01-01T00:17:00Z" }]),
  ).toEqual([
    "2026-01-01T02:17:00.000Z",
    "2026-01-01T04:17:00.000Z",
    "2026-01-01T06:17:00.000Z",
  ]);
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

import {generationOptions,reasoningMode,parseCompletion} from '../../../services/cloudflare/nim.js';
test('only the documented Nemotron model gets thinking control; no unsupported High flag',()=>{
 expect(generationOptions('nvidia/nemotron-3.5-lightning-30b-a3b')).toEqual({response_format:{type:'json_object'},chat_template_kwargs:{enable_thinking:false}});
 expect(generationOptions('meta/llama-3.3-70b-instruct')).toEqual({response_format:{type:'json_object'}});
 expect(reasoningMode('meta/llama-3.3-70b-instruct')).toBe('provider_default');
});

test('provider formatting is normalized without inventing JSON or exposing reasoning',()=>{
 expect(parseCompletion(' \n```json\n{"summary":[]}\n``` \n')).toEqual({summary:[]});
 expect(parseCompletion('</think>\n{"summary":[]}')).toEqual({summary:[]});
 expect(()=>parseCompletion('<think>private reasoning</think>{"summary":[]}')).toThrow();
 expect(()=>parseCompletion('{"summary":[')).toThrow();
});
