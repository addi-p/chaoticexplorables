// EpidemicResonance.js  (ESM)
// --- adjust these imports to your paths ---------------------------
import { button, radio, widget } from './packages/widgets/src/main.js';
import dropdown from './packages/widgets/src/dropdown.js';       // (not used, but handy if you add one)
import dropdownElement from './packages/widgets/src/dropdownElement.js';
// -----------------------------------------------------------------

// We rely on global d3 from your attached d3.min.js (v3-style API expected).
const d3g = window.d3;

export class EpidemicResonance extends ExplorableBase {
  constructor(mount, opts = {}) {
    super(mount, Object.assign({
      theme: 'light',
      showControls: true,
      sizes: {
        scene: { width: 960, height: 800, viewBox: `0 0 960 800` }, // match original canvas
      }
    }, opts));

    // One-time: widgets CSS (plain theme)
    const widgetsCSS = new URL('./packages/widgets/src/widgets-plain.css', import.meta.url).toString();
    this._ensureStylesheet(widgetsCSS, 'cx-widgets-css');

    // ====== layout constants (same as original) ======
    this.Canvas = { x:0, y:0, width:960, height:800 };
    this.PanelA = { x:0, y:0, width:this.Canvas.width, height: 0.56 * this.Canvas.height };
    this.PanelB = { x:30, y: 0.6 * this.Canvas.height, width: this.Canvas.width - 30, height: 0.22 * this.Canvas.height };
    this.PanelC = { x: this.Canvas.width/2 - 50, y: this.PanelB.y + this.PanelB.height + 10, width:100, height: 0.13*this.Canvas.height };
    this.PanelD = { x: 0,                 y: this.PanelB.y + this.PanelB.height + 10, width:100, height: 0.13*this.Canvas.height };
    this.PanelE = { x: this.Canvas.width-30, y: this.PanelB.y + this.PanelB.height + 10, width:100, height: 0.13*this.Canvas.height };
    this.PanelB1 = { x:0, y:0, width:this.PanelB.width, height:this.PanelB.height/2 };
    this.PanelB2 = { x:0, y:this.PanelB.height/2, width:this.PanelB.width, height:this.PanelB.height/2 };
    this.PanelF = { x:20, y:this.Canvas.height-20, width:this.Canvas.width, height:0.05*this.Canvas.height };

    this.Plot_margin = { top:0, right:0, bottom:30, left:30 };
    this.Plot_width  = this.PanelB1.width  - this.Plot_margin.left - this.Plot_margin.right;
    this.Plot_height = this.PanelB1.height - this.Plot_margin.top  - this.Plot_margin.bottom;

    // ====== sim + ui state ======
    this.info_type = ['local','meso','global'];
    this.systems   = ['triangular lattice','square lattice','random planar'];
    this.currentsystem = this.systems[2]; // start like original
    this.infotype = 'local';
    this.aspect_ratio = this.PanelA.height / this.PanelA.width;

    this.nodes = [];
    this.links = [];
    this.linkvisible = false;
    this.state = [];
    this.Nt = 500; this.t = 0;

    // Counts
    this.S = this.I = this.R = this.V = this.D = 0;

    // Scales (v3-style)
    this.X = d3g.scale.linear();
    this.Y = d3g.scale.linear();
    this.color = d3g.scale.ordinal().range(['white','red','black','#7f7f7f']).domain(['S','I','R','V']);
    this.ss    = d3g.scale.ordinal().domain(['S','I','R','V']);

    this.Tscale = d3g.scale.linear().range([0, this.Plot_width]).domain([0, this.Nt]);
    this.Iscale = d3g.scale.linear().range([this.Plot_height, 0]).domain([0, 0.1]);
    this.Vscale = d3g.scale.linear().range([this.Plot_height, 0]).domain([0, 1]);

    this.TAxis = d3g.svg.axis().scale(this.Tscale).orient('bottom').ticks(null);
    this.IAxis = d3g.svg.axis().scale(this.Iscale).orient('left').ticks(2);
    this.VAxis = d3g.svg.axis().scale(this.Vscale).orient('left').ticks(2);

    this.Iline = d3g.svg.line().x(d => this.Tscale(d.t)).y(d => this.Iscale(d.I));
    this.Vline = d3g.svg.line().x(d => this.Tscale(d.t)).y(d => this.Vscale(d.V));

    // Build scene
    this._buildScene();
    this._system_3();      // default topology & params
    this._setup();         // draw everything
    this.render();         // first render
  }

