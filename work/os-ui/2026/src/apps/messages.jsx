/* global React, CONVERSATIONS, Stroke */
const { useState } = React;

function Messages() {
  const [sel, setSel] = useState(CONVERSATIONS[0].id);
  const current = CONVERSATIONS.find(c => c.id === sel);

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="app-side-title">Mail</div>
        <a className="sel"><Stroke d="M3 6 H21 V19 H3 Z M3 6 L12 13 L21 6" /> Inbox <span style={{marginLeft:'auto', color:'var(--text-mute)', fontSize:11}}>2</span></a>
        <a><Stroke d="M3 12 L21 3 L14 21 L11 13 Z" /> Sent</a>
        <a><Stroke d="M3 3 H17 V21 L10 17 L3 21 Z" /> Starred</a>
        <a><Stroke d="M4 7 H20 M10 3 V7 M14 3 V7 M6 7 V21 H18 V7" /> Archive</a>
        <div className="app-side-title" style={{marginTop:18}}>Labels</div>
        <a><span style={{width:10,height:10,borderRadius:2,background:'#0078D4'}}/>Operations</a>
        <a><span style={{width:10,height:10,borderRadius:2,background:'#8B5CF6'}}/>Engineering</a>
        <a><span style={{width:10,height:10,borderRadius:2,background:'#1A9D4A'}}/>Billing</a>
      </aside>

      <div className="msg-shell" style={{flex:1}}>
        <div className="msg-list">
          {CONVERSATIONS.map(c => (
            <div key={c.id} className={`msg-item ${c.unread?'unread':''} ${sel===c.id?'sel':''}`} onClick={() => setSel(c.id)}>
              <div className="ava" style={{flexShrink:0}}>{c.from.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
              <div style={{flex:1, minWidth:0}}>
                <div className="msg-from"><span>{c.from}</span><span className="msg-time">{c.time}</span></div>
                <div style={{fontSize:12, fontWeight:500, marginTop:1}}>{c.subj}</div>
                <div className="msg-preview">{c.preview}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="msg-body">
          <div className="msg-body-header" style={{display:'flex', alignItems:'center', gap:12}}>
            <div className="ava md">{current.from.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16, fontWeight:600}}>{current.subj}</div>
              <div style={{fontSize:12, color:'var(--text-dim)', marginTop:2}}>{current.from} · {current.time} ago</div>
            </div>
            <button className="btn"><Stroke d="M4 4 L20 20 M4 20 L20 4"/></button>
            <button className="btn primary">Reply</button>
          </div>
          <div className="msg-body-content">
            {current.body.split('\n').map((line, i) => <p key={i} style={{margin:'0 0 12px'}}>{line}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Messages });
