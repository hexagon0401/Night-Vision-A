import type { NarrativeStep } from "../contracts/generated";
export interface Frame {
  index: number;
  progress: number;
  playing: boolean;
  step: NarrativeStep;
}
export class TracePlayer {
  private handle: number | null = null;
  private elapsed = 0;
  private started = 0;
  index = 0;
  playing = false;
  constructor(
    readonly steps: NarrativeStep[],
    private emit: (frame: Frame) => void,
    private now = () => performance.now(),
    private request = (fn: FrameRequestCallback) => requestAnimationFrame(fn),
    private cancel = (id: number) => cancelAnimationFrame(id),
  ) {
    if (!steps.length) throw new Error("Trace needs scenes");
  }
  frame() {
    return {
      index: this.index,
      progress: Math.min(1, this.elapsed / this.steps[this.index].duration_ms),
      playing: this.playing,
      step: this.steps[this.index],
    };
  }
  play() {
    if (this.playing) return;
    if (this.elapsed >= this.steps[this.index].duration_ms) {
      this.elapsed = 0;
      if (this.index === this.steps.length - 1) this.index = 0;
    }
    this.playing = true;
    this.started = this.now();
    this.emit(this.frame());
    this.handle = this.request(() => this.tick());
  }
  private tick() {
    if (!this.playing) return;
    const now = this.now();
    this.elapsed += Math.max(0, now - this.started);
    this.started = now;
    while (this.elapsed >= this.steps[this.index].duration_ms) {
      this.elapsed -= this.steps[this.index].duration_ms;
      if (this.index === this.steps.length - 1) {
        this.elapsed = this.steps[this.index].duration_ms;
        this.playing = false;
        break;
      }
      this.index++;
    }
    this.emit(this.frame());
    this.handle = this.playing ? this.request(() => this.tick()) : null;
  }
  pause() {
    if (this.playing) {
      this.elapsed += Math.max(0, this.now() - this.started);
      this.elapsed = Math.min(this.elapsed, this.steps[this.index].duration_ms);
    }
    this.playing = false;
    if (this.handle !== null) this.cancel(this.handle);
    this.handle = null;
    this.emit(this.frame());
  }
  seek(index: number) {
    this.pause();
    this.index = Math.max(0, Math.min(this.steps.length - 1, index));
    this.elapsed = 0;
    this.emit(this.frame());
  }
  complete() {
    this.pause();
    this.elapsed = this.steps[this.index].duration_ms;
    this.emit(this.frame());
  }
  destroy() {
    this.playing = false;
    if (this.handle !== null) this.cancel(this.handle);
    this.handle = null;
  }
}
