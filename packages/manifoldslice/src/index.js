// public/packages/lorenz/src/index.js
// Default export: Explorable class for ExplorableCard

import slider from '/packages/widgets/src/slider.js';
import sliderElement from '/packages/widgets/src/sliderElement.js';
import dropdown from '/packages/widgets/src/dropdown.js';
import dropdownElement from '/packages/widgets/src/dropdownElement.js';

// ---------- numerics ----------
const lorenz = (σ,ρ,β)=>([x,y,z])=>[ σ*(y-x), x*(ρ-z)-y, x*y-β*z ];
function rk4(f, y, h){
  const k1=f(y);
  const y2=[y[0]+0.5*h*k1[0], y[1]+0.5*h*k1[1], y[2]+0.5*h*k1[2]];
  const k2=f(y2);
  const y3=[y[0]+0.5*h*k2[0], y[1]+0.5*h*k2[1], y[2]+0.5*h*k2[2]];
  const k3=f(y3);
  const y4=[y[0]+h*k3[0], y[1]+h*k3[1], y[2]+h*k3[2]];
  const k4=f(y4);
  y[0]+= (h/6)*(k1[0]+2*k2[0]+2*k3[0]+k4[0]);
  y[1]+= (h/6)*(k1[1]+2*k2[1]+2*k3[1]+k4[1]);
  y[2]+= (h/6)*(k1[2]+2*k2[2]+2*k3[2]+k4[2]);
  return y;
}
const norm=v=>{const m=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/m,v[1]/m,v[2]/m];};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const scale=(v,s)=>[s*v[0],s*v[1],s*v[2]];

// eigen stuff at origin (closed form)
function eigOrigin(σ,ρ,β){
  const b=σ+1, c=σ*(1-ρ), D=b*b-4*c, sD=Math.sqrt(D);
  const λ1=(-b+sD)/2, λ2=(-b-sD)/2;
  const vu=[σ, σ+Math.max(λ1,λ2), 0];     // unstable dir in x–y block
  const vs=[σ, σ+Math.min(λ1,λ2), 0];     // stable dir in x–y block
  const vz=[0,0,1];
  return {vu: norm(vu), vs: norm(vs), vz};
}
// Jacobian + simple 3x3 solve (for stable direction at C±)
function jac([x,y,z],σ,ρ,β){ return [[-σ, σ, 0],[ρ-z, -1, -x],[y, x, -β]]; }
function solve3(A,b){
  let a=[A[0].slice(),A[1].slice(),A[2].slice()], r=b.slice();
  for(let k=0;k<3;k++){
    const piv=a[k][k]||1e-12;
    for(let j=k;j<3;j++) a[k][j]/=piv; r[k]/=piv;
    for(let i=0;i<3;i++) if(i!==k){
      const f=a[i][k]; for(let j=k;j<3;j++) a[i][j]-=f*a[k][j]; r[i]-=f*r[k];
    }
  }
  return r;
}
function stableDirAt(p,σ,ρ,β){ // inverse iteration on J^T
  let v=[0,0,1];
  for(let i=0;i<12;i++){
    const J=jac(p,σ,ρ,β), JT=[[J[0][0],J[1][0],J[2][0]],[J[0][1],J[1][1],J[2][1]],[J[0][2],J[1][2],J[2][2]]];
    v = norm(solve3(JT, v));
  }
  return v;
}

