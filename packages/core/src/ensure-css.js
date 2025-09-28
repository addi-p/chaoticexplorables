// packages/core/src/ensure-css.js
export const ExplorableCardCSS = {
  ensure() {
    const id = 'explorable-card-css';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL('./explorable-card.css', import.meta.url).toString();
    document.head.appendChild(link);
  }
};