function Messages() {
  const w = useWorkspace(),
    [tab, setTab] = React.useState('받은 메시지'),
    [selected, setSelected] = React.useState(null),
    [draft, setDraft] = React.useState(null),
    [q, setQ] = React.useState('');
  const box = {
    '받은 메시지': 'inbox',
    '보낸 메시지': 'sent',
    '보관함': 'archive'
  }[tab];
  const rows = w.messages.filter(m => m.box === box && (m.subject + m.from + m.body).includes(q));
  const current = w.messages.find(m => m.id === selected && m.box === box);
  return <OpsLayout items={['받은 메시지', '보낸 메시지', '보관함']} active={tab} onSelect={t => {
    setTab(t);
    setSelected(null);
  }}><OpsHeading title={tab} sub="업무 요청과 처리 내용을 한 흐름으로 이어가요."><button className="btn primary" onClick={() => setDraft({
        to: '',
        subject: '',
        body: ''
      })}>메시지 쓰기</button></OpsHeading><div className="ops-toolbar"><input aria-label="메시지 검색" placeholder="메시지 검색" value={q} onChange={e => setQ(e.target.value)} /></div><div className="ops-mail"><div className="ops-mail-list">{rows.map(m => <button key={m.id} className={selected === m.id ? 'selected' : ''} onClick={() => {
          setSelected(m.id);
          w.setMessages(s => s.map(x => x.id === m.id ? {
            ...x,
            unread: false
          } : x));
        }}><small>{m.from}{m.unread ? ' · 새 메시지' : ''}</small><strong>{m.subject}</strong><span>{m.body.slice(0, 60)}</span></button>)}{!rows.length && <OpsEmpty />}</div><section className="panel ops-mail-body">{current ? <><span className="ops-eyebrow">{current.box === 'sent' ? '보낸 메시지' : '업무 메시지'}</span><h2>{current.subject}</h2><p className="ops-muted">{current.from} → {current.to}</p><p className="ops-message-text">{current.body}</p><div className="ops-actions"><button className="btn primary" onClick={() => setDraft({
              to: current.box === 'sent' ? current.to : current.from,
              subject: '답장: ' + current.subject,
              body: ''
            })}>답장</button><button className="btn" onClick={() => {
              w.setMessages(s => s.map(m => m.id === current.id ? {
                ...m,
                box: box === 'archive' ? m.previousBox || 'inbox' : 'archive',
                previousBox: box === 'archive' ? undefined : m.box
              } : m));
              w.notify(box === 'archive' ? '원래 메시지함으로 이동' : '메시지 보관 완료');
              setSelected(null);
            }}>{box === 'archive' ? '원래 메시지함으로 이동' : '보관'}</button></div></> : <OpsEmpty>메시지를 선택하면 내용을 볼 수 있어요.</OpsEmpty>}</section></div>
 {draft && <OpsModal title="메시지 작성" onClose={() => setDraft(null)}><form className="ops-form" onSubmit={e => {
        e.preventDefault();
        if (!draft.body.trim()) return;
        const id = Date.now();
        w.setMessages(s => [{
          ...draft,
          id,
          from: w.profile,
          box: 'sent',
          unread: false
        }, ...s]);
        w.notify('데모 메시지를 보낸함에 저장했어요. 실제 전송은 하지 않아요.');
        setDraft(null);
        setTab('보낸 메시지');
        setSelected(id);
        setQ('');
      }}><label>받는 사람<input required value={draft.to} onChange={e => setDraft({
            ...draft,
            to: e.target.value
          })} /></label><label>제목<input required value={draft.subject} onChange={e => setDraft({
            ...draft,
            subject: e.target.value
          })} /></label><label>내용<textarea required rows={7} value={draft.body} onChange={e => setDraft({
            ...draft,
            body: e.target.value
          })} /></label><p className="ops-muted">보내기는 체험용이에요. 외부 메일이나 메시지는 전송하지 않아요.</p><button className="btn primary" type="submit">데모 보내기</button></form></OpsModal>}</OpsLayout>;
}
Object.assign(window, {
  Messages
});
