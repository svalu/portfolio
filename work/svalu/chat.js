(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const endpoint = local ? 'http://127.0.0.1:5501' : null;
  let documents = [], history = [], ready = false, controller = null, generation = 0;
  let busy = false, following = true, avatarState = 'idle';
  const thread = $('thread'), question = $('question');
  const status = message => { $('answerStatus').textContent = message; };
  function scrollLatest() { if (following) thread.scrollTop = thread.scrollHeight; }
  thread.addEventListener('scroll', () => {
    following = thread.scrollHeight - thread.clientHeight - thread.scrollTop < 70;
    $('latest').hidden = following;
  }, {passive:true});
  $('latest').onclick = () => { following = true; scrollLatest(); $('latest').hidden = true; };
  function setBusy(value) {
    busy = value; $('send').hidden = value; $('stop').hidden = !value;
    $('suggestions').querySelectorAll('button').forEach(b => b.disabled = value);
    avatarState = value ? 'thinking' : 'idle';
  }
  function addMessage(role, text = '') {
    const article = document.createElement('article'); article.className = 'message ' + role;
    const label = document.createElement('span'); label.className = 'speaker';
    label.textContent = role === 'user' ? 'YOU' : 'HER · AI';
    const body = document.createElement('p'); body.className = 'text'; body.textContent = text;
    article.append(label, body); thread.append(article); scrollLatest(); return {article, body, label};
  }
  async function showRecord(doc) {
    $('recordTitle').textContent = doc.title;
    $('recordBody').textContent = doc.text.replace(/^# .+\n+/, '');
    $('recordDialog').showModal();
  }
  function addSources(message, sources) {
    const panel = document.createElement('div'); panel.className = 'sources';
    const caption = document.createElement('span'); caption.className = 'sources-label'; caption.textContent = '참고한 공개 기록'; panel.append(caption);
    sources.forEach(source => {
      const doc = documents.find(d => d.id === source.id); if (!doc) return;
      const button = document.createElement('button'); button.type = 'button'; button.textContent = doc.title + ' ↗';
      button.onclick = () => showRecord(doc); panel.append(button);
    });
    if (panel.children.length > 1) message.article.append(panel);
  }
  function selectDocuments(text) {
    const query = text.toLowerCase();
    const ranked = documents.map(d => ({doc:d,score:d.keywords.reduce((n,k)=>n+(query.includes(k.toLowerCase())?k.length+5:0),0)})).sort((a,b)=>b.score-a.score);
    return ranked[0]?.score ? ranked.filter(d=>d.score).slice(0,2).map(d=>d.doc) : [];
  }
  async function checkConnection() {
    if (!endpoint) return;
    try {
      const response = await fetch(endpoint + '/health', {signal:AbortSignal.timeout(5000), cache:'no-store'});
      if (!response.ok) throw new Error('unavailable');
      ready = (await response.json()).ready === true;
    } catch { ready = false; }
    $('connection').textContent = ready ? '로컬 AI와 연결되어 있어' : '지금은 공개 기록을 둘러볼 수 있어';
    $('mode').textContent = ready ? '실제 AI 대화 · 실험' : '공개 기록 둘러보기';
  }
  async function submit(text) {
    text = text.trim(); if (!text || busy || text.length > 1200) return;
    const token = ++generation; following = true; question.value = ''; question.style.height = '';
    addMessage('user', text); setBusy(true); status('관련 기록을 읽고 있어…');
    const answer = addMessage('assistant', ''); answer.article.classList.add('pending');
    let output = '', complete = false, received = false;
    controller = new AbortController();
    const timeout = setTimeout(() => controller?.abort(), 90000);
    try {
      await knowledgeReady; if (token !== generation) return;
      await checkConnection(); if (token !== generation) return;
      if (!ready) {
        const docs = selectDocuments(text);
        answer.label.textContent = '공개 기록 · 발췌';
        output = docs.length ? docs.map(d=>d.text.replace(/^# .+\n+/, '').trim()).join('\n\n') : '이 질문에 맞는 공개 기록을 찾지 못했어. 디자인, OS UI, AI 협업이나 Her 이야기를 골라볼래?';
        answer.body.textContent = output; addSources(answer, docs);
        status('지금 답변은 AI가 생성한 말이 아니라 공개 기록의 발췌야.');
        return;
      }
      const response = await fetch(endpoint + '/chat', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:text,history:history.slice(-6)}),signal:controller.signal});
      if (!response.ok) { const error = await response.json(); throw new Error(error.error || '답변을 연결하지 못했어.'); }
      const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '';
      function event(line) {
        if (!line.trim() || token !== generation) return;
        const data = JSON.parse(line);
        if (data.type === 'sources') addSources(answer, data.sources);
        if (data.type === 'token') {
          received = true; output += data.text; answer.body.textContent = output;
          answer.article.classList.remove('pending'); avatarState = 'speaking'; status('답하고 있어…'); scrollLatest();
        }
        if (data.type === 'done') { complete = true; status(data.truncated ? '답변 길이를 여기서 줄였어. 이어서 물어볼 수 있어.' : ''); }
        if (data.type === 'error') throw new Error(data.error);
      }
      while (true) {
        const {value,done} = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), {stream:!done});
        const lines = buffer.split('\n'); buffer = lines.pop(); lines.forEach(event);
        if (done) { if (buffer.trim()) event(buffer); break; }
      }
      if (!complete || !received) throw new Error('답변이 끝까지 도착하지 않았어. 다시 물어볼 수 있어.');
      history.push({role:'user',content:text},{role:'assistant',content:output.slice(0,2000)}); history = history.slice(-6);
    } catch (error) {
      if (token !== generation) return;
      const note = error.name === 'AbortError' ? '답변을 멈췄어. 질문을 수정하거나 다시 보낼 수 있어.' : error.message;
      status(note); if (!output) answer.body.textContent = note;
      const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'retry'; retry.textContent = '이 질문 다시 보내기 ↗'; retry.onclick = () => submit(text); answer.article.append(retry);
      question.value = text;
    } finally {
      clearTimeout(timeout);
      if (token === generation) { answer.article.classList.remove('pending'); setBusy(false); controller = null; scrollLatest(); }
    }
  }
  $('composer').onsubmit = event => { event.preventDefault(); submit(question.value); };
  question.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); if (!busy) submit(question.value); }
  });
  question.addEventListener('input', () => { question.style.height = 'auto'; question.style.height = Math.min(128,question.scrollHeight) + 'px'; });
  $('suggestions').querySelectorAll('button').forEach(b => b.onclick = () => submit(b.textContent));
  $('stop').onclick = () => controller?.abort();
  $('reset').onclick = () => {
    generation++; controller?.abort(); controller = null; history = []; thread.querySelectorAll('.message').forEach(n=>n.remove());
    question.value = ''; question.style.height = ''; status('새 이야기로 시작해 보자.'); setBusy(false); following = true; scrollLatest(); question.focus();
  };
  $('closeRecord').onclick = () => $('recordDialog').close();
  $('recordDialog').addEventListener('click', event => { if (event.target === $('recordDialog')) { const r=event.target.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) event.target.close(); } });
  $('memories').onclick = async () => {
    try {
      const response = await fetch('memory.html'); if (!response.ok) throw new Error();
      const doc = new DOMParser().parseFromString(await response.text(),'text/html');
      $('recordTitle').textContent = '지난 기억 14개 · 2026.07—09'; $('recordBody').replaceChildren();
      doc.querySelectorAll('.m[data-d]').forEach(n => { const entry=document.createElement('div');entry.className='memory-entry';const date=document.createElement('time');date.textContent=n.dataset.d;const p=document.createElement('span');p.textContent=n.textContent;entry.append(date,p);$('recordBody').append(entry); });
      $('recordDialog').showModal();
    } catch { status('기억을 불러오지 못했어. 잠시 뒤 다시 열어봐.'); }
  };
  async function init() {
    try {
      const response = await fetch('knowledge/index.json'); if (!response.ok) throw new Error();
      const manifest = await response.json();
      documents = await Promise.all(manifest.map(async d => {
        if (!/^[a-z-]+\.md$/.test(d.file)) throw new Error('invalid file');
        const r=await fetch('knowledge/'+d.file); if(!r.ok) throw new Error(); return {...d,text:await r.text()};
      }));
      if (!local) $('connection').textContent = '지금은 공개 기록을 둘러볼 수 있어';
      await checkConnection();
    } catch { $('connection').textContent = '기록 연결을 다시 확인해 줘';status('자료를 불러오지 못했어. 화면을 새로고침해 줘.'); }
  }
  const knowledgeReady = init();
  // Original procedural conversation object: no third-party character or private avatar asset.
  function initAvatar() {
    if (!window.THREE) return;
    const box=$('avatar'), T=window.THREE; let renderer;
    try { renderer=new T.WebGLRenderer({alpha:true,antialias:true}); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputEncoding=T.sRGBEncoding;
    box.append(renderer.domElement);box.classList.add('loaded');
    const scene=new T.Scene(), camera=new T.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.4,9);
    scene.add(new T.HemisphereLight(0xffeeee,0x192344,.9));
    const light=new T.DirectionalLight(0xffd9e4,1.3);light.position.set(-3,4,5);scene.add(light);
    const rim=new T.DirectionalLight(0x7f9bff,.7);rim.position.set(3,1,-2);scene.add(rim);
    const group=new T.Group();scene.add(group);
    const material=new T.MeshPhysicalMaterial({color:new T.Color(0xc0203a).convertSRGBToLinear(),roughness:.24,metalness:.12,clearcoat:.85,clearcoatRoughness:.12});
    const head=new T.Mesh(new T.SphereGeometry(.83,48,32),material);head.scale.set(1,.94,.88);group.add(head);
    const ring=new T.Mesh(new T.TorusGeometry(1.22,.018,12,80),new T.MeshBasicMaterial({color:0xff8a9f,transparent:true,opacity:.42}));ring.rotation.x=.5;ring.rotation.y=.2;group.add(ring);
    const eyeMaterial=new T.MeshBasicMaterial({color:0xffe9ed});const eyes=[];
    [-.27,.27].forEach(x=>{const eye=new T.Mesh(new T.SphereGeometry(.07,16,12),eyeMaterial);eye.position.set(x,.04,.80);eye.scale.set(.65,1.3,.3);head.add(eye);eyes.push(eye);});
    const sparkle=new T.Mesh(new T.OctahedronGeometry(.09),eyeMaterial);sparkle.position.set(.97,.77,0);group.add(sparkle);
    let visible=true;const reduced=matchMedia('(prefers-reduced-motion:reduce)');
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(box);
    new ResizeObserver(()=>{const w=box.clientWidth,h=box.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}}).observe(box);
    let time=0,last=performance.now();
    function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden)return;
      if(!reduced.matches)time+=dt;
      const thinking=avatarState==='thinking',speaking=avatarState==='speaking';
      group.position.y=reduced.matches?0:Math.sin(time*.8)*.10;
      head.rotation.y=reduced.matches?0:Math.sin(time*.5)*(thinking?.3:.10);
      head.rotation.z=reduced.matches?0:Math.sin(time*.7)*.045;
      ring.rotation.z=reduced.matches?0:time*(thinking?.4:.05);
      const scale=1+(speaking&&!reduced.matches?Math.sin(time*4)*.018:0);head.scale.set(scale,.94*scale,.88*scale);
      const blink=!reduced.matches&&time%5.7>5.53?.08:1.3;eyes.forEach(e=>e.scale.y=blink);
      light.position.x=-3+(reduced.matches?0:Math.sin(time*.3));renderer.render(scene,camera);
    }
    requestAnimationFrame(frame);
  }
  initAvatar();
})();
