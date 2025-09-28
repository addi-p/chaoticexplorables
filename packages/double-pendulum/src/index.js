import { ExplorableBase } from '@chaoticexplorables/core';
import { slider, button } from '@chaoticexplorables/core/ui';
import { modAngle, clamp } from '@chaoticexplorables/core/utils';
import './local.css'; // optional module-specific tweaks

export class DoublePendulumExplorable extends ExplorableBase {
  constructor(mount, opts = {}) {
    super(mount, Object.assign({
      showControls: true,
      showPhasePlane: true,
      showTrails: true,
      params: { m1: 1, m2: 1, L1: 1, L2: 1, g: 9.81 },
      ensembleCount: 5
    }, opts));

    this.kPix = 160;
    this.params = { ...this.o.params };
    this._buildUI();
    this._buildSVGs();
    this._rebuildEnsemble();
    this.reset();
  }

  _buildUI() {
    if (!this.o.showControls) return;
    const panel = document.createElement('div'); panel.className = 'cx-panel'; this.wrap.appendChild(panel);
    const ctrls = document.createElement('div'); ctrls.className = 'cx-ctrls'; panel.appendChild(ctrls);

    const addS = (key, conf) => {
      const s = slider({ label: key, ...conf, value: this.params[key], oninput: v => this.params[key] = v });
      ctrls.appendChild(s.el);
    };
    addS('m1', { min: 0.1, max: 5, step: 0.1 });
    addS('m2', { min: 0.1, max: 5, step: 0.1 });
    addS('L1', { min: 0.2, max: 3, step: 0.05 });
    addS('L2', { min: 0.2, max: 3, step: 0.05 });

    const transport = document.createElement('div'); transport.className = 'cx-row';
    transport.append(
      button({ text: 'Play',  iconPath: this.o.icons.play,  onclick: () => this.play() }),
      button({ text: 'Pause', iconPath: this.o.icons.pause, onclick: () => this.pause() }),
      button({ text: 'Step',  iconPath: this.o.icons.forward, onclick: () => { this._step(); this.render(); } }),
      button({ text: 'Reset', iconPath: this.o.icons.reload, onclick: () => { this._rebuildEnsemble(); this.reset(); } })
    );
    panel.appendChild(transport);
  }

  _buildSVGs() {
    this.grid = document.createElement('div');
    this.grid.className = 'cx-grid ' + (this.o.layout === 'side' ? 'side' : 'stack');
    this.wrap.appendChild(this.grid);

    // scene
    this.scene = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.scene.classList.add('cx-svg');
    this.scene.setAttribute('viewBox', '-400 -260 800 520');
    this.grid.appendChild(this.scene);
    this.scene.addEventListener('click', ev => {
      if (!this.o.enableClickIK) return;
      const pt = this._svgPoint(this.scene, ev.clientX, ev.clientY);
      const xm = pt.x / this.kPix, ym = pt.y / this.kPix;
      const { L1, L2 } = this.params; const r = Math.hypot(xm, ym);
      const rc = clamp(r, 1e-6, L1 + L2 - 1e-6);
      const cos2 = clamp((rc*rc - L1*L1 - L2*L2) / (2*L1*L2), -1, 1);
      const t2rel = Math.acos(cos2), phi = Math.atan2(xm, ym);
      const k = Math.atan2(L2*Math.sin(t2rel), L1 + L2*Math.cos(t2rel));
      const t1 = modAngle(phi - k), t2 = modAngle(t1 + t2rel);
      this.initPose = { t1, t2, w1: 0, w2: 0 };
      for (const p of this.ensemble) Object.assign(p, this.initPose), p.path.length = 0, p._phase = [];
      this.render();
    });

    // phase
    if (this.o.showPhasePlane) {
      this.phase = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.phase.classList.add('cx-svg');
      this.phase.setAttribute('viewBox', `${-Math.PI-0.4} ${-Math.PI-0.4} ${2*Math.PI+0.8} ${2*Math.PI+0.8}`);
      this.grid.appendChild(this.phase);
      // axes/grid (omit here for brevity; same as earlier)
    }
  }

