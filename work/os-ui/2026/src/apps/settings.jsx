/* global React, Stroke */

function Settings({ tweaks, setTweak }) {
  const section = (title, children) => (
    <div className="panel">
      <div className="panel-h"><h3>{title}</h3></div>
      {children}
    </div>
  );
  const Row = ({ label, children }) => (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
      <div style={{fontSize:13}}>{label}</div>
      <div>{children}</div>
    </div>
  );
  const Toggle = ({ on, onChange }) => (
    <button onClick={onChange} style={{
      width:36, height:20, borderRadius:10, border:0, cursor:'pointer', position:'relative',
      background: on ? 'var(--accent)' : 'var(--surface-2)',
      transition: 'background 0.15s'
    }}>
      <span style={{position:'absolute', top:2, left: on ? 18 : 2, width:16, height:16, borderRadius:8, background:'#fff', transition:'left 0.15s', boxShadow:'0 1px 2px rgba(0,0,0,0.25)'}}/>
    </button>
  );

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="app-side-title">Settings</div>
        <a className="sel"><Stroke d="M12 2 L15 5 L20 5 L20 10 L23 12 L20 14 L20 19 L15 19 L12 22 L9 19 L4 19 L4 14 L1 12 L4 10 L4 5 L9 5 Z M12 8 A4 4 0 1 1 11.99 8" /> Personalization</a>
        <a><Stroke d="M12 2 A10 10 0 1 1 11.99 2 M12 6 V12 L16 14" /> System</a>
        <a><Stroke d="M16 11 A4 4 0 1 1 8 11 A4 4 0 1 1 16 11 M4 21 Q4 15 12 15 Q20 15 20 21" /> Account</a>
        <a><Stroke d="M4 7 V5 A8 8 0 0 1 20 5 V7 M4 7 H20 V21 H4 Z M12 12 V16" /> Privacy</a>
        <a><Stroke d="M4 4 H20 V20 H4 Z M4 9 H20" /> About</a>
      </aside>
      <main className="app-main">
        <h1 className="app-h1">Personalization</h1>
        <p className="app-sub">Change the look and feel of your workspace.</p>

        {section('Appearance',
          <>
            <Row label="Theme">
              <div style={{display:'flex', gap:6}}>
                {['bloom','midnight','graphite','dawn','ocean'].map(t => (
                  <button key={t} className={`btn ${tweaks.theme===t?'primary':''}`} onClick={()=>setTweak('theme', t)}>{t[0].toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
            </Row>
            <Row label="Accent color">
              <div style={{display:'flex', gap:6}}>
                {['#0078D4','#8B5CF6','#1A9D4A','#E44A4A','#F7B32B','#22B8CF'].map(c => (
                  <button key={c} onClick={()=>setTweak('accent', c)} style={{
                    width:24, height:24, borderRadius:'50%', background:c, cursor:'pointer',
                    border: tweaks.accent===c ? '2px solid var(--text)' : '2px solid transparent',
                    outline: tweaks.accent===c ? '2px solid var(--accent)' : 'none',
                    padding:0,
                  }}/>
                ))}
              </div>
            </Row>
            <Row label="Window style">
              <div style={{display:'flex', gap:6}}>
                {['mica','solid','glass'].map(s => (
                  <button key={s} className={`btn ${tweaks.windowStyle===s?'primary':''}`} onClick={()=>setTweak('windowStyle', s)}>{s[0].toUpperCase()+s.slice(1)}</button>
                ))}
              </div>
            </Row>
            <Row label="Start menu layout">
              <div style={{display:'flex', gap:6}}>
                {['grid','list'].map(s => (
                  <button key={s} className={`btn ${tweaks.startMenuLayout===s?'primary':''}`} onClick={()=>setTweak('startMenuLayout', s)}>{s[0].toUpperCase()+s.slice(1)}</button>
                ))}
              </div>
            </Row>
          </>
        )}

        {section('System',
          <>
            <Row label="Animations"><Toggle on onChange={()=>{}}/></Row>
            <Row label="Transparency effects"><Toggle on onChange={()=>{}}/></Row>
            <Row label="Desktop icons"><Toggle on onChange={()=>{}}/></Row>
            <Row label="Snap windows when dragged to edge"><Toggle on onChange={()=>{}}/></Row>
          </>
        )}

        {section('About',
          <div style={{fontSize:13, color:'var(--text-dim)', lineHeight:1.7}}>
            <div>Admin OS · Build 2026.04.20</div>
            <div>Internal dashboard shell</div>
            <div style={{marginTop:8, color:'var(--text-mute)', fontSize:11}}>Theme rendered with Three.js · React 18.3.1</div>
          </div>
        )}
      </main>
    </div>
  );
}

Object.assign(window, { Settings });
