/* One live scene at a time. A visitor's input always takes ownership. */
(() => {
  const channel = 'heerang-preview-v1', origin = location.origin;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = () => innerWidth <= 900;
  const horizon = document.querySelector('#d01 .frame iframe');
  const phone = document.querySelector('#phone01 iframe');
  const counseling = document.querySelector('#fgrow iframe');
  const admin = document.querySelector('#d02 .f2026 iframe');
  const peers = new Map(), pending = new Map();
  const sectionLocks = new Set();
  let sequence = 0, active = null;
  const configurations = [
    { id: 'horizon', section: 'd01', frame: horizon, companion: phone, mount: document.querySelector('#d01 .story'), scenes: [
      ['arrival', 'horizon', '로그인에서 운영 화면으로 이어집니다', 1800],
      ['login', 'horizon', '로그인하고 운영 화면으로 들어갑니다', 700],
      ['dashboard', 'horizon', '지금 대기와 처리 상황을 먼저 봅니다', 2600],
      ['attention', 'horizon', '쌓인 대기에서 주의할 항목을 찾습니다', 2800],
      ['agents', 'horizon', '상담원 상황까지 이어서 확인합니다', 2200],
      ['ai-mode', 'horizon', 'AI 모드에서 필요한 분석을 물어봅니다', 1800],
      ['ai-analysis', 'horizon', '분석 질문을 누르면 답변과 그래프가 함께 열립니다', 4500]
    ] },
    { id: 'counseling', section: 'd02', frame: counseling, mount: counseling?.closest('.frame'), scenes: [
      ['arrival', 'counseling-login', '상담사의 하루는 로그인에서 시작합니다', 1400],
      ['password-find', 'counseling-login', '비밀번호를 잊었을 때도 다음 행동이 보입니다', 1600],
      ['password-mail', 'counseling-login', '봉투가 접히고 날아가며 발송 과정을 알려줍니다', 900],
      ['login', 'counseling-login', '일할 책상으로 들어갑니다', 600],
      ['dashboard', 'counseling-desktop', '대시보드에서 오늘의 상담 흐름을 확인합니다', 2200],
      ['performance', 'counseling-desktop', '전체 실적을 열어 상담 분포와 평점을 봅니다', 2600],
      ['arrange', 'counseling-desktop', '창을 끌어 옮겨 두 화면을 함께 펼칩니다', 1700],
      ['error', 'counseling-desktop', '404에도 돌아갈 길과 잠깐의 놀이를 넣었습니다', 2000],
      ['game', 'counseling-desktop', '오류 화면에 숨겨 둔 공룡 게임도 움직입니다', 600],
      ['return', 'counseling-desktop', '쉬었다 돌아와도 펼쳐 둔 작업은 그대로입니다', 2000]
    ] },
    { id: 'admin', section: 'd02', frame: admin, mount: admin?.closest('.frame'), scenes: [
      ['arrival', 'admin', '같은 책상을 관리자 도구로 넓혔습니다', 1600],
      ['dashboard', 'admin', '대시보드에서 전화 대기 증가를 발견합니다', 2400],
      ['analytics', 'admin', '분석 창을 더해 원인을 확인합니다', 3000],
      ['minimize', 'admin', '잠깐 접어 둬도 작업은 사라지지 않습니다', 1600],
      ['restore', 'admin', '작업표시줄에서 하던 화면으로 돌아옵니다', 2400]
    ] }
  ];
  const send = (f, message) => f.contentWindow?.postMessage({ channel, ...message }, origin);
  function connect(f, owner) {
    const peer = { f, owner, session: `${owner.id}-${++sequence}`, stage: null };
    peers.set(f, peer);
    const hello = () => {
      peer.stage = null;
      send(f, { type: 'hello', session: peer.session });
    };
    f.addEventListener('load', hello); peer.hello = hello; hello();
  }
  function stopCommands(tour) {
    tour.token++;
    for (const f of [tour.frame, tour.companion].filter(Boolean)) {
      const peer = peers.get(f); if (peer) send(f, { type: 'stop', session: peer.session });
    }
    for (const [id, p] of pending) if (p.tour === tour) { clearTimeout(p.timer); p.reject(new Error('stopped')); pending.delete(id); }
  }
  function command(tour, f, action, stage) {
    const peer = peers.get(f), token = tour.token;
    return new Promise((resolve, reject) => {
      const deadline = performance.now() + 15000;
      const ready = () => {
        if (token !== tour.token) return reject(new Error('stopped'));
        if (peer.stage !== stage) {
          if (performance.now() > deadline) return reject(new Error('not ready'));
          peer.hello(); setTimeout(ready, 180); return;
        }
        const id = ++sequence;
        pending.set(id, { tour, f, resolve, reject, timer: setTimeout(() => { pending.delete(id); reject(new Error('scene timeout')); }, 12000) });
        send(f, { type: 'action', session: peer.session, id, action });
      }; ready();
    });
  }
  function render(tour) {
    tour.controls.dataset.state = tour.state;
    tour.controls.dataset.scene = tour.scenes[tour.index]?.[0] || 'complete';
    tour.caption.textContent = tour.state === 'manual' ? '지금 보던 화면을 직접 만져보세요' : tour.state === 'done' ? '이제 직접 눌러보세요 · 화면은 그대로 이어집니다' : tour.state === 'error' ? '화면을 직접 둘러보거나 다시 재생해 보세요' : tour.scenes[tour.index]?.[2] || '업무 흐름을 짧게 보여드립니다';
    if (tour.id === 'horizon' && tour.index === 4 && !/live\.html/.test(tour.source) && ['running', 'paused', 'idle'].includes(tour.state)) tour.caption.textContent = '최근 이벤트에서 상담 흐름을 확인합니다';
    tour.meta.textContent = tour.state === 'manual' ? '직접 체험 중' : tour.state === 'done' ? '둘러보기 완료' : tour.state === 'running' ? `자동 둘러보기 · ${tour.index + 1} / ${tour.scenes.length}` : tour.state === 'paused' ? '둘러보기 멈춤' : '실제 화면으로 보는 업무 흐름';
    tour.play.textContent = tour.state === 'running' ? '멈춤' : tour.state === 'paused' ? '이어보기' : '흐름 보기';
    tour.play.hidden = ['done', 'manual', 'error'].includes(tour.state);
    tour.replay.hidden = tour.state === 'idle';
  }
  function pause(tour, automatic = false) {
    if (tour.state !== 'running') return;
    tour.state = 'paused'; tour.autoResume = automatic;
    if (!automatic) sectionLocks.add(tour.section);
    if (tour.phase === 'action') tour.phase = 'new';
    stopCommands(tour); active = null; render(tour);
  }
  function takeover(tour) {
    if (!tour) return;
    sectionLocks.add(tour.section);
    // Both OS previews are one exhibit: don't begin moving the other while someone explores.
    tours.filter(t => t.section === tour.section).forEach(t => {
      stopCommands(t); t.state = 'manual'; t.autoResume = false;
      for (const f of [t.frame, t.companion].filter(Boolean)) f.dataset.engaged = 'true';
      render(t);
    }); active = null;
  }
  function start(tour, replay = false, automatic = false) {
    if (active && active !== tour) pause(active);
    sectionLocks.delete(tour.section);
    if (replay || ['done', 'manual', 'error'].includes(tour.state)) {
      stopCommands(tour); tour.index = 0; tour.phase = 'new';
      for (const f of [tour.frame, tour.companion].filter(Boolean)) {
        // Explicit replay is the only operation that resets an explored app.
        const peer = peers.get(f); peer.stage = null;
        if (f.getClientRects().length) f.src = f.dataset.src;
      }
    }
    tour.state = 'running'; tour.autoResume = false; tour.last = performance.now();
    if (!automatic && narrow()) {
      const host = (tour.companion || tour.frame).closest('.phone,.frame');
      const r = host.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) {
        tour.scrollUntil = performance.now() + 1000;
        scrollTo({ top: Math.max(0, scrollY + r.top - 8), behavior: reduced.matches ? 'instant' : 'smooth' });
      }
    }
    for (const f of [tour.frame, tour.companion].filter(Boolean)) {
      if (f.getClientRects().length) { f.dataset.previewPinned = 'true'; if (!f.getAttribute('src')) f.src = f.dataset.src; }
    }
    active = tour; render(tour);
  }
  const tours = configurations.filter(c => c.frame && c.mount).map(c => {
    const controls = document.createElement('div'); controls.className = 'preview-controls'; controls.dataset.preview = c.id;
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', { horizon: 'Blue Horizon 업무 흐름', counseling: '상담사 OS 업무 흐름', admin: '관리자 OS 업무 흐름' }[c.id]);
    controls.innerHTML = '<div class="preview-copy"><small></small><span class="preview-caption"></span></div><button type="button" class="preview-play">흐름 보기</button><button type="button" class="preview-replay">다시 보기</button>';
    c.mount.append(controls);
    const t = { ...c, controls, meta: controls.querySelector('small'), caption: controls.querySelector('.preview-caption'), play: controls.querySelector('.preview-play'), replay: controls.querySelector('.preview-replay'), index: 0, state: 'idle', phase: 'new', token: 0, autoResume: false, visibleSince: 0, source: c.frame.dataset.src };
    t.play.onclick = () => t.state === 'running' ? pause(t) : start(t);
    t.replay.onclick = () => start(t, true);
    connect(t.frame, t); if (t.companion) connect(t.companion, t);
    render(t); return t;
  });
  function visible(tour) {
    if (document.hidden || document.getElementById('lb')?.classList.contains('on')) return false;
    const section = document.getElementById(tour.section);
    if (!section.classList.contains('in') || section.inert) return false;
    if (!narrow()) return Math.abs(scrollY / innerHeight - (tour.section === 'd01' ? 1 : 2)) < .18;
    const f = tour.companion || tour.frame, r = f.closest('.phone,.frame').getBoundingClientRect();
    const overlap = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    return overlap > Math.min(r.height, innerHeight) * .5;
  }
  window.addEventListener('message', event => {
    const m = event.data;
    if (event.origin !== origin || m?.channel !== channel) return;
    const peer = [...peers.values()].find(p => p.f.contentWindow === event.source && p.session === m.session);
    if (!peer) return;
    if (m.type === 'ready') { peer.stage = m.stage; return; }
    if (m.type === 'takeover') { takeover(peer.owner); return; }
    const request = pending.get(m.id);
    if (!request || request.f !== peer.f) return;
    clearTimeout(request.timer); pending.delete(m.id);
    m.type === 'done' ? request.resolve(m) : request.reject(new Error('scene failed'));
  });
  document.addEventListener('pointerdown', event => {
    const host = event.target.closest('.phone,.frame');
    if (!host || event.target.closest('.preview-controls')) return;
    const tour = tours.find(t => [t.frame, t.companion].filter(Boolean).some(f => host.contains(f)));
    if (tour && event.target.closest('button')) takeover(tour);
  }, true);
  document.getElementById('tabs01')?.addEventListener('click', event => {
    if (!event.target.closest('button')) return;
    const t = tours[0]; if (t.source === t.frame.dataset.src) return;
    t.source = t.frame.dataset.src; stopCommands(t); t.index = 0; t.phase = 'new'; t.state = 'idle';
    sectionLocks.delete(t.section);
    t.visibleSince = 0; active = null;
    [t.frame, t.companion].forEach(f => { delete f.dataset.engaged; delete f.dataset.previewPinned; peers.get(f).stage = null; });
    render(t);
  });
  const tick = () => {
    const now = performance.now();
    if (active && active.scrollUntil > now && !visible(active) && !document.hidden) return;
    if (active && !visible(active)) pause(active, true);
    for (const t of tours) {
      const shown = visible(t);
      if (!shown) { t.visibleSince = 0; continue; }
      if (!t.visibleSince) t.visibleSince = now;
      if (!active && now - t.visibleSince > 700 && !reduced.matches && !sectionLocks.has(t.section) && (t.state === 'idle' || t.state === 'paused' && t.autoResume)) start(t, false, true);
    }
    const t = active; if (!t) return;
    const dt = Math.min(250, now - t.last); t.last = now;
    if (t.phase === 'hold') {
      t.remaining -= dt;
      if (t.remaining > 0) return;
      t.index++; t.phase = 'new';
      if (t.index === t.scenes.length) { stopCommands(t); t.state = 'done'; active = null; render(t); return; }
      render(t);
    }
    if (t.phase !== 'new') return;
    const [action, stage, , hold] = t.scenes[t.index], token = t.token;
    const frames = [t.frame, t.companion].filter(f => f && f.getClientRects().length);
    t.phase = 'action';
    Promise.all(frames.map(f => command(t, f, action, stage))).then(() => {
      if (token !== t.token) return;
      t.phase = 'hold'; t.remaining = hold; t.last = performance.now();
    }).catch(() => {
      if (token !== t.token) return;
      stopCommands(t); t.state = 'error'; active = null; render(t);
    });
  };
  setInterval(tick, 120);
  document.addEventListener('visibilitychange', tick);
  reduced.addEventListener('change', () => { if (reduced.matches && active) pause(active); });
})();
