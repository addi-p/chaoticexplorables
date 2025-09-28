// packages/widgets/src/grid.js
// Simple grid layout for explorables: neat slots, consistent sizing.

export class Grid {
  constructor(mount, { gap = 10, width = 200 } = {}) {
    this.el = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!this.el) throw new Error('Grid mount not found');
    Object.assign(this.el.style, {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: `${gap}px`,
      width: `${width}px`,
      margin: '0',
      padding: '0',
      background: '#ffffff07',
      color: '#111',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      lineHeight: '1.35'
    });
  }
  slot({ h = 0 } = {}) {
    const div = document.createElement('div');
    if (h) div.style.height = `${h}px`;
    this.el.appendChild(div);
    return div;
  }
  frame({ w = 300, h = 300 } = {}) {
    const box = document.createElement('div');
    Object.assign(box.style, {
      width: `${w}px`,
      height: `${h}px`,
      background: '#ffffff04',
      border: '1px solid #c9c9c9',
      borderRadius: '0',
      position: 'relative'
    });
    this.el.appendChild(box);
    return box;
  }
}