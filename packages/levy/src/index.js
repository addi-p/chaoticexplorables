// ./levy/src/index.js
// Minimal Levy-flight explorable (inspired by your double-pendulum style)
// - Controls: α, xmin, cap, #trajectories + Play/Pause, Reload
// - All trajectories start at world (0,0)
// - Origin is mapped to canvas center; smooth zoom-out with a short delay
// - Uses your widgets (slider/sliderElement) and icon set
//
// Widgets used: slider + sliderElement, and button symbols
//   slider: API with .id/.label/.size/.range/.value/.show/.update/.update_end/.position etc.  (your slider.js)
//   sliderElement: renders SVG track/handle/label + drag & click                               (your sliderElement.js)
//   iconFor: returns a path factory for a given type ("play", "pause", "reload")               (your button-symbols.js)

import slider from '../../widgets/src/slider.js';
import sliderElement from '../../widgets/src/sliderElement.js';
import iconFor from '../../widgets/src/button-symbols.js';

// --- one-time CSS (plain tone) ------------------------------------------------
(function ensureWidgetsCSS(){
  const id = 'cx-widgets-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = new URL('../../widgets/src/widgets-plain.css', import.meta.url).toString();
    document.head.appendChild(link);
  }
})();
// --- KaTeX bootstrap (once) --------------------------------------------------
async function ensureKaTeX() {
  if (window.katex) return window.katex;

  // CSS
  if (!document.getElementById('katex-css')) {
    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    document.head.appendChild(link);
  }

  // JS (ESM)
  const mod = await import('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.mjs');
  window.katex = mod.default || mod;
  return window.katex;
}

// --- utilities ----------------------------------------------------------------
const TAU = Math.PI * 2;
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

// Make canvas device-pixel crisp while keeping CSS size unchanged
function resizeCanvasToDisplaySize(cvs){
  const dpr = Math.max(1, globalThis.devicePixelRatio || 1);
  const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width)  || 300;
  const cssH = cvs.clientHeight|| parseFloat(getComputedStyle(cvs).height) || 300;
  const w = Math.floor(cssW * dpr), h = Math.floor(cssH * dpr);
  if (cvs.width !== w || cvs.height !== h) { cvs.width = w; cvs.height = h; return {changed:true, cssW, cssH, dpr}; }
  return {changed:false, cssW, cssH, dpr};
}

// Simple SVG symbol button (same pattern as your example)
function createSymbolButton(svg, { x, y, size = 16, symbol = 'play', onClick }){
  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class','widget button');
  g.setAttribute('transform',`translate(${x},${y})`);
  svg.appendChild(g);

  const half = size;
  const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('x',-half); bg.setAttribute('y',-half);
  bg.setAttribute('width',2*half); bg.setAttribute('height',2*half);
  bg.setAttribute('class','lit'); // light background by default
  g.appendChild(bg);

  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('class','symbol');
  g.appendChild(path);

  const setSymbol = (name)=>{
    const fn = iconFor(name);
    path.setAttribute('d', fn(size * 0.75));
  };
  setSymbol(symbol);

  const hit = document.createElementNS('http://www.w3.org/2000/svg','rect');
  hit.setAttribute('x',-half); hit.setAttribute('y',-half);
  hit.setAttribute('width',2*half); hit.setAttribute('height',2*half);
  hit.setAttribute('fill','transparent');
  hit.style.cursor='pointer';
  hit.addEventListener('click', (ev)=>{ ev.stopPropagation(); onClick && onClick(ev, { setSymbol }); });
  g.appendChild(hit);

  return { group:g, setSymbol };
}

// Pareto Type I (heavy tail). xmin>0, alpha>1 typical for finite mean.
// We'll allow a hard cap (Infinity for none).
function pareto(alpha = 1.6, xmin = 1) {
  const u = Math.random(); // U(0,1)
  return xmin / Math.pow(1 - u, 1 / alpha);
}

