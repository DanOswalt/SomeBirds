// clock, use ticks to schedule animations
class Scheduler {
  _tick = 0;
  _nextTimeToTick = 0;
  TICK_RATE = 100;
  scheduledFunction = null;

  tick() {
    this._tick += 1;
  }

  reset() {
    this._tick = 0;
  }

  currentTime() {
    return this._tick;
  }

  start(fn) {
    this._nextTimeToTick = Date.now();
    this.scheduledFunction = fn;
    this.checkForNextFrame();
  }

  checkForNextFrame() {
    const now = Date.now();
    if (this._nextTimeToTick <= now) {
      this.tick();
      this._nextTimeToTick = now + this.TICK_RATE;
      this.scheduledFunction();
    }
    requestAnimationFrame(() => {
      this.checkForNextFrame();
    });
  }
}
