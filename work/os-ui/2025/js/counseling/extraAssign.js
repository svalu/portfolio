let dataUrl = "/rest/api/counseling/extraAssign";
let mbrOid = "";
$(document).ready(function() {
	
	let queryParams = getQueryParameters();
	 
	if(queryParams.id) {
    	mbrOid = queryParams.id; 
    }
	
	$("#assignBtn").on("click", function() {
		assignConfirm();
	});
	if(mbrOid) {
		getList();
	} else {
		uiAlert("잘못된 접근입니다.");
	}
	
});

function getList() { //데이터 가져오기
	
	//$("#assignListDiv").html("");
	$.ajax({
        url: dataUrl+"/list", 
        type: "POST",
        data: "",
        dataType: 'json',
        success: function(rstData) {
			//console.log(rstData);
			if(rstData.data) {
				appendList(rstData.data);
			}
			//getList();
        },
        error: function(error) {
			uiAlert("서버와의 통신에 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });
}

function appendList(json) { //리스트 출력
	$("#assignListTable tr").not("[id=head]").remove();
	//new Date(obj.hopeDate).format("mm-dd")
	if(json.length > 0) {
		$(json).each(function(idx, obj) {
			$("#assignListTable").append(`
			<tr>
	            <td>`+(obj.cusClsftn == "비로그인" ? "비회원" : "회원")+`</td>
	            <td>`+new Date(obj.reqtDate).format("HH:MM")+` + ${parseInt(obj.elapsedTimeStamp/1000/60)}분</td>
	            <td><input type="checkbox" name="assignId" value="${obj.id}"></td>
	        </tr>
			`);
		});
	} else {
		$("#assignListTable").append(`
			<tr>
	            <td colspan="3">대기고객이 없습니다.</td>
	        </tr>
			`);
	}
}

function assignConfirm() { //추가배정 confirm
	
	if($("#assignListTable input:checkbox:checked").length == 0) {
		uiAlert("배정할 고객을 선택해 주세요");
		return;
	}
	
	uiConfirm("배정하시겠습니까?", function() {
		assign();
	});
}

function assign() { //추가배정
	
	var param = $("#assignListTable input:checkbox:checked").serialize();
	$.ajax({
        url: dataUrl+"/assign/"+mbrOid, 
        type: "POST",
        data: param,
        dataType: 'json',
        success: function(rstData) {
			if(rstData.data == "success") {
				uiAlert("배정되었습니다.");
				getList();
			} else {
				uiAlert("에러가 발생했습니다.");
			}
			//getList();
        },
        error: function(error) {
			uiAlert("서버와의 통신에 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });
    
}