  _rebuildEnsemble() {
    // (Create rods/bobs/traces into scene; create phase paths if enabled)
    this.ensemble = []; this.rods=[]; this.bobs=[]; this.traces=[]; this.phaseTraj=[];
    if (this.sceneGroup) this.sceneGroup.remove(); this.sceneGroup = this._svg('g',{}); this.scene.appendChild(this.sceneGroup);
    if (this.phase) { if (this.phaseGroup) this.phaseGroup.remove(); this.phaseGroup = this._svg('g',{}); this.phase.appendChild(this.phaseGroup); }
    const N = this.o.ensembleCount ?? 1;
    for (let i = 0; i < N; i++) {
      const color = this.o.colors ? this.o.colors(i) : `hsl(${(i*137.508)%360} 80% 60%)`;
      const jitter = (i/(N-1||1)-0.5)*0.0005;
      const p = { t1: (this.initPose?.t1 ?? Math.PI/2) + jitter, t2: (this.initPose?.t2 ?? Math.PI/2) - jitter, w1:0, w2:0, color, path:[] };
      this.ensemble.push(p);
      const g = this._svg('g',{}); this.sceneGroup.appendChild(g);
      const r1 = this._svg('line',{stroke:color,'stroke-width':2}), r2 = this._svg('line',{stroke:color,'stroke-width':2});
      const b1 = this._svg('circle',{r:5,fill:color}), b2 = this._svg('circle',{r:5,fill:color});
      g.append(r1, r2, b1, b2); this.rods.push(r1,r2); this.bobs.push(b1,b2);
      if (this.o.showTrails) { const tr = this._svg('path',{fill:'none',stroke:color,'stroke-opacity':0.25,'stroke-width':1.25}); this.traces.push(tr); this.sceneGroup.appendChild(tr); }
      if (this.phase) { const ph = this._svg('path',{fill:'none',stroke:color,'stroke-width':0.03,'stroke-opacity':0.9}); this.phaseTraj.push(ph); this.phaseGroup.appendChild(ph); }
    }
  }

  _resetModel() {
    this.initPose = this.initPose || { t1: Math.PI/2, t2: Math.PI/2, w1: 0, w2: 0 };
    for (const p of this.ensemble) Object.assign(p, this.initPose), p.path.length = 0, p._phase = [];
  }

  _step() {
    for (const p of this.ensemble) this._rk4(p, this.dt);
  }

  _rk4(p, dt) {
    const y0 = [p.t1, p.w1, p.t2, p.w2];
    const k1 = this._deriv(y0);
    const y1 = y0.map((v,i)=>v+0.5*dt*k1[i]);
    const k2 = this._deriv(y1);
    const y2 = y0.map((v,i)=>v+0.5*dt*k2[i]);
    const k3 = this._deriv(y2);
    const y3 = y0.map((v,i)=>v+dt*k3[i]);
    const k4 = this._deriv(y3);
    const yn = y0.map((v,i)=> v + dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
    p.t1 = modAngle(yn[0]); p.w1 = yn[1]; p.t2 = modAngle(yn[2]); p.w2 = yn[3];
  }

  _deriv([t1,w1,t2,w2]) {
    const { m1, m2, L1, L2, g } = this.params;
    const c12 = Math.cos(t1 - t2), s12 = Math.sin(t1 - t2);
    const den = 2*m1 + m2 - m2*Math.cos(2*t1 - 2*t2);
    const dw1 = (-g*(2*m1+m2)*Math.sin(t1) - m2*g*Math.sin(t1-2*t2) - 2*s12*m2*(w2*w2*L2 + w1*w1*L1*c12)) / (L1*den);
    const dw2 = (2*s12*( w1*w1*L1*(m1+m2) + g*(m1+m2)*Math.cos(t1) + w2*w2*L2*m2*c12)) / (L2*den);
    return [w1, dw1, w2, dw2];
  }

  render() {
    const { L1, L2 } = this.params;
    let ri=0, bi=0, ti=0, pi=0;
    for (const p of this.ensemble) {
      const x1 = L1*Math.sin(p.t1)*this.kPix, y1 = L1*Math.cos(p.t1)*this.kPix;
      const x2 = x1 + L2*Math.sin(p.t2)*this.kPix, y2 = y1 + L2*Math.cos(p.t2)*this.kPix;
      const r1=this.rods[ri++], r2=this.rods[ri++], b1=this.bobs[bi++], b2=this.bobs[bi++];
      r1.setAttribute('x1',0); r1.setAttribute('y1',0); r1.setAttribute('x2',x1); r1.setAttribute('y2',y1);
      r2.setAttribute('x1',x1); r2.setAttribute('y1',y1); r2.setAttribute('x2',x2); r2.setAttribute('y2',y2);
      b1.setAttribute('cx',x1); b1.setAttribute('cy',y1);
      b2.setAttribute('cx',x2); b2.setAttribute('cy',y2);

      if (this.o.showTrails) {
        p.path.push([x2,y2]); if (p.path.length > (this.o.trailLen ?? 1500)) p.path.shift();
        this.traces[ti++]?.setAttribute('d', p.path.map((pt,i)=> (i?'L':'M')+pt[0].toFixed(2)+','+pt[1].toFixed(2)).join(' '));
      }
      if (this.phase) {
        (p._phase ||= []).push([modAngle(p.t1), modAngle(p.t2)]);
        if (p._phase.length > (this.o.phaseTrailLen ?? 2000)) p._phase.shift();
        this.phaseTraj[pi++]?.setAttribute('d', p._phase.map((pt,i)=> (i?'L':'M')+pt[0].toFixed(4)+','+pt[1].toFixed(4)).join(' '));
      }
    }
  }

  // tiny SVG helpers
  _svg(tag, attrs) { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; }
  _svgPoint(svg, cx, cy) { const pt=svg.createSVGPoint(); pt.x=cx; pt.y=cy; const m=svg.getScreenCTM().inverse(); return pt.matrixTransform(m); }

  getState() { return { params: { ...this.params }, N: this.o.ensembleCount }; }
}