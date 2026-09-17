class WebSocketStomp {
    constructor(url, targetCode, timeout) {
        this._stomp = null;
        this._url = url;
        this._targetCode = targetCode; //customer, employee
        this._timeout = timeout;
        this._sessionId = "";
    }

    connect() {
        try {
			const $this = this;
            let param = {};
            const websocket = new window.SockJS(this._url, null, {
                timeout: this._timeout,
                transports: ['websocket', 'xhr-streaming', 'xhr-polling', 'iframe-eventsource', 'iframe-htmlfile']
            });
            this._stomp = window.webstomp.over(websocket, {
                debug: false
            });
            this._stomp.connect(param, function() {
				let tmpArr = websocket._transport.url.split("/");
				$this._sessionId = tmpArr[tmpArr.length-2];
				try {
					if($this._targetCode == "customer") updateSocketSession($this._sessionId); //cnsl_member 테이블에 소켓 세션아이디 저장(main.js)
				} catch(e) {
					console.log(e);
				}
			}  );
        } catch (e) {
            throw new ConnectFailedException();
        }
    }

    sub(channelId, callback, data, callbackFun) {
        this._stomp?.subscribe(`/sub/channel/${channelId}`, callback, callbackFun);
        //this._stomp?.subscribe(`/sub/channel/${channelId}`, callback, data, callbackFun);
        //if(typeof(callbackFun) == "function") callbackFun();

    }

    unsub(channelId) {
        this._stomp?.unsubscribe(channelId, {});
    }

    send(data) {
        this._stomp?.send(`/pub/${this._targetCode}/messages`, JSON.stringify(data), {});
    }

    disconnect(callback) {
        this._stomp?.disconnect(callback, {});
    }
}