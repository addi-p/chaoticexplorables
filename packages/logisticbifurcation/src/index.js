// Logistic Map — Time Series (left) + Live Bifurcation Diagram (right)
// - x0 change: erase & repaint the current λ column so changes are visible
// - smaller dots with subpixel jitter
// - dense slices, zoom (dbl-click), KaTeX labels & presets, top-of-track labels

(function ensureWidgetsCSS(){
  const id = 'cx-widgets-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = new URL('../../widgets/src/widgets-plain.css', import.meta.url).toString();
    document.head.appendChild(link);
  }
})();

async function ensureKaTeX() {
  if (window.katex) return window.katex;
  if (!document.getElementById('katex-css')) {
    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    document.head.appendChild(link);
  }
  const mod = await import('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.mjs');
  window.katex = mod.default || mod;
  return window.katex;
}

import { select } from '../../vendor/d3.mjs';
import slider from '../../widgets/src/slider.js';
import sliderElement from '../../widgets/src/sliderElement.js';
import toggle from '../../widgets/src/toggle.js';
import toggleElement from '../../widgets/src/toggleElement.js';
import iconFor from '../../widgets/src/button-symbols.js';
import dropdown from '../../widgets/src/dropdown.js';
import dropdownElement from '../../widgets/src/dropdownElement.js';

const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const f = (x, r) => r*x*(1-x);
const iterate = (x0, r, N) => { const xs = new Array(N+1); xs[0]=x0; for(let i=0;i<N;i++) xs[i+1]=f(xs[i],r); return xs; };
const fmt = (v)=> (Math.abs(v) < 1e-3 || Math.abs(v) >= 1e4) ? v.toExponential(2) : v.toFixed(3);

function resizeCanvasToDisplaySize(cvs){
  const dpr = Math.max(1, devicePixelRatio||1);
  const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width)||300;
  const cssH = cvs.clientHeight|| parseFloat(getComputedStyle(cvs).height)||300;
  const w = Math.floor(cssW*dpr), h = Math.floor(cssH*dpr);
  if (cvs.width!==w || cvs.height!==h) { cvs.width=w; cvs.height=h; }
  return { cssW, cssH, dpr };
}

function createSymbolButton(svg, { x, y, size=16, symbol='play', onClick }){
  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class', 'widget button');
  g.setAttribute('transform', `translate(${x},${y})`);
  svg.appendChild(g);

  const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('x', -size); bg.setAttribute('y', -size);
  bg.setAttribute('width', 2*size); bg.setAttribute('height', 2*size);
  bg.setAttribute('class', 'lit');
  g.appendChild(bg);

  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('class', 'symbol');
  g.appendChild(path);

  const setSymbol = (name)=> path.setAttribute('d', iconFor(name)(size*0.75));
  setSymbol(symbol);

  const hit = document.createElementNS('http://www.w3.org/2000/svg','rect');
  hit.setAttribute('x', -size); hit.setAttribute('y', -size);
  hit.setAttribute('width', 2*size); hit.setAttribute('height', 2*size);
  hit.setAttribute('fill', 'transparent');
  hit.style.cursor = 'pointer';
  hit.addEventListener('click', (ev)=>{ ev.stopPropagation(); onClick?.(ev, { setSymbol }); });
  g.appendChild(hit);

  return { setSymbol };
}

function _autoGrowSVG(svg, extra = 8){
  try {
    const bb = svg.getBBox();
    const h = Math.ceil(bb.y + bb.height + extra);
    if (h > 0) svg.setAttribute('height', h);
  } catch { /* noop */ }
}

