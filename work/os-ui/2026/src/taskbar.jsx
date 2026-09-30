/* global React, APPS, AppIcon, IconStart, Stroke */
const {
  useState,
  useEffect,
  useRef
} = React;
function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const date = now.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return <div className="tb-clock">
      <span className="t-time">{time}</span>
      <span className="t-date">{date}</span>
    </div>;
}
function Taskbar({
  openApps,
  windows,
  activeId,
  onStartClick,
  startOpen,
  onOpenApp,
  onFocus,
  onMinimize,
  notifOpen,
  onNotifClick
}) {
  const workspace = useWorkspace();
  const pinned = APPS.filter(a => !a.hiddenOnDesktop);
  return <div className="taskbar">
      <div className="tb-center">
        <button className={`tb-btn tb-start-btn ${startOpen ? 'active' : ''}`} title="시작" onClick={onStartClick}>
          <span className="tb-icon"><IconStart /></span>
        </button>

        <button className="tb-btn" title="앱 검색" onClick={onStartClick}>
          <Stroke d="M11 11 A5 5 0 1 1 10.99 11 M15 15 L20 20" size={18} />
        </button>

        <div style={{
        width: 1,
        height: 20,
        background: 'var(--border-strong)',
        margin: '0 4px'
      }} />

        {pinned.map(a => {
        const wins = windows.filter(w => w.app === a.id);
        const hasOpen = wins.length > 0;
        const isActive = wins.some(w => w.id === activeId && !w.minimized);
        return <button key={a.id} className={`tb-btn ${isActive ? 'active' : hasOpen ? 'has-window' : ''}`} title={a.label} onClick={() => {
          if (!hasOpen) onOpenApp(a.id);else {
            const w = wins[wins.length - 1];
            if (w.id === activeId && !w.minimized) onMinimize(w.id);else onFocus(w.id);
          }
        }}>
              <span className="tb-icon"><AppIcon id={a.id} size={22} /></span>
            </button>;
      })}
      </div>

      <div className="tb-right">
        <div className="tb-sys" title="체험 환경">
          <Stroke d="M4 10 V18 M4 10 L8 6 L12 10 M16 14 V6 M16 14 L20 10 L16 14 L12 10" size={14} />
          <Stroke d="M2 9 Q12 3 22 9 M5 12 Q12 8 19 12 M8 15 Q12 13 16 15 M11 18 Q12 18 13 18" size={14} />
          <Stroke d="M3 8 H17 V16 H3 Z M17 10 H20 V14 H17 M6 11 H10" size={14} />
        </div>
        <Clock />
        <button className="tb-btn" title="알림" aria-label="알림" onClick={onNotifClick} style={{
        position: 'relative'
      }}>
          <Stroke d="M6 8 A6 6 0 0 1 18 8 V14 L20 17 H4 L6 14 Z M10 20 A2 2 0 0 0 14 20" size={18} />
          <span style={{
          position: 'absolute',
          top: 6,
          right: 7,
          minWidth: 14,
          height: 14,
          padding: '0 3px',
          borderRadius: 7,
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 9,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>{workspace.readNotices ? 0 : Math.min(workspace.events.length, 9)}</span>
        </button>
      </div>
    </div>;
}
function NotificationCenter({
  onClose,
  onOpen
}) {
  const w = useWorkspace();
  return <div className="notif-center" onClick={e => e.stopPropagation()}><div className="ops-heading"><h2>운영 알림</h2><button className="btn" onClick={() => w.setReadNotices(true)}>모두 읽음</button><button className="btn" onClick={onClose}>닫기</button></div><p className="ops-muted">{w.readNotices ? '모든 알림을 확인했어요.' : '최근 운영 기록을 확인해 주세요.'}</p>{w.events.slice(0, 6).map((e, i) => <button className="notif-item ops-notif" key={i} onClick={() => {
      w.setReadNotices(true);
      onOpen('dashboard');
      onClose();
    }}>{e}<small>대시보드에서 확인 →</small></button>)}</div>;
}
Object.assign(window, {
  Taskbar,
  NotificationCenter
});
