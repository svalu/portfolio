/* Guided app copies. Writing and checking are isolated from saved visitor data. */
(() => {
  const p = window.PortfolioPreview;
  if (!p) return;
  const app = document.body.dataset.readingTour;
  let checkedDemoId = null;
  const page = location.pathname.split('/').pop().replace('.html', '');
  const q = selector => document.querySelector(selector);
  const heading = text => [...document.querySelectorAll('h1,h2,h3')].find(e => e.textContent.includes(text));
  const delay = (ms, signal) => { const end = performance.now() + ms; return p.wait(() => performance.now() >= end, signal, ms + 1000); };
  async function write(step, text, signal) {
    const easy = window.WeeklyEasy;
    easy.go(step); await show(easy.card, signal);
    for (let i = 1; i <= text.length; i++) { if (signal.aborted) return; easy.answer(text.slice(0,i)); await delay(32, signal); }
  }
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
        if (action === 'open-easy') return navigate('easy.html', signal);
        if (action === 'write-week') return write(0, '고객 미팅에서 운영 요구사항을 정리했어요.\n모바일 상담 화면을 검토했어요.', signal);
        if (action === 'write-next') return write(1, '수요일까지 개선 시안을 공유하고\n팀 피드백을 반영할 예정이에요.', signal);
        if (action === 'write-help') return write(2, '모바일 테스트에 참여할 동료가 필요해요.', signal);
        if (action === 'report') { window.WeeklyEasy.go(3); return show(window.WeeklyEasy.card, signal); }
      }
      if (app === 'workshop') {
        if (action === 'arrival') return show(q('.hero'), signal);
        if (action === 'meeting') return show(q('.ticket'), signal);
        if (action === 'schedule') return show(q('#timeline')?.closest('section'), signal);
        if (action === 'open-people') return navigate('people.html', signal);
        if (action === 'people') { await p.wait(() => q('#grid .person'), signal); return show(q('#grid'), signal); }
        if (action === 'carpool') return show(q('#carpoolCard'), signal);
        if (action === 'carousel') {
          const cars = q('#cars'), second = cars.querySelectorAll('.car')[1];
          if (!second) throw new Error('Second car missing');
          await show(cars, signal);
          const from = cars.scrollLeft, target = second.offsetLeft - cars.firstElementChild.offsetLeft;
          const snap = cars.style.scrollSnapType; cars.style.scrollSnapType = 'none';
          try {
            const start = performance.now(), duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900;
            await p.wait(() => { const t = duration ? Math.min(1,(performance.now()-start)/duration) : 1; cars.scrollLeft = from + (target-from)*(1-Math.pow(1-t,3)); return t === 1; },signal,2000);
          } finally { cars.style.scrollSnapType = snap; }
          p.focus(second); return;
        }
        if (action === 'open-shopping') return navigate('shopping.html', signal);
        if (action === 'shopping') {
          await p.wait(() => q('#list .item') || q('#list').textContent.includes('불러오는') === false, signal);
          return show(q('#list'), signal);
        }
        if (action === 'check-item') {
          if (new URLSearchParams(location.search).get('preview') !== '1') throw new Error('Checking requires an isolated demo');
          if (checkedDemoId) return show([...document.querySelectorAll('#list .item')].find(e => e.dataset.id === checkedDemoId), signal);
          const item = await p.wait(() => q('#list .item:not(.done)'), signal);
          const id = item.dataset.id;
          await show(item, signal); await delay(650, signal);
          item.querySelector('[data-act="toggle"]').click();
          checkedDemoId = id;
          const checked = [...document.querySelectorAll('#list .item')].find(e => e.dataset.id === id);
          await show(checked, signal); return;
        }
        if (action === 'check-progress') return show(q('#barText')?.closest('section'), signal);
      }
      throw new Error('Unknown reading scene');
    }
  });
})();
