/* global React, USERS, Stroke */
const { useState, useMemo } = React;

function initials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function Users() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const filtered = useMemo(() => USERS.filter(u =>
    (role === 'all' || u.role.toLowerCase() === role) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  ), [q, role]);

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="app-side-title">People</div>
        <a className="sel"><Stroke d="M16 11 A4 4 0 1 1 8 11 A4 4 0 1 1 16 11 M4 21 Q4 15 12 15 Q20 15 20 21" /> All users <span style={{marginLeft:'auto',color:'var(--text-mute)',fontSize:11}}>{USERS.length}</span></a>
        <a><Stroke d="M12 2 V22 M2 12 H22" /> Invitations <span style={{marginLeft:'auto',color:'var(--text-mute)',fontSize:11}}>3</span></a>
        <a><Stroke d="M4 6 H20 M4 12 H20 M4 18 H20" /> Roles & permissions</a>
        <a><Stroke d="M4 4 H20 V20 H4 Z M4 9 H20" /> Teams</a>
        <div className="app-side-title" style={{marginTop:18}}>Filters</div>
        {['all','admin','editor','viewer'].map(r =>
          <a key={r} className={role===r?'sel':''} onClick={()=>setRole(r)}>
            <span style={{width:8,height:8,borderRadius:8,background: r==='admin'?'#0078D4':r==='editor'?'#8B5CF6':r==='viewer'?'#22B8CF':'#8A8A8A'}}/>
            {r[0].toUpperCase()+r.slice(1)}
          </a>
        )}
      </aside>
      <main className="app-main">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
          <h1 className="app-h1">Users</h1>
          <div style={{display:'flex', gap:8}}>
            <button className="btn"><Stroke d="M12 4 V20 M4 12 H20" /> Export</button>
            <button className="btn primary"><Stroke d="M12 4 V20 M4 12 H20" /> Invite user</button>
          </div>
        </div>
        <p className="app-sub">{filtered.length} {filtered.length === 1 ? 'person' : 'people'} — including 3 pending invitations.</p>

        <div className="panel" style={{padding:0}}>
          <div style={{display:'flex', gap:8, padding:'12px 14px', borderBottom:'1px solid var(--border)'}}>
            <input className="inp" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} style={{flex:1}} />
            <button className="btn"><Stroke d="M4 6 H20 M8 12 H16 M10 18 H14" /> Filter</button>
          </div>
          <table className="t">
            <thead>
              <tr>
                <th style={{width: '38%'}}>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last active</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.email}>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div className="ava md" style={{background: stringGradient(u.name)}}>{initials(u.name)}</div>
                      <div>
                        <div style={{fontWeight:500}}>{u.name}</div>
                        <div style={{fontSize:11, color:'var(--text-mute)'}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.role}</td>
                  <td>
                    {u.status === 'active'   && <span className="badge ok"><span className="dot"/>Active</span>}
                    {u.status === 'pending'  && <span className="badge warn"><span className="dot"/>Pending</span>}
                    {u.status === 'inactive' && <span className="badge muted"><span className="dot"/>Inactive</span>}
                  </td>
                  <td style={{color:'var(--text-dim)'}}>{u.last}</td>
                  <td style={{color:'var(--text-dim)'}}>{u.joined}</td>
                  <td style={{textAlign:'right', color:'var(--text-mute)'}}>···</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function stringGradient(s) {
  const hues = [[260,300],[210,260],[160,200],[20,60],[320,360],[120,160]];
  let k = 0; for (let i = 0; i < s.length; i++) k = (k * 31 + s.charCodeAt(i)) >>> 0;
  const [a, b] = hues[k % hues.length];
  return `linear-gradient(135deg, hsl(${a} 70% 55%), hsl(${b} 70% 48%))`;
}

Object.assign(window, { Users });
