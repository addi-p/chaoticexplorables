// packages/core/src/ExplorableCard.js
import { ensureCardCSS } from './ensure-css.js';

export class ExplorableCard {
  constructor(mount, cfg) {
    const {
      ExplorableClass,
      title = 'Explorable',
      subtitle = '',
      width = 260,         // inner rail width (px)
      fitColumn = true,    // outer card spans container
      explorable = {},
    } = cfg || {};

    if (!ExplorableClass) throw new Error('ExplorableCard: missing ExplorableClass');

    this.root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.root) throw new Error('ExplorableCard: mount not found');

    ensureCardCSS();

    // OUTER: fills column
    const card = document.createElement('section');
    card.className = 'explorable-card';
    if (fitColumn) card.style.width = '100%';
    card.style.setProperty('--card-rail-width', `${width}px`);
    this.root.appendChild(card);
    this.card = card;

    // Header chrome
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

    // INNER rail (centered, fixed px width)
    const rail = document.createElement('div');
    rail.className = 'explorable-card__rail';
    card.appendChild(rail);

    const slot = document.createElement('div');
    slot.className = 'explorable-card__slot';
    rail.appendChild(slot);

    // Instantiate explorable into the slot
    const exOpts = Object.assign({ width }, explorable || {});
    this.exp = new ExplorableClass(slot, exOpts);
  }

  play()   { this.exp?.play?.(); }
  pause()  { this.exp?.pause?.(); }
  destroy(){ try { this.pause(); } catch {} this.card?.remove(); }
}