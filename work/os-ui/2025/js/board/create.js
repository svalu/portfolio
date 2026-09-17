let noticeId = "";
let listMenuId = "64ebfdf11f634946e2336074";
//let menuIdList = "noticeList";
//let menuIdCreate = "noticeCreate"; 

$(function() {

	if(!isAdmin) {
		uiAlert("접근 권한이 없습니다.", function() {
			document.write("접근권한이 없습니다.")
		});
		return;
	}

	for(let key in noticeStautsMap) {
		$("#brdNoticeStatus").append(`<option value="${key}">${noticeStautsMap[key]}</option>`);
	}



	$("#brdNoticeStatus").on("change", function(evt) {
		if($("#brdNoticeStatus").val() != "resv") {

			$("div.workspace div[name^=noticePeriod_]").css("visibility", "hidden");
			$("#brdPostDateTimeStart").attr("disabled", true);
			$("#brdPostDateTimeEnd").attr("disabled", true);
		} else {
			$("div.workspace div[name^=noticePeriod_]").css("visibility", "visible");
			$("#brdPostDateTimeStart").attr("disabled", false);
			$("#brdPostDateTimeEnd").attr("disabled", false);
		}
	})
	
	let queryParams = getQueryParameters();
	
	if(queryParams.id) {
    	getNoticeData(queryParams.id);
		$("div[data=regDate]").removeClass("display_none");
    } else {
		$("#brdNoticeStatus").trigger("change");
	}
	/*
	if(queryParams.mbrName) {
		$("#mbrName").val(queryParams.mbrName);
	}
	*/
	
    $('#brdNoticeContent').trumbowyg({
		lang: 'ko',
		resetCss: true,
		btns: [
	    	['undo', 'redo'], // Only supported in Blink browsers
	    	['fontfamily', 'fontsize'],
	    	['foreColor', 'backColor'],
	    	['strong', 'em', 'del','underline'],
	    	['noembed'],
	    	['base64'], 
	    	//['upload'],
			['fullscreen'],		
	    ],    
	    plugins: {
	    	fontsize: {
	    		sizeList: ['10px','12px','14px','16px','18px','20px']
	    	},
        },
    });
    /*
    $("#brdNoticeTitle").on('keydown keyup', function(event) {
		var rst = inputLengthCheck($(this));
		var targetId = $(this).attr("id");

		if(!rst.success) {
			$(this).attr("disabled", true);
			uiAlert(rst.msg, function() {
				$("#"+targetId).val($("#"+targetId).val().substr(0,rst.maxLength));
				$("#"+targetId).attr("disabled", false);	
			});
		}
	});
	
    $('#brdNoticeContent').trumbowyg().on('tbwchange keydown keyup', function(){
		var rst = inputLengthCheck($(this));
		var targetId = $(this).attr("id");
		
		if(!rst.success) {
			$(this).trumbowyg('disable');
			uiAlert(rst.msg, function() {
				$("#"+targetId).trumbowyg('enable');
				$('.trumbowyg-editor').focus();
			});
		}
	});

	let now = new Date(Date.now()).toLocaleDateString();
	now = now.substring(0, now.length - 1).replaceAll(". ", "-");
    $("#regDate").val(now);
	*/
	var dropDownMenuEvent = new DropDownMenuEvent({
        selector : "div.setting_line_oj",
        menus : {
            "create" : {
                menuName : "저장",
                callback : noticeSave,
                args : []
            },
            "cancle" : {
                menuName : "취소",
                callback : closeCreateIframe,
                args : []
            }
        }
    });
});

function refreshList() {
	let eventData = {
		type : "triggerFunction",
		params : {
			menuId : listMenuId,
			functionName : "movePage",
			functionParams : [1],
		}
	}
	window.parent.postMessage(eventData, "*");
}

function setNoticeData(param) {
	
	noticeId = param.id;

	$("#brdNoticeStatus").val(param.brdNoticeStatus);
	$("#brdPostDateTimeStart").val(param.brdPostDateTimeStart);
	$("#brdPostDateTimeEnd").val(param.brdPostDateTimeEnd);

	if(param.brdNoticeIsTop) {
		$("#brdNoticeIsTop").prop("checked", true);
	}

	$("#regDate").val(new Date(param.regDate).format(DATETIME_FORMAT));
	$("#brdNoticeTitle ").val(param.brdNoticeTitle);
	
	setTimeout(function() {
		$("#brdNoticeContent").trumbowyg('html', param.brdNoticeContent);	
	}, 10);
	
}

function noticeValidation() {
	
	var rstObj = {
		"success" : true
	};
	
	$("input, textarea").filter("[required='required']").each(function(idx, obj) {
		
		
		var validationResult = true; 
		var editor = isEditor(obj);
		var objValue = "";
		var vLength = 0;
		var maxLength = $(obj).data("max");
		
		if(editor) {
			objValue = $.trim($(obj).trumbowyg('html'));
		} else {
			objValue = $.trim($(obj).val());
		}
		vLength = getStripTag(objValue).length;
		//입력값 체크
		if(objValue == "") {
			validationResult = false;
			rstObj = {
				"success" : false,
				"msg" : $(obj).prop("title").appendEulReul()+" 입력해 주세요",
				"callback" : function() {
					if(editor) {
						$('.trumbowyg-editor').focus(); 
					} else {
						$(obj).focus();
					}	
				}
			};
		}
		
		if(!validationResult) {
			return false;
		}
		
		//length 체크
		if(vLength > maxLength) {
			
			rstObj = {
				"success" : false,
				"msg" : ($(obj).prop("title") ? $(obj).prop("title").appendEunNeun()+" " : "") + maxLength+"자를 초과할 수 없습니다.",
				"callback" : function() {
					if(editor) {
						$('.trumbowyg-editor').focus(); 
					} else {
						$(obj).focus();
					}	
				}
			};
		}
		
		if(!validationResult) {
			return false;
		}
	});
	
	return rstObj;
}

