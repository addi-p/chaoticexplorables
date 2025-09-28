// packages/double-pendulum/src/index.js
// sliders: N (int), σ, L1, L2, m1, m2; scene + phase plane with θ₁ / θ₂ labels.

import slider from '../../widgets/src/slider.js';
import sliderElement from '../../widgets/src/sliderElement.js';
import toggle from '../../widgets/src/toggle.js';
import toggleElement from '../../widgets/src/toggleElement.js';
import iconFor from '../../widgets/src/button-symbols.js';
import { Grid } from '../../widgets/src/gridd.js';

// Ensure widget CSS variables (plain CSS, no modules)
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
const modAngle = a=>{ a=(a+Math.PI)%(2*Math.PI); if(a<0)a+=2*Math.PI; return a-Math.PI; };
function randn(){ let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v); }
function resizeCanvasToDisplaySize(cvs){
  const dpr = (globalThis.devicePixelRatio||1);
  const cssW = cvs.clientWidth || parseFloat(getComputedStyle(cvs).width) || 200;
  const cssH = cvs.clientHeight || parseFloat(getComputedStyle(cvs).height) || 200;
  const w = Math.floor(cssW*dpr), h = Math.floor(cssH*dpr);
  if (cvs.width!==w || cvs.height!==h){ cvs.width=w; cvs.height=h; return true; }
  return false;
}

// Single-source symbol button factory (listens ONLY on hit-rect)
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
    path.setAttribute('d', fn(size*0.75));
  };
  setSymbol(symbol);

  // Hit target — attach handler ONLY here, stop propagation to avoid double-fire
  const hit = document.createElementNS('http://www.w3.org/2000/svg','rect');
  hit.setAttribute('x',-half); hit.setAttribute('y',-half);
  hit.setAttribute('width',2*half); hit.setAttribute('height',2*half);
  hit.setAttribute('fill','transparent');
  hit.style.cursor='pointer';
  hit.addEventListener('click', (ev)=>{ ev.stopPropagation(); onClick && onClick(ev, { setSymbol }); });
  g.appendChild(hit);

  return { group:g, setSymbol };
}

export class DoublePendulumExplorable {
  constructor(mount, opts = {}) {
    this.o = Object.assign({
      width: 280,
      sceneSize: 200,
      phaseSize: 200,
      showControls: true,
      showPhasePlane: true,
      showTrails: true,
      showButtons: true,          // <— NEW: if false, hides Play/Pause + Reload toolbar here
      enableClickIK: true,
      ensembleCount: 5,
      spreadSigma: 0.02,
      params: { m1:1, m2:1, L1:1, L2:1, g:9.81 }
    }, opts);

    this.params = { ...this.o.params };
    this.kPix = 90;
    this.dt = 1/240;
    this.running = false;

    this.grid = new Grid(mount, { width: this.o.width, gap: 10 });

    if (this.o.showControls) this._buildControls(this.grid.slot());

    // Scene (SVG)
    this.sceneBox = this.grid.frame({ w:this.o.sceneSize, h:this.o.sceneSize });
    this.scene = document.createElementNS('http://www.w3.org/2000/svg','svg');
    this.scene.setAttribute('width', this.o.sceneSize);
    this.scene.setAttribute('height', this.o.sceneSize);
    this.scene.setAttribute('viewBox','-220 -220 440 440');
    this.scene.setAttribute('preserveAspectRatio','xMidYMid meet');
    this.scene.style.display='block';
    this.scene.style.background='transparent';
    this.sceneBox.appendChild(this.scene);

    // Phase plane (Canvas)
    if (this.o.showPhasePlane){
      this.phaseBox = this.grid.frame({ w:this.o.phaseSize, h:this.o.phaseSize });
      this.phaseCanvas = document.createElement('canvas');
      this.phaseCanvas.style.width = `${this.o.phaseSize}px`;
      this.phaseCanvas.style.height = `${this.o.phaseSize}px`;
      this.phaseCanvas.style.display='block';
      this.phaseCanvas.style.background='transparent';
      this.phaseBox.appendChild(this.phaseCanvas);
    }

    this._buildSceneElements();
    this._rebuildEnsemble();
    this._drawPhase();
  }

