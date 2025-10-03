// ./oscillators/src/index.js
// Oscillators explorable with time series + phase space (x′ vs x),
// Duffing physics, smooth autoscale (in/out), PRESET DROPDOWN,
// VECTOR FIELD toggle, and a PHASE slider φ (for the frozen field).

import slider from '../../widgets/src/slider.js';
import sliderElement from '../../widgets/src/sliderElement.js';
import dropdown from '../../widgets/src/dropdown.js';
import dropdownElement from '../../widgets/src/dropdownElement.js';
import toggle from '../../widgets/src/toggle.js';
import toggleElement from '../../widgets/src/toggleElement.js';
import iconFor from '../../widgets/src/button-symbols.js';

(function ensureWidgetsCSS(){
  const id = 'cx-widgets-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = new URL('../../widgets/src/widgets-plain.css', import.meta.url).toString();
    document.head.appendChild(link);
  }
})();

const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

function resizeCanvasToDisplaySize(cvs){
  const dpr = Math.max(1, globalThis.devicePixelRatio || 1);
  const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width)  || 300;
  const cssH = cvs.clientHeight|| parseFloat(getComputedStyle(cvs).height) || 300;
  const w = Math.floor(cssW * dpr), h = Math.floor(cssH * dpr);
  if (cvs.width !== w || cvs.height !== h) { cvs.width = w; cvs.height = h; }
  return { cssW, cssH, dpr };
}

