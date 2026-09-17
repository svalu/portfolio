const mappingPath = "/rest/api/analytics/admin/auditLog";

$(function() {
	let queryParams = getQueryParameters();
	 //console.log("queryParams : ", queryParams);
	if(queryParams.id) {
    	getRsn(queryParams.id);
    }
	
});

function getRsn(id) {
	$.ajax({
        url: mappingPath+'/'+id, 
        type: 'POST',
        data: "",
        dataType: 'json',
        success: function(rstData) {
			var jsonData = rstData.data;
        	if(jsonData) {
				$("#auditLogRsn").val(jsonData.auditLogRsn);
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

