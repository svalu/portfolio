class CustomerTransferProcessor {
    constructor(assignObjId) {
        this._assignObjId = assignObjId;
    }

    initEvent() {
		const $this = this;
		$("#assign_button").click(() => {
			const data = {
                assignObjId: $this._assignObjId,
                memberObjId: ""
            };
            transferCustomerConfirm(data);
        });
    }

    initCheckBox(transferMemberList) {
		
        for(let i in transferMemberList) {
            const transferMember = transferMemberList[i];
            
            const cnslStatusStr = (transferMember.chatCnt + transferMember.assignCnt) > 0 ? "상담중" : "상담대기";
            
            $('#transfer_member_table > tbody:last').append(`
                <tr>
                    <td>${transferMember.mbrName}</td>
                    <td>${cnslStatusStr}</td>
                    <td><input type="checkbox" name="memberOjbId" value="${transferMember.memberOjbId}"></td>
                </tr>`
            );
        }
		$("#transfer_member_table input:checkbox").on("click", function(event) {
			if($(this).prop("checked")) {
				$("#transfer_member_table input:checkbox").not(this).prop("checked", false); //this 제외 체크박스 체크해제
			}
		});
    }
}