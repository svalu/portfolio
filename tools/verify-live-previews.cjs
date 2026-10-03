/* Behavioral contracts for autoplay, interruption and the parent/iframe handshake. */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('assets/preview/portfolio.js', 'utf8');
function harness({ width = 1440, reduce = false } = {}) {
  let now = 0, next = 1;
  const tasks = new Map(), messages = [], listeners = {};
  const schedule = (fn, ms, interval = 0) => { const id = next++; tasks.set(id, { fn, at: now + ms, interval }); return id; };
  class Node {
    constructor() { this.dataset = {}; this.children = []; this.classList = { contains: () => false }; }
    append(n) { this.children.push(n); }
    setAttribute(k, v) { this[k] = v; }
    set innerHTML(_) { this.parts = Object.fromEntries(['small', '.preview-caption', '.preview-play', '.preview-replay'].map(k => [k, new Node()])); }
    querySelector(k) { return this.parts?.[k]; }
    addEventListener(k, fn) { (this.events ||= {})[k] = fn; }
  }
  const sections = Object.fromEntries(['d01', 'd02'].map((id, i) => [id, { classList: { contains: () => true }, get inert() { return width > 900 && Math.round(ctx.scrollY / 900) !== i + 1; } }]));
  const mounts = [new Node(), new Node(), new Node()], stages = ['horizon', 'horizon', 'counseling-login', 'admin'];
  const frames = stages.map((stage, i) => {
    const host = { getBoundingClientRect: () => ({ top: 100, bottom: 700, height: 600 }), contains: f => f === frames[i] };
    const f = new Node(); f.dataset.src = 'demo-' + i; f.stage = stage;
    f.closest = () => i < 2 ? host : Object.assign(mounts[i - 1], host);
    f.getClientRects = () => width <= 900 && i === 0 ? [] : [1];
    f.getAttribute = key => f[key] || null;
    f.contentWindow = { postMessage(m) {
      messages.push({ frame: i, ...m }); f.session = m.session;
      if (m.type === 'hello') schedule(() => emit(f, { type: 'ready', stage: f.stage }), 1);
      if (m.type === 'action') schedule(() => {
        emit(f, { type: 'done', id: m.id });
        if (i === 2 && m.action === 'login') { f.stage = 'counseling-desktop'; emit(f, { type: 'ready', stage: f.stage }); }
      }, 20);
    } };
    return f;
  });
  const tabs = new Node();
  const doc = { hidden: false, querySelector(k) { return {
    '#d01 .frame iframe': frames[0], '#phone01 iframe': frames[1], '#fgrow iframe': frames[2], '#d02 .f2026 iframe': frames[3], '#d01 .story': mounts[0]
  }[k]; }, createElement: () => new Node(), getElementById: id => sections[id] || (id === 'tabs01' ? tabs : undefined), addEventListener(k, fn) { listeners['document:' + k] = fn; } };
  const ctx = { document: doc, location: { origin: 'http://localhost:5500' }, innerWidth: width, innerHeight: 900, scrollY: 900,
    performance: { now: () => now }, matchMedia: () => ({ matches: reduce, addEventListener() {} }),
    setTimeout: (fn, ms) => schedule(fn, ms), clearTimeout: id => tasks.delete(id), setInterval: (fn, ms) => schedule(fn, ms, ms) };
  ctx.window = { addEventListener(k, fn) { listeners[k] = fn; } };
  const emit = (f, extra, origin = ctx.location.origin) => listeners.message({ source: f.contentWindow, origin, data: { channel: 'heerang-preview-v1', session: f.session, ...extra } });
  vm.runInNewContext(source, ctx);
  async function advance(ms) {
    const end = now + ms;
    while (true) {
      const due = [...tasks.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      const [id, t] = due; now = t.at;
      if (t.interval) t.at += t.interval; else tasks.delete(id);
      t.fn(); for (let i = 0; i < 8; i++) await Promise.resolve();
    }
    now = end;
  }
  const controls = mounts.map(m => m.children[0]);
  return { ctx, doc, frames, messages, advance, controls, emit, tabs, actions: () => messages.filter(m => m.type === 'action') };
}
(async () => {
  const synced = harness(); await synced.advance(24000);
  assert.equal(synced.controls[0].dataset.state, 'done');
  assert.deepEqual(synced.actions().filter(x => x.frame === 0).map(x => x.action), ['arrival', 'login', 'dashboard', 'attention', 'agents', 'ai-mode', 'ai-analysis']);
  assert.deepEqual(synced.actions().filter(x => x.frame === 1).map(x => x.action), ['arrival', 'login', 'dashboard', 'attention', 'agents', 'ai-mode', 'ai-analysis']);
  const count = synced.actions().length; await synced.advance(24000); assert.equal(synced.actions().length, count, 'does not loop');

  const manual = harness(); await manual.advance(1500);
  manual.emit(manual.frames[1], { type: 'takeover' }, 'https://unrelated.example');
  assert.equal(manual.controls[0].dataset.state, 'running', 'rejects unrelated origin');
  manual.emit(manual.frames[1], { type: 'takeover' }); const stopped = manual.actions().length;
  await manual.advance(18000); assert.equal(manual.controls[0].dataset.state, 'manual'); assert.equal(manual.actions().length, stopped, 'input stops both previews');

  const paused = harness(); await paused.advance(1700); paused.controls[0].parts['.preview-play'].onclick();
  const atPause = paused.actions().length; await paused.advance(8000); assert.equal(paused.actions().length, atPause);
  paused.controls[0].parts['.preview-play'].onclick(); await paused.advance(24000); assert.equal(paused.controls[0].dataset.state, 'done', 'continues from paused scene');

  const background = harness(); await background.advance(1700); background.doc.hidden = true; await background.advance(300);
  assert.equal(background.controls[0].dataset.state, 'paused'); const before = background.actions().length;
  await background.advance(8000); assert.equal(background.actions().length, before); background.doc.hidden = false;
  await background.advance(24000); assert.equal(background.controls[0].dataset.state, 'done');

  const reduced = harness({ reduce: true }); await reduced.advance(3000); assert.equal(reduced.actions().length, 0, 'reduced motion requires explicit play');
  reduced.controls[0].parts['.preview-play'].onclick(); await reduced.advance(24000); assert.equal(reduced.controls[0].dataset.state, 'done');

  const phone = harness({ width: 390 }); await phone.advance(24000);
  assert.equal(phone.actions().filter(x => x.frame === 0).length, 0, 'hidden desktop iframe receives no scenes');
  assert.equal(phone.controls[0].dataset.state, 'done');

  const os = harness(); os.ctx.scrollY = 1800; await os.advance(32000);
  assert.equal(os.controls[1].dataset.state, 'done', 'login navigation waits for the new document');
  assert.equal(os.controls[2].dataset.state, 'done');
  const osActions = os.actions();
  assert.deepEqual(osActions.filter(x=>x.frame===2).map(x=>x.action),['arrival','password-find','password-mail','login','dashboard','performance','arrange','error','game','return']);
  assert.ok(osActions.findIndex(x => x.frame === 3) > osActions.findIndex(x => x.action === 'return'), 'OS scenes play sequentially after returning to work');
  const osPause = harness(); osPause.ctx.scrollY = 1800; await osPause.advance(1500); osPause.controls[1].parts['.preview-play'].onclick();
  await osPause.advance(24000); assert.equal(osPause.actions().filter(x => x.frame === 3).length, 0, 'pause does not start the other OS preview');
  const sameTab = harness(); await sameTab.advance(1700); const beforeTab = sameTab.actions().length;
  sameTab.tabs.events.click({ target: { closest: () => ({}) } });
  assert.equal(sameTab.controls[0].dataset.state, 'running', 'reselecting the current design does not reset the app');
  assert.equal(sameTab.actions().length, beforeTab);
  console.log('PASS: live sync, one playback, input takeover, pause/resume, hidden tab, reduced motion, mobile and OS navigation');
})().catch(error => { console.error(error); process.exitCode = 1; });
