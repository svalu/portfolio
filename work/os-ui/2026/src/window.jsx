/* global React, AppIcon */
// Draggable, resizable, snappable window container

const { useRef, useEffect, useState } = React;

const SNAP_EDGE = 12;   // px from edge to trigger snap
const MIN_W = 360, MIN_H = 260;

function Window({
  id, app, title, children, icon,
  initial, z, active, minimized, maximized, snapRegion,
  onFocus, onClose, onMinimize, onMaximize, onSnap, onDrag,
  style = 'mica',
}) {
  const winRef = useRef(null);
  const [box, setBox] = useState(initial);
  const [snapPreview, setSnapPreview] = useState(null);
  const [opening, setOpening] = useState(true);

  useEffect(() => { const t = setTimeout(() => setOpening(false), 260); return () => clearTimeout(t); }, []);

  // When maximized or snapped, derive displayed box from parent
  const displayedBox = (() => {
    const parent = typeof window !== 'undefined' ? { w: window.innerWidth, h: window.innerHeight - 48 } : { w: 1600, h: 900 };
    if (maximized) return { x: 0, y: 0, w: parent.w, h: parent.h };
    if (snapRegion === 'left')  return { x: 0, y: 0, w: Math.floor(parent.w / 2), h: parent.h };
    if (snapRegion === 'right') return { x: Math.floor(parent.w / 2), y: 0, w: Math.ceil(parent.w / 2), h: parent.h };
    if (snapRegion === 'top')   return { x: 0, y: 0, w: parent.w, h: Math.floor(parent.h / 2) };
    return box;
  })();

  // ---------- Drag ----------
  const dragStart = useRef(null);
  const onTitleMouseDown = (e) => {
    if (e.target.closest('.win-controls')) return;
    onFocus(id);
    if (maximized || snapRegion) {
      // un-maximize and jump under cursor
      const unmaxW = box.w, unmaxH = box.h;
      onMaximize(id, false);
      onSnap(id, null);
      setBox((b) => ({ ...b, x: e.clientX - unmaxW / 2, y: e.clientY - 16 }));
      dragStart.current = { mx: e.clientX, my: e.clientY, bx: e.clientX - unmaxW / 2, by: e.clientY - 16, bw: unmaxW };
    } else {
      dragStart.current = { mx: e.clientX, my: e.clientY, bx: box.x, by: box.y, bw: box.w };
    }
    window.addEventListener('mousemove', onDrag_);
    window.addEventListener('mouseup', onDragEnd_);
  };
  const onDrag_ = (e) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    const vw = window.innerWidth;
    const vh = window.innerHeight - 48;
    const bw = dragStart.current.bw || 400;
    const MARGIN = 120; // titlebar 최소 노출 픽셀
    const rawX = dragStart.current.bx + dx;
    const rawY = dragStart.current.by + dy;
    const x = Math.max(MARGIN - bw, Math.min(vw - MARGIN, rawX));
    const y = Math.max(0, Math.min(vh - 32, rawY));
    setBox((b) => ({ ...b, x, y }));

    // Snap preview
    let p = null;
    if (e.clientX < SNAP_EDGE) p = 'left';
    else if (e.clientX > window.innerWidth - SNAP_EDGE) p = 'right';
    else if (e.clientY < SNAP_EDGE) p = 'top';
    setSnapPreview(p);
  };
  const onDragEnd_ = () => {
    window.removeEventListener('mousemove', onDrag_);
    window.removeEventListener('mouseup', onDragEnd_);
    if (snapPreview) {
      onSnap(id, snapPreview);
      setSnapPreview(null);
    }
    dragStart.current = null;
  };

  // ---------- Resize ----------
  const onResizeStart = (dir) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(id);
    const start = { mx: e.clientX, my: e.clientY, ...box };
    const onMove = (ev) => {
      let { x, y, w, h } = start;
      const dx = ev.clientX - start.mx;
      const dy = ev.clientY - start.my;
      if (dir.includes('e')) w = Math.max(MIN_W, start.w + dx);
      if (dir.includes('s')) h = Math.max(MIN_H, start.h + dy);
      if (dir.includes('w')) { w = Math.max(MIN_W, start.w - dx); x = start.x + (start.w - w); }
      if (dir.includes('n')) { h = Math.max(MIN_H, start.h - dy); y = Math.max(0, start.y + (start.h - h)); }
      setBox({ x, y, w, h });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onDouble = () => onMaximize(id);

  const cls = ['win'];
  if (opening) cls.push('anim-open');
  if (!active) cls.push('inactive');
  if (minimized) cls.push('minimized');
  if (maximized) cls.push('maximized');
  if (style === 'solid') cls.push('win-style-solid');
  if (style === 'glass') cls.push('win-style-glass');

  return (
    <>
      <div
        ref={winRef}
        className={cls.join(' ')}
        style={{
          left: displayedBox.x, top: displayedBox.y,
          width: displayedBox.w, height: displayedBox.h,
          zIndex: z,
        }}
        onMouseDown={() => onFocus(id)}
      >
        <div className="win-titlebar" onMouseDown={onTitleMouseDown} onDoubleClick={onDouble}>
          <div className="win-title">
            {icon && <span className="title-icon">{icon}</span>}
            {title}
          </div>
          <div className="win-controls">
            <button onClick={(e) => { e.stopPropagation(); onMinimize(id); }} title="Minimize">
              <svg viewBox="0 0 10 10"><path d="M1 5 L9 5" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onMaximize(id); }} title="Maximize">
              {maximized
                ? <svg viewBox="0 0 10 10"><path d="M2.5 0.5 H8.5 V6.5 M0.5 2.5 H6.5 V8.5 H0.5 Z" /></svg>
                : <svg viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" /></svg>}
            </button>
            <button className="close" onClick={(e) => { e.stopPropagation(); onClose(id); }} title="Close">
              <svg viewBox="0 0 10 10"><path d="M0.5 0.5 L9.5 9.5 M9.5 0.5 L0.5 9.5" /></svg>
            </button>
          </div>
        </div>
        <div className="win-body">{children}</div>

        {!maximized && !snapRegion && (
          <>
            <div className="resize-h rh-n"  onMouseDown={onResizeStart('n')}  />
            <div className="resize-h rh-s"  onMouseDown={onResizeStart('s')}  />
            <div className="resize-h rh-w"  onMouseDown={onResizeStart('w')}  />
            <div className="resize-h rh-e"  onMouseDown={onResizeStart('e')}  />
            <div className="resize-h rh-nw" onMouseDown={onResizeStart('nw')} />
            <div className="resize-h rh-ne" onMouseDown={onResizeStart('ne')} />
            <div className="resize-h rh-sw" onMouseDown={onResizeStart('sw')} />
            <div className="resize-h rh-se" onMouseDown={onResizeStart('se')} />
          </>
        )}
      </div>

      {snapPreview && (() => {
        const parent = { w: window.innerWidth, h: window.innerHeight - 48 };
        let rect = { left: 0, top: 0, width: parent.w / 2, height: parent.h };
        if (snapPreview === 'right') rect = { left: parent.w / 2, top: 0, width: parent.w / 2, height: parent.h };
        if (snapPreview === 'top')   rect = { left: 0, top: 0, width: parent.w, height: parent.h / 2 };
        return <div className="snap-preview" style={rect} />;
      })()}
    </>
  );
}

Object.assign(window, { Window });
