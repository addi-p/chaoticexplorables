// Glue: listens to play/pause/rewind distinctly; forwards options to parts
import { mountSIRCanvas } from "./canvas.js";
import { mountSIRControls } from "./controls.js";

export { mountSIRCanvas } from "./canvas.js";
export { mountSIRControls } from "./controls.js";

/**
 * mountSIRExplorable(container, options?)
 * Fractions model (S+I+R=1). Options:
 *  - theme: 'auto'|'light'|'dark'
 *  - cssVars: { 'ek-s':'#...', ... }
 *  - shadow: true|false
 *  - layout: 'stack'|'side'
 *  - interact, cursorVisible, playbackSpeed, size: passed to canvas
 */
export function mountSIRExplorable(container, options = {}) {
  if (!container) throw new Error("mountSIRExplorable: container is required");
  const opts = { theme:"auto", cssVars:{}, shadow:true, layout:"stack", ...options };

  const root = opts.shadow ? (container.shadowRoot || container.attachShadow({ mode:"open" })) : container;

  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gap = "0.75rem";
  if (opts.layout === "side") {
    wrap.style.gridTemplateColumns = "1.1fr 0.9fr";
    wrap.style.alignItems = "start";
  }
  const canvasSlot = document.createElement("div");
  const controlsSlot = document.createElement("div");
  wrap.append(canvasSlot, controlsSlot);
  root.appendChild(wrap);

  // Mount children; pass through canvas-related options
  const canvas   = mountSIRCanvas(canvasSlot, {
    theme: opts.theme, cssVars: opts.cssVars, shadow:false,
    interact: opts.interact, cursorVisible: opts.cursorVisible,
    playbackSpeed: opts.playbackSpeed, size: opts.size,
    legend: true,
    // initial params if provided:
    i0: opts.i0, r0: opts.r0, beta: opts.beta, gamma: opts.gamma, days: opts.days, dt: opts.dt
  });

  const controls = mountSIRControls(controlsSlot, {
    theme: opts.theme, cssVars: opts.cssVars, shadow:false,
    // initial params
    i0: canvas.getState().i0, beta: canvas.getState().beta,
    gamma: canvas.getState().gamma, days: canvas.getState().days
  });

  // Wire distinct events
  controlsSlot.addEventListener("sir:params", (e) => canvas.setState(e.detail));
  controlsSlot.addEventListener("sir:play",   () => canvas.play());
  controlsSlot.addEventListener("sir:pause",  () => canvas.pause());
  controlsSlot.addEventListener("sir:rewind", () => canvas.rewind());

  return {
    getState: ()=>canvas.getState(),
    setState: (patch)=>{ canvas.setState(patch); controls.setParams(patch); },
    setTheme: (mode)=>{ canvas.setTheme(mode); controls.setTheme(mode); },
    destroy: ()=>{ canvas.destroy(); controls.destroy(); root.innerHTML=""; }
  };
}