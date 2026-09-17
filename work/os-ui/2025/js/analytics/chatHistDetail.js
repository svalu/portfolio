const resvDetailUrl = "/counseling/reservation/detail";
const chatLogUrl = "/counseling/chatHist";
const isWrite = location.pathname.indexOf("admin") > -1;

$(document).ready(function() {


    if(isWrite) {
        $("#evaluationDiv").removeClass("display_none");
        $("#btnEvalView").on("click", function() {
            evalView(queryParams.id);
        })
    } else {
        $("#evaluationDiv").remove();
    }
    initInput();
    let queryParams = getQueryParameters();
    if(queryParams.id) {
        loadData(queryParams.id);
    }
});

function loadData(id) {
    const url = "/rest/api/analytics/user/cnsl-hist/cnslHistDetail";
    const params = {
        "id" : id
    }
    $.ajax({
        url : url,
        type : 'POST',
        dataType : 'json',
        data : params,
        success : function(ajaxData) {
            if(ajaxData) dataInput(ajaxData);

            if(ajaxData.postProcCd == "RSVTN") $("#evaluationDiv").remove();

            $("#postProcType").css("cursor","pointer").on("click", function() {
                viewHistory(ajaxData.postProcCd, ajaxData.targetId);
            })
        },
        error : function(error) {
            console.log(error);
        }
    });
}

function initInput() {
    $("#userName").html("");
    $("#userMobile").html("");
    $("#categName").html("");
    $("#mbrName").html("");
    $("#cnslDate").html("");
    $("#postProcType").html("");
    $("#closeChat").html("");
    $("#postProcTitle").val("");
    $("#postProcContent").html("");
    $("#cnslReviewGrade").html("");
    $("#cnslReviewDesc").val("");
    $("#evaluator").html("");
    $("#cnslEvalResult").html("");
    $("#regDate").html("");
}

function dataInput(ajaxData) {

    let cnslDate = ajaxData.cnslDate;

    let cnslReviewGrade = "-";
    if(ajaxData.cnslReviewGrade) cnslReviewGrade = ajaxData.cnslReviewGrade + " /  5";

    let cnslReviewDesc = "-";
    if(ajaxData.cnslReviewDesc) cnslReviewDesc = ajaxData.cnslReviewDesc;

    if(ajaxData.postProcCd == "CHAT") {
        cnslDate = ajaxData.cnslDate.replace("<br>", "(") + ")";
    }
    $("#userName").html(ajaxData.userName);
    $("#userMobile").html(ajaxData.userMobile);
    $("#categName").html(ajaxData.categName);
    $("#mbrName").html(ajaxData.mbrName);
    $("#cnslDate").html(cnslDate);
    $("#postProcType").html(ajaxData.postProcType);


    if(ajaxData.closeChat) {
        $("#closeChat").html(CLOSE_CHAT[ajaxData.closeChat]);
    }


    $("#postProcTitle").val(ajaxData.postProcTitle);
    $("#postProcContent").val(ajaxData.postProcContent);

    $("#cnslReviewGrade").html(cnslReviewGrade);
    $("#cnslReviewDesc").val(cnslReviewDesc);

    if(ajaxData.cnslEval) {
        const cnslEval = ajaxData.cnslEval;
        $("#evalComment").val(cnslEval.evalComment);
        $("#evaluator").html(cnslEval.mbrName);
        $("#cnslEvalResult").html(`${cnslEval.evalScore} / ${cnslEval.itemScore}`);
        $("#regDate").html(new Date(cnslEval.regDate).format("yyyy-mm-dd(HH:MM)"));

    }
}

function evalView(id) {
    let eventData = {
        type: "openNewWindow",
        params: {
            url: "analytics/admin/chatEvaluation",
            menuId: `evalDetailView_${id}`,
            menuName: `평가 상세내용`,
            sendParams: {
                id: id
            }
        }
    }
    window.parent.postMessage(eventData, "*");
}

function viewHistory(postProcCd, targetId) {
    let eventData = {
        type : "openNewWindow",
        params : {
            url : postProcCd === "RSVTN" ? resvDetailUrl : chatLogUrl,
            menuId : "rsvnDetail_"+targetId,
            menuName : postProcCd === "RSVTN" ? "예약상담 - 상세내용" : "상담이력 관리 - 채팅",
            sendParams : {
                targetId : targetId,
                type : "view"
            }
        }
    }

    window.parent.postMessage(eventData, "*");
}