// Logistic Map (time series + cobweb) — axes via options, KaTeX labels, fixed controls spacing
// Minimal external deps: your widgets. No config files.
// IMPORTANT: We include your CSS and KaTeX bootstraps here.

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
import slider from '/packages/widgets/src/slider.js';
import sliderElement from '/packages/widgets/src/sliderElement.js';
import toggle from '/packages/widgets/src/toggle.js';
import toggleElement from '/packages/widgets/src/toggleElement.js';
import iconFor from '/packages/widgets/src/button-symbols.js';

const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const f = (x, r) => r*x*(1-x);
const iterate = (x0, r, N) => { const xs = new Array(N+1); xs[0]=x0; for(let i=0;i<N;i++) xs[i+1]=f(xs[i],r); return xs; };

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
  g.setAttribute('class', 'widget button');                    // <-- key: style hook
  g.setAttribute('transform', `translate(${x},${y})`);
  svg.appendChild(g);

  const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('x', -size); bg.setAttribute('y', -size);
  bg.setAttribute('width', 2*size); bg.setAttribute('height', 2*size);
  // bg.setAttribute('rx', Math.round(size*0.35));                 // subtle rounding
  // bg.setAttribute('ry', Math.round(size*0.35));
  bg.setAttribute('class', 'lit');                              // <-- styled by widgets css
  g.appendChild(bg);

  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('class', 'symbol');                         // <-- styled by widgets css
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

