$(document).ready(async function() {
    try {
        const self = window.localStorage.getItem("staffChatOid");
        const target = window.localStorage.getItem("staffChatTargetOid");

        const channelResponse = await getChannel({selfMemberObjId: self, targetMemberObjId: target});
        const channelData = channelResponse.data.data;

        const chatLogResponse = await getChatLogList({channelObjId: channelData.channelObjId});
        const chatLogData = chatLogResponse.data.data;
		
		changeChatLogListStatusToRead(channelData.channelObjId);

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
                                changeChatLogListStatusToRead(channelData.channelObjId);
                            }
                            isMinimize = false;
                        }
                    }
                }
            });
        });

        var targetNode = $(parent.document).find("div[id='staffChat_"+target+"']")[0]; // 감시할 대상 요소 선택
        if(targetNode) {
            var config = {attributes: true, subtree: true}; // 감시 옵션 설정
            observer.observe(targetNode, config);
        } else {
            console.log("대상요소를 못찾음");
        }

        const currentTime = channelData.currentTime ? channelData.currentTime : null;
        $("#currentTime").text( new Date(currentTime).format("yyyy-mm-dd HH:MM") );
        const processor = new EmployeeChatProcessor(channelData.channelObjId, self);
        processor.initEvent();
        processor.showChatHistory(chatLogData);
        processor.subscribe();
    } catch (e) {
        console.error(e);
    }
});