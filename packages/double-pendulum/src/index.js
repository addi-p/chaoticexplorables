// packages/double-pendulum/src/index.js
// Double pendulum explorable using your widgets and grid layout.
// Controls: roomy, play as a single toggle, N is integer (live-rounded).

import slider from '../../widgets/src/slider.js';
import sliderElement from '../../widgets/src/sliderElement.js';
import toggle from '../../widgets/src/toggle.js';
import toggleElement from '../../widgets/src/toggleElement.js';
import iconFor from '../../widgets/src/button-symbols.js'; // kept in case you later want icon buttons
import { Grid } from '../../widgets/src/gridd.js';

// Ensure plain (non-modules) CSS so widget custom properties apply
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

export class DoublePendulumExplorable {
  constructor(mount, opts = {}) {
    this.o = Object.assign({
      width: 200,
      sceneSize: 200,
      phaseSize: 200,
      showControls: true,
      showPhasePlane: true,
      showTrails: true,
      enableClickIK: true,
      ensembleCount: 5,
      spreadSigma: 0.02,
      params: { m1:1, m2:1, L1:1, L2:1, g:9.81 }
    }, opts);

    this.grid = new Grid(mount, { width: this.o.width, gap: 10 });

    if (this.o.showControls) this._buildControls(this.grid.slot());

    this.sceneBox = this.grid.frame({ w:this.o.sceneSize, h:this.o.sceneSize });
    this.scene = document.createElementNS('http://www.w3.org/2000/svg','svg');
    this.scene.setAttribute('width', this.o.sceneSize);
    this.scene.setAttribute('height', this.o.sceneSize);
    this.scene.setAttribute('viewBox','-220 -220 440 440');
    this.scene.setAttribute('preserveAspectRatio','xMidYMid meet');
    this.scene.style.display='block';
    this.scene.style.background='#fff';
    this.sceneBox.appendChild(this.scene);

    if (this.o.showPhasePlane){
      this.phaseBox = this.grid.frame({ w:this.o.phaseSize, h:this.o.phaseSize });
      this.phaseCanvas = document.createElement('canvas');
      this.phaseCanvas.style.width = `${this.o.phaseSize}px`;
      this.phaseCanvas.style.height = `${this.o.phaseSize}px`;
      this.phaseCanvas.style.display='block';
      this.phaseCanvas.style.background='#fff';
      this.phaseBox.appendChild(this.phaseCanvas);
    }

    this.params = {...this.o.params};
    this.kPix = 90;
    this.dt = 1/240;
    this.running = false;

    this._buildSceneElements();
    this._rebuildEnsemble();
    this._drawPhase();
  }

  /* ---------- Controls (roomy, clear, play is a single toggle) ---------- */
  _buildControls(container){
    const host = document.createElement('div');
    host.className = 'd3-widgets';
    container.appendChild(host);

    // Taller controls surface for breathing room
    const w = Math.max(this.o.width, 220);
    const h = 140;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.style.display = 'block';
    host.appendChild(svg);

    // Row 1: Play (left) — *toggle only*, no extra icon overlay
    const playTog = toggle().id('playpause').size(10)
      .position({ x: 20, y: 28 })
      .label(null)
      .value(0)
      .update(()=>{ playTog.value()?this.play():this.pause(); });
    svg.appendChild(toggleElement(playTog));

    // Row 1: Trails (right)
    const trailsT = toggle().id('trails').size(10)
      .position({ x: w - 20, y: 28 })
      .label(null)
      .value(this.o.showTrails?1:0)
      .update(()=>{
        this.o.showTrails = !!trailsT.value();
        for(const path of this.traces ?? []) path.style.display = this.o.showTrails ? '' : 'none';
        if (!this.o.showTrails) { for (const p of this.ensemble){ p.path.length=0; p.phHead=0; p.phCount=0; } }
        this._drawPhase();
      });
    svg.appendChild(toggleElement(trailsT));

    // Group title text for the two toggles (small, unobtrusive)
    const label = (txt, x, y) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg','text');
      t.textContent = txt;
      t.setAttribute('x', x);
      t.setAttribute('y', y);
      t.setAttribute('font-size', '12');
      t.setAttribute('fill', 'var(--color-text)');
      t.setAttribute('text-anchor', 'middle');
      return t;
    };
    svg.appendChild(label('Play/Pause', 20, 46));
    svg.appendChild(label('Trails', w - 20, 46));

