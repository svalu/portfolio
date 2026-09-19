/* global React, APPS, ORDERS, ACTIVITY, seedArr, mulberry32, Stroke */
const { useMemo, useRef, useState, useEffect } = React;

/* 컨테이너 실제 크기 — viewBox 를 px 과 1:1 로 맞춰야 선 굵기와 글자가 늘어나지 않는다.
   전에는 viewBox 1000 을 430px 에 preserveAspectRatio="none" 로 눌러서 톱니처럼 보였다 */
function useBox(ref, fallback = { w: 560, h: 240 }) {
  const [box, setBox] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      if (r.width > 40 && r.height > 40) setBox({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return box;
}

/* 점들을 Catmull-Rom 으로 이어 부드럽게. 실측 곡선처럼 보이게 하는 최소 장치 */
function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/* 하루 트래픽 모양: 새벽에 낮고 낮에 봉우리, 저녁에 작은 봉우리 하나. 랜덤 난수보다 그럴듯하다 */
function dayCurve(seed, base, peak, hPeak = 13, width = 4.6) {
  const r = mulberry32(seed);
  const out = [];
  for (let h = 0; h <= 24; h++) {
    const noon = Math.exp(-Math.pow((h - hPeak) / width, 2));
    const eve = 0.42 * Math.exp(-Math.pow((h - 20.5) / 3.0, 2));
    out.push(base + peak * (noon + eve) + (r() - 0.5) * peak * 0.09);
  }
  return out;
}

/* KPI 스파크라인용 — 무작위 20개는 톱니가 된다. 목표치로 흘러가는 추세에 흔들림만 얹는다 */
function trendLine(seed, n, from, to) {
  const r = mulberry32(seed);
  const out = [];
  let v = from;
  for (let i = 0; i < n; i++) {
    const target = from + (to - from) * (i / (n - 1));
    v = v * 0.58 + target * 0.42 + (r() - 0.5) * 6.5;
    out.push(v);
  }
  return out;
}

function Sparkline({ data, color = '#0078D4', id }) {
  const W = 120, H = 34;                       /* 폭은 CSS 가 늘리고, 굵기는 non-scaling-stroke 가 지킨다 */
  const max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * W, H - 2 - ((v - min) / rng) * (H - 6) ]);
  const gid = `sp-${id}`;                      /* 색값을 id 에 쓰면 '#' 이 섞여 url(#...) 참조가 깨진다 */
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.30" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${smooth(pts)} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${gid})`} />
      <path d={smooth(pts)} fill="none" stroke={color} strokeWidth="1.6"
            vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}

function TrafficChart() {
  const wrap = useRef(null);
  const { w, h } = useBox(wrap);
  const visits  = useMemo(() => dayCurve(11, 9, 74, 13.2, 4.6), []);
  const signups = useMemo(() => dayCurve(12, 3, 21, 14.0, 3.9), []);

  const padL = 40, padR = 12, padT = 12, padB = 26;
  const iw = Math.max(w - padL - padR, 10), ih = Math.max(h - padT - padB, 10);
  const MAX = 100, SCALE = 30;                 /* 값 v → v*30 회, 눈금은 0·1k·2k·3k */

  const toPts = (arr) => arr.map((v, i) => [
    padL + (i / (arr.length - 1)) * iw,
    padT + ih - (v / MAX) * ih,
  ]);
  const series = [
    { key: 'visits',  pts: toPts(visits),  color: '#0078D4' },
    { key: 'signups', pts: toPts(signups), color: '#22B8CF' },
  ];
  const ticks = [0, 100/3, 200/3, 100];        /* 값으로는 0 · 1k · 2k · 3k */
  const label = (v) => { const n = Math.round(v * SCALE); return n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`; };

  return (
    <div className="chart-wrap" ref={wrap}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.key} id={`tf-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="1" stopColor={s.color} stopOpacity="0.01" />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((t) => {
          const y = padT + ih - (t / MAX) * ih;
          return (
            <g key={t.toFixed(1)}>
              <line x1={padL} y1={y} x2={w - padR} y2={y}
                    stroke="var(--border-strong)" strokeOpacity={t === 0 ? 0.5 : 0.28}
                    strokeDasharray={t === 0 ? '0' : '2 4'} />
              <text x={padL - 8} y={y + 3.5} textAnchor="end" fontSize="10"
                    fill="var(--text-mute)" fontFamily="Inter">{label(t)}</text>
            </g>
          );
        })}

        {series.map(s => (
          <g key={s.key}>
            <path d={`${smooth(s.pts)} L ${padL + iw} ${padT + ih} L ${padL} ${padT + ih} Z`} fill={`url(#tf-${s.key})`} />
            <path d={smooth(s.pts)} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        ))}

        {/* 지금 시각의 값 — 마지막 점만 찍어 '살아 있는 화면'으로 */}
        {series.map(s => {
          const p = s.pts[s.pts.length - 1];
          return <circle key={s.key} cx={p[0]} cy={p[1]} r="3" fill="var(--surface-solid)" stroke={s.color} strokeWidth="1.8" />;
        })}

        {[0, 6, 12, 18, 24].map(hh => (
          <text key={hh} x={padL + (hh / 24) * iw} y={h - 8} textAnchor={hh === 0 ? 'start' : (hh === 24 ? 'end' : 'middle')}
                fontSize="10" fill="var(--text-mute)" fontFamily="Inter">{String(hh).padStart(2, '0')}:00</text>
        ))}
      </svg>
    </div>
  );
}

