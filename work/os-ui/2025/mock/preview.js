(() => {
  const p = window.PortfolioPreview;
  if (!p) return;
  const login = /\/screens\/login\.html$/.test(location.pathname);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shown = node => node && !node.classList.contains('display_none');
  async function open(name, signal) {
    const icon = await p.wait(() => document.querySelector(`.bg_icon_wrap[menuName="${name}"]`)?._dragCleanup && document.querySelector(`.bg_icon_wrap[menuName="${name}"]`), signal);
    icon.click();
    const host = await p.wait(() => document.getElementById(icon.getAttribute('menuId')), signal);
    await p.wait(() => host._dragCleanup && host.querySelector('iframe')?.contentDocument?.readyState === 'complete', signal);
    return host;
  }
  // Move the actual window. Interruption leaves it at its current position.
  function move(host, target, signal) {
    const box=host.getBoundingClientRect(), start=performance.now(), duration=reduced()?0:1100;
    host.style.position='absolute';
    host.classList.add('demo-window-moving');p.focus(host);
    return new Promise((resolve,reject)=>{
      let raf;
      const finish=error=>{cancelAnimationFrame(raf);signal.removeEventListener('abort',cancel);host.classList.remove('demo-window-moving');error?reject(error):resolve();};
      const cancel=()=>finish(new DOMException('Preview stopped','AbortError'));
      const tick=now=>{
        if(signal.aborted)return cancel();
        const t=duration?Math.min(1,(now-start)/duration):1, eased=1-Math.pow(1-t,3);
        host.style.left=(box.left+(target.x-box.left)*eased)+'px';
        host.style.top=(box.top+(target.y-box.top)*eased)+'px';
        const available=Math.max(180,innerHeight-host.getBoundingClientRect().top-16);
        host.style.maxHeight=available+'px';host.querySelector('iframe').style.maxHeight=available+'px';
        t<1?raf=requestAnimationFrame(tick):finish();
      };
      signal.addEventListener('abort',cancel,{once:true});tick(start);
    });
  }
  async function errorWindow(signal) {
    await p.wait(()=>window.CounselingDemo,signal);
    const host=CounselingDemo.openError()[0];
    await p.wait(()=>host._dragCleanup && host.querySelector('iframe')?.contentWindow?.CounselingGame,signal);
    return host;
  }
  // Scroll the real chart pane; stop exactly where a visitor takes over.
  async function scrollPerformance(host, chartId, signal) {
    const child=host.querySelector('iframe').contentWindow, doc=child.document;
    const pane=doc.querySelector('.workspace.performance');
    let target=0;
    if(chartId){
      const canvas=await p.wait(()=>{
        const node=doc.getElementById(chartId), chart=child.Chart?.getChart(node);
        return chart?.data.datasets.some(series=>series.data.some(value=>Number(value)>0)) && node;
      },signal);
      const heading=chartId==='monthlyCountChart'?canvas.closest('.workspace_sub'):canvas.parentElement;
      target=pane.scrollTop+heading.getBoundingClientRect().top-pane.getBoundingClientRect().top-12;
    }
    target=Math.max(0,Math.min(target,pane.scrollHeight-pane.clientHeight));
    const from=pane.scrollTop, start=performance.now(), duration=reduced()||Math.abs(from-target)<1?0:1100;
    await new Promise((resolve,reject)=>{
      let raf;
      const finish=error=>{cancelAnimationFrame(raf);signal.removeEventListener('abort',cancel);error?reject(error):resolve();};
      const cancel=()=>finish(new DOMException('Preview stopped','AbortError'));
      const tick=now=>{
        if(signal.aborted)return cancel();
        const t=duration?Math.min(1,(now-start)/duration):1, eased=t*t*(3-2*t);
        pane.scrollTop=from+(target-from)*eased;
        t<1?raf=requestAnimationFrame(tick):finish();
      };
      signal.addEventListener('abort',cancel,{once:true});tick(start);
    });
  }
  p.register({
    stage: login ? 'counseling-login' : 'counseling-desktop',
    async run(action, signal) {
      if (action === 'arrival') { p.focus(document.querySelector('.login_wrap')); return; }
      if (action === 'password-find') {
        await p.wait(()=>document.getElementById('userId').value==='demo',signal);
        if(!shown(document.getElementById('findPwUserInfoPop')))openPwFindPop();
        p.focus(document.getElementById('findPwUserInfoPop'));return;
      }
      if (action === 'password-mail') {
        // A paused scene rejoins the same mock send rather than sending twice.
        if(!document.body.dataset.previewMail){
          document.body.dataset.previewMail='sending';
          sendEmailForTempPw();
        }
        await p.wait(()=>shown(document.getElementById('textPopup')),signal);
        document.body.dataset.previewMail='done';
        p.focus(document.getElementById('textPopup'));return;
      }
      if (action === 'login') {
        if(shown(document.getElementById('textPopup')))document.getElementById('findPwAlertCloseBtn').click();
        document.getElementById('findPwUserInfoPop').classList.add('display_none');
        loginProc();return {navigation:true};
      }
      if(action==='dashboard'){p.focus(await open('대시보드',signal));return;}
      if(action==='performance'){
        const host=await open('전체 실적',signal), doc=host.querySelector('iframe').contentDocument;
        await p.wait(()=>parseInt(doc.getElementById('totalCnslCnt')?.textContent.replace(/,/g,''))>0,signal);
        await scrollPerformance(host,null,signal);
        p.focus(host);return;
      }
      if(action==='performance-trend'||action==='performance-quality'){
        const host=await open('전체 실적',signal);p.focus(host);
        await scrollPerformance(host,action==='performance-trend'?'monthlyCountChart':'monthlyAvgHourChart',signal);return;
      }
      if(action==='arrange'){
        await scrollPerformance(await open('전체 실적',signal),null,signal);
        const dashboard=await open('대시보드',signal);
        await move(dashboard,{x:24,y:100},signal);
        const performance=await open('전체 실적',signal), box=performance.getBoundingClientRect();
        await move(performance,{x:Math.max(24,Math.min(innerWidth*.28,innerWidth-box.width-24)),y:Math.min(230,innerHeight*.24)},signal);
        return;
      }
      if(action==='error'){p.focus(await errorWindow(signal));return;}
      if(action==='game'){
        const host=await errorWindow(signal);p.focus(host);
        await host.querySelector('iframe').contentWindow.CounselingGame.demo(signal,3600);return;
      }
      if(action==='return'){
        document.querySelector('#demo-error [data-action="close"]')?.click();
        p.focus(await open('전체 실적',signal));return;
      }
      throw new Error('Unknown counseling scene');
    }
  });
})();