// --------------------------------------------------------------------------------
//                                Explorable class
// --------------------------------------------------------------------------------
export class LevyExplorable {
  constructor(mount, opts = {}) {
    this.o = Object.assign({
      width: undefined,        // 'row' layout can be fluid
      sceneSize: 420,          // fallback for stack layout
      layout: 'stack',         // 'stack' | 'row'
      controlsAt: 'end',       // (row) 'end' or 'start'
      transparent: true,
      fitContainer: true,

      // Levy & draw params
      trajectories: 8,
      alpha: 1.6,
      xmin: 1,
      cap: 250,                // 0 (or <=0) = Infinity
      stepsPerSecond: 60,
      strokeScale: 1.0,
      zoomDelayMs: 450,
      zoomDurationMs: 800
    }, opts);

    // Root
    this.root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('LevyExplorable: mount not found');

    // Wrapper + basic layout
    if (!document.getElementById('cx-levy-layout-css')) {
      const style = document.createElement('style');
      style.id = 'cx-levy-layout-css';
      style.textContent = `
        .cx-levy-wrap { display:flex; gap:10px; align-items:flex-start; }
        .cx-levy-wrap.stack { flex-direction:column; }
        .cx-levy-wrap.row { flex-direction:row; flex-wrap:nowrap; }
        .cx-levy-controls { display:block; }
        .cx-levy-scene-box { display:block; line-height:0; }
      `;
      document.head.appendChild(style);
    }

    this.wrap = document.createElement('div');
    this.wrap.className = `cx-levy-wrap ${this.o.layout === 'row' ? 'row' : 'stack'}`;
    this.root.appendChild(this.wrap);

    this.controlsHost = document.createElement('div');
    this.controlsHost.className = 'cx-levy-controls d3-widgets';
    this._controlsMin = 180;
    this._controlsMax = 320;
    this._controlsBase = 220;

    this.sceneBox = document.createElement('div');
    this.sceneBox.className = 'cx-levy-scene-box';

    this._applyLayoutOrder();

    // Scene: Canvas (fast to redraw when zoom scale changes)
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, {
    border: '1px solid var(--color-border, #858585ff)',
    borderRadius: '0',
    boxSizing: 'border-box'
    });
    this.canvas.style.display='block';
    this.canvas.style.background = this.o.transparent ? 'transparent' : '#fff';
    this.canvas.style.setProperty('background-color', this.o.transparent ? 'transparent' : '#fff', 'important');
    this.sceneBox.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    // State
    this.running = false;
    this.scale = 1;                   // pixels per world unit
    this.pad = 16;
    this._overflowSince = null;
    this._zoomTween = null;
    this._zoomT0 = 0; this._zoomT1 = 0;
    this._tAccumulator = 0;           // for stepsPerSecond timing
    this._lastTs = 0;

    // Data
    this._buildEnsemble();

    // Controls + initial sizing
    this._buildControls(this.controlsHost);
    this._applyResponsiveSizing(true);
    this.render();

