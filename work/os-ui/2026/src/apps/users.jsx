function Users() {
  const w = useWorkspace(),
    [tab, setTab] = React.useState('전체 사용자'),
    [q, setQ] = React.useState(''),
    [team, setTeam] = React.useState('전체'),
    [edit, setEdit] = React.useState(null),
    [error, setError] = React.useState('');
  const rows = w.users.filter(u => (tab !== '초대 대기' || u.status === '초대 대기') && (team === '전체' || u.team === team) && (u.name + u.email).includes(q));
  const save = e => {
    e.preventDefault();
    const candidate = { ...edit, name: edit.name.trim(), email: edit.email.trim() };
    if (!candidate.name) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (w.users.some(u => u.email.toLowerCase() === candidate.email.toLowerCase() && u.id !== candidate.id)) {
      setError('이미 등록된 이메일이에요.');
      return;
    }
    w.setUsers(s => candidate.id ? s.map(u => u.id === candidate.id ? candidate : u) : [...s, {
      ...candidate,
      id: Date.now()
    }]);
    w.notify(candidate.name + (candidate.id ? ' · 사용자 정보 변경' : ' · 데모 초대 등록 (메일 미전송)'));
    setEdit(null);
  };
  return <OpsLayout items={['전체 사용자', '초대 대기', '역할 안내']} active={tab} onSelect={setTab}><OpsHeading title={tab} sub="팀과 역할을 한곳에서 확인하고 관리해요."><button className="btn" onClick={() => opsCSV('사용자 목록.csv', [['이름', '이메일', '팀', '역할', '상태'], ...rows.map(u => [u.name, u.email, u.team, u.role, u.status])])}>CSV 내려받기</button><button className="btn primary" onClick={() => {
        setError('');
        setEdit({
          name: '',
          email: '',
          team: '고객지원 1팀',
          role: '상담사',
          status: '초대 대기'
        });
      }}>사용자 초대</button></OpsHeading>
 {tab === '역할 안내' ? <div className="ops-cards">{[['관리자', '사용자·팀·역할 관리와 모든 운영 정보 확인'], ['매니저', '팀 실적 확인, 품질 점검과 운영 요청 처리'], ['상담사', '배정된 상담과 공유 자료 확인']].map(([name, desc]) => <section className="panel ops-card" key={name}><h2>{name}</h2><p>{desc}</p><strong>{w.users.filter(u => u.role === name).length}명</strong></section>)}</div> : <><div className="ops-toolbar"><input aria-label="사용자 검색" placeholder="이름 또는 이메일 검색" value={q} onChange={e => setQ(e.target.value)} /><select aria-label="팀 필터" value={team} onChange={e => setTeam(e.target.value)}>{['전체', '고객지원 1팀', '고객지원 2팀', '운영관리'].map(t => <option key={t}>{t}</option>)}</select><span>{rows.length}명</span></div><div className="panel ops-table"><table className="t"><thead><tr>{['사용자', '소속 팀', '역할', '상태', '관리'].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(u => <tr key={u.id}><td><strong>{u.name}</strong><small className="ops-block">{u.email}</small></td><td>{u.team}</td><td>{u.role}</td><td><span className="ops-pill">{u.status}</span></td><td><button className="btn" aria-label={u.name + ' 정보 수정'} onClick={() => {
                  setError('');
                  setEdit({
                    ...u
                  });
                }}>수정</button></td></tr>)}</tbody></table>{!rows.length && <OpsEmpty>조건에 맞는 사용자가 없어요.</OpsEmpty>}</div></>}
 {edit && <OpsModal title={edit.id ? '사용자 정보 수정' : '사용자 초대'} onClose={() => setEdit(null)}><form className="ops-form" onSubmit={save}><label>이름<input required maxLength={30} value={edit.name} onChange={e => setEdit({
            ...edit,
            name: e.target.value
          })} /></label><label>이메일<input required type="email" value={edit.email} onChange={e => setEdit({
            ...edit,
            email: e.target.value
          })} /></label>{[['team', '소속 팀', ['고객지원 1팀', '고객지원 2팀', '운영관리']], ['role', '역할', ['관리자', '매니저', '상담사']], ['status', '상태', ['초대 대기', '활성', '비활성']]].map(([key, label, options]) => <label key={key}>{label}<select value={edit[key]} onChange={e => setEdit({
            ...edit,
            [key]: e.target.value
          })}>{options.map(x => <option key={x}>{x}</option>)}</select></label>)}{error && <p role="alert">{error}</p>}<p className="ops-muted">체험용 변경이며 실제 초대 메일은 보내지 않아요.</p><button className="btn primary" type="submit">{edit.id ? '변경 저장' : '데모 초대 등록'}</button></form></OpsModal>}</OpsLayout>;
}
Object.assign(window, {
  Users
});
