// SIR Controls (fractions): emits play/pause/rewind distinctly; symbol buttons
import { createKit } from "../kit/explorable-kit.js";

export function mountSIRControls(container, options = {}) {
  if (!container) throw new Error("mountSIRControls: container is required");

  const opts = {
    theme: "auto", cssVars: {}, shadow: true,
    i0: 0.01, beta: 0.28, gamma: 0.1, days: 160,
    showPlayback: true,
    ...options,
  };

  const kit  = createKit();
  const root = opts.shadow ? (container.shadowRoot || container.attachShadow({ mode: "open" })) : container;
  const host = kit.el("div", { class:"ek-theme", "data-theme": opts.theme });
  root.appendChild(host);
  kit.applyCss(host, opts.cssVars);

  const controls = kit.el("div", { class:"ek-grid" });

  // Sliders in fractions
  const sI0    = kit.sliderPack({ id:"i0",    label:"Initial infected i₀", min:0, max:1, step:0.001, value:opts.i0,    number:true, format:(x)=>(+x).toFixed(3) });
  const sBeta  = kit.sliderPack({ id:"beta",  label:"β infection rate",    min:0, max:1, step:0.001, value:opts.beta,  number:true, format:(x)=>(+x).toFixed(3)+" / day" });
  const sGamma = kit.sliderPack({ id:"gamma", label:"γ recovery rate",     min:0.001, max:1, step:0.001, value:opts.gamma, number:true, format:(x)=>(+x).toFixed(3)+" / day" });
  const sDays  = kit.sliderPack({ id:"days",  label:"Days",                min:30, max:365, step:1, value:opts.days, number:true });

  const row = kit.el("div", { class:"ek-row" });
  [sI0, sBeta, sGamma, sDays].forEach(s => row.appendChild(s.root));

  const facts = kit.el("div", { class:"ek-row" }, [
    kit.badge("R₀ = "), kit.badge("Peak I = —"), kit.badge("Final R(∞) ≈ —")
  ]);
  const statR0 = facts.children[0].appendChild(document.createElement("span"));

  // ▶/⏸ and ↺
  const playRow  = kit.el("div", { class:"ek-row" });
  const playBtn  = kit.button("▶", { pressed:false });
  const rewindBtn = kit.button("↺");
  if (opts.showPlayback) playRow.append(playBtn, rewindBtn);

  controls.append(row, facts, playRow);
  host.appendChild(controls);

  const state = { i0:opts.i0, beta:opts.beta, gamma:opts.gamma, days:opts.days };

  function derive() {
    const R0 = state.beta / state.gamma;
    statR0.textContent = " " + (Number.isFinite(R0) ? R0.toFixed(2) : "—");
  }

  function emitParams() {
    container.dispatchEvent(new CustomEvent("sir:params", {
      detail: { ...state },
      bubbles: true, composed: true
    }));
  }

  function syncFromUI() {
    state.i0 = +sI0.value;
    state.beta = +sBeta.value;
    state.gamma = +sGamma.value;
    state.days = +sDays.value;
    derive(); emitParams();
  }

  [sI0.root, sBeta.root, sGamma.root, sDays.root].forEach(w =>
    w.addEventListener("changevalue", syncFromUI)
  );

  // Toggle ▶/⏸ and emit play/pause distinctly
  playBtn.addEventListener("click", () => {
    const wasPlaying = playBtn.getAttribute("aria-pressed") === "true";
    const nowPlaying = !wasPlaying;
    playBtn.setAttribute("aria-pressed", String(nowPlaying));
    playBtn.textContent = nowPlaying ? "⏸" : "▶";
    container.dispatchEvent(new CustomEvent(nowPlaying ? "sir:play" : "sir:pause", {
      bubbles: true, composed: true
    }));
  });

  // ↺ rewind (time cursor to 0, keep params)
  rewindBtn.addEventListener("click", () => {
    container.dispatchEvent(new CustomEvent("sir:rewind", { bubbles: true, composed: true }));
  });

  // Init
  derive(); emitParams();

  return {
    getParams: ()=>({ ...state }),
    setParams: (patch)=>{ Object.assign(state, patch);
      sI0.value=state.i0; sBeta.value=state.beta; sGamma.value=state.gamma; sDays.value=state.days;
      derive(); emitParams(); },
    setTheme: (mode)=>host.setAttribute("data-theme", mode),
    destroy: ()=>{ if (opts.shadow) root.innerHTML=""; }
  };
}