function isEditor(obj) {
	var isEditor = $(obj).hasClass("trumbowyg-textarea");
	return isEditor;
}

function noticeSave() {
	//const brdPostDateTimeStart =  $("#brdNoticeStatus").val() != "resv" ? "" : $("#brdPostDateTimeStart").val();
	//const brdPostDateTimeEnd = $("#brdNoticeStatus").val() != "resv" ? "" : $("#brdPostDateTimeEnd").val();
	const brdPostDateTimeStart =  $("#brdPostDateTimeStart").val().replace("T", " ");
	const brdPostDateTimeEnd = $("#brdPostDateTimeEnd").val().replace("T", " ");

	var param = {
		"brdNoticeIsTop" : $("#brdNoticeIsTop").prop("checked"),
		"brdNoticeTitle" : $.trim($("#brdNoticeTitle").val()),
		"brdNoticeStatus" : $("#brdNoticeStatus").val(),
		"brdPostDateTimeStart" : brdPostDateTimeStart,
		"brdPostDateTimeEnd" : brdPostDateTimeEnd,
		"brdNoticeContent" : $.trim($("#brdNoticeContent").trumbowyg('html'))
	};

	if(param.brdNoticeStatus == "resv") {
		if(param.brdPostDateTimeStart == "" || param.brdPostDateTimeEnd == "") {
			uiAlert("게시기간을 선택해 주세요.");
			return;
		}

		if(param.brdPostDateTimeStart > param.brdPostDateTimeEnd) {
			uiAlert("조회 시작일이 종료일보다 큽니다.");
			return;
		}

	}
	
	var rst = noticeValidation();
	
	if(!rst.success) {
		uiAlert(rst.msg, rst.callback);
		return;
	}
	
	var url = mappingPath+"/insert";
	var type = "POST";
	if(noticeId) {
		param.id = noticeId;
		url = mappingPath+"/"+noticeId;
		type = "PUT";	
	}
	
	$.ajax({
        url: url, 
        type: type,
        data: param,
        dataType: 'json',
        success: function(rstData) {
			
			if(rstData.data == "success") {
				var callback = () => { 
					//$(parent.document).find(`div[name=iframeWindow][id="${listURL}"] iframe`).get(0).contentWindow.getList();
					if($(parent.document).find("iframe[src^='"+listURL+"']").length > 0) {
						$(parent.document).find("iframe[src^='"+listURL+"']").get(0).contentWindow.getList();
					}
					closeCreateIframe();
				};
				
				uiAlert("저장되었습니다.", callback);
				//refreshList();
			} else {
				
			}
        },
        error: function(error) {
			uiAlert("서버와의 통신에 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });
}

function closeCreateIframe() {
	//$(parent.document).find("div[id^='"+createURL+"'] button[data-action=close]").click();
	$(parent.document).find("div[name=iframeWindow]").has("iframe[src^='"+createURL+"']").find("button[data-action=close]").click();
	//$("iframe[src^='/board/manageNotice/create']").closest("div").find("button[data-action=close]").click();
	
}

/*
function inputLengthCheck(obj) {
	
	var targetId = $(obj).attr("id");
	var maxLength = $(obj).data("max");
	var editor = isEditor(obj);
	var value = "";
	var rst = true;
	var msg = "";
	
	var rstObj = {
		"success": true,
		"maxLength": maxLength,
		"msg": ""
	};
	
	if(editor) {
		value = getStripTag($.trim($(obj).trumbowyg('html')));
	} else {
		value = $.trim($(obj).val());
	}
	
	if(value.length > maxLength) {
		rstObj.success = false;
		
		if($(obj).prop("title")) {
			msg = $(obj).prop("title").appendEunNeun()+" ";
		}
		msg += maxLength+"자를 초과할 수 없습니다.";
		rstObj.msg = msg;
	}
	return rstObj;
}

function inputValueCheck(obj) {
	var value = "";
	var editor = isEditor($(obj));
	var vLength = 0;
	var rstObj = {
		"success": true, 
		"msg": ""
	}
	
	if(editor) {
		value = $.trim($(obj).trumbowyg('html'));
	} else {
		value = $.trim($(obj).val());
	}
	vLength = value.length;
	
	if(value == "") {
		rstObj.success = false;
		rstObj.msg = $(obj).prop("title").appendEulReul()+" 입력해 주세요";
		rstObj.callback = function() {
			if(editor) {
				$('.trumbowyg-editor').focus(); 
			} else {
				$(obj).focus();
			}	
		}
	}
	return rstObj;
}
*/