export default class LogisticExplorable {
  constructor(mount, opts={}){
    this.o = Object.assign({
      layout:'row',
      controlsAt:'end',
      sceneSize:360,
      N:160,
      showAxes:true,
      showBifurcation:true,
      fontScale: 1.0,

      // dense bifurcation defaults
      bifurcationIters: 6000,        // total iterations per seed
      bifurcationDiscard: 1,      // long transient → plot ~1000
      bifurcationSliceSeeds: 50,     // seeds per λ slice
      dotAlpha: 1.,                 // softer
      dotSize: 0.1                   // sub-pixel size (width=height)
    }, opts);

    this.root = typeof mount==='string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('mount not found');

    // state
    this.defaults = { lambda: 0.5, x0: 0.02 };
    this.lambda = this.defaults.lambda;
    this.x0 = this.defaults.x0;
    this.running = false;

    if (!document.getElementById('cx-logistic-layout-css')){
      const style = document.createElement('style');
      style.id = 'cx-logistic-layout-css';
      style.textContent = `
        .cx-log-wrap { display:flex; gap:12px; align-items:flex-start; }
        .cx-log-wrap.stack { flex-direction:column; }
        .cx-log-wrap.row { flex-direction:row; flex-wrap:nowrap; }
        .cx-log-view { line-height:0; position:relative; }
        .cx-log-view canvas { border:1px solid var(--color-border,#c9c9c9); background:transparent; }
        .cx-axlabel { position:absolute; pointer-events:none; }
        .cx-hidden { display:none !important; }
        .cx-controls { display:block; }
      `;
      document.head.appendChild(style);
    }

    // containers
    this.wrap = document.createElement('div');
    this.wrap.className = 'cx-log-wrap row';
    this.root.appendChild(this.wrap);

    this.timeBox = document.createElement('div');
    this.timeBox.className = 'cx-log-view';
    this.bifuBox = document.createElement('div');
    this.bifuBox.className = 'cx-log-view';
    this.controlsBox = document.createElement('div');
    this.controlsBox.className = 'cx-controls d3-widgets';

    if (this.o.layout==='row' && this.o.controlsAt==='end') {
      this.wrap.append(this.timeBox, this.bifuBox, this.controlsBox);
    } else if (this.o.layout==='row') {
      this.wrap.append(this.controlsBox, this.timeBox, this.bifuBox);
    } else {
      this.wrap.classList.remove('row'); this.wrap.classList.add('stack');
      this.wrap.append(this.controlsBox, this.timeBox, this.bifuBox);
    }

    // canvases
    this.timeCanvas = document.createElement('canvas');
    this.bifuCanvas = document.createElement('canvas');
    this.timeBox.appendChild(this.timeCanvas);
    this.bifuBox.appendChild(this.bifuCanvas);
    this.tctx = this.timeCanvas.getContext('2d', { alpha:true });
    this.bctx = this.bifuCanvas.getContext('2d', { alpha:true });

    // axis labels
    this.timeLabels = { x: document.createElement('div'), y: document.createElement('div') };
    this.bifuLabels = { x: document.createElement('div'), y: document.createElement('div') };
    for (const el of Object.values(this.timeLabels).concat(Object.values(this.bifuLabels))) {
      el.className = 'cx-axlabel';
      el.style.fontSize = `${13 * this.o.fontScale}px`;
      el.style.color = 'var(--color-text,#222)';
      el.style.opacity = '0.95';
      el.style.willChange = 'transform';
    }
    this.timeBox.append(this.timeLabels.x, this.timeLabels.y);
    this.bifuBox.append(this.bifuLabels.x, this.bifuLabels.y);

    // offscreen buffer + zoom
    this._bifuOff = null;             // {canvas, ctx, key}
    this._zoom = { levels:[1,2,4,8], idx:0, cx:null, cy:null };

    // controls + sizing
    this._buildControls(this.controlsBox);
    this._resizeAll();
    this._installBifurcationZoom();
    this.render();

    // responsive
    this._ro = new ResizeObserver(()=> this._resizeAll());
    this._ro.observe(this.root);
  }

