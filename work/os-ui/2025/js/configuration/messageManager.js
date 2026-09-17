/**
 *      약어 목록
 *
 *      msg  =  message       // 메시지
 *      mngr =  manager       // 매니저, 관리자
 *      mng  =  manage        // 관리
 *
 * */

const msgMngrUrl = "/rest/api/message-manager";

const cnslStrtAssistMsg =`* 챗봇 상담 시작 시 설정한 멘트가 자동 출력됩니다. 보통 간결하게<br>회사 소개 또는 상담 서비스 안내를 권장합니다.`;
const autoEndAssistMsg = `* 설정한 시간동안 고객 답변이 없으면 상담은 자동 종료되며 이 때<br>설정한 메시지가 출력 됩니다.`;
const autoEndAssistMsg2 = `* 자동종료 1분 전 사전 알림이 발송되며 이 때 설정한 멘트가<br>출력됩니다.`;
const cnslEndAssistMsg = `* 챗봇 상담 종료 시 설정한 멘트가 자동 출력됩니다.`;
const ovfNumAssistMsg = `* 건수조절 설정  값 만큼 상담원에게 배정되며, 해당 건수 초과 시<br>고객은 상담 대기 상태가 됩니다.`;
let initTextareaMinHeight = "";

$(document).ready(function () {
    initTextareaMinHeight = $("#mngMsgContent").css('min-height');
    initEvents();
});

function initEvents() {

    initClickEvents();

}


function initClickEvents() {

    // 메시지 별로 상세 정보 클릭 이벤트 생성
    $("#mngMsgList tr").not(':first').on("click", function () {

        $("#mngMsgList tr:not(:first)").attr("data-status", false);
        $(this).attr("data-status", true);

        $("#mngMsgList tr:not(:first)").removeClass("checked");
        $(this).addClass("checked");

        let mngMsgCode = $(this).attr("data-mngMsgCode");
        mngMsgDetail(mngMsgCode);
    });

    // 저장 이벤트 생성
    $("#mngMsgSave").on("click", mngMsgSave);

    // 사용여부 버튼 클릭 이벤트 생성
    $("#switchBtn").on("click", switchBtnFn);
}

// 사용여부 스위치 버튼
function switchBtnFn() {

    let $switchBtn = $("#switchBtn");
    let contentArea = $("#mngMsgContent");

    let isAllow = $switchBtn.attr("data-mngmsgisallow");
    if (isAllow === "true") {
        $switchBtn.removeClass("on").addClass("off");
        $switchBtn.attr("data-mngmsgisallow", "false");
    } else if (isAllow === "false") {
        if(!contentArea) {
            return;
        }
        $switchBtn.removeClass("off").addClass("on");
        $switchBtn.attr("data-mngmsgisallow", "true");
    }
}