function createSymbolButton(svg, { x, y, size = 16, symbol = 'play', onClick }){
  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class','widget button');
  g.setAttribute('transform',`translate(${x},${y})`);
  svg.appendChild(g);

  const half = size;
  const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('x',-half); bg.setAttribute('y',-half);
  bg.setAttribute('width',2*half); bg.setAttribute('height',2*half);
  bg.setAttribute('class','lit');
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

export class OscillatorsExplorable {
  constructor(mount, opts = {}) {
    this.o = Object.assign({
      layout: 'row',
      controlsAt: 'end',
      transparent: true,
      fitContainer: true,

      sceneSize: 360,
      strokeScale: 1.0,

      // parameters
      omega0: 1.0,   // ω0
      zeta:   0.05,  // ζ
      beta:   0.0,   // β (Duffing cubic)
      F:      0.0,   // forcing amplitude
      Omega:  1.0,   // forcing frequency
      x0:     1.0,
      v0:     0.0,

      // integration / display
      dt: 1/240,
      windowSec: 12,
      zoomDelayMs: 300,
      zoomDurationMs: 550,

      // vector field behavior
      showVectorField: false,
      freezeFieldPhase: true, // frozen snapshot for field (not time-varying)
      fieldPhase: 0           // radians; used when freezeFieldPhase === true
    }, opts);

    this.root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('OscillatorsExplorable: mount not found');

    if (!document.getElementById('cx-osc-layout-css')) {
      const style = document.createElement('style');
      style.id = 'cx-osc-layout-css';
      style.textContent = `
        .cx-osc-wrap { display:flex; gap:10px; align-items:flex-start; }
        .cx-osc-wrap.stack { flex-direction:column; }
        .cx-osc-wrap.row   { flex-direction:row; flex-wrap:nowrap; }
        .cx-osc-controls { display:block; }
        .cx-osc-view { display:block; line-height:0; }
        .cx-osc-time-box, .cx-osc-phase-box { line-height:0; }
        .cx-osc-view canvas { border:1px solid var(--color-border, #c9c9c9); box-sizing:border-box; }
      `;
      document.head.appendChild(style);
    }

    this.wrap = document.createElement('div');
    this.wrap.className = `cx-osc-wrap ${this.o.layout === 'row' ? 'row' : 'stack'}`;
    this.root.appendChild(this.wrap);

    this.controlsHost = document.createElement('div');
    this.controlsHost.className = 'cx-osc-controls d3-widgets';
    this._controlsMin = 200;
    this._controlsMax = 340;
    this._controlsBase = 240;

    this.timeBox = document.createElement('div');
    this.timeBox.className = 'cx-osc-view cx-osc-time-box';
    this.phaseBox = document.createElement('div');
    this.phaseBox.className = 'cx-osc-view cx-osc-phase-box';

    this._applyLayoutOrder();

    // canvases
    this.timeCanvas = document.createElement('canvas');
    this.phaseCanvas = document.createElement('canvas');
    for (const c of [this.timeCanvas, this.phaseCanvas]) {
      c.style.display='block';
      c.style.background = this.o.transparent ? 'transparent' : '#fff';
      c.style.setProperty('background-color', this.o.transparent ? 'transparent' : '#fff', 'important');
    }
    this.timeBox.appendChild(this.timeCanvas);
    this.phaseBox.appendChild(this.phaseCanvas);
    this.timeCtx = this.timeCanvas.getContext('2d', { alpha: true });
    this.phaseCtx = this.phaseCanvas.getContext('2d', { alpha: true });

    // sim state
    this.running = false;
    this._regKey = 'uu_lin';
    this.t = 0;
    this.state = { x: this.o.x0, v: this.o.v0 };

    // ring buffer
    this._allocBuffers();

    // zoom states
    this._z = {
      time:  { sY:1, target:1, t0:0, t1:0, tween:null, since:null },
      phase: { s:1,  target:1, t0:0, t1:0, tween:null, since:null }
    };

    // controls + draw
    this._buildControls(this.controlsHost);
    this._applyResponsiveSizing(true);
    this._reset(true);
    this.render();

    if (this.o.fitContainer) {
      this._ro = new ResizeObserver(()=> this._applyResponsiveSizing(false));
      this._ro.observe(this.root);
    }
  }

  /* buffers */
  _allocBuffers(){
    const cap = Math.max(200, Math.ceil(this.o.windowSec / this.o.dt) + 20);
    this.bufT = new Float64Array(cap);
    this.bufX = new Float64Array(cap);
    this.bufV = new Float64Array(cap);
    this.head = 0;
    this.count = 0;
    this.cap = cap;
  }
  _pushSample(t, x, v){
    this.bufT[this.head] = t;
    this.bufX[this.head] = x;
    this.bufV[this.head] = v;
    this.head = (this.head + 1) % this.cap;
    this.count = Math.min(this.count + 1, this.cap);
  }
  _reset(hard=false){
    if (hard) { this.state.x = this.o.x0; this.state.v = this.o.v0; }
    this.t = 0;
    this.head = 0; this.count = 0;
    this.bufT.fill(0); this.bufX.fill(0); this.bufV.fill(0);
    this._z.time =  { sY:1, target:1, t0:0, t1:0, tween:null, since:null };
    this._z.phase = { s:1,  target:1, t0:0, t1:0, tween:null, since:null };
  }

  /* layout */
  _applyLayoutOrder(){
    this.wrap.innerHTML = '';
    if (this.o.layout === 'row') {
      if (this.o.controlsAt === 'start') {
        this.wrap.appendChild(this.controlsHost);
        this.wrap.appendChild(this.timeBox);
        this.wrap.appendChild(this.phaseBox);
      } else {
        this.wrap.appendChild(this.timeBox);
        this.wrap.appendChild(this.phaseBox);
        this.wrap.appendChild(this.controlsHost);
      }
    } else {
      this.wrap.appendChild(this.controlsHost);
      this.wrap.appendChild(this.timeBox);
      this.wrap.appendChild(this.phaseBox);
    }
  }
  _setControlsWidth(px){
    this.controlsHost.style.width = `${Math.round(px)}px`;
    this._buildControls(this.controlsHost);
  }
  _setSceneSizes(pxEach){
    const s = Math.round(pxEach);
    for (const box of [this.timeBox, this.phaseBox]) {
      box.style.width = `${s}px`;
      box.style.height = `${s}px`;
    }
    for (const c of [this.timeCanvas, this.phaseCanvas]) {
      c.style.width = `${s}px`;
      c.style.height = `${s}px`;
      resizeCanvasToDisplaySize(c);
    }
  }
  _applyResponsiveSizing(initial=false){
    if (this.o.layout !== 'row' || !this.o.fitContainer) {
      this._setControlsWidth(this._controlsBase);
      this._setSceneSizes(this.o.sceneSize);
      if (!initial) this.render();
      return;
    }
    const avail = Math.max(0, Math.floor(this.root.clientWidth || 0));
    const gap = 10;
    let cw = clamp(this._controlsBase, this._controlsMin, this._controlsMax);
    const minView = 160;

    let rem = avail - cw - 2*gap;
    let each = Math.floor(rem / 2);

    if (each < minView) {
      cw = clamp(avail - 2*minView - 2*gap, this._controlsMin, this._controlsMax);
      rem = avail - cw - 2*gap;
      each = Math.floor(rem / 2);
    }
    if (each < minView) {
      this.wrap.classList.remove('row'); this.wrap.classList.add('stack');
      this._applyLayoutOrder();
      this._setControlsWidth(this._controlsBase);
      this._setSceneSizes(this.o.sceneSize);
      if (!initial) this.render();
      return;
    }
    this.wrap.classList.remove('stack'); this.wrap.classList.add('row');
    this._applyLayoutOrder();
    this._setControlsWidth(cw);
    this._setSceneSizes(each);
    if (!initial) this.render();
  }

  /* controls */
  _buildControls(container){
    container.innerHTML = ''; // wipe children

    const w = Math.max(this._controlsMin, Math.min(this._controlsMax, parseFloat(this.controlsHost.style.width) || this._controlsBase));
    const dy = 40, y0 = 24;

    // toolbar (SVG)
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
      onClick: () => { this._reset(true); this.render(); }
    });

    // VECTOR FIELD toggle (SVG)
    const vf = toggle().id('vf').size(10)
      .position({ x: w - 22, y: y0 })    // right side
      .label(null)
      .value(this.o.showVectorField ? 1 : 0)
      .update(() => { this.o.showVectorField = !!vf.value(); this._updatePhiVisibility(); this.render(); });
    toolbar.appendChild(toggleElement(vf));

    // label under the toggle
    const tLbl = document.createElementNS('http://www.w3.org/2000/svg','text');
    tLbl.textContent = 'Field';
    tLbl.setAttribute('x', w - 22);
    tLbl.setAttribute('y', 44);
    tLbl.setAttribute('font-size','12');
    tLbl.setAttribute('fill','var(--color-text)');
    tLbl.setAttribute('text-anchor','middle');
    toolbar.appendChild(tLbl);

    // PRESET DROPDOWN (HTML)
    const ddHost = document.createElement('div');
    ddHost.style.display = 'block'; ddHost.style.width = `${w}px`; ddHost.style.margin = '6px 0 10px 0';
    container.appendChild(ddHost);

    const presets = [
      {label:'Undamped, Unforced (Linear)',    value:'uu_lin'},
      {label:'Undamped, Unforced (Nonlinear)', value:'uu_non'},
      {label:'Damped, Unforced (Linear)',      value:'du_lin'},
      {label:'Damped, Unforced (Nonlinear)',   value:'du_non'},
      {label:'Forced (Linear)',                value:'f_lin'},
      {label:'Forced (Nonlinear)',             value:'f_non'}
    ];
    const dd = dropdown()
      .id('preset').label('Preset').options(presets).value(this._regKey)
      .update(() => { this._regKey = dd.value(); this._applyRegime(this._regKey); this._reset(false); this._updatePhiVisibility(); this.render(); });
    ddHost.appendChild(dropdownElement(dd));

    // sliders (SVG)
    const slidersSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
    const rowsStart = 10; // after dropdown
    const rows = 8;       // ω0, ζ, β, F, Ω, φ, x0, v0   <-- φ added
    slidersSVG.setAttribute('width', w);
    slidersSVG.setAttribute('height', rowsStart + rows*dy);
    slidersSVG.style.display='block';
    container.appendChild(slidersSVG);

    const trackX = 20, trackW = w - 40;

    const wS = slider().id('omega0').label('ω0').size(trackW).girth(8).knob(7)
      .position({ x: trackX, y: rowsStart + dy*0 })
      .range([0.2, 5.0]).value(this.o.omega0).show(true)
      .update(()=>{ this.o.omega0 = wS.value(); });
    slidersSVG.appendChild(sliderElement(wS));

    const zS = slider().id('zeta').label('ζ').size(trackW).girth(8).knob(7)
      .position({ x: trackX, y: rowsStart + dy*1 })
      .range([0.0, 1.0]).value(this.o.zeta).show(true)
      .update(()=>{ this.o.zeta = zS.value(); });
    slidersSVG.appendChild(sliderElement(zS));

    const bS = slider().id('beta').label('β').size(trackW).girth(8).knob(7)
      .position({ x: trackX, y: rowsStart + dy*2 })
      .range([-2.0, 2.0]).value(this.o.beta).show(true)
      .update(()=>{ this.o.beta = bS.value(); });
    slidersSVG.appendChild(sliderElement(bS));

    const fS = slider().id('F').label('F').size(trackW).girth(8).knob(7)
      .position({ x: trackX, y: rowsStart + dy*3 })
      .range([0.0, 2.0]).value(this.o.F).show(true)
      .update(()=>{ this.o.F = fS.value(); this._updatePhiVisibility(); if (this.o.showVectorField) this.render(); });
    slidersSVG.appendChild(sliderElement(fS));

    const OS = slider().id('Omega').label('Ω').size(trackW).girth(8).knob(7)
      .position({ x: trackX, y: rowsStart + dy*4 })
      .range([0.0, 5.0]).value(this.o.Omega).show(true)
      .update(()=>{ this.o.Omega = OS.value(); if (this.o.showVectorField) this.render(); });
    slidersSVG.appendChild(sliderElement(OS));

    // NEW: phase slider φ for the frozen vector field snapshot
    const phiS = slider().id('phi').label('φ').size(trackW).girth(8).knob(7)
      .position({ x: trackX, y: rowsStart + dy*5 })
      .range([0, 2*Math.PI]).value(this.o.fieldPhase).show(true)
      .update(()=>{ this.o.fieldPhase = phiS.value(); if (this.o.showVectorField) this.render(); });
    const phiEl = sliderElement(phiS);
    slidersSVG.appendChild(phiEl);

    const x0S = slider().id('x0').label('x0').size(trackW).girth(8).knob(7)
      .position({ x: trackX, y: rowsStart + dy*6 })
      .range([-2.0, 2.0]).value(this.o.x0).show(true)
      .update(()=>{ this.o.x0 = x0S.value(); });
    slidersSVG.appendChild(sliderElement(x0S));

    const v0S = slider().id('v0').label('v0').size(trackW).girth(8).knob(7)
      .position({ x: trackX, y: rowsStart + dy*7 })
      .range([-2.0, 2.0]).value(this.o.v0).show(true)
      .update(()=>{ this.o.v0 = v0S.value(); });
    slidersSVG.appendChild(sliderElement(v0S));

    this._sliders = { wS, zS, bS, fS, OS, phiS, x0S, v0S };
    this._phiEl = phiEl; // remember element to toggle visibility
    this._applyRegime(this._regKey);
    this._updatePhiVisibility();
  }

  _updatePhiVisibility(){
    if (!this._phiEl) return;
    const show = this.o.showVectorField && this.o.F > 0;
    this._phiEl.style.display = show ? '' : 'none';
  }

  /* regimes */
  _applyRegime(key){
    const s = this._sliders; if (!s) return;
    if (key === 'uu_lin') {
      this.o.zeta = 0.0;  s.zS.value(0.0);
      this.o.F    = 0.0;  s.fS.value(0.0);
      this.o.beta = 0.0;  s.bS.value(0.0);
    } else if (key === 'uu_non') {
      this.o.zeta = 0.0;  s.zS.value(0.0);
      this.o.F    = 0.0;  s.fS.value(0.0);
      if (this.o.beta === 0.0) { this.o.beta = 1.0; s.bS.value(1.0); }
    } else if (key === 'du_lin') {
      if (this.o.zeta <= 0) { this.o.zeta = 0.05; s.zS.value(0.05); }
      this.o.F    = 0.0;  s.fS.value(0.0);
      this.o.beta = 0.0;  s.bS.value(0.0);
    } else if (key === 'du_non') {
      if (this.o.zeta <= 0) { this.o.zeta = 0.05; s.zS.value(0.05); }
      this.o.F    = 0.0;  s.fS.value(0.0);
      if (this.o.beta === 0.0) { this.o.beta = 1.0; s.bS.value(1.0); }
    } else if (key === 'f_lin') {
      if (this.o.zeta <= 0) { this.o.zeta = 0.05; s.zS.value(0.05); }
      if (this.o.F    <= 0) { this.o.F    = 0.5;  s.fS.value(0.5); }
      if (this.o.Omega<= 0) { this.o.Omega= this.o.omega0; s.OS.value(this.o.omega0); }
      this.o.beta = 0.0;  s.bS.value(0.0);
    } else if (key === 'f_non') {
      if (this.o.zeta <= 0) { this.o.zeta = 0.05; s.zS.value(0.05); }
      if (this.o.F    <= 0) { this.o.F    = 0.5;  s.fS.value(0.5); }
      if (this.o.Omega<= 0) { this.o.Omega= this.o.omega0; s.OS.value(this.o.omega0); }
      if (this.o.beta === 0.0) { this.o.beta = 1.0; s.bS.value(1.0); }
    }
  }

  /* physics (Duffing):
     x'' + 2ζω0 x' + ω0^2 x + β x^3 = F cos(Ω t) */
  _accel(t, x, v){
    const { omega0: w0, zeta: z, beta: b, F, Omega: Om } = this.o;
    return - 2*z*w0 * v - (w0*w0)*x - b*(x*x*x) + F*Math.cos(Om*t);
  }

  /* acceleration used for the VECTOR FIELD (frozen by default) */
  _accelField(x, v){
    const { omega0: w0, zeta: z, beta: b, F, Omega: Om, freezeFieldPhase, fieldPhase } = this.o;
    const cosTerm = freezeFieldPhase ? Math.cos(fieldPhase) : Math.cos(Om * this.t);
    return - 2*z*w0 * v - (w0*w0)*x - b*(x*x*x) + F * cosTerm;
  }

  _rk4Step(){
    const dt = this.o.dt;
    const { x, v } = this.state;
    const t = this.t;

    const k1x = v;
    const k1v = this._accel(t, x, v);

    const x2 = x + 0.5*dt*k1x, v2 = v + 0.5*dt*k1v;
    const k2x = v2;
    const k2v = this._accel(t + 0.5*dt, x2, v2);

    const x3 = x + 0.5*dt*k2x, v3 = v + 0.5*dt*k2v;
    const k3x = v3;
    const k3v = this._accel(t + 0.5*dt, x3, v3);

    const x4 = x + dt*k3x, v4 = v + dt*k3v;
    const k4x = v4;
    const k4v = this._accel(t + dt, x4, v4);

    this.state.x = x + (dt/6)*(k1x + 2*k2x + 2*k3x + k4x);
    this.state.v = v + (dt/6)*(k1v + 2*k2v + 2*k3v + k4v);
    this.t = t + dt;
  }

  /* autoscale (zoom in & out) */
  _maybeZoomTime(yMaxAbs){
    const z = this._z.time, { zoomDelayMs, zoomDurationMs } = this.o;
    const cssH = this.timeCanvas.clientHeight || parseFloat(getComputedStyle(this.timeCanvas).height) || 300;
    const half = cssH/2 - 16;
    const target = Math.min(half / Math.max(1e-6, yMaxAbs), 1e6);
    const need = (target < z.sY * 0.985) || (target > z.sY * 1.015);
    if (need) {
      if (z.since == null) z.since = performance.now();
      if (!z.tween && performance.now() - z.since >= zoomDelayMs) {
        const s0 = z.sY, s1 = target;
        z.t0 = performance.now(); z.t1 = z.t0 + zoomDurationMs;
        z.tween = (u)=> s0 + (s1 - s0) * (1 - Math.pow(1-u,3));
      }
    } else if (!z.tween) {
      z.since = null;
    }
  }
  _stepZoomTime(){
    const z = this._z.time; if (!z.tween) return;
    const u = clamp((performance.now() - z.t0)/(z.t1 - z.t0),0,1);
    z.sY = z.tween(u);
    if (u>=1) z.tween = null;
  }

  _maybeZoomPhase(xMaxAbs, vMaxAbs){
    const z = this._z.phase, { zoomDelayMs, zoomDurationMs } = this.o;
    const cssW = this.phaseCanvas.clientWidth || parseFloat(getComputedStyle(this.phaseCanvas).width) || 300;
    const cssH = this.phaseCanvas.clientHeight|| parseFloat(getComputedStyle(this.phaseCanvas).height)|| 300;
    const halfW = cssW/2 - 16, halfH = cssH/2 - 16;
    const sx = Math.min(halfW / Math.max(1e-6, xMaxAbs), 1e6);
    const sy = Math.min(halfH / Math.max(1e-6, vMaxAbs), 1e6);
    const target = Math.min(sx, sy);
    const need = (target < z.s * 0.985) || (target > z.s * 1.015);
    if (need) {
      if (z.since == null) z.since = performance.now();
      if (!z.tween && performance.now() - z.since >= zoomDelayMs) {
        const s0 = z.s, s1 = target;
        z.t0 = performance.now(); z.t1 = z.t0 + zoomDurationMs;
        z.tween = (u)=> s0 + (s1 - s0) * (1 - Math.pow(1-u,3));
      }
    } else if (!z.tween) {
      z.since = null;
    }
  }
  _stepZoomPhase(){
    const z = this._z.phase; if (!z.tween) return;
    const u = clamp((performance.now() - z.t0)/(z.t1 - z.t0), 0, 1);
    z.s = z.tween(u);
    if (u >= 1) z.tween = null;
  }

  /* ---- helper to draw an arrow ---- */
  _arrow(ctx, x1, y1, x2, y2){
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    const dx = x2 - x1, dy = y2 - y1;
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const ah = 5;  // arrowhead length px
    const aw = 3;  // arrowhead half-width px
    const bx = x2 - ah*ux, by = y2 - ah*uy;
    const px = -uy, py = ux; // perpendicular
    ctx.moveTo(x2, y2);
    ctx.lineTo(bx + aw*px, by + aw*py);
    ctx.moveTo(x2, y2);
    ctx.lineTo(bx - aw*px, by - aw*py);
  }

  /* vector field on the phase plane (frozen by default) */
  _drawVectorFieldPhase(ctx, cssW, cssH){
    const z = this._z.phase;
    const margin = 16;
    const worldMaxX = (cssW/2 - margin) / z.s;
    const worldMaxV = (cssH/2 - margin) / z.s;

    // choose grid step ~ 26px in screen space → convert to world units
    const stepPx = 26;
    let stepX = stepPx / z.s;
    let stepV = stepPx / z.s;

    // ensure at least ~8x8 and at most ~30x30 samples
    const nX = clamp(Math.floor((2*worldMaxX)/stepX), 8, 30);
    const nV = clamp(Math.floor((2*worldMaxV)/stepV), 8, 30);
    stepX = (2*worldMaxX) / nX;
    stepV = (2*worldMaxV) / nV;

    const toX = (x)=> cssW/2 + z.s * x;
    const toV = (v)=> cssH/2 - z.s * v;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(60,60,60,0.35)';

    // draw normalized arrows with capped pixel length
    const Lpx = 14; // arrow length in pixels
    for (let i=0; i<=nX; i++){
      const x = -worldMaxX + i*stepX;
      for (let j=0; j<=nV; j++){
        const v = -worldMaxV + j*stepV;

        const dx = v;                       // x' = v
        const dv = this._accelField(x, v);  // v' = a(x,v; frozen or live per options)

        let vx = z.s * dx;
        let vy = - z.s * dv;

        const len = Math.hypot(vx, vy);
        if (len < 1e-9) continue;
        const s = Lpx / len;

        const X = toX(x), Y = toV(v);
        const X2 = X + s*vx, Y2 = Y + s*vy;

        this._arrow(ctx, X, Y, X2, Y2);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  /* render */
  render(){
    this._stepZoomTime();
    this._stepZoomPhase();

    const tNow = this.t;
    const tMin = tNow - this.o.windowSec;

    let yMaxAbs = 1, xMaxAbs = 1, vMaxAbs = 1;
    for (let i=0, n=this.count; i<n; i++){
      const idx = (this.head - 1 - i + this.cap) % this.cap;
      const ti = this.bufT[idx];
      if (ti < tMin) break;
      const xi = this.bufX[idx], vi = this.bufV[idx];
      yMaxAbs = Math.max(yMaxAbs, Math.abs(xi));
      xMaxAbs = Math.max(xMaxAbs, Math.abs(xi));
      vMaxAbs = Math.max(vMaxAbs, Math.abs(vi));
    }
    this._maybeZoomTime(yMaxAbs);
    this._maybeZoomPhase(xMaxAbs, vMaxAbs);

    // Time series
    {
      const { cssW, cssH, dpr } = resizeCanvasToDisplaySize(this.timeCanvas);
      const ctx = this.timeCtx;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,cssW,cssH);

      ctx.strokeStyle = 'rgba(127,127,127,0.8)';
      ctx.lineWidth = 2.25 * this.o.strokeScale;
      ctx.beginPath(); ctx.moveTo(16, cssH/2); ctx.lineTo(cssW-16, cssH/2); ctx.stroke();

      const pad = 16, L = cssW - 2*pad, T = this.o.windowSec;
      const toX = (t)=> pad + L * (1 - clamp((tNow - t)/T, 0, 1));
      const toY = (x)=> cssH/2 - this._z.time.sY * x;

      let start = null, n = this.count;
      for (let i=0; i<n; i++){
        const idx = (this.head - n + i + this.cap) % this.cap;
        if (this.bufT[idx] >= tMin) { start = i; break; }
      }

      ctx.beginPath();
      let drew = false;
      if (start !== null) {
        const stepDraw = Math.max(1, Math.floor(n / 2000));
        for (let i=start; i<n; i+=stepDraw){
          const idx = (this.head - n + i + this.cap) % this.cap;
          const X = toX(this.bufT[idx]);
          const Y = toY(this.bufX[idx]);
          if (!drew) { ctx.moveTo(X,Y); drew = true; } else { ctx.lineTo(X,Y); }
        }
      }
      ctx.strokeStyle = 'hsl(210 60% 45%)';
      ctx.lineWidth = 5.8 * this.o.strokeScale;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5,0.5,cssW-1,cssH-1);
    }

    // Phase space x′ vs x
    {
      const { cssW, cssH, dpr } = resizeCanvasToDisplaySize(this.phaseCanvas);
      const ctx = this.phaseCtx;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,cssW,cssH);

      // axes
      ctx.strokeStyle = 'rgba(127,127,127,0.8)';
      ctx.lineWidth = 2.25 * this.o.strokeScale;
      ctx.beginPath(); ctx.moveTo(cssW/2, 16); ctx.lineTo(cssW/2, cssH-16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(16, cssH/2); ctx.lineTo(cssW-16, cssH/2); ctx.stroke();

      // vector field (frozen by default)
      if (this.o.showVectorField) {
        this._drawVectorFieldPhase(ctx, cssW, cssH);
      }

      const z = this._z.phase;
      const toX = (x)=> cssW/2 + z.s * x;
      const toV = (v)=> cssH/2 - z.s * v;

      let start = null, n = this.count;
      for (let i=0; i<n; i++){
        const idx = (this.head - n + i + this.cap) % this.cap;
        if (this.bufT[idx] >= tMin) { start = i; break; }
      }

      ctx.beginPath();
      let drew = false;
      if (start !== null) {
        const stepDraw = Math.max(1, Math.floor(n / 2000));
        for (let i=start; i<n; i+=stepDraw){
          const idx = (this.head - n + i + this.cap) % this.cap;
          const X = toX(this.bufX[idx]);
          const Y = toV(this.bufV[idx]);
          if (!drew) { ctx.moveTo(X,Y); drew = true; } else { ctx.lineTo(X,Y); }
        }
      }
      ctx.strokeStyle = 'hsl(10 60% 45%)';
      ctx.lineWidth = 5.8 * this.o.strokeScale;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5,0.5,cssW-1,cssH-1);
    }
  }

  /* loop */
  play(){
    if (this.running) return;
    this.running = true;
    let last = 0;
    const loop = (ts)=>{
      if (!this.running) return;
      if (!last) last = ts;
      let acc = Math.min((ts - last)/1000, 0.05);
      last = ts;

      while (acc > 0) {
        this._rk4Step();
        this._pushSample(this.t, this.state.x, this.state.v);
        acc -= this.o.dt;
      }
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  pause(){ this.running = false; }

  setLayout(layout='row', controlsAt='end'){
    this.o.layout = layout; this.o.controlsAt = controlsAt;
    this._applyResponsiveSizing(false);
  }
}