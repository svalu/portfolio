function getAvailableMemberList() {
    const url = '/rest/api/transfer/members';
    return axios.get(url);
}

//이관 confirm 메시지
function transferCustomerConfirm(data) {
	
	if($("#transfer_member_table input:checkbox:checked").length != 1) {
		uiAlert("이관할 상담원을 선택해 주세요(1명)");
		return;
	}
	
   	uiConfirm("이관하시겠습니까?", function() {
		data.memberObjId = $("#transfer_member_table input:checkbox:checked").val();
		transferCustomer(data); 
	});
}

//이관
async function transferCustomer(data) {
	const url = '/rest/api/transfer/';
    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    };
    //로그인 아이디, assignObjId, groupId
    const result = await axios.put(url, data, config);
    if(result.data.data == "success") {
		try {
			if($(parent.document).find("div[id='cnslChat_"+data.assignObjId+"'] iframe").length > 0) {
				$(parent.document).find("div[id='cnslChat_"+data.assignObjId+"'] iframe").get(0).contentWindow.unsubscribe(); //채널구독취소
				$(parent.document).find("div[id=cnslChat_"+data.assignObjId+"]").find("button[data-action=close]").click(); //채팅창 닫기
			}
		} catch(e) {
			console.log(e);
		}
		closeIframe(data.assignObjId); //현재 창 닫기
		uiAlert("이관되었습니다.");
	} else {
		
	}
}

function closeIframe(assignObjId) {
	//transfer_65449d2aad0c300f5e3ae355
	$(parent.document).find("div[id=transfer_"+assignObjId+"]").find("button[data-action=close]").click();
}