    // Row 2: N slider (integer only, with live integer display)
    const countS = slider().id('count').label('N').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: 82 })
      .range([1, 50])
      .value(Math.round(this.o.ensembleCount))
      .show(true)
      .update(()=>{
        const v = Math.round(countS.value());
        if (v !== this.o.ensembleCount) {
          this.o.ensembleCount = v;
          // update the readout immediately so user never sees 3.8, etc.
          nVal.textContent = String(v);
        }
        // also snap the slider’s internal value so the handle sits on integers
        if (countS.value() !== v) countS.value(v);
      })
      .update_end(()=>{
        // Rebuild ensemble only once user releases drag
        this._rebuildEnsemble();
        this.render();
      });
    svg.appendChild(sliderElement(countS));

    // Integer readout on the right of the N slider
    const nVal = document.createElementNS('http://www.w3.org/2000/svg','text');
    nVal.textContent = String(Math.round(this.o.ensembleCount));
    nVal.setAttribute('x', 20 + (w - 40));
    nVal.setAttribute('y', 82 - 10);
    nVal.setAttribute('font-size', '12');
    nVal.setAttribute('fill', 'var(--color-text)');
    nVal.setAttribute('text-anchor', 'end');
    svg.appendChild(nVal);

    // Row 3: σ slider (spread)
    const spreadS = slider().id('spread').label('σ').size(w - 40).girth(8).knob(7)
      .position({ x: 20, y: 118 })
      .range([0, 0.2])
      .value(this.o.spreadSigma)
      .show(true)
      .update(()=>{
        this.o.spreadSigma = spreadS.value();
        this._reseedEnsemble(true);
        this.render();
      });
    svg.appendChild(sliderElement(spreadS));
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
      r1.setAttribute('stroke-width','1.25'); r2.setAttribute('stroke-width','1.25');

      const b1=document.createElementNS('http://www.w3.org/2000/svg','circle');
      const b2=document.createElementNS('http://www.w3.org/2000/svg','circle');
      b1.setAttribute('r','2.5'); b2.setAttribute('r','2.5');
      b1.setAttribute('fill',color); b2.setAttribute('fill',color);

      g.append(r1,r2,b1,b2);

      const trail=document.createElementNS('http://www.w3.org/2000/svg','path');
      trail.setAttribute('fill','none'); trail.setAttribute('stroke',color);
      trail.setAttribute('stroke-opacity','0.35'); trail.setAttribute('stroke-width','0.9');
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

  /* ---------- Phase draw (CSS-pixel correct, centered) ---------- */
  _drawPhase(){
    if(!this.phaseCanvas) return;
    const cvs=this.phaseCanvas, ctx=cvs.getContext('2d');

    const cssW=cvs.clientWidth||parseFloat(getComputedStyle(cvs).width)||this.o.phaseSize;
    const cssH=cvs.clientHeight||parseFloat(getComputedStyle(cvs).height)||this.o.phaseSize;
    resizeCanvasToDisplaySize(cvs);

    const scaleX=cvs.width/cssW, scaleY=cvs.height/cssH;
    ctx.setTransform(scaleX,0,0,scaleY,0,0);

    ctx.fillStyle='#fff'; ctx.fillRect(0,0,cssW,cssH);

    const m=18, x0=m, y0=m, x1=cssW-m, y1=cssH-m;
    const W=x1-x0, H=y1-y0;
    const A0=-Math.PI, A1=Math.PI, B0=-Math.PI, B1=Math.PI;
    const mapX=th=> x0 + ((th-A0)/(A1-A0))*W;
    const mapY=ph=> y1 - ((ph-B0)/(B1-B0))*H;

    ctx.strokeStyle='#777'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(mapX(0), y0); ctx.lineTo(mapX(0), y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, mapY(0)); ctx.lineTo(x1, mapY(0)); ctx.stroke();

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
          ctx.strokeStyle=color; ctx.lineWidth=1; ctx.stroke(); return;
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

        const cx=sx+tHit*dx, cy=sy*tHit+ (1-tHit)*sy + tHit*dy; // cy = sy + tHit*dy
        // correct cy calc:
        const cyFix = sy + tHit*dy;

        ctx.beginPath();
        ctx.moveTo(mapX(Math.max(A0,Math.min(A1,sx))), mapY(Math.max(B0,Math.min(B1,sy))));
        ctx.lineTo(mapX(Math.max(A0,Math.min(A1, sx + tHit*dx))), mapY(Math.max(B0,Math.min(B1, cyFix))));
        ctx.strokeStyle=color; ctx.lineWidth=1; ctx.stroke();

        if(hit.startsWith('x')){
          const shift=(hit==='x+'?-TAU:TAU);
          sx=sx + tHit*dx + shift;  sy=cyFix;   ex=ex + shift;  ey=ey;
        } else {
          const shift=(hit==='y+'?-TAU:TAU);
          sx=sx + tHit*dx;          sy=cyFix + shift; ex=ex;        ey=ey + shift;
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