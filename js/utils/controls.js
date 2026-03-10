/* ═══════════════════════════════════════════
   utils/controls.js — Reusable control builder
   ═══════════════════════════════════════════ */

/**
 * AnimController manages start/pause/step/reset state
 * for any visualization.
 */
class AnimController {
  constructor() {
    this.running = false;
    this.paused = false;
    this.stepping = false;
    this._resolve = null;
    this._reject = null;
    this.onStop = null; // callback when finished/reset
  }

  /** Returns a promise that resolves after `delay` ms,
   *  but respects pause/step/stop. */
  async tick(delay) {
    if (!this.running) throw new StopError();
    if (this.stepping) {
      this.stepping = false;
      this.paused = true;
    }
    if (this.paused) {
      await new Promise((res, rej) => {
        this._resolve = res;
        this._reject = rej;
      });
    }
    if (!this.running) throw new StopError();
    await sleep(delay);
    if (!this.running) throw new StopError();
  }

  start() {
    this.running = true;
    this.paused = false;
    this.stepping = false;
  }

  pause() {
    if (!this.running) return;
    this.paused = true;
  }

  resume() {
    this.paused = false;
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  step() {
    if (this.paused && this._resolve) {
      this.stepping = false;
      this._resolve();
      this._resolve = null;
      // immediately re-pause after one step
      this.paused = true;
    } else if (!this.running) {
      // not started yet — caller handles
    }
  }

  stop() {
    this.running = false;
    this.paused = false;
    if (this._reject) {
      this._reject(new StopError());
      this._reject = null;
    }
    if (this.onStop) this.onStop();
  }
}

class StopError extends Error {
  constructor() {
    super("Animation stopped");
    this.name = "StopError";
  }
}
