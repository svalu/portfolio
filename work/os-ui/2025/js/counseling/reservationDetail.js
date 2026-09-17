$(document).ready(function() {
    initData();
    initEvent();
})

function initData() {
    let queryParams = getQueryParameters();
    let url = "/rest/api/counseling/reservation/detail/" + queryParams.targetId;
    const postProcess = new PostProcess(queryParams.targetId, "RSVTN").pageSet();
    $.ajax({
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            setRsvtnData(ajaxData.data);
        },
        error : function(error) {
            console.log(error);
        }
    })

    controlItemOnViewType(queryParams.type);
}

function initEvent() {
	let queryParams = getQueryParameters();
	let targetId = queryParams.targetId;
	
	$(".side_bar").css("cursor", "pointer");
	$("#postProcWrap button.menu_bu, .side_bar").on("click", function() {
		$("#postProcessDiv").toggleClass("active");
	});
	/*
	$("#postProcWrap button.menu_bu").on("click", function() {
		let eventData = {
	        type : "openNewWindow",
	        params : {
	            url : "/counseling/postProcess",
	            menuId : "postProcess_"+targetId,
	            menuName : "예약상담-후처리("+$("#td_UserNm").text()+")",
	            sendParams : {
					"targetId" : targetId,
					"postProcType" : "RSVTN"
	            }
	        }
	    }
	    window.parent.postMessage(eventData, "*");
	});
	*/
}

function controlItemOnViewType(type) {
    if(type === "view")
        $("#postProcWrap").addClass("display_none");

}

function setRsvtnData(data) {
	
	if(data.cnslStatus == "call") $("#postProcWrap button.menu_bu").removeClass("display_none");
	$("#td_UserNm").text(data.userNm);
    $("#td_userMobile").text(data.userMobile);
    $("#td_userDOB").text(data.userDOB);
    $("#td_userHopeDateHour").text(data.hopeDate + `(${formatTimePeriod(data.hopeHour)})`);
    $("#ta_rsvtnContent").val(data.cnslContent);
}

function formatTimePeriod(input) {
    const startHour = input.slice(0, 2);
    const endHour = input.slice(2, 4);

    const startHourInt = parseInt(startHour, 10);
    const endHourInt = parseInt(endHour, 10);

    function formatHour(hour) {
        if (hour > 12) {
            if (hour > 12) {
                hour -= 12;
            }
            return `오후 ${hour}시`;
        } else {
            if (hour === 0) {
                hour = 12;
            }
            return `오전 ${hour}시`;
        }
    }

    const formattedStartHour = formatHour(startHourInt);
    const formattedEndHour = formatHour(endHourInt);

    const formattedString = `${formattedStartHour} ~ ${formattedEndHour}`;

    return formattedString;
}