const params = new URLSearchParams(location.search);
const slug = params.get('slug') || 'double-pendulum';
const mount = '#mount';

const registry = {
  'double-pendulum': async () => {
    const { DoublePendulumExplorable } = await import('@chaoticexplorables/double-pendulum/src/index.js');
    const { ICONS } = await import('@chaoticexplorables/icons/src/index.js');
    const exp = new DoublePendulumExplorable(mount, {
      layout: 'side',
      theme: 'dark',
      showControls: true,
      showPhasePlane: true,
      enableClickIK: true,
      icons: ICONS
    });
    exp.play();
  },
  'kuramoto': async () => {
    const { KuramotoExplorable } = await import('@chaoticexplorables/kuramoto/src/index.js');
    const { ICONS } = await import('@chaoticexplorables/icons/src/index.js');
    new KuramotoExplorable(mount, { theme: 'dark', icons: ICONS }).play?.();
  }
};

(await registry[slug]?.()) ?? document.querySelector(mount).append('Unknown explorable: ' + slug);