export default class LogisticExplorable {
  constructor(mount, opts={}){
    // options: showAxes (bool), layout, controlsAt, sceneSize, N, showCobweb
    this.o = Object.assign({
      layout:'row', controlsAt:'end', sceneSize:360, N:160, showCobweb:true, showAxes:false
    }, opts);

    this.root = typeof mount==='string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('mount not found');

    // state
    this.defaults = { lambda: 1.2, x0: 0.02 };
    this.lambda = this.defaults.lambda;
    this.x0 = this.defaults.x0;
    this.running = false;

    // layout CSS
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
      el.style.fontSize = '13px';
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
    const w = Math.max(240, this.o.sceneSize);      // give controls enough width
    const toolbarH = 48;
    const slidersH = 120;                           // more space to avoid clipping
    const dy = 44;                                  // slider row spacing (bigger)

    // toolbar
    const toolbar = document.createElementNS('http://www.w3.org/2000/svg','svg');
    toolbar.setAttribute('width', w);
    toolbar.setAttribute('height', toolbarH);
    toolbar.style.display='block';
    toolbar.style.marginBottom = '8px';
    host.appendChild(toolbar);

    // play/pause
const playBtn = createSymbolButton(toolbar, {
  x: 20, y: toolbarH/2, size: 16, symbol: this.running ? 'pause' : 'play',
  onClick: (_e, api) => {
    // remember setter so programmatic play()/pause() can update the icon too
    this._setPlayIcon = api.setSymbol;
    if (this.running) { this.pause(); }
    else { this.play(); }
  }
});
// keep a reference even before first click
this._setPlayIcon = playBtn.setSymbol;

createSymbolButton(toolbar, {
  x: 56, y: toolbarH/2, size: 16, symbol: 'reload',
  onClick: () => {
    this.pause();
    this.lambda = this.defaults.lambda;
    this.x0     = this.defaults.x0;
    this._sliders?.lambda?.value(this.lambda);
    this._sliders?.x0?.value(this.x0);
    this._setPlayIcon?.('play'); // icon back to play
    this.render();
  }
});

    // "Cobweb" toggle (right)
    const cob = toggle().id('cob').size(10)
      .position({ x: w - 22, y: toolbarH/2 })
      .label(null)
      .value(this.o.showCobweb?1:0)
      .update(()=>{ this.o.showCobweb = !!cob.value(); this.cobwebBox.classList.toggle('cx-hidden', !this.o.showCobweb); this._resizeAll(); });
    toolbar.appendChild(toggleElement(cob));
    // little text under toggle
    const lbl = document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.textContent = 'Cobweb';
    lbl.setAttribute('x', w - 22); lbl.setAttribute('y', toolbarH - 2);
    lbl.setAttribute('font-size','12'); lbl.setAttribute('text-anchor','middle');
    lbl.setAttribute('fill','var(--color-text,#222)');
    toolbar.appendChild(lbl);

    // sliders
    const ssvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    ssvg.setAttribute('width', w);
    ssvg.setAttribute('height', slidersH);
    ssvg.style.display='block';
    ssvg.style.padding = '4px 0 2px 0';
    host.appendChild(ssvg);

    const trackX = 22, trackW = w - 44;
    const sλ = slider().id('lambda').label('λ').size(trackW).girth(10).knob(8)
      .position({ x: trackX, y: 20 })
      .range([0,4])
      .value(this.lambda)
      .update(()=>{ this.lambda = sλ.value(); if (!this.running) this.render(); });
    ssvg.appendChild(sliderElement(sλ));

    const sx0 = slider().id('x0').label('x₀').size(trackW).girth(10).knob(8)
      .position({ x: trackX, y: 20 + dy })
      .range([0,1])
      .value(this.x0)
      .update(()=>{ this.x0 = sx0.value(); if (!this.running) this.render(); });
    ssvg.appendChild(sliderElement(sx0));

    this._sliders = { lambda: sλ, x0: sx0 };
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
  const pad = 16;
  const labelInset = 26;   // farther in than numbers (6 tick + 4 gap + ~16 text ≈ 26 looks nice)

  // render
  this.timeLabels.x.innerHTML=''; katex.render('n', this.timeLabels.x);
  this.timeLabels.y.innerHTML=''; katex.render('x_n', this.timeLabels.y);
  this.cobLabels.x.innerHTML='';  katex.render('x_n', this.cobLabels.x);
  this.cobLabels.y.innerHTML='';  katex.render('x_{n+1}', this.cobLabels.y);
  for (const el of [this.timeLabels.x,this.timeLabels.y,this.cobLabels.x,this.cobLabels.y]) el.style.display = '';

  // place inside the plot
  // time-series:
  Object.assign(this.timeLabels.x.style, {
    left: '50%',
    bottom: `${pad + labelInset}px`,   // inside
    top: 'auto', right: 'auto',
    transform: 'translate(-50%, 0)'
  });
  Object.assign(this.timeLabels.y.style, {
    left: `${pad + labelInset}px`,     // inside
    top: '50%',
    transform: 'translate(0, -50%) rotate(-90deg)',
    transformOrigin: 'left top'
  });

  // cobweb:
  Object.assign(this.cobLabels.x.style, {
    left: '50%',
    bottom: `${pad + labelInset}px`,
    top: 'auto',
    transform: 'translate(-50%, 0)'
  });
  Object.assign(this.cobLabels.y.style, {
    left: `${pad + labelInset}px`,
    top: '50%',
    transform: 'translate(0, -50%) rotate(-90deg)',
    transformOrigin: 'left top'
  });
}