  /* -------------------- Scene & Panels -------------------- */
  _buildScene() {
    const { width, height, viewBox } = this.o.sizes.scene;
    this.svg = this._makeSvg({ width, height, viewBox, className: 'cx-svg d3-widgets' });
    this.wrap.appendChild(this.svg);

    // Root selection for d3
    this.rootSel = d3g.select(this.svg);

    // Panels as <g> like original code
    this.panelA = this.rootSel.append('g').attr('transform', `translate(${this.PanelA.x},${this.PanelA.y})`);
    this.panelB = this.rootSel.append('g').attr('transform', `translate(${this.PanelB.x},${this.PanelB.y})`);
    this.panelC = this.rootSel.append('g').attr('transform', `translate(${this.PanelC.x},${this.PanelC.y})`);
    this.panelD = this.rootSel.append('g').attr('transform', `translate(${this.PanelD.x},${this.PanelD.y})`);
    this.panelE = this.rootSel.append('g').attr('transform', `translate(${this.PanelE.x},${this.PanelE.y})`);
    this.panelF = this.rootSel.append('g').attr('transform', `translate(${this.PanelF.x},${this.PanelF.y})`);
    this.panelB1 = this.panelB.append('g').attr('transform', `translate(${this.PanelB1.x},${this.PanelB1.y})`);
    this.panelB2 = this.panelB.append('g').attr('transform', `translate(${this.PanelB2.x},${this.PanelB2.y})`);

    // Layers in panel A
    this.linklayer = this.panelA.append('g').attr('class','linklayer');
    this.nodelayer = this.panelA.append('g').attr('class','nodelayer');

    // HUD group for widgets (overlay in the same SVG)
    this.hud = this.rootSel.append('g').attr('data-layer','hud');

    // Widgets
    if (this.o.showControls) this._mountWidgets();
  }

  _mountWidgets() {
    const leftX  = 20;                        // HUD positions in SVG coords
    const topY   = this.PanelB.y + this.PanelB.height + 40;
    const rightX = this.Canvas.width - 20;

    // Play/Pause button (replaces the big circle button)
    this.playBtn = button()
      .size(44).symbolsize(0.35).shape('round').actions(['play','pause'])
      .x(this.Canvas.width/2).y(this.PanelC.y + 10)
      .label('Run').labelposition('right')
      .value(0)
      .update(() => {
        const on = !!this.playBtn.value();
        if (on) this.play(); else this.pause();
      });
    this.hud.append(() => widget(this.playBtn));

    // Radio: info_type (left)
    this.infoRadio = radio()
      .choices(this.info_type)
      .value(this.info_type.indexOf(this.infotype))
      .x(40).y(this.PanelD.y + 10)
      .size(140).buttonsize(16).buttonpadding(0.28)
      .orientation('vertical')
      .label('Info scope').labelposition('right')
      .update(() => {
        this.infotype = this.info_type[this.infoRadio.value()];
        this._infoneighbors();
      });
    this.hud.append(() => widget(this.infoRadio));

    // Radio: system/topology (right)
    this.sysRadio = radio()
      .choices(this.systems)
      .value(this.systems.indexOf(this.currentsystem))
      .x(this.Canvas.width - 160).y(this.PanelE.y + 10)
      .size(150).buttonsize(16).buttonpadding(0.28)
      .orientation('vertical')
      .label('Topology').labelposition('right')
      .update(() => {
        this.currentsystem = this.systems[this.sysRadio.value()];
        this._updatesystem();
      });
    this.hud.append(() => widget(this.sysRadio));
  }