// 메시지 관리 저장
function mngMsgSave() {

    let mngMsgContent = $.trim($('#mngMsgContent').val());
    let mngMsgContentBefore = $.trim($('#mngMsgContentBefore').val());
    let selectTr = $('#mngMsgList').find('tr[data-status=true]');
    let mngMsgCode = selectTr.attr("data-mngMsgCode");
    let mngMsgTitle = selectTr.find('span').text();

    if(!mngMsgContent){
        uiAlert("메시지 내용이 없습니다.");
        return;
    }

    if(mngMsgCode === "auto_end") {
        if(mngMsgContentBefore == "") {
            uiAlert("메시지 내용이 없습니다.");
            return;
        }
    }

    let mngMsgIsAllow;
    if (($('#switchBtn').attr('data-mngmsgisallow') === "true")) {

        mngMsgIsAllow = Boolean(true);
    } else {
        mngMsgIsAllow = Boolean(false);
    }

    let params = {
        mngMsgCode: mngMsgCode,
        mngMsgTitle: mngMsgTitle,
        mngMsgIsAllow: mngMsgIsAllow,
        mngMsgContent: mngMsgContent
    }

    if (mngMsgCode !== "" && mngMsgCode === "auto_end") {
        params.mngMsgContentBefore = mngMsgContentBefore;
        params.mngMsgSetTime = $('#selectOptionDiv').find("select").val();
    } else if (mngMsgCode !== "" && mngMsgCode === "ovf_num") {
        params.mngMsgSetMax = Number($('#selectOptionDiv').find("select").val());
    }

    $.ajax({
        url: msgMngrUrl,
        type: 'POST',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: "application/json",
        success: function (ajaxData) {
            uiAlert("저장되었습니다.", reloadFn);
        },
        error: function (error) {
            uiAlert("저장에 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });

}

function reloadFn(){
    location.reload();
}


// 각각의 메시지 관리 상세 정보 출력
function mngMsgDetail(mngMsgCode) {

    $.ajax({
        url: msgMngrUrl + "/" + mngMsgCode + '/detail',
        type: 'GET',
        dataType: 'json',
        success: function (ajaxData) {
            let data = ajaxData.data;
            generateMsgMngItem(data, mngMsgCode);
            //if(mngMsgCode == "auto_end") mngMsgDetail("before_end");
        },
        error: function (error) {
            // 요청이 실패했을 때 실행될 함수
            uiAlert("상세보기 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });


}

function generateMsgMngItem(data, mngMsgCode) {

    $(".popup_function_line").removeClass("display_none");

    if (mngMsgCode !== "") {

        let selectOptionDiv = $('#selectOptionDiv');
        let contourDiv = $('#contourDiv');

        $("#mngMsgContent").css("min-height", initTextareaMinHeight);
        $("#mngMsgContentBefore, #assistMsg2").addClass("display_none");

        // 자동종료
        if (mngMsgCode === "auto_end") {
            contourDiv.removeClass("display_none");
            selectOptionDiv.removeClass("display_none");
            selectOptionDiv.find('div[class="con_name"]').eq(0).text("시간설정").end().eq(2).text("분");
            $('#assistMsg').html(autoEndAssistMsg);

            $('#assistMsg2').html(autoEndAssistMsg2);
            $("#mngMsgContent").css("min-height", "200px");
            $("#mngMsgContentBefore").css("min-height", "200px");
            $("#mngMsgContentBefore, #assistMsg2").removeClass("display_none");
            $('#mngMsgContentBefore').prop("readonly", false);
            $('#mngMsgContentBefore').val(data.mngMsgContentBefore);

            setSelectOption(mngMsgCode);
            if (data) {
                selectOptionDiv.find("select").val(data.mngMsgSetTime);
            }
        }
        // 건수초과
        else if (mngMsgCode === "ovf_num") {
            contourDiv.removeClass("display_none");
            selectOptionDiv.removeClass("display_none");
            selectOptionDiv.find('div[class="con_name"]').eq(0).text("건수조절").end().eq(2).text("건");
            setSelectOption(mngMsgCode);
            $('#assistMsg').html(ovfNumAssistMsg);

            if (data) {
                selectOptionDiv.find("select").val(data.mngMsgSetMax);
            }
        }
        // 상담시작, 상담대기, 상담종료
        else {
            selectOptionDiv.addClass("display_none");
            contourDiv.addClass("display_none");

            if(mngMsgCode === "cnsl_strt")$('#assistMsg').html(cnslStrtAssistMsg);
            else if(mngMsgCode === "cnsl_end")$('#assistMsg').html(cnslEndAssistMsg);

        }
    }


    $('#mngMsgContent').prop("readonly", false);

    // 메시지 목록 각각의 데이터가 있는지 판별
    if (data) {
        $('#mngMsgContent').val(data.mngMsgContent);
        $("#switchBtn").attr("data-mngmsgisallow", !data.mngMsgIsAllow);
        switchBtnFn();
    }
    else{
        $("#switchBtn").attr("data-mngmsgisallow", true);
        switchBtnFn();
        $('#mngMsgContent').val('');
    }
}

// select 옵션 목록 생성
function setSelectOption(mngMsgCode) {

    var selectOptions = ""

    if (mngMsgCode !== "" && mngMsgCode === "auto_end") {
        selectOptions = selectOptionCtrlFn(2, 10);
    } else if (mngMsgCode !== "" && mngMsgCode === "ovf_num") {
        selectOptions = selectOptionCtrlFn(1, 10);
    }

    /**
     *      select 옵션 관리
     * */
    let selectOptionDiv = $("#selectOptionDiv").find('select');
    selectOptionDiv.empty();
    selectOptionDiv.append($(selectOptions));

}

// select 옵션 관리 함수
function selectOptionCtrlFn(startOption, endOption) {

    let html = "<option>--</option>";
    for (let i = startOption; i <= endOption; i++) {
        // if (i < 10) {
        //     i = "0" + i;
        // }
        html += "<option>" + i + "</option>";
    }

    return html;
}
