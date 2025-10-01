// packages/widgets/src/dropdown.js
export default function dropdown() {
  let _id = 'dropdown-' + Math.random().toString(36).slice(2);
  let _label = '';
  let _size = 220;
  let _items = [];
  let _value = undefined;
  let _onUpdate = () => {};

  function api() {}

  api.id = (s) => (_id = s, api);
  api.label = (s) => (_label = s, api);
  api.size = (w) => (_size = +w || _size, api);
  api.items = (arr) => (_items = Array.isArray(arr) ? arr.slice() : [], api);
  api.value = (v) => (arguments.length ? (_value = v, api) : _value);
  api.update = (fn) => (_onUpdate = typeof fn === 'function' ? fn : _onUpdate, api);

  api.element = function element() {
    const wrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const width = Math.max(160, _size);
    const height = 38;

    // Label
    if (_label) {
      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.setAttribute('x', 0);
      lbl.setAttribute('y', -10);
      lbl.setAttribute('font-size', '12');
      lbl.setAttribute('fill', 'var(--color-text, #222)');
      lbl.textContent = _label;
      wrap.appendChild(lbl);
    }

    // HTML select over SVG so it’s accessible and easy to style by the page
    const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreign.setAttribute('x', 0);
    foreign.setAttribute('y', 0);
    foreign.setAttribute('width', width);
    foreign.setAttribute('height', height);
    wrap.appendChild(foreign);

    const host = document.createElement('div');
    host.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    host.style.width = width + 'px';
    host.style.height = height + 'px';
    host.style.display = 'flex';
    host.style.alignItems = 'center';
    host.style.gap = '8px';
    foreign.appendChild(host);

    const sel = document.createElement('select');
    sel.style.display = 'block';
    sel.style.width = width + 'px';
    sel.style.height = '28px';
    sel.style.font = '13px ui-sans-serif, system-ui, -apple-system';
    sel.style.color = 'var(--color-text, #222)';
    sel.style.background = 'var(--color-surface, #fff)';
    sel.style.border = '1px solid var(--color-border, #ccc)';
    sel.style.borderRadius = '6px';
    sel.style.padding = '2px 6px';

    host.appendChild(sel);

    sel.innerHTML = '';
    _items.forEach((it) => {
      const opt = document.createElement('option');
      if (typeof it === 'string') {
        opt.value = it; opt.textContent = it;
      } else {
        opt.value = it.value; opt.textContent = it.label ?? it.value;
      }
      sel.appendChild(opt);
    });

    if (_value == null && _items.length) {
      _value = (typeof _items[0] === 'string') ? _items[0] : _items[0].value;
    }
    if (_value != null) sel.value = _value;

    sel.addEventListener('change', () => {
      _value = sel.value;
      _onUpdate();
    });

    // expose hook for parent redraw without rebuilding
    api.value = (v) => {
      if (arguments.length) { _value = v; sel.value = v; return api; }
      return sel.value;
    };

    return wrap;
  };

  return api;
}

export function dropdownElement(d) {
  return d.element();
}