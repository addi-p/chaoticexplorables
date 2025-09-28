export class ExplorableBase {
  constructor(mount, opts = {}) {
    this.o = Object.assign(
      {
        theme: 'light',           // force readable defaults
        layout: 'stack',
        showControls: true,
        onTick: null,
        dt: 1 / 240,
        sizes: {
          scene: { width: 200, height: 200, viewBox: '-220 -220 440 440' },
          phase: { width: 200, height: 200 }
        }
      },
      opts
    );

    this.root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('Mount element not found');

    this.root.classList.add('cx-root');
    this._ensureStyles();

    this.wrap = document.createElement('div');
    this.wrap.className = 'cx-wrap';
    this.wrap.setAttribute('data-theme', this.o.theme);
    this.root.appendChild(this.wrap);

    this.running = false;
    this.lastTs = 0;
    this.acc = 0;
    this.dt = this.o.dt;
  }

  _ensureStyles() {
    if (!document.getElementById('cx-themes')) {
      const link = document.createElement('link');
      link.id = 'cx-themes';
      link.rel = 'stylesheet';
      link.href = new URL('./themes.css', import.meta.url);
      document.head.appendChild(link);
    }
  }
  _ensureStylesheet(url, id) {
    if (id && document.getElementById(id)) return;
    const link = document.createElement('link');
    if (id) link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  play(){ if (this.running) return; this.running = true; this.lastTs = 0; this.acc = 0; this._raf = requestAnimationFrame(t => this._loop(t)); }
  pause(){ this.running = false; }
  reset(){ this.pause(); this._resetModel(); this.render(); }
  setParams(patch){ Object.assign(this.params, patch); }
  setSizes(partial){ this.o.sizes = { ...this.o.sizes, ...partial }; }

  _loop(ts){
    if (!this.running) { this._raf = null; return; }
    if (!this.lastTs) this.lastTs = ts;
    const dtms = ts - this.lastTs; this.lastTs = ts;
    this.acc += dtms / 1000;
    let steps = 0;
    while (this.acc >= this.dt && steps < 8) { this._step(); this.acc -= this.dt; steps++; }
    this.render();
    if (typeof this.o.onTick === 'function') this.o.onTick(this.getState?.());
    this._raf = requestAnimationFrame(t => this._loop(t));
  }

  _makeSvg({ viewBox, width, height, className = 'cx-svg' } = {}) {
    const s = this._svg('svg', {});
    if (viewBox != null) s.setAttribute('viewBox', viewBox);
    if (width) s.setAttribute('width', String(width));
    if (height) s.setAttribute('height', String(height));
    s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    s.classList.add(className);
    return s;
  }
  _svg(tag, attrs){ const el = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; }

  _resetModel() {}
  _step() {}
  render() {}
  getState(){ return {}; }
}