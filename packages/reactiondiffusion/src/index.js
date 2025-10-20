// packages/reactiondiffusion/src/index.js
// Gray–Scott Reaction–Diffusion (WebGL2) + D3 Widgets
// - Brighter colormap (u_brightness, u_gamma)
// - F–k map <-> sliders in lockstep, with warm-up
// - Param-map axis orientation switches (flipF, flipK)
// - Layout: buttons+toggle → dropdowns → sliders (no clipping)
// - Smooth display (temporary LINEAR filter only for screen pass)

import button from "../../widgets/src/button.js";
import buttonElement from "../../widgets/src/buttonElement.js";
import toggle from "../../widgets/src/toggle.js";
import toggleElement from "../../widgets/src/toggleElement.js";
import dropdown from "../../widgets/src/dropdown.js";
import dropdownElement from "../../widgets/src/dropdownElement.js";
import slider from "../../widgets/src/slider.js";
import sliderElement from "../../widgets/src/sliderElement.js";

function ensureWidgetsCSS() {
  const href = new URL("../../widgets/src/widgets-plain.css", import.meta.url).href;
  if (!document.querySelector(`link[data-widgets-css="${href}"]`)) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.dataset.widgetsCss = href;
    document.head.appendChild(l);
  }
}

// ── SHADERS ───────────────────────────────────────────────────────────────────
const SIM_VERT = `#version 300 es
precision highp float; layout(location=0) in vec2 a_pos; out vec2 v_uvs[9]; uniform vec2 resolution;
void main(){ vec2 uv=(a_pos+1.0)*0.5; vec2 s=1.0/resolution;
v_uvs[0]=uv; v_uvs[1]=uv+vec2(0.0,-s.y); v_uvs[2]=uv+vec2(s.x,0.0); v_uvs[3]=uv+vec2(0.0,s.y);
v_uvs[4]=uv+vec2(-s.x,0.0); v_uvs[5]=uv+vec2(s.x,-s.y); v_uvs[6]=uv+vec2(s.x,s.y);
v_uvs[7]=uv+vec2(-s.x,s.y); v_uvs[8]=uv+vec2(-s.x,-s.y); gl_Position=vec4(a_pos,0.0,1.0);} `;

const SIM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D previousIterationTexture; uniform float f,k,dA,dB,timestep; uniform vec2 resolution;
uniform vec2 mousePosition; uniform float brushRadius; in vec2 v_uvs[9]; out vec4 fragColor;
vec3 w0=vec3(0.05,0.20,0.05); vec3 w1=vec3(0.20,-1.0,0.20); vec3 w2=vec3(0.05,0.20,0.05);
vec2 lap(vec4 c){ vec2 t=c.xy*w1.y;
t+=texture(previousIterationTexture,fract(v_uvs[1])).xy*(w0.y);
t+=texture(previousIterationTexture,fract(v_uvs[2])).xy*(w1.z);
t+=texture(previousIterationTexture,fract(v_uvs[3])).xy*(w2.y);
t+=texture(previousIterationTexture,fract(v_uvs[4])).xy*(w1.x);
t+=texture(previousIterationTexture,fract(v_uvs[5])).xy*(w0.z);
t+=texture(previousIterationTexture,fract(v_uvs[6])).xy*(w2.z);
t+=texture(previousIterationTexture,fract(v_uvs[7])).xy*(w2.x);
t+=texture(previousIterationTexture,fract(v_uvs[8])).xy*(w0.x);
return t; }
void main(){
  vec4 C=texture(previousIterationTexture,v_uvs[0]); float A=C.r, B=C.g;
  // brush: inject B, slightly remove A near cursor (single frame)
  if(mousePosition.x>=0.0 && mousePosition.y>=0.0){
    vec2 px=v_uvs[0]*resolution, mp=mousePosition*resolution;
    float d=distance(px,mp); if(d<brushRadius){ float t=smoothstep(brushRadius,0.0,d);
      A=mix(A,max(0.0,A-0.15*t),t); B=mix(B,1.0,t); } }
  vec2 L=lap(C); float react=A*B*B;
  float nA=A+((dA*L.x-react)+f*(1.0-A))*timestep;
  float nB=B+((dB*L.y+react)-(k+f)*B)*timestep;
  fragColor=vec4(clamp(nA,0.0,1.0),clamp(nB,0.0,1.0),0.0,1.0);
}`;

const DISP_VERT = `#version 300 es
precision highp float; layout(location=0) in vec2 a_pos; out vec2 v_uv;
void main(){ v_uv=(a_pos+1.0)*0.5; gl_Position=vec4(a_pos,0.0,1.0); }`;

// brighter color controls (brightness & gamma)
const DISP_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D stateTex, colormap;
uniform float u_brightness;   // >1.0 = brighter
uniform float u_gamma;        // <1.0 = brighter mids
out vec4 fragColor;
void main(){
  vec2 ab = texture(stateTex, v_uv).rg;
  float t  = clamp(0.9*ab.g + 0.18*(1.0 - ab.r), 0.0, 1.0);
  vec3  c  = texture(colormap, vec2(t, 0.5)).rgb;
  c = pow(c, vec3(1.0 / max(0.001, u_gamma)));
  c *= u_brightness;
  c = clamp(c, 0.0, 1.0);
  fragColor = vec4(c, 1.0);
}`;

