$(document).ready(async function() {
    try {
		
		const queryParams = getQueryParameters();
		const assignObjId = queryParams.targetId;
		
		if(!assignObjId) {
			uiAlert("잘못된 접근입니다.");
			return;
		}
		
        const availableMemberListResponse = await getAvailableMemberList();
        const availableMemberListData = availableMemberListResponse.data.data;
		
		
        const processor = new CustomerTransferProcessor(assignObjId);
        processor.initEvent();
        processor.initCheckBox(availableMemberListData);
    } catch (e) {
        console.error(e);
    }
});