/* One live scene at a time. A visitor's input always takes ownership. */
(() => {
  const channel = 'heerang-preview-v1', origin = location.origin;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = () => innerWidth <= 900;
  const horizon = document.querySelector('#d01 .frame iframe');
  const phone = document.querySelector('#phone01 iframe');
  const counseling = document.querySelector('#fgrow iframe');
  const admin = document.querySelector('#d02 .f2026 iframe');
  const weekly = document.querySelector('#d03 .frame iframe');
  const workshop = document.querySelector('#phone03 iframe');
  const peers = new Map(), pending = new Map();
  const sectionLocks = new Set();
  let sequence = 0, active = null;
  const configurations = [
    { id: 'horizon', section: 'd01', frame: horizon, companion: phone, mount: document.querySelector('#d01 .story'), scenes: [
      ['arrival', 'horizon', '로그인하면 어떤 정보를 먼저 보게 되는지 보여드릴게요', 1800],
      ['login', 'horizon', '운영 화면으로 들어가 볼게요', 700],
      ['dashboard', 'horizon', '지금 몇 명이 기다리고 있는지 먼저 봐요', 2600],
      ['attention', 'horizon', '대기가 밀리면, 주의가 필요한 항목을 확인해요', 2800],
      ['agents', 'horizon', '상담원 상태도 함께 확인할 수 있어요', 2200],
      ['ai-mode', 'horizon', '더 자세히 알고 싶으면 AI 모드에서 물어봐요', 1800],
      ['ai-analysis', 'horizon', '질문을 누르면 답변과 그래프를 함께 볼 수 있어요', 4500]
    ] },
    { id: 'counseling', section: 'd02', frame: counseling, mount: counseling?.closest('.frame'), scenes: [
      ['arrival', 'counseling-login', '상담사 화면은 로그인부터 보여드릴게요', 1400],
      ['password-find', 'counseling-login', '비밀번호를 잊었다면, 여기서 찾을 수 있어요', 1600],
      ['password-mail', 'counseling-login', '메일을 보내는 동안에도 진행 상황이 보이도록 했어요', 900],
      ['login', 'counseling-login', '로그인하고 업무를 시작해 볼게요', 600],
      ['dashboard', 'counseling-desktop', '오늘 상담이 어떻게 진행되고 있는지 먼저 봐요', 2200],
      ['performance', 'counseling-desktop', '전체 실적을 열면 상담 분포와 평점을 볼 수 있어요', 2600],
      ['performance-trend', 'counseling-desktop', '월별로 상담 건수가 어떻게 달라졌는지도 살펴봐요', 2200],
      ['performance-quality', 'counseling-desktop', '상담 시간과 평점도 같은 창에서 이어서 봐요', 2400],
      ['arrange', 'counseling-desktop', '창을 옮겨두면 두 정보를 함께 비교할 수 있어요', 1700],
      ['error', 'counseling-desktop', '페이지를 못 찾았을 때도 돌아가는 방법을 보여줘요', 2000],
      ['game', 'counseling-desktop', '기다리는 동안 해볼 수 있는 작은 게임도 넣었어요', 600],
      ['return', 'counseling-desktop', '돌아오면 아까 펼쳐둔 작업을 그대로 이어갈 수 있어요', 2000]
    ] },
    { id: 'admin', section: 'd02', frame: admin, mount: admin?.closest('.frame'), scenes: [
      ['arrival', 'admin', '관리자 업무에도 같은 방식을 적용해 봤어요', 1600],
      ['dashboard', 'admin', '대시보드에서 전화 대기가 늘어난 걸 확인해요', 2400],
      ['analytics', 'admin', '분석 창을 함께 열고 원인을 살펴봐요', 3000],
      ['minimize', 'admin', '잠깐 접어둔 창은 작업표시줄에 남아 있어요', 1600],
      ['restore', 'admin', '여기서 누르면 하던 화면으로 바로 돌아와요', 2400]
    ] },
    { id: 'weekly', section: 'd03', frame: weekly, mount: weekly?.closest('.frame'), scenes: [
      ['arrival', 'weekly-index', '이름을 고르고 이번 주 업무를 확인해 볼게요', 1600],
      ['login', 'weekly-index', '팀의 업무를 한곳에서 볼 수 있어요', 500],
      ['overview', 'weekly-home', '누가 보고했는지, 아직 남은 일은 무엇인지 먼저 봐요', 2600],
      ['open-easy', 'weekly-home', '보고서가 막막하면, 질문에 하나씩 답해 보세요', 600],
      ['write-week', 'weekly-easy', '먼저 이번 주에 한 일을 짧게 적어요', 1800],
      ['write-next', 'weekly-easy', '그다음엔 다음 주에 할 일을 적어볼까요?', 1800],
      ['write-help', 'weekly-easy', '마지막으로 도움이 필요한 일도 함께 남겨요', 1800],
      ['report', 'weekly-easy', '이렇게 답한 내용을 한 장의 주간보고로 정리해 줘요 · 체험용', 3500]
    ] },
    { id: 'workshop', section: 'd03', frame: workshop, mount: document.querySelector('#workshopGuide'), scenes: [
      ['arrival', 'workshop-index', '워크샵 준비도 순서대로 함께 볼까요?', 1800],
      ['meeting', 'workshop-index', '어디로, 몇 시까지 가면 되는지 먼저 확인해요', 2800],
      ['schedule', 'workshop-index', '도착한 뒤에는 무엇을 할지도 순서대로 볼 수 있어요', 3200],
      ['open-people', 'workshop-index', '이번에는 누가 어떻게 오는지 살펴볼게요', 500],
      ['people', 'workshop-people', '각자의 도착 시간과 이동 방법을 함께 확인해요', 2400],
      ['carpool', 'workshop-people', '어느 차에 누가 타는지, 빈자리가 있는지 볼 수 있어요', 1800],
      ['carousel', 'workshop-people', '차 카드를 옆으로 넘기면 다른 차량도 볼 수 있어요', 2200],
      ['open-shopping', 'workshop-people', '이제 장보기를 준비해 볼게요', 500],
      ['shopping', 'workshop-shopping', '무엇을 얼마나 사야 하는지 목록에서 확인해요', 1800],
      ['check-item', 'workshop-shopping', '산 물건은 체크해서 함께 확인할 수 있어요 · 체험용', 2200],
      ['check-progress', 'workshop-shopping', '체크할 때마다 얼마나 준비됐는지도 함께 보여줘요', 2600]
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
    tour.caption.textContent = tour.state === 'manual' ? '자동 안내는 멈췄어요 · 지금 화면에서 직접 써보세요' : tour.state === 'done' ? '여기서부터 직접 눌러보세요 · 보던 화면에서 이어갈 수 있어요' : tour.state === 'error' ? '자동 안내를 이어가지 못했어요 · 직접 둘러보거나 다시 봐주세요' : tour.scenes[tour.index]?.[2] || '어떻게 쓰는지 순서대로 보여드릴게요';
    if (tour.id === 'horizon' && tour.index === 4 && !/live\.html/.test(tour.source) && ['running', 'paused', 'idle'].includes(tour.state)) tour.caption.textContent = '최근에 어떤 일이 있었는지도 함께 확인해요';
    tour.meta.textContent = tour.state === 'manual' ? '직접 체험 중' : tour.state === 'done' ? '둘러보기 완료' : tour.state === 'running' ? `자동 둘러보기 · ${tour.index + 1} / ${tour.scenes.length}` : tour.state === 'paused' ? '둘러보기 멈춤' : '화면으로 따라가 보기';
    if (tour.id === 'weekly' || tour.id === 'workshop') tour.meta.textContent = `${tour.id === 'weekly' ? 'Weekly' : '워크샵'} · ${tour.meta.textContent}`;
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
    controls.setAttribute('aria-label', { horizon: 'Blue Horizon 업무 흐름', counseling: '상담사 OS 업무 흐름', admin: '관리자 OS 업무 흐름', weekly: 'Weekly 업무 흐름', workshop: '워크샵 준비 흐름' }[c.id]);
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
    if (!narrow()) return Math.abs(scrollY / innerHeight - Number(tour.section.slice(1))) < .18;
    const f = tour.companion || tour.frame, r = f.closest('.phone,.frame').getBoundingClientRect();
    const overlap = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    return overlap > Math.min(r.height, innerHeight) * .5;
  }
  window.addEventListener('message', event => {
    const m = event.data;
    if (event.origin !== origin || m?.channel !== channel) return;
    const peer = [...peers.values()].find(p => p.f.contentWindow === event.source && p.session === m.session);
    if (!peer) return;
    if (m.type === 'ready') {
      peer.stage = m.stage;
      if (peer.owner.id === 'weekly') {
        const label = peer.f.closest('.frame')?.querySelector('.bar > span');
        if (label) label.textContent = { 'weekly-index': 'weekly / 시작', 'weekly-home': 'weekly / 이번 주', 'weekly-actions': 'weekly / 할 일', 'weekly-easy': 'weekly / 쉬운 작성' }[m.stage] || 'weekly';
      }
      return;
    }
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