// ── COLORMAPS & GL HELPERS ────────────────────────────────────────────────────
const COLORMAPS = {
  viridis: [[0,[68,1,84]],[0.25,[58,82,139]],[0.5,[32,144,141]],[0.75,[94,201,98]],[1,[253,231,37]]],
  magma: [[0,[0,0,3]],[0.25,[82,18,61]],[0.5,[182,55,121]],[0.75,[251,130,65]],[1,[252,253,191]]],
  gray: [[0,[0,0,0]],[1,[255,255,255]]],
  fire: [[0,[0,0,0]],[0.35,[120,0,0]],[0.65,[255,120,0]],[1,[255,255,200]]],
  ocean: [[0,[0,8,30]],[0.33,[0,58,120]],[0.66,[0,150,180]],[1,[190,255,255]]],
  "purple-teal": [[0,[30,0,60]],[0.5,[110,60,160]],[0.75,[40,160,170]],[1,[200,255,240]]],
};
const lerp=(a,b,t)=>a+(b-a)*t;
const lerp3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
function sampleStops(stops,t){
  if(t<=stops[0][0]) return stops[0][1];
  const n=stops.length-1; if(t>=stops[n][0]) return stops[n][1];
  for(let i=0;i<n;i++){const [p0,c0]=stops[i],[p1,c1]=stops[i+1];
    if(t>=p0&&t<=p1) return lerp3(c0,c1,(t-p0)/(p1-p0));}
  return stops[n][1];
}
function float32ToFloat16Array(srcF32){
  const dst=new Uint16Array(srcF32.length);
  for(let i=0;i<srcF32.length;i++){
    let x=srcF32[i]; if(isNaN(x)){dst[i]=0x7e00;continue;}
    if(!isFinite(x)){dst[i]=(x<0?0xfc00:0x7c00);continue;}
    let sign=x<0?0x8000:0; x=Math.abs(x);
    if(x===0){dst[i]=sign;continue;}
    if(x>=65504){dst[i]=sign|0x7bff;continue;}
    if(x<6.103515625e-5){dst[i]=sign|Math.round(x/5.960464477539063e-8);continue;}
    let e=Math.floor(Math.log2(x)); let m=Math.round(x*Math.pow(2,-e)*1024)-1024; e=e+15;
    dst[i]=sign|(e<<10)|(m&1023);
  } return dst;
}
function makeColormapTex(gl,name="viridis"){
  const stops=COLORMAPS[name]||COLORMAPS.viridis;
  const data=new Uint8Array(256*3);
  for(let i=0;i<256;i++){const c=sampleStops(stops,i/255);
    data[i*3]=c[0]|0; data[i*3+1]=c[1]|0; data[i*3+2]=c[2]|0;}
  const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,256,1,0,gl.RGB,gl.UNSIGNED_BYTE,data);
  return tex;
}
function createProgram(gl,vs,fs){
  const sh=(t,s)=>{const o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o);
    if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)||"shader error"); return o;};
  const p=gl.createProgram(), v=sh(gl.VERTEX_SHADER,vs), f=sh(gl.FRAGMENT_SHADER,fs);
  gl.attachShader(p,v); gl.attachShader(p,f); gl.bindAttribLocation(p,0,"a_pos"); gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)||"link error");
  gl.deleteShader(v); gl.deleteShader(f); return p;
}
function makeFullscreenVAO(gl){
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return {vao,buf};
}
function chooseStateFormat(gl){
  const floatRTT=!!gl.getExtension('EXT_color_buffer_float');
  return floatRTT?{internalFormat:gl.RGBA16F,format:gl.RGBA,type:gl.HALF_FLOAT,isFloat:true}
                 :{internalFormat:gl.RGBA8,format:gl.RGBA,type:gl.UNSIGNED_BYTE,isFloat:false};
}
function makeStateTargets(gl,N,fmt){
  const makeTex=()=>{const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D,0,fmt.internalFormat,N,N,0,fmt.format,fmt.type,null); return t;};
  const makeFBO=t=>{const fb=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
    const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    if(!ok) throw new Error("FBO incomplete"); return fb;};
  const a=makeTex(), b=makeTex(); return {a,b,fboA:makeFBO(a),fboB:makeFBO(b)};
}
function seedState(gl,tex,N,e=0.02,fmt){
  gl.bindTexture(gl.TEXTURE_2D,tex);
  if(fmt.isFloat){
    const f32=new Float32Array(N*N*4);
    for(let i=0;i<N*N;i++){const u=Math.min(1,Math.max(0,1+(Math.random()*2-1)*e));
      const v=Math.max(0,(Math.random()*2-1)*e); f32[i*4]=u; f32[i*4+1]=v; f32[i*4+2]=0; f32[i*4+3]=1;}
    const u16=float32ToFloat16Array(f32); gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    gl.texImage2D(gl.TEXTURE_2D,0,fmt.internalFormat,N,N,0,fmt.format,fmt.type,u16);
  }else{
    const u8=new Uint8Array(N*N*4);
    for(let i=0;i<N*N;i++){const u=Math.min(1,Math.max(0,1+(Math.random()*2-1)*e));
      const v=Math.max(0,(Math.random()*2-1)*e); u8[i*4]=(u*255)|0; u8[i*4+1]=(v*255)|0; u8[i*4+2]=0; u8[i*4+3]=255;}
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    gl.texImage2D(gl.TEXTURE_2D,0,fmt.internalFormat,N,N,0,fmt.format,fmt.type,u8);
  }
}
const sprinkleSalt=(gl,tex,N,fmt)=>seedState(gl,tex,N,0.02,fmt);

