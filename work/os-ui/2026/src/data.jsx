/* global React */
// Shared seed data for the admin OS

const APPS = [
  { id: 'dashboard', label: 'Dashboard', color: '#0078D4', initial: 'pos:{x:80,y:80,w:1080,h:720}' },
  { id: 'users',     label: 'Users',     color: '#8B5CF6' },
  { id: 'analytics', label: 'Analytics', color: '#22B8CF' },
  { id: 'files',     label: 'Files',     color: '#F7B32B' },
  { id: 'messages',  label: 'Messages',  color: '#1A9D4A' },
  { id: 'settings',  label: 'Settings',  color: '#5C5C5C', hiddenOnDesktop: true },
];

const USERS = [
  { name: 'Alex Morgan',      email: 'alex.morgan@acme.co',    role: 'Admin',      status: 'active',   last: '2 min ago',  joined: 'Jan 12, 2024' },
  { name: 'Priya Shah',       email: 'priya.shah@acme.co',     role: 'Editor',     status: 'active',   last: '14 min ago', joined: 'Mar 03, 2024' },
  { name: 'Jordan Lee',       email: 'j.lee@acme.co',          role: 'Viewer',     status: 'pending',  last: '—',          joined: 'Apr 17, 2026' },
  { name: 'Maria Fernandes',  email: 'maria.f@acme.co',        role: 'Editor',     status: 'active',   last: '1 hr ago',   joined: 'Nov 28, 2023' },
  { name: 'Ken Watanabe',     email: 'ken.w@acme.co',          role: 'Admin',      status: 'active',   last: '3 hr ago',   joined: 'Aug 04, 2023' },
  { name: 'Sofia Rossi',      email: 'sofia.r@acme.co',        role: 'Viewer',     status: 'inactive', last: '12 days',    joined: 'Feb 19, 2024' },
  { name: 'David Kim',        email: 'david.kim@acme.co',      role: 'Editor',     status: 'active',   last: '5 min ago',  joined: 'Jun 11, 2024' },
  { name: 'Chioma Nwosu',     email: 'chioma.n@acme.co',       role: 'Admin',      status: 'active',   last: '8 hr ago',   joined: 'Oct 22, 2023' },
  { name: 'Evan Brooks',      email: 'evan.b@acme.co',         role: 'Viewer',     status: 'active',   last: 'yesterday',  joined: 'Jan 30, 2024' },
  { name: 'Luca Conti',       email: 'luca.c@acme.co',         role: 'Editor',     status: 'pending',  last: '—',          joined: 'Apr 19, 2026' },
];

const ORDERS = [
  { id: '#38421', customer: 'Northwind Co.',       amount: '$4,280',  status: 'paid',      date: 'Apr 20' },
  { id: '#38420', customer: 'Helix Dynamics',      amount: '$12,940', status: 'paid',      date: 'Apr 20' },
  { id: '#38419', customer: 'Kite & Co',           amount: '$820',    status: 'pending',   date: 'Apr 20' },
  { id: '#38418', customer: 'Loam Studio',         amount: '$3,110',  status: 'paid',      date: 'Apr 19' },
  { id: '#38417', customer: 'Pillar Labs',         amount: '$570',    status: 'refunded',  date: 'Apr 19' },
  { id: '#38416', customer: 'Western Biofuels',    amount: '$8,420',  status: 'paid',      date: 'Apr 19' },
  { id: '#38415', customer: 'Bramble Inc.',        amount: '$2,140',  status: 'pending',   date: 'Apr 18' },
];

const ACTIVITY = [
  { who: 'Priya Shah',      what: 'updated the pricing page',             time: '2 min ago',  color: '#22B8CF' },
  { who: 'Alex Morgan',     what: 'invited 3 users to the Ops workspace', time: '18 min ago', color: '#0078D4' },
  { who: 'System',          what: 'rotated access keys (scheduled)',      time: '42 min ago', color: '#F7B32B' },
  { who: 'David Kim',       what: 'archived a deprecated dataset',        time: '1 hr ago',   color: '#8B5CF6' },
  { who: 'Maria Fernandes', what: 'exported 2,410 invoices as CSV',       time: '2 hr ago',   color: '#1A9D4A' },
  { who: 'Ken Watanabe',    what: 'deployed analytics-svc v3.4.1',        time: '3 hr ago',   color: '#0078D4' },
];

