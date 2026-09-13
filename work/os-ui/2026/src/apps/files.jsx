/* global React, FILES, FileGlyph, Stroke */
const { useState } = React;

function Files() {
  const [sel, setSel] = useState(null);
  const [view, setView] = useState('grid');
  const [path] = useState(['Home', 'Workspace', 'Shared']);

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="app-side-title">Places</div>
        <a className="sel"><Stroke d="M3 10 L12 3 L21 10 V20 H15 V13 H9 V20 H3 Z" /> Home</a>
        <a><Stroke d="M3 6 H21 V19 H3 Z M3 6 L12 13 L21 6" /> Shared with me</a>
        <a><Stroke d="M12 2 V22 M2 12 H22" /> Recent</a>
        <a><Stroke d="M5 5 L5 19 L19 19 M5 5 L19 5 V19" /> Starred</a>
        <a><Stroke d="M4 7 H20 M10 3 V7 M14 3 V7 M6 7 V21 H18 V7 M10 11 V17 M14 11 V17" /> Trash</a>
        <div className="app-side-title" style={{marginTop:18}}>Storage</div>
        <div style={{padding:'4px 12px'}}>
          <div style={{height:6, background:'var(--surface-2)', borderRadius:4, overflow:'hidden'}}>
            <div style={{width:'62%', height:'100%', background:'linear-gradient(90deg, var(--accent), var(--accent-2))'}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-dim)', marginTop:6}}>
            <span>62 GB used</span><span>100 GB</span>
          </div>
        </div>
      </aside>
      <main className="app-main">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
          <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13}}>
            {path.map((p, i) => (
              <React.Fragment key={p}>
                <span style={{color: i === path.length-1 ? 'var(--text)' : 'var(--text-dim)', fontWeight: i === path.length-1 ? 500 : 400}}>{p}</span>
                {i < path.length - 1 && <span style={{color:'var(--text-mute)'}}>›</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{display:'flex', gap:6}}>
            <button className={`btn ${view==='grid'?'primary':''}`} onClick={()=>setView('grid')} style={{padding:'0 10px'}}><Stroke d="M3 3 H10 V10 H3 Z M14 3 H21 V10 H14 Z M3 14 H10 V21 H3 Z M14 14 H21 V21 H14 Z"/></button>
            <button className={`btn ${view==='list'?'primary':''}`} onClick={()=>setView('list')} style={{padding:'0 10px'}}><Stroke d="M4 6 H20 M4 12 H20 M4 18 H20"/></button>
            <button className="btn"><Stroke d="M12 4 V20 M4 12 H20"/> Upload</button>
            <button className="btn primary"><Stroke d="M12 4 V20 M4 12 H20"/> New folder</button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="file-grid">
            {FILES.map(f => (
              <div key={f.name} className={`file-tile ${sel===f.name?'sel':''}`} onClick={() => setSel(f.name)}>
                <div className="file-art"><FileGlyph kind={f.kind} /></div>
                <div className="file-name">{f.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel" style={{padding:0}}>
            <table className="t">
              <thead><tr><th style={{width:'50%'}}>Name</th><th>Size</th><th>Modified</th></tr></thead>
              <tbody>
                {FILES.map(f => (
                  <tr key={f.name} onClick={()=>setSel(f.name)} style={{cursor:'pointer', background: sel===f.name?'rgba(0,120,212,0.08)':undefined}}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div style={{width:24, height:30}}><FileGlyph kind={f.kind} /></div>
                        {f.name}
                      </div>
                    </td>
                    <td style={{color:'var(--text-dim)'}}>{f.size}</td>
                    <td style={{color:'var(--text-dim)'}}>{f.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

Object.assign(window, { Files });
