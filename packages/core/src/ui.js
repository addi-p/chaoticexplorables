export function slider({ label, min, max, step, value, oninput }) {
  const box = document.createElement('div'); box.className = 'cx-control';
  const lab = document.createElement('label'); lab.textContent = label;
  const span = document.createElement('span'); span.className = 'cx-number'; span.textContent = String(value);
  const inp = document.createElement('input'); inp.type = 'range'; Object.assign(inp, { min, max, step, value });
  inp.addEventListener('input', () => { span.textContent = inp.value; oninput?.(Number(inp.value)); });
  lab.appendChild(document.createTextNode(' ')); lab.appendChild(span);
  box.append(lab, inp);
  return { el: box, input: inp, label: lab, valueEl: span };
}

export function button({ text, iconPath, onclick }) {
  const b = document.createElement('button'); b.className = 'cx-btn'; b.addEventListener('click', onclick);
  if (iconPath) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '18'); svg.setAttribute('height', '18');
    svg.innerHTML = `<path d="${iconPath}"/>`; b.appendChild(svg);
  }
  b.appendChild(document.createTextNode(text));
  return b;
}