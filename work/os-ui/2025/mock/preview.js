(() => {
  const p = window.PortfolioPreview;
  if (!p) return;
  const login = /\/screens\/login\.html$/.test(location.pathname);
  p.register({
    stage: login ? 'counseling-login' : 'counseling-desktop',
    async run(action, signal) {
      if (action === 'arrival') { p.focus(document.querySelector('.login_wrap')); return; }
      if (action === 'login') { loginProc(); return { navigation: true }; }
      const name = { dashboard: '대시보드', history: '상담 이력', note: '메모장' }[action];
      if (!name) throw new Error('Unknown counseling scene');
      const icon = await p.wait(() => document.querySelector(`.bg_icon_wrap[menuName="${name}"]`), signal);
      const id = icon.getAttribute('menuId');
      const existed = document.getElementById(id);
      icon.click();
      const host = await p.wait(() => document.getElementById(id), signal);
      if (!existed) host.style.opacity = '0';
      try { await p.wait(() => host.querySelector('iframe')?.contentDocument?.querySelector('.iframe_body'), signal); }
      finally { if (!existed) host.style.removeProperty('opacity'); }
      // Keep the previous sheet visible beside the next one on the desktop.
      if (action !== 'dashboard') {
        host.style.left = Math.max(12, Math.min(innerWidth - host.offsetWidth - 16, action === 'history' ? innerWidth * .25 : innerWidth * .58)) + 'px';
        host.style.top = (action === 'history' ? 100 : Math.min(360, innerHeight * .38)) + 'px';
      }
      if (action === 'note') {
        const area = await p.wait(() => host.querySelector('iframe').contentDocument.querySelector('#notepadArea'), signal);
        area.value = '요금제 변경 문의\n현재 이용 요금 안내 완료\n다음 상담: 변경 적용일 확인';
        area.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (!existed && !matchMedia('(prefers-reduced-motion: reduce)').matches) host.animate([{ opacity: 0, transform: 'translateY(10px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.16,1,.3,1)' });
      p.focus(host);
    }
  });
})();
