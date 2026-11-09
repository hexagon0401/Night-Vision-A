import type { Narrative, NarrativeStep } from "../contracts/generated";
import { TracePlayer, type Frame } from "./player";
export function traceView(
  root: HTMLElement,
  frame: (value: Frame) => void,
  stop: () => void,
  sources: (step: NarrativeStep) => void,
  exit: () => void,
) {
  const dock = document.createElement("section");
  dock.className = "trace-dock";
  dock.hidden = true;
  dock.setAttribute("aria-label", "Trace 재생");
  root.append(dock);
  dock.innerHTML =
    '<p class="trace-subtitle" aria-live="polite"></p><div class="trace-controls"><button data-trace="previous" aria-label="이전 장면">←</button><button data-trace="play" aria-label="재생 전환">Play</button><button data-trace="next" aria-label="다음 장면">→</button><span class="trace-count"></span><button data-trace="skip">Skip animation</button><button data-trace="source">Evidence</button><button data-trace="language">KO / EN</button><button data-trace="exit">Explore</button></div>';
  let player: TracePlayer | null = null;
  let language: "ko" | "en" = "ko";
  const emit = (value: Frame) => {
    dock.querySelector(".trace-subtitle")!.textContent =
      language === "ko" ? value.step.subtitle_ko : value.step.subtitle_en;
    dock.querySelector(".trace-count")!.textContent =
      `${value.index + 1} / ${player?.steps.length ?? 5}`;
    dock.querySelector('[data-trace="play"]')!.textContent = value.playing
      ? "Pause"
      : "Play";
    dock.dataset.step = String(value.index);
    dock.dataset.progress = String(value.progress);
    frame(value);
  };
  dock.addEventListener("click", (event) => {
    const action = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-trace]",
    )?.dataset.trace;
    if (!player) return;
    if (action === "play") {
      if (player.playing) {
        player.pause();
        stop();
      } else player.play();
    }
    if (action === "previous" || action === "next" || action === "skip") {
      player.seek(player.index + (action === "previous" ? -1 : 1));
      player.complete();
      stop();
    }
    if (action === "skip") {
      player.complete();
      stop();
    }
    if (action === "language") {
      language = language === "ko" ? "en" : "ko";
      emit(player.frame());
    }
    if (action === "source") {
      player.pause();
      stop();
      sources(player.frame().step);
    }
    if (action === "exit") exit();
  });
  return {
    start(narrative: Narrative) {
      player?.destroy();
      dock.hidden = false;
      player = new TracePlayer(narrative.steps, emit);
      emit(player.frame());
    },
    pause() {
      player?.pause();
      stop();
    },
    close() {
      player?.destroy();
      player = null;
      dock.hidden = true;
      stop();
    },
    destroy() {
      player?.destroy();
      dock.remove();
    },
  };
}
