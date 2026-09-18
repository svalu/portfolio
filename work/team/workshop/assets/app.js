/* 공통: 공유 저장소(Store), 내 이름 선택, 탭바, 토스트, 컨페티 */
(function () {
  const CFG = window.WK_CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 내 이름 ---------- */
  const ME_KEY = "wk_me";
  function getMe() { try { return localStorage.getItem(ME_KEY) || ""; } catch { return ""; } }
  function setMe(v) { try { localStorage.setItem(ME_KEY, v); } catch {} document.dispatchEvent(new CustomEvent("wk:me", { detail: v })); }

  /* ---------- 토스트 ---------- */
  let toastEl, toastTimer;
  function toast(msg, ms = 1800) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  /* ---------- 컨페티 ---------- */
  function confetti(x, y, n = 18) {
    const colors = ["#ff6b6b", "#ffb347", "#ffe66d", "#4ecdc4", "#63a4ff", "#a78bfa", "#ff8fab"];
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 90;
      p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:9px;height:9px;border-radius:${Math.random() > .5 ? "50%" : "2px"};background:${colors[i % colors.length]};border:1.5px solid #1f1b2e;z-index:99;pointer-events:none;transform:translate(-50%,-50%)`;
      document.body.appendChild(p);
      const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 60;
      p.animate([
        { transform: "translate(-50%,-50%) rotate(0)", opacity: 1 },
        { transform: `translate(${dx}px,${dy + 90}px) rotate(${360 * (Math.random() > .5 ? 1 : -1)}deg)`, opacity: 0 }
      ], { duration: 700 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => p.remove();
    }
  }

  /* =====================================================================
     공유 저장소
     - 컬렉션(col) 안에 문서(id -> object) 구조. 문서 단위로 저장해서 동시 수정 충돌이 없음.
     - provider: "kvdb" (kvdb.io 버킷) | "firebase" (Realtime Database REST) | "local" (내 기기만)
     - 실패한 쓰기는 큐에 저장해 두고 연결되면 자동 재시도 (새로고침해도 유지)
     ===================================================================== */
  const S = CFG.storage || {};
  const provider = S.provider || "local";

  const adapters = {
    kvdb: {
      url: (key) => `${S.kvdb.base.replace(/\/$/, "")}/${S.kvdb.bucket}/${encodeURIComponent(key)}`,
      async list(col) {
        const r = await fetch(`${S.kvdb.base.replace(/\/$/, "")}/${S.kvdb.bucket}/?prefix=${encodeURIComponent(col + ":")}&values=true&format=json&limit=1000`, { cache: "no-store" });
        if (!r.ok) throw new Error("list " + r.status);
        const arr = await r.json();
        const out = {};
        (arr || []).forEach((pair) => {
          const [key, val] = Array.isArray(pair) ? pair : [pair.key, pair.value];
          const id = String(key).slice(col.length + 1);
          try { out[id] = typeof val === "string" ? JSON.parse(val) : val; } catch { /* skip */ }
        });
        return out;
      },
      async set(col, id, obj) {
        // POST + text/plain => CORS 사전요청 없이 저장 가능
        const r = await fetch(this.url(col + ":" + id), { method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(obj) });
        if (!r.ok) throw new Error("set " + r.status);
      },
      async del(col, id) {
        const r = await fetch(this.url(col + ":" + id), { method: "DELETE" });
        if (!r.ok && r.status !== 404) throw new Error("del " + r.status);
      }
    },
    firebase: {
      url: (path) => `${S.firebase.databaseURL.replace(/\/$/, "")}/${S.firebase.root || "workshop"}/${path}.json`,
      async list(col) {
        const r = await fetch(this.url(col), { cache: "no-store" });
        if (!r.ok) throw new Error("list " + r.status);
        return (await r.json()) || {};
      },
      async set(col, id, obj) {
        const r = await fetch(this.url(col + "/" + encodeURIComponent(id)), { method: "PUT", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(obj) });
        if (!r.ok) throw new Error("set " + r.status);
      },
      async del(col, id) {
        const r = await fetch(this.url(col + "/" + encodeURIComponent(id)), { method: "DELETE" });
        if (!r.ok) throw new Error("del " + r.status);
      }
    },
    local: {
      async list() { throw new Error("local only"); },
      async set() { throw new Error("local only"); },
      async del() { throw new Error("local only"); }
    }
  };
  const A = adapters[provider] || adapters.local;

  const cacheKey = (col) => "wk2_" + col;
  const QUEUE_KEY = "wk2_queue";
  const listeners = {};
  const state = {};
  // writable: null = 아직 모름, true = 쓰기 가능, false = 읽기만 가능(저장소 인증 필요)
  const status = { online: provider !== "local", busy: false, writable: provider === "local" ? false : null, provider };
  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch {}

  const readCache = (col) => { try { return JSON.parse(localStorage.getItem(cacheKey(col)) || "null"); } catch { return null; } };
  const writeCache = (col, v) => { try { localStorage.setItem(cacheKey(col), JSON.stringify(v)); } catch {} };
  const saveQueue = () => { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch {} };
  const emit = (col) => (listeners[col] || []).forEach((fn) => { try { fn(state[col]); } catch (e) { console.error(e); } });
  const setStatus = (p) => { Object.assign(status, p); document.dispatchEvent(new CustomEvent("wk:status", { detail: { ...status } })); };
  const apply = (col, docs) => { state[col] = docs; writeCache(col, docs); emit(col); };

  // 큐에 쌓인 변경을 로컬 상태에 겹쳐서 보여주기 (서버에 아직 없어도 내 화면엔 보이게)
  function overlay(col, docs) {
    const out = { ...docs };
    queue.filter((q) => q.col === col).forEach((q) => { if (q.type === "set") out[q.id] = q.obj; else delete out[q.id]; });
    return out;
  }

  // 읽기는 되는데 쓰기가 막힌 저장소인지 한 번 확인 (초록불이 거짓말하지 않게)
  let probing = false, lastProbe = 0;
  async function probeWrite() {
    if (provider === "local" || probing) return;
    // 처음엔 무조건, 쓰기 불가로 판정된 뒤엔 1분마다 재확인 (인증을 마치면 자동으로 풀리게)
    if (status.writable === true) return;
    if (status.writable === false && Date.now() - lastProbe < 60000) return;
    probing = true; lastProbe = Date.now();
    try { await A.set("_probe", "w", { t: Date.now() }); setStatus({ writable: true }); }
    catch (e) { console.warn("쓰기 불가", e); setStatus({ writable: false }); }
    finally { probing = false; }
  }

  async function flushQueue() {
    while (queue.length) {
      const q = queue[0];
      if (q.type === "set") await A.set(q.col, q.id, q.obj); else await A.del(q.col, q.id);
      queue.shift(); saveQueue();
    }
  }

  async function pull(col, { silent } = {}) {
    if (provider === "local") { if (!state[col]) apply(col, readCache(col) || {}); return state[col]; }
    setStatus({ busy: true });
    try {
      const hadQueue = queue.length > 0;
      // 밀린 쓰기 재시도. 여기서 실패해도 '읽기'는 별개로 계속 진행한다.
      try { await flushQueue(); if (hadQueue) setStatus({ writable: true }); }
      catch (e) { console.warn("밀린 저장 재시도 실패", e); setStatus({ writable: false }); }
      const docs = await A.list(col);
      // 아직 서버에 못 올린 내 변경은 항상 위에 덮어씌운다 (서버 응답이 지우지 못하게)
      apply(col, overlay(col, docs));
      setStatus({ online: true, busy: false });
      probeWrite();
      if (hadQueue && !queue.length) toast("연결 복구! 밀린 변경 저장 완료 ✅");
      return docs;
    } catch (e) {
      console.warn("pull 실패", e);
      setStatus({ online: false, busy: false });
      if (!state[col]) apply(col, overlay(col, readCache(col) || {}));
      if (!silent) toast("공유 저장소에 연결이 안 돼요. 내 기기 저장본으로 보여줄게요");
      return state[col];
    }
  }

  async function write(op) {
    const optimistic = () => {
      const docs = { ...(state[op.col] || readCache(op.col) || {}) };
      if (op.type === "set") docs[op.id] = op.obj; else delete docs[op.id];
      apply(op.col, docs);
    };
    if (provider === "local") { optimistic(); return; }

    // 보내기 전에 먼저 큐에 넣는다. 그래야 도중에 도착한 서버 응답이 이 변경을 지우지 못한다.
    const dup = queue.findIndex((q) => q.col === op.col && q.id === op.id);
    if (dup >= 0) queue.splice(dup, 1);   // 같은 항목의 이전 변경은 최신 것으로 대체
    queue.push(op); saveQueue();
    optimistic();

    setStatus({ busy: true });
    try {
      await flushQueue();
      setStatus({ online: true, busy: false, writable: true });
    } catch (e) {
      console.warn("write 실패", e);
      setStatus({ busy: false, writable: false });
      toast("지금은 공유 저장소에 저장이 안 돼요. 연결되면 자동으로 올라가요");
    }
  }
  const set = (col, id, obj) => write({ type: "set", col, id, obj });
  const remove = (col, id) => write({ type: "del", col, id });
  // 화면에만 반영 (서버/캐시에 저장 안 함) — 오프라인일 때 기본 목록 보여주기용
  function setLocal(col, id, obj) { const docs = { ...(state[col] || {}) }; docs[id] = obj; state[col] = docs; emit(col); }

  function subscribe(col, fn) {
    (listeners[col] = listeners[col] || []).push(fn);
    if (!state[col]) state[col] = overlay(col, readCache(col) || {});
    fn(state[col]);
  }

  let pollTimer = null;
  function startPolling(cols) {
    const tick = () => { if (document.visibilityState === "visible") cols.forEach((c) => pull(c, { silent: true })); };
    cols.forEach((c) => pull(c));
    clearInterval(pollTimer); pollTimer = setInterval(tick, S.pollMs || 15000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") tick(); });
    window.addEventListener("online", tick);
    window.addEventListener("focus", tick);
  }

  /* ---------- 사람 목록 (기본 15명 + 추가된 사람) ---------- */
  let extraPeople = [];
  function allPeople() {
    const base = CFG.people.slice();
    extraPeople.forEach((n) => { if (!base.includes(n)) base.push(n); });
    return base;
  }
  function setExtraPeople(list) {
    extraPeople = list.slice();
    refreshPeopleSelects();
    document.dispatchEvent(new CustomEvent("wk:people", { detail: allPeople() }));
  }
  function refreshPeopleSelects() {
    $$("select[data-people]").forEach((sel) => {
      const cur = sel.value, first = sel.querySelector("option") ? sel.querySelector("option").outerHTML : "";
      sel.innerHTML = first + allPeople().map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join("");
      sel.value = cur;
      if (sel.value !== cur) sel.value = "";
    });
    const me = $("#mePick"); if (me) me.value = getMe();
  }

  /* ---------- 공통 UI ---------- */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function timeAgo(ts) {
    if (!ts) return "";
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return "방금";
    if (d < 3600) return Math.floor(d / 60) + "분 전";
    if (d < 86400) return Math.floor(d / 3600) + "시간 전";
    return Math.floor(d / 86400) + "일 전";
  }
  const AVATARS = ["🦊", "🐻", "🐼", "🐯", "🦁", "🐸", "🐙", "🦄", "🐧", "🐨", "🐰", "🐲", "🦖", "🐳", "🦉", "🐮", "🐷", "🐵", "🐹", "🦝"];
  const AV_BG = ["#ffd6d6", "#ffe8c2", "#fff6b3", "#c9f3ef", "#d6e6ff", "#e6dcff", "#ffd9e6", "#d9f7d1"];
  function avatar(name) {
    const i = allPeople().indexOf(name);
    const idx = i >= 0 ? i : [...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0);
    return { emoji: AVATARS[idx % AVATARS.length], bg: AV_BG[idx % AV_BG.length] };
  }

  function renderChrome(active) {
    const f = document.createElement("div"); f.className = "floaties";
    const em = ["🏕️", "🍜", "🔥", "🍻", "🥩", "🎉", "🚗", "🌙", "⛺", "🍢", "🎲", "🥂"];
    em.forEach((e, i) => {
      const s = document.createElement("span");
      s.textContent = e;
      s.style.left = (i * 37 + 7) % 92 + "%"; s.style.top = (i * 53 + 11) % 90 + "%";
      s.style.animationDelay = (-i * 1.7) + "s"; s.style.fontSize = 24 + (i % 4) * 7 + "px";
      f.appendChild(s);
    });
    document.body.prepend(f);

    const top = $(".topbar");
    if (top) {
      top.innerHTML = `
        <a class="brand" href="./index.html"><span class="dot"></span>BH 팀 워크샵</a>
        <nav class="topnav">
          <a href="./index.html" class="${active === "home" ? "on" : ""}">🍜 모임·숙소</a>
          <a href="./people.html" class="${active === "people" ? "on" : ""}">🙋 인원체크</a>
          <a href="./shopping.html" class="${active === "shopping" ? "on" : ""}">🛒 장보기</a>
        </nav>
        <label class="me-pick"><span class="who">나는</span>
          <select id="mePick" data-people><option value="">누구?</option></select><span>▾</span></label>`;
      refreshPeopleSelects();
      const sel = $("#mePick");
      sel.addEventListener("change", () => { setMe(sel.value); if (sel.value) toast(`${sel.value} 님, 반가워요 👋`); });
    }

    const tabs = [
      { href: "index.html", ic: "🍜", label: "모임·숙소", id: "home" },
      { href: "people.html", ic: "🙋", label: "인원체크", id: "people" },
      { href: "shopping.html", ic: "🛒", label: "장보기", id: "shopping" }
    ];
    const bar = document.createElement("div"); bar.className = "tabbar";
    bar.innerHTML = `<nav>${tabs.map((t) => `<a href="./${t.href}" class="${t.id === active ? "on" : ""}"><span class="ic">${t.ic}</span>${t.label}</a>`).join("")}</nav>`;
    document.body.appendChild(bar);

    document.addEventListener("wk:status", (e) => {
      $$(".sync").forEach((el) => {
        const d = e.detail;
        const readOnly = d.online && d.writable === false;
        el.classList.toggle("off", !d.online || readOnly);
        el.classList.toggle("busy", d.busy && d.online && !readOnly);
        const b = el.querySelector("b");
        if (!b) return;
        b.textContent =
          d.provider === "local" ? "내 기기에만 저장 (공유 저장소 미설정)" :
          !d.online ? "오프라인 (내 기기 저장, 자동 재시도)" :
          readOnly ? "저장 대기 중 — 저장소 인증 필요 (내 기기에만 저장)" :
          d.busy ? "동기화 중…" : "실시간 공유 중";
      });
    });
    if (provider === "local") setTimeout(() => setStatus({ online: false }), 0);

    initRipple();
    initPageTransition();
  }

  /* ---------- 모션 ---------- */
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 눌렀을 때 퍼지는 물결
  function initRipple() {
    if (reduced()) return;
    const SEL = ".btn, .chip, .choice, .tabbar a, .topnav a";
    document.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(SEL);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2.2;
      const rip = document.createElement("span");
      rip.className = "rip";
      rip.style.cssText = `left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;width:${d}px;height:${d}px`;
      el.appendChild(rip);
      rip.addEventListener("animationend", () => rip.remove());
    }, { passive: true });
  }

  // 스크롤하면서 하나씩 나타나기 (JS가 켤 때만 숨김 — 실패해도 내용은 보임)
  function reveal(selector, root = document) {
    const els = $$(selector, root);
    if (!els.length || reduced() || !("IntersectionObserver" in window)) return;
    let n = 0, fired = false;
    const io = new IntersectionObserver((entries, obs) => {
      fired = true;
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.style.animationDelay = Math.min(n++ % 6, 5) * 55 + "ms";
        en.target.classList.add("in");
        obs.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    els.forEach((el) => { el.setAttribute("data-reveal", ""); io.observe(el); });
    // 안전장치: 관찰기가 아예 동작하지 않으면 그때만 전부 보이게
    setTimeout(() => { if (!fired) els.forEach((el) => el.classList.add("in")); }, 2000);
  }

  // 페이지 전환: 링크 누르면 살짝 사라졌다가 다음 페이지에서 떠오르게
  function initPageTransition() {
    // 탭을 옮기면 항상 맨 위에서 시작 (스크롤 위치 복원 끄기)
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (reduced()) return;
    let leaving = false;
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // 같은 페이지 앵커
      e.preventDefault();
      if (leaving) return;
      leaving = true;
      document.body.classList.add("leaving");
      setTimeout(() => { location.href = url.href; }, 165);
      setTimeout(() => { leaving = false; document.body.classList.remove("leaving"); }, 3000); // 이동 실패 대비
    });
    // 뒤로가기로 돌아왔을 때 흐려진 채로 남지 않게
    window.addEventListener("pageshow", () => { leaving = false; document.body.classList.remove("leaving"); });
  }

  function copy(text) {
    const fallback = () => {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("주소 복사됨 📋"); } catch { toast("복사 실패 😢"); }
      ta.remove();
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast("주소 복사됨 📋"), fallback);
    else fallback();
  }

  window.WK = {
    $, $$, esc, getMe, setMe, toast, confetti, uid, timeAgo, avatar, renderChrome, copy,
    allPeople, setExtraPeople, refreshPeopleSelects, reveal, reduced,
    store: { pull, set, remove, setLocal, subscribe, startPolling, status, state, provider }
  };
})();
