const isAdmin = location.pathname.indexOf("manageNotice") > -1;
const accessURL = isAdmin ? "manageNotice" : "notice";
const createURL = "/board/"+accessURL+"/create";
const viewURL = "/board/"+accessURL+"/view";
const listURL = "/board/"+accessURL+"/list";
const mappingPath = "/rest/api/board/notice/posts";
const noticeStautsMap = {
    "noti":"일반",
    "temp":"임시",
    "resv":"예약",
    "end":"종료"
};

function getNoticeData(id) {
	$.ajax({
        url: mappingPath+'/'+id, 
        type: 'POST',
        data: "",
        dataType: 'json',
        success: function(rstData) {
			var jsonData = rstData.data;
        	if(jsonData.length == 1) {
	        	let json = jsonData[0];
	        	setNoticeData(json);
                $("#brdNoticeStatus").trigger("change");
			} else {
				uiAlert("잘못된 접근입니다.");
			}
        },
        error: function(error) {
			uiAlert("서버와의 통신에 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });
}