    if (this.o.fitContainer) {
      this._ro = new ResizeObserver(() => this._applyResponsiveSizing(false));
      this._ro.observe(this.root);
    }
  }

  // --- layout helpers --------------------------------------------------------
  _applyLayoutOrder(){
    this.wrap.innerHTML = '';
    if (this.o.layout === 'row') {
      if (this.o.controlsAt === 'start') {
        this.wrap.appendChild(this.controlsHost);
        this.wrap.appendChild(this.sceneBox);
      } else {
        this.wrap.appendChild(this.sceneBox);
        this.wrap.appendChild(this.controlsHost);
      }
    } else {
      this.wrap.appendChild(this.controlsHost);
      this.wrap.appendChild(this.sceneBox);
    }
  }

  _applyResponsiveSizing(initial=false){
    if (this.o.layout !== 'row' || !this.o.fitContainer) {
      const s = this.o.sceneSize;
      this._setControlsWidth(this._controlsBase);
      this._setSceneSize(s);
      if (!initial) this.render();
      return;
    }

    const avail = Math.max(0, Math.floor(this.root.clientWidth || 0));
    const gap = 10;
    let cw = clamp(this._controlsBase, this._controlsMin, this._controlsMax);
    const minView = 180;

    let s = Math.floor(avail - cw - gap);
    if (s < minView) {
      cw = clamp(avail - minView - gap, this._controlsMin, this._controlsMax);
      s = Math.floor(avail - cw - gap);
    }
    if (s < minView) {
      this.wrap.classList.remove('row');
      this.wrap.classList.add('stack');
      this._applyLayoutOrder();
      this._setControlsWidth(this._controlsBase);
      this._setSceneSize(this.o.sceneSize);
      if (!initial) this.render();
      return;
    }
    this.wrap.classList.remove('stack');
    this.wrap.classList.add('row');
    this._applyLayoutOrder();
    this._setControlsWidth(cw);
    this._setSceneSize(s);
    if (!initial) this.render();
  }

  _setControlsWidth(px){
    this.controlsHost.style.width = `${Math.round(px)}px`;
    // rebuild controls SVG to new width (so sliders track length matches)
    this._buildControls(this.controlsHost);
  }
  _setSceneSize(px){
    const s = Math.round(px);
    this.sceneBox.style.width = `${s}px`;
    this.sceneBox.style.height = `${s}px`;
    this.canvas.style.width = `${s}px`;
    this.canvas.style.height = `${s}px`;
    resizeCanvasToDisplaySize(this.canvas);
  }

  // --- controls --------------------------------------------------------------
  _buildControls(container){
    container.innerHTML = '';

    const w = Math.max(this._controlsMin, Math.min(this._controlsMax, parseFloat(this.controlsHost.style.width) || this._controlsBase));
    const dy = 40, y0 = 24, y1 = 70;

    // Toolbar (buttons)
    const toolbar = document.createElementNS('http://www.w3.org/2000/svg','svg');
    toolbar.setAttribute('width', w);
    toolbar.setAttribute('height', 44);
    toolbar.style.display='block';
    container.appendChild(toolbar);

    this._playBtn = createSymbolButton(toolbar, {
      x: 18, y: y0, size: 16, symbol: this.running ? 'pause' : 'play',
      onClick: (_ev, api) => {
        if (this.running) { this.pause(); api.setSymbol('play'); }
        else { this.play(); api.setSymbol('pause'); }
      }
    });

    createSymbolButton(toolbar, {
      x: 52, y: y0, size: 16, symbol: 'reload',
      onClick: () => { this.reset(true); }
    });

    // Sliders block
    const slidersSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
    const totalRows = 5; // alpha, xmin, cap, trajectories, speed
    slidersSVG.setAttribute('width', w);
    slidersSVG.setAttribute('height', y1 + (totalRows-1)*dy + 24);
    slidersSVG.style.display='block';
    container.appendChild(slidersSVG);
    

    // α (tail exponent)
    const aS = slider().id('alpha').label('α').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*0 })
      .range([1.1, 3.0])
      .value(this.o.alpha)
      .show(true)
      .update(()=>{ this.o.alpha = aS.value(); this.reset(false); });
    slidersSVG.appendChild(sliderElement(aS));

    // xmin (minimum step)
    const xS = slider().id('xmin').label('x_min').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*1 })
      .range([0.2, 10])
      .value(this.o.xmin)
      .show(true)
      .update(()=>{ this.o.xmin = xS.value(); this.reset(false); });
    slidersSVG.appendChild(sliderElement(xS));

    // cap (0 → Infinity)
    const cS = slider().id('cap').label('cap').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*2 })
      .range([0, 800])
      .value(this.o.cap <= 0 ? 0 : this.o.cap)
      .show(true)
      .update(()=>{
        const v = Math.max(0, cS.value());
        this.o.cap = (v <= 0 ? Infinity : v);
        this.reset(false);
      });
    slidersSVG.appendChild(sliderElement(cS));

    // # trajectories
    const mS = slider().id('traj').label('N').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*3 })
      .range([1, 64])
      .value(Math.max(1, Math.round(this.o.trajectories)))   // ensure initial integer
      .show(true)
      .update(() => {
        const v = Math.max(1, Math.round(mS.value()));
        if (mS.value() !== v) mS.value(v);                   // snap knob to integer
        if (v !== this.o.trajectories) this.o.trajectories = v;
      })
      .update_end(() => {                                     // rebuild once on release
        this._buildEnsemble();
        this.render();
      });
    slidersSVG.appendChild(sliderElement(mS));

    // speed (steps per second)
    const spS = slider().id('speed').label('speed (steps/s)').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*4 })
      .range([1, 240])
      .value(this.o.stepsPerSecond)
      .show(true)
      .update(()=>{ this.o.stepsPerSecond = Math.max(1, spS.value()); });
    slidersSVG.appendChild(sliderElement(spS));
  }

  // --- data ------------------------------------------------------------------
