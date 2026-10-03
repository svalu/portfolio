/* An interactive, memory-only copy of the three-question writing flow. */
(() => {
  const area = document.querySelector('main textarea');
  if (!area) return;
  const card = area.parentElement;
  const progress = card.previousElementSibling;
  const note = card.nextElementSibling;
  const questions = ['이번 주에 무슨 일을 하셨나요?', '다음 주에는 무엇을 할 예정인가요?', '도움이 필요하거나 공유할 일이 있나요?'];
  const hints = ['한 줄에 하나씩, 짧아도 괜찮아요.', '이어갈 일과 다음 행동을 적어 주세요.', '막힌 일이나 함께 결정할 것을 알려 주세요.'];
  const answers = ['', '', ''];
  let step = 0;
  const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render() {
    progress.innerHTML = `<div class="easy-progress" aria-label="세 질문 중 ${Math.min(step+1,3)}번째">${[0,1,2].map(i=>`<i class="${i<=step?'filled':''}"></i>`).join('')}</div><b>${Math.min(step + 1, 3)} / 3${step === 3 ? ' · 미리보기' : ''}</b>`;
    card.classList.add('easy-demo-card');
    card.innerHTML = step < 3 ? `<small>기타 업무 · ${step + 1}번째 질문</small><h2>${questions[step]}</h2><p>${hints[step]}</p><textarea aria-label="${questions[step]}" placeholder="한 줄씩 적어 주세요">${escape(answers[step])}</textarea><div class="easy-actions"><button type="button" data-prev ${step === 0 ? 'disabled' : ''}>← 이전</button><button type="button" data-next>${step === 2 ? '보고 미리보기 →' : '다음 →'}</button></div>` : `<small>세 답변이 하나의 보고가 됐어요</small><h2>이번 주 업무가 정리됐어요.</h2>${answers.map((a,i)=>`<section><h3>${['이번 주 한 일','다음 주 할 일','공유·도움 요청'][i]}</h3><p>${escape(a || '입력하지 않음').replace(/\n/g,'<br>')}</p></section>`).join('')}<div class="easy-actions"><button type="button" data-prev>← 수정하기</button><a href="home.html">이번 주로 돌아가기 →</a></div>`;
    card.querySelector('textarea')?.addEventListener('input', e => { answers[step] = e.target.value; });
    card.querySelector('[data-prev]').onclick = () => { if(step > 0) { step--; render(); } };
    card.querySelector('[data-next]')?.addEventListener('click', () => { step++; render(); });
    note.textContent = '체험용 작성 · 이 화면에서만 유지돼요. 서버로 저장하거나 전송하지 않습니다.';
  }
  window.WeeklyEasy = { go(n) { step = n; render(); }, answer(value) { if(step < 3) { answers[step] = value; card.querySelector('textarea').value = value; } }, card };
  render();
})();
