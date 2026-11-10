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
 expect(generationOptions('nvidia/nemotron-3.5-lightning-30b-a3b')).toEqual({chat_template_kwargs:{enable_thinking:false}});
 expect(generationOptions('meta/llama-3.3-70b-instruct')).toEqual({response_format:{type:'json_object'}});
 expect(reasoningMode('meta/llama-3.3-70b-instruct')).toBe('provider_default');
});

test('provider formatting is normalized without inventing JSON or exposing reasoning',()=>{
 expect(parseCompletion(' \n```json\n{"summary":[]}\n``` \n')).toEqual({summary:[]});
 expect(parseCompletion('</think>\n{"summary":[]}')).toEqual({summary:[]});
 expect(parseCompletion('<think>private reasoning</think>{"summary":[]}')).toEqual({summary:[]});
 expect(parseCompletion('Result:\n{"summary":[]}')).toEqual({summary:[]});
 expect(()=>parseCompletion('{"summary":[]} {"summary":[]}')).toThrow();
 expect(()=>parseCompletion('<think>private reasoning')).toThrow();
 expect(()=>parseCompletion('{"summary":[')).toThrow();
});

import {normalizeAnswer} from '../../../services/cloudflare/ai.js';
test('schema interoperability never supplies missing factual citations',()=>{
 const ids=new Set(['source:1']);
 const safe=normalizeAnswer({summary:[{text:'reported',source_ids:'source:1'}],alternatives:['possible alternative'],counterevidence:[],unknowns:[{text:'not known'}]},ids);
 expect(validateAnswer(safe.value,ids)).toEqual({summary:[{text:'reported',source_ids:['source:1']}],alternatives:[{text:'possible alternative',source_ids:[]}],counterevidence:[],unknowns:[{text:'not known',source_ids:[]}]});
 expect(()=>validateAnswer(normalizeAnswer({summary:['uncited factual statement'],alternatives:[],counterevidence:[],unknowns:[]},ids).value,ids)).toThrow('ai_uncited_summary');
 expect(()=>normalizeAnswer({summary:[{text:'bad',source_id:'invented'}]},ids)).toThrow('ai_unknown_source');
});

test('inline invented citations cannot enter an adapted answer',()=>{expect(()=>validateAnswer({summary:[{text:'claim [S:invented]',source_ids:['source:1']}],alternatives:[],counterevidence:[],unknowns:[]},new Set(['source:1']))).toThrow('ai_unknown_source');});

import {evidenceAliases,restoreCitations} from '../../../services/cloudflare/ai.js';
test('short model citations round-trip to exactly the supplied source records',()=>{
 const evidence={sources:[{source_id:'source:canonical-1'}],claims:[{source_ids:['source:canonical-1'],statement:'Original claim'}]};
 const {packet,aliases}=evidenceAliases(evidence);
 expect(packet.sources[0].source_id).toBe('S1');expect(packet.claims[0].source_ids).toEqual(['S1']);
 expect(evidence.claims[0].source_ids).toEqual(['source:canonical-1']);
 const restored=restoreCitations({summary:[{text:'Claim [S:S1]',source_ids:['S1']}],alternatives:[],counterevidence:[],unknowns:[]},aliases);
 expect(restored.summary[0]).toEqual({text:'Claim [S:source:canonical-1]',source_ids:['source:canonical-1']});
 expect(()=>restoreCitations({summary:[{text:'invented',source_ids:['S99']}]},aliases)).toThrow('ai_unknown_source');
});

import {caseEvidence} from '../../../services/cloudflare/ai.js';
test('case evidence includes bounded real detector context rather than claims alone',()=>{
 const sources=Array.from({length:65},(_,i)=>({source_id:'source:'+i,publisher:'TEST',url:'https://example.test/',published_at_utc:null,retrieved_at_utc:'2026-01-01T00:00:00Z'}));
 const payload={case:{case_id:'test',title:'SYNTHETIC TEST',sources,claims:[],observations:[{observation_id:'o1',observed_at_utc:'2026-01-01T00:00:00Z',metric:'test',value:3,unit:'count',evidence_status:'reported',provenance:{source_ids:['source:64']}}]},analysis:{anomalies:[{anomaly_id:'a1',observation_ids:['o1'],detector:'median-mad',baseline_description:'prior median=1',window_end_utc:'2026-01-01',window_start_utc:'2025-12-01',score:8,provenance:{source_ids:sources.map(s=>s.source_id)}}],warnings:[]}};
 const e=caseEvidence(payload);expect(e.sources).toHaveLength(65);expect(e.candidates[0].baseline_description).toBe('prior median=1');expect(e.observations[0].value).toBe(3);
 expect(JSON.stringify(evidenceAliases(e).packet).length).toBeLessThan(18000);
});


test('case baseline citations retain all known references within the evidence bound', () => {
 const ids=Array.from({length:65},(_,i)=>'S'+(i+1));
 const answer={summary:[{text:'Synthetic test baseline',source_ids:ids}],alternatives:[],counterevidence:[],unknowns:[]};
 expect(validateAnswer(answer,new Set(ids))).toBe(answer);
 expect(()=>validateAnswer(answer,new Set(ids.slice(1)))).toThrow('ai_unknown_source');
 const tooMany=Array.from({length:73},(_,i)=>'S'+i);
 expect(()=>validateAnswer({...answer,summary:[{text:'Synthetic',source_ids:tooMany}]},new Set(tooMany))).toThrow('invalid_ai_response');
});
