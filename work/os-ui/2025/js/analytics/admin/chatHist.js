$(document).ready(function() {
    initData();
})

function initData() {
    let queryParams = getQueryParameters();
    let url = "/rest/api/analytics/admin/tot-cnsl-hist/chat/hist/" + queryParams.targetId;

    $.ajax({
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            viewChatLogHist(ajaxData);
        },
        error : function(error) {

        }
    })
}

function viewChatLogHist(chatLogList) {

    for(let i in chatLogList) {
        const chatLog = chatLogList[i];
        const targetViewer = "chat_view_wrap";

        const questionHtml = chatLog.question && `
                <div class="chating_left_wrap">
                    <div class="chat_balloon left">${chatLog.question}</div>
                    <div class="chat_balloon_text_wrap">
                        <span class="chat_balloon_text">${new Date(chatLog.questionDate).format("yyyy년 mm월 dd일 TT HH:MM")}</span>
                    </div>
                </div>`;

        const replyHtml = chatLog.reply && `
                <div class="chating_right_wrap">
                    <div class="chat_balloon right">${chatLog.reply}</div>
                    <div class="chat_balloon_text_wrap">
                        <span class="chat_balloon_text">${new Date(chatLog.replyDate).format("yyyy년 mm월 dd일 TT HH:MM")}</span>
                    </div>
                </div>`;

        const attachHtml = chatLog.attachFiles && getFileList(chatLog.attachFiles);

        $('.'+targetViewer).append(questionHtml).append(replyHtml).append(attachHtml);

        var mesgs = $('.'+targetViewer);
        mesgs.scrollTop(mesgs.prop('scrollHeight') - mesgs.prop('clientHeight'));
    }
}

function getFileList(attachFiles) {
    let attachObj;
    if(attachFiles) {
        attachObj = $(`<div class="user_file_container">
				<div class="user_file_box">
				</div>
			</div>
			`);

        $(attachFiles).each(function(idx, obj) {

            const extension = obj.orgFileName.split(".").pop();
            const tmpFileName = obj.orgFileName.replace("."+extension, "");
            const fileObj = $(`<div class="user_file_wrap">
						<div class="user_file_icon file"></div>
						<div class="user_file_name">${tmpFileName}</div>
						<span>[.${obj.fileExt}, ${Math.ceil(obj.fileSize/1024)}KB] </span>
					</div>`);

            if(obj.isDown == true) {
                fileObj.css("cursor", "pointer").on("click", function() {
                    getChatFile(obj.path, obj.serverFileName, obj.orgFileName);
                });
            }
            $(attachObj).find(".user_file_box").append(fileObj);
        });
    }
    return attachObj;
}
