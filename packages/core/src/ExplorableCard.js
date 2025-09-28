// packages/core/src/ExplorableCard.js
// Card wrapper that hosts ANY explorable and provides a symbol-button toolbar.
// - Play/Pause: uses your "play" / "pause" glyphs
// - Reset:      uses your "reload" glyph
// - Loads card CSS and widgets CSS (plain) so colors match your widgets

import { ExplorableCardCSS } from './ensure-css.js'; // tiny helper below
// icons (path generators)
import iconFor from '../../widgets/src/button-symbols.js';
// optional stadium shape if you later want pill buttons
// import stadium from '../../widgets/src/stadium-shape.js';

function ensureWidgetsPlainCSS() {
  const id = 'cx-widgets-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL('../../widgets/src/widgets-plain.css', import.meta.url).toString();
    document.head.appendChild(link);
  }
}

// Create a symbol button inside an SVG toolbar.
// Returns { group, setSymbol } so you can swap glyphs.
function createSymbolButton(svg, { x, y, size = 18, symbol = 'play', onClick }) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'widget button');                // uses your widget theme vars
  g.setAttribute('transform', `translate(${x},${y})`);
  svg.appendChild(g);

  // background box (simple square; no rounded corners)
  const half = size; // we draw centered at (0,0)
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', -half);
  rect.setAttribute('y', -half);
  rect.setAttribute('width', 2 * half);
  rect.setAttribute('height', 2 * half);
  rect.setAttribute('class', 'lit'); // gives the lighter fill in your theme
  g.appendChild(rect);

  // symbol path (from your button-symbols.js)
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'symbol');
  g.appendChild(path);

  const setSymbol = (name) => {
    const make = iconFor(name);
    // scale a bit smaller than the square so it breathes
    path.setAttribute('d', make(size * 0.75));
  };
  setSymbol(symbol);

  // click target overlay (so clicks are reliable)
  const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  hit.setAttribute('x', -half);
  hit.setAttribute('y', -half);
  hit.setAttribute('width', 2 * half);
  hit.setAttribute('height', 2 * half);
  hit.setAttribute('fill', 'transparent');
  hit.style.cursor = 'pointer';
  g.appendChild(hit);

  if (onClick) {
    g.addEventListener('click', onClick);
    hit.addEventListener('click', onClick);
  }

  return { group: g, setSymbol };
}

export class ExplorableCard {
  constructor(mount, cfg) {
    const {
      ExplorableClass,
      title = 'Explorable',
      subtitle = '',
      width = 260,
      actions = { play: true, reset: true },
      explorable = {}
    } = cfg || {};

    if (!ExplorableClass) throw new Error('ExplorableCard: missing ExplorableClass');

    this.root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('ExplorableCard: mount not found');

    // CSS
    ExplorableCardCSS.ensure();   // card chrome
    ensureWidgetsPlainCSS();      // widget theme vars/colors

    // Card shell
    const card = document.createElement('section');
    card.className = 'explorable-card';
    card.style.width = `${width}px`;
    this.root.appendChild(card);
    this.card = card;

    // Header
    const header = document.createElement('div');
    header.className = 'explorable-card__header';
    const h = document.createElement('h3');
    h.className = 'explorable-card__title';
    h.textContent = title;
    header.appendChild(h);
    if (subtitle) {
      const sub = document.createElement('p');
      sub.className = 'explorable-card__subtitle';
      sub.textContent = subtitle;
      header.appendChild(sub);
    }
    card.appendChild(header);

    // Toolbar wrapper that gives widget variables (.d3-widgets) to the SVG
    const toolbarHost = document.createElement('div');
    toolbarHost.className = 'd3-widgets'; // your theme variables
    card.appendChild(toolbarHost);

    // SVG toolbar
    const toolbar = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    toolbar.classList.add('explorable-card__toolbar');
    toolbar.setAttribute('width', width);
    toolbar.setAttribute('height', 44);
    toolbarHost.appendChild(toolbar);

    // Play/Pause symbol button (left)
    if (actions.play) {
      const play = createSymbolButton(toolbar, {
        x: 18, y: 22, size: 16, symbol: 'play',
        onClick: () => {
          if (this.exp?.running) {
            this.pause();
            play.setSymbol('play');
          } else {
            this.play();
            play.setSymbol('pause');
          }
        }
      });
      this._play = play;
    }

    // Reset symbol button (reload) next to it
    if (actions.reset) {
      const reset = createSymbolButton(toolbar, {
        x: 52, y: 22, size: 16, symbol: 'reload',
        onClick: () => {
          if (this.exp?.reset) this.exp.reset();
          else if (this.exp?._reseedEnsemble) { this.exp._reseedEnsemble(true); this.exp.render?.(); }
          // If running, keep symbol consistent
          if (this.exp?.running) this._play?.setSymbol('pause');
        }
      });
      this._reset = reset;
    }

    // Slot for the explorable itself
    const slot = document.createElement('div');
    slot.className = 'explorable-card__slot';
    card.appendChild(slot);

    const mountDiv = document.createElement('div');
    slot.appendChild(mountDiv);

    const exOpts = Object.assign({ width }, explorable || {});
    this.exp = new ExplorableClass(mountDiv, exOpts);

    // If explorable starts running by itself, reflect on icon
    if (this.exp.running) this._play?.setSymbol('pause');
  }

  play()   { this.exp?.play?.(); }
  pause()  { this.exp?.pause?.(); }
  destroy(){ try { this.pause(); } catch {}; this.card?.remove(); }
}