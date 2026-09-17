//let categData;

function getBoilerplateList() {
    const url = '/rest/api/boilerplate/list';
    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    };
    return axios.get(url, config);
}
function getChatLogList(data) {
    const url = '/rest/api/customer/chat/log/list:retrieve';
    return axios.post(url, data);
}

function getChatInfo(data) {
	const url = '/api/rest/customer/chat/assign/'+data;
    return axios.post(url, data);
}

function chatTransfer(assignOId) {
	if(!assignOId) {
		uiAlert("이관할 상담 정보가 없습니다.");
		return;
	}
	let eventData = {
	        type : "openNewWindow",
	        params : {
	            url : "/counseling/customer/transfer",
	            menuId : "transfer_"+assignOId,
	            menuName : "상담채팅-상담이관",
	            sendParams : {
					"targetId" : assignOId
	            }
	        }
	    }
	    window.parent.postMessage(eventData, "*");
}

async function getChatFile(path, name, orgName) {
	const data = {
		"path":path,
		"serverFileName":name,
		"orgFileName": orgName
	};

	const url = `/rest/api/customer/chat/download`;
	var form = document.createElement('form');


	var new_frame = $("<iframe id='ifm_fileDownload' name='ifm_fileDownload' style='display:none;'></iframe>");
	new_frame.appendTo("body");

	form.method = "post";
	form.action = url;
	form.target = "ifm_fileDownload";

	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			var input = document.createElement("input");
			input.type = "hidden";
			input.name = key;
			input.value = data[key];
			form.appendChild(input);
		}
	}
	document.body.appendChild(form);
	form.submit();

	//$("#ifm_fileDownload").attr("src", url);

	setTimeout(function(){
		document.body.removeChild(form);
		$("#ifm_fileDownload").remove();
	},1000);

	//const file = window.URL.createObjectURL(fileData[data]);

}
/*
function getCategoryList() {
	const url = "/rest/api/counselingClassifier/list";
	return axios.post(url, {});
}

function setMainCateg() {
	
	var depth1 = $.grep(categData, e => e.categIsUse == "true" && e.categLevel == "0");
	var sortData = depth1.sort( (a, b) => ( a.categSeq - b.categSeq ) );
	
	var html = "";
	$(sortData).each(function(idx, obj) {
		html += `<option value="${obj.id}">${obj.name}</option>`;
	});
	
	$("#cateMainId").append(html);
}

function setSubCateg(categId, idx) {
	var targetLevel = idx; 
	var searchData = $.grep(categData, e => e.categIsUse == "true" && e.categLevel == targetLevel && e.parentId == categId);
	var sortData = searchData.sort( (a, b) => ( a.categSeq - b.categSeq ) );
	
	var initOptionArr = ["대분류","중분류","소분류"];
	var targetObj = ["cateMainId","cateMiddleId","cateSubId"];
	
	if(sortData.length > 0) {
		var html = "";
		$(sortData).each(function(idx, obj) {
			html += `<option value="${obj.id}">${obj.name}</option>`;
		});
	
		$("#"+targetObj[idx]).html(`<option value="">${initOptionArr[idx]}</option>`).append(html).attr("disabled", false);
	} else {
		$("#"+targetObj[idx]).html(`<option value="">${initOptionArr[idx]}</option>`).attr("disabled", true);
		if(idx == 1) $("#"+targetObj[2]).html(`<option value="">소분류</option>`).attr("disabled", true);
	}		
}
*/
function unsubscribe() {
	processor.unsubscribe();
}

//이관된 상담 상태 업데이트(chat)
function changTransferStatusToChat(assignOId) {
	var url = "/rest/api/counseling/customer/chat/start/"+assignOId;
	return axios.post(url, {});
}

function updateChatToRead(channelId) {
	var url = "/rest/api/counseling/customer/chat/read/"+channelId;
	return axios.put(url, {});
}

function getPostProcHistory(params) {
	var url = "/rest/api/counseling/postProcess/list";
	return axios.post(url, params);
}

function getPostProcHistoryDetail(targetId) {
	var url = "/rest/api/counseling/postProcess/"+targetId;
	return axios.get(url, {});
}



/*
function getPostProcessForm() {
	var url = "/counseling/postProcess?targetId=654c856830a41f070ef38eac&postProcType=CHAT";
	
	$.ajax({
        url: url, 
        type: 'GET',
        data: "",
        //dataType: 'json',
        success: function(rstData) {
			//console.log(rstData);
			
			$("#postProcessDiv").html("").append(rstData);
			postProcess.pageSet();
			
        },
        error: function(error) {
			
            console.error("An error occurred:", error);
        }
    });
}
*/

