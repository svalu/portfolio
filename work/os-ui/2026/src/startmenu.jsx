/* global React, APPS, AppIcon, IconStart, Stroke */
const { useState, useRef, useEffect } = React;

function StartMenu({ layout, onOpen, onClose, accent }) {
  const [q, setQ] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('.tb-start-btn')) {
        onClose();
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => window.addEventListener('mousedown', onDown), 0);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const pinned = APPS.filter(a => !a.hiddenOnDesktop).concat([
    { id: 'settings', label: 'Settings' },
    { id: 'analytics', label: 'Reports' }, // alias-style tile
  ]).slice(0, 10);

  const filtered = q ? pinned.filter(a => a.label.toLowerCase().includes(q.toLowerCase())) : pinned;

  const recent = [
    { n: 'Q1-report.pdf',       t: 'Opened 2 min ago'  },
    { n: 'users-export.csv',    t: 'Opened 14 min ago' },
    { n: 'roadmap.md',          t: 'Opened 1 hr ago'   },
    { n: 'dashboard.fig',       t: 'Opened 3 hr ago'   },
  ];

  return (
    <div ref={menuRef} className="startmenu" onMouseDown={(e) => e.stopPropagation()}>
      <div className="sm-search">
        <Stroke d="M11 11 A5 5 0 1 1 10.99 11 M15 15 L20 20" size={14} />
        <input autoFocus placeholder="Search apps, files, settings…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="sm-section-label">
        <span>Pinned</span>
        <span className="all-link">All apps <Stroke d="M5 12 H19 M13 6 L19 12 L13 18" size={12}/></span>
      </div>
      <div className={`sm-pinned layout-${layout}`}>
        {filtered.map(a => (
          <div key={a.id + a.label} className="sm-app" onClick={() => { onOpen(a.id); onClose(); }}>
            <div className="sm-app-icon"><AppIcon id={a.id} size={32} /></div>
            <div className="sm-app-label">{a.label}</div>
          </div>
        ))}
      </div>

      <div className="sm-section-label">
        <span>Recommended</span>
        <span className="all-link">More <Stroke d="M5 12 H19 M13 6 L19 12 L13 18" size={12}/></span>
      </div>
      <div className="sm-recent">
        {recent.map(r => (
          <div key={r.n} className="sm-recent-item">
            <div className="sm-recent-thumb">{r.n.split('.').pop().toUpperCase().slice(0,3)}</div>
            <div className="sm-recent-meta">
              <div className="rn">{r.n}</div>
              <div className="rt">{r.t}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sm-footer">
        <div className="sm-user">
          <div className="sm-user-avatar">AM</div>
          <div>
            <div className="sm-user-name">Alex Morgan</div>
            <div style={{fontSize:11, color:'var(--text-mute)'}}>alex.morgan@acme.co</div>
          </div>
        </div>
        <button className="sm-power-btn" title="Sign out">
          <Stroke d="M12 3 V12 M6 6 A8 8 0 1 0 18 6" size={16}/>
        </button>
        <button className="sm-power-btn" title="Power">
          <Stroke d="M8 4 L8 12 M4 8 A8 8 0 1 0 20 8 A8 8 0 0 0 16 4 M8 12 H16" size={16}/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { StartMenu });
