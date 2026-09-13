/* global React */
// Fluent-style icon set. SVG, colorful, rounded squircle bases.

const { createElement: h } = React;

function AppTile({ bg, children, size = 48, radius = 10 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`g-${bg.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg.top} />
          <stop offset="1" stopColor={bg.bot} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx={radius} fill={`url(#g-${bg.id})`} stroke="rgba(255,255,255,0.25)" />
      <g>{children}</g>
    </svg>
  );
}

const IconDashboard = (p) => (
  <AppTile {...p} bg={{ id: 'dash', top: '#2B8FE9', bot: '#0B64C4' }}>
    <rect x="10" y="10" width="12" height="12" rx="2" fill="#fff" opacity="0.95" />
    <rect x="26" y="10" width="12" height="8"  rx="2" fill="#fff" opacity="0.7" />
    <rect x="26" y="22" width="12" height="16" rx="2" fill="#fff" opacity="0.85" />
    <rect x="10" y="26" width="12" height="12" rx="2" fill="#fff" opacity="0.6" />
  </AppTile>
);

const IconUsers = (p) => (
  <AppTile {...p} bg={{ id: 'usr', top: '#A78BFA', bot: '#7C3AED' }}>
    <circle cx="18" cy="19" r="5" fill="#fff" />
    <circle cx="30" cy="22" r="4" fill="#fff" opacity="0.7" />
    <path d="M10 38 C12 30 14 28 18 28 C22 28 24 30 26 38 Z" fill="#fff" />
    <path d="M24 38 C25 33 27 31 30 31 C33 31 35 33 36 38 Z" fill="#fff" opacity="0.7" />
  </AppTile>
);

const IconAnalytics = (p) => (
  <AppTile {...p} bg={{ id: 'ana', top: '#38D0E4', bot: '#11859A' }}>
    <rect x="10" y="22" width="5" height="16" rx="1.2" fill="#fff" opacity="0.8" />
    <rect x="18" y="16" width="5" height="22" rx="1.2" fill="#fff" />
    <rect x="26" y="26" width="5" height="12" rx="1.2" fill="#fff" opacity="0.7" />
    <rect x="34" y="12" width="5" height="26" rx="1.2" fill="#fff" opacity="0.9" />
  </AppTile>
);

const IconFiles = (p) => (
  <AppTile {...p} bg={{ id: 'fil', top: '#FFCB5B', bot: '#E39010' }}>
    <path d="M10 16 Q10 14 12 14 L20 14 L22.5 17 L36 17 Q38 17 38 19 L38 36 Q38 38 36 38 L12 38 Q10 38 10 36 Z" fill="#fff" />
    <path d="M10 16 Q10 14 12 14 L20 14 L22.5 17 L36 17 Q38 17 38 19 L38 22 L10 22 Z" fill="#fff" opacity="0.65" />
  </AppTile>
);

const IconMessages = (p) => (
  <AppTile {...p} bg={{ id: 'msg', top: '#3AD47B', bot: '#0E8C41' }}>
    <path d="M10 16 Q10 12 14 12 L34 12 Q38 12 38 16 L38 28 Q38 32 34 32 L20 32 L14 38 L14 32 Q10 32 10 28 Z" fill="#fff" />
    <circle cx="18" cy="22" r="1.6" fill="#0E8C41" />
    <circle cx="24" cy="22" r="1.6" fill="#0E8C41" />
    <circle cx="30" cy="22" r="1.6" fill="#0E8C41" />
  </AppTile>
);

const IconSettings = (p) => (
  <AppTile {...p} bg={{ id: 'set', top: '#9AA1B0', bot: '#4E525D' }}>
    <path d="M24 12 L27 14 L30.5 13.5 L32 17 L35 18.5 L34.5 22 L36 25 L34 27.5 L34 31 L31 32 L29 35 L25.5 34.5 L24 37 L22 35 L18.5 34.5 L17 32 L14 31 L14 27.5 L12 25 L13.5 22 L13 18.5 L16 17 L17.5 13.5 L21 14 Z" fill="#fff"/>
    <circle cx="24" cy="24" r="5" fill="#4E525D"/>
  </AppTile>
);

const IconStart = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <rect x="3"  y="3"  width="8" height="8" rx="1.2" fill="var(--accent)" />
    <rect x="13" y="3"  width="8" height="8" rx="1.2" fill="var(--accent)" opacity="0.75" />
    <rect x="3"  y="13" width="8" height="8" rx="1.2" fill="var(--accent)" opacity="0.75" />
    <rect x="13" y="13" width="8" height="8" rx="1.2" fill="var(--accent)" />
  </svg>
);

const IconMap = {
  dashboard: IconDashboard,
  users: IconUsers,
  analytics: IconAnalytics,
  files: IconFiles,
  messages: IconMessages,
  settings: IconSettings,
};

function AppIcon({ id, size = 48 }) {
  const C = IconMap[id] || IconDashboard;
  return <C size={size} />;
}

// Small inline stroke icons
function Stroke({ d, size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
  );
}

// File type glyph
function FileGlyph({ kind }) {
  const palette = {
    pdf: '#E44A4A', ai: '#E78E00', csv: '#21A25C', md: '#607D8B', vid: '#6A5BE0',
    fig: '#FF6E52', zip: '#8A8A8A', svg: '#E1A400', dir: '#F7B32B',
  };
  const color = palette[kind] || '#8A8A8A';
  if (kind === 'dir') {
    return (
      <svg viewBox="0 0 42 52" width="42" height="52">
        <path d="M2 12 Q2 8 6 8 L16 8 L19 12 L36 12 Q40 12 40 16 L40 44 Q40 48 36 48 L6 48 Q2 48 2 44 Z" fill="#FFCB5B" />
        <path d="M2 12 Q2 8 6 8 L16 8 L19 12 L36 12 Q40 12 40 16 L40 20 L2 20 Z" fill="#F7B32B" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 42 52" width="42" height="52">
      <path d="M4 4 L26 4 L38 16 L38 48 Q38 50 36 50 L4 50 Q2 50 2 48 L2 6 Q2 4 4 4 Z" fill="#fff" stroke="rgba(0,0,0,0.12)"/>
      <path d="M26 4 L26 14 Q26 16 28 16 L38 16 Z" fill="rgba(0,0,0,0.08)"/>
      <rect x="2" y="30" width="36" height="16" rx="2" fill={color}/>
      <text x="20" y="42" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">{kind.toUpperCase()}</text>
    </svg>
  );
}

Object.assign(window, { AppIcon, IconStart, Stroke, FileGlyph });
