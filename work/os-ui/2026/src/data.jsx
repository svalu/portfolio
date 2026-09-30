/* global React */
// Shared seed data for the admin OS

const APPS = [{
  id: 'dashboard',
  label: '대시보드',
  color: '#0078D4',
  initial: 'pos:{x:80,y:80,w:1080,h:720}'
}, {
  id: 'users',
  label: '사용자',
  color: '#8B5CF6'
}, {
  id: 'analytics',
  label: '분석',
  color: '#22B8CF'
}, {
  id: 'files',
  label: '자료실',
  color: '#F7B32B'
}, {
  id: 'messages',
  label: '메시지',
  color: '#1A9D4A'
}, {
  id: 'settings',
  label: '설정',
  color: '#5C5C5C',
  hiddenOnDesktop: true
}];
Object.assign(window, {
  APPS
});
