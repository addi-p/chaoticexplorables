// Poincaré explorable (two matched canvases) — dropdown for slice orientation,
// slider-only slice position, stacked controls, throttled ResizeObserver,
// warm-up integration for immediate attractor display.

import slider from '../../widgets/src/slider.js';
import sliderElement from '../../widgets/src/sliderElement.js';
import iconFor from '../../widgets/src/button-symbols.js';
import dropdown from '../../widgets/src/dropdown.js';
import dropdownElement from '../../widgets/src/dropdownElement.js';

(function ensureWidgetsCSS(){
  const id = 'cx-widgets-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = new URL('../../widgets/src/widgets-plain.css', import.meta.url).toString();
    document.head.appendChild(link);
  }
})();

const TAU = Math.PI * 2;
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
function lerp(a,b,t){ return a + (b-a)*t; }

function resizeCanvasToDisplaySize(cvs){
  const dpr = (globalThis.devicePixelRatio||1);
  const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width) || 300;
  const cssH = cvs.clientHeight || parseFloat(getComputedStyle(cvs).height) || 300;
  const w = Math.floor(cssW*dpr), h = Math.floor(cssH*dpr);
  if (cvs.width!==w || cvs.height!==h){ cvs.width=w; cvs.height=h; return true; }
  return false;
}

const prefersDark = ()=> globalThis.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
const strokeColor = ()=> (prefersDark() ? '#fff59d' : '#444');   // light yellow (dark) / dark gray (light)
const axesColor   = ()=> '#94a3b8';
const planeColor  = ()=> (prefersDark() ? '#e2e8f0' : '#9b9b9bff');

// ------------------------------- Attractors
const ATTRACTORS = {
  Lorenz: {
    params: { sigma:10, rho:28, beta:8/3 },
    deriv: ({x,y,z}, p)=>({ x: p.sigma*(y-x), y: x*(p.rho-z)-y, z: x*y - p.beta*z }),
    bounds: { x:[-30,30], y:[-30,30], z:[0,60] },
    dt: 0.008
  },
  'Rössler': {
    params: { a:0.2, b:0.2, c:5.7 },
    deriv: ({x,y,z}, p)=>({ x:-y-z, y:x+p.a*y, z:p.b+z*(x-p.c) }),
    bounds: { x:[-20,20], y:[-20,20], z:[-5,25] },
    dt: 0.01
  },
  Aizawa: {
    params: { a:0.95, b:0.7, c:0.6, d:3.5, e:0.25, f:0.1 },
    deriv: ({x,y,z}, p)=>({
      x:(z-p.b)*x - p.d*y,
      y:p.d*x + (z-p.b)*y,
      z:p.c + p.a*z - (z*z*z/3) - (x*x + y*y)*(1 + p.e*z) + p.f*z*(x*x*x)
    }),
    bounds: { x:[-3,3], y:[-3,3], z:[-1,2] },
    dt: 0.01
  }
};

// ------------------------------- Small helpers
function createSymbolButton(svg, { x, y, size = 16, symbol = 'play', onClick }){
  const NS = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(NS,'g');
  g.setAttribute('class','widget button');
  g.setAttribute('transform',`translate(${x},${y})`);
  svg.appendChild(g);

  const half = size;
  const bg = document.createElementNS(NS,'rect');
  bg.setAttribute('x',-half); bg.setAttribute('y',-half);
  bg.setAttribute('width',2*half); bg.setAttribute('height',2*half);
  bg.setAttribute('class','lit');
  g.appendChild(bg);

  const path = document.createElementNS(NS,'path');   // FIX: correct SVG namespace
  path.setAttribute('class','symbol');
  g.appendChild(path);

  const setSymbol = (name)=>{
    const fn = iconFor(name);
    path.setAttribute('d', fn(size*0.75));
  };
  setSymbol(symbol);

  const hit = document.createElementNS(NS,'rect');
  hit.setAttribute('x',-half); hit.setAttribute('y',-half);
  hit.setAttribute('width',2*half); hit.setAttribute('height',2*half);
  hit.setAttribute('fill','transparent');
  hit.style.cursor='pointer';
  hit.addEventListener('click', (ev)=>{ ev.stopPropagation(); onClick && onClick(ev, { setSymbol }); });
  g.appendChild(hit);

  return { group:g, setSymbol };
}

