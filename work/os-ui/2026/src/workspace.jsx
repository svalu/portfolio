/* Shared, session-only demo state. No mail or company API is contacted. */
const WorkspaceContext = React.createContext(null);
const OPS_DAYS = Array.from({
  length: 60
}, (_, i) => {
  const date = new Date(2026, 8, 30 - 59 + i);
  const weekend = [0, 6].includes(date.getDay());
  const total = Math.round((weekend ? 380 : 1180) + Math.sin(i * 1.7) * 110 + i * 3);
  const voice = Math.round(total * .61),
    chat = Math.round(total * .29);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    total,
    voice,
    chat,
    email: total - voice - chat,
    handled: Math.round(total * .963),
    wait: Math.round(24 + Math.sin(i) * 8),
    rating: +(4.5 + Math.sin(i) * .18).toFixed(2)
  };
});
const OPS_USERS = ['김서연', '이도윤', '박지우', '최하린', '정민준', '강수빈', '윤지호', '한유진'].map((name, i) => ({
  id: i + 1,
  name,
  email: `member${i + 1}@example.com`,
  team: ['고객지원 1팀', '고객지원 2팀', '운영관리'][i % 3],
  role: i === 0 ? '관리자' : i === 2 ? '매니저' : '상담사',
  status: i === 7 ? '초대 대기' : '활성'
}));
const OPS_FILES = [{
  id: 1,
  name: '9월 운영 보고서.md',
  content: '# 9월 운영 보고서\n\n평일 12–14시 문의 집중을 확인했습니다.\n\n조치: 점심시간 교대 인원 2명 추가 배치\n담당: 운영관리\n후속 확인: 10월 첫째 주 평균 대기시간 비교',
  star: true
}, {
  id: 2,
  name: '상담 품질 체크리스트.md',
  content: '# 상담 품질 체크리스트\n\n1. 고객 상황을 먼저 확인한다.\n2. 해결 방법을 짧고 구체적으로 안내한다.\n3. 추가 문의 여부를 확인한다.\n4. 처리 내용을 다음 담당자가 이해할 수 있게 남긴다.'
}, {
  id: 3,
  name: '시간대별 인력 배치.csv',
  content: '시간대,고객지원 1팀,고객지원 2팀\n09–12시,12,10\n12–14시,14,12\n14–18시,12,11'
}];
const OPS_MESSAGES = [{
  id: 1,
  from: '김서연',
  to: '운영관리',
  subject: '점심시간 대기 증가 · 교대 인원 조정',
  body: '12시부터 14시까지 전화 문의가 집중되고 있어요. 고객지원 2팀에서 2명을 지원할 수 있을까요? 분석 화면의 채널별 유입을 확인한 뒤 회신 부탁드려요.',
  box: 'inbox',
  unread: true
}, {
  id: 2,
  from: '박지우',
  to: '운영관리',
  subject: '9월 상담 품질 점검을 마쳤어요',
  body: '해결 방법을 단계별로 안내한 상담의 만족도가 높았어요. 자료실에 상담 품질 체크리스트를 올렸습니다. 다음 주 팀 교육에 활용해 주세요.',
  box: 'inbox',
  unread: true
}, {
  id: 3,
  from: '이도윤',
  to: '운영관리',
  subject: '신규 상담사 계정 확인 요청',
  body: '한유진 상담사의 초대가 대기 상태예요. 사용자 관리에서 팀과 역할을 확인해 주세요.',
  box: 'inbox',
  unread: false
}];
function WorkspaceProvider({
  children
}) {
  const [users, setUsers] = React.useState(OPS_USERS),
    [files, setFiles] = React.useState(OPS_FILES),
    [messages, setMessages] = React.useState(OPS_MESSAGES);
  const [events, setEvents] = React.useState(['김서연 · 9월 운영 보고서 등록', '박지우 · 상담 품질 점검 완료', '운영관리 · 신규 상담사 초대']);
  const [resolved, setResolved] = React.useState(false),
    [notice, setNotice] = React.useState(''),
    [readNotices, setReadNotices] = React.useState(false);
  const [links, setLinks] = React.useState({
    '상담 이력': true,
    '채팅 상담': true,
    '예약 알림': false
  });
  const [profile, setProfile] = React.useState('운영 매니저');
  const notify = text => {
    setNotice(text);
    setEvents(e => [text, ...e].slice(0, 30));
    setReadNotices(false);
  };
  React.useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  return <WorkspaceContext.Provider value={{
    links,
    setLinks,
    users,
    setUsers,
    files,
    setFiles,
    messages,
    setMessages,
    events,
    notify,
    resolved,
    setResolved,
    profile,
    setProfile,
    readNotices,
    setReadNotices
  }}>{children}<div className={'ops-toast ' + (notice ? 'visible' : '')} role="status">{notice}</div></WorkspaceContext.Provider>;
}
function useWorkspace() {
  return React.useContext(WorkspaceContext);
}
function opsDownload(name, content, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['\uFEFF', content], {
    type
  }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function opsCSV(name, rows) {
  opsDownload(name, rows.map(row => row.map(v => '"' + String(v).replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"').join(',')).join('\r\n'), 'text/csv;charset=utf-8');
}
function OpsLayout({
  items,
  active,
  onSelect,
  children
}) {
  return <div className="app-shell ops-shell"><nav className="app-side" aria-label="앱 메뉴"><div className="app-side-title">운영 워크스페이스</div>{items.map(item => <button key={item} className={'ops-nav ' + (active === item ? 'sel' : '')} aria-current={active === item ? 'page' : undefined} onClick={() => onSelect(item)}>{item}</button>)}<p className="ops-demo">체험용 가상 데이터<br />변경은 새로고침 전까지 유지돼요.</p></nav><main className="app-main">{children}</main></div>;
}
function OpsHeading({
  title,
  sub,
  children
}) {
  return <header className="ops-heading"><div><h1 className="app-h1">{title}</h1><p className="app-sub">{sub}</p></div><div className="ops-actions">{children}</div></header>;
}
function OpsEmpty({
  children
}) {
  return <div className="ops-empty">{children || '표시할 항목이 없어요.'}</div>;
}
function OpsMetric({
  label,
  value,
  sub,
  onClick
}) {
  return <button className="kpi ops-metric" onClick={onClick}><span className="ops-muted">{label}</span><strong>{value}</strong><small>{sub} →</small></button>;
}
function OpsModal({
  title,
  onClose,
  children
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector('button,input,select,textarea')?.focus();
    return () => prev?.isConnected && prev.focus();
  }, []);
  return <div className="ops-overlay" onMouseDown={e => {
    if (e.target === e.currentTarget) onClose();
  }} onKeyDown={e => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
    if (e.key === 'Tab') {
      const els = Array.from(ref.current.querySelectorAll('button,input,select,textarea,[tabindex="0"]')).filter(x => !x.disabled);
      const first = els[0],
        last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }}><section className="ops-modal" role="dialog" aria-modal="true" aria-label={title} ref={ref}><header><h2>{title}</h2><button className="btn" onClick={onClose} aria-label="대화상자 닫기">닫기</button></header>{children}</section></div>;
}
function OpsChart({
  rows
}) {
  const max = Math.max(1, ...rows.map(r => r.total));
  return <div className="ops-chart" role="img" aria-label="일별 상담 유입 막대 그래프"><div className="ops-bars">{rows.map(r => <div key={r.date} className="ops-bar-column" title={`${r.date}: ${r.total.toLocaleString()}건`}><div style={{
          height: `${r.total / max * 100}%`
        }} /></div>)}</div><div className="ops-chart-axis"><span>{rows[0]?.date}</span><span>일별 상담 유입 · 건</span><span>{rows.at(-1)?.date}</span></div></div>;
}
Object.assign(window, {
  WorkspaceProvider,
  useWorkspace,
  OPS_DAYS,
  OpsLayout,
  OpsHeading,
  OpsEmpty,
  OpsMetric,
  OpsModal,
  OpsChart,
  opsCSV,
  opsDownload
});
