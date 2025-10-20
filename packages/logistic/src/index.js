// Logistic Map (time series + cobweb) — axes via options, KaTeX labels,
// presets dropdown (KaTeX, mutation-observed), slider<->dropdown<->animation sync,
// slider value readouts ABOVE each slider, and adaptive spacing with fontScale.

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

// --- widgets -----------------------------------------------------------------
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

// Auto-grow an SVG's height to fit contents (prevents clipping at larger fontScale)
function _autoGrowSVG(svg, extra = 8){
  try {
    const bb = svg.getBBox();
    const h = Math.ceil(bb.y + bb.height + extra);
    if (h > 0) svg.setAttribute('height', h);
  } catch { /* some browsers may not support getBBox until in DOM */ }
}

export default class LogisticExplorable {
  constructor(mount, opts={}){
    // options: showAxes (bool), layout, controlsAt, sceneSize, N, showCobweb, fontScale
    this.o = Object.assign({
      layout:'row',
      controlsAt:'end',
      sceneSize:360,
      N:160,
      showCobweb:true,
      showAxes:false,
      fontScale: 1.0
    }, opts);

    this.root = typeof mount==='string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('mount not found');

    // state
    this.defaults = { lambda: 1.2, x0: 0.02 };
    this.lambda = this.defaults.lambda;
    this.x0 = this.defaults.x0;
    this.running = false;

    // layout CSS (once)
    if (!document.getElementById('cx-logistic-layout-css')) {
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
    this.cobwebBox = document.createElement('div');
    this.cobwebBox.className = 'cx-log-view';
    this.controlsBox = document.createElement('div');
    this.controlsBox.className = 'cx-controls d3-widgets';

    // order
    if (this.o.layout==='row' && this.o.controlsAt==='end') {
      this.wrap.append(this.timeBox, this.cobwebBox, this.controlsBox);
    } else if (this.o.layout==='row') {
      this.wrap.append(this.controlsBox, this.timeBox, this.cobwebBox);
    } else {
      this.wrap.classList.remove('row'); this.wrap.classList.add('stack');
      this.wrap.append(this.controlsBox, this.timeBox, this.cobwebBox);
    }

    // canvases
    this.timeCanvas = document.createElement('canvas');
    this.cobwebCanvas = document.createElement('canvas');
    this.timeBox.appendChild(this.timeCanvas);
    this.cobwebBox.appendChild(this.cobwebCanvas);
    this.tctx = this.timeCanvas.getContext('2d', { alpha:true });
    this.cctx = this.cobwebCanvas.getContext('2d', { alpha:true });

    // axis label containers (HTML rendered by KaTeX)
    this.timeLabels = { x: document.createElement('div'), y: document.createElement('div') };
    this.cobLabels  = { x: document.createElement('div'), y: document.createElement('div') };
    for (const el of Object.values(this.timeLabels).concat(Object.values(this.cobLabels))) {
      el.className = 'cx-axlabel';
      el.style.fontSize = `${13 * this.o.fontScale}px`;
      el.style.color = 'var(--color-text,#222)';
      el.style.opacity = '0.95';
      el.style.willChange = 'transform';
    }
    this.timeBox.append(this.timeLabels.x, this.timeLabels.y);
    this.cobwebBox.append(this.cobLabels.x, this.cobLabels.y);

    // controls + sizing
    this._buildControls(this.controlsBox);
    this._resizeAll();
    this.render();

    // responsive
    this._ro = new ResizeObserver(()=> this._resizeAll());
    this._ro.observe(this.root);
  }

  /* controls */
  _buildControls(host){
    host.innerHTML = '';
    const FS = this.o.fontScale;

    const w = Math.max(240, this.o.sceneSize);
    const toolbarH = 48 * FS;
    host.style.setProperty('--cx-fs', FS);

    // --- PRESET DROPDOWN -----------------------------------------------------
    const ddHost = document.createElement('div');
    ddHost.style.display = 'block';
    ddHost.style.width = `${w}px`;
    ddHost.style.margin = `${6*FS}px 0 ${10*FS}px 0`;
    host.appendChild(ddHost);

    // Presets with KaTeX strings
    const presets = [
      { label: 'Extinction',  katex: '\\\\lambda < 1',            value: 0.8 },
      { label: 'Equilibrium', katex: '\\\\lambda \\\\approx 2.5',  value: 2.5 },
      { label: 'Period-2',    katex: '\\\\lambda \\\\approx 3.2',  value: 3.2 },
      { label: 'Period-4',    katex: '\\\\lambda \\\\approx 3.5',  value: 3.5 },
      { label: 'Period-3',    katex: '\\\\lambda \\\\approx 3.83', value: 3.83 },
      { label: 'Chaos',       katex: '\\\\lambda \\\\approx 3.9',  value: 3.9 }
    ];
    // NOTE: Inside JS string literals in many bundlers, backslashes may need double-escaping (\\\\) to reach KaTeX.

    const dd = dropdown()
      .id('preset')
      .label('Preset')
      .options(presets.map(p => ({ label:p.label, value:p.value })))
      .value(this.lambda)
      .update(() => {
        const λ = parseFloat(dd.value());
        this.lambda = λ;
        if (this._sliders && this._slidersSvgSel) {
          this._sliders.lambda.reset(this._slidersSvgSel, λ); // moves knob + fires update()
        }
        this._updateValueTexts();
        this.render();
        this._katexifyDropdownLabels(this._presetEl, presets, true);
      });

    const ddEl = dropdownElement(dd);
    ddHost.appendChild(ddEl);
    this._preset = dd;
    this._presetEl = ddEl;

    // KaTeX render the dropdown labels + set up observers so it stays rendered
    this._installDropdownKatex(ddEl, presets);

    // --- toolbar --------------------------------------------------------------
    const toolbar = document.createElementNS('http://www.w3.org/2000/svg','svg');
    toolbar.setAttribute('width', w);
    toolbar.setAttribute('height', toolbarH);
    toolbar.style.display = 'block';
    toolbar.style.marginBottom = `${8*FS}px`;

    // add horizontal padding so buttons aren't cut off
    const padLeft = 8 * FS;   // NEW
    toolbar.style.paddingLeft = `${padLeft}px`;
    toolbar.style.overflow = 'visible';  // ensure nothing clips

    host.appendChild(toolbar);

    // play/pause
    const xBase = padLeft;  // base offset for all buttons

const playBtn = createSymbolButton(toolbar, {
  x: xBase + 20, y: toolbarH / 2, size: 16 * FS,
  symbol: this.running ? 'pause' : 'play',
  onClick: (_e, api) => {
    this._setPlayIcon = api.setSymbol;
    if (this.running) this.pause(); else this.play();
  }
});
this._setPlayIcon = playBtn.setSymbol;

createSymbolButton(toolbar, {
  x: xBase + 56 * FS, y: toolbarH / 2, size: 16 * FS, symbol: 'reload',
  onClick: () => {
        this.pause();
        this.lambda = this.defaults.lambda;
        this.x0     = this.defaults.x0;
        if (this._sliders && this._slidersSvgSel) {
          this._sliders.lambda.reset(this._slidersSvgSel, this.lambda);
          this._sliders.x0.reset(this._slidersSvgSel, this.x0);
        }
        this._preset?.value(this.lambda); // sync dropdown
        this._setPlayIcon?.('play');
        this._updateValueTexts();
        this.render();
        this._katexifyDropdownLabels(this._presetEl, presets, true);
      }
    });

    // "Cobweb" toggle (right)
    const cob = toggle().id('cob').size(10 * FS)
      .position({ x: w - 22 * FS, y: toolbarH/2 })
      .label(null)
      .value(this.o.showCobweb?1:0)
      .update(()=>{
        this.o.showCobweb = !!cob.value();
        this.cobwebBox.classList.toggle('cx-hidden', !this.o.showCobweb);
        this._resizeAll();
      });
    toolbar.appendChild(toggleElement(cob));
    const lbl = document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.textContent = 'Cobweb';
    lbl.setAttribute('x', w - 22 * FS); lbl.setAttribute('y', toolbarH - 2 * FS);
    lbl.setAttribute('font-size', `${12 * FS}`);
    lbl.setAttribute('text-anchor','middle');
    lbl.setAttribute('fill','var(--color-text,#222)');
    toolbar.appendChild(lbl);

    // --- sliders (SVG) --------------------------------------------------------
    const ssvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    ssvg.setAttribute('width', w);
    ssvg.setAttribute('height', 160 * FS);
    ssvg.style.display='block';
    ssvg.style.padding = `${4*FS}px 0 ${2*FS}px 0`;
    host.appendChild(ssvg);
    this._slidersSvgSel = select(ssvg);

    // geometry scaled by FS
    const trackX   = 22 * FS;
    const trackW   = w - 44 * FS;
    const rowDy    = 44 * FS;        // slider row spacing
    const baseY    = 24 * FS;        // first track center
    const labelGap = 12 * FS;        // label above track
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
        this._preset?.value(this.lambda);
        this._updateValueTexts();
        this.render();
        this._katexifyDropdownLabels(this._presetEl, presets);
      });
    ssvg.appendChild(sliderElement(sλ));

