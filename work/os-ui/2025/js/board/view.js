$(function() {
	let queryParams = getQueryParameters();
	 //console.log("queryParams : ", queryParams);
	if(queryParams.id) {
    	getNoticeData(queryParams.id);
    }
});

function setNoticeData(data) {
	if(isAdmin) $("div[data=isAdmin]").removeClass("display_none");
	$("#brdNoticeTitle").html(data.brdNoticeTitle);
	$("#brdNoticeStatus").html( data.brdNoticeStatus ? noticeStautsMap[data.brdNoticeStatus] : "-" );
	$("#mbrName").html(data.member.mbrName);
	//$("#regDate").html(new Date(param.regDate).format("yyyy-mm-dd"));
	$("#brdNoticeContent").html(data.brdNoticeContent);
	//게시기간
	if(data.brdPostDateTimeStart && data.brdPostDateTimeEnd) {
		$("#postDate").html(`${new Date(data.brdPostDateTimeStart).format("yyyy-mm-dd(HH:MM)")} ~ ${new Date(data.brdPostDateTimeEnd).format("yyyy-mm-dd(HH:MM)")}`);
		$("div[data=postDate]").removeClass("display_none");
	}
}