function dcall(obj, method, ...args){
  if (obj && typeof obj[method] === 'function'){ obj[method](...args); }
  return obj;
}

// ------------------------------- Explorable
export class PoincareExplorable {
  constructor(mount, opts = {}) {
    this.o = Object.assign({
      width: undefined,
      sceneSize: 300,
      sectionSize: 300,
      layout: 'row',             // 'row' | 'stack'
      controlsAt: 'end',
      showControls: true,
      transparent: true,
      fitContainer: true,
      strokeScale: 2.0,
      attractor: 'Lorenz',
      particleCount: 12,
      stepsPerFrame: 4,
      trailPoints: 8000,
      // Slice in CAMERA space to match on-screen line:
      //  - 'z' label means HORIZONTAL on screen => y_cam = const
      //  - 'x' label means VERTICAL   on screen => x_cam = const
      sliceMode: 'z',
      planePosNorm: 0.0,         // slider from center: [-1,1]
      planeThicknessNorm: 0.03   // normalized by span (see below)
    }, opts);

    this.running = true;
    this.yaw = 0.8;
    this.pitch = 0.35;
    this._drag = null;

    this.root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('PoincareExplorable: mount not found');

    // CSS
    if (!document.getElementById('cx-pc-layout-css')) {
      const style = document.createElement('style');
      style.id = 'cx-pc-layout-css';
      style.textContent = `
      .cx-pc-wrap { display: flex; gap: 10px; align-items: flex-start; }
      .cx-pc-wrap.row { flex-direction: row; flex-wrap: nowrap; }
      .cx-pc-wrap.stack { flex-direction: column; }
      .cx-pc-controls { display:block; width: 260px; }
      .cx-pc-controls > * { display:block; margin-bottom:10px; }
      .cx-pc-controls .d3-widgets svg { display:block; }
      .cx-pc-view { display:block; line-height:0; }
      .cx-pc-canvas { display:block; background:${this.o.transparent?'transparent':'#fff'}; }
      .cx-pc-scene-box { position:relative; }
      .cx-pc-scene-box .border { position:absolute; inset:0; pointer-events:none; border:1px solid ${axesColor()}; border-radius:4px; }
      `;
      document.head.appendChild(style);
    }

    // DOM
    this.wrap = document.createElement('div');
    this.wrap.className = `cx-pc-wrap ${this.o.layout === 'row' ? 'row' : 'stack'}`;
    this.root.appendChild(this.wrap);

    this.controlsHost = document.createElement('div');
    this.controlsHost.className = 'cx-pc-controls d3-widgets';

    this.sceneBox = document.createElement('div');
    this.sceneBox.className = 'cx-pc-view cx-pc-scene-box';

    this.sectionBox = document.createElement('div');
    this.sectionBox.className = 'cx-pc-view cx-pc-section-box';

    this._applyLayoutOrder();

    if (this.o.showControls) this._buildControls(this.controlsHost);
    

    this.sceneCanvas = document.createElement('canvas');
    this.sceneCanvas.className = 'cx-pc-canvas';
    this.sceneBox.appendChild(this.sceneCanvas);
    
    //const border = document.createElement('div'); border.className='border';
    //this.sceneBox.appendChild(border);
    

    this.sectionCanvas = document.createElement('canvas');
    this.sectionCanvas.className = 'cx-pc-canvas';
    this.sectionBox.appendChild(this.sectionCanvas);

    this.sceneCtx = this.sceneCanvas.getContext('2d', { alpha:true });
    this.sectionCtx = this.sectionCanvas.getContext('2d', { alpha:true });

    this._wireSceneInteractions();
    this._selectAttractor(this.o.attractor, true);  // seeds + warmup
    this._applyResponsiveSizing(true);
    this._draw(true);

    // Throttled RO
    if (this.o.fitContainer) {
      this._resizePending = false;
      this._ro = new ResizeObserver(() => {
        if (this._resizePending) return;
        this._resizePending = true;
        requestAnimationFrame(() => {
          this._resizePending = false;
          this._applyResponsiveSizing(false);
        });
      });
      this._ro.observe(this.root);
    }

    this._raf = 0;
    if (this.running) this.play();

    // Dark/light redraw
    if (globalThis.matchMedia) {
      try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this._draw(true)); } catch {}
    }
  }

  // ------------ Layout
  _applyLayoutOrder(){
    this.wrap.innerHTML = '';
    if (this.o.layout === 'row') {
      if (this.o.controlsAt === 'start') {
        if (this.o.showControls) this.wrap.appendChild(this.controlsHost);
        this.wrap.appendChild(this.sceneBox);
        this.wrap.appendChild(this.sectionBox);
      } else {
        this.wrap.appendChild(this.sceneBox);
        this.wrap.appendChild(this.sectionBox);
        if (this.o.showControls) this.wrap.appendChild(this.controlsHost);
      }
    } else {
      if (this.o.showControls) this.wrap.appendChild(this.controlsHost);
      this.wrap.appendChild(this.sceneBox);
      this.wrap.appendChild(this.sectionBox);
    }
  }
  _applyResponsiveSizing(initial=false){
    // Keep canvases equal size
    const side = (this.o.layout === 'row' && this.o.fitContainer)
      ? this._computeRowSide()
      : Math.round(Math.max(this.o.sceneSize|0, this.o.sectionSize|0));

    this._setSceneSize(side, side);
    this._setSectionSize(side, side);
    if (!initial) this._draw(true);
  }
  _computeRowSide(){
    const avail = Math.max(0, Math.floor(this.root.clientWidth || 0));
    const gap = 10;
    const controlsW = this.o.showControls ? 260 : 0;
    // Order: scene, section, (controls?) => 2 gaps if controls present, else 1
    const gaps = this.o.showControls ? 2 : 1;
    const rem = avail - controlsW - gaps*gap;
    const each = Math.floor(rem/2);
    const minSide = 220;

    if (each < minSide) {
      this.wrap.classList.remove('row');
      this.wrap.classList.add('stack');
      this._applyLayoutOrder();
      return Math.round(Math.max(this.o.sceneSize|0, this.o.sectionSize|0));
    }
    this.wrap.classList.remove('stack');
    this.wrap.classList.add('row');
    this._applyLayoutOrder();
    return each;
  }
  _setSceneSize(w,h){
    const cssW = Math.round(w), cssH = Math.round(h);
    this.sceneBox.style.width = `${cssW}px`;
    this.sceneBox.style.height = `${cssH}px`;
    this.sceneCanvas.style.width = `${cssW}px`;
    this.sceneCanvas.style.height = `${cssH}px`;
    resizeCanvasToDisplaySize(this.sceneCanvas);
  }
  _setSectionSize(w,h){
    const cssW = Math.round(w), cssH = Math.round(h);
    this.sectionBox.style.width = `${cssW}px`;
    this.sectionBox.style.height = `${cssH}px`;
    this.sectionCanvas.style.width = `${cssW}px`;
    this.sectionCanvas.style.height = `${cssH}px`;
    resizeCanvasToDisplaySize(this.sectionCanvas);
  }

  // ------------ Controls (stacked)
  _buildControls(container){
    container.innerHTML = '';

    // Toolbar: play/pause + reset
    const toolbar = document.createElementNS('http://www.w3.org/2000/svg','svg');
    toolbar.setAttribute('width', 260);
    toolbar.setAttribute('height', 44);
    container.appendChild(toolbar);

    this._playBtn = createSymbolButton(toolbar, {
      x: 18, y: 22, size: 16, symbol: this.running ? 'pause' : 'play',
      onClick: (_ev, api) => {
        if (this.running) { this.pause(); api.setSymbol('play'); }
        else { this.play(); api.setSymbol('pause'); }
      }
    });

    createSymbolButton(toolbar, {
      x: 52, y: 22, size: 16, symbol: 'reload',
      onClick: () => { this.reset(); }
    });

    // Attractor dropdown (uses your dropdown API: options, width)
    {
      const dd = dropdown();
      dcall(dd, 'id', 'attractor');
      dcall(dd, 'label', 'Attractor');
      dcall(dd, 'options', Object.keys(ATTRACTORS));
      dcall(dd, 'value', this.o.attractor);
      dcall(dd, 'width', 240);
      dcall(dd, 'update', () => {
        const val = (typeof dd.value === 'function') ? dd.value() : this.o.attractor;
        if (val && val !== this.o.attractor) {
          this.o.attractor = val;
          this._selectAttractor(val, true);
          this._draw(true);
        }
      });
      let node; try { node = dropdownElement(dd); } catch { node = dd.element || dd.el; }
      if (node) { node.style.display='block'; node.style.margin='6px 10px'; container.appendChild(node); }
    }

    // Slice orientation dropdown (single control replacing two buttons)
    {
      const dd = dropdown();
      dcall(dd, 'id', 'slice');
      dcall(dd, 'label', 'Slice');
      dcall(dd, 'options', ['Horizontal (y_cam)', 'Vertical (x_cam)']);
      dcall(dd, 'value', this.o.sliceMode === 'x' ? 'Vertical (x_cam)' : 'Horizontal (y_cam)');
      dcall(dd, 'width', 240);
      dcall(dd, 'update', () => {
        const val = (typeof dd.value === 'function') ? dd.value() : null;
        if (val) {
          this.o.sliceMode = /Vertical/.test(val) ? 'x' : 'z'; // z-label = Horizontal (y_cam)
          this._recomputeSectionFromBuffers(); // live, physical update
          this._draw(true);
        }
      });
      let node; try { node = dropdownElement(dd); } catch { node = dd.element || dd.el; }
      if (node) { node.style.display='block'; node.style.margin='6px 10px'; container.appendChild(node); }
    }

    // Sliders (each its own SVG row → stacked)
    const addSlider = (id,label,range,value,onUpdate)=>{
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('width', 260);
      svg.setAttribute('height', 60);
      svg.style.display='block';
      container.appendChild(svg);

      const s = slider().id(id).label(label).girth(8).knob(7)
        .position({ x: 20, y: 30 })
        .range(range)
        .value(value)
        .show(true);
      s.size?.(220);
      s.update(onUpdate);
      svg.appendChild(sliderElement(s));
      return s;
    };

    this._planePosS = addSlider('planePos','Slice position',[-1,1], this.o.planePosNorm, ()=>{
      this.o.planePosNorm = this._planePosS.value();
      this._recomputeSectionFromBuffers(); // keep Poincaré view in sync
      this._draw(true);
    });
    this._thickS = addSlider('thickness','Slice thickness',[0,0.2], this.o.planeThicknessNorm, ()=>{
      this.o.planeThicknessNorm = this._thickS.value();
      this._recomputeSectionFromBuffers();
      this._draw(true);
    });
    this._countS = addSlider('count','Trajectories',[3,50], this.o.particleCount, ()=>{
      const v = Math.round(this._countS.value()); if (v!==this.o.particleCount){ this.o.particleCount=v; this._resetSeeds(); this._recomputeSectionFromBuffers(); this._draw(true); }
    });
    this._stepsS = addSlider('steps','Steps / frame',[1,20], this.o.stepsPerFrame, ()=>{
      this.o.stepsPerFrame = Math.max(1, Math.round(this._stepsS.value()));
    });
  }

  // ------------ Interactions (rotate)
  _wireSceneInteractions(){
    const cvs = this.sceneCanvas;
    const getMouse = (ev)=>{
      const r = cvs.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top, w:r.width, h:r.height };
    };
    cvs.addEventListener('pointerdown', (ev)=>{
      const {x,y} = getMouse(ev);
      this._drag = { mode:'rotate', startX:x, startY:y, yaw0:this.yaw, pitch0:this.pitch };
      this._clearSection();         // so section matches as we rotate
      cvs.setPointerCapture?.(ev.pointerId);
    });
    cvs.addEventListener('pointermove', (ev)=>{
      if (!this._drag) return;
      const {x,y,w,h} = getMouse(ev);
      const dx = (x - this._drag.startX) / w;
      const dy = (y - this._drag.startY) / h;
      this.yaw   = this._drag.yaw0   + dx * TAU;
      this.pitch = clamp(this._drag.pitch0 - dy * TAU * 0.5, -Math.PI/2+0.01, Math.PI/2-0.01);
      this._recomputeSectionFromBuffers(); // live recompute in camera space
      this._draw(true);
    });
    const end = (ev)=>{ if (this._drag){ try{ cvs.releasePointerCapture(ev.pointerId); }catch{} this._drag=null; } };
    cvs.addEventListener('pointerup', end);
    cvs.addEventListener('pointercancel', end);
  }

  // ------------ Dynamics
  _selectAttractor(name, fullReset=false){
    this.att = ATTRACTORS[name] || ATTRACTORS.Lorenz;
    this.params = {...this.att.params};
    this.dt = this.att.dt;
    this.bounds = this.att.bounds;
    this._resetSeeds(fullReset);
    this._clearSection();
    this._warmup(800);
    this._recomputeSectionFromBuffers();
  }
  _resetSeeds(clearTrails=true){
    const N = Math.max(1, this.o.particleCount|0);
    this.seeds = new Array(N);
    const {x:[xmin,xmax], y:[ymin,ymax], z:[zmin,zmax]} = this.bounds;
    for (let i=0;i<N;i++){
      this.seeds[i] = {
        x: lerp(xmin,xmax, Math.random()),
        y: lerp(ymin,ymax, Math.random()),
        z: lerp(zmin,zmax, Math.random()),
        buf: new Float32Array(3*256), head:0, size:256
      };
    }
    if (clearTrails) this._clearSection();
  }
  _clearSection(){ this.sectionPoints = []; }

  _stepOne(p, h){
    const f = (st)=> this.att.deriv(st, this.params);
    const s0 = {x:p.x, y:p.y, z:p.z};
    const k1 = f(s0);
    const s1 = { x:s0.x + 0.5*h*k1.x, y:s0.y + 0.5*h*k1.y, z:s0.z + 0.5*h*k1.z };
    const k2 = f(s1);
    const s2 = { x:s0.x + 0.5*h*k2.x, y:s0.y + 0.5*h*k2.y, z:s0.z + 0.5*h*k2.z };
    const k3 = f(s2);
    const s3 = { x:s0.x + h*k3.x, y:s0.y + h*k3.y, z:s0.z + h*k3.z };
    const k4 = f(s3);
    p.x = s0.x + h*(k1.x + 2*k2.x + 2*k3.x + k4.x)/6;
    p.y = s0.y + h*(k1.y + 2*k2.y + 2*k3.y + k4.y)/6;
    p.z = s0.z + h*(k1.z + 2*k2.z + 2*k3.z + k4.z)/6;

    // record into ring buffer
    const H = p.head|0, S = p.size|0;
    p.buf[(H*3+0)% (3*S)] = p.x;
    p.buf[(H*3+1)% (3*S)] = p.y;
    p.buf[(H*3+2)% (3*S)] = p.z;
    p.head = (H+1) % S;

    // capture intersections for the newest segment only
    this._captureSegmentIntersections(p, H);
  }

  // ---- Camera transform (yaw around z, then pitch around x of camera)
  _toCamera(x,y,z){
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    const sp = Math.sin(this.pitch), cp = Math.cos(this.pitch);
    // Yaw: rotate around Z
    let X =  x*cy - y*sy;
    let Y =  x*sy + y*cy;
    let Z =  z;
    // Pitch: rotate around camera X
    const Yp = Y*cp - Z*sp;
    const Zp = Y*sp + Z*cp;
    return [X, Yp, Zp];
  }

  _captureSegmentIntersections(p, prevHead){
    // prevHead is index BEFORE we advanced; segment is (prev -> curr)
    const S = p.size|0;
    const i1 = ((prevHead)%S)*3;
    const i0 = ((prevHead-1+S)%S)*3;

    const x0 = p.buf[i0+0], y0 = p.buf[i0+1], z0 = p.buf[i0+2];
    const x1 = p.buf[i1+0], y1 = p.buf[i1+1], z1 = p.buf[i1+2];

    const [cx0, cy0, cz0] = this._toCamera(x0,y0,z0);
    const [cx1, cy1, cz1] = this._toCamera(x1,y1,z1);

    const span = this._span();
    const planePos = this.o.planePosNorm * 0.5 * span;        // camera-space units
    const planeThk = this.o.planeThicknessNorm * span;        // camera-space units

    if (this.o.sliceMode === 'x') {
      // vertical screen line: x_cam = const
      const a0 = cx0 - planePos, a1 = cx1 - planePos;
      const hits = (a0<=0 && a1>=0) || (a0>=0 && a1<=0) || (Math.abs(a1)<=planeThk*0.5);
      if (hits) {
        const t = (cx1!==cx0) ? (planePos - cx0)/(cx1 - cx0) : 1;
        const uy = lerp(y0,y1,t), vz = lerp(z0,z1,t);
        // plot in section as (y, z)
        if (Number.isFinite(uy) && Number.isFinite(vz)) this.sectionPoints.push({ u:uy, v:vz });
      }
    } else {
      // horizontal screen line: y_cam = const
      const a0 = cy0 - planePos, a1 = cy1 - planePos;
      const hits = (a0<=0 && a1>=0) || (a0>=0 && a1<=0) || (Math.abs(a1)<=planeThk*0.5);
      if (hits) {
        const t = (cy1!==cy0) ? (planePos - cy0)/(cy1 - cy0) : 1;
        const ux = lerp(x0,x1,t), vy = lerp(y0,y1,t);
        // plot in section as (x, y)
        if (Number.isFinite(ux) && Number.isFinite(vy)) this.sectionPoints.push({ u:ux, v:vy });
      }
    }

    const maxSec = this.o.trailPoints|0;
    if (this.sectionPoints.length > maxSec) this.sectionPoints.splice(0, this.sectionPoints.length - maxSec);
  }

  _recomputeSectionFromBuffers(){
    // Rebuild section points from all current ring buffers in *camera space*.
    this.sectionPoints = [];
    const Smax = this.seeds?.[0]?.size || 0;
    if (!this.seeds || !Smax) return;

    for (const p of this.seeds){
      let H = p.head|0, S = p.size|0;
      // walk over recorded segments
      for (let c=0; c<S-1; c++){
        const i1 = ((H-1+S)%S)*3;
        const i0 = ((H-2+S)%S)*3;
        const x0 = p.buf[i0+0], y0 = p.buf[i0+1], z0 = p.buf[i0+2];
        const x1 = p.buf[i1+0], y1 = p.buf[i1+1], z1 = p.buf[i1+2];
        if (!Number.isFinite(x0)) break;

        const [cx0, cy0, cz0] = this._toCamera(x0,y0,z0);
        const [cx1, cy1, cz1] = this._toCamera(x1,y1,z1);

        const span = this._span();
        const planePos = this.o.planePosNorm * 0.5 * span;
        const planeThk = this.o.planeThicknessNorm * span;

        if (this.o.sliceMode === 'x') {
          const a0 = cx0 - planePos, a1 = cx1 - planePos;
          const hits = (a0<=0 && a1>=0) || (a0>=0 && a1<=0) || (Math.abs(a1)<=planeThk*0.5);
          if (hits) {
            const t = (cx1!==cx0) ? (planePos - cx0)/(cx1 - cx0) : 1;
            const uy = lerp(y0,y1,t), vz = lerp(z0,z1,t);
            if (Number.isFinite(uy) && Number.isFinite(vz)) this.sectionPoints.push({ u:uy, v:vz });
          }
        } else {
          const a0 = cy0 - planePos, a1 = cy1 - planePos;
          const hits = (a0<=0 && a1>=0) || (a0>=0 && a1<=0) || (Math.abs(a1)<=planeThk*0.5);
          if (hits) {
            const t = (cy1!==cy0) ? (planePos - cy0)/(cy1 - cy0) : 1;
            const ux = lerp(x0,x1,t), vy = lerp(y0,y1,t);
            if (Number.isFinite(ux) && Number.isFinite(vy)) this.sectionPoints.push({ u:ux, v:vy });
          }
        }
        H = (H-1+S)%S;
      }
    }
  }

  _warmup(steps=800){
    const h = this.att.dt;
    for (let s=0; s<steps; s++){
      for (const p of this.seeds){
        this._stepOne(p, h);
      }
    }
  }

  // ------------ Projection for drawing
  _project([x,y,z]){
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    const sp = Math.sin(this.pitch), cp = Math.cos(this.pitch);
    let X =  x*cy - y*sy;
    let Y =  x*sy + y*cy;
    let Z =  z;
    let Yp = Y*cp - Z*sp;
    return [X, Yp];
  }

  _span(){
    const {x:[xmin,xmax], y:[ymin,ymax], z:[zmin,zmax]} = this.bounds;
    return Math.max(xmax-xmin, ymax-ymin, zmax-zmin);
  }

  // ------------ Rendering
  _drawScene(){
  const ctx = this.sceneCtx, cvs = this.sceneCanvas;
  resizeCanvasToDisplaySize(cvs);
  const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width) || this.o.sceneSize;
  const cssH = cvs.clientHeight || parseFloat(getComputedStyle(cvs).height) || this.o.sceneSize;
  const scaleX = cvs.width/cssW, scaleY = cvs.height/cssH;
  ctx.setTransform(scaleX,0,0,scaleY,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  // --- same inset frame as section ---
  const m = 20;
  const x0 = m, y0 = m, x1 = cssW - m, y1 = cssH - m;
  const W = x1 - x0, H = y1 - y0;
  ctx.strokeStyle = axesColor();
  ctx.lineWidth = 1.25 * this.o.strokeScale;
  ctx.strokeRect(x0, y0, W, H);

  // inner drawing box center & scale (match section)
  const V = Math.min(W, H);
  const cx = x0 + W/2;
  const cy = y0 + H/2;

  // compute world→screen scale from attractor bounds
  const {x:[xmin,xmax], y:[ymin,ymax], z:[zmin,zmax]} = this.bounds;
  const span = Math.max(xmax-xmin, ymax-ymin, zmax-zmin);
  const k = V / span; // world units → pixels inside the inner box

  // slice guide: strictly horizontal (z) or vertical (x) through the inner box
{
  const axisSpan = (this.o.sliceMode === 'x') ? (xmax - xmin) : (zmax - zmin);
  const tWorld   = axisSpan * this.o.planeThicknessNorm; // world thickness
  const tPx      = Math.max(2 * this.o.strokeScale, k * tWorld); // pixels (bounded for visibility)

  ctx.save();
  ctx.strokeStyle = planeColor();
  ctx.lineCap = 'butt';

  // Thick band (semi-transparent) centered on the slice
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = tPx;
  ctx.beginPath();
  if (this.o.sliceMode === 'z') {
    // horizontal band, offset within inner box by planePosNorm ∈ [-1,1]
    const yOff = 0.5 * V * this.o.planePosNorm;
    const y = cy - yOff;
    ctx.moveTo(cx - V/2, y);
    ctx.lineTo(cx + V/2, y);
  } else {
    // vertical band
    const xOff = 0.5 * V * this.o.planePosNorm;
    const x = cx + xOff;
    ctx.moveTo(x, cy - V/2);
    ctx.lineTo(x, cy + V/2);
  }
  ctx.stroke();

  // Hairline center for crisp alignment
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1.25 * this.o.strokeScale;
  ctx.beginPath();
  if (this.o.sliceMode === 'z') {
    const yOff = 0.5 * V * this.o.planePosNorm;
    const y = cy - yOff;
    ctx.moveTo(cx - V/2, y);
    ctx.lineTo(cx + V/2, y);
  } else {
    const xOff = 0.5 * V * this.o.planePosNorm;
    const x = cx + xOff;
    ctx.moveTo(x, cy - V/2);
    ctx.lineTo(x, cy + V/2);
  }
  ctx.stroke();

  ctx.restore();
}
  // draw attractor segments inside the same inner box
  ctx.lineWidth = 1.5 * this.o.strokeScale;
  ctx.strokeStyle = strokeColor();

  const drawSeg = (x0w, y0w, z0w, x1w, y1w, z1w)=>{
    const [u0,v0] = this._project([x0w, y0w, z0w]);
    const [u1,v1] = this._project([x1w, y1w, z1w]);

    // world→screen: center at (cx,cy) and scale by k, using inner box
    const X0 = cx + k * u0;
    const Y0 = cy - k * v0;
    const X1 = cx + k * u1;
    const Y1 = cy - k * v1;

    ctx.beginPath();
    ctx.moveTo(X0, Y0);
    ctx.lineTo(X1, Y1);
    ctx.stroke();
  };

  // draw a short trail per seed for speed (already in buffer)
  const segsPerSeed = 64;
  for (const p of this.seeds){
    let Hh = p.head|0, S = p.size|0, cnt = 0;
    while (cnt < segsPerSeed){
      const i1 = ((Hh-1+S)%S)*3;
      const i0 = ((Hh-2+S)%S)*3;
      const x0w = p.buf[i0+0], y0w = p.buf[i0+1], z0w = p.buf[i0+2];
      const x1w = p.buf[i1+0], y1w = p.buf[i1+1], z1w = p.buf[i1+2];
      if (!Number.isFinite(x0w)) break;
      drawSeg(x0w,y0w,z0w, x1w,y1w,z1w);
      Hh = (Hh-1+S)%S;
      cnt++;
    }
  }
}

  _drawSection(){
    const ctx = this.sectionCtx, cvs = this.sectionCanvas;
    resizeCanvasToDisplaySize(cvs);
    const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width) || this.o.sectionSize;
    const cssH = cvs.clientHeight || parseFloat(getComputedStyle(cvs).height) || this.o.sectionSize;
    const scaleX = cvs.width/cssW, scaleY = cvs.height/cssH;
    ctx.setTransform(scaleX,0,0,scaleY,0,0);
    ctx.clearRect(0,0,cssW,cssH);

    const mode = this.o.sliceMode;
    const uRange = (mode==='x') ? this.bounds.y : this.bounds.x; // vertical: (y,z); horizontal: (x,y)
    const vRange = (mode==='x') ? this.bounds.z : this.bounds.y;

    const m = 20; const x0=m, y0=m, x1=cssW-m, y1=cssH-m;
    const W = x1-x0, H=y1-y0;

    // frame
    ctx.strokeStyle = axesColor();
    ctx.lineWidth = 1.25 * this.o.strokeScale;
    ctx.strokeRect(x0,y0,W,H);

    // labels
    ctx.fillStyle = prefersDark() ? '#ddd' : '#333';
    ctx.font = '12px ui-sans-serif, system-ui';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText(mode==='x' ? 'y' : 'x', (x0+x1)/2, y1 + 2);
    ctx.save();
    ctx.translate(x0 - 10, (y0+y1)/2);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(mode==='x' ? 'z' : 'y', 0, 8);
    ctx.restore();

    const mapU = (u)=> x0 + ( (u - uRange[0])/(uRange[1]-uRange[0]) ) * W;
    const mapV = (v)=> y1 - ( (v - vRange[0])/(vRange[1]-vRange[0]) ) * H;

    // points
    ctx.fillStyle = strokeColor();
    const r = 1.6 * this.o.strokeScale;
    for (let i=0;i<this.sectionPoints.length;i++){
      const {u,v} = this.sectionPoints[i];
      const X = mapU(u), Y = mapV(v);
      if (X>=x0 && X<=x1 && Y>=y0 && Y<=y1){
        ctx.beginPath();
        ctx.arc(X,Y,r,0,TAU);
        ctx.fill();
      }
    }
  }

  _draw(){ this._drawScene(); this._drawSection(); }

  // ------------ Loop
  _tick(ts){
    if (!this._lastTs) this._lastTs = ts;
    let acc = (ts - this._lastTs)/1000;
    this._lastTs = ts;
    acc = Math.min(acc, 0.05);

    const steps = this.o.stepsPerFrame|0;
    const h = this.att.dt;
    while (acc > 0){
      for (let s=0; s<steps; s++){
        for (const p of this.seeds){
          this._stepOne(p, h);
        }
      }
      acc -= h * steps;
    }
    this._draw();
    if (this.running) this._raf = requestAnimationFrame(t => this._tick(t));
  }

  // ------------ Public
  play(){ if (this.running) return; this.running = true; this._lastTs=0; this._raf = requestAnimationFrame(t=>this._tick(t)); }
  pause(){ this.running = false; if (this._raf){ cancelAnimationFrame(this._raf); this._raf=0; } }
  reset(){ this._selectAttractor(this.o.attractor, true); this._draw(true); }
  setLayout(layout='row', controlsAt='end'){
    this.o.layout = layout;
    this.o.controlsAt = controlsAt;
    this._applyResponsiveSizing(false);
  }
}