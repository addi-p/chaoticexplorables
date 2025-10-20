// packages/reactiondiffusion_yt_intro/src/index.js
// Gray–Scott Reaction–Diffusion — Logo/Text Intro (WebGL2)
// Cleaned: fixes private method reference errors and stray commas,
// wires controls in the requested order, and keeps seeding/physics improvements.

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

const debounce = (fn, ms = 250) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

// ─────────────────── Shaders ───────────────────
const SIM_VERT = `#version 300 es
precision highp float; layout(location=0) in vec2 a_pos; out vec2 v_uvs[9]; uniform vec2 resolution;
void main(){ vec2 uv=(a_pos+1.0)*0.5; vec2 s=1.0/resolution;
v_uvs[0]=uv; v_uvs[1]=uv+vec2(0.0,-s.y); v_uvs[2]=uv+vec2(s.x,0.0); v_uvs[3]=uv+vec2(0.0,s.y);
v_uvs[4]=uv+vec2(-s.x,0.0); v_uvs[5]=uv+vec2(s.x,-s.y); v_uvs[6]=uv+vec2(s.x,s.y);
v_uvs[7]=uv+vec2(-s.x,s.y); v_uvs[8]=uv+vec2(-s.x,-s.y); gl_Position=vec4(a_pos,0.0,1.0);} `;

const SIM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D previousIterationTexture;
uniform vec2 resolution;
uniform float f, k, dA, dB, timestep;
uniform vec2 mousePosition; uniform float brushRadius;
uniform vec2 bias;
uniform sampler2D styleMapTexture;
uniform vec2 styleMapResolution;
uniform vec4 styleMapTransforms;
uniform vec4 styleMapParameters;
in vec2 v_uvs[9]; out vec4 fragColor;

// Slightly “looser” 5/9-point style weights (Karl Sims vibe) + bias
vec3 w0=vec3(0.05,0.20,0.05);
vec3 w1=vec3(0.20,-1.0,0.20);
vec3 w2=vec3(0.05,0.20,0.05);

vec2 laplacian(vec4 c){
  vec2 t=c.xy*w1.y;
  t+=texture(previousIterationTexture,fract(v_uvs[1])).xy*(w0.y + bias.y);
  t+=texture(previousIterationTexture,fract(v_uvs[2])).xy*(w1.z + bias.x);
  t+=texture(previousIterationTexture,fract(v_uvs[3])).xy*(w2.y - bias.y);
  t+=texture(previousIterationTexture,fract(v_uvs[4])).xy*(w1.x - bias.x);
  t+=texture(previousIterationTexture,fract(v_uvs[5])).xy*(w0.z);
  t+=texture(previousIterationTexture,fract(v_uvs[6])).xy*(w2.z);
  t+=texture(previousIterationTexture,fract(v_uvs[7])).xy*(w2.x);
  t+=texture(previousIterationTexture,fract(v_uvs[8])).xy*(w0.x);
  return t;
}

vec4 getStyleMapTexel(vec2 uv){
  float scale = styleMapTransforms[0];
  float ang   = styleMapTransforms[1];
  float xOff  = -styleMapTransforms[2]/resolution.x;
  float yOff  =  styleMapTransforms[3]/resolution.y;
  vec2 tUV = uv + vec2(xOff,yOff);
  tUV /= max(0.0001,scale);
  float s=sin(ang), c=cos(ang);
  mat2 R = mat2(c, s,-s, c);
  vec2 pivot = vec2(0.5,0.5);
  tUV = (R*(tUV - pivot))+pivot;
  return texture(styleMapTexture, tUV);
}

void main(){
  vec4 C = texture(previousIterationTexture, v_uvs[0]);
  float A = C.r, B = C.g;

  // one-shot brush write
  if(mousePosition.x>=0.0 && mousePosition.y>=0.0){
    vec2 res=resolution; vec2 px=v_uvs[0]*res, mp=mousePosition*res;
    float d=distance(px,mp); if(d<brushRadius){ float t=smoothstep(brushRadius,0.0,d);
      A=mix(A,max(0.0,A-0.15*t),t); B=mix(B,1.0,t); }
  }

  float nf=f, nk=k, ndA=dA, ndB=dB;
  if (styleMapResolution != vec2(-1.0,-1.0)){
    vec4 texel = getStyleMapTexel(v_uvs[0]);
    float lum = (0.30*texel.r + 0.59*texel.g + 0.11*texel.b);
    nf = mix(f, f*0.2 + 0.8*lum, styleMapParameters[0]);
    nk = mix(k, k*0.2 + 0.8*(1.0-lum), styleMapParameters[1]);
    ndA = mix(dA, mix(0.06,0.36,lum), styleMapParameters[2]);
    ndB = mix(dB, mix(0.03,0.30,1.0-lum), styleMapParameters[3]);
  }

  vec2 L = laplacian(C);
  float react = A*B*B;
  float nA = A + ((ndA*L.x - react) + nf*(1.0 - A)) * timestep;
  float nB = B + ((ndB*L.y + react) - (nk + nf)*B) * timestep;

  fragColor = vec4(clamp(nA,0.0,1.0), clamp(nB,0.0,1.0), 0.0, 1.0);
}`;

const PIG_VERT = SIM_VERT;
const PIG_FRAG = `#version 300 es
precision highp float;
uniform sampler2D prevPigment; uniform sampler2D stateTex;
uniform float Dp, decay, dtp; uniform vec2 resolution;
in vec2 v_uvs[9]; out vec4 fragColor;
vec3 w0=vec3(0.05,0.20,0.05); vec3 w1=vec3(0.20,-1.0,0.20); vec3 w2=vec3(0.05,0.20,0.05);
vec3 L(vec3 c){
  vec3 t=c*w1.y;
  t+=texture(prevPigment,fract(v_uvs[1])).rgb*(w0.y);
  t+=texture(prevPigment,fract(v_uvs[2])).rgb*(w1.z);
  t+=texture(prevPigment,fract(v_uvs[3])).rgb*(w2.y);
  t+=texture(prevPigment,fract(v_uvs[4])).rgb*(w1.x);
  t+=texture(prevPigment,fract(v_uvs[5])).rgb*(w0.z);
  t+=texture(prevPigment,fract(v_uvs[6])).rgb*(w2.z);
  t+=texture(prevPigment,fract(v_uvs[7])).rgb*(w2.x);
  t+=texture(prevPigment,fract(v_uvs[8])).rgb*(w0.x);
  return t;
}
void main(){
  vec2 uv = v_uvs[0];
  vec3 P = texture(prevPigment, uv).rgb;
  vec3 lap = L(P);
  float B = texture(stateTex, uv).g;
  vec3 dP = (Dp * lap - decay * P) * dtp;
  float retain = mix(0.92, 1.02, clamp(B*1.4, 0.0, 1.0));
  vec3 Pn = clamp(P * retain + dP, 0.0, 1.0);
  fragColor = vec4(Pn, 1.0);
}`;

const DISP_VERT = `#version 300 es
precision highp float; layout(location=0) in vec2 a_pos; out vec2 v_uv;
void main(){ v_uv=(a_pos+1.0)*0.5; gl_Position=vec4(a_pos,0.0,1.0); }`;

const DISP_FRAG = `#version 300 es
precision highp float; in vec2 v_uv;
uniform sampler2D stateTex, colormap, pigmentTex;
uniform float u_brightness, u_gamma, pigmentMix, toneCurve;
uniform float u_saturation, u_contrast, u_exposure, u_black, u_white;
out vec4 fragColor;

