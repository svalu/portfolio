/* global React, APPS, ORDERS, ACTIVITY, seedArr, Stroke */
const { useMemo } = React;

function Sparkline({ data, color = '#0078D4', w = 72, h = 28 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sp-${color})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function TrafficChart() {
  const series1 = useMemo(() => seedArr(1, 40, 40, 95), []);
  const series2 = useMemo(() => seedArr(2, 40, 20, 70), []);
  const w = 1000, h = 220, padL = 36, padB = 24, padT = 10, padR = 8;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const makePath = (s, color) => {
    const pts = s.map((v, i) => `${padL + (i / (s.length - 1)) * innerW},${padT + innerH - (v / 100) * innerH}`);
    return (
      <>
        <path d={`M ${pts[0]} L ${pts.join(' L ')} L ${padL + innerW},${padT + innerH} L ${padL},${padT + innerH} Z`}
              fill={color} opacity="0.12" />
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.6" />
      </>
    );
  };
  return (
    <div className="chart-wrap">
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = padT + p * innerH;
          return <line key={i} x1={padL} y1={y} x2={w - padR} y2={y} stroke="rgba(120,120,120,0.18)" strokeDasharray="2 3" />;
        })}
        {makePath(series1.map(v => v), '#0078D4')}
        {makePath(series2.map(v => v * 0.8), '#22B8CF')}
      </svg>
    </div>
  );
}

function Dashboard() {
  const kpi = [
    { label: 'Active Users', value: '24,812', trend: '+4.2%', dir: 'up', color: '#0078D4', spark: seedArr(3, 20, 20, 80) },
    { label: 'MRR',          value: '$184.2K', trend: '+2.1%', dir: 'up', color: '#1A9D4A', spark: seedArr(4, 20, 30, 90) },
    { label: 'Error Rate',   value: '0.34%',  trend: '-0.08%', dir: 'up', color: '#22B8CF', spark: seedArr(5, 20, 10, 50) },
    { label: 'Open Tickets', value: '128',    trend: '+12',   dir: 'down', color: '#F7B32B', spark: seedArr(6, 20, 40, 95) },
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
              <div className="kpi-spark"><Sparkline data={k.spark} color={k.color} /></div>
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
