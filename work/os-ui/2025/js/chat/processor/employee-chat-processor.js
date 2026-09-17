class EmployeeChatProcessor {
    constructor(channelObjId, memberObjId) {
        this._channelObjId = channelObjId;
        this._memberObjId = memberObjId;
    }

    initEvent() {
        $("div.popup_setting_line").addClass("display_none");

		//컨트롤 + 엔터 : 메시지 전송
        $('#textarea').bind({
            keydown: function(e) {

                if (e.keyCode == 13 && e.altKey) {
                    const textVal = $(this).val() + "\n";
                    $(this).val(textVal);
                } else if (e.keyCode == 13) {
                    e.preventDefault();
                    if($.trim(this.value) != "") $('#messenger_send_bu').click();
                }
            }
        });
	    
        $('#messenger_send_bu').click(() => {
            const textarea = $('#textarea');
            const contents = textarea.val();

            if($.trim(contents) != "") {

                const data = {
                    channelObjId: this._channelObjId,
                    writerObjId: this._memberObjId,
                    message: contents
                };
                window.parent.employeeStomp.send(data);
                textarea.val('');
            }
        });
    }

    showChatHistory(chatLogList) {
        for(let i in chatLogList) {
            const chatLog = chatLogList[i];
            const direction = this._memberObjId === chatLog.writerObjId ? 'right' : 'left';
            const html = `
            <div class="chating_${direction}_wrap">
                <div class="chat_balloon ${direction}">${chatLog.message}</div>
                <div class="chat_balloon_text_wrap">
                    <span class="chat_balloon_text">${new Date(chatLog.regDate).format(DATETIME_FORMAT)}</span>
                </div>
            </div>`;
            $('.contents').append(html);
        }
        this.chatViewScroll();
    }
    
    chatViewScroll() {
		//스크롤바 제일 밑으로 이동
        setTimeout(function() {
			var mesgs = $('.chat_view_wrap');
			mesgs.scrollTop(mesgs.prop('scrollHeight') - mesgs.prop('clientHeight'));
		}, 100);
	}

    subscribe() {
        window.parent.employeeStomp.sub(this._channelObjId, (data) => {
            const contents = JSON.parse(data.body);
            
            if(this._memberObjId != contents.writerObjId) {
                try {
                    if(!$(parent.document).find("div[id=staffChat_"+contents.writerObjId+"]").hasClass("display_none")) {
                        changeStatusToRead(contents.id);
                    }
                } catch(e) {
                }
            }

            const direction = this._memberObjId === contents.writerObjId ? 'right' : 'left';
            const html = `
                <div class="chating_${direction}_wrap">
                    <div class="chat_balloon ${direction}">${contents.message}</div>
                    <div class="chat_balloon_text_wrap">
                        <span class="chat_balloon_text">${new Date(contents.regDate).format(DATETIME_FORMAT)}</span>
                    </div>
                </div>`;
            $('.contents').append(html);
            this.chatViewScroll();
        });
    }
}