// ── EXPLORE CLASS ─────────────────────────────────────────────────────────────
class RDExplorable {
  constructor(mount, opts = {}) {
    ensureWidgetsCSS();
    const el = (mount instanceof Element) ? mount : document.querySelector(mount);
    if (!el) throw new Error("RDExplorable: mount not found");
    this.mount = el;

    this.o = Object.assign({
      // physics
      N: 224, Du: 0.16, Dv: 0.08, F: 0.035, k: 0.065, dt: 1.0, stepsPerFrame: 8, brushRadius: 12,
      // layout
      layout: "row",
      railWidth: 380, railMinWidth: 300, padX: 12, padTop: 22, padBottom: 18,
      groupGap: 16, rowGap: 12, sliderGap: 18, sliderSize: 270, dropdownMaxWidth: 270,
      // visuals
      canvasSizePx: 420, visualGap: 12, colormap: "viridis",
      colorBrightness: 1.35, colorGamma: 0.85,     // brighter defaults
      // F–k map
      paramMap: {
        src: new URL("../assets/karl-sims-parameter-map.png", import.meta.url).href,
        Fmin: 0.0, Fmax: 0.08, kmin: 0.0, kmax: 0.09,
        flipF: false,   // set true if feed increases to the LEFT in your PNG
        flipK: true,    // true means "k increases upward" (typical Karl Sims map)
        crossPad: 10
      }
    }, opts);

    // root
    this.root = document.createElement("div");
    this.root.style.cssText = "display:flex;gap:16px;align-items:flex-start;width:100%;";
    this.root.style.flexDirection = (this.o.layout === "column") ? "column" : "row";
    this.mount.appendChild(this.root);

    // visuals column
    this.vcol = document.createElement("div");
    this.vcol.style.cssText = "flex:1 1 auto;min-width:0;display:flex;flex-direction:column;";
    this.root.appendChild(this.vcol);

    this.glCanvas = document.createElement("canvas");
    this.glCanvas.style.cssText = "display:block;cursor:crosshair;background:transparent;"; // no pixelated -> smoother
    this.vcol.appendChild(this.glCanvas);

    const spacer = document.createElement("div"); spacer.style.height = this.o.visualGap + "px"; this.vcol.appendChild(spacer);

    this.heatWrap = document.createElement("div");
    this.heatWrap.style.cssText = "position:relative;display:block;width:min-content;height:min-content;";
    this.vcol.appendChild(this.heatWrap);

    this.heatCanvas = document.createElement("canvas");
    this.hctx = this.heatCanvas.getContext("2d", { alpha: true });
    this.heatCanvas.style.cssText = "display:block;background:transparent;";
    this.heatWrap.appendChild(this.heatCanvas);

    this.crossCanvas = document.createElement("canvas");
    this.cxctx = this.crossCanvas.getContext("2d", { alpha: true });
    this.crossCanvas.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;";
    this.heatWrap.appendChild(this.crossCanvas);

    // controls rail
    const railW = Math.max(this.o.railMinWidth, this.o.railWidth);
    this.ccol = document.createElement("div");
    this.ccol.className = "d3-widgets";
    this.ccol.style.cssText =
      `flex:0 0 auto;display:flex;flex-direction:column;box-sizing:border-box;`+
      `padding:${this.o.padTop}px ${this.o.padX}px ${this.o.padBottom}px ${this.o.padX}px;`+
      `width:${railW}px;min-width:${railW}px;overflow:auto;`;
    this.root.appendChild(this.ccol);

    // top row (buttons+toggle)
    this.svgTop = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgTop.style.display = "block";
    this.svgTop.style.overflow = "visible";
    this.ccol.appendChild(this.svgTop);
    this.gTop = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.svgTop.appendChild(this.gTop);

    // dropdowns
    this.ddHost = document.createElement("div");
    this.ddHost.style.cssText = `display:flex;flex-direction:column;gap:${this.o.rowGap}px;margin:${this.o.groupGap}px 0 ${this.o.groupGap}px 0;`;
    this.ccol.appendChild(this.ddHost);

    // sliders
    this.svgSliders = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgSliders.style.display = "block";
    this.svgSliders.style.overflow = "visible";
    this.ccol.appendChild(this.svgSliders);
    this.gSliders = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.svgSliders.appendChild(this.gSliders);

    // GL + UI
    this.#initGL(); this.#initSim();
    this.#buildTopRow(); this.#buildDropdowns(); this.#buildSliders();
    this.#wirePainting(); this.#wireHeatInteractions();

    requestAnimationFrame(()=>{ this.#sizeAll(); this.#renderParamMapImage(); this.#drawCrosshair(); });

    this.running = true; this.#syncRunBtn(true); this.#loop();
  }

  play(){ this.running = true; this.#syncRunBtn(true); }
  pause(){ this.running = false; this.#syncRunBtn(false); }
  destroy(){ try{ this.pause(); }catch{} this.root?.remove?.(); }

  // ── GL core ─────────────────────────────────────────────────────────────────
  #initGL(){
    const gl = this.glCanvas.getContext("webgl2", { premultipliedAlpha:false, preserveDrawingBuffer:false });
    if(!gl) throw new Error("WebGL2 not available");
    this.gl=gl;
    this.simProg=createProgram(gl,SIM_VERT,SIM_FRAG);
    this.dispProg=createProgram(gl,DISP_VERT,DISP_FRAG);
    this.quad=makeFullscreenVAO(gl);
    this.N=this.o.N|0; this.fmt=chooseStateFormat(gl);
    this.targets=makeStateTargets(gl,this.N,this.fmt);
    seedState(gl,this.targets.a,this.N,0.02,this.fmt);
    seedState(gl,this.targets.b,this.N,0.02,this.fmt);
    this.frontTex=this.targets.a; this.backTex=this.targets.b;
    this.frontFBO=this.targets.fboA; this.backFBO=this.targets.fboB;
    this.cmapTex=makeColormapTex(gl,this.o.colormap);
    this.u={sim:{
      resolution:gl.getUniformLocation(this.simProg,"resolution"),
      prevTex:gl.getUniformLocation(this.simProg,"previousIterationTexture"),
      f:gl.getUniformLocation(this.simProg,"f"),
      k:gl.getUniformLocation(this.simProg,"k"),
      dA:gl.getUniformLocation(this.simProg,"dA"),
      dB:gl.getUniformLocation(this.simProg,"dB"),
      timestep:gl.getUniformLocation(this.simProg,"timestep"),
      mousePos:gl.getUniformLocation(this.simProg,"mousePosition"),
      brushR:gl.getUniformLocation(this.simProg,"brushRadius"),
    }, disp:{
      stateTex:gl.getUniformLocation(this.dispProg,"stateTex"),
      colormap:gl.getUniformLocation(this.dispProg,"colormap"),
      brightness:gl.getUniformLocation(this.dispProg,"u_brightness"),
      gamma:gl.getUniformLocation(this.dispProg,"u_gamma"),
    }};
  }
  #initSim(){ this.mouse={x:-1,y:-1}; }

  #stepSimulation(){
    const gl=this.gl;
    gl.bindVertexArray(this.quad.vao);
    gl.viewport(0,0,this.N,this.N);
    gl.useProgram(this.simProg);
    gl.uniform2f(this.u.sim.resolution,this.N,this.N);
    gl.uniform1f(this.u.sim.f,this.o.F);
    gl.uniform1f(this.u.sim.k,this.o.k);
    gl.uniform1f(this.u.sim.dA,this.o.Du);
    gl.uniform1f(this.u.sim.dB,this.o.Dv);
    gl.uniform1f(this.u.sim.timestep,this.o.dt);
    gl.uniform2f(this.u.sim.mousePos,this.mouse.x,this.mouse.y);
    gl.uniform1f(this.u.sim.brushR,this.o.brushRadius);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.frontTex);
    gl.uniform1i(this.u.sim.prevTex,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.backFBO);
    gl.drawArrays(gl.TRIANGLES,0,6);
    [this.frontTex,this.backTex]=[this.backTex,this.frontTex];
    [this.frontFBO,this.backFBO]=[this.backFBO,this.frontFBO];
    // one-stamp per frame
    this.mouse.x=-1; this.mouse.y=-1;
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.bindVertexArray(null);
  }

  #drawToScreen(){
    const gl=this.gl;
    // temporarily smooth the texture for upscaled display
    gl.bindTexture(gl.TEXTURE_2D, this.frontTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.viewport(0,0,this.glCanvas.width,this.glCanvas.height);
    gl.bindVertexArray(this.quad.vao);
    gl.useProgram(this.dispProg);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.frontTex);
    gl.uniform1i(this.u.disp.stateTex,0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,this.cmapTex);
    gl.uniform1i(this.u.disp.colormap,1);
    gl.uniform1f(this.u.disp.brightness, this.o.colorBrightness || 1.0);
    gl.uniform1f(this.u.disp.gamma,      this.o.colorGamma      || 1.0);
    gl.drawArrays(gl.TRIANGLES,0,6);
    gl.bindVertexArray(null);

    // restore NEAREST so the next simulation step uses exact neighbor samples
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  #loop(){
    const tick=()=>{ if(this.running){ const s=Math.max(1,this.o.stepsPerFrame|0); for(let i=0;i<s;i++) this.#stepSimulation(); }
      this.#drawToScreen(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  // ── UI: Top row ─────────────────────────────────────────────────────────────
  #buildTopRow(){
    const g=this.gTop, innerW=Math.max(this.o.railMinWidth,this.o.railWidth)-2*this.o.padX;
    this.svgTop.setAttribute("width", String(innerW));
    let y=0, x=0; const h=40, gap=10;

    const mkBtn=(dx,label,actions,onUpdate,ref)=>{
      const b=button().size(h).symbolsize(0.34).label(label).labelposition("right")
        .position({x:dx,y}).actions(actions);
      b.update(onUpdate); const el=buttonElement(b); g.appendChild(el); if(ref) this[ref]=b;
    };
    mkBtn(x,"run",["play","pause"],()=>{ const on=this.playBtn.value()===1; this.running=on; this.#syncRunBtn(on); },"playBtn"); x+=140+gap;
    mkBtn(x,"reset",["reload"],()=>{ seedState(this.gl,this.frontTex,this.N,0.02,this.fmt); }); x+=120+gap;
    mkBtn(x,"noise",["push"],()=>{ seedState(this.gl,this.frontTex,this.N,0.035,this.fmt); }); x+=120+gap;
    mkBtn(x,"salt",["capture"],()=>{ sprinkleSalt(this.gl,this.frontTex,this.N,this.fmt); }); x+=110+gap;

    this.wrapToggle=toggle().size(10).position({x, y:y+10}).label("wrap edges").labelposition("right").value(1);
    this.wrapToggle.update(()=>{ /* textures are REPEAT already */ });
    g.appendChild(toggleElement(this.wrapToggle));

    this.svgTop.setAttribute("height", String(h + this.o.rowGap + 10)); // headroom
  }

  // ── UI: Dropdowns ───────────────────────────────────────────────────────────
  #buildDropdowns(){
    const presets=[
      {label:"Classic (0.035, 0.065)", value:"classic", F:0.035, k:0.065},
      {label:"Spots (0.040, 0.060)",   value:"spots",   F:0.040, k:0.060},
      {label:"Worms (0.022, 0.051)",   value:"worms",   F:0.022, k:0.051},
      {label:"Mitosis (0.037, 0.064)", value:"mitosis", F:0.037, k:0.064},
      {label:"Solitons (0.030, 0.062)",value:"solitons",F:0.030, k:0.062},
      {label:"Chaos (0.026, 0.051)",   value:"chaos",   F:0.026, k:0.051}
    ];
    this.presetDD=dropdown().id("rd-presets").label("preset")
      .options(presets.map(p=>({label:p.label,value:p.value}))).value("classic")
      .update(()=>{
        const p=presets.find(d=>d.value===this.presetDD.value()); if(!p) return;
        this.#setFk(p.F, p.k, 80);
      });
    const pEl=dropdownElement(this.presetDD); pEl.style.maxWidth=`${this.o.dropdownMaxWidth|0}px`; this.ddHost.appendChild(pEl);

    const cmapOptions=Object.keys(COLORMAPS).map(k=>({label:k,value:k}));
    this.cmapDD=dropdown().id("rd-cmap").label("colormap")
      .options(cmapOptions).value(this.o.colormap)
      .update(()=>{ this.gl.deleteTexture(this.cmapTex); this.cmapTex=makeColormapTex(this.gl,this.cmapDD.value()); });
    const cEl=dropdownElement(this.cmapDD); cEl.style.maxWidth=`${this.o.dropdownMaxWidth|0}px`; this.ddHost.appendChild(cEl);
  }

  // ── UI: Sliders ─────────────────────────────────────────────────────────────
  #buildSliders(){
    const g=this.gSliders, innerW=Math.max(this.o.railMinWidth,this.o.railWidth)-2*this.o.padX;
    this.svgSliders.setAttribute("width", String(innerW));
    let y=0;
    const mk=(id,lab,val,rng,setter,ref)=>{
      const sl=slider().id(id).label(lab).size(this.o.sliderSize).girth(10).knob(11)
        .position({x:0,y}).labelposition("top-left").range(rng).value(val)
        .update(()=>setter(sl.value()));
      g.appendChild(sliderElement(sl)); y+=46+this.o.sliderGap; if(ref) this[ref]=sl;
    };
    mk("Du","Dᵤ (diffusion)", this.o.Du, [0.0,0.4], v=>{ this.o.Du=v; });
    mk("Dv","Dᵥ (diffusion)", this.o.Dv, [0.0,0.4], v=>{ this.o.Dv=v; });
    mk("F","F (feed)", this.o.F, [0.0,0.08], v=>{ this.#setFk(v, this.o.k, 40, true); }, "FSlider");
    mk("k","k (kill)", this.o.k, [0.0,0.09], v=>{ this.#setFk(this.o.F, v, 40, true); }, "kSlider");
    mk("dt","Δt (time step)", this.o.dt, [0.2,2.5], v=>{ this.o.dt=v; });
    mk("spf","steps / frame", this.o.stepsPerFrame, [1,60], v=>{ this.o.stepsPerFrame=Math.round(v); });
    mk("br","brush radius", this.o.brushRadius, [1,40], v=>{ this.o.brushRadius=Math.round(v); });
    // optional UI for brightness/gamma (commented by default)
    // mk("cb","colormap brightness", this.o.colorBrightness, [0.6, 2.0], v=>{ this.o.colorBrightness=v; });
    // mk("cg","colormap gamma",      this.o.colorGamma,      [0.6, 1.4], v=>{ this.o.colorGamma=v; });

    this.svgSliders.setAttribute("height", String(y));
  }

  // centralized F–k setter keeps map & sliders in sync and warms up
  #setFk(F, k, warm=40, fromSliders=false){
    this.o.F = Math.max(0, Math.min(0.08, F));
    this.o.k = Math.max(0, Math.min(0.09, k));
    if (!fromSliders) {
      this.FSlider?.value(this.o.F); this.FSlider?.update?.();
      this.kSlider?.value(this.o.k); this.kSlider?.update?.();
    }
    this.#drawCrosshair();
    for (let i=0;i<warm;i++) this.#stepSimulation();
  }

  // painting (y flipped so brush hits under cursor)
  #wirePainting(){
    const normPos = (evt)=>{
      const e=evt.touches?evt.touches[0]:evt;
      const r=this.glCanvas.getBoundingClientRect();
      const nx=(e.clientX-r.left)/r.width;
      const ny=1-((e.clientY-r.top)/r.height);
      return {x:nx,y:ny};
    };
    const down=(e)=>{ e.preventDefault(); const p=normPos(e); this.mouse.x=p.x; this.mouse.y=p.y; this._paint=true; };
    const move=(e)=>{ if(!this._paint) return; const p=normPos(e); this.mouse.x=p.x; this.mouse.y=p.y; };
    const up=()=>{ this._paint=false; };
    this.glCanvas.addEventListener("mousedown",down);
    window.addEventListener("mousemove",move);
    window.addEventListener("mouseup",up);
    this.glCanvas.addEventListener("touchstart",down,{passive:false});
    window.addEventListener("touchmove",move,{passive:false});
    window.addEventListener("touchend",up);
  }

  // F–k map (click/drag commit; handles axis flips)
  async #renderParamMapImage(){
    const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1));
    const size=Math.max(120,this.o.canvasSizePx|0);
    const apply=(c,ctx)=>{ c.style.width=size+"px"; c.style.height=size+"px"; c.width=size*dpr; c.height=size*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); };
    apply(this.heatCanvas,this.hctx); apply(this.crossCanvas,this.cxctx);

    if(!this._paramImg){
      const img=new Image(); img.crossOrigin="anonymous"; img.src=this.o.paramMap.src;
      await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; }); this._paramImg=img;
    }
    this.hctx.clearRect(0,0,size,size); this.hctx.imageSmoothingEnabled=true;
    this.hctx.drawImage(this._paramImg,0,0,this._paramImg.naturalWidth,this._paramImg.naturalHeight,0,0,size,size);
  }
  #drawCrosshair(){
    const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1)), size=this.crossCanvas.width/dpr;
    const pad=Math.max(8,this.o.paramMap.crossPad||10), box=size-2*pad, {Fmin,Fmax,kmin,kmax}=this.o.paramMap;
    let nx=(this.o.F-Fmin)/(Fmax-Fmin); if(this.o.paramMap.flipF) nx=1-nx;
    let ny=1-(this.o.k-kmin)/(kmax-kmin); if(!this.o.paramMap.flipK) ny=1-ny; // flipK=true => up increases
    const px=pad+nx*box, py=pad+ny*box;

    const ctx=this.cxctx; ctx.clearRect(0,0,size,size); ctx.save();
    ctx.strokeStyle="#0f172a"; ctx.lineWidth=1*dpr;
    ctx.beginPath(); ctx.moveTo(px,pad); ctx.lineTo(px,pad+box); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad,py); ctx.lineTo(pad+box,py); ctx.stroke();
    ctx.fillStyle="#0f172a"; ctx.font=`${12*dpr}px system-ui,-apple-system,Segoe UI,Roboto,sans-serif`;
    ctx.fillText(`F=${this.o.F.toFixed(3)}, k=${this.o.k.toFixed(3)}`, pad+12, pad+14);
    ctx.restore();
  }
  #wireHeatInteractions(){
    const normalize=(clientX,clientY)=>{
      const r=this.crossCanvas.getBoundingClientRect();
      const x=clientX-r.left, y=clientY-r.top;
      const size=this.crossCanvas.clientWidth, pad=Math.max(8,this.o.paramMap.crossPad||10), box=size-2*pad;
      let nx=Math.min(1,Math.max(0,(x-pad)/box));
      let ny=Math.min(1,Math.max(0,(y-pad)/box));
      if(this.o.paramMap.flipF) nx=1-nx;
      if(this.o.paramMap.flipK) ny=1-ny;
      const {Fmin,Fmax,kmin,kmax}=this.o.paramMap;
      return {F: Fmin+nx*(Fmax-Fmin), k: kmin+ny*(kmax-kmin)};
    };
    const onDown=(e)=>{ e.preventDefault(); const p=e.touches?e.touches[0]:e; const {F,k}=normalize(p.clientX,p.clientY); this.#setFk(F,k,80); this._explore=true; };
    const onDrag=(e)=>{ if(!this._explore) return; const p=e.touches?e.touches[0]:e; const {F,k}=normalize(p.clientX,p.clientY); this.#setFk(F,k,20); };
    const onUp=()=>{ this._explore=false; };
    this.heatWrap.addEventListener("mousedown",onDown);
    window.addEventListener("mousemove",onDrag);
    window.addEventListener("mouseup",onUp);
    this.heatWrap.addEventListener("touchstart",onDown,{passive:false});
    window.addEventListener("touchmove",onDrag,{passive:false});
    window.addEventListener("touchend",onUp);
  }

  // sizing
  #sizeAll(){
    const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1));
    const size=Math.max(120,this.o.canvasSizePx|0);
    const gl=this.gl;
    this.glCanvas.style.width=size+"px"; this.glCanvas.style.height=size+"px";
    this.glCanvas.width=size*dpr; this.glCanvas.height=size*dpr; gl.viewport(0,0,this.glCanvas.width,this.glCanvas.height);
    this.heatCanvas.style.width=size+"px"; this.heatCanvas.style.height=size+"px";
    this.crossCanvas.style.width=size+"px"; this.crossCanvas.style.height=size+"px";
    this.heatCanvas.width=size*dpr; this.heatCanvas.height=size*dpr;
    this.crossCanvas.width=size*dpr; this.crossCanvas.height=size*dpr;
    this.cxctx.setTransform(dpr,0,0,dpr,0,0); this.hctx.setTransform(dpr,0,0,dpr,0,0);
    const innerW=Math.max(this.o.railMinWidth,this.o.railWidth)-2*this.o.padX;
    this.svgTop.setAttribute("width", String(innerW));
    this.svgSliders.setAttribute("width", String(innerW));
  }

  #syncRunBtn(on){ try{ this.playBtn?.value(on?1:0); this.playBtn?.update?.(); }catch{} }
}

export default RDExplorable;
export { RDExplorable };