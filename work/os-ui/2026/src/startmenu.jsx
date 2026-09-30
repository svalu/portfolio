function StartMenu({
  layout,
  onOpen,
  onClose
}) {
  const [q, setQ] = React.useState('');
  const w = useWorkspace();
  const open = id => {
    onOpen(id);
    onClose();
  };
  const apps = APPS.filter(a => a.label.includes(q));
  return <div className="startmenu" onClick={e => e.stopPropagation()}><div className="sm-search"><input aria-label="앱 검색" autoFocus placeholder="앱 이름 검색" value={q} onChange={e => setQ(e.target.value)} /></div><div className="sm-section-label">내 작업 공간</div><div className={'sm-pinned layout-' + layout}>{apps.map(a => <button className="sm-app" key={a.id} onClick={() => open(a.id)}><AppIcon id={a.id} size={32} /><span className="sm-app-label">{a.label}</span></button>)}</div>{!apps.length && <OpsEmpty>검색한 앱이 없어요.</OpsEmpty>}<div className="sm-section-label">공유 자료</div><div className="sm-recent">{w.files.filter(f => !f.trash).slice(0, 4).map(f => <button className="sm-recent-item" key={f.id} onClick={() => open('files')}><span className="sm-recent-thumb">문서</span><span>{f.name}</span></button>)}</div><div className="sm-footer"><span>{w.profile}</span><button className="btn" onClick={() => open('settings')}>프로필과 설정</button></div></div>;
}
Object.assign(window, {
  StartMenu
});