  /* controls */
  _buildControls(host){
    host.innerHTML = '';
    const FS = this.o.fontScale;

    const w = Math.max(260, this.o.sceneSize);
    const toolbarH = 48 * FS;
    host.style.setProperty('--cx-fs', FS);

    // PRESET DROPDOWN (KaTeX)
    const ddHost = document.createElement('div');
    ddHost.style.display = 'block';
    ddHost.style.width = `${w}px`;
    ddHost.style.margin = `${6*FS}px 0 ${10*FS}px 0`;
    host.appendChild(ddHost);

    const presets = [
      { label: 'Extinction',  katex: '\\\\lambda < 1',            value: 0.8 },
      { label: 'Equilibrium', katex: '\\\\lambda \\\\approx 2.5',  value: 2.5 },
      { label: 'Period-2',    katex: '\\\\lambda \\\\approx 3.2',  value: 3.2 },
      { label: 'Period-4',    katex: '\\\\lambda \\\\approx 3.5',  value: 3.5 },
      { label: 'Period-3',    katex: '\\\\lambda \\\\approx 3.83', value: 3.83 },
      { label: 'Chaos',       katex: '\\\\lambda \\\\approx 3.9',  value: 3.9 }
    ];

    const dd = dropdown()
      .id('preset')
      .label('Preset')
      .options(presets.map(p => ({ label:p.label, value:String(p.value) })))
      .value(String(this.lambda))
      .update(() => {
        const λ = parseFloat(dd.value());
        this.lambda = λ;
        if (this._sliders && this._slidersSvgSel) {
          this._sliders.lambda.reset(this._slidersSvgSel, λ);
        }
        // paint this λ slice
        this._plotSlice(λ, this.x0, { clearColumn:false });
        this._updateValueTexts();
        this.render();
        this._katexifyDropdownLabels(this._presetEl, presets, true);
      });

    const ddEl = dropdownElement(dd);
    ddHost.appendChild(ddEl);
    this._preset = dd;
    this._presetEl = ddEl;
    this._installDropdownKatex(ddEl, presets);

    // TOOLBAR
    const padLeft = 8 * FS;
    const toolbar = document.createElementNS('http://www.w3.org/2000/svg','svg');
    toolbar.setAttribute('width', w);
    toolbar.setAttribute('height', toolbarH);
    toolbar.style.display='block';
    toolbar.style.marginBottom = `${8*FS}px`;
    toolbar.style.paddingLeft = `${padLeft}px`;
    toolbar.style.overflow = 'visible';
    host.appendChild(toolbar);

    const xBase = padLeft;

    // play/pause
    const playBtn = createSymbolButton(toolbar, {
      x: xBase + 20, y: toolbarH/2, size: 16 * FS, symbol: this.running ? 'pause' : 'play',
      onClick: (_e, api) => {
        this._setPlayIcon = api.setSymbol;
        if (this.running) { this.pause(); }
        else { this.play(); }
      }
    });
    this._setPlayIcon = playBtn.setSymbol;

    // reload
    createSymbolButton(toolbar, {
      x: xBase + 56 * FS, y: toolbarH/2, size: 16 * FS, symbol: 'reload',
      onClick: () => {
        this.pause();
        this.lambda = this.defaults.lambda;
        this.x0     = this.defaults.x0;
        if (this._sliders && this._slidersSvgSel) {
          this._sliders.lambda.reset(this._slidersSvgSel, this.lambda);
          this._sliders.x0.reset(this._slidersSvgSel, this.x0);
        }
        this._setPlayIcon?.('play');
        this._clearBifu();                 // clear diagram
        this._zoom = { levels:[1,2,4,8], idx:0, cx:null, cy:null };
        this._updateValueTexts();
        this.render();
        this._katexifyDropdownLabels(this._presetEl, presets, true);
      }
    });

    // Bifurcation toggle
    const bif = toggle().id('bif').size(10 * FS)
      .position({ x: w - 22 * FS, y: toolbarH/2 })
      .label(null)
      .value(this.o.showBifurcation?1:0)
      .update(()=>{
        this.o.showBifurcation = !!bif.value();
        this.bifuBox.classList.toggle('cx-hidden', !this.o.showBifurcation);
        this._resizeAll();
      });
    toolbar.appendChild(toggleElement(bif));
    const bifLbl = document.createElementNS('http://www.w3.org/2000/svg','text');
    bifLbl.textContent = 'Bifurcation';
    bifLbl.setAttribute('x', w - 22 * FS); bifLbl.setAttribute('y', toolbarH - 2 * FS);
    bifLbl.setAttribute('font-size', `${12 * FS}`);
    bifLbl.setAttribute('text-anchor','middle');
    bifLbl.setAttribute('fill','var(--color-text,#222)');
    toolbar.appendChild(bifLbl);

    // SLIDERS
    const ssvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    ssvg.setAttribute('width', w);
    ssvg.setAttribute('height', 160 * FS);
    ssvg.style.display='block';
    ssvg.style.padding = `${4*FS}px 0 ${2*FS}px 0`;
    host.appendChild(ssvg);
    this._slidersSvgSel = select(ssvg);

    const trackX   = 22 * FS;
    const trackW   = w - 44 * FS;
    const rowDy    = 44 * FS;
    const baseY    = 24 * FS;
    const labelGap = 12 * FS;
    const labelFS  = 12 * FS;

    const mkTopLabel = (trackCenterY, initialText)=>{
      const t = document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x', trackX);
      t.setAttribute('y', trackCenterY - labelGap);
      t.setAttribute('font-size', `${labelFS}`);
      t.setAttribute('fill','var(--color-text,#222)');
      t.setAttribute('dominant-baseline','ideographic');
      t.setAttribute('text-anchor','start');
      t.textContent = initialText;
      ssvg.appendChild(t);
      return t;
    };

    const sλ = slider().id('lambda').label(null).size(trackW).girth(10 * FS).knob(8 * FS)
      .position({ x: trackX, y: baseY })
      .range([0,4])
      .value(this.lambda)
      .update(()=>{
        this.lambda = sλ.value();
        // paint this λ slice (accumulate)
        this._plotSlice(this.lambda, this.x0, { clearColumn:false });
        this._updateValueTexts();
        this.render();
      });
    ssvg.appendChild(sliderElement(sλ));

    const sx0 = slider().id('x0').label(null).size(trackW).girth(10 * FS).knob(8 * FS)
      .position({ x: trackX, y: baseY + rowDy })
      .range([0,1])
      .value(this.x0)
      .update(()=>{
        this.x0 = sx0.value();
        // erase this λ column then repaint it for the new seed (visible effect)
        this._plotSlice(this.lambda, this.x0, { clearColumn:true });
        this._updateValueTexts();
        this.render();
      });
    ssvg.appendChild(sliderElement(sx0));

    this._labelText = {
      lambda: mkTopLabel(baseY, `(λ: ${fmt(this.lambda)})`),
      x0:     mkTopLabel(baseY + rowDy, `(x₀: ${fmt(this.x0)})`),
    };
    this._sliders = { lambda: sλ, x0: sx0 };

    requestAnimationFrame(()=> _autoGrowSVG(ssvg, 12 * FS));
    this._updateValueTexts();
  }

