import { expect, test } from "vitest";
import { TracePlayer } from "../src/trace/player";
import { readFileSync } from "node:fs";
import type { NarrativeStep } from "../src/contracts/generated";
const steps = JSON.parse(
  readFileSync("public/demo/synthetic-case.json", "utf8"),
).case.narratives[0].steps as NarrativeStep[];
test("pause freezes progress, resume advances, seek is deterministic and destroy cancels work", () => {
  let time = 0;
  let tick: FrameRequestCallback = () => {};
  let canceled = 0;
  const frames: { index: number; progress: number }[] = [];
  const player = new TracePlayer(
    steps,
    (f) => frames.push(f),
    () => time,
    (fn) => {
      tick = fn;
      return 1;
    },
    () => {
      canceled++;
    },
  );
  player.play();
  time = 1000;
  tick(time);
  player.pause();
  const frozen = player.frame();
  time = 9000;
  expect(player.frame()).toEqual(frozen);
  player.play();
  time = 9500;
  tick(time);
  expect(player.frame().progress).toBeGreaterThan(frozen.progress);
  player.seek(2);
  const scene = player.frame();
  player.seek(1);
  player.seek(2);
  expect(player.frame()).toEqual(scene);
  player.destroy();
  expect(canceled).toBeGreaterThan(0);
  expect(player.playing).toBe(false);
});
