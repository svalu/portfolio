(() => {
  const api=window.CounselingGame;
  const start=document.getElementById('game-start'),jump=document.getElementById('game-jump'),pause=document.getElementById('game-pause');
  const status=document.getElementById('game-status');
  function render(){
    const state=api.state;
    document.body.dataset.gameState=state;
    document.querySelector('.error-game').hidden=state==='idle';
    document.body.classList.toggle('game-playing',state!=='idle');
    start.textContent=state==='idle'?'잠깐 게임하기':'다시 시작';
    jump.hidden=state==='idle'||state==='over';pause.hidden=state==='idle'||state==='over';
    pause.textContent=state==='paused'?'이어하기':'멈춤';
    document.getElementById('game-help').hidden=state==='idle';
    status.textContent=state==='idle'?'페이지는 잃어도, 하던 작업은 남아 있습니다.':state==='paused'?'잠깐 멈췄어요. 이어하기를 누르면 계속됩니다.':state==='over'?`이번 기록은 ${game.score}점. 다시 한 번 뛰어볼까요?`:'장애물을 넘으며 잠깐 쉬어 가세요.';
  }
  function leave(){
    api.stop();
    if(parent!==window && window.frameElement?.closest('[name="iframeWindow"]')){
      window.frameElement.closest('[name="iframeWindow"]').querySelector('[data-action="close"]').click();
    }else location.href='../index.html';
  }
  start.onclick=()=>{api.start();document.getElementById('game').focus({preventScroll:true});};
  jump.onclick=()=>{if(api.state==='paused')api.resume();api.jump();};
  let pauseFrom;
  const remember=event=>{if(event.target.closest('#game-pause'))pauseFrom=api.state;};
  document.addEventListener('pointerdown',remember,true);document.addEventListener('keydown',remember,true);
  pause.onclick=()=>{(pauseFrom||api.state)==='running'?api.pause():api.resume();pauseFrom=null;};
  document.getElementById('error-return').onclick=leave;document.querySelector('.error_exit').onclick=leave;
  document.getElementById('game').addEventListener('pointerdown',event=>{event.preventDefault();if(api.state==='paused')api.resume();api.jump();});
  document.addEventListener('keydown',event=>{
    if(event.target.closest('input,textarea,select,button,a'))return;
    if(event.ctrlKey&&event.key==='Enter'){event.preventDefault();api.start();}
    else if(event.key===' '||event.key==='ArrowUp'){event.preventDefault();if(api.state==='idle'||api.state==='over')api.start();api.jump();}
  });
  document.addEventListener('game-state',render);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)api.pause();});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)api.pause();},{threshold:0}).observe(document.getElementById('game'));
  window.addEventListener('pagehide',()=>api.stop());render();
})();