  _installDropdownKatex(ddEl, presets){
    requestAnimationFrame(()=> requestAnimationFrame(()=> this._katexifyDropdownLabels(ddEl, presets, true)));
    const poke = ()=> this._katexifyDropdownLabels(ddEl, presets, true);
    ddEl.addEventListener('mousedown', poke);
    ddEl.addEventListener('focusin',  poke);
    const mo = new MutationObserver(()=> this._katexifyDropdownLabels(ddEl, presets));
    mo.observe(ddEl, { childList:true, subtree:true, characterData:true });
    this._ddObserver = mo;
  }
  async _katexifyDropdownLabels(ddEl, presets, includeSelected=false){
    if (!ddEl) return;
    const katex = await ensureKaTeX();
    const FS = this.o.fontScale;

    const renderLabel = (container, p)=>{
      container.innerHTML = '';
      const span = document.createElement('span');
      span.style.whiteSpace = 'nowrap';
      span.style.fontSize = `${13 * FS}px`;
      katex.render(`${p.label}~( ${p.katex} )`, span, { throwOnError:false });
      container.appendChild(span);
    };

    const optionNodes = ddEl.querySelectorAll(
      '.cx-dropdown-option-label, .cx-dropdown-option, .cx-dd-option, .cx-option, [data-option-label]'
    );
    optionNodes.forEach(el=>{
      const raw = el.textContent.trim();
      const p = presets.find(pp => raw === pp.label || raw.startsWith(pp.label));
      if (p) renderLabel(el, p);
    });

    if (includeSelected) {
      const sel = ddEl.querySelector('.cx-dropdown-label, .cx-dd-label, .cx-selected-label, [data-selected-label]');
      if (sel){
        const raw = sel.textContent.trim();
        const p = presets.find(pp => raw === pp.label || raw.startsWith(pp.label));
        if (p) renderLabel(sel, p);
      }
    }
  }