  /* ---------- Controls (toolbar + sliders) ---------- */
  _buildControls(container){
    const host = document.createElement('div');
    host.className = 'd3-widgets';
    container.appendChild(host);

    const w = Math.max(this.o.width, 280);
    const dy = 40;           // slider row spacing
    const y0 = 24;           // toolbar center Y
    const y1 = 70;           // first slider center Y

    // Toolbar (optional)
    if (this.o.showButtons) {
      const toolbar = document.createElementNS('http://www.w3.org/2000/svg','svg');
      toolbar.setAttribute('width', w);
      toolbar.setAttribute('height', 44);
      toolbar.style.display='block';
      host.appendChild(toolbar);

      // Play/Pause
      this._playBtn = createSymbolButton(toolbar, {
        x: 18, y: y0, size: 16, symbol: this.running ? 'pause' : 'play',
        onClick: (_ev, api) => {
          if (this.running) { this.pause(); api.setSymbol('play'); }
          else { this.play(); api.setSymbol('pause'); }
        }
      });

      // Reload (reseeds & clears trails)
      createSymbolButton(toolbar, {
        x: 52, y: y0, size: 16, symbol: 'reload',
        onClick: () => { this.reset(); }
      });

      // Trails toggle at right
      const trailsT = toggle().id('trails').size(10)
        .position({ x: w - 20, y: y0 })
        .label(null)
        .value(this.o.showTrails?1:0)
        .update(()=>{
          this.o.showTrails = !!trailsT.value();
          for (const path of this.traces ?? []) path.style.display = this.o.showTrails ? '' : 'none';
          if (!this.o.showTrails) { for (const p of this.ensemble){ p.path.length=0; p.phHead=0; p.phCount=0; } }
          this._drawPhase();
        });
      toolbar.appendChild(toggleElement(trailsT));

      const tLbl = document.createElementNS('http://www.w3.org/2000/svg','text');
      tLbl.textContent = 'Trails';
      tLbl.setAttribute('x', w - 20);
      tLbl.setAttribute('y', 44);
      tLbl.setAttribute('font-size','12');
      tLbl.setAttribute('fill','var(--color-text)');
      tLbl.setAttribute('text-anchor','middle');
      toolbar.appendChild(tLbl);
    }

    // Sliders block
    const slidersSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
    const totalRows = 6;
    slidersSVG.setAttribute('width', w);
    slidersSVG.setAttribute('height', y1 + (totalRows-1)*dy + 24);
    slidersSVG.style.display='block';
    host.appendChild(slidersSVG);

    // N (integer)
    const countS = slider().id('count').label('N').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*0 })
      .range([1, 50])
      .value(Math.round(this.o.ensembleCount))
      .show(true)
      .update(()=>{
        const v = Math.round(countS.value());
        if (v !== this.o.ensembleCount) {
          this.o.ensembleCount = v;
          nVal.textContent = String(v);
        }
        if (countS.value() !== v) countS.value(v);
      })
      .update_end(()=>{ this._rebuildEnsemble(); this.render(); });
    slidersSVG.appendChild(sliderElement(countS));
    const nVal = document.createElementNS('http://www.w3.org/2000/svg','text');
    nVal.textContent = String(Math.round(this.o.ensembleCount,1)); // check if right otherwise remove ,1
    nVal.setAttribute('x', 20 + (w - 40));
    nVal.setAttribute('y', y1 + dy*0 - 12);
    nVal.setAttribute('font-size', '12');
    nVal.setAttribute('fill', 'var(--color-text)');
    nVal.setAttribute('text-anchor', 'end');
    slidersSVG.appendChild(nVal);

    // σ (spread)
    const spreadS = slider().id('spread').label('σ').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*1 })
      .range([0, 0.2])
      .value(this.o.spreadSigma)
      .show(true)
      .update(()=>{ this.o.spreadSigma = spreadS.value(); this._reseedEnsemble(true); this.render(); });
    slidersSVG.appendChild(sliderElement(spreadS));

    // L1
    const L1S = slider().id('L1').label('L1').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*2 })
      .range([0.5, 2.0])
      .value(this.params.L1)
      .show(true)
      .update(()=>{ this.params.L1 = L1S.value(); this.render(); });
    slidersSVG.appendChild(sliderElement(L1S));

    // L2
    const L2S = slider().id('L2').label('L2').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*3 })
      .range([0.5, 2.0])
      .value(this.params.L2)
      .show(true)
      .update(()=>{ this.params.L2 = L2S.value(); this.render(); });
    slidersSVG.appendChild(sliderElement(L2S));

    // m1
    const m1S = slider().id('m1').label('m1').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*4 })
      .range([0.1, 5.0])
      .value(this.params.m1)
      .show(true)
      .update(()=>{ this.params.m1 = m1S.value(); });
    slidersSVG.appendChild(sliderElement(m1S));

    // m2
    const m2S = slider().id('m2').label('m2').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: y1 + dy*5 })
      .range([0.1, 5.0])
      .value(this.params.m2)
      .show(true)
      .update(()=>{ this.params.m2 = m2S.value(); });
    slidersSVG.appendChild(sliderElement(m2S));
  }

  /* ---------- Scene ---------- */
  _buildSceneElements(){
    if (this.o.enableClickIK){
      this.scene.addEventListener('click',ev=>{
        const pt=this._svgPoint(this.scene,ev.clientX,ev.clientY);
        const xm=pt.x/this.kPix, ym=pt.y/this.kPix;
        const {L1,L2}=this.params; const r=Math.hypot(xm,ym);
        const rc=clamp(r,1e-6,L1+L2-1e-6);
        const cos2=clamp((rc*rc-L1*L1-L2*L2)/(2*L1*L2),-1,1);
        const t2rel=Math.acos(cos2), phi=Math.atan2(xm,ym);
        const k=Math.atan2(L2*Math.sin(t2rel),L1+L2*Math.cos(t2rel));
        const t1=modAngle(phi-k), t2=modAngle(t1+t2rel);
        this.initPose={t1,t2,w1:0,w2:0};
        this._reseedEnsemble(true);
        this.render();
      });
    }
  }

  /* ---------- Ensemble ---------- */
  _rebuildEnsemble(){
    while(this.scene.firstChild) this.scene.removeChild(this.scene.firstChild);
    this.ensemble=[]; this.rods=[]; this.bobs=[]; this.traces=[];
    const N=this.o.ensembleCount;

    for(let i=0;i<N;i++){
      const color=`hsl(${(i*137.508)%360} 70% 35%)`;

      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      this.scene.appendChild(g);

      const r1=document.createElementNS('http://www.w3.org/2000/svg','line');
      const r2=document.createElementNS('http://www.w3.org/2000/svg','line');
      r1.setAttribute('stroke',color); r2.setAttribute('stroke',color);
      r1.setAttribute('stroke-width','3.0'); r2.setAttribute('stroke-width','3.0');

      const b1=document.createElementNS('http://www.w3.org/2000/svg','circle');
      const b2=document.createElementNS('http://www.w3.org/2000/svg','circle');
      b1.setAttribute('r','5.5'); b2.setAttribute('r','5.5');
      b1.setAttribute('fill',color); b2.setAttribute('fill',color);

      g.append(r1,r2,b1,b2);

      const trail=document.createElementNS('http://www.w3.org/2000/svg','path');
      trail.setAttribute('fill','none'); trail.setAttribute('stroke',color);
      trail.setAttribute('stroke-opacity','0.35'); trail.setAttribute('stroke-width','3.0');
      if(!this.o.showTrails) trail.style.display='none';
      this.scene.appendChild(trail);

      this.rods.push(r1,r2); this.bobs.push(b1,b2); this.traces.push(trail);

      const p={ t1:Math.PI/2, t2:Math.PI/2, w1:0, w2:0, color,
        path:[], phT1:new Float32Array(2000), phT2:new Float32Array(2000),
        phHead:0, phCount:0 };
      this.ensemble.push(p);
    }
    this._reseedEnsemble(true);
  }

  _reseedEnsemble(resetPaths=false){
    const base=this.initPose||{t1:Math.PI/2,t2:Math.PI/2,w1:0,w2:0};
    const s=this.o.spreadSigma;
    for(const p of this.ensemble){
      p.t1=modAngle(base.t1+s*randn());
      p.t2=modAngle(base.t2+s*randn());
      p.w1=0; p.w2=0;
      if(resetPaths){ p.path.length=0; p.phHead=0; p.phCount=0; }
    }
  }

  reset(){
    this._reseedEnsemble(true);
    this.render();
  }

  /* ---------- Physics ---------- */
  _step(){
    for(const p of this.ensemble){
      const y0=[p.t1,p.w1,p.t2,p.w2];
      const k1=this._deriv(y0);
      const y1=y0.map((v,i)=>v+0.5*this.dt*k1[i]);
      const k2=this._deriv(y1);
      const y2=y0.map((v,i)=>v+0.5*this.dt*k2[i]);
      const k3=this._deriv(y2);
      const y3=y0.map((v,i)=>v+this.dt*k3[i]);
      const k4=this._deriv(y3);
      const yn=y0.map((v,i)=> v+this.dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
      p.t1=modAngle(yn[0]); p.w1=Math.max(Math.min(yn[1],200),-200);
      p.t2=modAngle(yn[2]); p.w2=Math.max(Math.min(yn[3],200),-200);
    }
  }
  _deriv([t1,w1,t2,w2]){
    const {m1,m2,L1,L2,g}=this.params;
    const c12=Math.cos(t1-t2), s12=Math.sin(t1-t2);
    const den0=2*m1+m2-m2*Math.cos(2*t1-2*t2);
    const den=Math.abs(den0)<1e-6?(den0>=0?1e-6:-1e-6):den0;
    const dw1=(-g*(2*m1+m2)*Math.sin(t1)-m2*g*Math.sin(t1-2*t2)-2*s12*m2*(w2*w2*L2+w1*w1*L1*c12))/(L1*den);
    const dw2=(2*s12*( w1*w1*L1*(m1+m2) + g*(m1+m2)*Math.cos(t1) + w2*w2*L2*m2*c12 ))/(L2*den);
    return [w1,dw1,w2,dw2];
  }

  /* ---------- Render ---------- */
  render(){
    const {L1,L2}=this.params;
    let ri=0,bi=0,ti=0;
    for(const p of this.ensemble){
      const x1=L1*Math.sin(p.t1)*this.kPix, y1=L1*Math.cos(p.t1)*this.kPix;
      const x2=x1+L2*Math.sin(p.t2)*this.kPix, y2=y1+L2*Math.cos(p.t2)*this.kPix;

      const r1=this.rods[ri++], r2=this.rods[ri++], b1=this.bobs[bi++], b2=this.bobs[bi++];
      r1.setAttribute('x1',0); r1.setAttribute('y1',0); r1.setAttribute('x2',x1); r1.setAttribute('y2',y1);
      r2.setAttribute('x1',x1); r2.setAttribute('y1',y1); r2.setAttribute('x2',x2); r2.setAttribute('y2',y2);
      b1.setAttribute('cx',x1); b1.setAttribute('cy',y1);
      b2.setAttribute('cx',x2); b2.setAttribute('cy',y2);

      if(this.o.showTrails){
        p.path.push([x2,y2]); if(p.path.length>800) p.path.shift();
        this.traces[ti++]?.setAttribute('d', p.path.map((pt,i)=>(i?'L':'M')+pt[0].toFixed(1)+','+pt[1].toFixed(1)).join(' '));
        if(this.phaseCanvas){
          const C=p.phT1.length;
          p.phT1[p.phHead]=p.t1; p.phT2[p.phHead]=p.t2;
          p.phHead=(p.phHead+1)%C;
          p.phCount=Math.min(p.phCount+1,C);
        }
      } else {
        if(p.path.length) p.path.length=0;
        this.traces[ti++]?.setAttribute('d','');
        if(this.phaseCanvas){ p.phHead=0; p.phCount=0; }
      }
    }
    this._drawPhase();
  }

  /* ---------- Phase plane draw (centered, with θ₁ / θ₂ labels) ---------- */
  _drawPhase(){
    if(!this.phaseCanvas) return;
    const cvs=this.phaseCanvas, ctx=cvs.getContext('2d');

    const cssW=cvs.clientWidth||parseFloat(getComputedStyle(cvs).width)||this.o.phaseSize;
    const cssH=cvs.clientHeight||parseFloat(getComputedStyle(cvs).height)||this.o.phaseSize;
    resizeCanvasToDisplaySize(cvs);

    const scaleX=cvs.width/cssW, scaleY=cvs.height/cssH;
    ctx.setTransform(scaleX,0,0,scaleY,0,0);

    ctx.fillStyle='#ffffff01'; ctx.fillRect(0,0,cssW,cssH);

    // inner frame & mapping
    const m=18, x0=m, y0=m, x1=cssW-m, y1=cssH-m;
    const W=x1-x0, H=y1-y0;
    const A0=-Math.PI, A1=Math.PI, B0=-Math.PI, B1=Math.PI;
    const mapX=th=> x0 + ((th-A0)/(A1-A0))*W;
    const mapY=ph=> y1 - ((ph-B0)/(B1-B0))*H;

    // axes
    ctx.strokeStyle='#777'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(mapX(0), y0); ctx.lineTo(mapX(0), y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, mapY(0)); ctx.lineTo(x1, mapY(0)); ctx.stroke();

    // ticks
    ctx.fillStyle='#666'; ctx.font='11px ui-sans-serif, system-ui, -apple-system';
    const ticks=[-Math.PI,-Math.PI/2,0,Math.PI/2,Math.PI];
    for(const t of ticks){
      const xx=mapX(t);
      ctx.beginPath(); ctx.moveTo(xx, mapY(0)-3); ctx.lineTo(xx, mapY(0)+3); ctx.stroke();
      const yy=mapY(t);
      ctx.beginPath(); ctx.moveTo(mapX(0)-3, yy); ctx.lineTo(mapX(0)+3, yy); ctx.stroke();
    }
    // axis labels θ₁ (x) and θ₂ (y)
    ctx.fillStyle='#333'; ctx.font='12px ui-sans-serif, system-ui, -apple-system';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('θ₁', (x0+x1)/2, y1 + 6);
    ctx.save();
    ctx.translate(x0 - 10, (y0+y1)/2);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('θ₂', 0, 0);
    ctx.restore();

    if(!this.o.showTrails) return;

    const wrapA=a=>{ a=(a+Math.PI)%TAU; if(a<0)a+=TAU; return a-Math.PI; };
    const unwrap=d=> (d>Math.PI? d-TAU : (d<=-Math.PI? d+TAU : d));

    const drawWrappedSegment=(a0,b0,a1,b1,color)=>{
      let sx=wrapA(a0), sy=wrapA(b0);
      let ex=sx+unwrap(a1-a0);
      let ey=sy+unwrap(b1-b0);
      for(let iter=0; iter<6; iter++){
        const startInside=(sx>=A0&&sx<=A1&&sy>=B0&&sy<=B1);
        const endInside  =(ex>=A0&&ex<=A1&&ey>=B0&&ey<=B1);
        if(startInside&&endInside){
          ctx.beginPath(); ctx.moveTo(mapX(sx), mapY(sy)); ctx.lineTo(mapX(ex), mapY(ey));
          ctx.strokeStyle=color; ctx.lineWidth=3; ctx.stroke(); return;
        }
        const dx=ex-sx, dy=ey-sy;
        if(Math.abs(dx)<1e-12 && Math.abs(dy)<1e-12) return;

        let tHit=1.1, hit='';
        if(dx>0){ const t=(A1-sx)/dx; if(t>1e-8&&t<tHit){ tHit=t; hit='x+'; } }
        else if(dx<0){ const t=(A0-sx)/dx; if(t>1e-8&&t<tHit){ tHit=t; hit='x-'; } }
        if(dy>0){ const t=(B1-sy)/dy; if(t>1e-8&&t<tHit){ tHit=t; hit='y+'; } }
        else if(dy<0){ const t=(B0-sy)/dy; if(t>1e-8&&t<tHit){ tHit=t; hit='y-'; } }

        if(tHit>1||!hit){
          if(!startInside){
            const sxN=wrapA(sx), syN=wrapA(sy);
            const shx=sxN-sx, shy=syN-sy;
            sx=sxN; sy=syN; ex+=shx; ey+=shy; continue;
          }
          return;
        }

        const cx=sx+tHit*dx, cy=sy+tHit*dy;
        ctx.beginPath();
        ctx.moveTo(mapX(Math.max(A0,Math.min(A1,sx))), mapY(Math.max(B0,Math.min(B1,sy))));
        ctx.lineTo(mapX(Math.max(A0,Math.min(A1,cx))), mapY(Math.max(B0,Math.min(B1,cy))));
        ctx.strokeStyle=color; ctx.lineWidth=3; ctx.stroke();

        if(hit.startsWith('x')){
          const shift=(hit==='x+'?-TAU:TAU);
          sx=cx+shift;  sy=cy;   ex=ex+shift;  ey=ey;
        } else {
          const shift=(hit==='y+'?-TAU:TAU);
          sx=cx;        sy=cy+shift; ex=ex;        ey=ey+shift;
        }
      }
    };

    const N=this.ensemble.length;
    for(let i=0;i<N;i++){
      const p=this.ensemble[i];
      const C=p.phT1.length, n=p.phCount;
      if(n<2) continue;
      const hue=Math.round(360*(N<=1?0.5:i/(N-1)));
      const col=`hsla(${hue} 70% 35% / 0.6)`;
      let idx=(p.phHead-n+C)%C;
      let aPrev=p.phT1[idx], bPrev=p.phT2[idx];
      for(let k=1;k<n;k++){
        idx=(idx+1)%C;
        const a=p.phT1[idx], b=p.phT2[idx];
        drawWrappedSegment(aPrev,bPrev,a,b,col);
        aPrev=a; bPrev=b;
      }
    }
  }

  /* ---------- Loop ---------- */
  play(){ if(this.running) return; this.running=true; this._lastTs=0; this._raf=requestAnimationFrame(t=>this._loop(t)); }
  pause(){ this.running=false; }
  _loop(ts){
    if(!this._lastTs) this._lastTs=ts;
    let acc=(ts-this._lastTs)/1000; this._lastTs=ts;
    acc=Math.min(acc,0.05);
    while(acc>0){ this._step(); acc-=this.dt; }
    this.render();
    if(this.running) this._raf=requestAnimationFrame(t=>this._loop(t));
  }

  _svgPoint(svg,cx,cy){
    const pt=svg.createSVGPoint(); pt.x=cx; pt.y=cy;
    const m=svg.getScreenCTM().inverse();
    return pt.matrixTransform(m);
  }
}