/* global React, ReactDOM, APPS, AppIcon, Window, Taskbar, StartMenu, NotificationCenter, TweaksPanel, useEditMode, Wallpaper, Dashboard, Users, Analytics, Files, Messages, Settings */

const {
  useState,
  useEffect,
  useRef,
  useMemo
} = React;
const APP_COMPONENTS = {
  dashboard: Dashboard,
  users: Users,
  analytics: Analytics,
  files: Files,
  messages: Messages,
  settings: Settings
};
const APP_TITLES = {
  dashboard: '대시보드',
  users: '사용자 관리',
  analytics: '상담 분석',
  files: '자료실',
  messages: '메시지',
  settings: '설정'
};
const DEFAULT_BOX = i => ({
  x: Math.max(140, (innerWidth - 1040) / 2) + i * 24,
  y: 50 + i * 30,
  w: 1040,
  h: 680
});
function AdminOS() {
  const initial = typeof window !== 'undefined' && window.__TWEAKS__ || {};
  const [tweaks, setTweaks] = useState({
    theme: 'bloom',
    iconStyle: 'fluent',
    windowStyle: 'mica',
    startMenuLayout: 'grid',
    accent: '#0078D4',
    ...initial
  });
  const {
    setTweak
  } = useEditMode(tweaks, setTweaks);

  // Apply accent & theme to :root
  useEffect(() => {
    document.body.dataset.theme = tweaks.theme === 'bloom' ? '' : tweaks.theme === 'dawn' || tweaks.theme === 'ocean' ? '' : tweaks.theme;
    document.documentElement.style.setProperty('--accent', tweaks.accent);
  }, [tweaks.theme, tweaks.accent]);
  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [zTop, setZTop] = useState(10);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [startOpen, setStartOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [ctx, setCtx] = useState(null); // context menu

  const wid = useRef(1);
  const openApp = appId => {
    // Allow multiple windows of same app, but focus existing if present (simple: always create new; restore if minimized)
    const existing = windows.find(w => w.app === appId);
    if (existing) {
      setActiveId(existing.id);
      setZTop(z => z + 1);
      setWindows(ws => ws.map(w => w.id === existing.id ? {
        ...w,
        minimized: false,
        z: zTop + 1
      } : w));
      return;
    }
    const idx = windows.length;
    const id = `w${wid.current++}`;
    const newWin = {
      id,
      app: appId,
      title: APP_TITLES[appId] || appId,
      box: DEFAULT_BOX(idx),
      minimized: false,
      maximized: false,
      snap: null,
      z: zTop + 1
    };
    setWindows(ws => [...ws, newWin]);
    setActiveId(id);
    setZTop(z => z + 1);
  };
  const closeWin = id => {
    setWindows(ws => ws.filter(w => w.id !== id));
    if (activeId === id) setActiveId(null);
  };
  const minimizeWin = id => setWindows(ws => ws.map(w => w.id === id ? {
    ...w,
    minimized: !w.minimized
  } : w));
  const maximizeWin = (id, force) => setWindows(ws => ws.map(w => w.id === id ? {
    ...w,
    maximized: force === undefined ? !w.maximized : force,
    snap: null
  } : w));
  const snapWin = (id, region) => setWindows(ws => ws.map(w => w.id === id ? {
    ...w,
    snap: region,
    maximized: false
  } : w));
  const focusWin = id => {
    setActiveId(id);
    setZTop(z => z + 1);
    setWindows(ws => ws.map(w => w.id === id ? {
      ...w,
      z: zTop + 1,
      minimized: false
    } : w));
  };

  // Right-click context menu on desktop
  const onDesktopContext = e => {
    if (e.target.closest('.win,.startmenu,.taskbar')) return;
    e.preventDefault();
    setCtx({
      x: e.clientX,
      y: e.clientY,
      kind: 'desktop'
    });
  };
  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Keyboard: Esc to close start menu
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        setStartOpen(false);
        setNotifOpen(false);
      }
      if (e.metaKey && e.key === 't') {
        e.preventDefault();
        openApp('settings');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [windows, zTop]);
  const desktopIcons = APPS.filter(a => !a.hiddenOnDesktop);
  useEffect(() => {
    const p = window.PortfolioPreview;
    if (!p) return;
    p.register({ stage: 'admin', async run(action, signal) {
      if (action === 'arrival') { p.focus(document.querySelector('.desktop-icons')); return; }
      if (action === 'dashboard' || action === 'analytics') {
        openApp(action);
        const host = await p.wait(() => document.querySelector(`.win[data-app="${action}"]`), signal);
        if (action === 'analytics' && innerWidth >= 1100) {
          const d = windows.find(w => w.app === 'dashboard');
          if (d) snapWin(d.id, 'left');
          // The new window's id is committed in React after this action starts.
          host.dispatchEvent(new CustomEvent('preview-snap', { detail: 'right' }));
        }
        p.focus(host); return;
      }
      const analytics = windows.find(w => w.app === 'analytics');
      if (!analytics) throw new Error('Analysis window not ready');
      if (action === 'minimize') {
        minimizeWin(analytics.id);
        await p.wait(() => document.querySelector('.win[data-app="analytics"].minimized'), signal);
        p.focus(document.querySelector('.taskbar')); return;
      }
      if (action === 'restore') {
        focusWin(analytics.id);
        const host = await p.wait(() => document.querySelector('.win[data-app="analytics"]:not(.minimized)'), signal);
        p.focus(host); return;
      }
      throw new Error('Unknown admin scene');
    } });
  }, [windows, zTop]);
  return <div className={`desktop icon-style-${tweaks.iconStyle}`} onContextMenu={onDesktopContext} onClick={() => {
    if (startOpen) setStartOpen(false);
    if (notifOpen) setNotifOpen(false);
  }}>
      <Wallpaper theme={tweaks.theme} accent={tweaks.accent} />

      <div className="desktop-icons" onClick={e => e.stopPropagation()}>
        {desktopIcons.map((a, i) => <div key={a.id} className={`d-icon ${selectedIcon === a.id ? 'selected' : ''}`} onClick={e => {
        e.stopPropagation();
        setSelectedIcon(a.id);
        openApp(a.id);
      }} role="button" tabIndex={0} onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openApp(a.id);
        }
      }} title={`${a.label} 열기`}>
            <div className="icon-art"><AppIcon id={a.id} size={48} /></div>
            <div className="icon-label">{a.label}</div>
          </div>)}
      </div>

      {windows.map(w => {
      const Comp = APP_COMPONENTS[w.app];
      return <Window key={w.id} id={w.id} app={w.app} title={w.title} icon={<AppIcon id={w.app} size={14} />} initial={w.box} z={w.z} active={activeId === w.id} minimized={w.minimized} maximized={w.maximized} snapRegion={w.snap} onFocus={focusWin} onClose={closeWin} onMinimize={minimizeWin} onMaximize={maximizeWin} onSnap={snapWin} onDrag={() => {}} style={tweaks.windowStyle}>
            {Comp ? <Comp onOpen={openApp} tweaks={tweaks} setTweak={setTweak} /> : <div style={{
          padding: 24
        }}>앱을 찾을 수 없어요</div>}
          </Window>;
    })}

      <MotionPresence open={startOpen}><StartMenu layout={tweaks.startMenuLayout} onOpen={openApp} onClose={() => setStartOpen(false)} accent={tweaks.accent} /></MotionPresence>

      <MotionPresence open={notifOpen}><NotificationCenter onOpen={openApp} onClose={() => setNotifOpen(false)} /></MotionPresence>

      <Taskbar openApps={windows.map(w => w.app)} windows={windows} activeId={activeId} startOpen={startOpen} onStartClick={() => {
      setStartOpen(v => !v);
      setNotifOpen(false);
    }} onOpenApp={openApp} onFocus={focusWin} onMinimize={minimizeWin} notifOpen={notifOpen} onNotifClick={() => {
      setNotifOpen(v => !v);
      setStartOpen(false);
    }} />

      {ctx && <div className="ctx-menu" style={{
      left: Math.min(ctx.x, innerWidth - 210),
      top: Math.min(ctx.y, innerHeight - 130)
    }} onClick={e => e.stopPropagation()}><button className="ops-nav" onClick={() => {
        openApp('settings');
        setCtx(null);
      }}>화면 설정</button><button className="ops-nav" onClick={() => {
        setWindows(ws => ws.map(w => ({
          ...w,
          minimized: true
        })));
        setCtx(null);
      }}>모든 창 최소화</button></div>}

    </div>;
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<WorkspaceProvider><AdminOS /></WorkspaceProvider>);
