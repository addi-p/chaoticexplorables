// /packages/lotkavolterra/src/LVLatticeExplorable.js
// Agent-based Lotka–Volterra lattice (exclusive occupancy).
// Safe & simple: robust error overlay, crisp pixels, correct play icon,
// dropdown confined to rail, no clipping (row→column fallback).

import button from "../../widgets/src/button.js";
import buttonElement from "../../widgets/src/buttonElement.js";
import slider from "../../widgets/src/slider.js";
import sliderElement from "../../widgets/src/sliderElement.js";
import toggle from "../../widgets/src/toggle.js";
import toggleElement from "../../widgets/src/toggleElement.js";
import dropdown from "../../widgets/src/dropdown.js";
import dropdownElement from "../../widgets/src/dropdownElement.js";

function ensureWidgetsCSS(href) {
  try {
    const sel = `link[data-widgets-css="${href}"]`;
    if (!document.querySelector(sel)) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.dataset.widgetsCss = href;
      document.head.appendChild(l);
    }
  } catch (e) {
    console.warn("Could not attach widget CSS:", e);
  }
}

function showError(mount, e) {
  console.error(e);
  const box = document.createElement("pre");
  box.style.cssText = "background:#220;color:#fdd;padding:12px;white-space:pre-wrap;border:1px solid #400;border-radius:8px;font-size:12px;max-width:100%;overflow:auto;";
  box.textContent = `LVLatticeExplorable error:\n${e?.stack || e}`;
  mount.innerHTML = "";
  mount.appendChild(box);
}

export default class LVLatticeExplorable {
  constructor(mount, opts = {}) {
    try {
      this._safeInit(mount, opts);
    } catch (e) {
      showError(mount instanceof Element ? mount : document.querySelector(mount), e);
    }
  }

  _safeInit(mount, opts) {
    // ---------- options ----------
    this.o = Object.assign({
      // lattice & rules
      L: 120, stepsPerFrame: 1, seed: 1, init: "random", wrap: true,
      neighborhood: "vonNeumann",              // 'vonNeumann' | 'Moore'
      preyBirth: 0.30, preyMove: 0.25,
      predEat: 0.65, predBirth: 0.30, predMove: 0.25, predDie: 0.10,

      // layout & sizing
      width: undefined,                         // rail width from ExplorableCard (if fixed)
      layout: "row",                            // 'row' | 'column'
      controlsAt: "end",                        // 'start' | 'end'
      controlsWidth: 300,                       // target controls rail width
      controlsMinWidth: 240,
      controlsOverflow: "auto",                 // scrollbar if tight
      showSliders: true,
      canvasWidthPx: undefined,                 // canvas CSS width independent of rail
      pxPerCellMin: 2,                          // crisp minimum

      // colors
      colorEmpty: "#f8f8f8", colorPrey: "#22c55e", colorPred: "#ef4444",

      // widget CSS
      widgetCssHref: new URL("../../widgets/src/widgets-plain.css", import.meta.url).href
    }, opts);

    ensureWidgetsCSS(this.o.widgetCssHref);

    // ---------- roots ----------
    this.mount = mount;
    this.root = document.createElement("div");
    this.root.style.cssText = "display:flex;gap:12px;align-items:flex-start;width:100%;";
    this.root.style.flexDirection = (this.o.layout === "column") ? "column" : "row";
    const rootEl = (mount instanceof Element) ? mount : document.querySelector(mount);
    if (!rootEl) throw new Error("LVLatticeExplorable: mount not found");
    rootEl.appendChild(this.root);

    // Canvas area
    this.visWrap = document.createElement("div");
    this.visWrap.style.cssText = "flex:1 1 auto;min-width:0;";
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "display:block;image-rendering:pixelated;";
    this.ctx = this.canvas.getContext("2d", { alpha:false });
    this.visWrap.appendChild(this.canvas);

    // Controls area
    this.controlsWrap = document.createElement("div");
    this.controlsWrap.className = "d3-widgets";
    this.controlsWrap.style.cssText = `flex:0 0 auto;display:flex;flex-direction:column;gap:8px;overflow:${this.o.controlsOverflow};`;
    // Confine dropdown width to rail
    this.ddHost = document.createElement("div");
    this.ddHost.style.cssText = "max-width:100%;overflow:hidden;";

    // Build SVG controls
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // start with target width; we’ll adjust after paint
    this.svg.setAttribute("width", String(this.o.controlsWidth));
    this.svg.setAttribute("height", this.o.showSliders ? "380" : "160");
    this.controlsWrap.appendChild(this.svg);
    this.controlsWrap.appendChild(this.ddHost);

    if (this.o.controlsAt === "start") { this.root.appendChild(this.controlsWrap); this.root.appendChild(this.visWrap); }
    else { this.root.appendChild(this.visWrap); this.root.appendChild(this.controlsWrap); }

    // ---------- state ----------
    this.N = this.o.L;
    this.scale = 4;
    this.grid = new Uint8Array(this.N*this.N); // 0 empty, 1 prey, 2 predator
    this.next = new Uint8Array(this.N*this.N);
    this.running = true; // animation plays on start
    this.rand = this.#rng(this.o.seed|0);
    this.#resetField(this.o.init);

    // ---------- widgets ----------
    this.#initWidgets();               // create controls
    this.#setPlayButton(true);         // show PAUSE icon since we are playing

    // ---------- sizing ----------
    requestAnimationFrame(() => {
      try {
        this.#setupSizing();           // size once
      } catch (e) { showError(rootEl, e); }
    });

    // ---------- loop ----------
    this.#loop();
  }

