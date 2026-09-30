function Analytics() {
  const [tab, setTab] = React.useState('상담 흐름'),
    [range, setRange] = React.useState('7'),
    [from, setFrom] = React.useState('2026-09-01'),
    [to, setTo] = React.useState('2026-09-30');
  const rows = range === 'custom' ? OPS_DAYS.filter(r => r.date >= from && r.date <= to) : OPS_DAYS.slice(-Number(range));
  const sum = k => rows.reduce((s, r) => s + r[k], 0),
    total = sum('total'),
    channels = [['전화', sum('voice'), '#1677e8'], ['채팅', sum('chat'), '#18b9c9'], ['이메일', sum('email'), '#9674e8']];
  const a = total ? channels[0][1] / total * 360 : 0,
    b = total ? (channels[0][1] + channels[1][1]) / total * 360 : 0;
  return <OpsLayout items={['상담 흐름', '채널 분석', '응대 품질']} active={tab} onSelect={setTab}><OpsHeading title={tab} sub="같은 기간의 유입·응대·만족도를 함께 살펴보세요."><button className="btn" disabled={!rows.length} onClick={() => opsCSV('상담 분석.csv', [['날짜', '전체', '전화', '채팅', '이메일', '응대', '대기(초)', '만족도'], ...rows.map(r => [r.date, r.total, r.voice, r.chat, r.email, r.handled, r.wait, r.rating])])}>CSV 내려받기</button></OpsHeading><div className="ops-toolbar"><select aria-label="분석 기간" value={range} onChange={e => setRange(e.target.value)}><option value="7">최근 7일</option><option value="28">최근 28일</option><option value="30">9월 전체</option><option value="custom">직접 선택</option></select>{range === 'custom' && <><input aria-label="시작일" type="date" value={from} onInput={e => setFrom(e.target.value)} /><span>–</span><input aria-label="종료일" type="date" value={to} onInput={e => setTo(e.target.value)} /></>}<span className="ops-muted">데모 데이터: 8월 2일–9월 30일</span></div>
 {!rows.length ? <OpsEmpty>선택한 기간에 데이터가 없어요. 시작일과 종료일을 확인해 주세요.</OpsEmpty> : <><div className="ops-summary"><div><small>상담 유입</small><strong>{total.toLocaleString()}건</strong></div><div><small>응대율</small><strong>{(sum('handled') / total * 100).toFixed(1)}%</strong></div><div><small>평균 만족도 · 일별 평균</small><strong>{(sum('rating') / rows.length).toFixed(2)} / 5</strong></div></div>
 {tab === '상담 흐름' && <section className="panel ops-card"><h2>언제 문의가 몰렸을까요?</h2><OpsChart rows={rows} /><p className="ops-muted">주말보다 평일 유입이 많아요. 일별 수치는 아래 표에서 확인할 수 있어요.</p></section>}
 {tab === '채널 분석' && <section className="panel ops-card"><h2>어떤 채널을 많이 이용했을까요?</h2><div className="ops-channel"><div className="ops-donut" role="img" aria-label={channels.map(([n, v]) => `${n} ${v}건`).join(', ')} style={{
            background: `conic-gradient(#1677e8 0deg ${a}deg,#18b9c9 ${a}deg ${b}deg,#9674e8 ${b}deg 360deg)`
          }}><div><small>전체 상담</small><strong>{total.toLocaleString()}</strong></div></div><div>{channels.map(([n, v, c]) => <p className="ops-channel-row" key={n}><i style={{
                background: c
              }} />{n}<strong>{v.toLocaleString()}건</strong><span>{(v / total * 100).toFixed(1)}%</span></p>)}</div></div></section>}
 {tab === '응대 품질' && <section className="panel ops-card"><h2>기다림을 줄이고, 해결을 명확하게</h2><div className="ops-summary"><div><small>평균 대기 · 일별 평균</small><strong>{Math.round(sum('wait') / rows.length)}초</strong></div><div><small>응대한 상담</small><strong>{sum('handled').toLocaleString()}건</strong></div><div><small>미응대</small><strong>{(total - sum('handled')).toLocaleString()}건</strong></div></div><p>품질 점검에서는 해결 방법의 명확성과 추가 문의 확인 여부를 함께 봐요. 팀 교육 자료는 자료실에서 확인할 수 있어요.</p></section>}
 <section className="panel ops-table ops-bottom"><table className="t"><caption>기간별 상세 수치</caption><thead><tr>{['날짜', '유입', '응대', '대기', '만족도'].map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>{[...rows].reverse().map(r => <tr key={r.date}><td>{r.date}</td><td>{r.total.toLocaleString()}건</td><td>{r.handled.toLocaleString()}건</td><td>{r.wait}초</td><td>{r.rating.toFixed(2)}</td></tr>)}</tbody></table></section></>}</OpsLayout>;
}
Object.assign(window, {
  Analytics
});
