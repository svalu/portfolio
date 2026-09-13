/* global React, ReactDOM, APPS, AppIcon, Window, Taskbar, StartMenu, NotificationCenter, TweaksPanel, useEditMode, Wallpaper, Dashboard, Users, Analytics, Files, Messages, Settings */

const { useState, useEffect, useRef, useMemo } = React;

const APP_COMPONENTS = {
  dashboard: Dashboard,
  users: Users,
  analytics: Analytics,
  files: Files,
  messages: Messages,
  settings: Settings,
};

const APP_TITLES = {
  dashboard: 'Dashboard',
  users: 'User Management',
  analytics: 'Analytics',
  files: 'File Manager',
  messages: 'Messages',
  settings: 'Settings',
};

const DEFAULT_BOX = (i) => ({ x: 60 + i * 40, y: 50 + i * 30, w: 1040, h: 680 });

function AdminOS() {
  const initial = (typeof window !== 'undefined' && window.__TWEAKS__) || {};
  const [tweaks, setTweaks] = useState({
    theme: 'bloom',
    iconStyle: 'fluent',
    windowStyle: 'mica',
    startMenuLayout: 'grid',
    accent: '#0078D4',
    ...initial,
  });
  const { setTweak } = useEditMode(tweaks, setTweaks);

  // Apply accent & theme to :root
  useEffect(() => {
    document.body.dataset.theme = tweaks.theme === 'bloom' ? '' : (tweaks.theme === 'dawn' || tweaks.theme === 'ocean' ? '' : tweaks.theme);
    document.documentElement.style.setProperty('--accent', tweaks.accent);
  }, [tweaks.theme, tweaks.accent]);

  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [zTop, setZTop] = useState(10);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [startOpen, setStartOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [ctx, setCtx] = useState(null); // context menu
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const wid = useRef(1);

  const openApp = (appId) => {
    // Allow multiple windows of same app, but focus existing if present (simple: always create new; restore if minimized)
    const existing = windows.find(w => w.app === appId);
    if (existing) {
      setActiveId(existing.id);
      setZTop(z => z + 1);
      setWindows(ws => ws.map(w => w.id === existing.id ? { ...w, minimized: false, z: zTop + 1 } : w));
      return;
    }
    const idx = windows.length;
    const id = `w${wid.current++}`;
    const newWin = {
      id, app: appId, title: APP_TITLES[appId] || appId,
      box: DEFAULT_BOX(idx),
      minimized: false, maximized: false, snap: null,
      z: zTop + 1,
    };
    setWindows(ws => [...ws, newWin]);
    setActiveId(id);
    setZTop(z => z + 1);
  };

  const closeWin     = (id) => { setWindows(ws => ws.filter(w => w.id !== id)); if (activeId === id) setActiveId(null); };
  const minimizeWin  = (id) => setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w));
  const maximizeWin  = (id, force) => setWindows(ws => ws.map(w => w.id === id ? { ...w, maximized: force === undefined ? !w.maximized : force, snap: null } : w));
  const snapWin      = (id, region) => setWindows(ws => ws.map(w => w.id === id ? { ...w, snap: region, maximized: false } : w));
  const focusWin     = (id) => { setActiveId(id); setZTop(z => z + 1); setWindows(ws => ws.map(w => w.id === id ? { ...w, z: zTop + 1, minimized: false } : w)); };

  // Double-click on desktop icon
  const handleIconDoubleClick = (appId) => openApp(appId);

  // Right-click context menu on desktop
  const onDesktopContext = (e) => {
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY, kind: 'desktop' });
  };
  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Keyboard: Esc to close start menu
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setStartOpen(false); setNotifOpen(false); }
      if (e.metaKey && e.key === 't') { e.preventDefault(); setTweaksOpen(v => !v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const desktopIcons = APPS.filter(a => !a.hiddenOnDesktop);

  return (
    <div
      className={`desktop icon-style-${tweaks.iconStyle}`}
      onContextMenu={onDesktopContext}
      onClick={() => { if (startOpen) setStartOpen(false); if (notifOpen) setNotifOpen(false); }}
    >
      <Wallpaper theme={tweaks.theme} accent={tweaks.accent} />

      <div className="desktop-icons" onClick={(e) => e.stopPropagation()}>
        {desktopIcons.map((a, i) => (
          <div
            key={a.id}
            className={`d-icon ${selectedIcon === a.id ? 'selected' : ''}`}
            onClick={(e) => { e.stopPropagation(); setSelectedIcon(a.id); }}
            onDoubleClick={() => handleIconDoubleClick(a.id)}
            title={`Double-click to open ${a.label}`}
          >
            <div className="icon-art"><AppIcon id={a.id} size={48} /></div>
            <div className="icon-label">{a.label}</div>
          </div>
        ))}
      </div>

      {windows.map(w => {
        const Comp = APP_COMPONENTS[w.app];
        return (
          <Window
            key={w.id} id={w.id} app={w.app}
            title={w.title}
            icon={<AppIcon id={w.app} size={14} />}
            initial={w.box}
            z={w.z}
            active={activeId === w.id}
            minimized={w.minimized}
            maximized={w.maximized}
            snapRegion={w.snap}
            onFocus={focusWin}
            onClose={closeWin}
            onMinimize={minimizeWin}
            onMaximize={maximizeWin}
            onSnap={snapWin}
            onDrag={() => {}}
            style={tweaks.windowStyle}
          >
            {Comp ? <Comp tweaks={tweaks} setTweak={setTweak} /> : <div style={{padding:24}}>App not found</div>}
          </Window>
        );
      })}

      {startOpen && (
        <StartMenu
          layout={tweaks.startMenuLayout}
          onOpen={openApp}
          onClose={() => setStartOpen(false)}
          accent={tweaks.accent}
        />
      )}

      {notifOpen && <NotificationCenter onClose={() => setNotifOpen(false)} />}

      <Taskbar
        openApps={windows.map(w => w.app)}
        windows={windows}
        activeId={activeId}
        startOpen={startOpen}
        onStartClick={() => { setStartOpen(v => !v); setNotifOpen(false); }}
        onOpenApp={openApp}
        onFocus={focusWin}
        onMinimize={minimizeWin}
        notifOpen={notifOpen}
        onNotifClick={() => { setNotifOpen(v => !v); setStartOpen(false); }}
      />

      {ctx && (
        <div className="ctx-menu" style={{ left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()}>
          <div className="ctx-item" onClick={() => { setTweaksOpen(true); setCtx(null); }}>Personalize…</div>
          <div className="ctx-item" onClick={() => setCtx(null)}>View</div>
          <div className="ctx-item" onClick={() => setCtx(null)}>Sort by</div>
          <div className="ctx-sep" />
          <div className="ctx-item" onClick={() => setCtx(null)}>Refresh</div>
          <div className="ctx-sep" />
          <div className="ctx-item" onClick={() => { openApp('settings'); setCtx(null); }}>Open Settings</div>
        </div>
      )}

      <TweaksPanel tweaks={tweaks} setTweak={setTweak} visible={tweaksOpen} onClose={() => setTweaksOpen(false)} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminOS />);
