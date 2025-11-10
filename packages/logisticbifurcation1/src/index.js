// Logistic Map — Time series (left) + Bifurcation (right)
// Supersampled bifurcation buffer (sharper zoom), smooth view zoom,
// KaTeX labels, presets (KaTeX), slider readouts above tracks,
// play/pause λ sweep, fontScale-aware layout, inward ticks,
// independent bifurcation width, Auto-X zoom, theme-aware colors.

// ---------- One-time CSS for widgets ----------
(function ensureWidgetsCSS(){
  const id = 'cx-widgets-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = new URL('../../widgets/src/widgets-plain.css', import.meta.url).toString();
    document.head.appendChild(link);
  }
})();

// ---------- Light/Dark theme for axes/borders ----------
(function ensureAxisCSS(){
  const id = 'cx-axis-theme';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    :root {
      --axis-text:    #222;
      --axis-stroke:  rgba(127,127,127,0.85);
      --color-border: #c9c9c9;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --axis-text:    #fff;
        --axis-stroke:  rgba(220,220,220,0.9);
        --color-border: #5b5b5b;
      }
    }
  `;
  document.head.appendChild(style);
})();

// ---------- KaTeX loader ----------
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

// ---------- Widgets ----------
import { select } from '../../vendor/d3.mjs';
import slider from '../../widgets/src/slider.js';
import sliderElement from '../../widgets/src/sliderElement.js';
import toggle from '../../widgets/src/toggle.js';
import toggleElement from '../../widgets/src/toggleElement.js';
import iconFor from '../../widgets/src/button-symbols.js';
import dropdown from '../../widgets/src/dropdown.js';
import dropdownElement from '../../widgets/src/dropdownElement.js';

// ---------- Math / helpers ----------
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const f = (x, r) => r*x*(1-x);
const iterate = (x0, r, N) => { const xs = new Array(N+1); xs[0]=x0; for(let i=0;i<N;i++) xs[i+1]=f(xs[i],r); return xs; };
const fmt = (v)=> (Math.abs(v) < 1e-3 || Math.abs(v) >= 1e4) ? v.toExponential(2) : v.toFixed(3);

function resizeCanvasToDisplaySize(cvs){
  const dpr = Math.max(1, globalThis.devicePixelRatio||1);
  const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width)||300;
  const cssH = cvs.clientHeight|| parseFloat(getComputedStyle(cvs).height)||300;
  const w = Math.floor(cssW*dpr), h = Math.floor(cssH*dpr);
  if (cvs.width!==w || cvs.height!==h) { cvs.width=w; cvs.height=h; }
  return { cssW, cssH, dpr, devW:w, devH:h };
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
  } catch {}
}

function computeThemeColors(){
  const dark = globalThis.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    series:      dark ? 'rgba(255,255,255,0.95)' : '#2e73b8ff',
    bifurcation: dark ? 'rgba(255,255,255,1)'    : 'hsl(210 60% 45%)'
  };
}

// Easing
const ease = u => u<=0 ? 0 : u>=1 ? 1 : (u*u*(3-2*u));

/* ========================================================================== */
export default class LogisticExplorable {
  constructor(mount, opts={}){
    this.o = Object.assign({
      layout:'row',
      controlsAt:'end',
      sceneSize: 360,        // left plot (square)
      bifuWidthScale: 2.0,   // width multiplier for bifurcation plot (right)
      N: 160,
      showAxes: true,
      showBifurcation: true,
      fontScale: 1.0,

      // base accumulation domain (fixed)
      baseLambdaMin: 1.0,
      baseLambdaMax: 4.0,

      // initial view domain (rendered)
      viewLambdaMin: 1.0,
      viewLambdaMax: 4.0,

      // -------- supersampling to reduce pixelation on rescale --------
      bifuSupersample: 2,   // offscreen accumulation is 2× device resolution

      // bifurcation density (slightly increased)
      bifurcationIters: 10000,
      bifurcationDiscard: 7000,
      bifurcationSeeds: 16,
      dotAlpha: 0.38,
      bifuDotSizeSS: 1,   // size in supersampled pixels (offscreen)

      // Auto X zoom settings
      autoZoomX: false,
      autoXStepEvery: 500,       // frames between setting a *new target*
      autoXIncrement: 0.1,       // targetMin += this each step
      autoXTargetMin: 3.5,       // stop at this min
      autoXTweenMs: 450          // smooth tween duration between targets (ms)
    }, opts);

    this.root = typeof mount==='string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('mount not found');

    // state
    this.defaults = { lambda: 1.2, x0: 0.02 };
    this.lambda = this.defaults.lambda;
    this.x0     = this.defaults.x0;
    this.running = false;

    // theme colors
    this._colors = computeThemeColors();

    // Auto-X tween state
    this._autoXCount = 0;
    this._view = {
      min: this.o.viewLambdaMin,
      max: this.o.viewLambdaMax,
      // tween
      animMin: this.o.viewLambdaMin,
      animMax: this.o.viewLambdaMax,
      tweenMinFrom: this.o.viewLambdaMin,
      tweenMinTo: this.o.viewLambdaMin,
      t0: 0, t1: 0, active: false
    };

    // layout css (once)
    if (!document.getElementById('cx-logistic-layout-css')){
      const s = document.createElement('style');
      s.id='cx-logistic-layout-css';
      s.textContent=`
        .cx-log-wrap{display:flex;gap:12px;align-items:flex-start;}
        .cx-log-wrap.stack{flex-direction:column;}
        .cx-log-wrap.row{flex-direction:row;flex-wrap:nowrap;}
        .cx-controls{display:block;min-width:260px}
        .cx-log-view{line-height:0;position:relative;flex:0 0 auto}
        .cx-log-view canvas{display:block;border:1px solid var(--color-border,#c9c9c9);background:transparent;}
        .cx-axlabel{position:absolute;pointer-events:none;color:var(--axis-text,#222)}
        .cx-hidden{display:none!important;}
      `;
      document.head.appendChild(s);
    }

    // DOM containers
    this.wrap = document.createElement('div');
    this.wrap.className='cx-log-wrap row';
    this.root.appendChild(this.wrap);

    this.timeBox=document.createElement('div'); this.timeBox.className='cx-log-view';
    this.bifuBox=document.createElement('div'); this.bifuBox.className='cx-log-view';
    this.controlsBox=document.createElement('div'); this.controlsBox.className='cx-controls d3-widgets';

    if (this.o.layout==='row' && this.o.controlsAt==='end') {
      this.wrap.append(this.timeBox, this.bifuBox, this.controlsBox);
    } else if (this.o.layout==='row') {
      this.wrap.append(this.controlsBox, this.timeBox, this.bifuBox);
    } else {
      this.wrap.classList.remove('row'); this.wrap.classList.add('stack');
      this.wrap.append(this.controlsBox, this.timeBox, this.bifuBox);
    }

    // canvases + contexts
    this.timeCanvas=document.createElement('canvas');
    this.bifuCanvas=document.createElement('canvas');
    this.timeBox.appendChild(this.timeCanvas);
    this.bifuBox.appendChild(this.bifuCanvas);
    this.tctx=this.timeCanvas.getContext('2d',{alpha:true});
    this.bctx=this.bifuCanvas.getContext('2d',{alpha:true});

    // HTML labels (KaTeX)
    this.timeLabels={x:document.createElement('div'), y:document.createElement('div')};
    this.bifuLabels={x:document.createElement('div'), y:document.createElement('div')};
    for (const el of Object.values(this.timeLabels).concat(Object.values(this.bifuLabels))) {
      el.className='cx-axlabel';
      el.style.fontSize=`${13*this.o.fontScale}px`;
      el.style.opacity='0.95';
      el.style.willChange='transform';
    }
    this.timeBox.append(this.timeLabels.x, this.timeLabels.y);
    this.bifuBox.append(this.bifuLabels.x, this.bifuLabels.y);

    // accumulation buffer in BASE domain
    this._accum = null;     // { canvas, ctx, key, pad_d, W_d, H_d, dpr, offW, offH, ss, visDevW, visDevH }
    this._colIdx = 0;       // sweep column in offscreen space [0, W_d)

    // controls + sizing
    this._buildControls(this.controlsBox);
    this._resizeAll();

    // initial column at current λ
    this._plotBifuColumnForLambda(this._clampToBase(this.lambda), { clearColumn:true });
    this.render();

    // theme live update
    if (globalThis.matchMedia) {
      this._themeMedia = matchMedia('(prefers-color-scheme: dark)');
      this._themeListener = () => { this._colors = computeThemeColors(); this.render(); };
      this._themeMedia.addEventListener?.('change', this._themeListener);
    }

    // responsive
    this._ro=new ResizeObserver(()=> this._resizeAll());
    this._ro.observe(this.root);
  }

  /* ---------- Controls ---------- */
  _buildControls(host){
    host.innerHTML = '';
    const FS = this.o.fontScale;
    const w = Math.max(260, this.o.sceneSize);
    const toolbarH = 48 * FS;

    // ----- Dropdown with KaTeX presets -----
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
      .options(presets.map(p => ({ label:p.label, value:p.value })))
      .value(this.lambda)
      .update(() => {
        const λ = parseFloat(dd.value());
        this.lambda = this._clampToBase(λ);
        if (this._sliders && this._slidersSvgSel) {
          this._sliders.lambda.reset(this._slidersSvgSel, this.lambda);
        }
        this._plotBifuColumnForLambda(this.lambda, { clearColumn:true });
        this._updateValueTexts();
        this.render();
        this._katexifyDropdownLabels(this._presetEl, presets, true);
      });

    const ddEl = dropdownElement(dd);
    ddHost.appendChild(ddEl);
    this._preset = dd; this._presetEl = ddEl;
    this._installDropdownKatex(ddEl, presets);

    // ----- Toolbar -----
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

    const playBtn = createSymbolButton(toolbar, {
      x: xBase + 20, y: toolbarH/2, size: 16 * FS, symbol: this.running ? 'pause' : 'play',
      onClick: (_e, api) => { this._setPlayIcon = api.setSymbol; this.running ? this.pause() : this.play(); }
    });
    this._setPlayIcon = playBtn.setSymbol;

    createSymbolButton(toolbar, {
      x: xBase + 56 * FS, y: toolbarH/2, size: 16 * FS, symbol: 'reload',
      onClick: () => {
        this._hardResetBifurcationAndState();   // full reset (buffer + view + params)
        this._katexifyDropdownLabels(this._presetEl, presets, true);
      }
    });

    // "Bifurcation" show/hide
    const bif = toggle().id('bif').size(10 * FS)
      .position({ x: w - 86 * FS, y: toolbarH/2 })
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
    bifLbl.setAttribute('x', w - 86 * FS); bifLbl.setAttribute('y', toolbarH - 2 * FS);
    bifLbl.setAttribute('font-size', `${12 * FS}`);
    bifLbl.setAttribute('text-anchor','middle');
    bifLbl.setAttribute('fill','var(--axis-text, #222)');
    toolbar.appendChild(bifLbl);

    // Auto X toggle (view zoom)
    const ax = toggle().id('autox').size(10 * FS)
      .position({ x: w - 22 * FS, y: toolbarH/2 })
      .label(null)
      .value(this.o.autoZoomX ? 1 : 0)
      .update(()=>{
        this.o.autoZoomX = !!ax.value();
        this._autoXCount = 0;
        if (!this.o.autoZoomX) {
          // snap back to full view (smooth tween)
          this._startViewTween(this._view.animMin, this.o.baseLambdaMin, this.o.autoXTweenMs);
        }
      });
    toolbar.appendChild(toggleElement(ax));
    const axLbl = document.createElementNS('http://www.w3.org/2000/svg','text');
    axLbl.textContent = 'Auto X';
    axLbl.setAttribute('x', w - 22 * FS); axLbl.setAttribute('y', toolbarH - 2 * FS);
    axLbl.setAttribute('font-size', `${12 * FS}`);
    axLbl.setAttribute('text-anchor','middle');
    axLbl.setAttribute('fill','var(--axis-text, #222)');
    toolbar.appendChild(axLbl);

    // ----- Sliders (labels above tracks) -----
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
      t.setAttribute('fill','var(--axis-text, #222)');
      t.setAttribute('dominant-baseline','ideographic');
      t.setAttribute('text-anchor','start');
      t.textContent = initialText;
      ssvg.appendChild(t);
      return t;
    };

    const sλ = slider().id('lambda').label(null).size(trackW).girth(10 * FS).knob(8 * FS)
      .position({ x: trackX, y: baseY })
      .range([this.o.baseLambdaMin, this.o.baseLambdaMax])
      .value(this.lambda)
      .update(()=>{
        const λ = sλ.value();
        this.lambda = this._clampToBase(λ);
        this._preset?.value(this.lambda);
        this._plotBifuColumnForLambda(this.lambda, { clearColumn:true });
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
        this._plotBifuColumnForLambda(this.lambda, { clearColumn:true });
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
    const poke = ()=> this._katexifyDropdownLabels(ddEl, presets, true);
    requestAnimationFrame(()=> requestAnimationFrame(poke));
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

  /* ---------- Sizing & labels ---------- */
  _resizeAll(){
    const s = this.o.sceneSize; // left plot is square
    // time (left)
    this.timeBox.style.width = `${s}px`;
    this.timeBox.style.height = `${s}px`;
    this.timeBox.style.flexBasis = `${s}px`;
    this.timeCanvas.style.width = `${s}px`;
    this.timeCanvas.style.height = `${s}px`;
    resizeCanvasToDisplaySize(this.timeCanvas);

    // bifurcation (right)
    const bw = Math.max(s, Math.round(s * this.o.bifuWidthScale));
    this.bifuBox.style.width = `${bw}px`;
    this.bifuBox.style.height = `${s}px`;
    this.bifuBox.style.flexBasis = `${bw}px`;
    this.bifuCanvas.style.width = `${bw}px`;
    this.bifuCanvas.style.height = `${s}px`;
    resizeCanvasToDisplaySize(this.bifuCanvas);

    // (re)create accumulation if needed
    this._ensureAccum(true); // rebuild with new device size / DPR / supersample

    this._positionTimeLabels();
    this._positionBifuLabels();
    this.render();
  }

  async _positionTimeLabels(){
    if (!this.o.showAxes) { for (const el of Object.values(this.timeLabels)) el.style.display='none'; return; }
    const katex = await ensureKaTeX();
    const FS = this.o.fontScale;
    const pad = 16 * FS, tick = 6 * FS, numGap = 3 * FS, labelInset = 26 * FS;

    this.timeLabels.x.innerHTML=''; katex.render('n', this.timeLabels.x);
    this.timeLabels.y.innerHTML=''; katex.render('x_n', this.timeLabels.y);
    for (const el of Object.values(this.timeLabels)) { el.style.display=''; el.style.fontSize=`${13*FS}px`; }
    Object.assign(this.timeLabels.x.style, {
      left:'50%', bottom:`${pad + tick + numGap + labelInset}px`, transform:'translate(-50%,0)'
    });
    Object.assign(this.timeLabels.y.style, {
      left:`${pad + tick + numGap + labelInset}px`, top:'50%',
      transform:'translate(0,-50%) rotate(-90deg)', transformOrigin:'left top'
    });
  }

  async _positionBifuLabels(){
    if (!this.o.showAxes) { for (const el of Object.values(this.bifuLabels)) el.style.display='none'; return; }
    const katex = await ensureKaTeX();
    const FS = this.o.fontScale;
    const pad = 16 * FS, tick = 6 * FS, numGap = 3 * FS, labelInset = 26 * FS;

    this.bifuLabels.x.innerHTML=''; katex.render('\\lambda', this.bifuLabels.x);
    this.bifuLabels.y.innerHTML=''; katex.render('x_n', this.bifuLabels.y);
    for (const el of Object.values(this.bifuLabels)) { el.style.display=''; el.style.fontSize=`${13*FS}px`; }
    Object.assign(this.bifuLabels.x.style, {
      left:'50%', bottom:`${pad + tick + numGap + labelInset}px`, transform:'translate(-50%,0)'
    });
    Object.assign(this.bifuLabels.y.style, {
      left:`${pad + tick + numGap + labelInset}px`, top:'50%',
      transform:'translate(0,-50%) rotate(-90deg)', transformOrigin:'left top'
    });
  }

  /* ---------- Accumulation buffer at DPR * supersample (BASE domain) ---------- */
  _ensureAccum(reset=false){
    const vis = resizeCanvasToDisplaySize(this.bifuCanvas);
    const dpr   = vis.dpr;
    const devW  = vis.devW;
    const devH  = vis.devH;

    const FS = this.o.fontScale;
    const ss = Math.max(1, Math.floor(this.o.bifuSupersample)); // supersample factor
    const offW = devW * ss;
    const offH = devH * ss;

    const pad_d = Math.round(16 * FS * dpr * ss);
    const W_d = offW - 2*pad_d;
    const H_d = offH - 2*pad_d;

    const key = `${offW}x${offH}@${dpr}xSS${ss}|base:${this.o.baseLambdaMin}-${this.o.baseLambdaMax}`;

    if (!this._accum || reset || this._accum.key !== key){
      const cvs = document.createElement('canvas');
      cvs.width = offW; cvs.height = offH;
      const ctx = cvs.getContext('2d', { alpha: true });
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0,0,offW,offH);
      this._accum = { canvas:cvs, ctx, key, pad_d, W_d, H_d, dpr, offW, offH, ss, visDevW:devW, visDevH:devH };
      // align sweep column with current lambda
      const col = this._lambdaToDeviceX_base(this.lambda) - pad_d;
      this._colIdx = Math.max(0, Math.min(col, Math.max(0, W_d - 1)));
    } else {
      Object.assign(this._accum, { pad_d, W_d, H_d, dpr, offW, offH, ss, visDevW:devW, visDevH:devH });
    }
    return this._accum;
  }

  _clampToBase(λ){
    return clamp(λ, this.o.baseLambdaMin, this.o.baseLambdaMax);
  }
  _lambdaToDeviceX_base(λ){
    const { baseLambdaMin:min, baseLambdaMax:max } = this.o;
    const acc = this._ensureAccum();
    const { pad_d, W_d } = acc;
    const u = clamp((λ - min) / Math.max(1e-9, (max - min)), 0, 1);
    return Math.round(pad_d + u * W_d);
  }
  _deviceColToLambda_base(col){
    const { baseLambdaMin:min, baseLambdaMax:max } = this.o;
    const acc = this._ensureAccum();
    const { W_d } = acc;
    const u = clamp(col / Math.max(1, W_d), 0, 1);
    return min + (max - min) * u;
  }

  _clearDeviceColumn(absX){
    const acc = this._ensureAccum();
    const { ctx, pad_d, H_d } = acc;
    const x = Math.round(absX);
    ctx.clearRect(x, pad_d, 1, H_d);
  }

  _plotBifuColumnForLambda(λ, { clearColumn=false } = {}){
    // Draw a 1px vertical column into the BASE-domain supersampled buffer
    const acc = this._ensureAccum();
    const { ctx, pad_d, H_d, offH } = acc;

    const absX = this._lambdaToDeviceX_base(λ);
    if (clearColumn) this._clearDeviceColumn(absX);

    const eps = 1e-6;
    const iters  = Math.max(10, this.o.bifurcationIters);
    const drop   = Math.max(0, Math.min(iters-1, this.o.bifurcationDiscard));
    const seedsN = Math.max(1, Math.floor(this.o.bifurcationSeeds));

    const toYd = (x)=> {
      const yy = clamp(x, 0, 1);
      return Math.round(offH - pad_d - Math.round(yy * H_d));
    };

    ctx.save();
    ctx.globalAlpha = this.o.dotAlpha;
    ctx.fillStyle = this._colors.bifurcation;
    for (let s=0; s<seedsN; s++){
      let x = clamp(this.x0 + (Math.random()*0.4 - 0.2), eps, 1 - eps);
      for (let i=0; i<iters; i++){
        x = f(x, λ);
        if (i >= drop) {
          if (x <= eps || x >= 1-eps) continue;
          const y = toYd(x);
          //ctx.fillRect(absX, y, 1, 1); // 1 supersampled pixel (becomes sub-pixel on screen)
          const s = Math.max(1, this.o.bifuDotSizeSS|0);
          ctx.fillRect(absX, y, s, s);
        }
      }
    }
    ctx.restore();
  }

  /* ---------- Drawing ---------- */
  _strokeRect(ctx, cssW, cssH){
    const border = getComputedStyle(document.documentElement).getPropertyValue('--color-border')?.trim() || '#c9c9c9';
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5,0.5,cssW-1,cssH-1);
  }

  _drawAxesTicks01(ctx, cssW, cssH){
    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;
    const tick = 6 * FS, numGap = 4 * FS;

    const toX = (x)=> pad + W*x;
    const toY = (y)=> cssH - pad - H*y;

    const tickStroke = getComputedStyle(document.documentElement).getPropertyValue('--axis-stroke')?.trim()
      || 'rgba(127,127,127,0.85)';
    const textFill = getComputedStyle(document.documentElement).getPropertyValue('--axis-text')?.trim()
      || 'rgba(60,60,60,0.95)';

    ctx.strokeStyle = tickStroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let t=0; t<=1.0001; t+=0.2){
      ctx.moveTo(toX(t), cssH - pad); ctx.lineTo(toX(t), cssH - pad - tick);
      ctx.moveTo(pad, toY(t));        ctx.lineTo(pad + tick, toY(t));
    }
    ctx.stroke();

    ctx.fillStyle = textFill;
    ctx.font = `${12 * FS}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (let t=0; t<=1.0001; t+=0.2){ ctx.fillText(t.toFixed(1), toX(t), cssH - pad - tick - numGap); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (let t=0; t<=1.0001; t+=0.2){ ctx.fillText(t.toFixed(1), pad + tick + numGap, toY(t)); }
  }

  _drawAxesTicksTime(ctx, cssW, cssH){
    const FS = this.o.fontScale;
    const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;
    const tick = 6 * FS, numGap = 4 * FS, N = this.o.N;

    const toX = (n)=> pad + (W * n / N);
    const toY = (y)=> cssH - pad - H*y;

    const tickStroke = getComputedStyle(document.documentElement).getPropertyValue('--axis-stroke')?.trim()
      || 'rgba(127,127,127,0.85)';
    const textFill = getComputedStyle(document.documentElement).getPropertyValue('--axis-text')?.trim()
      || 'rgba(60,60,60,0.95)';

    ctx.strokeStyle = tickStroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y=0; y<=1.0001; y+=0.2){ const Y = toY(y); ctx.moveTo(pad, Y); ctx.lineTo(pad + tick, Y); }
    const step = Math.max(1, Math.round(N/6));
    for (let n=0; n<=N; n+=step){ const X = toX(n); ctx.moveTo(X, cssH - pad); ctx.lineTo(X, cssH - pad - tick); }
    ctx.stroke();

    ctx.fillStyle = textFill;
    ctx.font = `${12 * FS}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    for (let n=0; n<=N; n+=step){ ctx.fillText(String(n), toX(n), cssH - pad - tick - numGap); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (let y=0; y<=1.0001; y+=0.2){ ctx.fillText(y.toFixed(1), pad + tick + numGap, toY(y)); }
  }

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
      if (!moved) { ctx.moveTo(X,Y); moved=true; } else { ctx.lineTo(X,Y); }
    }
    ctx.strokeStyle = this._colors.series;
    ctx.lineWidth = 2; ctx.stroke();
  }

  _renderBifurcation(){
    if (!this.o.showBifurcation) return;

    const acc  = this._ensureAccum();
    const { canvas:accCvs, pad_d:padBase, W_d:WBase, offW, offH } = acc;

    const vis = resizeCanvasToDisplaySize(this.bifuCanvas);
    const { cssW, cssH, dpr, devW, devH } = vis;
    const ctx = this.bctx;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,devW,devH);

    const FS = this.o.fontScale;
    const padVis = Math.round(16 * FS * dpr);
    const WVis   = devW - 2*padVis;

    // View domain
    const vMin = this._view.animMin;
    const vMax = this._view.animMax;

    // Crop from supersampled base buffer → visible canvas
    const fracL = clamp((vMin - this.o.baseLambdaMin) / Math.max(1e-9, (this.o.baseLambdaMax - this.o.baseLambdaMin)), 0, 1);
    const fracR = clamp((vMax - this.o.baseLambdaMin) / Math.max(1e-9, (this.o.baseLambdaMax - this.o.baseLambdaMin)), 0, 1);
    const srcX  = Math.round(padBase + fracL * WBase);
    const srcX2 = Math.round(padBase + fracR * WBase);
    const srcW  = Math.max(1, srcX2 - srcX);

    ctx.imageSmoothingEnabled = true;          // <— smoothing ON when drawing supersampled image down
    ctx.drawImage(accCvs, srcX, 0, srcW, offH, padVis, 0, WVis, devH);

    // Axes with view domain
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if (this.o.showAxes){
      const pad = 16 * FS, W = cssW - 2*pad, H = cssH - 2*pad;
      const tick = 6 * FS, numGap = 4 * FS;

      const toX = (λ)=> pad + W * ((λ - vMin) / (vMax - vMin));
      const toY = (y)=> cssH - pad - H * y;

      const tickStroke = getComputedStyle(document.documentElement).getPropertyValue('--axis-stroke')?.trim()
        || 'rgba(127,127,127,0.85)';
      const textFill = getComputedStyle(document.documentElement).getPropertyValue('--axis-text')?.trim()
        || 'rgba(60,60,60,0.95)';

      ctx.strokeStyle = tickStroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const step = 0.5;
      for (let λ=vMin; λ<=vMax + 1e-9; λ+=step){
        const X = toX(λ);
        ctx.moveTo(X, cssH - pad); ctx.lineTo(X, cssH - pad - tick);
      }
      for (let y=0; y<=1.0001; y+=0.2){
        const Y = toY(y);
        ctx.moveTo(pad, Y); ctx.lineTo(pad + tick, Y);
      }
      ctx.stroke();

      ctx.fillStyle = textFill;
      ctx.font = `${12 * FS}px system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      for (let λ=vMin; λ<=vMax + 1e-9; λ+=step){ ctx.fillText(λ.toFixed(1), toX(λ), cssH - pad - tick - numGap); }
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      for (let y=0; y<=1.0001; y+=0.2){ ctx.fillText(y.toFixed(1), pad + tick + numGap, toY(y)); }

      this._strokeRect(ctx, cssW, cssH);
    }
  }

  render(){
    // progress Auto-X tween if active
    if (this._view.active) {
      const now = performance.now();
      const u = clamp((now - this._view.t0) / Math.max(1, this._view.t1 - this._view.t0), 0, 1);
      const k = ease(u);
      this._view.animMin = this._view.tweenMinFrom + (this._view.tweenMinTo - this._view.tweenMinFrom) * k;
      if (u >= 1) {
        this._view.active = false;
        this._view.min = this._view.animMin;
      }
    }

    this._colors = computeThemeColors();
    this._renderTime();
    this._renderBifurcation();
  }

  /* ---------- Sweep (play) with smooth Auto-X VIEW rescale ---------- */
  play(){
    if (this.running) return;
    this.running = true;
    this._setPlayIcon?.('pause');
    this._autoXCount = 0;
    let last = performance.now();

    const step = ()=>{
      if (!this.running) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // advance device column in BASE buffer
      const acc = this._ensureAccum();
      const { W_d } = acc;
      const λ = this._deviceColToLambda_base(this._colIdx);
      this.lambda = λ;

      if (this._sliders && this._slidersSvgSel) this._sliders.lambda.reset(this._slidersSvgSel, λ);
      this._preset?.value(λ);

      this._plotBifuColumnForLambda(λ, { clearColumn:false });
      this._updateValueTexts();

      // Auto X: periodically set a new targetMin and tween smoothly
      if (this.o.autoZoomX) {
        this._autoXCount += 1;
        if (this._autoXCount >= this.o.autoXStepEvery && this._view.min < this.o.autoXTargetMin) {
          const nextMin = Math.min(this._view.min + this.o.autoXIncrement, this.o.autoXTargetMin);
          this._startViewTween(this._view.animMin, nextMin, this.o.autoXTweenMs);
          this._autoXCount = 0;
        }
      }

      this.render();

      // next column wrap
      this._colIdx = (this._colIdx + 1) % Math.max(1, W_d);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  pause(){
    if (!this.running) return;
    this.running = false;
    this._setPlayIcon?.('play');
  }

  /* ---------- View tween helpers ---------- */
  _startViewTween(fromMin, toMin, durMs){
    const tgt = clamp(toMin, this.o.baseLambdaMin, this.o.baseLambdaMax - 1e-6);
    this._view.tweenMinFrom = clamp(fromMin, this.o.baseLambdaMin, this.o.baseLambdaMax);
    this._view.tweenMinTo   = tgt;
    this._view.t0 = performance.now();
    this._view.t1 = this._view.t0 + Math.max(50, durMs|0);
    this._view.active = true;
    this._view.animMin = this._view.tweenMinFrom;
    this._view.animMax = this.o.baseLambdaMax;
  }

  /* ---------- Hard reset including the bifurcation buffer ---------- */
  _hardResetBifurcationAndState(){
    this.pause();

    // reset parameters
    this.lambda = this.defaults.lambda;
    this.x0     = this.defaults.x0;

    // reset sliders + dropdown
    if (this._sliders && this._slidersSvgSel) {
      this._sliders.lambda.reset(this._slidersSvgSel, this.lambda);
      this._sliders.x0.reset(this._slidersSvgSel, this.x0);
    }
    this._preset?.value(this.lambda);
    this._setPlayIcon?.('play');

    // restore view + tween state
    this.o.viewLambdaMin = this.o.baseLambdaMin;
    this.o.viewLambdaMax = this.o.baseLambdaMax;
    this._view.min = this.o.viewLambdaMin;
    this._view.max = this.o.viewLambdaMax;
    this._view.animMin = this._view.min;
    this._view.animMax = this._view.max;
    this._view.active = false;
    this._autoXCount = 0;

    // fully rebuild the accumulation buffer (clears it)
    this._ensureAccum(true);
    // draw a clean first slice at current λ
    this._plotBifuColumnForLambda(this._clampToBase(this.lambda), { clearColumn:true });

    this._updateValueTexts();
    this.render();
  }
}