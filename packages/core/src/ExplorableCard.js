// packages/core/src/ExplorableCard.js
// Minimal card: header + slot. No buttons here.
// Your explorable (e.g., DoublePendulumExplorable) contains its own toolbar.

import { ExplorableCardCSS } from './ensure-css.js';

export class ExplorableCard {
  constructor(mount, cfg) {
    const {
      ExplorableClass,
      title = 'Explorable',
      subtitle = '',
      width = 260,
      // keep "explorable" passthrough for options
      explorable = {},
    } = cfg || {};

    if (!ExplorableClass) throw new Error('ExplorableCard: missing ExplorableClass');

    // Resolve mount
    this.root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('ExplorableCard: mount not found');

    // Ensure base CSS (neutral chrome, no rounded corners)
    ExplorableCardCSS.ensure();

    // Card shell
    const card = document.createElement('section');
    card.className = 'explorable-card';
    card.style.width = `${width}px`;
    this.root.appendChild(card);
    this.card = card;

    // Header
    const header = document.createElement('div');
    header.className = 'explorable-card__header';
    card.appendChild(header);

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

    // Slot for the explorable itself
    const slot = document.createElement('div');
    slot.className = 'explorable-card__slot';
    card.appendChild(slot);

    const mountDiv = document.createElement('div');
    slot.appendChild(mountDiv);

    // Instantiate explorable (let it manage its own toolbar/controls/canvases)
    const exOpts = Object.assign({ width }, explorable || {});
    this.exp = new ExplorableClass(mountDiv, exOpts);
  }

  // Pass-through helpers in case the page wants to control it
  play()   { this.exp?.play?.(); }
  pause()  { this.exp?.pause?.(); }
  destroy(){ try { this.pause(); } catch {} this.card?.remove(); }
}