  /* -------------------- Original setup() reworked -------------------- */
  _setup() {
    const self = this;

    // Initialize node states
    this.nodes.forEach(d => d.state = 'S');

    this._infoneighbors();
    this._initialize_infection();

    this._recount();

    // Draw links + nodes
    this.linkSel = this.linklayer.selectAll('.link').data(this.links)
      .enter().append('line')
      .attr('class','link')
      .attr('x1', d => this.X(d.source.x)).attr('y1', d => this.Y(d.source.y))
      .attr('x2', d => this.X(d.target.x)).attr('y2', d => this.Y(d.target.y))
      .style('stroke','#000').style('stroke-width','.5px')
      .style('opacity', this.linkvisible ? 1 : 0);

    this.nodeSel = this.nodelayer.selectAll('.node').data(this.nodes)
      .enter().append('circle')
      .attr('class','node')
      .attr('r', d => this.ss(d.state))
      .attr('cx', d => this.X(d.x)).attr('cy', d => this.Y(d.y))
      .style('fill', d => this.color(d.state))
      .style('stroke','#000').style('stroke-width','.5px')
      .on('click', function(d){ d.state = 'I'; self._refreshNodes(); })
      .on('mousemove', function() {
        const m = d3g.mouse(this);
        self.rootSel.selectAll('.glassouter,.glassinner')
          .attr('cx', m[0] + self.radius).attr('cy', m[1] + self.radius);
      });

    // “Glass” circles (hover guides)
    this.rootSel.append('circle').attr('class','glassouter').attr('r', this.inforadius * this.d).style('opacity',0);
    this.rootSel.append('circle').attr('class','glassouter').attr('r', this.localinforadius * this.d).style('opacity',0);
    this.rootSel.append('circle').attr('class','glassinner').attr('r', this.infectradius * this.d).style('opacity',0);

    this.panelA.on('mouseover', () => {
      this.rootSel.selectAll('.glassouter').transition().duration(100).style('opacity',1);
      this.rootSel.selectAll('.glassinner').transition().duration(100).style('opacity',1);
    });
    this.panelA.on('mouseout', () => {
      this.rootSel.selectAll('.glassouter').transition().duration(100).style('opacity',0);
      this.rootSel.selectAll('.glassinner').transition().duration(100).style('opacity',0);
    });
    this.panelA.on('mousemove', () => {
      const m = d3g.mouse(this.panelA.node());
      this.rootSel.selectAll('.glassouter,.glassinner')
        .attr('cx', m[0] + this.radius).attr('cy', m[1] + this.radius);
    });

    // Legend
    const legend = [
      {label:'Susceptible', state:'S'},
      {label:'Infected',    state:'I'},
      {label:'Recovered',   state:'R'},
      {label:'Vaccinated',  state:'V'},
    ];
    const leg = this.panelF.selectAll('.legenditem').data(legend).enter().append('g')
      .attr('class','legenditem')
      .attr('transform',(d,i)=>`translate(${i*0.35*this.Canvas.width/legend.length},0)`);
    leg.append('circle').attr('r',5).style('fill',d=>this.color(d.state)).style('stroke','#000');
    leg.append('text').attr('transform','translate(10,4)').text(d=>d.label).style('opacity',1);

    // Axes + paths
    this._setupaxes();
    this._update_state(); // seed first sample
  }

  _setupaxes() {
    // I(t)
    const g1 = this.panelB1.append('g').attr('transform', `translate(${this.Plot_margin.left},${this.Plot_margin.top})`);
    g1.append('g').attr('class','Taxis').attr('transform', `translate(0,${this.Plot_height})`).call(this.TAxis)
      .append('text').text('time').attr('class','axislabel')
      .attr('transform', `translate(${(this.PanelB.width/2-50)},15)`).style('text-anchor','middle');
    g1.append('g').attr('class','Iaxis').call(this.IAxis)
      .append('text').text('% Infected').attr('class','axislabel').style('text-anchor','middle')
      .attr('transform', `translate(-40,${(this.PanelB1.height/2 - 5)}) rotate(-90)`);
    g1.append('path').datum(this.state).attr('class','Itrack').attr('d', this.Iline);

    // V(t)
    const g2 = this.panelB2.append('g').attr('transform', `translate(${this.Plot_margin.left},${this.Plot_margin.top})`);
    g2.append('g').attr('class','Taxis').attr('transform', `translate(0,${this.Plot_height})`).call(this.TAxis)
      .append('text').text('time').attr('class','axislabel')
      .attr('transform', `translate(${(this.PanelB1.width/2-50)},15)`).style('text-anchor','middle');
    g2.append('g').attr('class','Vaxis').call(this.VAxis)
      .append('text').text('% Vaccinated').attr('class','axislabel').style('text-anchor','middle')
      .attr('transform', `translate(-40,${(this.PanelB1.height/2 - 5)}) rotate(-90)`);
    g2.append('path').datum(this.state).attr('class','Vtrack').attr('d', this.Vline);
  }

