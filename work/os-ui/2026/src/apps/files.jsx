function Files() {
  const w = useWorkspace(),
    [tab, setTab] = React.useState('전체 자료'),
    [q, setQ] = React.useState(''),
    [file, setFile] = React.useState(null),
    [creating, setCreating] = React.useState(false),
    [name, setName] = React.useState(''),
    [body, setBody] = React.useState('');
  const rows = w.files.filter(f => (tab === '휴지통' ? f.trash : !f.trash) && (tab !== '즐겨찾기' || f.star) && f.name.includes(q));
  const update = (id, patch) => {
    w.setFiles(s => s.map(f => f.id === id ? {
      ...f,
      ...patch
    } : f));
    setFile(f => f && f.id === id ? {
      ...f,
      ...patch
    } : f);
  };
  return <OpsLayout items={['전체 자료', '즐겨찾기', '휴지통']} active={tab} onSelect={setTab}><OpsHeading title={tab} sub="운영 보고서와 팀의 업무 기준을 함께 관리해요."><button className="btn primary" onClick={() => {
        setName('');
        setBody('');
        setCreating(true);
      }}>문서 만들기</button></OpsHeading><div className="ops-toolbar"><input aria-label="자료 검색" placeholder="파일 이름 검색" value={q} onChange={e => setQ(e.target.value)} /><span>{rows.length}개</span></div><div className="ops-cards">{rows.map(f => <article className="panel ops-file" key={f.id}><button className="ops-file-open" onClick={() => setFile(f)}><span className="ops-file-icon">{f.name.endsWith('.csv') ? 'CSV' : '문서'}</span><strong>{f.name}</strong><small>{f.content.length.toLocaleString()}자 · 운영관리</small></button><div className="ops-actions">{!f.trash && <button className="btn" aria-label={f.name + ' 즐겨찾기'} aria-pressed={!!f.star} onClick={() => update(f.id, {
            star: !f.star
          })}>{f.star ? '★ 즐겨찾기' : '☆ 즐겨찾기'}</button>}<button className="btn" onClick={() => {
            update(f.id, {
              trash: !f.trash
            });
            w.notify(f.name + (f.trash ? ' 복원' : ' 휴지통으로 이동'));
          }}>{f.trash ? '복원' : '휴지통'}</button></div></article>)}</div>{!rows.length && <OpsEmpty />}
 {file && <OpsModal title={file.name} onClose={() => setFile(null)}><pre className="ops-document">{file.content}</pre><button className="btn primary" onClick={() => opsDownload(file.name, file.content)}>파일 내려받기</button></OpsModal>}
 {creating && <OpsModal title="새 문서" onClose={() => setCreating(false)}><form className="ops-form" onSubmit={e => {
        e.preventDefault();
        if (!name.trim() || !body.trim()) return;
        w.setFiles(s => [{
          id: Date.now(),
          name: name.replace(/\.md$/, '') + '.md',
          content: body
        }, ...s]);
        w.notify(name + ' 문서 저장');
        setCreating(false);
        setTab('전체 자료');
        setQ('');
      }}><label>문서 이름<input required maxLength={70} value={name} onChange={e => setName(e.target.value)} /></label><label>내용<textarea required rows={8} value={body} onChange={e => setBody(e.target.value)} /></label><button className="btn primary" type="submit">문서 저장</button></form></OpsModal>}</OpsLayout>;
}
Object.assign(window, {
  Files
});
