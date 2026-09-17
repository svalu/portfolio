let customerIntervalId;
const customer = {
	getList: function(callback) { //데이터 가져오기
		
		var dataUrl = mappingPath[pageCode]["list"];
		$.ajax({
			url: dataUrl,
			type: 'POST',
			data: "",
			dataType: 'json',
			success: function(rstData) {
				//console.log("getList :", rstData);
				rstData.data.staff = combineData(rstData.data);
				//combine two objects into one array
				let combinedData = [...rstData.data.customer, ...rstData.data.unprocessedChat];
				customer.appendList(combinedData);
				// customer.appendList(rstData.data.unprocessedChat);
				leftMenuBlinkerSet(rstData.data);
				if(typeof(callback) == "function") callback();
			},
			error: function(error) {
				//uiAlert("서버와의 통신에 실패하였습니다.");
				console.error("An error occurred:", error);
			}
		});
	}, 
	appendList: function(json) {  //리스트 출력
		//console.log("appendList", json);
		$("#chatListDiv").html("");
		var html = "";
		var titleObj = titleMap[pageCode];
		var cntObj = {};
		//var isBlinker = false;
		
		for(var key in titleMap[pageCode]) {
			cntObj[ key ] = 0;
		}
		
		if(json) {
			$(json).each(function(idx, obj) {
				var statusCode = obj.cnslrStatusCode;
				
				
				if(!cntObj[statusCode]) cntObj[statusCode] = 0; 
				if(customer.isMyData(obj)) cntObj[statusCode]++;
			});
		}
		//console.log(cntObj);
		
		for(var key in titleMap[pageCode]) {
			var html = `
				<div class="oj_group_wrap" id="customer_${key}">
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
		
		if(json) {
			$(json).each(function(idx, obj) {
				if(obj.cnslrStatusCode !== "end" && customer.isMyData(obj)) {
					
					//상담종료여부
					const isEnd = obj.cnslrStatusCode == "chat" && obj.cnslrEndDate ? true : false;
					let elapsedTimeStamp = obj.elapsedTimeStamp;
					
					if(isEnd) {
						elapsedTimeStamp = new Date(obj.cnslrEndDate).getTime() - obj.reqtTimeStamp;
					}
					
					
					var html = `<div class="oj_group_middle" data-id="${obj.id}" id="${obj.channelId}">
				        <span class="oj_group_middle_text_1" name="customerNm">${(obj.cusClsftn=="비로그인" ? "비회원" : "회원")}</span>
				        <span class="oj_group_middle_text_1" name="reqtDate">(${new Date(obj.reqtTimeStamp).format("HH:MM")})</span>
				        <span class="oj_group_middle_text_1" isend="${isEnd}" elapsedTimeStamp="${elapsedTimeStamp}" name="elapsedTime">+${timestampToMinute(elapsedTimeStamp)}분</span><span class="oj_group_middle_text_1">`+customer.addTransferAssignStr(obj)+`</span>
				        `+function() { //안읽은 메시지 말풍선
							if(obj.unReadCnt) {
								return `<div class="oj_group_icon balloon"><span>${obj.unReadCnt}</span></div>`;
							} else {
								return ``;
							}
						}()+`
				    </div>`;
				    
					$("#customer_"+obj.cnslrStatusCode+" div[name=subListDiv]").append(html);
					if(!$("#customer_"+obj.cnslrStatusCode).hasClass('active')) $("#customer_"+obj.cnslrStatusCode).addClass("active");
					
					//
				} else if(obj.cnslrStatusCode === "end" && customer.isMyData(obj)){
					var html = 	`<div class="oj_group_middle" data-id="${obj.id}">
											<span class="oj_group_middle_text_1" name="customerNm">${(obj.cusClsftn=="비로그인" ? "비회원" : "회원")}</span>
											<span class="oj_group_middle_text_1" name="reqtDate">(${new Date(obj.reqtDate).format("HH:MM")})</span>
										</div>`;

					$("#customer_"+obj.cnslrStatusCode+" div[name=subListDiv]").append(html);
					if(!$("#customer_"+obj.cnslrStatusCode).hasClass('active')) $("#customer_"+obj.cnslrStatusCode).addClass("active");
				}
			});
		}
		
		//리스트 토글
		$("#chatListDiv .oj_group_top").each(function(idx, obj) {
			if($(this).next("div").find("div.oj_group_middle").length > 0) {
				$(this).on("click").off("click").on("click", function(event) {
					$(this).parent("div").toggleClass("active");
				});
			} else {
				$(this).css("cursor", "auto");
			}
		});
		
		//상담중 고객 읽지 않은 메시지 있으면 별표시 
		if($("div[id=chat] div.balloon").length >0) {
			$("div[id=chat] div.oj_group_top").append(`<span class="oj_group_top_text_2">⭐</span>`);
		}
		//배정된 고객 있으면 별표시 
		if(cntObj["assign"] > 0) $("div[id=assign] div.oj_group_top").append(`<span class="oj_group_top_text_2">⭐</span>`);
		//상담대기 고객 있으면 별표시
		if(cntObj["wait"] > 0) $("div[id=wait] div.oj_group_top").append(`<span class="oj_group_top_text_2">⭐</span>`);
		
		initHeight = $(".iframe_body").height();
		customer.initEvents();
	}, 
	initEvents: function() { //이벤트 bind
		
		let second = 0;
		//경과시간 카운팅
		clearInterval(customerIntervalId);
		customerIntervalId = setInterval(function() {
			second++;
			$("div.oj_group_middle span[elapsedTimeStamp]").each(function(idx, obj) {
				if($(obj).attr("isend") != "true") { //상담 완료 안된 것만 시간 카운팅
					const addTime = parseInt($(this).attr("elapsedTimeStamp")) + (second*1000);
					$(this).html( "+"+timestampToMinute(addTime)+"분" );
				}
			});
		}, 1000);
		
		
		$("#customer_chat div[name=subListDiv] div.oj_group_middle").off("click").on("click", function(event) {
			var targetId = $(event.currentTarget).data("id");
			var grpId = $(event.currentTarget).attr("id");

			//window.localStorage.setItem("customerChatGrpId", grpId);
       		window.localStorage.setItem("customerChatLoginId", sessMbrId);
       		window.localStorage.setItem("customerChatAssignOId", targetId);
       		//window.localStorage.setItem("customerChatIsStart", false);

			var params = { "channelId" : "" };
			customer.openChat(targetId, params);

			let eventData = {
				type : "stopBlinkTaskbar",
				params : {
					menuId : "cnslChat_"+ targetId
				}
			};
			window.parent.postMessage(eventData, "*");

			$(this).find("div.oj_group_icon.balloon").remove(); //읽음 처리
		});

		$("#customer_end div[name=subListDiv] div.oj_group_middle").off("click").on("click", function(event) {
			targetId = $(event.currentTarget).data("id");
			var params = { "channelId" : "" };

			window.localStorage.setItem("customerChatLoginId", sessMbrId);
			window.localStorage.setItem("customerChatAssignOId", targetId);

			customer.openChat(targetId, params);
		});

		new RtMouseClickEvent({
			selector: "#customer_wait div[name=subListDiv] div",
		    menuContextHandler: "",
		    menus: {
				"add": {
					menuName: "추가배정",
					callback: customer.addAssignConfirm,
					args: ["id"]
				}
			}
		});

		new RtMouseClickEvent({
	    	selector: "#customer_assign div[name=subListDiv] div",
	    	menuContextHandler: "",
	    	menus: {
				"start": {
					menuName: "상담시작",
					callback: customer.startChatConfirm,
					args: ["id"]
				}
			}
	  	});
	},
	startChatConfirm: function(event, id) { //상담시작 confirm
		uiConfirm("상담을 시작하시겠습니까?", function() {
			customer.startChat(id);
		});
	},
	startChat: function(id) {  //상담시작
		var dataUrl = mappingPath[pageCode]["start"]+"/"+id;

		var targetId = id;
		var grpId = $("div.oj_group_middle[data-id='"+id+"']").attr("id");
		//const groupId = window.localStorage.setItem("customerChatGrpId", grpId);
		const loginId = window.localStorage.setItem("customerChatLoginId", sessMbrId);
		window.localStorage.setItem("customerChatAssignOId", targetId);
		//window.localStorage.setItem("customerChatIsStart", true);

		var params = { "channelId" : "" };
		customer.openChat(targetId, params);

		/*
		$.ajax({
	        url: dataUrl,
	        type: "POST",
	        data: "",
	        dataType: 'json',
	        success: function(rstData) {
				if(rstData.data == "success") {

					customer.getList();

					var targetId = id;
					var grpId = $("div.oj_group_middle[data-id='"+id+"']").attr("id");
					const groupId = window.localStorage.setItem("customerChatGrpId", grpId);
					const loginId = window.localStorage.setItem("customerChatLoginId", sessMbrId);
					window.localStorage.setItem("customerChatAssignOId", targetId);
					window.localStorage.setItem("customerChatIsStart", true);

					var params = { "channelId" : "" };
					customer.openChat("cnslChat_"+targetId, params);

				} else {
					uiAlert("상담시작 실패했습니다.");
				}
	        },
	        error: function(error) {
				uiAlert("서버와의 통신에 실패하였습니다.");
	            //console.error("An error occurred:", error);
	        }
	    });
	    */
	},
	addAssignConfirm: function(event, id) { //추가할당 confirm
		uiConfirm("추가배정 하시겠습니까?", function() {
			customer.addAssign(id);
		});
	},
	addAssign: function(id) { //추가할당
		var dataUrl = mappingPath[pageCode]["add"]+"/"+id;

		$.ajax({
	        url: dataUrl,
	        type: "POST",
	        data: "",
	        dataType: 'json',
	        success: function(rstData) {
				//console.log(rstData);
				if(rstData.data == "success") {
					var callback = function() {
						customer.getList();
					};
					uiAlert("배정되었습니다.", callback);
				} else {
					uiAlert("배정 실패했습니다.");
				}
	        },
	        error: function(error) {
				uiAlert("서버와의 통신에 실패하였습니다.");
	            //console.error("An error occurred:", error);
	        }
	    });
	},
	isMyData: function(jsonData) { //내 데이터 여부
		var rst = false;
		switch(jsonData.cnslrStatusCode) {
			case "assign":
			case "chat":
			case "end":
				if(sessMbrOId == jsonData.mbrOId) {
					rst = true;
				}
				break;
			default:
				rst = true;
		}
		return rst;
	},
	addTransferAssignStr: function(obj) { //이관표시
		var rst = "";
		if(obj.isTransfer || obj.isAddnAssign) rst = " - 이관";
		return rst;
	},
	openChat: function(id, param) { //채팅창 오픈

		let eventData = {
	        type : "openNewWindow",
	        params : {
	            url : "/counseling/customer/chat",
	            menuId : "cnslChat_"+id,
	            menuName : "상담채팅-채팅",
	            sendParams : param
	        }
	    }
	    window.parent.postMessage(eventData, "*");
	}
};