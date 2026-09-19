/* global React, seedArr, Stroke */
const { useMemo } = React;

function Bars({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{display:'flex', alignItems:'flex-end', gap:4, height:180}}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex:1,
          height: `${(v/max)*100}%`,
          background: `linear-gradient(180deg, ${color}, ${color}99)`,
          borderRadius: '4px 4px 0 0',
          minHeight: 2,
        }}/>
      ))}
    </div>
  );
}

function Donut({ segments, size = 160 }) {
  const total = segments.reduce((a, s) => a + s.v, 0);
  let acc = 0;
  const R = size * 0.44, r = size * 0.31;      /* size 에 비례 — 전에는 고정값이라 size 를 바꾸면 어긋났다 */
  const cx = size/2, cy = size/2;
  const arcs = segments.map((s, i) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI/2;
    acc += s.v;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI/2;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * R, y0 = cy + Math.sin(a0) * R;
    const x1 = cx + Math.cos(a1) * R, y1 = cy + Math.sin(a1) * R;
    const x2 = cx + Math.cos(a1) * r, y2 = cy + Math.sin(a1) * r;
    const x3 = cx + Math.cos(a0) * r, y3 = cy + Math.sin(a0) * r;
    return <path key={i} d={`M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r} ${r} 0 ${large} 0 ${x3} ${y3} Z`} fill={s.color} />;
  });
  return (
    <svg width={size} height={size}>
      {arcs}
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={size * 0.135} fontWeight="600" fill="var(--text)" fontFamily="Inter">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="var(--text-dim)" fontFamily="Inter">Total sessions</text>
    </svg>
  );
}

function Analytics() {
  const weekBars = useMemo(() => seedArr(11, 28, 20, 90), []);
  const segments = [
    { label: 'Direct', v: 38400, color: '#0078D4' },
    { label: 'Search', v: 21600, color: '#22B8CF' },
    { label: 'Social', v: 12800, color: '#8B5CF6' },
    { label: 'Referral', v: 7200, color: '#F7B32B' },
  ];
  const regions = [
    { name: 'United States',  v: 42 },
    { name: 'Germany',        v: 18 },
    { name: 'Japan',          v: 14 },
    { name: 'Brazil',         v: 12 },
    { name: 'Australia',      v: 8 },
    { name: 'Other',          v: 6 },
  ];

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="app-side-title">Analytics</div>
        <a className="sel"><Stroke d="M3 3 V21 H21 M7 17 V10 M12 17 V6 M17 17 V13" /> Overview</a>
        <a><Stroke d="M3 12 Q12 2 21 12 Q12 22 3 12 Z M12 9 A3 3 0 1 1 11.99 9" /> Acquisition</a>
        <a><Stroke d="M12 3 V21 M4 10 H20 M4 15 H20" /> Behavior</a>
        <a><Stroke d="M4 6 Q12 2 20 6 V18 Q12 22 4 18 Z" /> Conversion</a>
        <div className="app-side-title" style={{marginTop:18}}>Range</div>
        <a className="sel">Last 28 days</a>
        <a>Last 7 days</a>
        <a>This month</a>
        <a>Custom…</a>
      </aside>
      <main className="app-main">
        <h1 className="app-h1">Analytics</h1>
        <p className="app-sub">Traffic & engagement — last 28 days.</p>

        <div className="grid-3" style={{marginBottom:14}}>
          <div className="kpi"><div className="kpi-label">Sessions</div><div className="kpi-value">80,012</div><div className="kpi-trend up">▲ +6.8%</div></div>
          <div className="kpi"><div className="kpi-label">Avg. duration</div><div className="kpi-value">3m 42s</div><div className="kpi-trend up">▲ +12s</div></div>
          <div className="kpi"><div className="kpi-label">Bounce rate</div><div className="kpi-value">32.1%</div><div className="kpi-trend up">▼ -1.4%</div></div>
        </div>

        <div className="grid-2">
          <div className="panel">
            <div className="panel-h"><h3>Sessions by day</h3><a className="panel-a">Export CSV</a></div>
            <Bars data={weekBars} color="#0078D4" />
            <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:11, color:'var(--text-mute)'}}>
              <span>Mar 24</span><span>Apr 6</span><span>Apr 20</span>
            </div>
          </div>
          <div className="panel">
            <div className="panel-h"><h3>Sources</h3></div>
            <div style={{display:'flex', alignItems:'center', gap:22, flexWrap:'wrap'}}>
              <Donut segments={segments} size={148} />
              <div style={{flex:1, minWidth:150, fontSize:12}}>
                {segments.map(s => (
                  <div key={s.label} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)'}}>
                    <span><span style={{display:'inline-block',width:8,height:8,borderRadius:8,background:s.color,marginRight:8,verticalAlign:'middle'}}/>{s.label}</span>
                    <span style={{fontWeight:500}}>{s.v.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{marginTop:14}}>
          <div className="panel-h"><h3>By region</h3></div>
          {regions.map(r => (
            <div key={r.name} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 0', fontSize:13}}>
              <div style={{width:120}}>{r.name}</div>
              <div style={{flex:1, height:8, background:'var(--surface-2)', borderRadius:4, overflow:'hidden'}}>
                <div style={{width:`${r.v}%`, height:'100%', background:'linear-gradient(90deg, #0078D4, #22B8CF)'}}/>
              </div>
              <div style={{width:40, textAlign:'right', fontVariantNumeric:'tabular-nums', color:'var(--text-dim)'}}>{r.v}%</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { Analytics });