function Dashboard() {
  const kpi = [
    { key: 'users', label: 'Active Users', value: '24,812', trend: '+4.2%', dir: 'up', color: '#0078D4', spark: trendLine(3, 22, 38, 76) },
    { key: 'mrr', label: 'MRR',          value: '$184.2K', trend: '+2.1%', dir: 'up', color: '#1A9D4A', spark: trendLine(4, 22, 44, 82) },
    { key: 'err', label: 'Error Rate',   value: '0.34%',  trend: '-0.08%', dir: 'up', color: '#22B8CF', spark: trendLine(5, 22, 62, 30) },
    { key: 'tickets', label: 'Open Tickets', value: '128',    trend: '+12',   dir: 'down', color: '#F7B32B', spark: trendLine(6, 22, 48, 80) },
  ];

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="app-side-title">Workspace</div>
        <a className="sel"><Stroke d="M3 12 L12 3 L21 12 M5 10 V21 H19 V10" /> Overview</a>
        <a><Stroke d="M3 3 H10 V10 H3 Z M14 3 H21 V10 H14 Z M3 14 H10 V21 H3 Z M14 14 H21 V21 H14 Z" /> Reports</a>
        <a><Stroke d="M12 2 V22 M2 12 H22" /> Integrations</a>
        <a><Stroke d="M2 12 Q12 2 22 12 Q12 22 2 12 Z M12 9 A3 3 0 1 1 11.99 9" /> Audit Log</a>
        <div className="app-side-title" style={{marginTop: 18}}>Environments</div>
        <a><span style={{width:8,height:8,borderRadius:8,background:'#1A9D4A',display:'inline-block'}}/>Production</a>
        <a><span style={{width:8,height:8,borderRadius:8,background:'#F7B32B',display:'inline-block'}}/>Staging</a>
        <a><span style={{width:8,height:8,borderRadius:8,background:'#8A8A8A',display:'inline-block'}}/>Development</a>
      </aside>

      <main className="app-main">
        <h1 className="app-h1">Good morning, Alex</h1>
        <p className="app-sub">Here's what's happening across production — last 24 hours.</p>

        <div className="kpi-grid">
          {kpi.map(k => (
            <div className="kpi" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className={`kpi-trend ${k.dir}`}>
                <span>{k.dir === 'up' ? '▲' : '▼'}</span> {k.trend} <span style={{color:'var(--text-mute)', marginLeft:4}}>vs last wk</span>
              </div>
              <div className="kpi-spark"><Sparkline data={k.spark} color={k.color} id={k.key} /></div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="panel">
            <div className="panel-h">
              <h3>Live traffic</h3>
              <a className="panel-a">View details →</a>
            </div>
            <TrafficChart />
            <div style={{display:'flex', gap:16, fontSize:11, color:'var(--text-dim)', marginTop:8}}>
              <span><span style={{display:'inline-block',width:10,height:2,background:'#0078D4',marginRight:6,verticalAlign:'middle'}}/>Visits</span>
              <span><span style={{display:'inline-block',width:10,height:2,background:'#22B8CF',marginRight:6,verticalAlign:'middle'}}/>Signups</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-h"><h3>Activity</h3></div>
            {ACTIVITY.slice(0, 6).map((a, i) => (
              <div className="act" key={i}>
                <div className="act-dot" style={{background: a.color}} />
                <div className="act-body">
                  <div className="t"><b>{a.who}</b> {a.what}</div>
                  <div className="time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <h3>Recent orders</h3>
            <a className="panel-a">All orders →</a>
          </div>
          <table className="t">
            <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {ORDERS.map(o => (
                <tr key={o.id}>
                  <td style={{fontFamily:'JetBrains Mono, monospace', fontSize:12}}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td style={{fontWeight:500}}>{o.amount}</td>
                  <td>
                    {o.status === 'paid' && <span className="badge ok"><span className="dot"/>Paid</span>}
                    {o.status === 'pending' && <span className="badge warn"><span className="dot"/>Pending</span>}
                    {o.status === 'refunded' && <span className="badge muted"><span className="dot"/>Refunded</span>}
                  </td>
                  <td style={{color:'var(--text-dim)'}}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { Dashboard });
