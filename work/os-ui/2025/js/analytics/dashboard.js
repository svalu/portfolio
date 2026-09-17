const sseConnectUrl = "/rest/api/sse/connect";
var cnslStatusChart;
var sortObj = {
    "sortField":"cnslStatusName",
    "sortType":-1
};

window.addEventListener("message", function(event) {
    const data = JSON.parse(event.data);
    if(data.code === SSE_DATA_CODE.MBR_STATUS_CD_CHANGE) {
        loadDatas();
    }
});

$(document).ready(function() {

    window.parent.postMessage({type: "receiveSseDataRegister", src: location.pathname, dataCode:SSE_DATA_CODE.MBR_STATUS_CD_CHANGE}, "*");

    /* main.js에서 sse 연결 통합 */
    //initSSE();
    var callback = function(params) {
        sortObj = params;
        loadDatas();
    };

    var sortingOpt = {
        "fields" : ["","mbrName","grpName","cnslStatusName","waitCnt","chatCnt","endCnt"],
        "sortField": "cnslStatusName",
        "sortType": -1,
        "callback": callback
    };

    $("#memberTable tr.table_title_line").commonSorting(sortingOpt);

    loadDatas();
    // setInterval(loadDatas, 5000);

})

/*function initSSE() {
    if(window.EventSource != null) {
        eventSource = new ServerSentEvent(sseConnectUrl);

        eventSource.onopen = function() {
            console.log("open");
        }

        eventSource.onerror = function(error) {
        }

        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);

            //console.log(event.data);

            if(data.code === "MBR_STATUS_CD_CHANGE") {
                loadDatas();
            }
        }
        eventSource.onclose = function() {
        }

        eventSource.connect();
    }
}*/

function loadDatas() {
    const url = "/rest/api/analytics/dashboard/data";


    $.ajax({
        url: url,
        data : sortObj,
        type: "POST",
        dataType: "json",
        success : function(ajaxData) {

            generateContents(ajaxData);


            /*
            $("#memberTable tr:gt(0)").empty();

            Object.keys(ajaxData.chartDatas).forEach(function(key) {
                generateTable(ajaxData.chartDatas[key], key);
            });
            setCnslStatusChart(ajaxData.chartDatas);
            setCountDatas(ajaxData);
            */
        },
        error : function(error) {
            console.log(error);
        }
    });
}

function setCountDatas(ajaxData) {
    $("#totalCnslCnt").text(ajaxData.totalCnslCnt+"건");
    $("#totalRsvtnCnt").text(ajaxData.totalRsvtnCnt+"건");
    $("#totalChatCnt").text(ajaxData.totalChatCnt+"건");
    $("#totAvgCnslDuration").text(ajaxData.totAvgCnslDuration);
}

function generateContents(ajaxData) {
    //console.log(ajaxData);
    $("#memberTable tr:gt(0)").empty();
    Object.keys(ajaxData.chartDatas).forEach(function(key) {
        generateTable(ajaxData.chartDatas[key], key);
    });
    setCnslStatusChart(ajaxData.chartDatas);
    setCountDatas(ajaxData);
}

function generateTable(data, key) {
    let $tr = $("<tr></tr>");
    let $index = $("<td></td>").text(parseInt(key) + 1);
    let $mbrName = $("<td></td>").text(data.mbrName);
    let $grpName = $("<td></td>").text(data.grpName);
    let $cnslStatusName = $("<td></td>").text(data.cnslStatusName);
    let $waitCnt = $("<td></td>").text(data.waitCnt);
    let $chatCnt = $("<td></td>").text(data.chatCnt);
    let $endCnt = $("<td></td>").text(data.endCnt);

    let statusColor = "";
    if(data.cnslStatusName === "상담중") {
        statusColor = "textColor_chat";
    } else if(data.cnslStatusName === "휴게시간") {
        statusColor = "textColor_break";
    } else if(data.cnslStatusName === "식사시간") {
        statusColor = "textColor_lunch";
    } else if(data.cnslStatusName === "오프라인") {
        statusColor = "textColor_offline";
    } else if(data.cnslStatusName === "상담대기") {
        statusColor = "textColor_online";
    } else if(data.cnslStatusName === "상담종료") {
        statusColor = "textColor_end";
    } else if(data.cnslStatusName === "예약상담") {
        statusColor = "textColor_rsvtn";
    }

    $cnslStatusName.addClass(statusColor);

    $tr.append($index);
    $tr.append($mbrName);
    $tr.append($grpName);
    $tr.append($cnslStatusName);
    $tr.append($waitCnt);
    $tr.append($chatCnt);
    $tr.append($endCnt);

    $("#memberTable").append($tr);
}