  /* ===== public API ===== */
  play(){ this.running = true; this.#setPlayButton(true); }
  pause(){ this.running = false; this.#setPlayButton(false); }
  destroy(){
    try { this.pause(); } catch {}
    this.resizeObs?.disconnect?.();
    window.removeEventListener("resize", this._onResize);
    this.root?.remove?.();
  }

  /* ===== model ===== */
  #rng(seed){ let t=seed>>>0; return () => { t+=0x6D2B79F5; let r=Math.imul(t ^ (t>>>15), 1|t); r ^= r + Math.imul(r ^ (r>>>7), 61|r); return ((r ^ (r>>>14))>>>0)/4294967296; }; }
  #R(){ return this.rand(); }
  #chance(p){ return this.#R() < p; }
  #idx(x,y){ const N=this.N; if (this.o.wrap){ x=(x+N)%N; y=(y+N)%N; } else { if(x<0||y<0||x>=N||y>=N) return -1; } return y*N + x; }
  #neighbors(x,y){
    const a=[];
    if (this.o.neighborhood === "Moore") {
      for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++){ if(dx||dy){ const id=this.#idx(x+dx,y+dy); if(id>=0) a.push(id); } }
    } else {
      const ids=[this.#idx(x+1,y),this.#idx(x-1,y),this.#idx(x,y+1),this.#idx(x,y-1)];
      for(const id of ids) if(id>=0) a.push(id);
    }
    for(let i=a.length-1;i>0;i--){ const j=(this.#R()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  #resetField(kind){
    const N=this.N; this.grid.fill(0);
    if (kind==="random"){
      for(let i=0;i<N*N;i++){ const r=this.#R(); this.grid[i]= r<0.08?2 : (r<0.38?1:0); }
    } else if (kind==="patch"){
      for(let y=0;y<N;y++) for(let x=0;x<N;x++){
        const dx=x-N/2, dy=y-N/2, r2=dx*dx+dy*dy;
        if (r2<(0.12*N)**2) this.grid[this.#idx(x,y)]=1;
        if (r2<(0.08*N)**2 && this.#R()<0.5) this.grid[this.#idx(x,y)]=2;
      }
    } else if (kind==="stripes"){
      for(let y=0;y<N;y++) for(let x=0;x<N;x++){
        const s=Math.sin(2*Math.PI*x/10); this.grid[this.#idx(x,y)]= s>0?1:0; if(s<-0.75 && this.#R()<0.3) this.grid[this.#idx(x,y)]=2;
      }
    }
  }
  #tick(){
    const N=this.N;
    const {preyBirth,preyMove,predEat,predBirth,predMove,predDie}=this.o;

    if(!this.order||this.order.length!==N*N){ this.order=new Uint32Array(N*N); for(let i=0;i<N*N;i++) this.order[i]=i; }
    for(let i=N*N-1;i>0;i--){ const j=(this.#R()*(i+1))|0; const t=this.order[i]; this.order[i]=this.order[j]; this.order[j]=t; }

    this.next.set(this.grid);
    const getXY=i=>[i%N,(i/N)|0];

    for(let k=0;k<N*N;k++){
      const i=this.order[k], s=this.grid[i]; if(s===0) continue;
      const [x,y]=getXY(i), neigh=this.#neighbors(x,y);
      if(s===1){
        if(this.#chance(preyBirth)){ for(const j of neigh) if(this.grid[j]===0 && this.next[j]===this.grid[j]){ this.next[j]=1; break; } }
        if(this.#chance(preyMove)){  for(const j of neigh) if(this.grid[j]===0 && this.next[j]===this.grid[j]){ this.next[j]=1; this.next[i]=(this.next[i]===2?2:0); break; } }
      } else if (s===2){
        let ate=false;
        if(this.#chance(predEat)){
          for(const j of neigh) if(this.grid[j]===1 && this.next[j]===this.grid[j]){
            this.next[j]=2; this.next[i]=0; ate=true;
            if(this.#chance(predBirth)){ for(const k2 of neigh) if(this.next[k2]===0 && this.grid[k2]===0){ this.next[k2]=2; break; } }
            break;
          }
        }
        if(!ate){
          if(this.#chance(predDie)) this.next[i]=0;
          else if(this.#chance(predMove)){ for(const j of neigh) if(this.grid[j]===0 && this.next[j]===this.grid[j]){ this.next[j]=2; this.next[i]=0; break; } }
        }
      }
    }
    const tmp=this.grid; this.grid=this.next; this.next=tmp;
  }

  /* ===== render ===== */
  #render(){
    const N=this.N, scale=this.scale, ctx=this.ctx, canvas=this.canvas;
    if(!this.raster||this.raster.width!==N||this.raster.height!==N){ this.raster=ctx.createImageData(N,N); }
    const data=this.raster.data;

    if(!this._rgbEmpty){
      const toRGB=(hex)=>{ const h=hex.replace("#",""); const n=parseInt(h.length===3?h.split("").map(c=>c+c).join(""):h,16); return [(n>>16)&255,(n>>8)&255,n&255]; };
      this._rgbEmpty=toRGB(this.o.colorEmpty); this._rgbPrey=toRGB(this.o.colorPrey); this._rgbPred=toRGB(this.o.colorPred);
    }
    for(let i=0,p=0;i<N*N;i++,p+=4){ const s=this.grid[i]; const c=(s===0)?this._rgbEmpty:(s===1?this._rgbPrey:this._rgbPred); data[p]=c[0]; data[p+1]=c[1]; data[p+2]=c[2]; data[p+3]=255; }

    const tmp=document.createElement("canvas"); tmp.width=N; tmp.height=N; tmp.getContext("2d").putImageData(this.raster,0,0);

    const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1));
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.ctx.imageSmoothingEnabled=false;
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.ctx.drawImage(tmp,0,0,N,N,0,0,N*scale,N*scale);
  }

  #loop(){
    const tick=()=>{ for(let k=0;k<this.o.stepsPerFrame;k++) if(this.running) this.#tick(); this.#render(); this._raf=requestAnimationFrame(tick); };
    this._raf=requestAnimationFrame(tick);
  }

  /* ===== controls ===== */
  #initWidgets(){
    const mountSVG = (el) => this.svg.appendChild(el);
    const mountDOM = (el) => this.ddHost.appendChild(el);

    // Run / Reset
    this.playBtn = button()
      .size(44).symbolsize(0.35).label("run").labelposition("right")
      .position({x:24,y:26})
      .actions(["play","pause"])
      .update(()=>{ this.running = this.playBtn.value() === 1; });
    mountSVG(buttonElement(this.playBtn));

    const resetBtn = button()
      .size(44).symbolsize(0.35).label("reset").labelposition("right")
      .position({x:24,y:84})
      .actions(["reload"])
      .update(()=>{ this.#resetField(this.currentInit.value()); });
    mountSVG(buttonElement(resetBtn));

    // Neighborhood one-toggle (off=von Neumann, on=Moore)
    this.neighToggle = toggle()
      .size(10).position({x:24,y:142})
      .label("Moore neighborhood").labelposition("right")
      .value(this.o.neighborhood==="Moore"?1:0)
      .update(()=>{ this.o.neighborhood = this.neighToggle.value() ? "Moore" : "vonNeumann"; });
    mountSVG(toggleElement(this.neighToggle));

    // Stir
    this.noiseToggle = toggle()
      .size(10).position({x:24,y:182})
      .label("stir").labelposition("right");
    mountSVG(toggleElement(this.noiseToggle));

    // Sliders (left stack)
    if (this.o.showSliders) {
      const s = (id, label, y, val, set) => {
        const sl = slider().id(id).label(label).size(200).girth(10).knob(9)
          .position({x:110,y}).labelposition("top-left").range([0,1]).value(val)
          .update(()=> set(sl.value()));
        mountSVG(sliderElement(sl));
      };
      s("pBirth", "prey birth p", 24,  this.o.preyBirth, v=>this.o.preyBirth=v);
      s("pMove",  "prey move p",  74,  this.o.preyMove,  v=>this.o.preyMove=v);
      s("predEat","pred eat p",   124, this.o.predEat,   v=>this.o.predEat=v);
      s("predBirth","pred birth p (if ate)",174,this.o.predBirth,v=>this.o.predBirth=v);
      s("predMove","pred move p", 224, this.o.predMove,  v=>this.o.predMove=v);
      s("predDie","pred die p (no food)",274,this.o.predDie,v=>this.o.predDie=v);
    }

    // Initial condition dropdown (constrained)
    this.currentInit = dropdown()
      .id("init-dd").label("initial condition")
      .options([{label:"Random",value:"random"},{label:"Patch",value:"patch"},{label:"Stripes",value:"stripes"}])
      .value(this.o.init)
      .update(()=>{ this.o.init=this.currentInit.value(); this.#resetField(this.o.init); });

    const ddEl = dropdownElement(this.currentInit);
    ddEl.style.maxWidth = "100%";
    ddEl.style.width = "100%";
    ddEl.style.boxSizing = "border-box";
    mountDOM(ddEl);
  }

  #setPlayButton(isRunning){
    try {
      // value===1 corresponds to the second action ["play","pause"] => show PAUSE icon when running
      this.playBtn?.value(isRunning ? 1 : 0);
      this.playBtn?.update?.();
    } catch (e) {
      console.warn("play button sync failed:", e);
    }
  }

  /* ===== sizing ===== */
  #setupSizing(){
    const gap = 12;
    const minCanvasCss = Math.max(80, this.N * this.o.pxPerCellMin);

    const applyCanvasWidth = (cssWidth) => {
      const cssW = Math.max(0, Math.floor(cssWidth));
      const ppc  = Math.max(this.o.pxPerCellMin, Math.floor(cssW / this.N)) || 1;
      this.scale = ppc;
      const finalCssW = this.N * ppc;

      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      this.canvas.width  = finalCssW * dpr;
      this.canvas.height = finalCssW * dpr;
      this.canvas.style.width  = finalCssW + "px";
      this.canvas.style.height = finalCssW + "px";
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
      this.ctx.imageSmoothingEnabled = false;
      this.#render();
    };

    const layoutPass = () => {
      const railW = this.mount.getBoundingClientRect().width || 0;

      // Desired controls width (stay within rail)
      let ctrlW = Math.max(this.o.controlsMinWidth, this.o.controlsWidth);
      ctrlW = Math.min(ctrlW, Math.max(this.o.controlsMinWidth, railW - minCanvasCss - gap));

      // can row fit?
      const canRowFit = (railW - ctrlW - gap) >= minCanvasCss;

      if (this.o.layout === "row" && canRowFit) {
        this.root.style.flexDirection = "row";
        this.controlsWrap.style.width = `${ctrlW}px`;
        this.svg.setAttribute("width", String(ctrlW));
        const visAvail = railW - ctrlW - gap;
        const canvasDesired = this.o.canvasWidthPx ?? visAvail;
        applyCanvasWidth(Math.min(canvasDesired, visAvail));
      } else {
        // Column fallback (or requested column)
        this.root.style.flexDirection = "column";
        this.controlsWrap.style.width = "100%";
        const colCtrlW = Math.max(this.o.controlsMinWidth, Math.min(this.o.controlsWidth, Math.floor(railW - 24)));
        this.svg.setAttribute("width", String(colCtrlW));
        const canvasDesired = this.o.canvasWidthPx ?? railW;
        applyCanvasWidth(Math.min(canvasDesired, railW));
      }
    };

    // initial + reactive
    layoutPass();

    // observe rail width
    this.resizeObs?.disconnect?.();
    this.resizeObs = new ResizeObserver(layoutPass);
    this.resizeObs.observe(this.mount);

    // viewport changes (DPR/resize)
    this._onResize = layoutPass;
    window.addEventListener("resize", this._onResize, { passive:true });
  }
}