/**
 * mock-api.js — 포트폴리오 뷰파일 전용 가짜 서버
 * ---------------------------------------------------------------------------
 * 이 파일은 원본 제품에 없던, 뷰파일을 위해 새로 쓴 유일한 코드다.
 * 나머지(css/js/img/screens)는 전부 제품 소스 그대로다.
 *
 * 하는 일
 *   1. $.ajax / axios 를 가로채 URL 별로 그럴듯한 JSON 을 돌려준다.
 *      → 제품의 원본 JS 가 그대로 돌면서 표·차트·팝업을 진짜 마크업으로 그린다.
 *   2. 창(iframe) 을 열 때 서버 라우트(/analytics/dashBoard)를
 *      정적 파일(screens/analytics_dashBoard.html)로 바꿔준다.
 *   3. 제품 소스에 "주석 처리된 채 호출만 남아 있던" 함수들을 되살린다.
 *      (아래 RESTORED 섹션. 원본 주석 코드를 그대로 옮긴 것이고 새로 만든 UI 는 없다.)
 */
(function () {
    "use strict";

    // =========================================================================
    // 샘플 데이터 풀
    // =========================================================================
    var NAMES = ["김상담", "박지원", "이해랑", "최민서", "정유진", "한도현", "오세라",
                 "강태윤", "윤지호", "임수빈", "서은하", "배준영", "노아린", "문성재"];
    var GROUPS = ["1상담팀", "2상담팀", "VIP전담", "야간팀"];
    var STATUS = ["상담중", "상담대기", "휴게시간", "식사시간", "오프라인", "상담종료", "예약상담"];
    var CATEG = ["요금/결제", "가입/해지", "장애접수", "상품문의", "단순문의", "불만접수"];
    var MBR_TYPES = ["USER", "GROUP_ADMIN", "SYS_ADMIN"];

    var seed = 20250626;
    function rnd() {                       // 열 때마다 같은 화면이 나오도록 고정 난수
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    }
    function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
    function int(min, max) { return Math.floor(rnd() * (max - min + 1)) + min; }
    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    function daysAgo(n) {
        var d = new Date();
        d.setDate(d.getDate() - n);
        return d;
    }
    function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
    function ymdhms(d) {
        return ymd(d) + "(" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + ")";
    }
    function oid(i) { return "6" + String(100000000000000000000000 + i).slice(-23); }

    // 화면 JSP 에 박아 넣은 세션 값과 같아야 "내 고객" 판정이 된다
    var SESS_OID = "mbr000000000000000001";

    // ── 상담원 ────────────────────────────────────────────────────────────────
    var MEMBERS = (function () {
        var out = [];
        for (var i = 0; i < 14; i++) {
            out.push({
                id: oid(i + 1),
                mbrOid: oid(i + 1),
                mbrName: NAMES[i],
                mbrID: ["kimsd", "parkjw", "leehr", "choims", "jungyj", "handh", "ohsr",
                        "kangty", "yunjh", "imsb", "seoeh", "baejy", "noar", "munsj"][i],
                grpName: GROUPS[i % GROUPS.length],
                authName: i === 0 ? "시스템관리자" : (i < 3 ? "그룹관리자" : "상담원"),
                mbrType: i === 0 ? "SYS_ADMIN" : (i < 3 ? "GROUP_ADMIN" : "USER"),
                mbrEmplNum: "2" + String(20140 + i),
                mbrExtension: "070-4" + int(100, 999) + "-" + int(1000, 9999),
                mbrMobile: "010-" + int(1000, 9999) + "-" + int(1000, 9999),
                mbrEmail: "counselor" + (i + 1) + "@example.com",
                cnslStatusName: STATUS[i % STATUS.length],
                waitCnt: int(0, 4),
                chatCnt: int(0, 9),
                endCnt: int(3, 28)
            });
        }
        return out;
    })();

    // ── 상담 이력 ─────────────────────────────────────────────────────────────
    var HISTORY = (function () {
        var out = [];
        for (var i = 0; i < 43; i++) {
            var d = daysAgo(int(0, 27));
            d.setHours(int(9, 18), int(0, 59), int(0, 59));
            var m = MEMBERS[i % MEMBERS.length];
            out.push({
                id: oid(500 + i),
                targetId: oid(900 + i),
                cnslDate: ymdhms(d),
                regDate: ymd(d) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()),
                userName: pick(["김", "이", "박", "최", "정", "강"]) + "**",
                userMobile: "010-****-" + int(1000, 9999),
                mbrName: m.mbrName,
                grpName: m.grpName,
                categName: pick(CATEG),
                postProcType: rnd() > 0.35 ? "CHAT" : "RSVTN",
                postProcCd: rnd() > 0.2 ? "COMPLETE" : "HOLD",
                postProcTitle: pick(["요금제 변경 안내", "해지 방어 상담", "장애 접수 후 이관",
                                     "부가서비스 문의", "명의 변경 절차 안내", "결제 오류 확인"]),
                postProcContent: pick([
                    "고객 요청 사항 확인 후 담당 부서로 이관 처리하였습니다. 재문의 시 이력 참고 바랍니다.",
                    "요금제 변경 가능 여부를 안내드렸고, 다음 달 적용으로 신청 접수 완료했습니다.",
                    "장애 증상 확인되어 기술지원팀으로 접수하였습니다. 처리 예정일 안내 완료.",
                    "해지 사유 청취 후 대체 상품 안내드렸으며 고객이 유지 결정하셨습니다.",
                    "결제 오류 건 확인했습니다. 승인 취소 후 재결제 안내드렸습니다.",
                    "본인 확인 절차 진행 후 명의 변경 신청서 발송했습니다.",
                    "단순 문의로 상담 종료. 추가 조치 사항 없습니다."
                ]),
                cnslDuration: pad(int(0, 0)) + int(2, 24) + "분 " + int(10, 59) + "초",
                closeChat: rnd() > 0.5 ? "USER" : "CUST",
                evalScore: int(3, 5),
                cnslReviewGrade: int(3, 5),
                cnslReviewDesc: "친절하게 응대해 주셨습니다.",
                chatCnt: int(4, 40)
            });
        }
        return out;
    })();

    // ── 공지 ──────────────────────────────────────────────────────────────────
    var NOTICES = (function () {
        var titles = ["[필독] 상담 응대 표준 스크립트 개정 안내",
                      "9월 시스템 정기 점검 일정 공지",
                      "추석 연휴 상담 운영 시간 변경",
                      "신규 상담 분류 체계 적용 안내",
                      "금지어 목록 업데이트 (v2.4)",
                      "상담 품질 평가 기준 변경 사항",
                      "개인정보 처리 교육 이수 요청",
                      "예약 상담 기능 오픈 안내",
                      "메신저 그룹 개편 안내",
                      "10월 우수 상담원 시상 결과",
                      "전화 이관 절차 변경 공지",
                      "상담 이력 다운로드 권한 조정"];
        var out = [];
        for (var i = 0; i < titles.length; i++) {
            var d = daysAgo(i * 3 + 1);
            var plain = ymd(d) + " " + pad(9 + (i % 9)) + ":" + pad(i * 4 % 60) + ":00";
            out.push({
                id: oid(300 + i),
                noticeId: oid(300 + i),
                title: titles[i],
                subject: titles[i],
                brdNoticeTitle: titles[i],
                brdNoticeIsTop: i < 2,
                brdNoticeStatus: i < 2 ? "noti" : (i === 7 ? "resv" : (i === 11 ? "end" : "noti")),
                brdNoticeContent: "<p>안녕하세요. 운영팀입니다.</p><p>" + titles[i] +
                                  " 에 대해 아래와 같이 안내드립니다.</p>",
                content: "<p>안녕하세요. 운영팀입니다.</p><p>" + titles[i] +
                         " 에 대해 아래와 같이 안내드립니다.</p><p>자세한 내용은 첨부 문서를 확인해 주세요.</p>",
                mbrName: MEMBERS[i % 3].mbrName,
                regName: MEMBERS[i % 3].mbrName,
                regId: MEMBERS[i % 3].mbrID,
                regDate: plain,
                modName: MEMBERS[(i + 1) % 3].mbrName,
                modDate: plain,
                viewCnt: int(12, 340),
                isTop: i < 2
            });
        }
        return out;
    })();

    // ── 설정류 목록 ───────────────────────────────────────────────────────────
    var BOILERPLATES = ["안녕하세요. 무엇을 도와드릴까요?",
                        "확인 후 바로 안내드리겠습니다. 잠시만 기다려 주세요.",
                        "상담이 종료되었습니다. 이용해 주셔서 감사합니다.",
                        "본인 확인을 위해 생년월일을 입력해 주세요.",
                        "해당 내용은 담당 부서로 이관하겠습니다.",
                        "추가로 궁금하신 점 있으실까요?"];

    var PROHIBITED = ["비속어1", "비속어2", "주민등록번호", "카드번호", "계좌번호", "타사명"];

    var CLASSIFIERS = [
        { depth1: "요금/결제", depth2: "요금 조회", depth3: "당월 요금" },
        { depth1: "요금/결제", depth2: "요금 조회", depth3: "미납 내역" },
        { depth1: "요금/결제", depth2: "결제 수단", depth3: "자동이체 변경" },
        { depth1: "가입/해지", depth2: "신규 가입", depth3: "온라인 가입" },
        { depth1: "가입/해지", depth2: "해지", depth3: "해지 철회" },
        { depth1: "장애접수", depth2: "접속 불가", depth3: "회선 장애" }
    ];

    // =========================================================================
    // 메뉴 (원본은 MongoDB CNSL_MENU 컬렉션에서 옴 → 아이콘 파일명 기준으로 재구성)
    // =========================================================================
    var TOP_MENUS = [
        { id: "top1", menuName: "개인 관리", menuURL: "" },
        { id: "top2", menuName: "사용자 관리", menuURL: "" },
        { id: "top3", menuName: "운영 정보", menuURL: "" },
        { id: "top4", menuName: "운영 관리", menuURL: "" },
        { id: "top5", menuName: "기타", menuURL: "" }
    ];

    var MENUS = [
        // 개인 관리
        ["top1", "/member/accountInfo", "내 정보"],
        ["top1", "/configuration/boilerplate", "개인 상용구"],
        ["top1", "/configuration/notepad", "메모장"],
        ["top1", "/board/notice/list", "공지 사항"],
        // 사용자 관리
        ["top2", "/member/list", "사용자 관리"],
        ["top2", "/member/authManager", "권한 관리"],
        // 운영 정보
        ["top3", "/counseling/mainFrame", "상담 채팅"],
        ["top3", "/analytics/dashBoard", "대시보드"],
        ["top3", "/analytics/personal/performance", "개인 실적"],
        ["top3", "/analytics/personal/counselingHistory", "상담 이력"],
        ["top3", "/analytics/admin/totalPerformance", "전체 실적"],
        ["top3", "/analytics/admin/totalCounselingHistory", "전체 상담 이력"],
        // 운영 관리
        ["top4", "/configuration/counselingClassifier", "상담 분류"],
        ["top4", "/configuration/messageManager", "메시지 관리"],
        ["top4", "/configuration/prohibitedWord", "금지어 관리"],
        ["top4", "/configuration/operationTime", "운영 시간"],
        ["top4", "/board/manageNotice/list", "공지 관리"],
        // 기타
        ["top5", "/analytics/admin/auditLog", "감사 로그"]
    ].map(function (m, i) {
        return {
            menuId: "menu" + (i + 1),
            id: "menu" + (i + 1),
            parentId: m[0],
            menuURL: m[1],
            menuName: m[2],
            isAllow: true,
            menuDepth: 2
        };
    });

    // =========================================================================
    // 라우트 — [URL 조각, 응답 만드는 함수]
    // =========================================================================
    function perfDayData() {
        var days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        return days.map(function (d, i) {
            var cnt = i < 5 ? int(28, 74) : int(4, 16);
            return {
                day: d, count: cnt, percentage: Math.round(cnt / 80 * 100),
                postProcCount: cnt, postProcGrade: cnt * int(3, 5)
            };
        });
    }
    function perfHourData() {
        var out = [];
        for (var h = 0; h < 24; h++) {
            var busy = (h >= 9 && h <= 18);
            var cnt = busy ? int(12, 58) : int(0, 5);
            out.push({ cnslHour: pad(h), count: cnt, percentage: Math.round(cnt / 60 * 100) });
        }
        return out;
    }
    function perfMonthData() {
        var out = [];
        for (var i = 30; i >= 0; i--) {
            var d = daysAgo(i);
            var weekend = d.getDay() === 0 || d.getDay() === 6;
            out.push({ cnslDate: ymd(d), postProcType: "CHAT",
                       count: weekend ? int(2, 9) : int(18, 52),
                       avgCnslDuration: (weekend ? 3 + rnd() * 2 : 6 + rnd() * 4).toFixed(1),
                       avgGrade: (3.4 + rnd() * 1.5).toFixed(1) });
            out.push({ cnslDate: ymd(d), postProcType: "RSVTN",
                       count: weekend ? int(0, 3) : int(4, 17),
                       avgCnslDuration: (weekend ? 2 + rnd() * 2 : 4 + rnd() * 3).toFixed(1),
                       avgGrade: (3.2 + rnd() * 1.6).toFixed(1) });
        }
        return out;
    }

    function paged(list, opts) {
        var p = (opts && opts.data) || {};
        var pageNum = parseInt(p.pageNum || 1, 10);
        var pageSize = parseInt(p.pageSize || 15, 10);
        var start = (pageNum - 1) * pageSize;
        return { list: list.slice(start, start + pageSize), totalCnt: list.length };
    }

    function histList(o) {
        var r = paged(HISTORY, o);
        return {
            cnslHistList: r.list, list: r.list, totalCnt: r.totalCnt,
            data: { cnslHistList: r.list, list: r.list, totalCnt: r.totalCnt }
        };
    }

    var ROUTES = [
        // ── 메인 ──
        ["main/menu-icons", function () {
            return { data: {
                userSessionVo: {
                    mbrName: "장유석", mbrID: "heerang", mbrType: "SYS_ADMIN",
                    mbrOid: oid(1), menuAuthInfos: MENUS
                },
                topMenuList: TOP_MENUS
            } };
        }],
        ["main/logout", function () { return { data: true }; }],
        ["login/session/validation", function () { return { data: true }; }],
        ["member/getMbrType", function () { return { data: "SYS_ADMIN" }; }],

        // ── 대시보드 ──
        ["analytics/dashboard/data", function () {
            return {
                chartDatas: MEMBERS,
                totalCnslCnt: 428, totalChatCnt: 351, totalRsvtnCnt: 77,
                totAvgCnslDuration: "7분 42초"
            };
        }],

        // ── 실적 ──
        ["perf/data/month", function () { return perfMonthData(); }],
        ["perf/data", function () {
            return {
                dataByDays: perfDayData(), dataByHours: perfHourData(),
                totalCnslCnt: 428, totalChatCnt: 351, totalRsvtnCnt: 77,
                totAvgCnslDuration: "7분 42초",
                totalPostProcCnt: 410, totalPostProctGrade: 1722
            };
        }],

        // ── 상담 이력 ──
        // 목록 응답은 화면마다 ajaxData.cnslHistList / ajaxData.data.list 둘 다 쓴다 → 양쪽에 담는다
        ["cnsl-hist/list", function (o) { return histList(o); }],
        ["tot-cnsl-hist/list", function (o) { return histList(o); }],
        ["cnslHistDetail", function () { return Object.assign({}, HISTORY[0], { data: HISTORY[0] }); }],
        ["cnslEvalDetail", function () {
            return { cnslEval: { evalScore: 4 }, evalScores: [5, 4, 4, 5, 3],
                     itemScore: 4, evalComment: "안내가 정확했습니다.", data: {} };
        }],

        // ── 사용자 ──
        ["member/list", function (o) {
            var r = paged(MEMBERS, o);
            return { data: { memberList: r.list, totalCnt: r.totalCnt } };
        }],
        ["member/combo-items", function () {
            return { data: {
                mbrGrpComboMap: { g1: "1상담팀", g2: "2상담팀", g3: "VIP전담", g4: "야간팀" },
                authComboMap: { a1: "시스템관리자", a2: "그룹관리자", a3: "상담원" },
                mbrTypeComboMap: { USER: "일반사용자", GROUP_ADMIN: "그룹관리자", SYS_ADMIN: "시스템관리자" }
            } };
        }],
        ["account-info/data", function () {
            return { data: Object.assign({}, MEMBERS[0], { mbrType: "SYS_ADMIN" }) };
        }],
        ["grp-manager/list", function () {
            return { data: GROUPS.map(function (g, i) {
                return { id: oid(700 + i), grpName: g, grpId: "g" + (i + 1),
                         memberCnt: int(3, 9), regDate: ymd(daysAgo(i * 20 + 30)) };
            }) };
        }],
        ["auth-manager/auth/list", function () {
            return { data: [
                { id: "a1", authName: "시스템관리자", authDesc: "전체 권한", memberCnt: 1 },
                { id: "a2", authName: "그룹관리자", authDesc: "그룹 내 상담/통계", memberCnt: 2 },
                { id: "a3", authName: "상담원", authDesc: "상담 및 개인 통계", memberCnt: 11 }
            ] };
        }],
        ["auth-manager/menu/list", function () {
            return { data: MENUS.map(function (m) {
                return { id: m.menuId, menuId: m.menuId, menuName: m.menuName,
                         parentId: m.parentId, parentMenuName: "", menuDepth: 2, isAllow: true };
            }) };
        }],

        // ── 게시판 ──
        ["board/notice/posts/list", function (o) {
            var r = paged(NOTICES, o);
            return { data: { result: r.list, list: r.list, totalCnt: r.totalCnt } };
        }],
        ["board/notice/posts", function (o) {
            // 상세 조회(posts/{id}) — 원본이 길이 1 배열을 기대한다
            return { data: [NOTICES[0]] };
        }],

        // ── 설정 ──
        ["boilerplate/list", function () {
            return { data: BOILERPLATES.map(function (t, i) {
                return { id: oid(800 + i), seq: i + 1, title: "상용구 " + (i + 1),
                         content: t, regDate: ymd(daysAgo(i * 5)) };
            }) };
        }],
        ["boilerplate", function () {
            return { data: BOILERPLATES.map(function (t, i) {
                return { id: oid(800 + i), seq: i + 1, title: "상용구 " + (i + 1), content: t };
            }) };
        }],
        ["prohibited-word/allProhibitedWords", function () { return { data: PROHIBITED }; }],
        ["prohibited-word", function () {
            var list = PROHIBITED.map(function (w, i) {
                return { id: oid(820 + i), prhbWordItem: w, word: w,
                         regName: "장유석", regDate: ymd(daysAgo(i * 7)) };
            });
            return { data: { prhbWordList: list, list: list, totalCnt: list.length } };
        }],
        // 상담 분류 — 화면 두 곳(설정 목록 / 이력 화면의 zTree)이 같은 API 를 쓴다
        ["counselingClassifier", function () {
            var nodes = [];
            var seen = {};
            CLASSIFIERS.forEach(function (c, i) {
                [c.depth1, c.depth2, c.depth3].forEach(function (nm, lv) {
                    var key = [c.depth1, c.depth2, c.depth3].slice(0, lv + 1).join(">");
                    if (seen[key]) return;
                    var parentKey = lv === 0 ? undefined
                                  : [c.depth1, c.depth2, c.depth3].slice(0, lv).join(">");
                    seen[key] = "cat" + nodes.length;
                    nodes.push({
                        id: seen[key], categId: seen[key],
                        parentId: parentKey ? seen[parentKey] : undefined,
                        name: nm, categName: nm, categLevel: lv + 1,
                        categIsUse: !(i === 5 && lv === 2),   // 하나는 숨김 처리된 분류
                        useYn: (i === 5 && lv === 2) ? "N" : "Y",
                        isParent: lv < 2, open: lv === 0, seq: nodes.length + 1
                    });
                });
            });
            return { data: nodes, dataList: nodes };
        }],
        ["message-manager", function () {
            return { data: [
                { id: oid(860), msgCd: "WELCOME", msgName: "인사말", msgContent: "안녕하세요. 상담사 연결되었습니다.", useYn: "Y" },
                { id: oid(861), msgCd: "WAIT", msgName: "대기 안내", msgContent: "잠시만 기다려 주세요.", useYn: "Y" },
                { id: oid(862), msgCd: "CLOSE", msgName: "종료 인사", msgContent: "상담이 종료되었습니다.", useYn: "Y" },
                { id: oid(863), msgCd: "AWAY", msgName: "부재 안내", msgContent: "현재 상담 가능 시간이 아닙니다.", useYn: "N" }
            ] };
        }],
        ["operation-time", function () {
            var days = ["월", "화", "수", "목", "금", "토", "일"];
            return { data: days.map(function (d, i) {
                return { id: oid(880 + i), dayName: d, day: d,
                         startTime: i < 5 ? "09:00" : "10:00",
                         endTime: i < 5 ? "18:00" : "14:00",
                         useYn: i === 6 ? "N" : "Y" };
            }) };
        }],
        ["notepad", function () {
            return { data: [
                { id: oid(890), title: "이관 담당자 연락처", content: "장애접수 → 기술지원팀 070-4000-1234", regDate: ymd(daysAgo(2)) },
                { id: oid(891), title: "자주 쓰는 링크", content: "요금표 / 약관 / 해지 절차", regDate: ymd(daysAgo(9)) }
            ] };
        }],

        // ── 상담 채팅 (mainFrame 의 고객 / 동료 / 예약 탭) ──
        ["counseling/customer/list", function () {
            var now = Date.now();
            function cust(i, code, mine) {
                var req = now - (i + 1) * 1000 * 60 * int(3, 40);
                return {
                    id: oid(1000 + i), channelId: "ch-" + (1000 + i),
                    cnslrStatusCode: code, mbrOId: mine ? SESS_OID : oid(2000 + i),
                    cusClsftn: i % 3 === 0 ? "비로그인" : "로그인",
                    reqtTimeStamp: req, reqtDate: new Date(req).toISOString(),
                    elapsedTimeStamp: now - req,
                    unReadCnt: i % 4 === 0 ? int(1, 6) : 0,
                    cnslrEndDate: null
                };
            }
            return { data: {
                customer: [cust(0, "chat", true), cust(1, "chat", true), cust(2, "assign", true),
                           cust(3, "assign", true), cust(4, "wait", false), cust(5, "wait", false),
                           cust(6, "wait", false)],
                unprocessedChat: [cust(7, "end", true), cust(8, "end", true)],
                unReadChat: []
            } };
        }],
        ["counseling/staff/list", function () {
            var now = Date.now();
            var codes = ["chat", "chat", "chat", "recess", "lunch", "rsvtn",
                         "onln", "onln", "offln", "offln", "logout", "chat", "onln", "recess"];
            var staff = MEMBERS.map(function (m, i) {
                return {
                    mbrOId: m.mbrOid, mbrName: m.mbrName, cnslStatus: codes[i],
                    chatCnt: codes[i] === "chat" ? int(1, 4) : 0,
                    assignCnt: codes[i] === "chat" ? int(0, 3) : 0,
                    elapsedTimeStamp: (codes[i] === "lunch" || codes[i] === "recess")
                                      ? int(4, 38) * 60000 : 0,
                    unReadCnt: i % 5 === 0 ? int(1, 3) : 0
                };
            });
            return { data: { listData: { staff: staff, unReadChat: [] }, isAdmin: true } };
        }],
        ["counseling/reservation/list", function () {
            var rsv = [];
            for (var i = 0; i < 6; i++) {
                var d = daysAgo(-(i % 4));       // 오늘 이후 예약
                rsv.push({
                    id: oid(1100 + i), cnslStatus: i < 2 ? "call" : "wait",
                    userNm: NAMES[i], hopeDate: ymd(d),
                    // hopeHour 는 "시작시+종료시" 4자리다 (예: 1416 → 14~16시)
                    hopeHour: pad(9 + i * 2) + pad(11 + i * 2),
                    mbrId: SESS_OID, mbrOId: SESS_OID
                });
            }
            return { data: { reservation: rsv, unReadChat: [] } };
        }],
        ["counseling/customer/status", function () {
            return { data: { cnslStatus: "chat", cnslStatusName: "상담중" } };
        }],

        // ── 상담 ──
        ["counseling/postProcess/list", function (o) {
            var r = paged(HISTORY, o);
            return { data: { list: r.list, postProcList: r.list, totalCnt: r.totalCnt } };
        }],
        ["counseling/postProcess", function () {
            return Object.assign({}, HISTORY[0], { data: HISTORY[0] });
        }],
        ["transfer/members", function () {
            return { data: MEMBERS.filter(function (m) { return m.cnslStatusName !== "오프라인"; }) };
        }],
        ["employee/chat/list", function () { return { data: MEMBERS }; }],
        ["employee/channel", function () { return { data: GROUPS }; }],
        ["customer/chat/log/list", function () { return { data: [] }; }],
        ["counseling/reservation/detail", function () {
            return { data: HISTORY[1] };
        }],
        ["analytics/admin/auditLog/list", function (o) {
            var logs = HISTORY.map(function (h, i) {
                var m = MEMBERS[i % MEMBERS.length];
                return {
                    id: h.id,
                    auditLogCategStr: pick(["상담 이력", "사용자", "설정", "게시판"]),
                    auditLogCodeStr: pick(["조회", "저장", "삭제", "다운로드", "권한 변경"]),
                    auditLogTgtName: h.userName,
                    auditLogRsn: pick(["고객 요청 확인", "민원 대응", "정기 점검", "이관 확인"]),
                    auditLogIp: "10.20." + int(1, 200) + "." + int(1, 200),
                    regId: m.mbrID, regName: m.mbrName, regDate: h.regDate
                };
            });
            var r = paged(logs, o);
            return { data: { result: r.list, list: r.list, totalCnt: r.totalCnt } };
        }],
        ["analytics/admin/auditLog", function () {
            // 상담원 검색 팝업 — 배열을 그대로 기대한다
            return { data: MEMBERS };
        }],

        // ── 로그인 ──
        ["login/pwd/rule", function () {
            return { data: { minLength: 9, useSpecialChar: true, useNumber: true } };
        }],
        ["login/useTwoFactorAuth", function () { return { data: false }; }]
    ];

    function respond(url, opts) {
        var clean = String(url).split("?")[0];
        for (var i = 0; i < ROUTES.length; i++) {
            if (clean.indexOf(ROUTES[i][0]) !== -1) {
                return ROUTES[i][1](opts);
            }
        }
        // 알려진 경로가 없으면 빈 성공 응답 — 화면이 죽지 않게만 한다
        return { data: {}, dataList: [], list: [], totalCnt: 0, result: true, code: "0000" };
    }

    // =========================================================================
    // $.ajax / axios 가로채기
    // =========================================================================
    function install($) {
        if (!$ || $.__mocked) return;
        $.__mocked = true;

        $.ajax = function (opts) {
            opts = opts || {};
            if (typeof opts === "string") opts = { url: opts };

            var payload = respond(opts.url, opts);

            // 원본이 async:false 로 호출하는 곳이 있어(getMbrType) 즉시 호출로 맞춘다
            if (opts.async === false) {
                if (opts.success) opts.success(payload, "success", {});
                if (opts.complete) opts.complete({}, "success");
                return { responseJSON: payload };
            }

            var fake = {
                done: function (fn) { fn && setTimeout(function () { fn(payload); }, 0); return fake; },
                fail: function () { return fake; },
                always: function (fn) { fn && setTimeout(fn, 0); return fake; },
                then: function (fn) { fn && setTimeout(function () { fn(payload); }, 0); return fake; },
                abort: function () {}
            };
            setTimeout(function () {
                try {
                    if (opts.success) opts.success(payload, "success", {});
                    if (opts.complete) opts.complete({ responseJSON: payload }, "success");
                } catch (e) {
                    console.warn("[mock] " + opts.url + " 처리 중:", e.message);
                }
            }, 30);
            return fake;
        };

        $.ajaxSetup = function () {};   // 세션 체크 beforeSend 무력화
        $.post = function (url, data, cb) {
            var p = respond(url, { data: data });
            setTimeout(function () { typeof data === "function" ? data(p) : (cb && cb(p)); }, 30);
        };
        $.get = $.post;
        $.getJSON = $.post;
    }

    if (window.jQuery) install(window.jQuery);

    // axios (채팅 클라이언트·다운로드에서 사용)
    window.axios = window.axios || {};
    ["get", "post", "put", "delete"].forEach(function (m) {
        window.axios[m] = function (url) {
            return Promise.resolve({ data: respond(url, {}), status: 200 });
        };
    });

    // 웹소켓 / SSE — 뷰파일에는 서버가 없으므로 조용히 무력화
    window.SockJS = function () { return { close: function () {} }; };
    window.webstomp = { over: function () {
        return { connect: function () {}, disconnect: function () {}, subscribe: function () {}, send: function () {} };
    } };
    window.EventSource = function () { return { close: function () {}, addEventListener: function () {} }; };

    // =========================================================================
    // 라우트 → 정적 파일 매핑
    // =========================================================================
    function toStatic(url) {
        if (!url) return url;
        var parts = String(url).split("?");
        var path = parts[0];
        if (path.indexOf(".html") !== -1 || path.indexOf("http") === 0) return url;
        var file = "screens/" + path.replace(/^\//, "").replace(/\//g, "_") + ".html";
        return parts[1] ? file + "?" + parts[1] : file;
    }
    window.__toStaticView = toStatic;

    $(function () {
        // sockjs / webstomp 본체는 mock 보다 뒤에 로드되므로 여기서 다시 덮는다
        window.SockJS = function () { return { close: function () {} }; };
        window.webstomp = { over: function () {
            return { connect: function () {}, disconnect: function () {},
                     subscribe: function () {}, send: function () {} };
        } };

        if (window.iframeWindow && window.iframeWindow.openIframeWindow) {
            var origin = window.iframeWindow.openIframeWindow;
            window.iframeWindow.openIframeWindow = function (coordinate, params) {
                var p = {};
                for (var k in params) p[k] = params[k];
                p.url = toStatic(params.url);
                return origin.call(this, coordinate, p);
            };
        }
    });

    // =========================================================================
    // RESTORED — 제품 소스에 주석 처리된 채 호출만 남아 있던 함수들
    //
    // 원본 js/analytics/personal/performance.js 는 요일별·시간대별·등급별 막대
    // 차트를 그리는 함수 네 개가 /* */ 로 묶여 있는데, success 핸들러에서는
    // 그대로 호출한다. 실제 서버에서도 여기서 ReferenceError 가 나 막대가 0% 로
    // 남는다. 뷰파일에서는 그 주석 코드를 그대로 되살려 막대가 채워지게 했다.
    // 새로 만든 UI 는 없고, 마크업은 전부 원본 JSP 그대로다.
    // =========================================================================
    window.resetDayBarChart = function () {};

    window.gerenateDayBarChart = function (dayDatas) {
        var $wrap = $("#dayBarWrap");
        var label = { mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토", sun: "일" };
        (dayDatas || []).forEach(function (d) {
            var $item = $wrap.find("div[name=" + d.day + "]");
            $item.find("span[name=barText]").text(label[d.day] + " (" + d.count + "건)");
            $item.find("div[name=barItem]").css("height", d.percentage + "%");
            $item.find("div[name=barValue]").text(d.percentage + "%");
        });
        $("div.bar_item_wrap").find("div[name=barItem], div[name=barValue]").removeClass("display_none");
    };

    window.generateGradeBarChart = function (dayDatas) {
        var $wrap = $("#gardeBarWrap");
        var label = { mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토", sun: "일" };
        (dayDatas || []).forEach(function (d) {
            var $item = $wrap.find("div[name=" + d.day + "]");
            var grade = d.postProcCount > 0 ? (d.postProcGrade / d.postProcCount) : 0;
            $item.find("span[name=barText]").text(label[d.day] + " (" + d.postProcCount + "건)");
            $item.find("div[name=barItem]").css("height", (grade / 5 * 100) + "%");
            $item.find("div[name=barValue]").text(grade.toFixed(1) + "점");
        });
    };

    window.generateTimeBarChart = function (timeDatas) {
        var $w1 = $("#timeBarWrap1").empty();
        var $w2 = $("#timeBarWrap2").empty();
        (timeDatas || []).forEach(function (t) {
            var $item = $('<div class="bar_item_wrap"></div>');
            $item.append($("<span></span>").text(t.cnslHour + "시 (" + t.count + "건)"));
            var $bar = $('<div class="bar_oj_wrap"></div>').css("height", t.percentage + "%");
            $bar.append('<div class="bar_oj color_2_1"></div>');
            $bar.append('<div class="bar_oj color_2_2"></div>');
            $bar.append('<div class="bar_oj color_2_3"></div>');
            $bar.append($('<div class="per_text color_2"></div>').text(t.percentage + "%"));
            $item.append($bar);
            (parseInt(t.cnslHour, 10) < 12 ? $w1 : $w2).append($item);
        });
    };

    window.setCountDatas = window.setCountDatas || function (d) {
        $("#totalCnslCnt").text((d.totalCnslCnt || 0) + "건");
        $("#totalChatCnt").text((d.totalChatCnt || 0) + "건");
        $("#totalRsvtnCnt").text((d.totalRsvtnCnt || 0) + "건");
        $("#totAvgCnslDuration").text(d.totAvgCnslDuration || "-");
        if (d.totalPostProcCnt > 0) {
            var g = (d.totalPostProctGrade / d.totalPostProcCnt).toFixed(1) + "점";
            $("#totAvgPostProcGrade, #totAvgCnslReviewGrade").text(g);
        }
    };

    // 등급 월별 차트도 호출만 있고 정의가 없다 — 같은 방식으로 채운다
    window.setPerfGradeCharByMonth = function (data, startDt, endDt) {
        var el = document.getElementById("monthlyAvgGradeChart");
        if (!el || typeof Chart === "undefined") return;
        var labels = [], values = [];
        var cur = new Date(startDt), end = new Date(endDt);
        while (cur <= end) {
            var key = ymd(cur);
            var hit = (data || []).filter(function (r) { return r.cnslDate === key; });
            labels.push(pad(cur.getMonth() + 1) + "-" + pad(cur.getDate()));
            values.push(hit.length ? parseFloat(hit[0].avgGrade) : 0);
            cur.setDate(cur.getDate() + 1);
        }
        if (window.__gradeChart) window.__gradeChart.destroy();
        window.__gradeChart = new Chart(el.getContext("2d"), {
            type: "line",
            data: { labels: labels, datasets: [{
                label: "평균 만족도", data: values,
                borderColor: "#85a2d1", backgroundColor: "rgba(133,162,209,.2)",
                fill: true, tension: .3, pointRadius: 2
            }] },
            options: { responsive: false, scales: { y: { beginAtZero: true, max: 5 } } }
        });
    };

    // =========================================================================
    // 데모 모드 — index.html?demo=1
    //
    // 그냥 열면 빈 바탕화면이라 첫인상이 약하다. 포트폴리오에 임베드할 때는
    // 창 몇 개를 미리 띄워 둔 상태로 보여 준다. 사람이 아이콘을 누른 것과
    // 똑같은 경로(menuIconClick)를 타므로 억지로 만든 화면이 아니다.
    // =========================================================================
    if (window.parent === window && /[?&]demo=1/.test(location.search)) {
        $(function () {
            var 순서 = ["상담 채팅", "대시보드"];   // 뒤에 연 창이 위로 온다
            var i = 0;

            function openNext() {
                if (i >= 순서.length) return;
                var $icon = $(".bg_icon_wrap[menuName='" + 순서[i] + "']");
                if (!$icon.length) return setTimeout(openNext, 100);  // 아직 메뉴가 안 그려짐
                i++;
                $icon.trigger("click");
                setTimeout(openNext, 900);
            }

            // 메뉴 아이콘이 ajax 로 그려진 뒤에 시작한다
            (function waitMenu() {
                if ($(".bg_icon_wrap").length) return openNext();
                setTimeout(waitMenu, 100);
            })();
        });
    }

    // =========================================================================
    // file:// 로 연 경우 안내
    //
    // 파일을 직접 더블클릭하면 브라우저가 이 페이지와 iframe 안 화면을
    // "서로 남남인 출처"로 취급한다. 그래서 바탕화면은 멀쩡히 뜨는데,
    // 창을 열면 부모가 iframe 안을 못 읽어 크기를 못 맞추고 손톱만 하게 뜬다.
    // 제품 코드가 프레임을 넘나들며 동작하는 구조라 우회가 안 된다 → 서버로 열어야 한다.
    // =========================================================================
    if (location.protocol === "file:" && window.parent === window) {
        $(function () {
            var $bar = $('<div></div>').css({
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 99999,
                background: "#2b2b2b", color: "#fff", padding: "14px 18px",
                font: '13px/1.7 "Malgun Gothic",sans-serif', textAlign: "center"
            }).html(
                '<b style="color:#ffd76e">파일을 직접 연 상태라 창이 제대로 열리지 않습니다.</b><br>' +
                '이 폴더의 <b>열기.bat</b> 을 실행하거나, 폴더에서 ' +
                '<code style="background:#444;padding:2px 6px;border-radius:3px">python -m http.server 8800</code>' +
                ' 후 <b>http://localhost:8800</b> 으로 접속하세요.' +
                '<span style="margin-left:14px;cursor:pointer;opacity:.6" id="__closeBar">닫기 ✕</span>'
            );
            $("body").append($bar);
            $("#__closeBar").on("click", function () { $bar.remove(); });
        });
    }

    console.log("[mock-api] 가짜 서버 준비 완료 — 라우트 " + ROUTES.length + "개");
})();
