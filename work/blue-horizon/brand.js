/* The final Blue Horizon mark: a hexagon, its hub and three connections. */
(() => {
  let serial = 0;
  window.BlueHorizonLogo = function BlueHorizonLogo({ size = 22, color = '#4b9eff' }) {
    const [id] = React.useState(() => `horizon-sweep-${++serial}`);
    const h = React.createElement, stroke = `url(#${id})`;
    const small = size < 32;
    const stops = [
      h('stop', { key: 'start', offset: '0%', stopColor: color, stopOpacity: .3 }),
      h('stop', { key: 'middle', offset: '50%', stopColor: color, stopOpacity: small ? .9 : .65 }),
      h('stop', { key: 'end', offset: '100%', stopColor: color, stopOpacity: .3 })
    ];
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) stops.push(h('animateTransform', {
      key: 'flow', attributeName: 'gradientTransform', type: 'rotate', from: '0 28 28', to: '360 28 28', dur: '4s', repeatCount: 'indefinite'
    }));
    return h('svg', { className: 'horizon-logo', viewBox: '0 0 56 56', width: size, height: size, fill: 'none', 'aria-hidden': true },
      h('defs', null, h('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: 6, y1: 28, x2: 50, y2: 28 }, stops)),
      h('polygon', { points: '28,4 48,16 48,40 28,52 8,40 8,16', stroke, strokeWidth: small ? 4 : 1.6, strokeLinejoin: 'round' }),
      h('circle', { cx: 28, cy: 28, r: 3, fill: color }),
      ...[[28, 4], [48, 40], [8, 40]].map(([x2, y2], i) => h('line', { key: i, x1: 28, y1: 28, x2, y2, stroke, strokeWidth: small ? 2.6 : 1 }))
    );
  };
})();