vec3 applyLevels(vec3 c, float black, float white){
  c = clamp((c - black) / max(1e-4, (white - black)), 0.0, 1.0);
  return c;
}
vec3 applyExposure(vec3 c, float exp){ return c * exp; }
vec3 applySaturation(vec3 c, float sat){
  float l = dot(c, vec3(0.299,0.587,0.114));
  return mix(vec3(l), c, sat);
}
vec3 applyContrast(vec3 c, float contrast){ return (c - 0.5) * contrast + 0.5; }

void main(){
  vec2 ab = texture(stateTex, v_uv).rg;
  float t  = clamp(0.85*ab.g + 0.20*(1.0 - ab.r), 0.0, 1.0);
  t = pow(t, toneCurve);
  vec3 base  = texture(colormap, vec2(t, 0.5)).rgb;
  vec3 pig   = texture(pigmentTex, v_uv).rgb;
  vec3 color = mix(base, clamp(base*0.6 + pig*1.0, 0.0, 1.0), pigmentMix);

  color = applyLevels(color, u_black, u_white);
  color = applyExposure(color, u_exposure);
  color = applySaturation(color, u_saturation);
  color = applyContrast(color, u_contrast);

  color = pow(color, vec3(1.0 / max(0.001, u_gamma)));
  color *= u_brightness;

  color = clamp(color, 0.0, 1.0);
  fragColor = vec4(color, 1.0);
}`;

// ─────────── Colormaps ───────────
const COLORMAPS = {
  viridis: [[0,[68,1,84]],[0.13,[72,33,115]],[0.25,[63,80,139]],[0.38,[46,119,142]],[0.5,[32,144,141]],[0.63,[40,174,127]],[0.75,[94,201,98]],[0.88,[170,220,50]],[1,[253,231,37]]],
  magma:   [[0,[0,0,3]],[0.15,[46,5,46]],[0.3,[121,23,93]],[0.45,[181,54,122]],[0.6,[229,95,99]],[0.75,[252,157,77]],[0.9,[252,211,121]],[1,[252,253,191]]],
  inferno: [[0,[0,0,3]],[0.1,[31,12,72]],[0.25,[84,15,109]],[0.4,[148,34,106]],[0.55,[203,73,98]],[0.7,[248,131,84]],[0.85,[252,194,72]],[1,[252,255,164]]],
  turbo:   [[0,[48,18,59]],[0.17,[65,90,204]],[0.33,[59,183,235]],[0.5,[67,213,119]],[0.66,[245,214,70]],[0.83,[241,131,66]],[1,[175,48,58]]],
  rainbow: [[0,[150,0,90]],[0.2,[0,0,200]],[0.4,[0,200,200]],[0.6,[0,200,0]],[0.8,[200,200,0]],[1,[200,0,0]]],
  gray:    [[0,[0,0,0]],[1,[255,255,255]]],
  gray_r:  [[0,[255,255,255]],[1,[0,0,0]]]
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
function makeColormapTex(gl,name="viridis",samples=1024){
  const stops=COLORMAPS[name]||COLORMAPS.viridis;
  const data=new Uint8Array(samples*3);
  for(let i=0;i<samples;i++){const c=sampleStops(stops,i/(samples-1));
    data[i*3]=c[0]|0; data[i*3+1]=c[1]|0; data[i*3+2]=c[2]|0;}
  const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,samples,1,0,gl.RGB,gl.UNSIGNED_BYTE,data);
  return t;
}

// ─────────── GL helpers ───────────
function createProgram(gl,vs,fs){
  const sh=(type,src)=>{
    const o=gl.createShader(type);
    gl.shaderSource(o,src);
    gl.compileShader(o);
    if(!gl.getShaderParameter(o, gl.COMPILE_STATUS)){
      const log = gl.getShaderInfoLog(o) || "shader compile error";
      const numbered = src.split('\n').map((l,i)=>`${(i+1).toString().padStart(3,' ')} | ${l}`).join('\n');
      throw new Error(`${type===gl.VERTEX_SHADER?'VERTEX':'FRAGMENT'}\n${log}\n\n${numbered}`);
    }
    return o;
  };
  const p=gl.createProgram(), v=sh(gl.VERTEX_SHADER,vs), f=sh(gl.FRAGMENT_SHADER,fs);
  gl.attachShader(p,v); gl.attachShader(p,f); gl.bindAttribLocation(p,0,"a_pos"); gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)||"program link error");
  gl.deleteShader(v); gl.deleteShader(f);
  return p;
}
function makeFullscreenVAO(gl){
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 1,-1, -1,1,  -1,1, 1,-1, 1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.bindVertexArray(null); return {vao,buf};
}
function chooseStateFormat(gl){
  const floatRTT=!!gl.getExtension('EXT_color_buffer_float');
  return floatRTT?{internalFormat:gl.RGBA16F,format:gl.RGBA,type:gl.HALF_FLOAT,isFloat:true}
                 :{internalFormat:gl.RGBA8, format:gl.RGBA,type:gl.UNSIGNED_BYTE,isFloat:false};
}
function makeTex(gl, N, fmt, filter=gl.NEAREST){
  const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D,0,fmt.internalFormat,N,N,0,fmt.format,fmt.type,null); return t;
}
function makeFBO(gl, tex){
  const fb=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
  const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  if(!ok) throw new Error("FBO incomplete"); return fb;
}
function makeStateTargets(gl,N,fmt){
  const a=makeTex(gl,N,fmt), b=makeTex(gl,N,fmt);
  return {a,b,fboA:makeFBO(gl,a),fboB:makeFBO(gl,b)};
}
function makePigmentTargets(gl,N){
  const tA=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tA);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB8,N,N,0,gl.RGB,gl.UNSIGNED_BYTE,null);
  const tB=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tB);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB8,N,N,0,gl.RGB,gl.UNSIGNED_BYTE,null);
  return {a:tA,b:tB,fboA:makeFBO(gl,tA),fboB:makeFBO(gl,tB)};
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
function fillUniform(gl, tex, N, fmt, A, B){
  gl.bindTexture(gl.TEXTURE_2D, tex);
  if(fmt.isFloat){
    const f32=new Float32Array(N*N*4);
    for(let i=0;i<N*N;i++){ f32[i*4]=A; f32[i*4+1]=B; f32[i*4+2]=0; f32[i*4+3]=1; }
    const u16=float32ToFloat16Array(f32); gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    gl.texImage2D(gl.TEXTURE_2D,0,fmt.internalFormat,N,N,0,fmt.format,fmt.type,u16);
  }else{
    const u8=new Uint8Array(N*N*4);
    for(let i=0;i<N*N;i++){ u8[i*4]=(A*255)|0; u8[i*4+1]=(B*255)|0; u8[i*4+2]=0; u8[i*4+3]=255; }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    gl.texImage2D(gl.TEXTURE_2D,0,fmt.internalFormat,N,N,0,fmt.format,gl.UNSIGNED_BYTE,u8);
  }
}
function seedPigmentFromCanvas(gl, tex, N, srcCanvas, alphaCut = 48) {
  const S = srcCanvas.width | 0;
  const ctx = srcCanvas.getContext("2d", { willReadFrequently: true });
  const src = ctx.getImageData(0, 0, S, S).data; // RGBA

  const dst = new Uint8Array(N * N * 3);

  for (let y = 0; y < N; y++) {
    const sy = Math.min(S - 1, Math.round((y * (S - 1)) / (N - 1)));
    for (let x = 0; x < N; x++) {
      const sx = Math.min(S - 1, Math.round((x * (S - 1)) / (N - 1)));
      const si = (sy * S + sx) * 4;
      const di = (y * N + x) * 3;

      const a = src[si + 3];
      if (a >= alphaCut) {
        dst[di    ] = src[si    ];
        dst[di + 1] = src[si + 1];
        dst[di + 2] = src[si + 2];
      } else {
        dst[di    ] = 0;
        dst[di + 1] = 0;
        dst[di + 2] = 0;
      }
    }
  }

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, N, N, 0, gl.RGB, gl.UNSIGNED_BYTE, dst);
}

// ─────────── Hi-res outline helpers ───────────
function gaussianKernel1D(sigma){
  const r = Math.max(1, Math.ceil(sigma * 3.0));
  const k = new Float32Array(r*2+1);
  const s2 = 2*sigma*sigma;
  let sum = 0;
  for (let i=-r;i<=r;i++){ const v = Math.exp(-(i*i)/s2); k[i+r]=v; sum+=v; }
  for (let i=0;i<k.length;i++) k[i]/=sum;
  return k;
}
function blur1D(line, tmp, n, k){
  const r=(k.length-1)>>1;
  for(let i=0;i<n;i++){
    let acc=0.0;
    for(let j=-r;j<=r;j++){
      const idx=Math.min(n-1, Math.max(0, i+j));
      acc += line[idx] * k[j+r];
    }
    tmp[i]=acc;
  }
  for(let i=0;i<n;i++) line[i]=tmp[i];
}
function distanceTransform(bin, W, H){
  const INF = 1e9;
  const d = new Float32Array(W*H);
  for(let i=0;i<d.length;i++) d[i] = bin[i] ? INF : 0;
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      const i=y*W+x;
      const v = d[i];
      if(v===0) continue;
      let best = v;
      if(x>0) best = Math.min(best, d[i-1] + 1.0);
      if(y>0) best = Math.min(best, d[i-W] + 1.0);
      if(x>0 && y>0) best = Math.min(best, d[i-W-1] + 1.414);
      if(x+1<W && y>0) best = Math.min(best, d[i-W+1] + 1.414);
      d[i] = best;
    }
  }
  for(let y=H-1;y>=0;y--){
    for(let x=W-1;x>=0;x--){
      const i=y*W+x;
      const v=d[i];
      let best=v;
      if(x+1<W) best = Math.min(best, d[i+1] + 1.0);
      if(y+1<H) best = Math.min(best, d[i+W] + 1.0);
      if(x+1<W && y+1<H) best = Math.min(best, d[i+W+1] + 1.414);
      if(x>0 && y+1<H)   best = Math.min(best, d[i+W-1] + 1.414);
      d[i]=best;
    }
  }
  return d;
}

// ─────────── Explorable ───────────
class RDLogoExplorable {
  constructor(mount, opts = {}) {
    ensureWidgetsCSS();

    const el = mount instanceof Element ? mount : document.querySelector(mount);
    if(!el) throw new Error("RDLogoExplorable: mount not found");
    this.mount = el;

    this.o = Object.assign({
      // physics
      N: 1000, Du: 0.16, Dv: 0.08, F: 0.035, k: 0.065, dt: 1.0, stepsPerFrame: 10, brushRadius: 14,
      biasX: 0.0, biasY: 0.0,

      // pigment
      Dp: 0.12, pigmentDecay: 0.01, pigmentDt: 1.0, pigmentMix: 0.75, toneCurve: 0.85,

      // layout
      layout: "row",
      railWidth: 600, railMinWidth: 600,
      padX: 20, padTop: 20, padBottom: 18,
      groupGap: 40, rowGap: 10, sliderGap: 20, sliderSizePx: 280, dropdownMaxWidth: 300,

      // slider grid
      sliderColumns: 3, sliderColGap: 20,
      sliderWidths: null,

      // visuals
      canvasSizePx: 800, visualGap: 14, colormap: "viridis",
      colorBrightness: 1.45, colorGamma: 0.82, saturation: 1.25, contrast: 1.15, exposure: 1.08, black: 0.02, white: 0.98,

      // F–k map inside rail
      mapPaneWidth: 300, paramMapSizePx: 280,
      paramMap: {
        src: new URL("../../reactiondiffusion/src/karl-sims-parameter-map_transparent.png", import.meta.url).href,
        Fmin: 0.0, Fmax: 0.08, kmin: 0.0, kmax: 0.09, flipF:false, flipK:false, crossPad: 2
      },

      // seeding (PNG or Text; start paused)
      seedSource: "png",
      seedThreshold: 0.15,
      seedEdge: 3,
      seedScale: 1.0,
      seedRotationDeg: 0,
      seedFlipY: true,
      seedInvert: "auto",
      text: "SynoSys",
      font: "800 140px system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      textFill: "#000000",
      seedPrecisionScale: 4,
      seedPreBlurPx: 1.25,
      seedAdaptiveTiles: 8,
      seedAdaptiveOffset: -0.02,
      seedEdgeBandPx: 3.0,
      seedInsideGrowPx: 0.0,

      // recording
      exportFPS: 60
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
    this.glCanvas.style.cssText = "display:block;cursor:crosshair;background:transparent;";
    this.vcol.appendChild(this.glCanvas);
    const spacer = document.createElement("div");
    spacer.style.height = this.o.visualGap + "px";
    this.vcol.appendChild(spacer);

    // controls rail
    const railW = Math.max(this.o.railMinWidth, this.o.railWidth);
    this.ccol = document.createElement("div");
    this.ccol.className = "d3-widgets";
    this.ccol.style.cssText =
      `flex:0 0 auto;display:flex;flex-direction:column;box-sizing:border-box;`+
      `padding:${this.o.padTop}px ${this.o.padX}px ${this.o.padBottom}px ${this.o.padX}px;`+
      `width:${railW}px;min-width:${railW}px;overflow:auto;`;
    this.root.appendChild(this.ccol);

    // --- BUTTONS/TOGGLES (auto-wrap)
    this.svgTop = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgTop.style.display="block";
    this.svgTop.style.overflow="visible";
    this.ccol.appendChild(this.svgTop);
    this.gTop = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.svgTop.appendChild(this.gTop);
    this.#buildButtonsWrapped();

    // --- FILE & TEXT row
    this.ioRow = document.createElement("div");
    this.ioRow.style.cssText = `display:flex;flex-direction:row;gap:${this.o.rowGap}px;align-items:flex-end;margin:${this.o.groupGap}px 0 ${this.o.rowGap}px 0;`;
    this.ccol.appendChild(this.ioRow);
    this.#buildFileAndTextRow();

    // --- DROPDOWNS row
    this.ddRow = document.createElement("div");
    this.ddRow.style.cssText = `display:flex;flex-direction:row;flex-wrap:wrap;gap:${this.o.rowGap}px;margin:0 0 ${this.o.groupGap}px 0;`;
    this.ccol.appendChild(this.ddRow);
    this.#buildDropdowns();

    // --- CONTROL GRID: Left (F–k map) | Right (sliders)
    this.gridRow = document.createElement("div");
    this.gridRow.style.cssText = `display:flex;flex-direction:row;gap:${this.o.sliderColGap}px;align-items:flex-start;`;
    this.ccol.appendChild(this.gridRow);

    this.mapPane = document.createElement("div");
    this.mapPane.style.cssText = `flex:0 0 ${this.o.mapPaneWidth}px;min-width:${this.o.mapPaneWidth}px;display:flex;flex-direction:column;align-items:flex-start;`;
    this.gridRow.appendChild(this.mapPane);

    this.heatWrap = document.createElement("div");
    this.heatWrap.style.cssText = "position:relative;display:block;width:min-content;height:min-content;";
    this.mapPane.appendChild(this.heatWrap);

    this.heatCanvas = document.createElement("canvas");
    this.hctx = this.heatCanvas.getContext("2d", { alpha:true });
    this.heatCanvas.style.cssText = "display:block;background:transparent;";
    this.heatWrap.appendChild(this.heatCanvas);

    this.crossCanvas = document.createElement("canvas");
    this.cxctx = this.crossCanvas.getContext("2d", { alpha:true });
    this.crossCanvas.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;";
    this.heatWrap.appendChild(this.crossCanvas);

    // sliders pane
    this.slidersPane = document.createElement("div");
    const rightW = railW - this.o.mapPaneWidth - this.o.sliderColGap - 2*this.o.padX;
    this.slidersPane.style.cssText = `flex:1 1 auto;min-width:${Math.max(280,rightW)}px;display:block;`;
    this.gridRow.appendChild(this.slidersPane);

    this.svgSliders = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgSliders.style.display="block";
    this.svgSliders.style.overflow="visible";
    this.slidersPane.appendChild(this.svgSliders);
    this.gSliders = document.createElementNS("http://www.w3.org/2000/svg","g");
    this.svgSliders.appendChild(this.gSliders);

    // mask canvas
    this.maskCanvas = document.createElement("canvas");
    this.maskCtx = this.maskCanvas.getContext("2d", { willReadFrequently:true });

    // init GL + sim + pigment
    this.#initGL();
    this.#initSim();
    this.#buildSliders();
    this.#wirePainting();
    this.#wireHeatInteractions();

    requestAnimationFrame(() => {
      this.#sizeAll();
      this.#renderParamMapImage();
      this.#drawCrosshair();
    });

    // initial seed (paused)
    this._autoSeed = debounce(() => this.#seedFromCurrent(true), 200);
    this.#seedFromCurrent(true);

    // loop
    this.running = false;
    this.#syncRunBtn(false);
    this.#loop();
  }

  play(){ this.running=true; this.#syncRunBtn(true); }
  pause(){ this.running=false; this.#syncRunBtn(false); }
  destroy(){ try{ this.pause(); }catch{} this.root?.remove?.(); }

  // ─────────── GL core ───────────
  #initGL(){
    const gl = this.glCanvas.getContext("webgl2", { premultipliedAlpha:false, preserveDrawingBuffer:false });
    if(!gl) throw new Error("WebGL2 not available");
    this.gl=gl;
    this.simProg = createProgram(gl,SIM_VERT,SIM_FRAG);
    this.pigProg = createProgram(gl,PIG_VERT,PIG_FRAG);
    this.dispProg= createProgram(gl,DISP_VERT,DISP_FRAG);
    this.quad=makeFullscreenVAO(gl);

    this.N=this.o.N|0; this.fmt=chooseStateFormat(gl);
    this.state = makeStateTargets(gl,this.N,this.fmt);
    this.pig   = makePigmentTargets(gl,this.N);

    fillUniform(gl,this.state.a,this.N,this.fmt,1.0,0.0);
    fillUniform(gl,this.state.b,this.N,this.fmt,1.0,0.0);

    gl.bindTexture(gl.TEXTURE_2D, this.pig.a);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB8,this.N,this.N,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array(this.N*this.N*3));
    gl.bindTexture(gl.TEXTURE_2D, this.pig.b);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB8,this.N,this.N,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array(this.N*this.N*3));

    this.frontTex=this.state.a; this.backTex=this.state.b;
    this.frontFBO=this.state.fboA; this.backFBO=this.state.fboB;
    this.frontPig=this.pig.a; this.backPig=this.pig.b;
    this.frontPigFBO=this.pig.fboA; this.backPigFBO=this.pig.fboB;

    this.cmapTex=makeColormapTex(gl,this.o.colormap,1024);

    this.styleTex=null; this.styleRes=[-1,-1];

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
      bias:gl.getUniformLocation(this.simProg,"bias"),
      styleMapTexture:gl.getUniformLocation(this.simProg,"styleMapTexture"),
      styleMapResolution:gl.getUniformLocation(this.simProg,"styleMapResolution"),
      styleMapTransforms:gl.getUniformLocation(this.simProg,"styleMapTransforms"),
      styleMapParameters:gl.getUniformLocation(this.simProg,"styleMapParameters"),
    }, pig:{
      resolution:gl.getUniformLocation(this.pigProg,"resolution"),
      prevPig:gl.getUniformLocation(this.pigProg,"prevPigment"),
      stateTex:gl.getUniformLocation(this.pigProg,"stateTex"),
      Dp:gl.getUniformLocation(this.pigProg,"Dp"),
      decay:gl.getUniformLocation(this.pigProg,"decay"),
      dtp:gl.getUniformLocation(this.pigProg,"dtp"),
    }, disp:{
      stateTex:gl.getUniformLocation(this.dispProg,"stateTex"),
      colormap:gl.getUniformLocation(this.dispProg,"colormap"),
      pigmentTex:gl.getUniformLocation(this.dispProg,"pigmentTex"),
      brightness:gl.getUniformLocation(this.dispProg,"u_brightness"),
      gamma:gl.getUniformLocation(this.dispProg,"u_gamma"),
      pigmentMix:gl.getUniformLocation(this.dispProg,"pigmentMix"),
      toneCurve:gl.getUniformLocation(this.dispProg,"toneCurve"),
      sat:gl.getUniformLocation(this.dispProg,"u_saturation"),
      con:gl.getUniformLocation(this.dispProg,"u_contrast"),
      exp:gl.getUniformLocation(this.dispProg,"u_exposure"),
      blk:gl.getUniformLocation(this.dispProg,"u_black"),
      wht:gl.getUniformLocation(this.dispProg,"u_white"),
    }};
  }

  #initSim(){ this.mouse={x:-1,y:-1}; }

  #step(){
    const gl=this.gl;
    gl.bindVertexArray(this.quad.vao);

    // state update
    gl.viewport(0,0,this.N,this.N);
    gl.useProgram(this.simProg);
    gl.uniform2f(this.u.sim.resolution,this.N,this.N);
    gl.uniform1f(this.u.sim.f, this.o.F);
    gl.uniform1f(this.u.sim.k, this.o.k);
    gl.uniform1f(this.u.sim.dA, this.o.Du);
    gl.uniform1f(this.u.sim.dB, this.o.Dv);
    gl.uniform1f(this.u.sim.timestep, this.o.dt);
    gl.uniform2f(this.u.sim.mousePos, this.mouse.x, this.mouse.y);
    gl.uniform1f(this.u.sim.brushR, this.o.brushRadius);
    gl.uniform2f(this.u.sim.bias, this.o.biasX, this.o.biasY);

    if(this.styleTex){
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D,this.styleTex);
      gl.uniform1i(this.u.sim.styleMapTexture,2);
      gl.uniform2f(this.u.sim.styleMapResolution, this.styleRes[0], this.styleRes[1]);
      const sc=this.o.styleScale||1.0, ang=(this.o.styleAngleDeg||0)*Math.PI/180.0;
      gl.uniform4f(this.u.sim.styleMapTransforms, sc, ang, this.o.styleX||0, this.o.styleY||0);
      gl.uniform4f(this.u.sim.styleMapParameters, this.o.styleF||0, this.o.styleK||0, this.o.styleDu||0, this.o.styleDv||0);
    } else {
      gl.uniform2f(this.u.sim.styleMapResolution,-1,-1);
    }

    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.frontTex);
    gl.uniform1i(this.u.sim.prevTex,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.backFBO);
    gl.drawArrays(gl.TRIANGLES,0,6);
    [this.frontTex,this.backTex]=[this.backTex,this.frontTex];
    [this.frontFBO,this.backFBO]=[this.backFBO,this.frontFBO];

    // pigment update
    gl.useProgram(this.pigProg);
    gl.uniform2f(this.u.pig.resolution,this.N,this.N);
    gl.uniform1f(this.u.pig.Dp, this.o.Dp);
    gl.uniform1f(this.u.pig.decay, this.o.pigmentDecay);
    gl.uniform1f(this.u.pig.dtp, this.o.pigmentDt);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.frontPig);
    gl.uniform1i(this.u.pig.prevPig,0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,this.frontTex);
    gl.uniform1i(this.u.pig.stateTex,1);
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.backPigFBO);
    gl.drawArrays(gl.TRIANGLES,0,6);
    [this.frontPig,this.backPig]=[this.backPig,this.frontPig];
    [this.frontPigFBO,this.backPigFBO]=[this.backPigFBO,this.frontPigFBO];

    this.mouse.x=-1; this.mouse.y=-1;
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.bindVertexArray(null);
  }

  #draw(){
    const gl=this.gl;
    gl.viewport(0,0,this.glCanvas.width,this.glCanvas.height);
    gl.bindVertexArray(this.quad.vao);
    gl.useProgram(this.dispProg);

    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.frontTex);
    gl.uniform1i(this.u.disp.stateTex,0);

    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,this.cmapTex);
    gl.uniform1i(this.u.disp.colormap,1);

    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D,this.frontPig);
    gl.uniform1i(this.u.disp.pigmentTex,2);

    gl.uniform1f(this.u.disp.brightness,this.o.colorBrightness||1.0);
    gl.uniform1f(this.u.disp.gamma,this.o.colorGamma||1.0);
    gl.uniform1f(this.u.disp.pigmentMix, this.o.pigmentMix);
    gl.uniform1f(this.u.disp.toneCurve, this.o.toneCurve);
    gl.uniform1f(this.u.disp.sat, this.o.saturation);
    gl.uniform1f(this.u.disp.con, this.o.contrast);
    gl.uniform1f(this.u.disp.exp, this.o.exposure);
    gl.uniform1f(this.u.disp.blk, this.o.black);
    gl.uniform1f(this.u.disp.wht, this.o.white);

    gl.drawArrays(gl.TRIANGLES,0,6);
    gl.bindVertexArray(null);
  }

  #loop(){
    const tick=()=>{ if(this.running){ const s=Math.max(1,this.o.stepsPerFrame|0); for(let i=0;i<s;i++) this.#step(); }
      this.#draw(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  // ─────────── Buttons (auto-wrap) ───────────
  #buildButtonsWrapped(){
    const g=this.gTop, innerW=Math.max(this.o.railMinWidth,this.o.railWidth)-2*this.o.padX;
    let x=0, y=0, rowH=42, gap=12;
    const place=(w)=>{ if(x+w>innerW){ x=0; y+=rowH+6; } const px=x; x+=w+gap; return {x:px,y}; };
    const addBtn=(w,label,acts,cb,ref)=>{
      const pos=place(w); const b=button().size(36).symbolsize(0.34).label(label).labelposition("right").position(pos).actions(acts);
      b.update(cb); const el=buttonElement(b); g.appendChild(el); if(ref) this[ref]=b;
    };

    addBtn(130,"run",["play","pause"],()=>{
      const on=this.playBtn.value()===1;
      if(on) this.play(); else this.pause();
    },"playBtn");

    addBtn(120,"reset",["reload"],()=>{
      this.pause(); this.playBtn?.value(0); this.playBtn?.update?.();
      this.#seedFromCurrent(true);
    });

    addBtn(120,"noise",["push"],()=>{ if(this.running) this.#jitter(); });
    addBtn(110,"salt",["capture"],()=>{ if(this.running) this.#jitter(); });

    addBtn(130,"record",["back","stop"],()=>{
      const on=this.recBtn.value()===1;
      if(on){ this.#startRecordingSmart(); }
      else { this.#stopRecording(); this.pause(); this.playBtn?.value(0); this.playBtn?.update?.(); }
    },"recBtn");

    const pos=place(210);
    this.seedToggle = toggle().size(10).position({x:pos.x,y:pos.y+10}).label("seed: PNG / Text").labelposition("right")
      .value(this.o.seedSource==="png"?1:0);
    this.seedToggle.update(()=>{
      this.o.seedSource = this.seedToggle.value()? "png" : "text";
      this.pause(); this.playBtn?.value(0); this.playBtn?.update?.();
      this.#seedFromCurrent(true);
    });
    g.appendChild(toggleElement(this.seedToggle));

    this.svgTop.setAttribute("width", String(innerW));
    this.svgTop.setAttribute("height", String(y + rowH + 6));
  }

  #jitter(){ for(let i=0;i<2;i++) this.#step(); }

  // ─────────── File + Text row ───────────
  #buildFileAndTextRow(){
    const fileBox=document.createElement("div");
    fileBox.style.cssText="display:flex;flex-direction:column;gap:6px;min-width:180px;flex:1 1 40%;";
    const flab=document.createElement("label"); flab.textContent="logo (.png/.jpg → non-transparent = seed)";
    const finp=document.createElement("input"); finp.type="file"; finp.accept="image/png,image/jpeg";
    finp.addEventListener("change",(e)=>{ const f=e.target.files?.[0]; if(f) this.#loadLogo(f); });
    fileBox.appendChild(flab); fileBox.appendChild(finp);

    const textBox=document.createElement("div");
    textBox.style.cssText="display:flex;flex-direction:column;gap:6px;min-width:180px;flex:1 1 60%;";
    const tl=document.createElement("label"); tl.textContent="text to seed";
    const ti=document.createElement("input"); ti.type="text"; ti.value=this.o.text;
    ti.addEventListener("input",()=>{ this.o.text = ti.value||""; this.pause(); this.playBtn?.value(0); this.playBtn?.update?.(); this._autoSeed(); });
    textBox.appendChild(tl); textBox.appendChild(ti);

    this.ioRow.appendChild(fileBox);
    this.ioRow.appendChild(textBox);
  }

  // ─────────── Dropdowns row ───────────
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
      .update(()=>{ const p=presets.find(d=>d.value===this.presetDD.value()); if(!p) return;
        this.#setFk(p.F,p.k, this.running?80:0);
      });
    const pEl=dropdownElement(this.presetDD); pEl.style.maxWidth=`${this.o.dropdownMaxWidth|0}px`; this.ddRow.appendChild(pEl);

    const cmapOptions=Object.keys(COLORMAPS).map(k=>({label:k,value:k}));
    this.cmapDD=dropdown().id("rd-cmap").label("colormap")
      .options(cmapOptions).value(this.o.colormap)
      .update(()=>{ this.gl.deleteTexture(this.cmapTex); this.cmapTex=makeColormapTex(this.gl,this.cmapDD.value(),1024); });
    const cEl=dropdownElement(this.cmapDD); cEl.style.maxWidth=`${this.o.dropdownMaxWidth|0}px`; this.ddRow.appendChild(cEl);
  }

  // ─────────── Sliders ───────────
  #buildSliders(){
    const g = this.gSliders;

    const measureInnerW = () => {
      const fallback = Math.max(this.o.railMinWidth, this.o.railWidth)
                     - this.o.mapPaneWidth - this.o.sliderColGap - 2*this.o.padX;
      const w = Math.max(280, this.slidersPane.clientWidth || fallback);
      return w;
    };
    const innerW = measureInnerW();
    if (innerW < 80) { requestAnimationFrame(()=>this.#buildSliders()); return; }

    const cols   = Math.max(1, this.o.sliderColumns | 0);
    const colGap = Math.max(8, this.o.sliderColGap | 0);
    const colW   = Math.floor((innerW - colGap*(cols-1)) / cols);

    const colHeights = new Array(cols).fill(0);
    const rowH       = 46;

    // visual width only
    const baseLenPx = Math.max(50, Math.min(colW, (this.o.sliderSizePx ?? this.o.sliderSize ?? colW)));
    const sized = (id) => {
      const v = this.o.sliderWidths && this.o.sliderWidths[id];
      if (v == null) return baseLenPx;
      return Math.max(50, Math.min(colW, v | 0));
    };

    const place = () => {
      let col = 0; for (let c=1; c<cols; c++) if (colHeights[c] < colHeights[col]) col = c;
      const x = (colW + colGap) * col, y = colHeights[col]; return { col, x, y };
    };

    const makeSlider = (id, label, value, range, onUpdate) => {
      const spot = place();
      const sl = slider()
        .id(id)
        .label(label)
        .size(sized(id))
        .girth(10)
        .knob(11)
        .position({ x: spot.x, y: spot.y })
        .labelposition("top-left")
        .range(range)
        .value(value)
        .update(() => onUpdate(sl.value()));

      g.appendChild(sliderElement(sl));
      colHeights[spot.col] += rowH + (this.o.sliderGap | 0);
      return sl;
    };

    while (g.firstChild) g.removeChild(g.firstChild);
    this.svgSliders.setAttribute("width", String(innerW));

    // Physics
    this.DuSl = makeSlider("Du","Dᵤ (diffusion)", this.o.Du, [0.0,0.4], v=>{ this.o.Du=v; });
    this.DvSl = makeSlider("Dv","Dᵥ (diffusion)", this.o.Dv, [0.0,0.4], v=>{ this.o.Dv=v; });
    this.FSl  = makeSlider("F","F (feed)", this.o.F, [0.0,0.08], v=>{ this.#setFk(v, this.o.k, this.running?20:0, true); });
    this.kSl  = makeSlider("k","k (kill)", this.o.k, [0.0,0.09], v=>{ this.#setFk(this.o.F, v, this.running?20:0, true); });
    this.dtSl = makeSlider("dt","Δt (time step)", this.o.dt, [0.2,2.5], v=>{ this.o.dt=v; });
    this.spfSl= makeSlider("spf","steps / frame", this.o.stepsPerFrame, [1,60], v=>{ this.o.stepsPerFrame=Math.round(v); });
    this.brSl = makeSlider("br","brush radius", this.o.brushRadius, [1,60], v=>{ this.o.brushRadius=Math.round(v); });

    // Bias
    this.bxSl = makeSlider("bx","bias X (E/W)", this.o.biasX, [-0.4,0.4], v=>{ this.o.biasX=v; });
    this.bySl = makeSlider("by","bias Y (N/S)", this.o.biasY, [-0.4,0.4], v=>{ this.o.biasY=v; });

    // Display / Tone
    this.briSl = makeSlider("bri","brightness", this.o.colorBrightness, [0.6,2.2], v=>{ this.o.colorBrightness=v; });
    this.gamSl = makeSlider("gam","gamma", this.o.colorGamma, [0.5,2.0], v=>{ this.o.colorGamma=v; });
    this.satSl = makeSlider("sat","saturation", this.o.saturation, [0.0,2.5], v=>{ this.o.saturation=v; });
    this.conSl = makeSlider("con","contrast", this.o.contrast, [0.5,2.0], v=>{ this.o.contrast=v; });
    this.expSl = makeSlider("exp","exposure", this.o.exposure, [0.5,2.0], v=>{ this.o.exposure=v; });
    this.blkSl = makeSlider("blk","black point", this.o.black, [0.0,0.2], v=>{ this.o.black=v; });
    this.whtSl = makeSlider("wht","white point", this.o.white, [0.8,1.0], v=>{ this.o.white=v; });

    // Pigment
    this.pMix  = makeSlider("pmix","pigment mix", this.o.pigmentMix, [0.0,1.0], v=>{ this.o.pigmentMix=v; });
    this.tone  = makeSlider("tone","tone curve", this.o.toneCurve, [0.6,1.6], v=>{ this.o.toneCurve=v; });
    this.DpSl  = makeSlider("Dp","pigment diffusion", this.o.Dp, [0.02,0.6], v=>{ this.o.Dp=v; });
    this.pDec  = makeSlider("pdec","pigment decay", this.o.pigmentDecay, [0.0,0.05], v=>{ this.o.pigmentDecay=v; });

    const totalH = Math.max(...colHeights);
    this.svgSliders.setAttribute("height", String(totalH));
  }

  // ─────────── Painting + F–k map interactions ───────────
  #wirePainting(){
    const norm=(evt)=>{ const e=evt.touches?evt.touches[0]:evt; const r=this.glCanvas.getBoundingClientRect();
      return { x:(e.clientX-r.left)/r.width, y:1-((e.clientY-r.top)/r.height) }; };
    const down=(e)=>{ e.preventDefault(); const p=norm(e); this.mouse.x=p.x; this.mouse.y=p.y; this._paint=true; };
    const move=(e)=>{ if(!this._paint) return; const p=norm(e); this.mouse.x=p.x; this.mouse.y=p.y; };
    const up=()=>{ this._paint=false; };
    this.glCanvas.addEventListener("mousedown",down);
    window.addEventListener("mousemove",move); window.addEventListener("mouseup",up);
    this.glCanvas.addEventListener("touchstart",down,{passive:false});
    window.addEventListener("touchmove",move,{passive:false}); window.addEventListener("touchend",up);
  }

  async #renderParamMapImage(){
    const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1));
    const size=Math.max(140,this.o.paramMapSizePx|0);
    const fit=(c,ctx)=>{ c.style.width=size+"px"; c.style.height=size+"px"; c.width=size*dpr; c.height=size*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); };
    this.hctx= this.heatCanvas.getContext("2d",{alpha:true});
    this.cxctx= this.crossCanvas.getContext("2d",{alpha:true});
    fit(this.heatCanvas,this.hctx); fit(this.crossCanvas,this.cxctx);
    if(!this._paramImg){ const img=new Image(); img.crossOrigin="anonymous"; img.src=this.o.paramMap.src;
      await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; }); this._paramImg=img; }
    this.hctx.clearRect(0,0,size,size); this.hctx.imageSmoothingEnabled=true;
    this.hctx.drawImage(this._paramImg,0,0,this._paramImg.naturalWidth,this._paramImg.naturalHeight,0,0,size,size);
  }

  #drawCrosshair(){
    const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1)), size=this.crossCanvas.width/dpr;
    const pad=Math.max(2,this.o.paramMap.crossPad||2), box=size-2*pad, {Fmin,Fmax,kmin,kmax}=this.o.paramMap;
    let nx=(this.o.F-Fmin)/(Fmax-Fmin); if(this.o.paramMap.flipF) nx=1-nx;
    let ny=1-(this.o.k-kmin)/(kmax-kmin); if(!this.o.paramMap.flipK) ny=1-ny;
    const px=pad+nx*box, py=pad+ny*box;
    const ctx=this.cxctx; ctx.clearRect(0,0,size,size); ctx.save();
    ctx.strokeStyle="#0f172a"; ctx.lineWidth=1*dpr;
    ctx.beginPath(); ctx.moveTo(px,pad); ctx.lineTo(px,pad+box); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad,py); ctx.lineTo(pad+box,py); ctx.stroke();
    ctx.fillStyle="#0f172a"; ctx.font=`${12*dpr}px system-ui,-apple-system,Segoe UI,Roboto,sans-serif`;
    ctx.fillText(`F=${this.o.F.toFixed(3)}, k=${this.o.k.toFixed(3)}`, pad+8, pad+14);
    ctx.restore();
  }

  #wireHeatInteractions(){
    const norm=(cx,cy)=>{ const r=this.crossCanvas.getBoundingClientRect();
      const x=cx-r.left, y=cy-r.top, size=this.crossCanvas.clientWidth;
      const pad=Math.max(2,this.o.paramMap.crossPad||2), box=size-2*pad;
      let nx=Math.min(1,Math.max(0,(x-pad)/box)), ny=Math.min(1,Math.max(0,(y-pad)/box));
      if(this.o.paramMap.flipF) nx=1-nx; if(this.o.paramMap.flipK) ny=1-ny;
      const {Fmin,Fmax,kmin,kmax}=this.o.paramMap; return {F:Fmin+nx*(Fmax-Fmin), k:kmin+ny*(kmax-kmin)}; };
    const down=(e)=>{ e.preventDefault(); const p=e.touches?e.touches[0]:e; const {F,k}=norm(p.clientX,p.clientY); this.#setFk(F,k, this.running?80:0); this._drag=true; };
    const move=(e)=>{ if(!this._drag) return; const p=e.touches?e.touches[0]:e; const {F,k}=norm(p.clientX,p.clientY); this.#setFk(F,k, this.running?20:0); };
    const up=()=>{ this._drag=false; };
    this.heatWrap.addEventListener("mousedown",down);
    window.addEventListener("mousemove",move); window.addEventListener("mouseup",up);
    this.heatWrap.addEventListener("touchstart",down,{passive:false});
    window.addEventListener("touchmove",move,{passive:false}); window.addEventListener("touchend",up);
  }

  // ─────────── Sizing ───────────
  #sizeAll(){
    const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1));
    const size=Math.max(200,this.o.canvasSizePx|0);
    const gl=this.gl;
    this.glCanvas.style.width=size+"px"; this.glCanvas.style.height=size+"px";
    this.glCanvas.width=size*dpr; this.glCanvas.height=size*dpr; gl.viewport(0,0,this.glCanvas.width,this.glCanvas.height);

    const innerW=Math.max(this.o.railMinWidth,this.o.railWidth)-2*this.o.padX;
    this.svgTop.setAttribute("width", String(innerW));
  }

  // ─────────── Load & seed  ───────────
  async #loadLogo(file){
    const img=await fileToImage(file);
    this._logoImg=img;
    this.o.seedSource="png"; this.seedToggle?.value(1); this.seedToggle?.update?.();
    this.pause(); this.playBtn?.value(0); this.playBtn?.update?.();
    this.#seedFromCurrent(true);
  }

  #drawTextMask(){
    const S=this.o.canvasSizePx|0, ctx=this.maskCtx, c=this.maskCanvas; c.width=S; c.height=S;
    ctx.save(); ctx.clearRect(0,0,S,S);
    if(this.o.seedFlipY){ ctx.translate(0,S); ctx.scale(1,-1); }
    ctx.translate(S/2,S/2); ctx.rotate(this.o.seedRotationDeg*Math.PI/180);
    ctx.scale(this.o.seedScale,this.o.seedScale); ctx.fillStyle=this.o.textFill; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.font=this.o.font; ctx.fillText(this.o.text||"",0,0); ctx.restore(); return c;
  }

  #drawLogoMask(){
    if(!this._logoImg) return null; const S=this.o.canvasSizePx|0, ctx=this.maskCtx, c=this.maskCanvas;
    c.width=S; c.height=S; ctx.save(); ctx.clearRect(0,0,S,S);
    if(this.o.seedFlipY){ ctx.translate(0,S); ctx.scale(1,-1); }
    ctx.translate(S/2,S/2); ctx.rotate(this.o.seedRotationDeg*Math.PI/180);
    const im=this._logoImg, sc=this.o.seedScale*Math.min(S/im.naturalWidth, S/im.naturalHeight);
    const w=im.naturalWidth*sc, h=im.naturalHeight*sc; ctx.drawImage(im,-w/2,-h/2,w,h); ctx.restore(); return c;
  }

  #extractOutlineMaskHires(drawCanvas) {
    const SS = Math.max(1, this.o.seedPrecisionScale | 0);
    const S0 = drawCanvas.width | 0, S = Math.max(8, S0 * SS);

    // Upsample into staging canvas
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(drawCanvas, 0, 0, S, S);

    const img = ctx.getImageData(0, 0, S, S);
    const px = img.data; // RGBA

    // Infer border “background” color (RBGA under alpha is fine)
    function sample(x, y) {
      const i = (y * S + x) * 4;
      return [px[i], px[i+1], px[i+2], px[i+3]];
    }
    const cs = [ sample(0,0), sample(S-1,0), sample(0,S-1), sample(S-1,S-1) ];
    let br=0,bg=0,bb=0,cnt=0; for (const [r,g,b] of cs){ br+=r; bg+=g; bb+=b; cnt++; }
    br/=cnt; bg/=cnt; bb/=cnt;

    const alphaHi = 48;
    const rgbDelta = 28;
    const delta = (r,g,b)=> Math.max(Math.abs(r-br), Math.abs(g-bg), Math.abs(b-bb));

    // 1 = shape, 0 = background
    const bin = new Uint8Array(S * S);
    for (let y = 0; y < S; y++) {
      const row = y * S;
      for (let x = 0; x < S; x++) {
        const i = (row + x) * 4;
        const a = px[i+3];
        const r = px[i], g = px[i+1], b = px[i+2];
        const isShape = (a >= alphaHi) || (delta(r,g,b) >= rgbDelta);
        bin[row + x] = isShape ? 1 : 0;
      }
    }

    // auto invert if the border looks filled
    const borderCount = 2 * (S + (S - 2));
    let borderOnes = 0;
    for (let x = 0; x < S; x++) { borderOnes += bin[x]; borderOnes += bin[(S-1)*S + x]; }
    for (let y = 1; y < S - 1; y++) { borderOnes += bin[y*S]; borderOnes += bin[y*S + (S-1)]; }
    const borderFilled = borderOnes > 0.5 * borderCount;

    let doInvert;
    if (this.o.seedInvert === "auto" || this.o.seedInvert == null) doInvert = borderFilled;
    else doInvert = !!this.o.seedInvert;

    if (doInvert) {
      for (let i = 0; i < bin.length; i++) bin[i] ^= 1;
    }

    // optional grow/shrink
    if ((this.o.seedInsideGrowPx || 0) !== 0) {
      const grow = Math.round(Math.abs(this.o.seedInsideGrowPx));
      const tmp = new Uint8Array(S * S);
      for (let it = 0; it < grow; it++) {
        for (let y = 1; y < S - 1; y++) {
          const row = y * S;
          for (let x = 1; x < S - 1; x++) {
            const i = row + x;
            if (this.o.seedInsideGrowPx > 0) {
              tmp[i] = bin[i] | bin[i-1] | bin[i+1] | bin[i-S] | bin[i+S] | bin[i-S-1] | bin[i-S+1] | bin[i+S-1] | bin[i+S+1];
            } else {
              tmp[i] = bin[i] & bin[i-1] & bin[i+1] & bin[i-S] & bin[i+S] & bin[i-S-1] & bin[i-S+1] & bin[i+S-1] & bin[i+S+1];
            }
          }
        }
        bin.set(tmp);
      }
    }

    // distance inside the shape (0 at background)
    const bgZero = new Uint8Array(S * S);
    for (let i = 0; i < bgZero.length; i++) bgZero[i] = bin[i] ? 1 : 0;
    const distIn = distanceTransform(bgZero, S, S);

    return { distIn, size: S, bin };
  }

  #seedFromCurrent(pauseOnly = false) {
    const gl = this.gl;
    fillUniform(gl, this.frontTex, this.N, this.fmt, 1.0, 0.0);

    let drawCanvas = null;
    if (this.o.seedSource === "png" && this._logoImg) {
      drawCanvas = this.#drawLogoMask();
    } else if (this.o.seedSource === "text" && this.o.text?.length > 0) {
      drawCanvas = this.#drawTextMask();
    }

    if (drawCanvas) {
      const maskHi = this.#extractOutlineMaskHires(drawCanvas);
      this.#writeOutlineSmooth(maskHi);
      seedPigmentFromCanvas(gl, this.frontPig, this.N, drawCanvas, /*alphaCut=*/48);
      this._lastMask = maskHi;
    } else {
      gl.bindTexture(gl.TEXTURE_2D, this.frontPig);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB8,this.N,this.N,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array(this.N*this.N*3));
    }

    if (pauseOnly) { this.pause(); this.#draw(); return; }
  }

  #writeOutlineSmooth(mask){
    const gl=this.gl, N=this.N, fmt=this.fmt;
    const S = mask.size;
    const { distIn } = mask;

    const B = new Float32Array(N*N);
    const A = new Float32Array(N*N);

    const band = Math.max(0.25, this.o.seedEdgeBandPx || 1.2);
    const hard = Math.max(0.8,  this.o.seedEdgeHardness || 1.8);

    for(let y=0;y<N;y++){
      const sy = Math.min(S-1, Math.round(y*(S-1)/(N-1)));
      const row = sy*S;
      for(let x=0;x<N;x++){
        const sx = Math.min(S-1, Math.round(x*(S-1)/(N-1)));
        const iN = y*N + x;
        const iS = row + sx;

        const dSup = distIn[iS];
        const dSim = dSup * (N-1) / (S-1);

        let t = Math.max(0, Math.min(1, dSim / band));
        t = Math.pow(t, hard);
        const s = t*t*(3.0 - 2.0*t);

        B[iN] = s;
        A[iN] = 1.0 - 0.85*s;
      }
    }

    gl.bindTexture(gl.TEXTURE_2D, this.frontTex);
    if (fmt.isFloat) {
      const f32 = new Float32Array(N*N*4);
      for(let i=0;i<N*N;i++){
        f32[i*4  ] = A[i];
        f32[i*4+1] = B[i];
        f32[i*4+2] = 0.0;
        f32[i*4+3] = 1.0;
      }
      const u16 = float32ToFloat16Array(f32);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, N, N, 0, fmt.format, fmt.type, u16);
    } else {
      const u8 = new Uint8Array(N*N*4);
      for(let i=0;i<N*N;i++){
        u8[i*4  ] = Math.round(A[i]*255);
        u8[i*4+1] = Math.round(B[i]*255);
        u8[i*4+2] = 0;
        u8[i*4+3] = 255;
      }
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, N, N, 0, fmt.format, gl.UNSIGNED_BYTE, u8);
    }
  }

  // FK & run button
  #setFk(F,k,warm=0,fromSliders=false){
    this.o.F=Math.max(0,Math.min(0.08,F)); this.o.k=Math.max(0,Math.min(0.09,k));
    if(!fromSliders){ this.FSl?.value(this.o.F); this.FSl?.update?.(); this.kSl?.value(this.o.k); this.kSl?.update?.(); }
    this.#drawCrosshair();
    if(this.running && warm>0){ for(let i=0;i<warm;i++) this.#step(); }
  }

  #syncRunBtn(on){ try{ this.playBtn?.value(on?1:0); this.playBtn?.update?.(); }catch{} }

  // Recording
  #startRecordingSmart(){
    const tryMime = (m)=>MediaRecorder.isTypeSupported(m);
    let mime = '';
    if (tryMime('video/mp4;codecs=avc1.42E01E')) mime = 'video/mp4;codecs=avc1.42E01E';
    else if (tryMime('video/webm;codecs=vp9')) mime = 'video/webm;codecs=vp9';
    else mime = 'video/webm;codecs=vp8';

    if(!this.running){ this.play(); this.playBtn?.value(1); this.playBtn?.update?.(); }

    const stream=this.glCanvas.captureStream(this.o.exportFPS||60);
    const mr=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:14_000_000});
    this._chunks=[]; this._rec=mr; this._recMime=mime;

    mr.ondataavailable=(e)=>{ if(e.data && e.data.size>0) this._chunks.push(e.data); };
    mr.onstop=async ()=>{ const blob=new Blob(this._chunks,{type:mime});
      const name = `grayscott_${Date.now()}.${mime.startsWith('video/mp4')?'mp4':'webm'}`;
      downloadBlob(blob, name);
      this._rec=null; this._chunks=null; this._recMime=null;
      this.pause(); this.playBtn?.value(0); this.playBtn?.update?.();
      try{ this.recBtn?.value(0); this.recBtn?.update?.(); }catch{}
    };
    mr.start();
  }

  #stopRecording(){ if(this._rec) this._rec.stop(); }
}

// helpers
function downloadBlob(blob, name){
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function fileToImage(file){
  return new Promise((res,rej)=>{ const url=URL.createObjectURL(file); const img=new Image();
    img.onload=()=>{ URL.revokeObjectURL(url); res(img); };
    img.onerror=(e)=>{ URL.revokeObjectURL(url); rej(e); };
    img.src=url;
  });
}

export default RDLogoExplorable;
export { RDLogoExplorable };