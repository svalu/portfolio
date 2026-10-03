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
      ['arrival', 'horizon', '대기가 늘었어요. 지금 어디부터 살펴보면 좋을까요?', 1800],
      ['login', 'horizon', '로그인하고 센터의 현재 상황을 확인해 볼게요', 700],
      ['dashboard', 'horizon', '먼저 대기와 처리 현황을 보면, 지금 상황이 잡혀요', 2600],
      ['attention', 'horizon', '그중 주의가 필요한 항목부터 좁혀볼 수 있어요', 2800],
      ['agents', 'horizon', '상담원 상태를 함께 보면 대응할 때 필요한 정보가 모여요', 2200],
      ['ai-mode', 'horizon', '숫자만으로 궁금증이 풀리지 않으면, AI 모드로 이어가요', 1800],
      ['ai-analysis', 'horizon', '질문을 고르면 답변과 그래프가 열려요. 원인을 더 살펴볼 수 있죠', 4500]
    ] },
    { id: 'counseling', section: 'd02', frame: counseling, mount: counseling?.closest('.frame'), scenes: [
      ['arrival', 'counseling-login', '오늘 상담을 시작하려는데, 비밀번호가 생각나지 않는다면요?', 1400],
      ['password-find', 'counseling-login', '로그인 옆에서 복구를 시작할 수 있어요', 1600],
      ['password-mail', 'counseling-login', '보내는 과정을 보여줘서, 눌린 건지 다시 확인하지 않게요', 900],
      ['login', 'counseling-login', '이제 로그인하고 하던 업무로 들어가요', 600],
      ['dashboard', 'counseling-desktop', '오늘의 상담 상황을 먼저 펼쳐두고요', 2200],
      ['performance', 'counseling-desktop', '전체 실적도 열어 두 정보를 함께 살펴봐요', 2600],
      ['performance-trend', 'counseling-desktop', '건수가 어떻게 달라졌는지 월별로 내려가 보죠', 2200],
      ['performance-quality', 'counseling-desktop', '시간과 평점까지 보면 건수 밖의 변화도 살펴볼 수 있어요', 2400],
      ['arrange', 'counseling-desktop', '비교할 창을 옮겨두면, 번갈아 화면을 찾지 않아도 돼요', 1700],
      ['error', 'counseling-desktop', '다른 페이지를 못 찾았을 때도 업무로 돌아갈 길은 남겨뒀어요', 2000],
      ['game', 'counseling-desktop', '잠깐 쉬어갈 수 있게 작은 게임도 넣었어요', 600],
      ['return', 'counseling-desktop', '돌아오면 아까 열어둔 창에서 일을 이어가요', 2000]
    ] },
    { id: 'admin', section: 'd02', frame: admin, mount: admin?.closest('.frame'), scenes: [
      ['arrival', 'admin', '이번에는 관리자예요. 운영 상황을 보고 원인도 살펴봐야 하죠', 1600],
      ['dashboard', 'admin', '대시보드에서 전화 대기가 늘어난 걸 발견했어요', 2400],
      ['analytics', 'admin', '분석을 옆에 열면, 앞의 상황을 놓치지 않고 비교할 수 있어요', 3000],
      ['minimize', 'admin', '당장 필요 없는 창은 잠깐 접어두고요', 1600],
      ['restore', 'admin', '다시 필요해지면 여기서 꺼내요. 처음부터 찾을 필요 없이요', 2400]
    ] },
    { id: 'weekly', section: 'd03', frame: weekly, mount: weekly?.closest('.frame'), scenes: [
      ['arrival', 'weekly-index', '이번 주 보고서, 어디부터 써야 할지 막막하다면요?', 1600],
      ['login', 'weekly-index', '내 이름으로 들어가 팀이 일하는 상황부터 볼게요', 500],
      ['overview', 'weekly-home', '아직 정리되지 않은 보고와 남은 일을 확인해요', 2600],
      ['open-easy', 'weekly-home', '빈 문서 앞에서 고민하는 대신, 질문 하나로 시작해요', 600],
      ['write-week', 'weekly-easy', '이번 주에는 무슨 일을 했나요? 기억나는 것부터 적어요', 1800],
      ['write-next', 'weekly-easy', '그다음엔 다음 주에 할 일을 생각해 보고요', 1800],
      ['write-help', 'weekly-easy', '마지막으로, 함께 해결할 일이나 도움이 필요한 일을 남겨요', 1800],
      ['report', 'weekly-easy', '세 답변이 모이면 보고서가 돼요. 이제 내용을 읽고 다듬으면 되죠 · 체험용', 3500]
    ] },
    { id: 'workshop', section: 'd03', frame: workshop, mount: document.querySelector('#workshopGuide'), scenes: [
      ['arrival', 'workshop-index', '워크샵에 가기로 했어요. 이제 무엇부터 준비하면 될까요?', 1800],
      ['meeting', 'workshop-index', '모일 장소와 시간부터 확인하면 출발 준비가 잡혀요', 2800],
      ['schedule', 'workshop-index', '그다음은 도착해서 함께 보낼 하루를 살펴봐요', 3200],
      ['open-people', 'workshop-index', '일정을 봤으니, 함께 갈 사람들을 확인해 볼까요?', 500],
      ['people', 'workshop-people', '누가 언제, 어떻게 오는지 한곳에서 볼 수 있어요', 2400],
      ['carpool', 'workshop-people', '차가 필요한 사람은 함께 탈 수 있는 자리를 찾아요', 1800],
      ['carousel', 'workshop-people', '차량을 넘겨보며 누가 타는지, 빈자리는 있는지 비교해요', 2200],
      ['open-shopping', 'workshop-people', '이동을 정했으면, 함께 준비할 물건을 챙겨요', 500],
      ['shopping', 'workshop-shopping', '장보기 목록을 열어 필요한 수량부터 확인하고요', 1800],
      ['check-item', 'workshop-shopping', '산 물건에 체크하면, 무엇이 남았는지 구분돼요 · 체험용', 2200],
      ['check-progress', 'workshop-shopping', '준비한 만큼 진행도 채워져요. 남은 물건을 이어서 챙기면 돼요', 2600]
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
    tour.caption.textContent = tour.state === 'manual' ? '이제 직접 이어가고 있어요 · 보던 흐름은 여기서 멈춰둘게요' : tour.state === 'done' ? '한 번 따라가 봤어요 · 궁금했던 곳을 직접 살펴보세요' : tour.state === 'error' ? '이야기가 잠시 멈췄어요 · 다시 시작하거나 지금 화면을 직접 살펴보세요' : tour.scenes[tour.index]?.[2] || '한 사람이 이 화면에서 일을 마치는 과정을 따라가요';
    if (tour.id === 'horizon' && tour.index === 4 && !/live\.html/.test(tour.source) && ['running', 'paused', 'idle'].includes(tour.state)) tour.caption.textContent = '최근 이벤트를 보면 대기가 쌓인 전후의 상황도 살펴볼 수 있어요';
    tour.meta.textContent = tour.state === 'manual' ? '직접 이어가는 중' : tour.state === 'done' ? '여기까지 따라왔어요' : tour.state === 'running' ? `이야기 따라가기 · ${tour.index + 1} / ${tour.scenes.length}` : tour.state === 'paused' ? '잠깐 멈춰 있어요' : '이 화면에서 시작하는 이야기';
    if (tour.id === 'weekly' || tour.id === 'workshop') tour.meta.textContent = `${tour.id === 'weekly' ? 'Weekly' : '워크샵'} · ${tour.meta.textContent}`;
    tour.play.textContent = tour.state === 'running' ? '멈춤' : tour.state === 'paused' ? '이어보기' : '따라가 보기';
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
    controls.innerHTML = '<div class="preview-copy"><small></small><span class="preview-caption"></span></div><button type="button" class="preview-play">따라가 보기</button><button type="button" class="preview-replay">다시 보기</button>';
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
