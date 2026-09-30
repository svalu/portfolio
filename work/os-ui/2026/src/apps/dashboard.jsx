function Dashboard({
  onOpen
}) {
  const w = useWorkspace(),
    [tab, setTab] = React.useState('운영 현황'),
    [detail, setDetail] = React.useState(false);
  const today = OPS_DAYS.at(-1);
  return <OpsLayout items={['운영 현황', '운영 보고서', '서비스 연결', '변경 기록']} active={tab} onSelect={setTab}>
 <OpsHeading title={tab === '운영 현황' ? `${w.profile}님, 오늘의 운영 현황이에요` : tab} sub="2026년 9월 30일 기준 · 컨택센터 운영 체험" />
 {tab === '운영 현황' && <><div className="kpi-grid"><OpsMetric label="오늘 들어온 상담" value={today.total.toLocaleString() + '건'} sub="채널별 유입 확인" onClick={() => onOpen('analytics')} /><OpsMetric label="응대율" value={(today.handled / today.total * 100).toFixed(1) + '%'} sub="상담 흐름 분석" onClick={() => onOpen('analytics')} /><OpsMetric label="활성 사용자" value={w.users.filter(u => u.status === '활성').length + '명'} sub="팀과 역할 관리" onClick={() => onOpen('users')} /><OpsMetric label="읽지 않은 메시지" value={w.messages.filter(m => m.box === 'inbox' && m.unread).length + '건'} sub="요청 확인하기" onClick={() => onOpen('messages')} /></div>
 <button className={'ops-alert ' + (w.resolved ? 'done' : '')} onClick={() => setDetail(true)}><span className="ops-status-dot" /><span><strong>{w.resolved ? '점심시간 지원 배치를 확인했어요' : '점심시간 전화 대기가 늘고 있어요'}</strong><small>{w.resolved ? '처리 내용이 변경 기록에 남았어요.' : '12–14시 집중 · 고객지원 2팀에서 2명 지원을 검토해 주세요.'}</small></span><b>확인 →</b></button>
 <div className="grid-2"><section className="panel"><div className="panel-h"><h2>최근 7일 상담 흐름</h2><button className="btn" onClick={() => onOpen('analytics')}>자세히 분석</button></div><OpsChart rows={OPS_DAYS.slice(-7)} /></section><section className="panel"><div className="panel-h"><h2>최근 운영 기록</h2></div><div className="ops-feed">{w.events.slice(0, 5).map((e, i) => <p key={i}><i />{e}</p>)}</div></section></div>
 <section className="panel ops-bottom"><div className="panel-h"><h2>다음으로 할 일</h2></div><div className="ops-quick"><button onClick={() => onOpen('users')}>신규 상담사 역할 확인 <span>사용자 관리 →</span></button><button onClick={() => onOpen('files')}>팀 교육 자료 확인 <span>자료실 →</span></button><button onClick={() => onOpen('messages')}>지원 요청에 답장 <span>메시지 →</span></button></div></section></>}
 {tab === '운영 보고서' && <div className="ops-cards">{['일일 운영 요약', '채널별 상담 집계', '상담 품질 점검'].map((name, i) => <section className="panel ops-card" key={name}><span className="ops-eyebrow">운영 보고서 0{i + 1}</span><h2>{name}</h2><p>최근 7일 데이터를 확인하고 팀 회의에서 공유하세요.</p><button className="btn primary" onClick={() => {
          const header = i === 0 ? ['날짜', '전체', '응대', '미응대'] : i === 1 ? ['날짜', '전화', '채팅', '이메일'] : ['날짜', '평균 대기(초)', '평균 만족도'];
          const body = OPS_DAYS.slice(-7).map(r => i === 0 ? [r.date, r.total, r.handled, r.total - r.handled] : i === 1 ? [r.date, r.voice, r.chat, r.email] : [r.date, r.wait, r.rating]);
          opsCSV(name + '.csv', [header, ...body]);
          w.notify(name + ' 내려받기 요청');
        }}>CSV 내려받기</button></section>)}</div>}
 {tab === '서비스 연결' && <section className="panel ops-card"><h2>업무 채널 연결</h2><p>체험 화면의 연결 상태예요. 실제 서비스 설정은 변경되지 않아요.</p>{Object.entries(w.links).map(([name, on]) => <label className="ops-setting" key={name}><span><strong>{name}</strong><small>{on ? '데모 연결 사용 중' : '데모 연결 꺼짐'}</small></span><input type="checkbox" checked={on} onChange={() => {
          w.setLinks(s => ({
            ...s,
            [name]: !on
          }));
          w.notify(name + (on ? ' 연결 해제' : ' 연결 사용'));
        }} /></label>)}</section>}
 {tab === '변경 기록' && <section className="panel ops-feed">{w.events.map((e, i) => <p key={i}><span className="ops-muted">{String(w.events.length - i).padStart(2, '0')}</span>{e}</p>)}</section>}
 {detail && <OpsModal title="점심시간 지원 배치" onClose={() => setDetail(false)}><p>12–14시 전화 문의 집중으로 평균 대기가 48초까지 늘어난 상황을 가정했어요.</p><div className="ops-callout">제안 · 고객지원 2팀의 교대 인원 2명을 배치하고, 다음 시간대 대기를 확인해요.</div><div className="ops-actions"><button className="btn" onClick={() => {
          setDetail(false);
          onOpen('messages');
        }}>요청 메시지 보기</button><button className="btn primary" disabled={w.resolved} onClick={() => {
          w.setResolved(true);
          w.notify('운영 매니저 · 점심시간 지원 2명 배치 확인');
          setDetail(false);
        }}>{w.resolved ? '처리 완료' : '배치 확인으로 처리'}</button></div></OpsModal>}
 </OpsLayout>;
}
Object.assign(window, {
  Dashboard
});