const NOTIFICATIONS = [
  { app: 'Messages',  title: 'Priya replied in #release-cut',   body: '"Pushed the hotfix, feel free to verify when you\'re back."', time: '2m' },
  { app: 'Analytics', title: 'Traffic anomaly detected',        body: 'Signup page errors up 2.3× baseline over last 15min.',       time: '18m' },
  { app: 'Users',     title: '3 pending invitations',           body: 'Jordan Lee, Luca Conti and 1 more are awaiting access.',      time: '1h' },
  { app: 'Files',     title: 'Backup complete',                 body: 'Daily snapshot saved — 24.8 GB written to cold-storage.',    time: '3h' },
];

const FILES = [
  { name: 'Q1-report.pdf',      kind: 'pdf',  size: '1.2 MB', modified: 'Apr 18' },
  { name: 'brand-guidelines.ai',kind: 'ai',   size: '18.4 MB',modified: 'Apr 17' },
  { name: 'users-export.csv',   kind: 'csv',  size: '842 KB', modified: 'Apr 20' },
  { name: 'roadmap.md',         kind: 'md',   size: '14 KB',  modified: 'Apr 16' },
  { name: 'hero-video.mp4',     kind: 'vid',  size: '120 MB', modified: 'Apr 12' },
  { name: 'dashboard.fig',      kind: 'fig',  size: '4.4 MB', modified: 'Apr 14' },
  { name: 'invoices-2026-Q1',   kind: 'dir',  size: '—',      modified: 'Apr 10' },
  { name: 'archive.zip',        kind: 'zip',  size: '88.6 MB',modified: 'Apr 02' },
  { name: 'README.md',          kind: 'md',   size: '4 KB',   modified: 'Mar 28' },
  { name: 'logo-final.svg',     kind: 'svg',  size: '22 KB',  modified: 'Mar 22' },
];

const CONVERSATIONS = [
  { id: 'c1', from: 'Priya Shah',      subj: 'Release cut for v3.4',            preview: 'Pushed the hotfix, feel free to verify when you\'re back.',  time: '2m',  unread: true,
    body: `Hey — pushed the hotfix for the analytics timeout bug to staging.\n\nCan you verify on your end when you\'re back? The repro was flaky but I\'ve added a retry around the stale cursor.\n\nIf it looks good I\'ll promote to prod around 4pm.` },
  { id: 'c2', from: 'System',          subj: 'Anomaly: signup errors',          preview: 'Error rate for /signup up 2.3× over the last 15 minutes...',  time: '18m', unread: true,
    body: `Anomaly detected at 01:08 UTC.\n\nScope: POST /api/signup\nError rate: 2.3× 7-day baseline\nDuration so far: 15m\n\nRecent changes: auth-svc v2.9.3 deploy at 00:54 UTC.` },
  { id: 'c3', from: 'Alex Morgan',     subj: 'Ops workspace invites',           preview: 'Sent invites to Jordan, Luca and Reese — can you approve?',  time: '1h',  unread: false,
    body: `Invited 3 new folks to the Ops workspace. They\'re all starting Monday.\n\nCould you approve their admin access when you get a sec? Roles are pre-filled.` },
  { id: 'c4', from: 'Maria Fernandes', subj: 'Invoice export is ready',         preview: 'CSV ready at /exports/invoices-2026-Q1.csv',                  time: '2h',  unread: false,
    body: `The Q1 invoice export finished — 2,410 rows, totalling $4.2M in net bookings.\n\nFile is at /exports/invoices-2026-Q1.csv (842 KB).` },
  { id: 'c5', from: 'Ken Watanabe',    subj: 'Re: analytics-svc v3.4.1',        preview: 'Deploy green. Latency back to p50 180ms.',                    time: '3h',  unread: false,
    body: `Deploy is green. P50 latency back to 180ms, error rate nominal.\n\nRolled out across all three regions. Monitoring for 30 min before closing the incident.` },
];

// Seeded randomness for charts
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seedArr(seed, n, min, max) {
  const r = mulberry32(seed);
  const out = [];
  for (let i = 0; i < n; i++) out.push(min + (max - min) * r());
  return out;
}

Object.assign(window, { APPS, USERS, ORDERS, ACTIVITY, NOTIFICATIONS, FILES, CONVERSATIONS, seedArr, mulberry32 });
