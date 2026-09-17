/**
 *      약어 목록
 *
 *     oprt  =  operate      // 운영
 *     wkdy  =  weekday      // 평일
 *     wknd  =  weekend      // 주말
 *     ctrl  =  control      // 조절
 *
 *
 * */

const oprtTimeUrl = '/rest/api/operation-time'

$(document).ready(function () {
    initEvents();
});

function initEvents() {
    initOprtTimeOption();
    initLtClickEvents();
    getOprtList();
}

function getOprtList() {

    $.ajax({
        url: oprtTimeUrl + "/list",
        type: 'GET',
        dataType: 'json',
        success: function (ajaxData) {
            let data = ajaxData.data;

            data.forEach(function (item) {
                generateOprtMsg(item);
                generateOprtTime(item.oprtTimeInfo[0], item.oprtTimeInfo[1]);
            });
        },
        error: function (error) {
            uiAlert("리스트를 불러오는데 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });

}

function splitFn(data) {
    return data.split(":");
}

function generateOprtTime(weekday, weekend) {

    let oprtTimeData = [

        // 평일 데이터
        ...splitFn(weekday.oprtStrtTime),
        ...splitFn(weekday.oprtEndTime),
        ...splitFn(weekday.lunchStrtTime),
        ...splitFn(weekday.lunchEndTime),

        // 주말 데이터
        ...splitFn(weekend.oprtStrtTime),
        ...splitFn(weekend.oprtEndTime),
        ...splitFn(weekend.lunchStrtTime),
        ...splitFn(weekend.lunchEndTime)
    ];

    for (let i = 0; i < oprtTimeData.length; i++) {

        // 각각의 시간 데이터를 순서대로 select 옵션 값으로 넣어준다.
        if(!oprtTimeData[i]){
            $("#entireOprtTimeList").find("select").eq(i).val("--");
        }
        else
            $("#entireOprtTimeList").find("select").eq(i).val(oprtTimeData[i]);

    }

}

function generateOprtMsg(data) {

    $('#notOprtMsg').val(data.notOprtMsg);
    $('#lunchMsg').val(data.lunchMsg);

}

// 마우스 클릭 이벤트 생성
function initLtClickEvents() {
    /**
     * 드롭다운 메뉴 이벤트 정의
     * @type {DropDownMenuEvent}
     */
    var dropDownMenuEvent = new DropDownMenuEvent({
        selector: "div.setting_line_oj",
        menus: {
            "create": {
                menuName: "저장",
                callback: saveOprtTime,
                args: []
            }
        }
    });
}

// 운영 시간 저장
function saveOprtTime() {

    uiConfirm("저장 하시겠습니까?",saveOprtTimeFn);

    function saveOprtTimeFn() {

        let lunchMsg = $('#lunchMsg').val();
        let notOprtMsg = $('#notOprtMsg').val();
        let oprtTimeInfo = gatherOprtTimeData();

        let params = {
            lunchMsg: lunchMsg,
            notOprtMsg: notOprtMsg,
            oprtTimeInfo: oprtTimeInfo
        }

        $.ajax({
            url: oprtTimeUrl,
            type: 'POST',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: "application/json",
            success: function (ajaxData) {
                uiAlert("저장되었습니다");
            },
        error: function (error) {
                uiAlert("저장에 실패하였습니다.");
                console.error("An error occurred:", error);
            }
        });

    }

}

function gatherOprtTimeData() {
    return $("#entireOprtTimeList").map(function () {
        return [
            {
                oprtTimeType: "Weekday",
                oprtStrtTime: $(this).find("select").eq(0).val() + ":" + $(this).find("select").eq(1).val(),
                oprtEndTime: $(this).find("select").eq(2).val() + ":" + $(this).find("select").eq(3).val(),
                lunchStrtTime: $(this).find("select").eq(4).val() + ":" + $(this).find("select").eq(5).val(),
                lunchEndTime: $(this).find("select").eq(6).val() + ":" + $(this).find("select").eq(7).val(),

            },
            {
                oprtTimeType: "Weekend",
                oprtStrtTime: $(this).find("select").eq(8).val() + ":" + $(this).find("select").eq(9).val(),
                oprtEndTime: $(this).find("select").eq(10).val() + ":" + $(this).find("select").eq(11).val(),
                lunchStrtTime: $(this).find("select").eq(12).val() + ":" + $(this).find("select").eq(13).val(),
                lunchEndTime: $(this).find("select").eq(14).val() + ":" + $(this).find("select").eq(15).val()
            }
        ];
    }).get();

}


// 운영 시간 옵션 관리
function initOprtTimeOption() {

    let hourOptions = timeOptionCtrlFn(0, 24);        // 시
    let minuteOptions = timeOptionCtrlFn(0, 60);      // 분

    /**
     *      평일 운영 시간 관리
     * */

        // 시 관리
    let wkdyHourSelect = $("#wkdyOprtTimeList").find('select:first-child');
    wkdyHourSelect.empty();
    wkdyHourSelect.append($(hourOptions));

    // 분 관리
    let wkdyMinuteSelect = wkdyHourSelect.next().next();
    wkdyMinuteSelect.empty();
    wkdyMinuteSelect.append($(minuteOptions));

    /**
     *      주말 운영 시간 관리
     * */

        // 시 관리
    let wkdnHourSelect = $("#wkdnOprtTimeList").find('select:first-child');
    wkdnHourSelect.empty();
    wkdnHourSelect.append($(hourOptions));

    // 분 관리
    let wkdnMinuteSelect = wkdnHourSelect.next().next();
    wkdnMinuteSelect.empty();
    wkdnMinuteSelect.append($(minuteOptions));


}

// 시간 옵션 관리 함수
function timeOptionCtrlFn(startTime, endTime) {

    let html = "<option>--</option>";
    for (let i = startTime; i < endTime; i++) {
        // if (i < 10) {
        //     i = "0" + i;
        // }
        html += "<option>" + String(i).padStart(2, '0') + "</option>";
    }

    return html;
}


function returnFn() {
    return;
}

