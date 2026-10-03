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
      ['arrival', 'horizon', '운영을 책상 밖으로 — PC와 모바일에서 같은 상황을 확인합니다', 1800],
      ['login', 'horizon', '로그인하면 센터의 현재 상황부터 보입니다', 700],
      ['dashboard', 'horizon', '대기와 처리 현황을 한자리에서 비교합니다', 2600],
      ['attention', 'horizon', '주의가 필요한 항목은 먼저 눈에 들어옵니다', 2800],
      ['agents', 'horizon', '상담원 상태를 살펴보고 대응을 이어갑니다', 2200],
      ['ai-mode', 'horizon', '운영 화면에서 AI 분석으로 이어집니다', 1800],
      ['ai-analysis', 'horizon', '질문의 답변과 그래프를 함께 확인합니다', 4500]
    ] },
    { id: 'counseling', section: 'd02', frame: counseling, mount: counseling?.closest('.frame'), scenes: [
      ['arrival', 'counseling-login', '상담을 시작하는 흐름 — 로그인부터 작업 공간까지', 1400],
      ['password-find', 'counseling-login', '비밀번호 찾기도 로그인 옆에서 이어집니다', 1600],
      ['password-mail', 'counseling-login', '메일 발송은 움직임으로 응답합니다 · 모의 발송', 900],
      ['login', 'counseling-login', '로그인하고 상담 업무로 들어갑니다', 600],
      ['dashboard', 'counseling-desktop', '대시보드로 현재 상황을 펼칩니다', 2200],
      ['performance', 'counseling-desktop', '전체 실적을 함께 열어 현황과 비교합니다', 2600],
      ['performance-trend', 'counseling-desktop', '월별 건수로 변화의 흐름을 읽습니다', 2200],
      ['performance-quality', 'counseling-desktop', '상담 시간과 평점으로 실적을 더 살펴봅니다', 2400],
      ['arrange', 'counseling-desktop', '창을 옮겨 자신에게 맞는 작업 공간을 만듭니다', 1700],
      ['error', 'counseling-desktop', '404를 만나도 업무로 돌아갈 길은 남습니다', 2000],
      ['game', 'counseling-desktop', '잠깐의 여유 — 404 안의 작은 게임', 600],
      ['return', 'counseling-desktop', '열어둔 창으로 돌아와 하던 일을 잇습니다', 2000]
    ] },
    { id: 'admin', section: 'd02', frame: admin, mount: admin?.closest('.frame'), scenes: [
      ['arrival', 'admin', '같은 창 구조가 관리자 업무로 확장됩니다', 1600],
      ['dashboard', 'admin', '운영 상태와 주요 지표를 먼저 확인합니다', 2400],
      ['analytics', 'admin', '분석을 옆에 열어 두 정보를 함께 봅니다', 3000],
      ['minimize', 'admin', '필요 없는 창은 접어 작업 공간을 확보합니다', 1600],
      ['restore', 'admin', '작업표시줄에서 꺼내 이전 작업을 이어갑니다', 2400]
    ] },
    { id: 'weekly', section: 'd03', frame: weekly, mount: weekly?.closest('.frame'), scenes: [
      ['arrival', 'weekly-index', '빈 문서 대신 세 질문 — 주간보고를 시작하는 방식', 1600],
      ['login', 'weekly-index', '내 이름으로 팀의 업무 화면에 들어갑니다', 500],
      ['overview', 'weekly-home', '이번 주 보고와 남은 일을 한곳에서 확인합니다', 2600],
      ['open-easy', 'weekly-home', '첫 질문부터 하나씩 작성합니다', 600],
      ['write-week', 'weekly-easy', '이번 주에 한 일 · 작성 예시', 1800],
      ['write-next', 'weekly-easy', '다음 주에 할 일 · 작성 예시', 1800],
      ['write-help', 'weekly-easy', '함께 해결할 일 · 작성 예시', 1800],
      ['report', 'weekly-easy', '답변을 모아 보고서로 — 확인하고 다시 수정할 수 있습니다', 3500]
    ] },
    { id: 'workshop', section: 'd03', frame: workshop, mount: document.querySelector('#workshopGuide'), scenes: [
      ['arrival', 'workshop-index', '함께 떠나는 하루 — 준비하는 순서대로', 1800],
      ['meeting', 'workshop-index', '모일 장소와 시간을 먼저 확인합니다', 2800],
      ['schedule', 'workshop-index', '하루의 일정을 이어서 살펴봅니다', 3200],
      ['open-people', 'workshop-index', '다음은 함께 갈 사람들입니다', 500],
      ['people', 'workshop-people', '참석 인원과 이동 정보를 한곳에서 확인합니다', 2400],
      ['carpool', 'workshop-people', '함께 탈 차량을 고릅니다', 1800],
      ['carousel', 'workshop-people', '차량을 넘기며 탑승자와 빈자리를 비교합니다', 2200],
      ['open-shopping', 'workshop-people', '이동 준비에서 장보기로 이어집니다', 500],
      ['shopping', 'workshop-shopping', '필요한 물건과 수량을 확인합니다', 1800],
      ['check-item', 'workshop-shopping', '산 물건은 체크하고 남은 물건을 구분합니다 · 체험용', 2200],
      ['check-progress', 'workshop-shopping', '체크와 진행도로 남은 준비가 보입니다', 2600]
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
    tour.caption.textContent = tour.state === 'manual' ? '직접 체험 중입니다 · 자동 안내는 현재 화면에서 멈춥니다' : tour.state === 'done' ? '안내가 끝났습니다 · 지금 화면에서 직접 사용할 수 있습니다' : tour.state === 'error' ? '안내가 중단됐습니다 · 다시 보거나 현재 화면에서 직접 사용할 수 있습니다' : tour.scenes[tour.index]?.[2] || '실제 화면으로 디자인한 사용 흐름을 보여줍니다';
    if (tour.id === 'horizon' && tour.index === 4 && !/live\.html/.test(tour.source) && ['running', 'paused', 'idle'].includes(tour.state)) tour.caption.textContent = '최근 이벤트로 운영 상태의 변화를 살펴봅니다';
    tour.meta.textContent = tour.state === 'manual' ? '직접 이어가는 중' : tour.state === 'done' ? '안내 완료' : tour.state === 'running' ? `사용 흐름 · ${tour.index + 1} / ${tour.scenes.length}` : tour.state === 'paused' ? '일시정지' : '디자인한 사용 흐름';
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