  _updateValueTexts(){
    if (!this._labelText) return;
    const λ  = this._sliders?.lambda?.value?.() ?? this.lambda;
    const x0 = this._sliders?.x0?.value?.()     ?? this.x0;
    this._labelText.lambda.textContent = `(λ: ${fmt(λ)})`;
    this._labelText.x0.textContent     = `(x₀: ${fmt(x0)})`;
  }

  /* Offscreen buffer helpers */
  _ensureBifuOff(){
    const { cssW, cssH } = resizeCanvasToDisplaySize(this.bifuCanvas);
    const key = `${cssW}x${cssH}`;
    if (this._bifuOff?.key === key) return this._bifuOff;

    const cvs = document.createElement('canvas');
    cvs.width = cssW; cvs.height = cssH;
    const ctx = cvs.getContext('2d');

    this._bifuOff = { canvas: cvs, ctx, key };
    return this._bifuOff;
  }
  _clearBifu(){
    const off = this._ensureBifuOff();
    off.ctx.clearRect(0,0,off.canvas.width, off.canvas.height);
  }

  /* Column operations (erase & paint) */
  _eraseBifuColumn(lambda){
    const off = this._ensureBifuOff();
    const { cssW, cssH } = resizeCanvasToDisplaySize(this.bifuCanvas);
    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;

    const toX = (λ)=> pad + W * (λ / 4);
    const X = Math.round(toX(lambda)); // vertical pixel column
    // clear ONLY inside plot area
    off.ctx.clearRect(X - 0.5, pad, 1 + 1.0, H);
  }

  _plotSlice(lambda, seed, { clearColumn=false } = {}){
    if (clearColumn) this._eraseBifuColumn(lambda);
    this._drawBifuSlice(lambda, seed);
  }

