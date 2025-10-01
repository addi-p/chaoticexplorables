// Build DOM for dropdown widget (compatible with widgets-plain.css tone)
export default function dropdownElement(dd) {
  const wrap = document.createElement('div');
  wrap.className = 'widget dropdown';
  dd.element = wrap;

  // label
  if (dd._label()) {
    const lab = document.createElement('label');
    lab.className = 'label';
    lab.textContent = dd._label();
    lab.setAttribute('for', dd._id());
    wrap.appendChild(lab);
  }

  // select
  const sel = document.createElement('select');
  sel.id = dd._id();
  sel.className = 'control';
  const opts = dd._opts();
  for (const o of opts) {
    const op = document.createElement('option');
    op.value = String(o.value);
    op.textContent = o.label;
    sel.appendChild(op);
  }
  // initial value
  const v = dd.value();
  if (v !== undefined) sel.value = String(v);
  sel.addEventListener('change', () => {
    // coerce to original type if we can
    const raw = sel.value;
    const found = opts.find(o => String(o.value) === raw);
    dd.value(found ? found.value : raw);
    dd._notify();
  });
  wrap.appendChild(sel);

  return wrap;
}