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
      if (action === 'ai-mode') {
        if (live) {
          if (!find('#viewAi.show')) showAiMode();
          p.focus(await ready('.aim-sample'));
        } else {
          if (!find('.welcome,.chat-layout')) (await ready('.ai-btn')).click();
          p.focus(await ready('.samples .sample'));
        }
        return;
      }
      if (action === 'ai-analysis') {
        // Re-entering a paused scene must not submit the same question twice.
        if (live) {
          if (getComputedStyle(find('#aimWelcome')).display !== 'none') {
            const sample = await ready('.aim-sample');
            p.focus(sample); sample.click();
          }
          await p.wait(() => !find('#aimThinking') && find('#aimScroll .aim-msg-ai'), signal);
          const panel = await ready('#aimStats.open');
          await p.wait(() => panel.getAnimations().every(a => a.playState !== 'running'), signal);
          p.reveal(await ready('.aim-stat-row'), find('.aim-stats-body')); p.focus(panel);
        } else {
          if (find('.welcome')) {
            const sample = await p.wait(() => [...document.querySelectorAll('.samples .sample')].find(el => /통계 분석/.test(el.textContent)), signal);
            p.focus(sample); sample.click();
          }
          const chart = await ready('.stats-panel.open .chart-card svg');
          const panel = find('.stats-panel.open');
          await p.wait(() => panel.getAnimations().every(a => a.playState !== 'running'), signal);
          p.reveal(chart.closest('.chart-card'), panel.querySelector('.stats-body')); p.focus(chart.closest('.chart-card'));
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
