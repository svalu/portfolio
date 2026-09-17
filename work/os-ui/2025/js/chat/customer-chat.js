let processor;
let timeIntervalId;
let postProcess;
$(document).ready(async function() {
    try {
		document.getElementById("textarea").readOnly = true;
        
        const loginId = window.localStorage.getItem("customerChatLoginId");
        const assignOId = window.localStorage.getItem("customerChatAssignOId");

        //배정정보
        const assignInfoResponse = await getChatInfo(assignOId);
        const assignInfoData = assignInfoResponse.data.data;
        const isEnd = assignInfoData.cnslrEndDate ? true : false; //채팅종료 여부 
        //console.log("assignInfoData : ", assignInfoData);
        
        $("#customerKind").text(assignInfoData.cusClsftn == "비로그인" ? "비회원" : "회원");
        $("#reqtTime").text( "("+new Date(assignInfoData.reqtDateTimeStampe).format("HH:MM") + ")" );
        $("#elapsedTime").text( "+"+ parseInt((assignInfoData.elapsedTimeStamp)/1000/60) );
        
        let second = 0;
        
        if(!isEnd) {
            $("#fillAttachReq").removeClass("display_none");
	        //경과시간 카운팅
	        timeIntervalId = setInterval(function() {
				second++;
				const addTime = parseInt(assignInfoData.elapsedTimeStamp)+(second*1000);
				$("#elapsedTime").text("+"+parseInt(addTime/1000/60));
			}, 1000);
		} else {
			//상담종료
			const chatEndTimeStamp = new Date(assignInfoData.cnslrEndDate).getTime(); //상담완료시간 
			//상담완료시간 - 요청시간(assignInfoData.reqtDateTimeStampe) 
			$("#elapsedTime").text("+"+parseInt( ( chatEndTimeStamp - assignInfoData.reqtDateTimeStampe ) /1000/60));
		}
        
        if(!assignInfoData.cnslrStrtDate) {
			$("#currentTime").text( new Date(assignInfoData.curTimeStamp).format("yyyy-mm-dd HH:MM") );		
        } else {
        	$("#currentTime").text( new Date(assignInfoData.cnslrStrtDate).format("yyyy-mm-dd HH:MM") );
        }
        
        const channelId = assignInfoData.channelId;
        const userGrp = assignInfoData.grpId;

        //cnslrStatusCode가 assign이고 이관이 아닐 때 
        const isStart = assignInfoData.cnslrStatusCode == "assign" && assignInfoData.isTransfer !== true;
        
        if(assignInfoData.cnslrStatusCode == "assign" && assignInfoData.isTransfer === true) { //이관인
            // 상담 시작일 때
			const chgRst = await changTransferStatusToChat(assignOId); //상태 chat으로 업데이트
			if(chgRst.data.data != "success") {
				uiAlert("상담 상태 변경 실패");
				return;
			}
		} 
        
        //상용구
        const boilerplateResponse = await getBoilerplateList();
        const boilerplateData = boilerplateResponse.data.data;
		
        //후처리
        postProcess = new PostProcess(assignOId, "CHAT");
        postProcess.pageSet();

        processor = new CustomerChatProcessor(channelId, loginId, assignOId, userGrp, postProcess, assignInfoData.cusSessionId);
        processor.initEvent();
        processor.initBoilerplateCombo(boilerplateData);
        
        //채팅로그
		const chatLogListResponse = await getChatLogList({channelId: channelId});
        const chatLogListData = chatLogListResponse.data.data;
        processor.initChatLogList(chatLogListData, isStart);
        
        //채팅 읽음처리
        updateChatToRead(channelId);
        //console.log("channelId : ", channelId);
        //console.log("process.channelId", processor._channelId );

        let isMinimize = false;
        var observer = new MutationObserver(function(mutationsList) {
            mutationsList.forEach(function(mutation) {
                //console.log(mutation.target);
                // 각 변화에 대해 확인
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // style 속성이 변경되었을 때 확인
                    var target = mutation.target;
                    var classList = target.classList;
                    if(classList.contains("popup_wrap") && classList.contains("ui-draggable") ) {
                        if(classList.contains("display_none")) {
                            isMinimize = true;
                        } else {
                            if(isMinimize) {
                                /*처음 들어왔을 때는 채널이아디가 변경됨 > 현재 페이지 channelId와 processor 객체의 channelId가 다름 >
                                processor.channelId로 읽은 처리함*/
                                updateChatToRead(processor._channelId);
                            }
                            isMinimize = false;
                        }
                    }
                }
            });
        });

        var targetNode = $(parent.document).find("div[id='cnslChat_"+assignOId+"']")[0]; // 감시할 대상 요소 선택
        if(targetNode) {
            var config = {attributes: true, subtree: true}; // 감시 옵션 설정
            observer.observe(targetNode, config);
        } else {
            console.log("대상요소를 못찾음");
        }

        if(!isEnd) {
            processor.subscribe(function() {
                if(isStart === true) {
                    setTimeout(function() {
                        processor.autoMsgSend("OPEN");
                    }, 1000);

                    /*const channeIdTimeout = setInterval(function() {
                        if(processor._preGroupId == "") {
                            location.reload();
                            //alert("소켓 접속 완료 전에 OPEN 메시지 보냄 / 재구독 후 메시지 갱신");
                            //$(window.parent.document).find("iframe[src$=totalCounselingHistory]").get(0).contentWindow
                        } else {
                            clearInterval(channeIdTimeout);
                        }
                    }, 1500);*/
                }
            });
		} else {
            processor.unsubscribe();
            //document.getElementById("textarea").readOnly = true;
            document.getElementById("messenger_send_bu").textContent = "상담 종료";
            document.getElementById("messenger_send_bu").classList.add("inactive");
            document.getElementById("messenger_send_bu").style.pointerEvents = "none";
			// $("#messenger_send_bu").remove();
		}
		
    } catch (e) {
        console.error(e);
    }
});