  /* -------------------- Sim control (hooks into ExplorableBase loop) -------------------- */
  _step() {
    // mimic original 20Hz interval, but use dt accumulator; one epidemic "tick" per frame is fine
    // if you want to throttle, you can gate on elapsed time.
    this._iterate_sim();
  }

  _iterate_sim() {
    // d3.shuffle is v4+; v3 has d3.shuffle in the array util attached to d3? If not, implement locally:
    this._shuffleInPlace(this.nodes);

    this._infect();
    this._recover();
    this._vital();

    this._refreshNodes();
    this._update_state();
  }

  render() {
    // nothing to do per-frame besides what _iterate_sim does
  }

  /* -------------------- Epidemic logic (mostly verbatim) -------------------- */
  _infect() {
    const infected = this.nodes.filter(d => d.state === 'I');
    infected.forEach(i => {
      const nn = i.contacts;
      nn.forEach(target => {
        if (Math.random() < this.alpha && target.state === 'S') {
          target.state = 'I'; this.I++; this.S--;
        }
      });
    });
  }

  _recover() {
    const infected = this.nodes.filter(d => d.state === 'I');
    infected.forEach(i => {
      if (Math.random() < this.beta) {
        i.state = 'R'; this.I--; this.R++;
      }
    });
  }

  _vital() {
    const life = this.nodes;
    life.forEach(i => {
      if (Math.random() < this.vitalrate) {
        if (i.state === 'I') this.I--;
        if (i.state === 'R') this.R--;
        if (i.state === 'V') this.V--;
        if (i.state === 'S') this.S--;

        if (this.infotype === 'global') {
          if (Math.random() < this._sigmoid(this.risk * this.I / this.nodes.length)) {
            i.state = 'V'; this.V++;
          } else {
            i.state = 'S'; this.S++;
          }
        } else {
          const local_I = i.neighbors.filter(n => n.state === 'I').length;
          if (Math.random() < this._sigmoid(this.risk * local_I / Math.max(1, i.neighbors.length))) {
            i.state = 'V'; this.V++;
          } else {
            i.state = 'S'; this.S++;
          }
        }
      }
    });
  }

  _update_state() {
    this.state.push({ t:this.t, S:this.S/this.nodes.length, I:this.I/this.nodes.length, V:this.V/this.nodes.length });
    this.Iscale.domain([0, d3g.max(this.state, d => 0.05*(Math.floor(d.I/0.05)+1))]);
    this.Vscale.domain([0, d3g.max(this.state, d => 0.05*(Math.floor(d.V/0.05)+1))]);

    this.panelB1.select('.Iaxis').call(this.IAxis);
    this.panelB2.select('.Vaxis').call(this.VAxis);

    if (this.t < this.Nt) {
      this.panelB1.select('.Itrack').attr('d', this.Iline);
      this.panelB2.select('.Vtrack').attr('d', this.Vline);
    } else {
      this.panelB1.select('.Itrack').attr('d', this.Iline);
      this.panelB2.select('.Vtrack').attr('d', this.Vline);
      this.state.shift();
      this.Tscale.domain([this.t - this.Nt + 1, this.t + 1]);
    }
    this.t++;
  }

