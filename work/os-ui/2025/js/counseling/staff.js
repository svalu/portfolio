const staff = {
	getList: function(callback) {
		var dataUrl = mappingPath[pageCode]["list"];
		//상담중/상담대기(currentStatus), 상담상태(mbrStateCd), 리스트
		$.ajax({
			url: dataUrl,
			type: 'POST',
			data: "",
			dataType: 'json',
			success: function(rstData) {
				//직원목록 + 읽지 않은 메시지
				rstData.data.listData.staff = combineData(rstData.data.listData);
				var staffData = rstData.data.listData.staff;
				isAdmin = rstData.data.isAdmin;
				leftMenuBlinkerSet(rstData.data.listData);
				//if(!isAdmin) false;
				staff.appendList(staffData);
				if(typeof(callback) == "function") callback();
				/*				
				$(staffData).each(function(idx, obj) {
					var found = $.grep(statusData, e => e.mbrId === obj.mbrId);
					if (found.length > 0) {
					    $.extend(true, obj, found[0]);
					}
				});
				*/
			},
			error: function(error) {
				//uiAlert("서버와의 통신에 실패하였습니다.");
				console.error("An error occurred:", error);
			}
		});
	},
	appendList: function(json) { //리스트 출력
		//console.log(json);
		let openListArr = [];
		$("#chatListDiv .oj_group_wrap.active").each(function(idx, obj) {
			openListArr.push($(this).attr("id"));
		});

		$("#chatListDiv").html("");
		var html = "";
		var titleObj = titleMap[pageCode];
		var cntObj = {};
		
		for(var key in titleMap[pageCode]) {
			cntObj[ key ] = 0;
		}
		
		if(json) {
			$(json).each(function(idx, obj) {
				if(!cntObj[obj.cnslStatus]) cntObj[obj.cnslStatus] = 0; 
				cntObj[obj.cnslStatus]++;
			});
		}
		
		for(var key in titleMap[pageCode]) {
			var html = `
				<div class="oj_group_wrap" id="${key}">
			        <div class="oj_group_top">
			            <span class="oj_group_top_text_1" name="title">${titleObj[key]}</span>
			            <span class="oj_group_top_text_1" name="subListCnt">(${cntObj[key]}명)</span>
			            <div class="oj_group_top_triangle" name="toggleList">▲</div>
			        </div>
			        <div class="oj_group_middle_wrap" name="subListDiv">
			            
			        </div>
			    </div>`;
			$("#chatListDiv").append(html);
		}
		
		//리스트 토글
		$("#chatListDiv .oj_group_top").on("click", function(event) {
			$(this).parent("div").toggleClass("active");
		});
		//chat(상담중) 홍길동(상담중2명/배정2명)
		//lunch(점심), recess(휴게) 김철수(12분)
		//rsvtn(예약상담), off, on  이강인
		//
		if(json) {
			$(json).each(function(idx, obj) {
				var html = `<div class="oj_group_middle" data-id="${obj.mbrOId}">
			        <span class="oj_group_middle_text_1" name="staffNm">${obj.mbrName}</span>
			        <span class="oj_group_middle_text_1">`+function() {
						var rst = "";
						switch(obj.cnslStatus) {
							case "chat":
								rst = `(상담중${!obj.chatCnt? "0" : obj.chatCnt}명/배정${!obj.assignCnt?"0":obj.assignCnt}명)`;
								break;
							case "lunch": 
							case "recess":
								if(obj.elapsedTimeStamp) {
									rst = "+"+timestampToMinute(obj.elapsedTimeStamp)+"분";
								} else {
									rst = "";
								}
								break;
							default:
								rst += "";
						}					
						return rst;

					}()+`</span>
			        `+function() { //안읽은 메시지 말풍선
						if(obj.unReadCnt) {
							return `<div class="oj_group_icon balloon"><span>${obj.unReadCnt}</span></div>`;
						} else {
							return ``;
						}
					}()+`
			    </div>`;
				$("#"+obj.cnslStatus+" div[name=subListDiv]").append(html);

				//24-01-22 이민호
				//처음 열었을때 리스트 안펼쳐지도록 변경
				// if(!$("#"+obj.cnslStatus).hasClass('active')) $("#"+obj.cnslStatus).addClass("active");
			});
		}
		//console.log("openListArr", openListArr);
		//원래 열려있던 메뉴 오픈하기
		for(var key in openListArr) {
			if($("#chatListDiv .oj_group_wrap[id="+openListArr[key]+"] .oj_group_middle").length > 0) {
				$("#chatListDiv .oj_group_wrap[id="+openListArr[key]+"]").addClass("active");
			} else {
				$("#chatListDiv .oj_group_wrap[id="+openListArr[key]+"]").removeClass("active");
			}
		}

		//리스트 토글 - 직원목록이 있으면 토글
		$("#chatListDiv .oj_group_top").each(function(idx, obj) {
			if($(this).next("div").find("div.oj_group_middle").length > 0) {
				$(this).on("click").off("click").on("click", function(event) {
					$(this).parent("div").toggleClass("active");
				});
			} else {
				$(this).css("cursor", "auto");
			}
		});
		
		//읽지 않은 메시지 있으면 별표시 
		$("div[id=chatListDiv] div.oj_group_wrap").each(function(idx, obj) {
		    if($(obj).find("div.balloon").length > 0) {
				$(obj).find("div.oj_group_top").append(`<span class="oj_group_top_text_2">⭐</span>`);
			}
		});
		
		initHeight = $(".iframe_body").height();
		staff.initEvents();
		
	}, 
	initEvents: function() { //이벤트 bind
		
		//나는 클릭X
		$("div[name=subListDiv] div.oj_group_middle[data-id="+sessMbrOId+"]").css("cursor", "auto");
		
		$("div[name=subListDiv] div.oj_group_middle").off("click").on("click", function(event) {
   
			var targetId = $(event.currentTarget).data("id");
			var targetName = $(event.currentTarget).find("span[name='staffNm']").html();
			var menuName = "직원채팅-"+targetName;
			
			//나는 클릭X
			if(sessMbrOId != targetId) {
				var params = {
					"menuId":"staffChat_"+targetId,
					"menuName":menuName,
					"param":{}
				};
				localStorage.setItem("staffChatOid", sessMbrOId);
				localStorage.setItem("staffChatTargetOid", targetId);
				staff.openChat(params);
			} else {
				//$(event.currentTarget).css("cursor", "auto");
			}
		});

		if(isAdmin) {
			new RtMouseClickEvent({
				selector: "#chat div[name=subListDiv] div",
				menuContextHandler: "",
				menus: {
					"add": {
						menuName: "추가배정",
						callback: staff.addAssignConfirm,
						args: ["id"]
					}
				}
			});
		}
	}, 
	addAssignConfirm: function(event, id) { //관리자 추가배정 confirm
		staff.addAssign(id);
		/*
		uiConfirm("추가배정 하시겠습니까?", function() {
			staff.addAssign(id);
		});
		*/
	},
	addAssign: function(id) { //관리자 추가배정 팝업
		let eventData = {
	        type : "openNewWindow",
	        params : {
	            url : addAssignUrl,
	            menuId : "addAssign",
	            menuName : "상담채팅-추가배정",
	            sendParams : {
					"id" : id
	            }
	        }
	    }
	    window.parent.postMessage(eventData, "*");
	}, 
	openChat: function(params) { //채팅창 open
		
		let eventData = {
	        type : "openNewWindow",
	        params : {
	            url : "/counseling/internal/messenger",
	            menuId : params.menuId,
	            menuName : params.menuName,
	            sendParams : params.param
	        }
	    }
	    window.parent.postMessage(eventData, "*");
	}
};