function setCnslStatusChart(ajaxData) {

    let offlineCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "오프라인";
    }).length;
    let lunchCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "식사시간";
    }).length;
    let breakCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "휴게시간";
    }).length;
    let chatCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "상담중";
    }).length;

    let chatWaitCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "상담대기";
    }).length;
    
    let onlineCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "온라인";
    }).length;
    let endCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "상담종료";
    }).length;
    let rsvtnCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "예약상담";
    }).length;
    let logoutCnt = $.grep(ajaxData, function(obj) {
        return obj.cnslStatusName == "로그아웃";
    }).length;

    let totalCnt = offlineCnt + lunchCnt + breakCnt + chatCnt + chatWaitCnt + endCnt + rsvtnCnt;
    let data = [offlineCnt, chatWaitCnt, chatCnt, breakCnt, rsvtnCnt, lunchCnt];
    let backgroundColor = ['#DD6666', '#0089ff', '#85a2d1', '#e2ca43', '#b4e683', '#82e0c7'];
    let labels = [];
    let chartObj = {
        "label_offlin": ["오프라인", offlineCnt],
        "label_chatWait": ["상담대기", chatWaitCnt],
        "label_chat": ["상담중", chatCnt],
        "label_break": ["휴게시간", breakCnt],
        "label_rsvtn": ["예약상담중", rsvtnCnt],
        "label_lunch": ["식사시간", lunchCnt]
    };
    /*
    let labels = [
        `오프라인 ${offlineCnt}(${Math.round(offlineCnt/totalCnt*100)}%)`,
        `상담대기 ${chatWaitCnt}(${Math.round(chatWaitCnt/totalCnt*100)}%)`,
        `상담중 ${chatCnt}(${Math.round(chatCnt/totalCnt*100)}%)`,
        `휴게시간 ${breakCnt}(${Math.round(breakCnt/totalCnt*100)}%)`,
        `예약상담중 ${rsvtnCnt}(${Math.round(rsvtnCnt/totalCnt*100)}%)`,
        `식사시간 ${lunchCnt}(${Math.round(lunchCnt/totalCnt*100)}%)`,
    ];
    $("#label_offlin").text(`${offlineCnt} (${Math.round(offlineCnt/totalCnt*100)}%)`);
    $("#label_chatWait").text(`${chatWaitCnt} (${Math.round(chatWaitCnt/totalCnt*100)}%)`);
    $("#label_chat").text(`${chatCnt} (${Math.round(chatCnt/totalCnt*100)}%)`);
    $("#label_break").text(`${breakCnt} (${Math.round(breakCnt/totalCnt*100)}%)`);
    $("#label_rsvtn").text(`${rsvtnCnt} (${Math.round(rsvtnCnt/totalCnt*100)}%)`);
    $("#label_lunch").text(`${lunchCnt} (${Math.round(lunchCnt/totalCnt*100)}%)`);
    */

    for(const key in chartObj ){
        let text = `${chartObj[key][1]}`;
        let per = Math.round(chartObj[key][1]/totalCnt*100);
        if(!isNaN(per))  text += ` (${per}%)`;
        labels.push(`${chartObj[key][0]} ${text}`);
        $("#"+key).text(text);
    }
    if(eval(data.join("+")) == 0) {
        labels = ["상태 데이터 없음"];
        data = [1];
        backgroundColor = ["#919599"];
    }


    if(cnslStatusChart !== undefined) {
        cnslStatusChart.data.datasets[0].data = data;

        if(cnslStatusChart.data.datasets[0].backgroundColor.length != backgroundColor)
            cnslStatusChart.data.datasets[0].backgroundColor = backgroundColor;

        cnslStatusChart.data.labels = labels;
        cnslStatusChart.update();
    } else {
        var ctx = document.getElementById('cnslStatusChart').getContext('2d');
        ctx.canvas.parentNode.style.height = '250px';
        ctx.canvas.parentNode.style.width = '250px';
        cnslStatusChart = new Chart(ctx, {
            type: 'pie', // 파이 차트로 설정
            data: {
                labels: labels,
                datasets: [{
                    data: data, // 데이터 포인트 값
                    backgroundColor: backgroundColor, // 각 데이터 포인트의 색상
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false,
                        // position: 'bottom',
                        // align: 'start',
                   },
                },
            }
        });
    }
}