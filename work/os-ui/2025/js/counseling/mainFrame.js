let curMbrStateCd = "";
let initHeight = 0;
let pageCode = "customer";
let cnslStatus = ""; 
let isAdmin = "";
let isLoading = false;
//상담대기 고객 수 
//예약상담수 

const sseConnectUrl = "/rest/api/sse/connect";
const sseSendUrl = "/rest/api/sse/event:send";
const reservationDetailUrl = "/counseling/reservation/detail"; //예약상담 상세 url
const initDataPath = "/rest/api/counseling";
const mainFrameUrl = "/counseling/mainFrame";
const addAssignUrl = "/counseling/internal/extraAssign";
const prohibitUrl = "/rest/api/prohibited-word";
const mappingPath = { 
	"customer":	{
		"list":initDataPath+"/customer/list",
		"add":initDataPath+"/customer/assign",
		"start":initDataPath+"/customer/start",
		//"status":initDataPath+"/customer/status",
		"getData":initDataPath+"/customer/getData"
	},
	"staff": {
		"list":initDataPath+"/staff/list",
		"getData":initDataPath+"/customer/getData"
	},
	"reservation": {
		"list":initDataPath+"/reservation/list",
		"add":initDataPath+"/reservation/assign",
		"cancel":initDataPath+"/reservation/cancel",
		"getData":initDataPath+"/customer/getData"
	}
}

const titleMap = {
	"customer" : {
		"chat":"상담중 고객",
		"assign":"배정된 고객",
		"wait":"상담대기 고객",
		"end":"미처리 고객",
	}, 
	"staff" : {
		"chat":"상담중",
		"recess":"휴게시간",
		"lunch":"식사시간",
		"rsvtn":"예약상담",
		"onln":"로그인",
		"offln":"오프라인",
		"logout":"로그아웃"
	},
	"reservation" : {
		"call":"예약 상담중",
		"wait":"예약 상담대기"
	}
};

const custommerListMap = {
	"chat": {
		"title": "온라인",
		"msg": "온라인 시 상담업무가 시작됩니다.\n상담 업무를 시작하시겠습니까?",
		"confirmText": "온라인",
		"cancelText": "취소"
	},
	"recess": {
		"title": "휴게시간",
		"msg": "휴게시간 시 신규 상담 배정이 중지됩니다.\n휴게시간 상태로 변경하시겠습니까?",
		"confirmText": "휴게시간",
		"cancelText": "취소"
	},
	"lunch": {
		"title": "식사시간",
		"msg": "식사시간 시 신규 상담 배정이 중지됩니다.\n식사시간 상태로 변경하시겠습니까?",
		"confirmText": "식사시간",
		"cancelText": "취소"
	},
	"offln": {
		"title": "오프라인",
		"msg": "오프라인 시 신규 상담 배정이 중지됩니다.\n오프라인 상태로 변경하시겠습니까?",
		"confirmText": "오프라인",
		"cancelText": "취소"
	},
	"rsvtn": {
		"title": "예약상담",
		"msg": "예약상담 시 신규 상담 배정이 중지됩니다.\n예약상담 상태로 변경하시겠습니까?",
		"confirmText": "예약상담",
		"cancelText": "취소"
	}
};

window.addEventListener("message", function(event) {
	//const data = event.data;
	//console.log(event);
	handleSseMessage(event);
});

var eventSource;

$(document).ready(function() {
	/* main.js에서 sse 연결 */
	//initSSE();
	window.parent.postMessage({type: "receiveSseDataRegister", src: location.pathname, dataCode:SSE_DATA_CODE.CNSL_CHAT}, "*");

	initEvents();
	mbrStateCdSet(); //상담상태 select box set
	getCnslStatus(); //나의 상담상태 가져오기 
	getList(); //리스트
	loadProhibitedWords(); //금칙어 로드
	//leftMenuBlinker(); //좌측 메뉴 깜박임 여부
});

/*function initSSE() {
	if(window.EventSource != null) {
		eventSource = new ServerSentEvent(sseConnectUrl);

		eventSource.onopen = function() {
			//console.log("open");
		}

		eventSource.onerror = function(error) {
			//console.log('connection state: ' + eventSource.readyState + ', error: ' + error);
		}

		eventSource.onmessage = function(event) {
			handleSseMessage(event);
		}
		eventSource.onclose = function() {
			console.log('close');
		}
		eventSource.connect();
	}
}*/

function handleSseMessage(event) {
	var tmpJson;
	var json;

	tmpJson = JSON.parse(event.data);
	json = (tmpJson.data) ? tmpJson.data : tmpJson;
	json.staff = combineData(json);
	var jsonData = json[pageCode];
	if(jsonData != null && json.unprocessedChat !== undefined && pageCode === "customer") {
		//append json[unprocessedChat] to jsonData
		jsonData = [...jsonData, ...json.unprocessedChat];
	}

	leftMenuBlinkerSet(json);
	if(jsonData) appendList(jsonData);
}

