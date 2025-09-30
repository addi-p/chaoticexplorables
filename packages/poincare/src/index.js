// src/index.js
// Two 300×300 canvases: left = 3D attractor projected in 2D (draggable rotation),
// right = Poincaré section (vertical x=s or horizontal y=s), with thickness band.
// Usage in Astro page:
//   import { initPoincareExplorable } from "/explorables/poincare/src/index.js";
//   initPoincareExplorable("#host");

export function initPoincareExplorable(root, options = {}) {
  const host = typeof root === "string" ? document.querySelector(root) : root;
  if (!host) throw new Error("initPoincareExplorable: host not found");

  // ---------- helpers ----------
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  function rk4(f, s, dt, p) {
    const k1 = f(s, p);
    const k2 = f([s[0]+0.5*dt*k1[0], s[1]+0.5*dt*k1[1], s[2]+0.5*dt*k1[2]], p);
    const k3 = f([s[0]+0.5*dt*k2[0], s[1]+0.5*dt*k2[1], s[2]+0.5*dt*k2[2]], p);
    const k4 = f([s[0]+dt*k3[0], s[1]+dt*k3[1], s[2]+dt*k3[2]], p);
    return [
      s[0] + (dt/6)*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]),
      s[1] + (dt/6)*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1]),
      s[2] + (dt/6)*(k1[2] + 2*k2[2] + 2*k3[2] + k4[2]),
    ];
  }

  function rotXYZ([x,y,z], ax, ay) { // Rx then Ry
    const cx=Math.cos(ax), sx=Math.sin(ax);
    const cy=Math.cos(ay), sy=Math.sin(ay);
    let y1 = cx*y - sx*z, z1 = sx*y + cx*z, x1 = x;
    const x2 = cy*x1 + sy*z1, z2 = -sy*x1 + cy*z1;
    return [x2, y1, z2];
  }

  function fit([x,y], bounds, W, H, pad=8) {
    const [minX,minY,maxX,maxY] = bounds;
    const w = Math.max(1e-9, maxX-minX), h = Math.max(1e-9, maxY-minY);
    const s = Math.min((W-2*pad)/w, (H-2*pad)/h);
    const X = pad + (x-minX)*s;
    const Y = H - (pad + (y-minY)*s);
    return [X,Y,s];
  }

  // ---------- attractors ----------
  const ATTR = {
    Lorenz: {
      params:{sigma:10, rho:28, beta:8/3},
      f: ([x,y,z], {sigma,rho,beta}) => [ sigma*(y-x), x*(rho-z)-y, x*y - beta*z ],
      seed: () => [Math.random()*2-1, Math.random()*2-1, 20+Math.random()*2],
      dt: 0.01
    },
    "Rössler": {
      params:{a:0.2,b:0.2,c:5.7},
      f: ([x,y,z], {a,b,c}) => [ -y - z, x + a*y, b + z*(x - c) ],
      seed: () => [0.1*Math.random(), 0.1*Math.random(), 0.1*Math.random()],
      dt: 0.02
    },
    Aizawa: {
      params:{a:0.95,b:0.7,c:0.6,d:3.5,e:0.25,f:0.1},
      f: ([x,y,z], p) => {
        const {a,b,c,d,e,f} = p;
        return [
          (z-b)*x - d*y,
          d*x + (z-b)*y,
          c + a*z - (z*z*z)/3 - (x*x + y*y)*(1 + e*z) + f*z*(x*x*x)
        ];
      },
      seed: () => [0.1, 0, 0],
      dt: 0.015
    }
  };

  // ---------- DOM ----------
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gridTemplateColumns = "1fr";
  wrap.style.gap = "0.5rem";

  const row1 = document.createElement("div");
  row1.style.display = "grid";
  row1.style.gridTemplateColumns = "300px 300px";
  row1.style.gap = "0.75rem";

  const c1 = document.createElement("canvas");
  c1.width = c1.height = 300;
  c1.style.width = c1.style.height = "300px";
  c1.style.border = "1px solid #e5e7eb"; c1.style.borderRadius = "8px";
  const c2 = document.createElement("canvas");
  c2.width = c2.height = 300;
  c2.style.width = c2.style.height = "300px";
  c2.style.border = "1px solid #e5e7eb"; c2.style.borderRadius = "8px";
  row1.appendChild(c1); row1.appendChild(c2);

  const controls = document.createElement("div");
  controls.style.display = "grid";
  controls.style.gridTemplateColumns = "repeat(2, minmax(0, 300px))";
  controls.style.gap = "0.5rem";

  function mkRow(label, input) {
    const wrap = document.createElement("label");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "0.5rem";
    const span = document.createElement("span");
    span.textContent = label;
    span.style.minWidth = "140px";
    span.style.fontSize = "12px";
    wrap.appendChild(span); wrap.appendChild(input);
    return wrap;
  }

  const selAttr = document.createElement("select");
  Object.keys(ATTR).forEach(k => {
    const o = document.createElement("option"); o.value=k; o.textContent=k; selAttr.appendChild(o);
  });
  selAttr.value = options.attractor || "Lorenz";

  const selAxisMode = document.createElement("select");
  ["vertical","horizontal"].forEach(v => { const o=document.createElement("option"); o.value=v; o.textContent=v; selAxisMode.appendChild(o); });
  selAxisMode.value = "vertical";

  const sAngX = document.createElement("input"); sAngX.type="range"; sAngX.min=-Math.PI; sAngX.max=Math.PI; sAngX.step="0.01"; sAngX.value="0.6";
  const sAngY = document.createElement("input"); sAngY.type="range"; sAngY.min=-Math.PI; sAngY.max=Math.PI; sAngY.step="0.01"; sAngY.value="0.4";

  const selSection = document.createElement("select");
  ["vertical","horizontal"].forEach(v => { const o=document.createElement("option"); o.value=v; o.textContent=v; selSection.appendChild(o); });
  selSection.value = "vertical";

  const sPos = document.createElement("input"); sPos.type="range"; sPos.min=0; sPos.max=1; sPos.step="0.001"; sPos.value="0.5";
  const sThk = document.createElement("input"); sThk.type="range"; sThk.min=0; sThk.max=0.2; sThk.step="0.001"; sThk.value="0.02";

  const autoSpin = document.createElement("input"); autoSpin.type="checkbox"; autoSpin.checked=false;
  const sSpin = document.createElement("input"); sSpin.type="range"; sSpin.min=-0.05; sSpin.max=0.05; sSpin.step="0.001"; sSpin.value="0.01";

  controls.append(
    mkRow("Attractor", selAttr),
    mkRow("Rotation axis", selAxisMode),
    mkRow("Angle (X)", sAngX),
    mkRow("Angle (Y)", sAngY),
    mkRow("Poincaré mode", selSection),
    mkRow("Section position (0..1)", sPos),
    mkRow("Thickness ε (0..0.2)", sThk),
    mkRow("Auto spin", autoSpin),
    mkRow("Spin speed", sSpin)
  );

  wrap.appendChild(row1);
  wrap.appendChild(controls);
  host.appendChild(wrap);

  // ---------- simulation ----------
  const ctx = c1.getContext("2d");
  const sctx = c2.getContext("2d");
  const W = c1.width, H = c1.height;

  let cfg = ATTR[selAttr.value];
  let f = cfg.f, params = {...cfg.params}, dt = cfg.dt;

  const N = 900;
  const state = new Array(N);
  const prev  = new Array(N);
  for (let i=0;i<N;i++){ state[i] = cfg.seed(); prev[i] = state[i].slice(); }

  let angX = +sAngX.value, angY = +sAngY.value;

  // drag rotation
  let dragging=false, lastX=0, lastY=0;
  c1.addEventListener("mousedown", e => {
    dragging=true;
    const r=c1.getBoundingClientRect(); lastX=e.clientX-r.left; lastY=e.clientY-r.top;
  });
  window.addEventListener("mousemove", e => {
    if(!dragging) return;
    const r=c1.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top;
    const dx=x-lastX, dy=y-lastY; lastX=x; lastY=y;
    if (selAxisMode.value==="vertical") angY+=dx*0.01; else angX+=dy*0.01;
  });
  window.addEventListener("mouseup", ()=> dragging=false);

  // world & proj bounds
  let wMinX=-20,wMaxX=20,wMinY=-20,wMaxY=20,wMinZ=-20,wMaxZ=20;
  let pMinX=-20,pMaxX=20,pMinY=-20,pMaxY=20;

  const sectionPts = [];

  selAttr.addEventListener("change", () => {
    cfg = ATTR[selAttr.value]; f=cfg.f; params={...cfg.params}; dt=cfg.dt;
    for (let i=0;i<N;i++){ state[i] = cfg.seed(); prev[i] = state[i].slice(); }
    sectionPts.length = 0;
    wMinX=-20;wMaxX=20;wMinY=-20;wMaxY=20;wMinZ=-20;wMaxZ=20;
    pMinX=-20;pMaxX=20;pMinY=-20;pMaxY=20;
  });

  sAngX.addEventListener("input", () => angX=+sAngX.value);
  sAngY.addEventListener("input", () => angY=+sAngY.value);

  let raf=0;
  const loop = () => {
    if (autoSpin.checked) {
      if (selAxisMode.value==="vertical") angY += +sSpin.value;
      else angX += +sSpin.value;
    }

    // integrate + collect crossings
    let tMinX=Infinity,tMaxX=-Infinity,tMinY=Infinity,tMaxY=-Infinity,tMinZ=Infinity,tMaxZ=-Infinity;
    let rMinX=Infinity,rMaxX=-Infinity,rMinY=Infinity,rMaxY=-Infinity;

    const sMode = selSection.value; // "vertical": x=s, "horizontal": y=s
    const sVal = (sMode==="vertical")
      ? (wMinX + (+sPos.value)*(wMaxX - wMinX))
      : (wMinY + (+sPos.value)*(wMaxY - wMinY));
    const eps = ((sMode==="vertical") ? (wMaxX - wMinX) : (wMaxY - wMinY)) * (+sThk.value);

    for (let i=0;i<N;i++){
      const nxt = rk4(f, state[i], dt, params);
      prev[i] = state[i];
      state[i] = nxt;

      // world bounds
      if (nxt[0]<tMinX) tMinX=nxt[0]; if (nxt[0]>tMaxX) tMaxX=nxt[0];
      if (nxt[1]<tMinY) tMinY=nxt[1]; if (nxt[1]>tMaxY) tMaxY=nxt[1];
      if (nxt[2]<tMinZ) tMinZ=nxt[2]; if (nxt[2]>tMaxZ) tMaxZ=nxt[2];

      // projected bounds
      const pr = rotXYZ(nxt, angX, angY);
      if (pr[0]<rMinX) rMinX=pr[0]; if (pr[0]>rMaxX) rMaxX=pr[0];
      if (pr[1]<rMinY) rMinY=pr[1]; if (pr[1]>rMaxY) rMaxY=pr[1];

      // Poincaré
      const uPrev = (sMode==="vertical") ? prev[i][0] : prev[i][1];
      const uCurr = (sMode==="vertical") ? nxt[0]      : nxt[1];
      const crossed = (uPrev - sVal) * (uCurr - sVal) <= 0;
      const inBand  = Math.abs(uCurr - sVal) <= eps;
      if (crossed || inBand) {
        const t = clamp((sVal - uPrev) / ((uCurr - uPrev) || 1e-9), 0, 1);
        const ix = prev[i][0] + t*(nxt[0] - prev[i][0]);
        const iy = prev[i][1] + t*(nxt[1] - prev[i][1]);
        const iz = prev[i][2] + t*(nxt[2] - prev[i][2]);
        // for x=s -> plot (y,z); for y=s -> plot (x,z)
        const px = (sMode==="vertical") ? iy : ix;
        const py = iz;
        sectionPts.push([px, py]);
        if (sectionPts.length > 8000) sectionPts.splice(0, sectionPts.length - 8000);
      }
    }

    // relax bounds
    const r=0.12;
    wMinX = wMinX*(1-r) + tMinX*r; wMaxX = wMaxX*(1-r) + tMaxX*r;
    wMinY = wMinY*(1-r) + tMinY*r; wMaxY = wMaxY*(1-r) + tMaxY*r;
    wMinZ = wMinZ*(1-r) + tMinZ*r; wMaxZ = wMaxZ*(1-r) + tMaxZ*r;
    pMinX = pMinX*(1-r) + rMinX*r; pMaxX = pMaxX*(1-r) + rMaxX*r;
    pMinY = pMinY*(1-r) + rMinY*r; pMaxY = pMaxY*(1-r) + rMaxY*r;

    // draw main canvas
    const ctx = c1.getContext("2d");
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = "#0f172a";
    for (let i=0;i<N;i++){
      const pr = rotXYZ(state[i], angX, angY);
      const [X,Y] = fit([pr[0], pr[1]], [pMinX,pMinY,pMaxX,pMaxY], W, H);
      ctx.fillRect(X, Y, 1, 1);
    }

    // draw section line (projected)
    ctx.strokeStyle = "rgba(30,144,255,0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const SAMPLES = 32;
    if (sMode==="vertical") {
      const xS = sVal;
      for (let i=0;i<=SAMPLES;i++){
        const y = wMinY + (i/SAMPLES)*(wMaxY - wMinY);
        const p = rotXYZ([xS, y, 0], angX, angY);
        const [X,Y] = fit([p[0],p[1]], [pMinX,pMinY,pMaxX,pMaxY], W, H);
        if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
      }
    } else {
      const yS = sVal;
      for (let i=0;i<=SAMPLES;i++){
        const x = wMinX + (i/SAMPLES)*(wMaxX - wMinX);
        const p = rotXYZ([x, yS, 0], angX, angY);
        const [X,Y] = fit([p[0],p[1]], [pMinX,pMinY,pMaxX,pMaxY], W, H);
        if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
      }
    }
    ctx.stroke();

    // thickness band
    const eps = ((sMode==="vertical") ? (wMaxX - wMinX) : (wMaxY - wMinY)) * (+sThk.value);
    if (+sThk.value > 0) {
      ctx.strokeStyle = "rgba(30,144,255,0.25)";
      ctx.setLineDash([4,3]);
      ctx.beginPath();
      if (sMode==="vertical") {
        for (const xS of [sVal - eps, sVal + eps]) {
          for (let i=0;i<=SAMPLES;i++){
            const y = wMinY + (i/SAMPLES)*(wMaxY - wMinY);
            const p = rotXYZ([xS, y, 0], angX, angY);
            const [X,Y] = fit([p[0],p[1]], [pMinX,pMinY,pMaxX,pMaxY], W, H);
            if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
          }
        }
      } else {
        for (const yS of [sVal - eps, sVal + eps]) {
          for (let i=0;i<=SAMPLES;i++){
            const x = wMinX + (i/SAMPLES)*(wMaxX - wMinX);
            const p = rotXYZ([x, yS, 0], angX, angY);
            const [X,Y] = fit([p[0],p[1]], [pMinX,pMinY,pMaxX,pMaxY], W, H);
            if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
          }
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // draw Poincaré canvas
    const sctx = c2.getContext("2d");
    sctx.clearRect(0,0,W,H);
    sctx.fillStyle="#fff"; sctx.fillRect(0,0,W,H);
    sctx.fillStyle="#be185d";

    let qMinX=Infinity,qMaxX=-Infinity,qMinY=Infinity,qMaxY=-Infinity;
    for (const [u,v] of sectionPts){ if (u<qMinX) qMinX=u; if (u>qMaxX) qMaxX=u; if (v<qMinY) qMinY=v; if (v>qMaxY) qMaxY=v; }
    if (!isFinite(qMinX)) { qMinX=-1; qMaxX=1; qMinY=-1; qMaxY=1; }
    const QB = [qMinX, qMinY, qMaxX, qMaxY];

    for (let i=0;i<sectionPts.length;i++){
      const [u,v] = sectionPts[i];
      const [X,Y] = fit([u,v], QB, W, H);
      sctx.fillRect(X, Y, 1.5, 1.5);
    }

    raf = requestAnimationFrame(loop);
  };

  let raf = requestAnimationFrame(loop);

  return {
    destroy() { cancelAnimationFrame(raf); host.removeChild(wrap); }
  };
}