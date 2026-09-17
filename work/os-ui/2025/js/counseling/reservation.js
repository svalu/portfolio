const reservation = {
	getList: function(callback) { //데이터 가져오기
		
		var dataUrl = mappingPath[pageCode]["list"];
		$.ajax({
			url: dataUrl,
			type: 'POST',
			data: "",
			dataType: 'json',
			success: function(rstData) {
				rstData.data.staff = combineData(rstData.data);
				reservation.appendList(rstData.data.reservation);
				leftMenuBlinkerSet(rstData.data);
				if(typeof(callback) == "function") callback();
			},
			error: function(error) {
				//uiAlert("서버와의 통신에 실패하였습니다.");
				console.error("An error occurred:", error);
			}
		});
	},
	appendList: function(json) { //리스트 출력
		
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
				if(reservation.isMyData(obj)) cntObj[obj.cnslStatus]++;
			});
		}
		
		for(var key in titleMap[pageCode]) {
			var html = `
				<div class="oj_group_wrap" id="reservation_${key}">
			        <div class="oj_group_top">
			            <span class="oj_group_top_text_1" name="title">${titleObj[key]}</span>
			            <span class="oj_group_top_text_1" name="subListCnt">(${cntObj[key]}명)</span>
			            <div class="oj_group_icon balloon display_none" name="newMsg"><span>2</span></div>
			            <div class="oj_group_top_triangle" name="toggleList">▲</div>
			        </div>
			        <div class="oj_group_middle_wrap" name="subListDiv">
			            
			        </div>
			    </div>`;
			$("#chatListDiv").append(html);
		}
		
		if(json) {
			$(json).each(function(idx, obj) {
				if(reservation.isMyData(obj)) {
					var html = `<div class="oj_group_middle" data-id="${obj.id}">
				        <span class="oj_group_middle_text_1">${obj.userNm} / `+new Date(obj.hopeDate).format("mm-dd")+`( `+reservation.convertHour(obj.hopeHour)+` )</span>
				    </div>`;
					$("#reservation_"+obj.cnslStatus+" div[name=subListDiv]").append(html);
					if(!$("#reservation_"+obj.cnslStatus).hasClass('active')) $("#reservation_"+obj.cnslStatus).addClass("active");
				}
			});
		}
		
		$("#chatListDiv .oj_group_top").each(function(idx, obj) {
			if($(this).next("div").find("div.oj_group_middle").length > 0) {
				$(this).on("click").off("click").on("click", function(event) {
					$(this).parent("div").toggleClass("active");
				});
			} else {
				$(this).css("cursor", "auto");
			}
		});
		
		//예약상담 고객 있으면 별표시 
		if($("div[id=reservation_wait] div[name=subListDiv] div").length > 0) {
			$("div[id=reservation_wait] div.oj_group_top").append(`<span class="oj_group_top_text_2">⭐</span>`);
		}
		
		initHeight = $(".iframe_body").height();
		reservation.initEvents();
		
	}, 
	initEvents: function() { //이벤트 bind
		new RtMouseClickEvent({
			selector: "#reservation_wait div[name=subListDiv] div",
		    menuContextHandler: "",
		    menus: {
				"add": {
					menuName: "상담시작",
					callback: reservation.addAssignConfirm,
					args: ["id"]
				},
				"detail": {
					menuName: "상세내용",
					callback: reservation.detailView,
					args: ["id"]
				}
			}
		});
		
		new RtMouseClickEvent({
			selector: "#reservation_call div[name=subListDiv] div",
		    menuContextHandler: "",
		    menus: {
				"detail": {
					menuName: "상세내용",
					callback: reservation.detailView,
					args: ["id"]
				},
				"cancel": {
					menuName: "상담취소",
					callback: reservation.cancelAssignConfirm,
					args: ["id"]
				}
			}
		});
	}, 
	detailView: function(event, id) {  //상세내역 보기
		let eventData = {
	        type : "openNewWindow",
	        params : {
	            url : "/counseling/reservation/detail",
	            menuId : "reservationDetail",
	            menuName : "예약상담-상세내용",
	            sendParams : {
					"targetId" : id
	            }
	        }
	    }
	    window.parent.postMessage(eventData, "*");
	},
	addAssignConfirm: function(event, id) { //추가배정 confirm
		uiConfirm("상담시작 하시겠습니까?", function() {
			reservation.addAssign(id);
		});
	},
	addAssign: function(id) { //추가배정
		var dataUrl = mappingPath[pageCode]["add"]+"/"+id;
		
		$.ajax({
	        url: dataUrl, 
	        type: "POST",
	        data: "",
	        dataType: 'json',
	        success: function(rstData) {
				if(rstData.data == "success") {
					reservation.getList();
				} else {
					uiAlert("상담시작 실패하였습니다.");
				}
	        },
	        error: function(error) {
				uiAlert("서버와의 통신에 실패하였습니다.");
	            console.error("An error occurred:", error);
	        }
	    });
	}, 
	cancelAssignConfirm: function(event, id){ //상담취소 confirm
		uiConfirm("예약상담을 취소 하시겠습니까?", function() {
			reservation.cancelAssign(id);
		});
	},
	cancelAssign: function(id) { //상담취소
		var dataUrl = mappingPath[pageCode]["cancel"]+"/"+id;
		
		$.ajax({
	        url: dataUrl, 
	        type: "POST",
	        data: "",
	        dataType: 'json',
	        success: function(rstData) {
				if(rstData.data == "success") {
					reservation.getList();
				} else {
					uiAlert("상담취소 실패하였습니다.");
				}
	        },
	        error: function(error) {
				uiAlert("서버와의 통신에 실패하였습니다.");
	            console.error("An error occurred:", error);
	        }
	    });
	},
	convertHour: function(time) { //시간 변경
		var rst = "";
		var sTime = parseInt(time.substr(0, 2));
		var eTime = parseInt(time.substr(2));
		
		rst = parseInt(sTime) < 12 ? "오전"+sTime : "오후"+(sTime%12 || 12);
		rst += "~";
		rst += parseInt(eTime) < 12 ? "오전"+eTime : "오후"+(eTime%12 || 12);
		return rst;
	}, 
	isMyData: function(jsonData) { // 내 데이터 여부 
		var rst = false;
		switch(jsonData.cnslStatus) {
			case "call":
				//console.log(sessMbrOId, jsonData.mbrId);
				if(sessMbrOId == jsonData.mbrId) {
					rst = true;
				}
				break;
			default:
				rst = true;
		}
		return rst;
	}
};