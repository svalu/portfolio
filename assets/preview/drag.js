/* Pointer coordinates already belong to the iframe, including scaled previews. */
(() => {
  const bind = (node, handlers) => {
    let gesture = null, suppressUntil = 0;
    const finish = (event, cancelled = false) => {
      if (!gesture || event && event.pointerId !== gesture.id) return;
      const current = gesture; gesture = null;
      delete node.dataset.dragging;
      delete document.documentElement.dataset.desktopDragging;
      if (current.moved) suppressUntil = performance.now() + 400;
      if (node.hasPointerCapture(current.id)) node.releasePointerCapture(current.id);
      handlers.end?.(current.context, current.moved, cancelled);
    };
    const down = event => {
      suppressUntil = 0; // A fresh press is a new click, even immediately after a drag.
      if (gesture || !event.isPrimary || event.button !== 0 || event.target.closest(handlers.exclude || 'button,input,textarea,select,a')) return;
      const context = handlers.start(event);
      if (context === false) return;
      event.preventDefault(); event.stopPropagation();
      gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,context,moved:false};
      node.setPointerCapture(event.pointerId);
    };
    const move = event => {
      if (!gesture || event.pointerId !== gesture.id) return;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      if (!gesture.moved && Math.hypot(dx,dy) < 5) return;
      gesture.moved = true;
      node.dataset.dragging = 'true'; document.documentElement.dataset.desktopDragging = 'true';
      handlers.move(gesture.context, dx, dy, event);
    };
    const up = event => finish(event);
    const cancel = event => finish(event, true);
    const blur = () => finish(null, true);
    const click = event => {
      if (event.detail && performance.now() < suppressUntil) {event.preventDefault();event.stopImmediatePropagation();}
    };
    node.addEventListener('pointerdown',down);
    node.addEventListener('pointermove',move);
    node.addEventListener('pointerup',up);
    node.addEventListener('pointercancel',cancel);
    node.addEventListener('lostpointercapture',cancel);
    node.addEventListener('click',click,true);
    window.addEventListener('blur',blur);
    return () => {
      blur();
      node.removeEventListener('pointerdown',down); node.removeEventListener('pointermove',move);
      node.removeEventListener('pointerup',up); node.removeEventListener('pointercancel',cancel);
      node.removeEventListener('lostpointercapture',cancel); node.removeEventListener('click',click,true);
      window.removeEventListener('blur',blur);
    };
  };
  window.PortfolioDrag = { bind };
})();
