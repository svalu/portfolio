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
      ['arrival', 'horizon', '관리자가 어디서든 확인할 수 있도록 운영 화면을 디자인했습니다', 1800],
      ['login', 'horizon', '로그인 뒤 센터의 현재 상황을 먼저 보여줍니다', 700],
      ['dashboard', 'horizon', '대기와 처리 현황을 한눈에 비교하도록 배치했습니다', 2600],
      ['attention', 'horizon', '주의가 필요한 항목은 일반 정보와 구분해 강조했습니다', 2800],
      ['agents', 'horizon', '상담원 상태를 함께 확인하고 대응할 수 있도록 구성했습니다', 2200],
      ['ai-mode', 'horizon', '운영 화면에서 AI 분석으로 이어지도록 연결했습니다', 1800],
      ['ai-analysis', 'horizon', '질문에 대한 답변과 그래프를 함께 보며 분석하도록 구성했습니다', 4500]
    ] },
    { id: 'counseling', section: 'd02', frame: counseling, mount: counseling?.closest('.frame'), scenes: [
      ['arrival', 'counseling-login', '로그인부터 업무에 들어가는 과정까지 디자인했습니다', 1400],
      ['password-find', 'counseling-login', '비밀번호 찾기는 로그인 화면에서 바로 시작하도록 배치했습니다', 1600],
      ['password-mail', 'counseling-login', '메일 발송 과정을 보여주어 요청에 대한 반응을 확인하도록 했습니다', 900],
      ['login', 'counseling-login', '로그인 뒤 상담 업무를 시작하는 화면으로 이어집니다', 600],
      ['dashboard', 'counseling-desktop', '대시보드에서 상담 현황을 먼저 확인하도록 구성했습니다', 2200],
      ['performance', 'counseling-desktop', '전체 실적은 별도 창으로 열어 대시보드와 함께 볼 수 있습니다', 2600],
      ['performance-trend', 'counseling-desktop', '월별 건수의 변화를 이어서 확인하도록 구성했습니다', 2200],
      ['performance-quality', 'counseling-desktop', '상담 시간과 평점도 함께 살펴보도록 정리했습니다', 2400],
      ['arrange', 'counseling-desktop', '창을 옮겨 필요한 정보를 나란히 비교하도록 디자인했습니다', 1700],
      ['error', 'counseling-desktop', '404 화면에도 업무로 돌아오는 경로를 남겼습니다', 2000],
      ['game', 'counseling-desktop', '404 화면에는 잠시 쉬어갈 수 있는 게임을 구성했습니다', 600],
      ['return', 'counseling-desktop', '업무로 돌아오면 열어둔 창에서 다시 이어갈 수 있습니다', 2000]
    ] },
    { id: 'admin', section: 'd02', frame: admin, mount: admin?.closest('.frame'), scenes: [
      ['arrival', 'admin', '상담사 화면의 창 구조를 관리자 업무로 확장했습니다', 1600],
      ['dashboard', 'admin', '대시보드에서 운영 상태와 주요 지표를 확인합니다', 2400],
      ['analytics', 'admin', '분석 창을 함께 열어 현황과 비교하도록 구성했습니다', 3000],
      ['minimize', 'admin', '사용하지 않는 창은 최소화해 작업 공간을 정리할 수 있습니다', 1600],
      ['restore', 'admin', '작업표시줄에서 창을 복원해 하던 일을 이어갈 수 있습니다', 2400]
    ] },
    { id: 'weekly', section: 'd03', frame: weekly, mount: weekly?.closest('.frame'), scenes: [
      ['arrival', 'weekly-index', '주간보고를 세 질문에 답하는 흐름으로 디자인했습니다', 1600],
      ['login', 'weekly-index', '이름을 선택하면 자신의 업무 화면으로 들어갑니다', 500],
      ['overview', 'weekly-home', '보고 현황과 남은 일을 먼저 확인하도록 구성했습니다', 2600],
      ['open-easy', 'weekly-home', '쉬운 작성에서는 한 번에 한 질문에 집중하도록 구성했습니다', 600],
      ['write-week', 'weekly-easy', '첫 질문은 이번 주에 한 일입니다 · 작성 예시', 1800],
      ['write-next', 'weekly-easy', '다음 주에 할 일을 입력해 계획을 정리합니다 · 작성 예시', 1800],
      ['write-help', 'weekly-easy', '도움이 필요한 일을 남겨 팀과 공유할 내용을 정리합니다 · 작성 예시', 1800],
      ['report', 'weekly-easy', '세 답변을 보고서로 모아 확인하고 수정하도록 구성했습니다', 3500]
    ] },
    { id: 'workshop', section: 'd03', frame: workshop, mount: document.querySelector('#workshopGuide'), scenes: [
      ['arrival', 'workshop-index', '워크샵 준비를 참여자의 행동 순서에 맞춰 디자인했습니다', 1800],
      ['meeting', 'workshop-index', '모일 장소와 시간을 먼저 확인하도록 배치했습니다', 2800],
      ['schedule', 'workshop-index', '이어서 하루의 일정을 살펴볼 수 있습니다', 3200],
      ['open-people', 'workshop-index', '일정 확인에서 참석 인원 확인으로 연결했습니다', 500],
      ['people', 'workshop-people', '참석 여부와 이동 정보를 한곳에 모았습니다', 2400],
      ['carpool', 'workshop-people', '함께 탈 차량과 좌석을 확인하도록 구성했습니다', 1800],
      ['carousel', 'workshop-people', '차량은 캐러셀로 넘겨 탑승자와 빈자리를 비교할 수 있습니다', 2200],
      ['open-shopping', 'workshop-people', '이동 준비 다음에는 장보기 목록으로 이어집니다', 500],
      ['shopping', 'workshop-shopping', '필요한 물건과 수량을 목록으로 정리했습니다', 1800],
      ['check-item', 'workshop-shopping', '구매한 물건은 체크해 남은 준비와 구분합니다 · 체험용', 2200],
      ['check-progress', 'workshop-shopping', '체크한 수량과 진행도로 준비 상태를 확인하도록 디자인했습니다', 2600]
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
    if (tour.id === 'horizon' && tour.index === 4 && !/live\.html/.test(tour.source) && ['running', 'paused', 'idle'].includes(tour.state)) tour.caption.textContent = '최근 이벤트로 운영 상태의 변화를 확인하도록 구성했습니다';
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
