/* Read-only tours: move the eye to real content, without changing app data. */
(() => {
  const p = window.PortfolioPreview;
  if (!p) return;
  const app = document.body.dataset.readingTour;
  const page = location.pathname.split('/').pop().replace('.html', '');
  const q = selector => document.querySelector(selector);
  const heading = text => [...document.querySelectorAll('h1,h2,h3')].find(e => e.textContent.includes(text));
  async function show(element, signal) {
    if (!element) throw new Error('Story target missing');
    const pane = document.scrollingElement;
    const from = pane.scrollTop;
    const top = Math.max(0, Math.min(pane.scrollHeight - innerHeight, from + element.getBoundingClientRect().top - 76));
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700;
    await new Promise((resolve, reject) => {
      let raf, start;
      const abort = () => { cancelAnimationFrame(raf); reject(new DOMException('Stopped', 'AbortError')); };
      const tick = now => {
        if (signal.aborted) return abort();
        start ??= now;
        const t = duration ? Math.min(1, (now - start) / duration) : 1;
        pane.scrollTop = from + (top - from) * (1 - Math.pow(1 - t, 3));
        if (t < 1) raf = requestAnimationFrame(tick);
        else { signal.removeEventListener('abort', abort); resolve(); }
      };
      signal.addEventListener('abort', abort, { once: true });
      raf = requestAnimationFrame(tick);
    });
    if (!signal.aborted) p.focus(element);
  }
  function navigate(href, signal) {
    const link = [...document.querySelectorAll('a[href]')].find(a => a.getAttribute('href').replace(/^\.\//, '') === href);
    if (!link) throw new Error('Story link missing');
    // Give the parent its completion message before the document leaves.
    setTimeout(() => { if (!signal.aborted) link.click(); }, 0);
    return { navigation: true };
  }
  p.register({
    stage: `${app}-${page}`,
    async run(action, signal) {
      if (app === 'weekly') {
        if (action === 'arrival') return show(q('form input[type="hidden"][name="email"]')?.closest('form'), signal);
        if (action === 'login') {
          setTimeout(() => { if (!signal.aborted) q('form input[type="hidden"][name="email"]').closest('form').requestSubmit(); }, 0);
          return { navigation: true };
        }
        if (action === 'overview') return show(q('main a[href="weekly.html"]'), signal);
        if (action === 'attention') return show(heading('지금 밀린 것')?.closest('section'), signal);
        if (action === 'open-actions') return navigate('actions.html', signal);
        if (action === 'actions') return show(q('main table')?.closest('section'), signal);
        if (action === 'back') return navigate('home.html', signal);
        if (action === 'next') return show(heading('내 할 일')?.closest('section'), signal);
      }
      if (app === 'workshop') {
        if (action === 'arrival') return show(q('.hero'), signal);
        if (action === 'meeting') return show(q('.ticket'), signal);
        if (action === 'schedule') return show(q('#timeline')?.closest('section'), signal);
        if (action === 'open-shopping') return navigate('shopping.html', signal);
        if (action === 'shopping') {
          await p.wait(() => q('#list .item') || q('#list').textContent.includes('불러오는') === false, signal);
          return show(q('#list'), signal);
        }
      }
      throw new Error('Unknown reading scene');
    }
  });
})();