function getList(callback) {
	if(pageCode == "customer") customer.getList(callback);
	if(pageCode == "staff") staff.getList(callback);
	if(pageCode == "reservation") reservation.getList(callback);
}

function appendList(json) {
	if(pageCode == "customer") customer.appendList(json);
	if(pageCode == "staff") staff.appendList(json);
	if(pageCode == "reservation") reservation.appendList(json);
}

function initEvents() {
	
	/*
	//최대, 최소화
	$("#heightResize").off("click").on("click", function(event) {
		if($(".iframe_body").height() == initHeight) {
			fullHeight();
		} else {
			undoHeight();
		}
	});
	*/
	
	//좌측 메뉴 클릭 이벤트
	$(".c_s_chat_left div[id^='icon_']").on("click", function(event) {
		$(".c_s_chat_left .c_s_chat_icon").removeClass("active");
		$(this).find(".c_s_chat_icon").addClass("active");
		pageCode = this.id.replace("icon_", "");
		
		if(!isLoading) {
			 isLoading = true;
			getList(function() {
				isLoading = false;
			});
		} 
		//blinker : 새로운 채팅, 배정, 예약상담이 발생되면 아이콘의 변화로 알림
		//고객상담 : 안 읽은 메시지/배정된 고객 있으면 blinker
		//직원목록 : 안 읽은 메시지 있으면 blinker
		//예약상담 : 예약상담대기 고객 있으면 blinker 
	})
	
	//상담상태 변경
	$("#mbrStateCd").off("change").on("change", function() {
		//console.log($(this).val());
		var key = $(this).val();
		var confirmCallback = () => mbrStateCdChange(key);
		var cancelCallback = () => $("#mbrStateCd").val(cnslStatus == "onln" ? "" : cnslStatus);
		
		if(key == "") {
			uiAlert("상담상태를 선택해 주세요");
			$(this).val(cnslStatus);	
			return;		
		}
		
		$.fn.twoBtnPopup({
			title: "알림",                        			//팝업창 타이틀
			context: custommerListMap[key].msg,            	//팝업창 내용
			confirmText: custommerListMap[key].confirmText, //팝업창 버튼속 텍스트1
			cancelText: custommerListMap[key].cancelText,   //팝업창 버튼속 텍스트2
			confirmCallback: confirmCallback,        		//버튼1번 콜백함수
			cancelCallback: cancelCallback,            		//버튼2번 콜백함수
			id: ''                    						//팝업창 아이디(필수 아님)
		}, '', '');                        					//각 콜백함수에 바인딩 될 파라미터들
	});
}

//좌측 메뉴 깜박임
function leftMenuBlinkerSet(json) {
	if(typeof(json) != "object") return;
	var cntObj = {};
	var cnslCnt = 0; //상담중 고객/배정된 고객 수

	for(var key in json) {
		if(!json[key]) continue; //데이터 없으면 스킵
		
		cntObj[key] = 0;
		$(json[key]).each(function(idx, obj) {
			if(key == "customer") {
				if(sessMbrOId == obj.mbrOId) {
					if(obj.cnslrStatusCode == "chat") {
						cntObj[key]++;
						cnslCnt++;
						if(obj.unReadCnt > 0) { //읽지 않은 채팅이 있으면
							let eventData = {
								type : "blinkTaskbar",
								params : {
									menuId : "cnslChat_"+ obj.id
								}
							};
							window.parent.postMessage(eventData, "*");
						} else {
							let eventData = {
								type : "stopBlinkTaskbar",
								params : {
									menuId : "cnslChat_"+ obj.id
								}
							};
							window.parent.postMessage(eventData, "*");
						}
					} else if(obj.cnslrStatusCode == "assign") { //배정된 고객이 있으면
						cntObj[key]++;
						cnslCnt++;
						//상담채팅 창이 최소화 되어 있는지 확인 후 최소화 되어 있으면 보이게 || 배정 알림 표시
						/*const targetFrame = top.getSseTargetObj(SSE_DATA_CODE.CNSL_CHAT);
						if(targetFrame) {
							let targetObj = targetFrame();
							if(targetObj && targetObj.length > 0) {
								if($(targetObj).closest("div").hasClass("display_none")) {
									//$(targetObj).closest("div").removeClass("display_none");
								}
							}
						}*/
					}
				}
			} else if(key == "staff") {
				//안 읽은 메시지가 있으면
				if(obj.unReadCnt > 0) {
					cntObj[key]++;
					let eventData = {
						type : "blinkTaskbar",
						params : {
							menuId : "staffChat_"+ obj.mbrOId
						}
					};
					window.parent.postMessage(eventData, "*");


				} else {
					let eventData = {
						type : "stopBlinkTaskbar",
						params : {
							menuId : "staffChat_"+ obj.mbrOId
						}
					};
					window.parent.postMessage(eventData, "*");
				}
			} else if(key == "reservation") {
				//예약상담 대기 고객이 있으면
				if(obj.cnslStatus == "wait") {
					cntObj[key]++;
				}
			}
		});
	}
	
	for(var key in cntObj) {
		if(json[key]) {  //데이터 있을 때만 갱신
			$(`#icon_${key} .${key}`).removeClass("blinker");
			if(key != pageCode && cntObj[key] > 0) {
				$(`#icon_${key} .${key}`).addClass("blinker");
			}
		}
	}

	//상담중 고객, 배정된 고객이 있으면 상담중, 없으면 상담대기
	if(json["customer"]) {
		if(cnslCnt > 0) {
			$("#currentStatus").html("상담중");
		} else {
			$("#currentStatus").html("상담대기");
		}
	}
}