_buildEnsemble(){
  const M = Math.max(1, this.o.trajectories | 0); // integer & ≥1
  this.paths = new Array(M).fill(null).map(() => [{x:0, y:0}]);
  this.maxAbsX = this.maxAbsY = 0;
  this.scale = 1;
  this._overflowSince = null;
  this._zoomTween = null;
}

  reset(reseed=true){
    if (reseed) this._buildEnsemble();
    // keep current ensemble but reset the camera so we refit gently
    this._overflowSince = null;
    this._zoomTween = null;
  }

  // --- stepping --------------------------------------------------------------
  _stepOne(){
    const { alpha, xmin, cap } = this.o;
    const C = (cap === Infinity || cap <= 0) ? Infinity : cap;
    for (let m=0; m<this.paths.length; m++){
      const arr = this.paths[m];
      const last = arr[arr.length-1];
      const r0 = pareto(alpha, xmin);
      const r  = Math.min(r0, C);
      const th = Math.random() * TAU;
      const nx = last.x + r * Math.cos(th);
      const ny = last.y + r * Math.sin(th);
      arr.push({x:nx, y:ny});
      this.maxAbsX = Math.max(this.maxAbsX, Math.abs(nx));
      this.maxAbsY = Math.max(this.maxAbsY, Math.abs(ny));
    }
  }

  // --- camera fit / zoom-out with delay --------------------------------------
  _fitTargetScale(){
    // Ensure all points fit with padding while keeping origin at center
    const cvs = this.canvas;
    const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width) || 300;
    const cssH = cvs.clientHeight|| parseFloat(getComputedStyle(cvs).height)|| 300;
    const halfW = cssW/2 - this.pad, halfH = cssH/2 - this.pad;

    const sx = halfW / Math.max(1e-6, this.maxAbsX);
    const sy = halfH / Math.max(1e-6, this.maxAbsY);
    const s  = Math.min(sx, sy);
    return Math.min(s, 1e6); // clamp very large
  }

  _maybeStartZoom(){
    const target = this._fitTargetScale();
    if (!isFinite(target) || target <= 0) return;

    // We only zoom OUT (reduce scale); never zoom in (prevents jitter)
    if (target < this.scale * 0.985) {
      if (this._overflowSince == null) this._overflowSince = performance.now();
      const dt = performance.now() - this._overflowSince;
      if (!this._zoomTween && dt >= this.o.zoomDelayMs) {
        const s0 = this.scale, s1 = target;
        this._zoomT0 = performance.now();
        this._zoomT1 = this._zoomT0 + this.o.zoomDurationMs;
        this._zoomTween = (t) => s0 + (s1 - s0) * easeOutCubic(t);
      }
    } else {
      if (!this._zoomTween) this._overflowSince = null;
    }
  }

  _applyZoomTween(){
    if (!this._zoomTween) return;
    const t = clamp((performance.now() - this._zoomT0) / (this._zoomT1 - this._zoomT0), 0, 1);
    this.scale = this._zoomTween(t);
    if (t >= 1) this._zoomTween = null;
  }

  // --- rendering --------------------------------------------------------------
  render(){
    const {changed, cssW, cssH, dpr} = resizeCanvasToDisplaySize(this.canvas);
    const ctx = this.ctx;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

    // Continue any active zoom animation
    this._applyZoomTween();

    // Map world (x,y) -> canvas (px)
    const toX = (x) => (cssW/2 + this.scale * x);
    const toY = (y) => (cssH/2 - this.scale * y); // y-up in world

    // Draw each trajectory
    ctx.save();
    ctx.scale(dpr, dpr);
    const N = this.paths.length;
    for (let i=0; i<N; i++){
      const p = this.paths[i];
      if (p.length < 2) continue;
      const hue = (360 * i / Math.max(1, N)) | 0;
      ctx.strokeStyle = `hsl(${hue} 60% 45%)`;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.4 * this.o.strokeScale;

      ctx.beginPath();
      ctx.moveTo(toX(p[0].x), toY(p[0].y));
      for (let k=1; k<p.length; k++){
        const q = p[k];
        ctx.lineTo(toX(q.x), toY(q.y));
      }
      ctx.stroke();

      // head
      const q = p[p.length-1];
      ctx.beginPath();
      ctx.arc(toX(q.x), toY(q.y), 3.2, 0, TAU);
      ctx.fillStyle = `hsl(${hue} 60% 45%)`;
      ctx.fill();
    }
    ctx.restore();
  }

  // --- play/pause loop --------------------------------------------------------
  play(){
    if (this.running) return;
    this.running = true;
    this._lastTs = 0;
    const loop = (ts)=>{
      if (!this.running) return;
      if (!this._lastTs) this._lastTs = ts;
      const dt = Math.min((ts - this._lastTs) / 1000, 0.1);
      this._lastTs = ts;

      // advance by ~stepsPerSecond
      this._tAccumulator += dt * this.o.stepsPerSecond;
      let steps = this._tAccumulator | 0;
      if (steps <= 0) { requestAnimationFrame(loop); return; }
      this._tAccumulator -= steps;

      while (steps-- > 0) {
        this._stepOne();
        this._maybeStartZoom();
      }
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  pause(){ this.running = false; }

  // convenience for external layout toggling, if you want it later
  setLayout(layout='stack', controlsAt='end'){
    this.o.layout = layout;
    this.o.controlsAt = controlsAt;
    this._applyResponsiveSizing(false);
  }
}