// datasets
function integrateAttractor({σ,ρ,β, N=200000, dt=0.005, burn=3000, seed=[1,1,1]}){
  const f=lorenz(σ,ρ,β); let y=seed.slice();
  for(let i=0;i<burn;i++) rk4(f,y,dt);
  const P=new Float32Array(N*3);
  for(let i=0;i<N;i++){ rk4(f,y,dt); P[3*i]=y[0];P[3*i+1]=y[1];P[3*i+2]=y[2]; }
  return P;
}
function traceWuO({σ,ρ,β, ε=1e-3, T=80, dt=0.004}){
  const f=lorenz(σ,ρ,β), e=eigOrigin(σ,ρ,β).vu, steps=Math.floor(T/dt), out=[];
  for(const sgn of [+1,-1]){
    let y=scale(e, sgn*ε);
    for(let i=0;i<steps;i++){ rk4(f,y,dt); out.push(y[0],y[1],y[2]); if(Math.hypot(...y)>1e4) break; }
  }
  return new Float32Array(out);
}
function traceWsO({σ,ρ,β, ε=1e-3, rings=16, rays=160, T=30, dt=0.004}){
  const {vs,vz}=eigOrigin(σ,ρ,β), e1=vs, e2=norm(vz);
  const f=lorenz(σ,ρ,β), steps=Math.floor(T/dt), pts=[];
  for(let r=1;r<=rings;r++){
    const rad=ε*(r/rings);
    for(let k=0;k<rays;k++){
      const th=2*Math.PI*k/rays;
      let y=add( scale(e1,rad*Math.cos(th)), scale(e2,rad*Math.sin(th)) );
      for(let i=0;i<steps;i++){ rk4(f,y,-dt); pts.push(y[0],y[1],y[2]); if(Math.hypot(...y)>1e4) break; }
    }
  }
  return new Float32Array(pts);
}
function traceWuCp({σ,ρ,β, sign=+1, ε=1e-3, T=20, dt=0.004, ringPts=128}){
  const s=Math.sqrt(β*(ρ-1)), Cp=[sign*s,sign*s,ρ-1];
  const es=stableDirAt(Cp,σ,ρ,β);
  const t0=Math.abs(es[2])<0.9?[0,0,1]:[0,1,0];
  const e1=norm(cross(es,t0)), e2=norm(cross(es,e1));
  const f=lorenz(σ,ρ,β), steps=Math.floor(T/dt), pts=[], rings=14;
  for(let r=1;r<=rings;r++){
    const rad=ε*(r/rings);
    for(let k=0;k<ringPts;k++){
      const th=2*Math.PI*k/ringPts;
      let y=[ Cp[0]+rad*(Math.cos(th)*e1[0]+Math.sin(th)*e2[0]),
              Cp[1]+rad*(Math.cos(th)*e1[1]+Math.sin(th)*e2[1]),
              Cp[2]+rad*(Math.cos(th)*e1[2]+Math.sin(th)*e2[2]) ];
      for(let i=0;i<steps;i++){ rk4(f,y,dt); pts.push(y[0],y[1],y[2]); if(Math.hypot(...y)>1e4) break; }
    }
  }
  return new Float32Array(pts);
}

// ---------- drawing ----------
function boundsXZ(pts){
  let minx=1e9,maxx=-1e9,minz=1e9,maxz=-1e9;
  for(let i=0;i<pts.length;i+=3){ const x=pts[i], z=pts[i+2];
    if(x<minx)minx=x; if(x>maxx)maxx=x; if(z<minz)minz=z; if(z>maxz)maxz=z;
  }
  return {minx,maxx,minz,maxz};
}
function drawCloud(ctx, pts, fit, alpha){
  const {sx,ox,oy}=fit;
  ctx.globalAlpha=alpha;
  for(let i=0;i<pts.length;i+=3){
    const x=ox+sx*pts[i], y=oy-sx*pts[i+2];
    ctx.fillRect(x,y,1,1);
  }
  ctx.globalAlpha=1;
}

