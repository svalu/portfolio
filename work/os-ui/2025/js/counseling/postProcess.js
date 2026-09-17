function PostProcess(targetId, postProcType) {
	this.categData = "";
	this.postProcType = postProcType;
	//this.menuId = "";
	this.targetId = targetId;
	this.targetObj = "postProcessDiv";
	const $this = this;
	
	
	this.pageSet = function() {
		
		const url = "/counseling/postProcess";
		$.ajax({
	        url: url, 
	        type: 'GET',
	        data: "",
	        success: function(rstData) {
				$("#"+$this.targetObj).append(rstData);
				$("#postProcType").html($this.postProcType == "CHAT" ? "채팅" : "상담예약");

				if($this.postProcType == "CHAT") {
					$("#closeChatDiv").removeClass("display_none");
					$("#userNameDiv").removeClass("display_none");
					$("#userMobileDiv").removeClass("display_none");
				}
				$this.getCategoryData();
	        },
	        error: function(error) {
	            console.error("An error occurred:", error);
	        }
	    });
	}
	
	this.getCategoryData = function() {
		
		$.ajax({
	        url : "/rest/api/counselingClassifier/list",
	        type : "POST",
	        dataType : "json",
	        async : false,
	        success : function(ajaxData) {
				$this.categData = ajaxData.data;
				$this.initEvent();
				$this.setCategMain();
				//$this.getPostProcessData();
	        },
	        error : function(error) {
	            console.log(error);
	        }
	    })
	}
	
	this.initEvent = function() {

		$("#userMobile").validateOnInput("phone");

		$(".side_bar").css("cursor", "pointer").on("click", function(event) {
			$("#postProcessDiv").toggleClass("active");
		});;
		
		
		$("#postProcessSave").on("click", function(event) {
			$this.postProcessSaveValidation();
		});
		
		$("#cateMainId").on("change", function() {
			$this.setSubCateg(this.value, 1);
		});
		
		$("#cateMiddleId").on("change", function() {
			$this.setSubCateg(this.value, 2);
		});
		
		//$("#cateMainId, #cateMiddleId, #cateSubId").css("width", "72px");
		
	}
	
	this.setCategMain = function() {
		var depth1 = $.grep($this.categData, e => e.categIsUse == "true" && e.categLevel == "0");
		var sortData = depth1.sort( (a, b) => ( a.categSeq - b.categSeq ) );
		
		var html = "";
		$(sortData).each(function(idx, obj) {
			html += `<option value="${obj.id}">${obj.name}</option>`;
		});
		
		$("#cateMainId").append(html);
	}
	
	this.setSubCateg = function(categId, idx) {
		var targetLevel = idx; 
		var searchData = $.grep($this.categData, e => e.categIsUse == "true" && e.categLevel == targetLevel && e.parentId == categId);
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

	this.getCnslAssingData = function(callback) {

		$.ajax({
			url : "/api/rest/customer/chat/assign/"+$this.targetId,
			type : "POST",
			dataType : "json",
			success : function(ajaxData) {
				if(ajaxData.data) {
					if(ajaxData.data.closeChat) {
						$("#closeChat").html( CLOSE_CHAT[ajaxData.data.closeChat] );
					}
				}
				if(typeof(callback) == "function") {
					callback();
				}

			},
			error : function(error) {
				console.log(error);
			}
		});
		///api/rest/customer/chat/assign/
	}
	
	this.getPostProcessData = function() {

		/*var param = {
		"postProcType" : $this.postProcType
		};*/
		
		$.ajax({
	        url : "/rest/api/counseling/postProcess/"+$this.targetId,
	        type : "GET",
	        dataType : "json",
	        success : function(ajaxData) {
				if(ajaxData.data) {
					$("#postProcessSave").remove(); 
					$this.setPostProcessData(ajaxData.data);
				} else {
					$("#postProcessSave").removeClass("display_none");
				}
	            
	        },
	        error : function(error) {
	            console.log(error);
	        }
	    });
	}
	
	this.setPostProcessData = function(data) {
		$("#cateMainId").val(data.cateMainId);
		$this.setSubCateg(data.cateMainId, 1);
		$("#cateMiddleId").val(data.cateMiddleId);
		$this.setSubCateg(data.cateMiddleId, 2);
		$("#cateSubId").val(data.cateSubId);
		$("#postProcTitle").val(data.postProcTitle);
		$("#postProcContent").val(data.postProcContent);
		
		$("textarea, select").prop("disabled", true);
	}
	
	this.postProcessSaveValidation = function() {
		
		if($this.postProcType == "CHAT") {
			//if(!processor._chatIsEnd) {
			if(!document.getElementById("textarea").readOnly) {
				uiAlert("채팅종료 후 저장해 주세요.");
				return;
			}
		}
		
		if($("#cateMainId").val() == "") {
			uiAlert("대분류를 선택해 주세요");
			return;
		}
		
		if(!$("#cateMiddleId").attr("disabled")) {
			if($("#cateMiddleId").val() == "") {
				uiAlert("중분류를 선택해 주세요");
				return;
			}
		}
		
		if(!$("#cateSubId").attr("disabled")) {
			if($("#cateSubId").val() == "") {
				uiAlert("소분류를 선택해 주세요");
				return;
			}
		}
		
		if($("#postProcTitle").val() == "") {
			uiAlert("제목을 입력해 주세요");
			return;
		}
		
		if($("#postProcContent").val() == "") {
			uiAlert("내용을 입력해 주세요");
			return;
		}

		if($.trim($("#userMobile").val()) != "") {
			if(!$.trim($("#userMobile").val()).validate("phone")) {
				uiAlert("잘못된 번호입니다. 다시 입력해 주세요.");
				return;
			}
		}
		
		let msg = "후처리 저장 시 상담완료 처리됩니다.<br>(상담완료 후 수정불가)<br>저장 하시겠습니까?";
		uiConfirm(msg, function() {
			$this.postProcessSave();
		});
	}
	
	this.postProcessSave = function() {
		var param = {
			"targetId" : $this.targetId,
			"postProcType" : $this.postProcType,
			"cateMainId" : $("#cateMainId").val(), 
			"cateMiddleId" : $("#cateMiddleId").val(), 
			"cateSubId" : $("#cateSubId").val(), 
			"postProcTitle" : $.trim($("#postProcTitle").val()), 
			"postProcContent" : $.trim($("#postProcContent").val()),
			"userName": $.trim($("#userName").val()),
			"userMobile": $.trim($("#userMobile").val())
		};
		
		$.ajax({
	        url : "/rest/api/counseling/postProcess/save",
	        type : "POST",
	        dataType : "json",
	        data : param,
	        success : function(ajaxData) {
				
				if(ajaxData.data == "success") {
					$("#postProcessSave").remove();
					$("textarea, select").prop("disabled", true);

					try {
						processor.appendMsg({'sysMsgYn':'Y', 'msg':'후처리가 완료 되었습니다.'});

					} catch(e) {

					}

					if($("#postProcessDiv").hasClass("active")){
						$(".side_bar").click(); //후처리 닫기

					}
					//uiAlert("후처리가 완료 되었습니다.", function() {
					let eventData = {
						type : "closeWindow",
						params : {
							menuId : "cnslChat_"+$this.targetId
						}
					};
					window.parent.postMessage(eventData, "*");
					//});

				} else {
					console.error("An error occurred:", error);
				}
				
	        },
	        error : function(error) {
	            console.error("An error occurred:", error);
	        }
	    })
	}	
}