  _updatesystem() {
    this.pause();
    // clear plots
    this.panelB1.selectAll('g').remove();
    this.panelB2.selectAll('g').remove();

    if (this.currentsystem === this.systems[0]) this._system_1();
    if (this.currentsystem === this.systems[1]) this._system_2();
    if (this.currentsystem === this.systems[2]) this._system_3();

    this._infoneighbors();
    this._initialize_infection();
    this._recount();

    // reset series
    this.state = []; this.t = 0;
    this.Tscale = d3g.scale.linear().range([0, this.Plot_width]).domain([0, this.Nt]);
    this.Iscale = d3g.scale.linear().range([this.Plot_height, 0]).domain([0, 0.1]);
    this.Vscale = d3g.scale.linear().range([this.Plot_height, 0]).domain([0, 1]);

    this.TAxis = d3g.svg.axis().scale(this.Tscale).orient('bottom').ticks(null);
    this.IAxis = d3g.svg.axis().scale(this.Iscale).orient('left').ticks(2);
    this.VAxis = d3g.svg.axis().scale(this.Vscale).orient('left').ticks(2);

    this.Iline = d3g.svg.line().x(d => this.Tscale(d.t)).y(d => this.Iscale(d.I));
    this.Vline = d3g.svg.line().x(d => this.Tscale(d.t)).y(d => this.Vscale(d.V));

    // update links
    const l = this.linklayer.selectAll('.link').data(this.links);
    l.attr('x1', d => this.X(d.source.x)).attr('y1', d => this.Y(d.source.y))
     .attr('x2', d => this.X(d.target.x)).attr('y2', d => this.Y(d.target.y))
     .style('opacity', this.linkvisible ? 1 : 0);
    l.enter().append('line').attr('class','link')
     .attr('x1', d => this.X(d.source.x)).attr('y1', d => this.Y(d.source.y))
     .attr('x2', d => this.X(d.target.x)).attr('y2', d => this.Y(d.target.y))
     .style('opacity', this.linkvisible ? 1 : 0);
    l.exit().remove();

    // update nodes
    const n = this.nodelayer.selectAll('.node').data(this.nodes);
    n.transition().duration(600)
      .attr('r', d => this.ss(d.state))
      .attr('cx', d => this.X(d.x)).attr('cy', d => this.Y(d.y))
      .style('fill', d => this.color(d.state));
    n.exit().transition().duration(600).attr('r',0).remove();
    n.enter().append('circle').attr('class','node')
      .attr('cx', d => this.X(d.x)).attr('cy', d => this.Y(d.y))
      .style('fill', d => this.color(d.state)).attr('r',0).transition().duration(600)
      .attr('r', d => this.ss(d.state));

    this._setupaxes();
    this._update_state();
  }

  _refreshNodes() {
    this.nodelayer.selectAll('.node')
      .style('fill', d => this.color(d.state))
      .attr('r', d => this.ss(d.state));
  }

  _initialize_infection() {
    this.nodes.forEach(d => {
      if (Math.random() < this.initially_infected)  d.state = 'I';
      else                                          d.state = 'S';
      if (Math.random() < this.initially_vaccinated) d.state = 'V';
    });
  }

  _infoneighbors() {
    const r = (this.infotype === 'local') ? this.localinforadius : this.inforadius;
    this.nodes.forEach(d => {
      d.neighbors = [];
      this.nodes.forEach(t => {
        if (this._euklid(d.x, d.y, t.x, t.y) < r) d.neighbors.push(t);
      });
    });
  }

  _euklid(x0,y0,x1,y1){ return Math.sqrt((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1)); }
  _sigmoid(x){ const z = Math.pow(x, this.xi); return z/(z+1); }
  _recount(){
    this.S = this.nodes.filter(d=>d.state==='S').length;
    this.I = this.nodes.filter(d=>d.state==='I').length;
    this.R = this.nodes.filter(d=>d.state==='R').length;
    this.V = this.nodes.filter(d=>d.state==='V').length;
    this.D = this.nodes.filter(d=>d.state==='D').length;
  }
  _shuffleInPlace(arr){
    for (let i = arr.length - 1; i > 0; --i) { const j = (Math.random()* (i+1))|0; [arr[i],arr[j]]=[arr[j],arr[i]]; }
  }

  /* -------------------- Topologies & params (system_1/2/3) -------------------- */
  _system_1() {
    this.network_type = 'triangular';
    let N = 800;

    this.inforadius = 4; this.localinforadius = 1.1; this.infectradius = 1.9;
    this.risk = 55; this.xi = 4;
    const R0 = (4/8)*12; this.beta = 0.1; this.alpha = R0 * this.beta; this.vitalrate = 0.3 * this.beta;

    this.initially_infected = 0.05; this.initially_vaccinated = 0.5; this.initially_immune = 0.0;

    this.d  = Math.sqrt(this.aspect_ratio / N) * this.PanelA.width;
    this.Nx = Math.floor(this.PanelA.width / this.d);
    this.Ny = Math.floor(2/Math.sqrt(3) * this.PanelA.width * this.aspect_ratio / this.d);
    N       = this.Nx * this.Ny;
    this.radius = this.d / 2;

    this.X.range([this.radius, this.PanelA.width - this.radius]).domain([0, this.Nx - 1]);
    this.Y.range([this.radius, this.PanelA.height - this.radius]).domain([0, (this.Ny - 1) / 2 * Math.sqrt(3)]);
    this.ss.range([this.radius, this.radius, this.radius, this.radius]);
    this.linkvisible = false;

    this._triangularlattice(N);
  }