  _drawBifuSlice(lambda, seed){
    const off = this._ensureBifuOff();

    const { cssW, cssH } = resizeCanvasToDisplaySize(this.bifuCanvas);
    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;

    const toX = (λ)=> pad + W * (λ / 4);
    const toY = (y)=> cssH - pad - H * clamp(y,0,1);

    const iters = Math.max(1, this.o.bifurcationIters);
    const discard = Math.max(0, Math.min(iters, this.o.bifurcationDiscard));
    const seedsN = Math.max(1, Math.floor(this.o.bifurcationSliceSeeds));
    const eps = 1e-6;

    const Xc = toX(lambda);
    const ctx = off.ctx;
    ctx.globalAlpha = this.o.dotAlpha;
    ctx.fillStyle = 'hsl(210 60% 45%)';

    const dot = Math.max(0.3, this.o.dotSize);  // clamped small
    for (let s=0; s<seedsN; s++){
      let x = clamp(seed + (Math.random()*0.4 - 0.2), eps, 1 - eps); // jitter
      for (let i=0; i<iters; i++){
        x = f(x, lambda);
        if (i >= discard) {
          if (x <= eps || x >= 1-eps) continue; // avoid boundary artifacts
          const Y = toY(x); // subpixel
          // draw a tiny subpixel square with small horizontal jitter so dots look finer
          const xj = (Math.random() - 0.5) * 0.6; // within a pixel
          ctx.fillRect(Xc + xj, Y, dot, dot);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  /* zoom */
  _installBifurcationZoom(){
    this.bifuCanvas.addEventListener('dblclick', (ev)=>{
      const rect = this.bifuCanvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      if (this._zoom.idx < this._zoom.levels.length - 1) {
        this._zoom.idx += 1;
        this._zoom.cx = x;
        this._zoom.cy = y;
      } else {
        this._zoom.idx = 0;
        this._zoom.cx = null;
        this._zoom.cy = null;
      }
      this.render();
    }, { passive:true });
  }

  /* sizing */
  _resizeAll(){
    const s = this.o.sceneSize;
    for (const box of [this.timeBox, this.bifuBox]) {
      box.style.width = `${s}px`;
      box.style.height = `${s}px`;
    }
    for (const cvs of [this.timeCanvas, this.bifuCanvas]) {
      cvs.style.width = `${s}px`;
      cvs.style.height = `${s}px`;
      resizeCanvasToDisplaySize(cvs);
    }
    this._bifuOff = null; // size changed → recreate buffer
    this._positionAxisLabels();
    this.render();
  }

  async _positionAxisLabels(){
    if (!this.o.showAxes) {
      for (const el of [this.timeLabels.x,this.timeLabels.y,this.bifuLabels.x,this.bifuLabels.y]) el.style.display = 'none';
      return;
    }
    const katex = await ensureKaTeX();
    const FS = this.o.fontScale;
    const pad = 16 * FS;
    const labelInset = 26 * FS;

    this.timeLabels.x.innerHTML=''; katex.render('n', this.timeLabels.x);
    this.timeLabels.y.innerHTML=''; katex.render('x_n', this.timeLabels.y);
    this.bifuLabels.x.innerHTML=''; katex.render('\\lambda', this.bifuLabels.x);
    this.bifuLabels.y.innerHTML=''; katex.render('x_n', this.bifuLabels.y);

    for (const el of [this.timeLabels.x,this.timeLabels.y,this.bifuLabels.x,this.bifuLabels.y]) {
      el.style.display = '';
      el.style.fontSize = `${13 * FS}px`;
    }

    Object.assign(this.timeLabels.x.style, {
      left: '50%', bottom: `${pad + labelInset}px`, transform: 'translate(-50%,0)'
    });
    Object.assign(this.timeLabels.y.style, {
      left: `${pad + labelInset}px`, top: '50%',
      transform: 'translate(0,-50%) rotate(-90deg)', transformOrigin: 'left top'
    });

    Object.assign(this.bifuLabels.x.style, {
      left: '50%', bottom: `${pad + labelInset}px`, transform: 'translate(-50%,0)'
    });
    Object.assign(this.bifuLabels.y.style, {
      left: `${pad + labelInset}px`, top: '50%',
      transform: 'translate(0,-50%) rotate(-90deg)', transformOrigin: 'left top'
    });
  }

  /* axes helpers */
  _strokeRect(ctx, cssW, cssH){
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5,0.5,cssW-1,cssH-1);
  }
  _drawAxesTicksTime(ctx, cssW, cssH){
    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;
    const tick = 6 * FS, numGap = 4 * FS;
    const N = this.o.N;
    const toX = (n)=> pad + (W * n / N), toY = (y)=> cssH - pad - H*y;

    ctx.strokeStyle = 'rgba(127,127,127,0.85)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let y=0; y<=1.0001; y+=0.2){ const Y = toY(y); ctx.moveTo(pad, Y); ctx.lineTo(pad + tick, Y); }
    const step = Math.max(1, Math.round(N/6));
    for (let n=0; n<=N; n+=step){ const X = toX(n); ctx.moveTo(X, cssH - pad); ctx.lineTo(X, cssH - pad - tick); }
    ctx.stroke();

    ctx.fillStyle = 'rgba(60,60,60,0.95)'; ctx.font = `${12 * FS}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (let n=0; n<=N; n+=step) ctx.fillText(String(n), toX(n), cssH - pad - tick - numGap);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (let y=0; y<=1.0001; y+=0.2) ctx.fillText(y.toFixed(1), pad + tick + numGap, toY(y));
  }
  _drawAxesTicksLambda(ctx, cssW, cssH){
    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;
    const tick = 6 * FS, numGap = 4 * FS;
    const toX = (λ)=> pad + W * (λ/4), toY = (y)=> cssH - pad - H*y;

    ctx.strokeStyle = 'rgba(127,127,127,0.85)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let λ=0; λ<=4.0001; λ+=0.5){
      ctx.moveTo(toX(λ), cssH - pad); ctx.lineTo(toX(λ), cssH - pad - tick);
    }
    for (let y=0; y<=1.0001; y+=0.2){
      ctx.moveTo(pad, toY(y)); ctx.lineTo(pad + tick, toY(y));
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(60,60,60,0.95)'; ctx.font = `${12 * FS}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (let λ=0; λ<=4.0001; λ+=0.5) ctx.fillText(λ.toFixed(1), toX(λ), cssH - pad - tick - numGap);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (let y=0; y<=1.0001; y+=0.2) ctx.fillText(y.toFixed(1), pad + tick + numGap, toY(y));
  }

  /* renders */
  _renderTime(){
    const { cssW, cssH, dpr } = resizeCanvasToDisplaySize(this.timeCanvas);
    const ctx = this.tctx;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);

    if (this.o.showAxes) this._drawAxesTicksTime(ctx, cssW, cssH);
    this._strokeRect(ctx, cssW, cssH);

    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;

    const xs = iterate(this.x0, this.lambda, this.o.N);
    const toX = (n)=> pad + (W * n / this.o.N);
    const toY = (x)=> cssH - pad - H * clamp(x,0,1);

    ctx.beginPath(); let moved=false;
    for (let n=0; n<=this.o.N; n++){
      const X=toX(n), Y=toY(xs[n]);
      if (!moved) { ctx.moveTo(X,Y); moved=true; } else ctx.lineTo(X,Y);
    }
    ctx.strokeStyle = '#2e73b8ff';
    ctx.lineWidth = 2; ctx.stroke();
  }

  _renderBifurcation(){
    if (!this.o.showBifurcation) return;
    const { cssW, cssH, dpr } = resizeCanvasToDisplaySize(this.bifuCanvas);
    const ctx = this.bctx;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);

    const s = this._zoom.levels[this._zoom.idx] || 1;
    const cx = (this._zoom.cx ?? cssW/2);
    const cy = (this._zoom.cy ?? cssH/2);

    ctx.save();
    ctx.translate(cssW/2, cssH/2);
    ctx.scale(s, s);
    ctx.translate(-cx, -cy);

    const off = this._ensureBifuOff();
    ctx.drawImage(off.canvas, 0, 0);

    if (this.o.showAxes) this._drawAxesTicksLambda(ctx, cssW, cssH);
    this._strokeRect(ctx, cssW, cssH);

    ctx.restore();
  }

  render(){ this._renderTime(); this._renderBifurcation(); }

  play(){
    if (this.running) return;
    this.running = true;
    this._setPlayIcon?.('pause');

    const tick = ()=>{
      if (!this.running) return;

      let λ = (this._sliders?.lambda?.value() ?? this.lambda);
      λ += 0.004;
      if (λ > 4) λ = 0;

      if (this._sliders && this._slidersSvgSel) {
        this._sliders.lambda.reset(this._slidersSvgSel, λ); // fires update → paints slice
      } else {
        this.lambda = λ;
        this._plotSlice(λ, this.x0, { clearColumn:false });
      }

      this._updateValueTexts();
      this.render();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  pause(){
    if (!this.running) return;
    this.running = false;
    this._setPlayIcon?.('play');
  }
}