//상담상태 select box
function mbrStateCdSet() {
	$("#mbrStateCd").html("");
	var options = `<option value=""> - 상담상태</option>`;
	for (var key in custommerListMap) {
		options += `<option value="${key}">${custommerListMap[key].title}</option>`;
	}
	$("#mbrStateCd").append(options);
}

//나의 상담상태 가져오기
function getCnslStatus() {
	var dataUrl = initDataPath+"/customer/status";
	//initDataPath+"/customer/status/
	$.ajax({
        url: dataUrl, 
        type: "POST",
        data: "",
        dataType: 'json',
        success: function(rstData) {
			if(rstData.data) {
				cnslStatus = rstData.data.cnslStatus;
				localStorage.setItem("cnslStatus", cnslStatus);
				
				if( Object.keys(custommerListMap).find( (key) => key == cnslStatus ) ) {	
					$("#mbrStateCd").val(cnslStatus);
				}
			}
			//getList();
        },
        error: function(error) {
			uiAlert("서버와의 통신에 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });
}

function timestampToMinute(ts) {
	return parseInt(ts/1000/60);
}

//상담상태 변경
function mbrStateCdChange(statusCd) {
	var dataUrl = initDataPath+"/customer/status/"+statusCd;
	var param = {
		"statusCd" : statusCd
	};
	
	$.ajax({
		url: dataUrl,
		type: 'PUT',
		data: param,
		dataType: 'json',
		success: function(rstData) {
			if(rstData.data == "success") {
				cnslStatus = statusCd;
				localStorage.setItem("cnslStatus", cnslStatus);
				getList();
				notifyMbrStateCdChange();
			} else {
				uiAlert("상담상태 변경 실패했습니다.");
			}
		},
		error: function(error) {
			uiAlert("서버와의 통신에 실패하였습니다.");
			//console.error("An error occurred:", error);
		}
	});
	
	//console.log("statusCd : ", statusCd);
}

function notifyMbrStateCdChange() {
	var param = {
		code : SSE_DATA_CODE.MBR_STATUS_CD_CHANGE,
		// data : {}
	};
	$.ajax({
		url: sseSendUrl,
		type: 'POST',
		contentType: 'application/json',
		data : JSON.stringify(param),
		success: function(rstData) {
		},
		error: function(error) {
			console.log(error);
		}
	})
}

//staff데이터 + 직원채팅 안읽은 메시지 데이터
function combineData(json) {
	if(!json.staff && !json.unReadChat) return;
	
	var staffData = json.staff;
	var chatData = json.unReadChat;
	
	//내가 속한 채널
	var myChannel = $.grep(chatData, e => e.mbrOId === sessMbrOId);
	var myUnReadData = []; // 읽지 않은 채팅 데이터
	
	$(myChannel).each(function(idx, obj) {
		var tmpData = $.grep(chatData, e => e.channelId == obj.channelId && e.mbrOId != sessMbrOId && e.unReadCnt > 0);
		if(tmpData.length > 0) {
			myUnReadData.push(tmpData[0]);
		}
	});
	$(staffData).each(function(idx, obj) {
		var tmpData = $.grep(myUnReadData, e => e.mbrOId == obj.mbrOId);
		
		if(tmpData.length > 0) $.extend(true, staffData[idx], tmpData[0]);
	});
	return staffData;
}

function loadProhibitedWords() {
	$.ajax({
		url: prohibitUrl + '/allProhibitedWords',
		type: 'POST',
		dataType: 'json',
		success: function (ajaxData) {
			// prohibitedWords = ajaxData.data;
			localStorage.setItem("prohibitedWords", ajaxData.data);
		},
		error: function (error) {
			console.log(error);
		}
	})
}


/*
//높이 최대
function fullHeight() {
	var offset = $(parent.document).find("div[name=iframeWindow]").has("iframe[src^='"+mainFrameUrl+"']").offset()
	
	if(offset) {
		var top = offset.top;
		var height = $(parent.document).height() - top - 5;
		var frameHeight = $(".iframe_body").height();
		
		if(height <= frameHeight) return;
		
		$(".iframe_body").height(height);
		$("#chatListDiv").height(height-46);
		$("#heightResize").html("▲");
	}
}

//높이 원상태로
function undoHeight() {
	$(".iframe_body").height(initHeight);
	$("#chatListDiv").height(initHeight-46);
	$("#heightResize").html("▼");
}
*/