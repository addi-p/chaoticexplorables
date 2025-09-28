export class ExplorableBase {
  constructor(mount, opts = {}) {
    this.o = Object.assign({
      theme: 'dark',
      layout: 'stack',      // 'stack' | 'side'
      showControls: true,
      icons: {},
      onTick: null
    }, opts);

    this.root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('Mount not found');

    this.root.classList.add('cx-root');
    this._ensureStyles();
    this.wrap = document.createElement('div');
    this.wrap.className = 'cx-wrap';
    this.wrap.setAttribute('data-theme', this.o.theme);
    this.root.appendChild(this.wrap);

    this.running = false;
    this.lastTs = 0;
    this.acc = 0;
    this.dt = this.o.dt ?? 1 / 240;
  }

  _ensureStyles() {
    if (document.getElementById('cx-themes')) return;
    const link = document.createElement('link');
    link.id = 'cx-themes';
    link.rel = 'stylesheet';
    link.href = new URL('./themes.css', import.meta.url);
    document.head.appendChild(link);
  }

  play() { if (this.running) return; this.running = true; this.lastTs = 0; this.acc = 0; this._raf = requestAnimationFrame(t => this._loop(t)); }
  pause() { this.running = false; }
  reset() { this.pause(); this._resetModel(); this.render(); }
  setParams(patch) { Object.assign(this.params, patch); }
  _loop(ts) {
    if (!this.running) { this._raf = null; return; }
    if (!this.lastTs) this.lastTs = ts;
    const dtms = ts - this.lastTs; this.lastTs = ts; this.acc += dtms / 1000;
    let steps = 0;
    while (this.acc >= this.dt && steps < 8) { this._step(); this.acc -= this.dt; steps++; }
    this.render();
    if (typeof this.o.onTick === 'function') this.o.onTick(this.getState?.());
    this._raf = requestAnimationFrame(t => this._loop(t));
  }

  // abstract-ish hooks your modules implement:
  _resetModel() {}   // seed state
  _step() {}         // advance model
  render() {}        // draw

  // helpers you can optionally override:
  getState() { return {}; }
}