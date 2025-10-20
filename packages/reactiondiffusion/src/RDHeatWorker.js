// Web Worker for (F,k) heat-map tiles — runs off the main thread.
// Receives: { jobId, cells, tileN, steps, dt, Du, Dv, Fmin, Fmax, kmin, kmax }
// Sends batches: { jobId, kind:'batch', items:[ {cx,cy,score}... ] } and finally { jobId, kind:'done' }

const scoreTile = (N, steps, dt, Du, Dv, F, k) => {
  const NN = N*N;
  const Ua = new Float32Array(NN), Va = new Float32Array(NN);
  const Ub = new Float32Array(NN), Vb = new Float32Array(NN);

  // seed noise
  for (let i=0;i<NN;i++){
    let u=1+(Math.random()*2-1)*0.02, v=Math.max(0,(Math.random()*2-1)*0.02);
    if (u<0) u=0; else if (u>1) u=1;
    if (v<0) v=0; else if (v>1) v=1;
    Ua[i]=u; Va[i]=v; Ub[i]=u; Vb[i]=v;
  }

  const idx = (x,y)=>{ x=(x+N)%N; y=(y+N)%N; return y*N+x; };
  const I = (U,x,y)=>U[idx(x,y)];
  const lap = (U,x,y)=>(
    -1.0*I(U,x,y)
    + 0.2*(I(U,x+1,y)+I(U,x-1,y)+I(U,x,y+1)+I(U,x,y-1))
    + 0.05*(I(U,x+1,y+1)+I(U,x-1,y+1)+I(U,x+1,y-1)+I(U,x-1,y-1))
  );

  const m = 2; const h = dt/m;
  let front = 0;

  for (let s=0;s<steps;s++){
    let Uai=(front===0?Ua:Ub), Vai=(front===0?Va:Vb);
    let Ubi=(front===0?Ub:Ua), Vbi=(front===0?Vb:Va);
    for (let ss=0; ss<m; ss++){
      let p=0;
      for (let y=0;y<N;y++){
        for (let x=0;x<N;x++,p++){
          const u=Uai[p], v=Vai[p], uvv=u*v*v;
          const Lu=lap(Uai,x,y), Lv=lap(Vai,x,y);
          let un=u + (Du*Lu - uvv + F*(1-u))*h;
          let vn=v + (Dv*Lv + uvv - (F+k)*v)*h;
          if (un<0) un=0; else if (un>1) un=1;
          if (vn<0) vn=0; else if (vn>1) vn=1;
          Ubi[p]=un; Vbi[p]=vn;
        }
      }
      let t=Uai; Uai=Ubi; Ubi=t; t=Vai; Vai=Vbi; Vbi=t;
    }
    if ((m&1)===1) front = 1-front;
  }

  const V = (front===0?Va:Vb);
  let mean=0; for (let i=0;i<NN;i++) mean+=V[i]; mean/=NN;
  let varv=0; for (let i=0;i<NN;i++){ const d=V[i]-mean; varv+=d*d; } varv/=NN;
  let grad=0;
  for (let y=0;y<N;y++){
    for (let x=0;x<N;x++){
      const vx = V[idx(x+1,y)] - V[idx(x-1,y)];
      const vy = V[idx(x,y+1)] - V[idx(x,y-1)];
      grad += Math.abs(vx)+Math.abs(vy);
    }
  }
  grad /= (NN*2);
  return Math.min(1, 3.0*varv + 1.8*grad);
};

let latestJobId = null;

self.onmessage = (e) => {
  const msg = e.data;
  if (msg.kind === 'cancel') {
    // Mark old job id so remaining work is ignored
    if (latestJobId === msg.jobId) latestJobId = null;
    return;
  }
  if (msg.kind !== 'start') return;

  const { jobId, cells, tileN, steps, dt, Du, Dv, Fmin, Fmax, kmin, kmax } = msg;
  latestJobId = jobId;

  const total = cells*cells;
  const batchSize = Math.max(64, Math.min(4*cells, 512));

  let i = 0;
  const runChunk = () => {
    if (latestJobId !== jobId) return; // canceled or superseded

    const items = [];
    for (let b=0; b<batchSize && i<total; b++, i++){
      const cx = i % cells;
      const cy = (i / cells) | 0;

      const F = Fmin + (cx+0.5)/cells*(Fmax-Fmin);
      const k = kmax - (cy+0.5)/cells*(kmax-kmin);

      const score = scoreTile(tileN, steps, dt, Du, Dv, F, k);
      items.push({ cx, cy, score });
    }

    if (items.length) postMessage({ jobId, kind: 'batch', items });

    if (i < total && latestJobId === jobId) {
      // yield back to event loop and continue
      setTimeout(runChunk, 0);
    } else {
      if (latestJobId === jobId) postMessage({ jobId, kind: 'done' });
    }
  };

  runChunk();
};