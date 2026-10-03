/* global React, AppIcon */
// Draggable, resizable, snappable window container

const {
  useRef,
  useEffect,
  useState
} = React;
const SNAP_EDGE = 12; // px from edge to trigger snap
const MIN_W = 360,
  MIN_H = 260;
function Window({
  id,
  app,
  title,
  children,
  icon,
  initial,
  z,
  active,
  minimized,
  maximized,
  snapRegion,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onSnap,
  onDrag,
  style = 'mica'
}) {
  const winRef = useRef(null);
  useEffect(() => {
    const node = winRef.current;
    const snapPreview = event => onSnap(id, event.detail);
    node?.addEventListener('preview-snap', snapPreview);
    return () => node?.removeEventListener('preview-snap', snapPreview);
  }, [id, onSnap]);
  const [closing,setClosing]=useState(false);
  const [geometryMotion,setGeometryMotion]=useState(false);
  const closeTimer=useRef(null),geometryTimer=useRef(null);
  useEffect(()=>()=>{clearTimeout(closeTimer.current);clearTimeout(geometryTimer.current);},[]);
  const requestClose=()=>{
    if(closeTimer.current)return;
    setClosing(true);
    closeTimer.current=setTimeout(()=>onClose(id),matchMedia('(prefers-reduced-motion: reduce)').matches?0:160);
  };
  const animateGeometry=()=>{
    clearTimeout(geometryTimer.current);
    setGeometryMotion(true);
    geometryTimer.current=setTimeout(()=>setGeometryMotion(false),240);
  };

  const [box, setBox] = useState(initial);
  const [viewport, setViewport] = useState({
    w: innerWidth,
    h: innerHeight - 48
  });
  useEffect(() => {
    const resize = () => setViewport({
      w: innerWidth,
      h: innerHeight - 48
    });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const snapRef = useRef(null);
  const [snapPreview, setSnapPreview] = useState(null);
  const [opening, setOpening] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOpening(false), 260);
    return () => clearTimeout(t);
  }, []);

  // When maximized or snapped, derive displayed box from parent
  const displayedBox = (() => {
    const parent = viewport;
    if (maximized || parent.w < 640) return {
      x: 0,
      y: 0,
      w: parent.w,
      h: parent.h
    };
    if (snapRegion === 'left') return {
      x: 0,
      y: 0,
      w: Math.floor(parent.w / 2),
      h: parent.h
    };
    if (snapRegion === 'right') return {
      x: Math.floor(parent.w / 2),
      y: 0,
      w: Math.ceil(parent.w / 2),
      h: parent.h
    };
    if (snapRegion === 'top') return {
      x: 0,
      y: 0,
      w: parent.w,
      h: Math.floor(parent.h / 2)
    };
    const w = Math.min(box.w, parent.w),
      h = Math.min(box.h, parent.h);
    return {
      ...box,
      w,
      h,
      x: Math.max(120-w, Math.min(box.x, parent.w-120)),
      y: Math.max(0, Math.min(box.y, parent.h-32))
    };
  })();

  // Read the rendered geometry at gesture start so clamped/snapped windows do not jump.
  const interaction = useRef(null);
  interaction.current = {displayedBox,box,viewport,maximized,snapRegion,onFocus,onMaximize,onSnap,animateGeometry};
  useEffect(() => {
    const host = winRef.current;
    const cleanups = [];
    cleanups.push(PortfolioDrag.bind(host.querySelector('.win-titlebar'), {
      exclude: '.win-controls,button',
      start(event) {
        const state=interaction.current;
        if(state.viewport.w<640)return false;
        setGeometryMotion(false);state.onFocus(id);
        let start={...state.displayedBox};
        if(state.maximized || state.snapRegion) {
          const ratio=(event.clientX-start.x)/start.w;
          start={x:event.clientX-Math.min(state.box.w,state.viewport.w)*ratio,y:event.clientY-16,w:Math.min(state.box.w,state.viewport.w),h:Math.min(state.box.h,state.viewport.h)};
          start.restore=true;
        }
        return start;
      },
      move(start,dx,dy,event) {
        if(start.restore){
          interaction.current.onMaximize(id,false);interaction.current.onSnap(id,null);start.restore=false;
        }
        const x=Math.max(120-start.w,Math.min(innerWidth-120,start.x+dx));
        const y=Math.max(0,Math.min(innerHeight-80,start.y+dy));
        setBox({x,y,w:start.w,h:start.h});
        const snap=event.clientX<SNAP_EDGE?'left':event.clientX>innerWidth-SNAP_EDGE?'right':event.clientY<SNAP_EDGE?'top':null;
        snapRef.current=snap;setSnapPreview(snap);
      },
      end(start,moved,cancelled) {
        if(moved&&!cancelled&&snapRef.current){interaction.current.animateGeometry();interaction.current.onSnap(id,snapRef.current);}
        snapRef.current=null;setSnapPreview(null);
      }
    }));
    host.querySelectorAll('.resize-h').forEach(handle=>cleanups.push(PortfolioDrag.bind(handle,{
      start() {setGeometryMotion(false);interaction.current.onFocus(id);return {...interaction.current.displayedBox};},
      move(start,dx,dy) {
        const dir=handle.dataset.direction;
        let {x,y,w,h}=start;
        if(dir.includes('e'))w=Math.max(MIN_W,start.w+dx);
        if(dir.includes('s'))h=Math.max(MIN_H,start.h+dy);
        if(dir.includes('w')){w=Math.max(MIN_W,start.w-dx);x=start.x+start.w-w;}
        if(dir.includes('n')){h=Math.max(MIN_H,start.h-dy);y=start.y+start.h-h;}
        setBox({x,y,w,h});
      }
    })));
    return ()=>cleanups.forEach(cleanup=>cleanup());
  },[id]);
  const onDouble = () => { animateGeometry(); onMaximize(id); };
  const cls = ['win'];
  if (opening && !closing && !minimized) cls.push('anim-open');
  if (closing) cls.push('anim-close');
  if (geometryMotion) cls.push('geometry-motion');
  if (!active) cls.push('inactive');
  if (minimized) cls.push('minimized');
  if (maximized) cls.push('maximized');
  if (style === 'solid') cls.push('win-style-solid');
  if (style === 'glass') cls.push('win-style-glass');
  return <>
      <div ref={winRef} data-app={app} className={cls.join(' ')} inert={minimized || closing ? '' : undefined} aria-hidden={minimized || closing ? true : undefined} style={{
      left: displayedBox.x,
      top: displayedBox.y,
      width: displayedBox.w,
      height: displayedBox.h,
      zIndex: z
    }} onPointerDown={() => onFocus(id)}>
        <div className="win-titlebar" onDoubleClick={onDouble}>
          <div className="win-title">
            {icon && <span className="title-icon">{icon}</span>}
            {title}
          </div>
          <div className="win-controls">
            <button onClick={e => {
            e.stopPropagation();
            onMinimize(id);
          }} title="최소화">
              <svg viewBox="0 0 10 10"><path d="M1 5 L9 5" /></svg>
            </button>
            <button onClick={e => {
            e.stopPropagation();
            animateGeometry();
            onMaximize(id);
          }} title="최대화 / 복원">
              {maximized ? <svg viewBox="0 0 10 10"><path d="M2.5 0.5 H8.5 V6.5 M0.5 2.5 H6.5 V8.5 H0.5 Z" /></svg> : <svg viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" /></svg>}
            </button>
            <button className="close" onClick={e => {
            e.stopPropagation();
            requestClose();
          }} title="닫기">
              <svg viewBox="0 0 10 10"><path d="M0.5 0.5 L9.5 9.5 M9.5 0.5 L0.5 9.5" /></svg>
            </button>
          </div>
        </div>
        <div className="win-body">{children}</div>

        {<>
            <div hidden={maximized || !!snapRegion} className="resize-h rh-n" data-direction="n" />
            <div hidden={maximized || !!snapRegion} className="resize-h rh-s" data-direction="s" />
            <div hidden={maximized || !!snapRegion} className="resize-h rh-w" data-direction="w" />
            <div hidden={maximized || !!snapRegion} className="resize-h rh-e" data-direction="e" />
            <div hidden={maximized || !!snapRegion} className="resize-h rh-nw" data-direction="nw" />
            <div hidden={maximized || !!snapRegion} className="resize-h rh-ne" data-direction="ne" />
            <div hidden={maximized || !!snapRegion} className="resize-h rh-sw" data-direction="sw" />
            <div hidden={maximized || !!snapRegion} className="resize-h rh-se" data-direction="se" />
          </>}
      </div>

      {snapPreview && (() => {
      const parent = {
        w: window.innerWidth,
        h: window.innerHeight - 48
      };
      let rect = {
        left: 0,
        top: 0,
        width: parent.w / 2,
        height: parent.h
      };
      if (snapPreview === 'right') rect = {
        left: parent.w / 2,
        top: 0,
        width: parent.w / 2,
        height: parent.h
      };
      if (snapPreview === 'top') rect = {
        left: 0,
        top: 0,
        width: parent.w,
        height: parent.h / 2
      };
      return <div className="snap-preview" style={rect} />;
    })()}
    </>;
}
Object.assign(window, {
  Window
});
