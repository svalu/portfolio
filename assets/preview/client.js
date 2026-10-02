/* Live previews accept only commands from their same-origin portfolio parent. */
(() => {
  if (parent === window) return;
  const channel = 'heerang-preview-v1';
  let adapter, session = null, controller = null, highlighted = null;
  const send = (type, extra = {}) => parent.postMessage({ channel, type, session, ...extra }, location.origin);
  const clearFocus = () => { highlighted?.classList.remove('preview-focus'); highlighted = null; };
  const stop = () => { controller?.abort(); controller = null; clearFocus(); document.documentElement.removeAttribute('data-preview-playing'); };
  const takeover = event => {
    if (!event.isTrusted || !session) return;
    stop(); send('takeover');
  };
  const bindInput = doc => ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(name => doc.addEventListener(name, takeover, { capture: true, passive: true }));
  bindInput(document);
  // The counseling desktop opens same-origin windows containing their own documents.
  document.addEventListener('load', event => {
    if (event.target.tagName !== 'IFRAME') return;
    try { bindInput(event.target.contentDocument); } catch (_) { /* unrelated embedded content */ }
  }, true);
  const wait = (test, signal, timeout = 10000) => new Promise((resolve, reject) => {
    let timer;
    const end = (error, value) => { clearTimeout(timer); signal.removeEventListener('abort', cancel); error ? reject(error) : resolve(value); };
    const cancel = () => end(new DOMException('Preview stopped', 'AbortError'));
    const deadline = performance.now() + timeout;
    const poll = () => {
      if (signal.aborted) return cancel();
      const value = test();
      if (value) return end(null, value);
      if (performance.now() > deadline) return end(new Error('Preview view not ready'));
      timer = setTimeout(poll, 60);
    };
    signal.addEventListener('abort', cancel, { once: true }); poll();
  });
  window.PortfolioPreview = {
    register(value) { adapter = value; if (session) send('ready', { stage: adapter.stage }); },
    wait,
    focus(element) { clearFocus(); highlighted = element; element?.classList.add('preview-focus'); },
    // Scroll only the app's own pane, never the surrounding portfolio.
    reveal(element, pane) {
      if (!element || !pane) return;
      const a = element.getBoundingClientRect(), b = pane.getBoundingClientRect();
      pane.scrollTo({ top: Math.max(0, pane.scrollTop + a.top - b.top - 24), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  };
  window.addEventListener('message', async event => {
    const m = event.data;
    if (event.source !== parent || event.origin !== location.origin || m?.channel !== channel) return;
    if (m.type === 'hello') { session = m.session; if (adapter) send('ready', { stage: adapter.stage }); return; }
    if (m.session !== session) return;
    if (m.type === 'stop') { stop(); return; }
    if (m.type !== 'action' || !adapter) return;
    stop(); const own = new AbortController(); controller = own;
    document.documentElement.dataset.previewPlaying = m.action;
    try {
      const result = await adapter.run(m.action, own.signal);
      if (!own.signal.aborted) send('done', { id: m.id, ...result });
    } catch (error) {
      if (error.name !== 'AbortError') send('error', { id: m.id });
    }
  });
})();
