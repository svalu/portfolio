(() => {
  const p = window.PortfolioPreview;
  if (!p) return;
  const live = /live\.html$/.test(location.pathname);
  const find = selector => document.querySelector(selector);
  p.register({
    stage: 'horizon',
    async run(action, signal) {
      const ready = selector => p.wait(() => find(selector), signal);
      if (action === 'arrival') { p.focus(await ready(live ? '#lcCard' : '.login-btn,.lc-btn')); return; }
      if (action === 'login') {
        if (live) {
          if (getComputedStyle(find('#viewLogin')).display !== 'none') doLogin();
          await p.wait(() => getComputedStyle(find('#viewLogin')).display === 'none', signal);
        } else {
          find('.login-btn,.lc-btn')?.click(); await ready('.status-banner');
        }
        return;
      }
      if (live) {
        showPage(action === 'agents' ? 'pg-agents' : 'pg-home', find(`.on-item[onclick*="${action === 'agents' ? 'pg-agents' : 'pg-home'}"]`));
        const target = await ready(action === 'attention' ? '.alert-list' : action === 'agents' ? '#pg-agents .ag-kpi-bar' : '.metric-strip');
        const pane = find('.pg.active');
        p.reveal(target, pane); p.focus(target);
      } else {
        const target = await ready(action === 'attention' ? '.al-list' : action === 'agents' ? '.ev-list' : '.kpi-row');
        p.reveal(target, find('.content')); p.focus(target);
      }
    }
  });
})();
