function Settings({
  tweaks,
  setTweak
}) {
  const w = useWorkspace(),
    [tab, setTab] = React.useState('화면 설정'),
    [name, setName] = React.useState(w.profile);
  return <OpsLayout items={['화면 설정', '내 프로필', '체험 안내']} active={tab} onSelect={setTab}><OpsHeading title={tab} sub="내 작업 환경에 맞게 편안하게 조절하세요." />
 {tab === '화면 설정' && <><section className="panel ops-card"><h2>배경과 테마</h2><div className="ops-theme-grid">{[['bloom', '블룸', '#443cfa'], ['midnight', '미드나이트', '#112143'], ['dawn', '새벽', '#e0a6b3'], ['ocean', '바다', '#177caa'], ['graphite', '그라파이트', '#44454c']].map(([id, label, color]) => <button className={'ops-theme ' + (tweaks.theme === id ? 'selected' : '')} aria-pressed={tweaks.theme === id} key={id} onClick={() => setTweak('theme', id)}><span style={{
              background: color
            }} />{label}</button>)}</div><label className="ops-setting"><span>강조 색상</span><input aria-label="강조 색상" type="color" value={tweaks.accent} onChange={e => setTweak('accent', e.target.value)} /></label><label className="ops-setting">창 배경<select value={tweaks.windowStyle} onChange={e => setTweak('windowStyle', e.target.value)}><option value="mica">은은한 반투명</option><option value="solid">불투명</option><option value="glass">투명 유리</option></select></label><label className="ops-setting">시작 메뉴<select value={tweaks.startMenuLayout} onChange={e => setTweak('startMenuLayout', e.target.value)}><option value="grid">격자</option><option value="list">목록</option></select></label></section></>}
 {tab === '내 프로필' && <section className="panel ops-card"><form className="ops-form" onSubmit={e => {
        e.preventDefault();
        if (!name.trim()) return;
        w.setProfile(name.trim());
        w.notify('프로필 이름 변경');
      }}><label>표시 이름<input required maxLength={30} value={name} onChange={e => setName(e.target.value)} /></label><p>대시보드 인사와 메시지 발신자에 반영돼요.</p><button className="btn primary" type="submit">저장</button></form></section>}
 {tab === '체험 안내' && <section className="panel ops-card"><span className="ops-eyebrow">2026 · 관리자 OS</span><h2>상황을 보고, 판단하고, 조치하는 작업 공간</h2><p>여러 페이지를 오가는 대신 창을 나란히 놓고 상담 운영을 이어갈 수 있어요.</p><ul><li>사용자와 상담 수치는 모두 가상 데이터예요.</li><li>변경은 현재 페이지에서만 유지되며 새로고침하면 초기화돼요.</li><li>실제 메일 전송이나 외부 시스템 연결은 하지 않아요.</li><li>자료와 분석 결과는 파일로 내려받을 수 있어요.</li></ul></section>}</OpsLayout>;
}
Object.assign(window, {
  Settings
});
