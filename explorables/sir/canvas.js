// SIR Canvas (fractions) — square canvas, thicker lines, now supports rewind()
import { createKit } from "../kit/explorable-kit.js";

export function mountSIRCanvas(container, options = {}) {
  if (!container) throw new Error("mountSIRCanvas: container is required");

  const opts = {
    theme: "auto", cssVars: {}, shadow: true,
    i0: 0.01, r0: 0.0, beta: 0.28, gamma: 0.1, days: 160, dt: 0.25,
    legend: true,
    ...options,
  };

  const kit  = createKit();
  const root = opts.shadow ? (container.shadowRoot || container.attachShadow({ mode: "open" })) : container;
  const host = kit.el("div", { class:"ek-theme", "data-theme": opts.theme });
  root.appendChild(host);
  kit.applyCss(host, opts.cssVars);

  const grid = kit.el("div", { class:"ek-grid" });
  if (opts.legend) {
    grid.appendChild(kit.el("div", { class:"ek-row" }, [
      kit.badge("Susceptible S"), kit.badge("Infected I"), kit.badge("Recovered R")
    ]));
  }
  const canvas = kit.el("canvas", { "aria-label": "SIR time series (fraction)" });
  grid.appendChild(canvas);
  host.appendChild(grid);

  const ctx = canvas.getContext("2d");
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  let state = { i0:opts.i0, r0:opts.r0, beta:opts.beta, gamma:opts.gamma, days:opts.days, dt:opts.dt };
  let series = null, anim = null, tCursor = 0;

  function simulate(p){
    const { i0, r0=0, beta, gamma, days, dt } = p;
    const steps = Math.ceil(days/dt);
    let S = 1 - i0 - r0, I = i0, R = r0;
    const t=new Array(steps), Sa=new Array(steps), Ia=new Array(steps), Ra=new Array(steps);
    for(let k=0;k<steps;k++){
      t[k]=k*dt; Sa[k]=S; Ia[k]=I; Ra[k]=R;
      const dS = -beta * S * I;
      const dI =  beta * S * I - gamma * I;
      const dR =  gamma * I;
      S += dS*dt; I += dI*dt; R += dR*dt;
      if (S < 0) S = 0; if (I < 0) I = 0; if (R < 0) R = 0;
      const sum = S+I+R; if (sum !== 1) { S/=sum; I/=sum; R/=sum; }
    }
    return { t, S:Sa, I:Ia, R:Ra };
  }

  function draw(data){
    const pad = { l: 40, r: 10, t: 10, b: 28 };
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);

    // hairline axes
    ctx.strokeStyle = getComputedStyle(host).getPropertyValue("--ek-rule");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l,H-pad.b); ctx.lineTo(W-pad.r,H-pad.b);
    ctx.moveTo(pad.l,pad.t);   ctx.lineTo(pad.l,H-pad.b);
    ctx.stroke();

    const xmax = data.t[data.t.length-1];
    const x = v => pad.l + (W-pad.l-pad.r)*(v/xmax);
    const y = v => (H-pad.b) - (H-pad.t-pad.b)*(v/1); // fraction 0..1

    function strokeSeries(arr, cssVar){
      ctx.strokeStyle = getComputedStyle(host).getPropertyValue(cssVar);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x(data.t[0]), y(arr[0]));
      for (let k=1;k<arr.length;k++) ctx.lineTo(x(data.t[k]), y(arr[k]));
      ctx.stroke();
    }
    strokeSeries(data.S, "--ek-s");
    strokeSeries(data.I, "--ek-i");
    strokeSeries(data.R, "--ek-r");

    // cursor
    const ti = clamp(Math.floor(tCursor/state.dt), 0, data.t.length-1);
    const cx = x(data.t[ti]);
    ctx.strokeStyle = getComputedStyle(host).getPropertyValue("--ek-muted");
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(cx,pad.t); ctx.lineTo(cx,H-pad.b); ctx.stroke();
    ctx.setLineDash([]);
  }

  function squareResize(){
    const rect = container.getBoundingClientRect();
    const sideCSS = Math.max(260, Math.floor(rect.width));
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width  = Math.round(sideCSS * ratio);
    canvas.height = Math.round(sideCSS * ratio);
    canvas.style.width  = sideCSS + "px";
    canvas.style.height = sideCSS + "px";
    if (series) draw(series);
  }

  function update(newParams) {
    if (newParams) Object.assign(state, newParams);
    series = simulate(state);
    draw(series);
  }

  function start(){ if (anim) return; tCursor=0; anim=requestAnimationFrame(tick); }
  function pause(){ if (!anim) return; cancelAnimationFrame(anim); anim=null; }
  function rewind(){ pause(); tCursor = 0; draw(series); }
  function tick(){ tCursor += state.dt*2; if (tCursor >= state.days) { pause(); tCursor=state.days; draw(series); } else { draw(series); anim=requestAnimationFrame(tick); } }

  const ro = new ResizeObserver(squareResize); ro.observe(container);
  update(); squareResize();

  return {
    getState: ()=>({ ...state }),
    setState: (patch)=>{ update(patch); },
    play: ()=>start(),
    pause: ()=>pause(),
    rewind: ()=>rewind(),
    setTheme: (mode)=>{ host.setAttribute("data-theme", mode); draw(series); },
    destroy: ()=>{ pause(); ro.disconnect(); if (opts.shadow) root.innerHTML=""; }
  };
}