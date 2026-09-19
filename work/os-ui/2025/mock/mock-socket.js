/**
 * mock-socket.js — 포트폴리오 뷰파일 전용 가짜 실시간 연결
 * ---------------------------------------------------------------------------
 * 왜: 이 화면은 서버 없이 도는 사본이다. 원본은 뜰 때 STOMP 소켓(/stomp)과
 *     SSE 를 붙이는데, 서버가 없으니 SockJS 가 /stomp/info 를 두 번 때리고
 *     404 를 받는다. 화면은 멀쩡히 그려지지만 콘솔에 빨간 줄이 남고,
 *     전송 방식을 바꿔가며 재시도해 네트워크가 시끄럽다.
 *
 * 무엇을: window.SockJS / window.webstomp / window.EventSource 를
 *     아무 데도 접속하지 않는 껍데기로 바꾼다. connect 콜백은 즉시 성공으로
 *     불러주므로 원본 코드의 흐름(세션 id 저장, 구독)이 그대로 지나간다.
 *     실시간으로 밀려오는 메시지만 오지 않는다 — 사본에는 보낼 서버가 없다.
 *
 * 어디에: index.html 에서 vendor 소켓 라이브러리 뒤, global-connection.js 앞.
 *     vendor 파일은 제품 소스 그대로 남겨 두고, 쓰이는 순간만 가로챈다.
 */
(function () {
    "use strict";

    var noop = function () {};

    /* SockJS 껍데기 — 원본은 websocket._transport.url 에서 세션 id 를 떼어 쓴다 */
    function FakeSockJS(url) {
        this.url = url;
        this.readyState = 1;                       // OPEN
        this._transport = { url: String(url) + "/000/mock-session/websocket" };
        this.onopen = this.onmessage = this.onclose = this.onerror = noop;
        var self = this;
        setTimeout(function () { self.onopen({ type: "open" }); }, 0);
    }
    FakeSockJS.prototype.send = noop;
    FakeSockJS.prototype.close = function () { this.readyState = 3; this.onclose({ type: "close" }); };
    window.SockJS = FakeSockJS;

    /* webstomp 껍데기 — over(socket) 로 받은 클라이언트의 connect 를 바로 성공시킨다 */
    window.webstomp = {
        over: function (socket) {
            return {
                ws: socket,
                connected: true,
                connect: function (headers, onConnect) {
                    if (typeof onConnect === "function") {
                        setTimeout(function () { onConnect({ command: "CONNECTED", headers: {} }); }, 0);
                    }
                },
                disconnect: function (cb) { if (typeof cb === "function") cb(); },
                subscribe: function () { return { id: "mock-sub", unsubscribe: noop }; },
                unsubscribe: noop,
                send: noop
            };
        },
        client: function () { return window.webstomp.over(new FakeSockJS("/stomp")); }
    };

    /* SSE 껍데기 — 열린 척만 하고 이벤트는 보내지 않는다 */
    function FakeEventSource(url) {
        this.url = url;
        this.readyState = 1;
        this.onopen = this.onmessage = this.onerror = this.onclose = noop;
        var self = this;
        setTimeout(function () { self.onopen({ type: "open" }); }, 0);
    }
    FakeEventSource.prototype.addEventListener = noop;
    FakeEventSource.prototype.removeEventListener = noop;
    FakeEventSource.prototype.close = function () { this.readyState = 2; };
    window.EventSource = FakeEventSource;
})();
