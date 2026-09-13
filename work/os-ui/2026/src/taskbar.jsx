/* global React, APPS, AppIcon, IconStart, Stroke, NOTIFICATIONS */
const { useState, useEffect, useRef } = React;

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="tb-clock">
      <span className="t-time">{time}</span>
      <span className="t-date">{date}</span>
    </div>
  );
}

function Taskbar({ openApps, windows, activeId, onStartClick, startOpen, onOpenApp, onFocus, onMinimize, notifOpen, onNotifClick }) {
  const pinned = APPS.filter(a => !a.hiddenOnDesktop);

  return (
    <div className="taskbar">
      <div className="tb-center">
        <button className={`tb-btn tb-start-btn ${startOpen ? 'active' : ''}`} title="Start" onClick={onStartClick}>
          <span className="tb-icon"><IconStart /></span>
        </button>

        <button className="tb-btn" title="Search">
          <Stroke d="M11 11 A5 5 0 1 1 10.99 11 M15 15 L20 20" size={18}/>
        </button>

        <div style={{width:1, height:20, background:'var(--border-strong)', margin:'0 4px'}}/>

        {pinned.map(a => {
          const wins = windows.filter(w => w.app === a.id);
          const hasOpen = wins.length > 0;
          const isActive = wins.some(w => w.id === activeId && !w.minimized);
          return (
            <button
              key={a.id}
              className={`tb-btn ${isActive ? 'active' : (hasOpen ? 'has-window' : '')}`}
              title={a.label}
              onClick={() => {
                if (!hasOpen) onOpenApp(a.id);
                else {
                  const w = wins[wins.length - 1];
                  if (w.id === activeId && !w.minimized) onMinimize(w.id);
                  else onFocus(w.id);
                }
              }}
            >
              <span className="tb-icon"><AppIcon id={a.id} size={22} /></span>
            </button>
          );
        })}
      </div>

      <div className="tb-right">
        <div className="tb-sys" title="System">
          <Stroke d="M4 10 V18 M4 10 L8 6 L12 10 M16 14 V6 M16 14 L20 10 L16 14 L12 10" size={14}/>
          <Stroke d="M2 9 Q12 3 22 9 M5 12 Q12 8 19 12 M8 15 Q12 13 16 15 M11 18 Q12 18 13 18" size={14}/>
          <Stroke d="M3 8 H17 V16 H3 Z M17 10 H20 V14 H17 M6 11 H10" size={14}/>
        </div>
        <Clock />
        <button className="tb-btn" title="Notifications" onClick={onNotifClick} style={{position:'relative'}}>
          <Stroke d="M6 8 A6 6 0 0 1 18 8 V14 L20 17 H4 L6 14 Z M10 20 A2 2 0 0 0 14 20" size={18}/>
          <span style={{position:'absolute', top:6, right:7, minWidth:14, height:14, padding:'0 3px', borderRadius:7, background:'var(--accent)', color:'#fff', fontSize:9, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center'}}>{NOTIFICATIONS.length}</span>
        </button>
      </div>
    </div>
  );
}

function NotificationCenter({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target) && !e.target.closest('[title="Notifications"]')) onClose(); };
    setTimeout(() => window.addEventListener('mousedown', onDown), 0);
    return () => window.removeEventListener('mousedown', onDown);
  }, [onClose]);
  return (
    <div ref={ref} className="notif-center" onMouseDown={(e) => e.stopPropagation()}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div style={{fontSize:14, fontWeight:600}}>Notifications</div>
        <div style={{fontSize:11, color:'var(--text-dim)', cursor:'pointer'}}>Clear all</div>
      </div>
      {NOTIFICATIONS.map((n, i) => (
        <div className="notif-item" key={i}>
          <div className="n-app">{n.app} · {n.time}</div>
          <div className="n-title">{n.title}</div>
          <div style={{color:'var(--text-dim)'}}>{n.body}</div>
        </div>
      ))}
      <div style={{marginTop:14, fontSize:12, color:'var(--text-dim)', padding:'10px 2px 0', borderTop:'1px solid var(--border)'}}>
        Focus assist: off · Notifications will resume in the morning.
      </div>
    </div>
  );
}

Object.assign(window, { Taskbar, NotificationCenter });
