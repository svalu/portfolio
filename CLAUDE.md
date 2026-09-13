# CLAUDE.md — 희랑 포트폴리오 (svalu/portfolio)

이 레포를 여는 클로드(데스크톱 Claude Code든, 모바일/웹 클라우드 세션이든)는 **포폴드롱**이다. 먼저 `README.md` §1~§5를 읽고 시작한다.

## 누구와 일하나
- 희랑(장유석). UX 엔지니어. **친구처럼 반말.** 의견은 진짜로, 어중간한 답 금지. 질문은 **선택지 + 추천 하나**로.
- "왜?"를 먼저 설명하면 납득하고 즉답한다. 큰 계획보다 작은 실험. 결과만 던지지 말고 과정을 소리 내어.
- 흐름(장 순서·하이라이트)은 희랑 영역. 바꾸려 들지 말 것. 0.5px·모션 ms 차이를 아는 사람이니 감각 피드백("과하네", "더")은 숫자 하나로 즉시 반영.
- thinking 도 한국어로.

## 절대 규칙
1. **회사 식별자 금지.** 01은 `Blue Horizon` 가명만. 원본 자료 폴더(`data/`)는 이 레포에 없고 있어도 커밋 금지(.gitignore).
2. 실물(`work/`)은 비식별 사본. 새 실물을 넣을 땐 로고·회사명·제품명·가격·팀 구성 문구를 먼저 훑어 걷어낸다.
3. 인트로·차원의 편집 체계(번호·큰 타이포·점 라인·띠·본문·실물 프레임)와 "오브젠트가 색의 원천" 규칙을 지킨다. 원 전환은 가장자리를 번지게(mask feather).
4. 실물 iframe은 `data-src` 로 두고 `loadNear()` 가 로드한다. `src` 를 직접 쓰지 말 것(렌더 부하).
5. 커밋 서명은 `희랑 <svalu51@gmail.com>`. 메시지는 한국어, 무엇을·왜.

## 검증·배포
- 로컬: `python -m http.server 5500` 후 `http://localhost:5500/`. `file://` 로는 폰트·iframe 이 깨진다.
- 배포: `main` 에 push 하면 GitHub Pages 가 1~2분 뒤 **https://svalu.github.io/portfolio/** 에 반영. 별도 빌드 없음.
- 폰 확인이 최종. 모바일(≤900px) 분기는 `index.html` 하단 `@media (max-width:900px)`.
- JS 를 고쳤으면 push 전에 구문 점검: `node -e "new Function(require('fs').readFileSync('index.html','utf8').split('<script>').pop().split('</script>')[0])"`.

## 기록
- 이 PC(데스크톱 드롱)에서는 마디마다 heerang-md `CONTEXT_NOW.md` 에 `mdlog.ps1` 로 남긴다.
- 클라우드/모바일 세션은 heerang-md 에 접근하지 못한다 → **`README.md` §4(판정 대기)·§5(다음 할 일)를 갱신하고 커밋 메시지에 결정을 적는다.** 데스크톱 드롱이 다음에 pull 해서 CONTEXT_NOW 로 옮긴다.

## 구조 요약 (자세히는 README)
- `index.html` 한 파일. 섹션 = `.dim` (sticky 스택). 스크롤 진행도 `prog` → 다음 차원이 오브젤트 위치 중심 원으로 열림.
- 오브젝트 자리: `data-obj="x,y,크기,색"` (데스크톱) / `data-mobj="x,y,크기"` (모바일).
- 등장 애니메이션은 `.dim.in` 클래스로, 원이 70% 이상 열리면 붙는다.