  _system_2() {
    this.network_type = 'square';
    let N = 1000;

    this.inforadius = 4; this.localinforadius = 1.1; this.infectradius = 1.9;
    this.risk = 35; this.xi = 4;
    const R0 = (4/8)*12; this.beta = 0.1; this.alpha = R0 * this.beta; this.vitalrate = 0.3 * this.beta;

    this.initially_infected = 0.05; this.initially_vaccinated = 0.5; this.initially_immune = 0.0;

    this.d  = Math.sqrt(this.aspect_ratio / N) * this.PanelA.width;
    this.Nx = Math.floor(this.PanelA.width / this.d);
    this.Ny = Math.floor(this.PanelA.width * this.aspect_ratio / this.d);
    N       = this.Nx * this.Ny;
    this.radius = this.d / 2;

    this.X.range([this.radius, this.PanelA.width - this.radius]).domain([0, this.Nx - 1]);
    this.Y.range([this.radius, this.PanelA.height - this.radius]).domain([0, this.Ny - 1]);
    this.ss.range([this.radius, this.radius, this.radius, this.radius]);
    this.linkvisible = false;

    this._squarelattice(N);
  }

  _system_3() {
    this.network_type = 'randomplanar';
    let N = 1000;

    this.inforadius = 4; this.localinforadius = 1.1; this.infectradius = 1.9;
    this.risk = 35; this.xi = 4;
    const R0 = (4/8)*12; this.beta = 0.1; this.alpha = R0 * this.beta; this.vitalrate = 0.3 * this.beta;

    this.initially_infected = 0.05; this.initially_vaccinated = 0.5; this.initially_immune = 0.0;

    this.d  = Math.sqrt(this.aspect_ratio / N) * this.PanelA.width;
    this.Nx = Math.floor(this.PanelA.width / this.d);
    this.Ny = Math.floor(this.PanelA.width * this.aspect_ratio / this.d);
    N       = this.Nx * this.Ny;
    this.radius = 0.75 * this.d / 2;

    this.X.range([this.radius, this.PanelA.width - this.radius]).domain([0, this.Nx - 1]);
    this.Y.range([this.radius, this.PanelA.height - this.radius]).domain([0, this.Ny - 1]);
    this.ss.range([0.5*this.radius, this.radius, 0.5*this.radius, 0.75*this.radius]);
    this.linkvisible = true;

    this._randomplanarlattice(N);
  }

  _squarelattice(N) {
    this.nodes = []; this.links = [];
    this.nodes = d3g.range(this.Nx * this.Ny).map(i => ({ index:i, x:(i % this.Nx), y:Math.floor(i / this.Nx) }));
    this._wireContacts();
  }
  _randomplanarlattice(N) {
    this.nodes = []; this.links = [];
    this.nodes = d3g.range(N).map(i => ({ index:i, x: Math.random()*(this.Nx-1), y: Math.random()*(this.Ny-1) }));
    this._wireContacts();
  }
  _triangularlattice(N) {
    this.nodes = []; this.links = [];
    this.nodes = d3g.range(this.Nx * this.Ny).map(i => ({ index:i, x:(i % this.Nx), y:Math.floor(i / this.Nx) }));
    this.nodes.forEach(d => { d.y % 2 === 0 ? d.x+=0.25 : d.x-=0.25; d.y = Math.sqrt(3)/2 * d.y; });
    this._wireContacts();
  }
  _wireContacts() {
    const r = this.infectradius;
    this.links = [];
    this.nodes.forEach(d => {
      const nn = this.nodes.filter(t => this._euklid(d.x, d.y, t.x, t.y) < r);
      d.contacts = nn;
      nn.forEach(x => this.links.push({ source: this.nodes[d.index], target: this.nodes[x.index] }));
    });
  }
}

/* -------------------- USAGE EXAMPLE --------------------
import { EpidemicResonance } from './EpidemicResonance.js';

const sim = new EpidemicResonance('#mount', {
  theme: 'light',
  sizes: { scene: { width: 960, height: 800, viewBox: '0 0 960 800' } }
});
// hooks if needed:
// sim.play(); sim.pause(); // or click the HUD play button
-------------------------------------------------------- */