    const sx0 = slider().id('x0').label(null).size(trackW).girth(10 * FS).knob(8 * FS)
      .position({ x: trackX, y: baseY + rowDy })
      .range([0,1])
      .value(this.x0)
      .update(()=>{
        this.x0 = sx0.value();
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

  // Observe + render KaTeX inside dropdown so it always shows up
  _installDropdownKatex(ddEl, presets){
    // initial pass (two frames to ensure DOM is fully built)
    requestAnimationFrame(()=> requestAnimationFrame(()=> this._katexifyDropdownLabels(ddEl, presets, true)));

    // Re-render when user opens the dropdown or it gains focus
    const poke = ()=> this._katexifyDropdownLabels(ddEl, presets, true);
    ddEl.addEventListener('mousedown', poke);
    ddEl.addEventListener('focusin', poke);

    // Watch for internal DOM changes (menu open/close, option rebuild, selection)
    const mo = new MutationObserver(()=> this._katexifyDropdownLabels(ddEl, presets));
    mo.observe(ddEl, { childList:true, subtree:true, characterData:true });
    this._ddObserver = mo;
  }

  // KaTeX-render the dropdown labels & the selected label area (robust to DOM changes)
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

    // option labels (try multiple classnames to be resilient to widget changes)
    const optionNodes = ddEl.querySelectorAll(
      '.cx-dropdown-option-label, .cx-dropdown-option, .cx-dd-option, .cx-option, [data-option-label]'
    );
    optionNodes.forEach(el=>{
      const raw = el.textContent.trim();
      const p = presets.find(pp => raw === pp.label || raw.startsWith(pp.label));
      if (p) renderLabel(el, p);
    });

    // selected/closed label
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

  /* sizing */
  _resizeAll(){
    const s = this.o.sceneSize;
    for (const box of [this.timeBox, this.cobwebBox]) {
      box.style.width = `${s}px`;
      box.style.height = `${s}px`;
    }
    for (const cvs of [this.timeCanvas, this.cobwebCanvas]) {
      cvs.style.width = `${s}px`;
      cvs.style.height = `${s}px`;
      resizeCanvasToDisplaySize(cvs);
    }
    this._positionAxisLabels();
    this.render();
  }

  async _positionAxisLabels(){
    if (!this.o.showAxes) {
      for (const el of [this.timeLabels.x,this.timeLabels.y,this.cobLabels.x,this.cobLabels.y]) el.style.display = 'none';
      return;
    }
    const katex = await ensureKaTeX();
    const FS = this.o.fontScale;
    const pad = 16 * FS;
    const labelInset = 26 * FS;

    this.timeLabels.x.innerHTML=''; katex.render('n', this.timeLabels.x);
    this.timeLabels.y.innerHTML=''; katex.render('x_n', this.timeLabels.y);
    this.cobLabels.x.innerHTML='';  katex.render('x_n', this.cobLabels.x);
    this.cobLabels.y.innerHTML='';  katex.render('x_{n+1}', this.cobLabels.y);
    for (const el of [this.timeLabels.x,this.timeLabels.y,this.cobLabels.x,this.cobLabels.y]) {
      el.style.display = '';
      el.style.fontSize = `${13 * FS}px`;
    }

    Object.assign(this.timeLabels.x.style, {
      left: '50%', bottom: `${pad + labelInset}px`, top:'auto', right:'auto', transform: 'translate(-50%, 0)'
    });
    Object.assign(this.timeLabels.y.style, {
      left: `${pad + labelInset}px`, top: '50%', transform: 'translate(0, -50%) rotate(-90deg)', transformOrigin: 'left top'
    });
    Object.assign(this.cobLabels.x.style, {
      left: '50%', bottom: `${pad + labelInset}px`, top:'auto', transform: 'translate(-50%, 0)'
    });
    Object.assign(this.cobLabels.y.style, {
      left: `${pad + labelInset}px`, top: '50%', transform: 'translate(0, -50%) rotate(-90deg)', transformOrigin: 'left top'
    });
  }

  /* drawing helpers */
  _strokeRect(ctx, cssW, cssH){
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5,0.5,cssW-1,cssH-1);
  }

  _drawAxesTicks01(ctx, cssW, cssH){
    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;
    const tick = 6 * FS;
    const numGap = 4 * FS;

    const toX = (x)=> pad + W*x;
    const toY = (y)=> cssH - pad - H*y;

    ctx.strokeStyle = 'rgba(127,127,127,0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let t=0; t<=1.0001; t+=0.2){
      ctx.moveTo(toX(t), cssH - pad); ctx.lineTo(toX(t), cssH - pad - tick);
      ctx.moveTo(pad, toY(t));        ctx.lineTo(pad + tick, toY(t));
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(60,60,60,0.95)';
    ctx.font = `${12 * FS}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (let t=0; t<=1.0001; t+=0.2) ctx.fillText(t.toFixed(1), toX(t), cssH - pad - tick - numGap);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (let t=0; t<=1.0001; t+=0.2) ctx.fillText(t.toFixed(1), pad + tick + numGap, toY(t));
  }

  _drawAxesTicksTime(ctx, cssW, cssH){
    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;
    const tick = 6 * FS;
    const numGap = 4 * FS;
    const N = this.o.N;

    const toX = (n)=> pad + (W * n / N);
    const toY = (y)=> cssH - pad - H*y;

    ctx.strokeStyle = 'rgba(127,127,127,0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y=0; y<=1.0001; y+=0.2){ const Y = toY(y); ctx.moveTo(pad, Y); ctx.lineTo(pad + tick, Y); }
    const step = Math.max(1, Math.round(N/6));
    for (let n=0; n<=N; n+=step){ const X = toX(n); ctx.moveTo(X, cssH - pad); ctx.lineTo(X, cssH - pad - tick); }
    ctx.stroke();

    ctx.fillStyle = 'rgba(60,60,60,0.95)';
    ctx.font = `${12 * FS}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (let n=0; n<=N; n+=step) ctx.fillText(String(n), toX(n), cssH - pad - tick - numGap);
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

  _renderCobweb(){
    if (!this.o.showCobweb) return;
    const { cssW, cssH, dpr } = resizeCanvasToDisplaySize(this.cobwebCanvas);
    const ctx = this.cctx;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);

    if (this.o.showAxes) this._drawAxesTicks01(ctx, cssW, cssH);
    this._strokeRect(ctx, cssW, cssH);

    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;
    const toX = (x)=> pad + W*x, toY = (y)=> cssH - pad - H*y;

    // diagonal y=x
    ctx.strokeStyle = 'rgba(127,127,127,0.9)';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(toX(0), toY(0)); ctx.lineTo(toX(1), toY(1)); ctx.stroke();

    // curve y=f(x)
    ctx.beginPath();
    for (let i=0;i<=300;i++){
      const x=i/300, y=f(x,this.lambda);
      const X=toX(x), Y=toY(clamp(y,0,1));
      i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);
    }
    ctx.strokeStyle='hsl(210 60% 45%)';
    ctx.lineWidth=2; ctx.stroke();

    // cobweb from x0
    let x=this.x0;
    ctx.strokeStyle='hsl(10 60% 45%)';
    ctx.lineWidth=2;
    ctx.beginPath();
    for (let n=0;n<this.o.N;n++){
      const y=f(x,this.lambda);
      const X1=toX(x), Y1=toY(x);
      const X2=toX(x), Y2=toY(y);
      const X3=toX(y), Y3=toY(y);
      ctx.moveTo(X1,Y1); ctx.lineTo(X2,Y2); ctx.lineTo(X3,Y3);
      x=y;
    }
    ctx.stroke();
  }

  render(){ this._renderTime(); this._renderCobweb(); }

  play(){
    if (this.running) return;
    this.running = true;
    this._setPlayIcon?.('pause');

    const tick = ()=>{
      if (!this.running) return;
      let λ = (this._sliders?.lambda?.value() ?? this.lambda);
      λ += 0.002;
      if (λ > 4) λ = 0;

      if (this._sliders && this._slidersSvgSel) {
        this._sliders.lambda.reset(this._slidersSvgSel, λ);
      } else {
        this.lambda = λ;
        this.render();
      }
      this._preset?.value(this.lambda);
      this._updateValueTexts();
      this._katexifyDropdownLabels(this._presetEl, [
        { label: 'Extinction',  katex: '\\\\lambda < 1' },
        { label: 'Equilibrium', katex: '\\\\lambda \\\\approx 2.5' },
        { label: 'Period-2',    katex: '\\\\lambda \\\\approx 3.2' },
        { label: 'Period-4',    katex: '\\\\lambda \\\\approx 3.5' },
        { label: 'Period-3',    katex: '\\\\lambda \\\\approx 3.83' },
        { label: 'Chaos',       katex: '\\\\lambda \\\\approx 3.9' }
      ], true);
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