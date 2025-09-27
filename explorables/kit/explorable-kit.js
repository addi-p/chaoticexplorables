// Explorable Kit: minimal, Tufte-friendly UI helpers (no app logic)
export function createKit() {
  const NS = {};

  // Quiet tokens; override via cssVars if you like.
  const styleText = `
    :host, .ek-root {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter, Roboto, Arial, sans-serif;
      --ek-bg: transparent;
      --ek-surface: transparent;
      --ek-fg: #111;             /* text */
      --ek-muted: #666;          /* labels */
      --ek-rule: #ddd;           /* hairlines */
      --ek-accent: #111;         /* slider accent */
      --ek-s: #0b79d0;           /* S curve */
      --ek-i: #c92a2a;           /* I curve */
      --ek-r: #2f9e44;           /* R curve */
    }
    @media (prefers-color-scheme: dark) {
      :host, .ek-theme[data-theme="auto"] {
        --ek-bg: transparent; --ek-surface: transparent;
        --ek-fg: #e6e6e6; --ek-muted: #9aa0a6; --ek-rule: #333; --ek-accent: #e6e6e6;
        --ek-s: #5cc8ff; --ek-i: #ff7b7b; --ek-r: #6de3a1;
      }
    }
    .ek-theme[data-theme="light"] {
      --ek-bg: transparent; --ek-surface: transparent;
      --ek-fg:#111; --ek-muted:#666; --ek-rule:#ddd; --ek-accent:#111;
      --ek-s:#0b79d0; --ek-i:#c92a2a; --ek-r:#2f9e44;
    }
    .ek-theme[data-theme="dark"] {
      --ek-bg: transparent; --ek-surface: transparent;
      --ek-fg:#e6e6e6; --ek-muted:#9aa0a6; --ek-rule:#333; --ek-accent:#e6e6e6;
      --ek-s:#5cc8ff; --ek-i:#ff7b7b; --ek-r:#6de3a1;
    }

    .ek-grid { display: grid; gap: 0.75rem; }
    .ek-row  { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    .ek-field { display: grid; gap: 0.25rem; }
    .ek-label { font-size: 0.85rem; color: var(--ek-muted); }
    .ek-small { font-size: 0.75rem; color: var(--ek-muted); }

    /* Sliders & numbers – no borders, no shadows */
    .ek-number, .ek-range { width: 100%; }
    .ek-number {
      appearance: textfield; border: none; background: transparent; color: var(--ek-fg);
      padding: 0.25rem 0.4rem; border-bottom: 1px solid var(--ek-rule); border-radius: 0;
    }
    .ek-number:focus { outline: none; border-bottom-color: var(--ek-fg); }
    .ek-range { accent-color: var(--ek-accent); }

    /* Minimal badges (inline facts) */
    .ek-badge { font-size: 0.85rem; color: var(--ek-muted); }

    /* Buttons – plain text-like */
    .ek-btn {
      appearance: none; border: 1px solid var(--ek-rule); background: transparent; color: var(--ek-fg);
      padding: 0.25rem 0.5rem; font-size: 0.8rem; border-radius: 4px; cursor: pointer;
    }
    .ek-btn[aria-pressed="true"] { border-color: var(--ek-fg); }
  `;

  function applyCss(root, extraVars = {}) {
    const base = document.createElement("style");
    base.textContent = styleText;
    root.appendChild(base);
    if (extraVars && typeof extraVars === "object") {
      const vars = Object.entries(extraVars).map(([k,v]) => `--${k}: ${v};`).join(" ");
      const override = document.createElement("style");
      override.textContent = `.ek-theme{ ${vars} }`;
      root.appendChild(override);
    }
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k === "class") n.setAttribute("class", v);
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const c of [].concat(children))
      if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    return n;
  }

  function sliderPack({ id, label, min, max, step, value, number = true, format = (x)=>x.toString() }) {
    const inputRange = el("input", { id: id+"-range", type:"range", min, max, step, value, class:"ek-range" });
    const v = el("span", { class:"ek-small", text: format(value) });
    const header = el("label", { for: id+"-range", class:"ek-label" }, [label, " ", v]);
    let numberInput = null;
    if (number) numberInput = el("input", { id, type:"number", min, max, step, value, class:"ek-number" });
    const wrap = el("div", { class:"ek-field" }, [
      header, el("div", { class:"ek-row" }, [ inputRange, numberInput ].filter(Boolean))
    ]);

    const sync = (src) => {
      const val = +src.value;
      inputRange.value = val;
      if (numberInput) numberInput.value = val;
      v.textContent = format(val);
      // composed:true so events escape Shadow DOM
      wrap.dispatchEvent(new CustomEvent("changevalue", { detail: val, bubbles: true, composed: true }));
    };
    inputRange.addEventListener("input", e => sync(e.target));
    if (numberInput) numberInput.addEventListener("input", e => sync(e.target));

    return {
      root: wrap,
      get value(){ return +inputRange.value; },
      set value(x){ inputRange.value=x; if(numberInput) numberInput.value=x; v.textContent=format(+x); }
    };
  }

  function badge(text) { return el("span", { class:"ek-badge" }, [text]); }
  function button(text, { pressed=false } = {}) {
    const b = el("button", { class:"ek-btn", "aria-pressed": String(pressed) }, [text]);
    b.toggle = () => { const p = b.getAttribute("aria-pressed") === "true"; b.setAttribute("aria-pressed", String(!p)); };
    return b;
  }

  NS.applyCss = applyCss;
  NS.el = el;
  NS.sliderPack = sliderPack;
  NS.badge = badge;
  NS.button = button;
  return NS;
}