  /* drawing helpers */
  _strokeRect(ctx, cssW, cssH){
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5,0.5,cssW-1,cssH-1);
  }

  _drawAxesTicks01(ctx, cssW, cssH){
  const pad = 16, W = cssW - 2*pad, H = cssH - 2*pad;
  const toX = (x)=> pad + W*x;
  const toY = (y)=> cssH - pad - H*y;

  // 1) TICKS (inward)
  ctx.strokeStyle = 'rgba(127,127,127,0.85)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let t=0; t<=1.0001; t+=0.2){
    // x ticks up from bottom border
    ctx.moveTo(toX(t), cssH - pad);
    ctx.lineTo(toX(t), cssH - pad - 6);
    // y ticks right from left border
    ctx.moveTo(pad, toY(t));
    ctx.lineTo(pad + 6, toY(t));
  }
  ctx.stroke();

  // 2) NUMBERS (just inside)
  ctx.fillStyle = 'rgba(60,60,60,0.95)';
  ctx.font = '12px system-ui, sans-serif';

  // x numbers just above the bottom border
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  for (let t=0; t<=1.0001; t+=0.2){
    ctx.fillText(t.toFixed(1), toX(t), cssH - pad - 6 - 4);
  }

  // y numbers just to the right of the left border
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (let t=0; t<=1.0001; t+=0.2){
    ctx.fillText(t.toFixed(1), pad + 6 + 4, toY(t));
  }
}

  _drawAxesTicksTime(ctx, cssW, cssH){
  const pad = 16, W = cssW - 2*pad, H = cssH - 2*pad;
  const N = this.o.N;
  const toX = (n)=> pad + (W * n / N);
  const toY = (y)=> cssH - pad - H*y;

  // 1) TICKS (inward)
  ctx.strokeStyle = 'rgba(127,127,127,0.85)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // y ticks: rightward from left border
  for (let y=0; y<=1.0001; y+=0.2){
    const Y = toY(y);
    ctx.moveTo(pad, Y);           // border
    ctx.lineTo(pad + 6, Y);       // into plot
  }
  // x ticks: upward from bottom border
  const step = Math.max(1, Math.round(N/6));
  for (let n=0; n<=N; n+=step){
    const X = toX(n);
    ctx.moveTo(X, cssH - pad);          // border
    ctx.lineTo(X, cssH - pad - 6);      // into plot
  }
  ctx.stroke();

  // 2) NUMBERS (just inside, after ticks)
  ctx.fillStyle = 'rgba(60,60,60,0.95)';
  ctx.font = '12px system-ui, sans-serif';

  // x numbers: inside above the border
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  for (let n=0; n<=N; n+=step){
    ctx.fillText(String(n), toX(n), cssH - pad - 6 - 4);
  }

  // y numbers: inside to the right of the border
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (let y=0; y<=1.0001; y+=0.2){
    ctx.fillText(y.toFixed(1), pad + 6 + 4, toY(y));
  }
}

  /* renders */
  _renderTime(){
    const { cssW, cssH, dpr } = resizeCanvasToDisplaySize(this.timeCanvas);
    const ctx = this.tctx;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);

    const pad = 16, W = cssW - 2*pad, H = cssH - 2*pad;
    // axes + ticks
    if (this.o.showAxes) this._drawAxesTicksTime(ctx, cssW, cssH);
    this._strokeRect(ctx, cssW, cssH);

    // series x_n vs n
    const xs = iterate(this.x0, this.lambda, this.o.N);
    const toX = (n)=> pad + (W * n / this.o.N);
    const toY = (x)=> cssH - pad - H * clamp(x,0,1);

    ctx.beginPath(); let moved=false;
    for (let n=0; n<=this.o.N; n++){
      const X=toX(n), Y=toY(xs[n]);
      if (!moved) { ctx.moveTo(X,Y); moved=true; } else ctx.lineTo(X,Y);
    }
    ctx.strokeStyle = '#2e73b8ff';
    ctx.lineWidth = 4; ctx.stroke();
  }

  _renderCobweb(){
    if (!this.o.showCobweb) return;
    const { cssW, cssH, dpr } = resizeCanvasToDisplaySize(this.cobwebCanvas);
    const ctx = this.cctx;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);

    const pad = 16, W = cssW - 2*pad, H = cssH - 2*pad;
    const toX = (x)=> pad + W*x, toY = (y)=> cssH - pad - H*y;

    // axes + ticks
    if (this.o.showAxes) this._drawAxesTicks01(ctx, cssW, cssH);
    this._strokeRect(ctx, cssW, cssH);

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
    ctx.lineWidth=3; ctx.stroke();

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
  this._setPlayIcon?.('pause');        // <-- keep icon in sync
  const loop = ()=>{
    if (!this.running) return;
    this.lambda += 0.002;
    if (this.lambda > 4) this.lambda = 0;
    this._sliders?.lambda?.value(this.lambda);
    this.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

pause(){
  if (!this.running) return;
  this.running = false;
  this._setPlayIcon?.('play');         // <-- keep icon in sync
}
}