// ---------- Explorable class ----------
export default class LorenzManifoldsExplorable {
  constructor(mount, o={}){
    this.o = Object.assign({
      // ExplorableCard layout knobs:
      controlsWidth: 400, controlsMinWidth: 200, controlsPadding: 10,
      canvasWidthPx: 550,
      // Lorenz:
      sigma:10, rho:28, beta:8/3, dt:0.004,
      nAttractor: 200000,
      // visibility:
      showAttractor:true, showWuO:true, showWsO:true, showWuCp:true
    }, o);

    // structure expected by ExplorableCard: just fill the slot (mount)
    this.root = mount;
    this.root.innerHTML='';
    this.root.style.display='grid';
    this.root.style.gridTemplateColumns = `minmax(${this.o.controlsMinWidth}px, ${this.o.controlsWidth}px) auto`;
    this.root.style.gap = (this.o.rowGap ?? 6) + 'px';

    // controls
    const controls=document.createElement('div');
    controls.classList.add('d3-widgets');
    controls.style.display='grid';
    controls.style.gap=(this.o.sliderGap ?? 6)+'px';
    controls.style.padding=this.o.controlsPadding+'px';
    controls.style.overflow=this.o.controlsOverflow || 'visible';
    this.root.appendChild(controls);

    // canvas
    const canvas=document.createElement('canvas');
    canvas.width = this.o.canvasWidthPx || 550;
    canvas.height = Math.round((this.o.canvasWidthPx||550)*0.9);
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.style.background='#fff';
    this.root.appendChild(canvas);
    this.ctx=canvas.getContext('2d'); this.ctx.fillStyle='#000';
    this.canvas=canvas;

    // widgets
    const sσ = slider().label('σ').range([0,30]).value(this.o.sigma).update(v=>{this.o.sigma=v; this._regen();});
    const sρ = slider().label('ρ').range([0,60]).value(this.o.rho).update(v=>{this.o.rho=v; this._regen();});
    const sβ = slider().label('β').range([0.5,4]).value(this.o.beta).update(v=>{this.o.beta=v; this._regen();});
    controls.append(sliderElement(sσ), sliderElement(sρ), sliderElement(sβ));

    const dd = dropdown().label('Show').options([
      {label:'All', value:'all'},
      {label:'Attractor only', value:'A'},
      {label:'Manifolds only', value:'M'}
    ]).value('all').update(()=>{
      const v=dd.value();
      this.o.showAttractor = v!=='M';
      this.o.showWuO = this.o.showWsO = this.o.showWuCp = v!=='A';
      this._draw();
    });
    controls.append( dropdownElement(dd) );

    // compute + draw
    this._regen();
  }

  _regen(){
    const {sigma:σ, rho:ρ, beta:β, dt} = this.o;
    // datasets
    this.A   = this.o.showAttractor ? integrateAttractor({σ,ρ,β,N:this.o.nAttractor,dt}) : new Float32Array();
    this.WuO = this.o.showWuO ? traceWuO({σ,ρ,β,dt}) : new Float32Array();
    this.WsO = this.o.showWsO ? traceWsO({σ,ρ,β,dt}) : new Float32Array();
    const UcpPlus  = this.o.showWuCp ? traceWuCp({σ,ρ,β,sign:+1,dt}) : new Float32Array();
    const UcpMinus = this.o.showWuCp ? traceWuCp({σ,ρ,β,sign:-1,dt}) : new Float32Array();
    this.WuCp = new Float32Array(UcpPlus.length + UcpMinus.length);
    this.WuCp.set(UcpPlus,0); this.WuCp.set(UcpMinus,UcpPlus.length);

    // fit
    const ALL=[this.A,this.WuO,this.WsO,this.WuCp].filter(d=>d.length).reduce((a,b)=>new Float32Array([...a,...b]), new Float32Array());
    let {minx,maxx,minz,maxz}=boundsXZ(ALL.length?ALL:new Float32Array([ -30,0,-10, 30,0,50 ]));
    const sx = 0.92*Math.min(this.canvas.width/(maxx-minx), this.canvas.height/(maxz-minz));
    const ox = 0.5*this.canvas.width - sx*0.5*(minx+maxx);
    const oy = 0.85*this.canvas.height + sx*0.5*(minz+maxz);
    this.fit={sx,ox,oy};

    this._draw();
  }

  _draw(){
    const ctx=this.ctx, W=this.canvas.width, H=this.canvas.height;
    ctx.clearRect(0,0,W,H);
    // order: stable sheet (soft) -> attractor (soft) -> unstable curves (bold) -> unstable sheets (mid)
    if (this.o.showWsO)  drawCloud(ctx, this.WsO, this.fit, 0.28);
    if (this.o.showAttractor) drawCloud(ctx, this.A, this.fit, 0.12);
    if (this.o.showWuO)  drawCloud(ctx, this.WuO, this.fit, 0.85);
    if (this.o.showWuCp) drawCloud(ctx, this.WuCp, this.fit, 0.55);
    ctx.globalAlpha=1; ctx.fillText('projection: (x,z)', 10, 14);
  }

  play(){} pause(){} destroy(){ this.root.innerHTML=''; }
}