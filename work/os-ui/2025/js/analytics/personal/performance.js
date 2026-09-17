

$(document).ready(function() {
    // $("#searchEndDt").attr("max", getTodayForInput());

    setDatesByFlag(2);

    $("#periodSelector").change(function() {
        setDatesByFlag(parseInt($(this).val()));
    })

    $("#periodSelector").val(2);

    $("#searchBtn").on("click", function() {
        loadUpperChartDatas();
    });

    $("#resetBtn").on("click", function() {
        setDatesByFlag(2); //this month
        $("#periodSelector").val(2);
    });

    $("#monthInput").on("change", function() {
        loadLowerChartDatas();
    });

    $("#searchBtn2").on("click", function() {
        loadLowerChartDatas();
    });

    $("#resetBtn2").on("click", function() {
        setDatesByFlag(2, new Date($("#monthInput").val()));
    });

    loadUpperChartDatas();
    var currentDate = new Date();
    var currentMonth = currentDate.toISOString().slice(0, 7);
    $("#monthInput").val(currentMonth);
    loadLowerChartDatas();
});

function loadUpperChartDatas() {

    let params = {
        searchStartDt :  new Date($("#searchStartDt").val()),
        searchEndDt : new Date($("#searchEndDt").val()),
    }

    if (params.searchStartDt > params.searchEndDt) {
        uiAlert("조회 시작일이 종료일보다 큽니다.")
    }

    const url = "/rest/api/analytics/user/perf/data";
    $.ajax({
        url : url,
        type : 'POST',
        dataType : 'json',
        data : params,
        success : function(ajaxData) {
            resetDayBarChart();
            $("#timeBarWrap1").empty();
            $("#timeBarWrap2").empty();

            gerenateDayBarChart(ajaxData.dataByDays);
            generateTimeBarChart(ajaxData.dataByHours);
            generateGradeBarChart(ajaxData.dataByDays);
            setCountDatas(ajaxData);
            // console.log(ajaxData);
        },
        error : function(error) {
            console.log(error);
        }
    });
}

function loadLowerChartDatas() {
    let params = setDatesByFlag(2, new Date($("#monthInput").val()));

    const url = "/rest/api/analytics/user/perf/data/month";
    $.ajax({
        url : url,
        data : params,
        type : 'POST',
        dataType : 'json',
        success : function(ajaxData) {
            setPerfCountCharByMonth(ajaxData, params.searchStartDt, params.searchEndDt);
            setPerfHourCharByMonth(ajaxData, params.searchStartDt, params.searchEndDt);
            setPerfGradeCharByMonth(ajaxData, params.searchStartDt, params.searchEndDt);
        },
        error : function(error) {
            console.log(error);
        }
    });
}

/*function setCountDatas(datas) {
    $("#totalCnslCnt").text(datas.totalCnslCnt+"건");
    $("#totalChatCnt").text(datas.totalChatCnt+"건");
    $("#totalRsvtnCnt").text(datas.totalRsvtnCnt+"건");
    $("#totAvgCnslDuration").text(datas.totAvgCnslDuration);

    let postProcGrade = "-";
    if(datas.totalPostProcCnt > 0) postProcGrade = (datas.totalPostProctGrade/datas.totalPostProcCnt).toFixed(1) + "점";
    $("#totAvgPostProcGrade").text(postProcGrade);
}*/




/*function resetDayBarChart() {
    $("#dayBarWrap").empty();
    redrawDayBarChart("mon", "월");
    redrawDayBarChart("tue", "화");
    redrawDayBarChart("wed", "수");
    redrawDayBarChart("thu", "목");
    redrawDayBarChart("fri", "금");
    redrawDayBarChart("sat", "토");
    redrawDayBarChart("sun", "일");

}*/

/*function generateGradeBarChart(dayDatas) {
    resetGradeBarChart();
    let $gardeBarWrap = $("#gardeBarWrap");

    Object.keys(dayDatas).forEach(function(key) {
        let barItemWrap = $gardeBarWrap.find(`div[name=${dayDatas[key].day}]`);
        switch (dayDatas[key].day) {
            case "mon": {
                barItemWrap.find("span[name=barText]").text(`월 (${dayDatas[key].postProcCount}건)`);
                break;
            }
            case "tue": {
                barItemWrap.find("span[name=barText]").text(`화 (${dayDatas[key].postProcCount}건)`);
                break;
            }
            case "wed": {
                barItemWrap.find("span[name=barText]").text(`수 (${dayDatas[key].postProcCount}건)`);
                break;
            }
            case "thu": {
                barItemWrap.find("span[name=barText]").text(`목 (${dayDatas[key].postProcCount}건)`);
                break;
            }
            case "fri": {
                barItemWrap.find("span[name=barText]").text(`금 (${dayDatas[key].postProcCount}건)`);
                break;
            }
            case "sat": {
                barItemWrap.find("span[name=barText]").text(`토 (${dayDatas[key].postProcCount}건)`);
                break;
            }
            case "sun": {
                barItemWrap.find("span[name=barText]").text(`일 (${dayDatas[key].postProcCount}건)`);
                break;
            }
        }

        let percentage = 0;

        if(dayDatas[key].postProcCount > 0) {
            percentage = dayDatas[key].postProcGrade / dayDatas[key].postProcCount;
        }

        barItemWrap.find("div[name=barItem]").css("height", `${percentage}%`);
        barItemWrap.find("div[name=barValue]").text(`${percentage}점`);
    });

    $("div.bar_item_wrap").find("div[name=barItem]").removeClass("display_none");
    $("div.bar_item_wrap").find("div[name=barValue]").removeClass("display_none");
}*/
/*
function gerenateDayBarChart(dayDatas) {
    resetDayBarChart();
    let $dayBarWrap = $("#dayBarWrap");

    Object.keys(dayDatas).forEach(function(key) {
        let barItemWrap = $dayBarWrap.find(`div[name=${dayDatas[key].day}]`);
        switch (dayDatas[key].day) {
            case "mon": {
                barItemWrap.find("span[name=barText]").text(`월 (${dayDatas[key].count}건)`);
                break;
            }
            case "tue": {
                barItemWrap.find("span[name=barText]").text(`화 (${dayDatas[key].count}건)`);
                break;
            }
            case "wed": {
                barItemWrap.find("span[name=barText]").text(`수 (${dayDatas[key].count}건)`);
                break;
            }
            case "thu": {
                barItemWrap.find("span[name=barText]").text(`목 (${dayDatas[key].count}건)`);
                break;
            }
            case "fri": {
                barItemWrap.find("span[name=barText]").text(`금 (${dayDatas[key].count}건)`);
                break;
            }
            case "sat": {
                barItemWrap.find("span[name=barText]").text(`토 (${dayDatas[key].count}건)`);
                break;
            }
            case "sun": {
                barItemWrap.find("span[name=barText]").text(`일 (${dayDatas[key].count}건)`);
                break;
            }
        }
        barItemWrap.find("div[name=barItem]").css("height", `${dayDatas[key].percentage}%`);
        barItemWrap.find("div[name=barValue]").text(`${dayDatas[key].percentage}%`);
    });

    $("div.bar_item_wrap").find("div[name=barItem]").removeClass("display_none");
    $("div.bar_item_wrap").find("div[name=barValue]").removeClass("display_none");
}
*/
/*function generateTimeBarChart(timeDatas) {
    let $timeBarWrap1 = $("#timeBarWrap1");
    let $timeBarWrap2 = $("#timeBarWrap2");
    $timeBarWrap1.empty();
    $timeBarWrap2.empty();

    function formatDigit(n){
        return n > 9 ? "" + n: "0" + n;
    }

    let timeArray = [];
    let newTimeData = {};
    for(let i = 0; i < 24; i++) {
        var targetData = $(timeDatas).filter(function() {
            return this.cnslHour === formatDigit(i);
        });

        if(targetData.length === 0) {
            newTimeData[i] = {
                cnslHour : formatDigit(i),
                count : 0,
                percentage : 0
            }
        } else {
            newTimeData[i] = targetData[0];
        }
        timeArray.push(i);
    }

    Object.keys(newTimeData).forEach(function(key) {
        let $barItemWrap = $(`<div class="bar_item_wrap"></div>`);
        let $textSpan = $(`<span>${newTimeData[key].cnslHour}시 (${newTimeData[key].count}건)</span>`);
        let $barItem = $(`<div class="bar_oj_wrap"></div>`).css("height", `${newTimeData[key].percentage}%`);
        let $barColor1 = $(`<div class="bar_oj color_2_1"></div>`);
        let $barColor2 = $(`<div class="bar_oj color_2_2"></div>`);
        let $barColor3 = $(`<div class="bar_oj color_2_3"></div>`);
        let $barText = $(`<div class="per_text color_2">${newTimeData[key].percentage}%</div>`);

        $barItem.append($barColor1);
        $barItem.append($barColor2);
        $barItem.append($barColor3);
        $barItem.append($barText);

        $barItemWrap.append($textSpan);
        $barItemWrap.append($barItem);

        if(parseInt(newTimeData[key].cnslHour) < 12)
            $timeBarWrap1.append($barItemWrap);
        else
            $timeBarWrap2.append($barItemWrap);
    });
}*/

function setDatesByFlag(flag, certainDate) {
    var today = new Date();
    if(certainDate !== undefined)
        today = certainDate;
    var startDate = new Date();
    var endDate = new Date();

    try {
        var dateObj = getDateRange(flag, today);
        startDate = dateObj["start"].format("yyyy-mm-dd");
        endDate = dateObj["end"].format("yyyy-mm-dd");
    } catch(e) {

    }

    /*switch (flag) {
        case 0: // This week
            startDate = new Date(today);
            startDate.setDate(today.getDate() - today.getDay());
            endDate = new Date(today);
            endDate.setDate(today.getDate() + (6 - today.getDay()));
            break;
        case 1: // Last week
            startDate = new Date(today);
            startDate.setDate(today.getDate() - today.getDay() - 7);
            endDate = new Date(today);
            endDate.setDate(today.getDate() - today.getDay() - 1);
            break;
        case 2: // This month
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()); // Set to the last day of the current month
            break;
        case 3: // Last month
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 4: // This year
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
        case 5: // today
            startDate = new Date(today);
            endDate = new Date(today);
            break;
        default:
            console.log("Invalid flag.");
            return;
    }*/

    const formattedStartDate = startDate;
    const formattedEndDate = endDate;

    if(certainDate === undefined) {
        $("#searchStartDt").val(formattedStartDate);
        $("#searchEndDt").val(formattedEndDate);
    }

    return {
        searchStartDt: new Date(formattedStartDate),
        searchEndDt: new Date(formattedEndDate),
    }
}
/*
function setPerfCountCharByMonth(data, searchStartDt, searchEndDt) {
    var ctx = document.getElementById('monthlyCountChart').getContext('2d');
    var labels = [];
    var chatCountData = [];
    var rsvtnCountData = [];
    var dateCountMap = {};

    var startDate = new Date(searchStartDt);
    var endDate = new Date(searchEndDt);

    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        var yyyy = currentDate.getFullYear();
        var mm = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        var dd = currentDate.getDate().toString().padStart(2, '0');
        var mmddDate = mm + "-" + dd;
        var yyyyMMDDDate = yyyy + "-" + mm + "-" + dd;

        if (!data.some(item => item.cnslDate === yyyyMMDDDate)) {
            dateCountMap[mmddDate] = {chat: 0, rsvtn: 0};
        } else {

            // var item = data.find(item => item.cnslDate === yyyyMMDDDate);
            // dateCountMap[mmddDate] = {
            //     chat: item.postProcType === "CHAT" ? item.count : 0,
            //     rsvtn: item.postProcType === "RSVTN" ? item.count : 0
            // }
            // dateCountMap[mmddDate] = {
            //     chat: item.find(item => item.postProcType == "CHAT").count,
            //     rsvtn: item.find(item => item.postProcType == "RSVTN").count
            // }

            var item = $.grep(data, e => e.cnslDate == yyyyMMDDDate);
            dateCountMap[mmddDate] = {};
            $(item).each(function(idx, obj) {
                if(obj.postProcType == "CHAT") {
                    dateCountMap[mmddDate] = Object.assign(dateCountMap[mmddDate], { chat: obj.count });
                } else if(obj.postProcType == "RSVTN") {
                    dateCountMap[mmddDate] = Object.assign(dateCountMap[mmddDate], { rsvtn: obj.count });
                }
            });
        }
        labels.push(mmddDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    $.each(labels, function (index, mmddDate) {
        let chatCnt = dateCountMap[labels[index]].chat;
        let rsvtnCnt = dateCountMap[labels[index]].rsvtn;
        if(!chatCnt) chatCnt = 0;
        if(!rsvtnCnt) rsvtnCnt = 0;

        chatCountData.push(chatCnt);
        rsvtnCountData.push(rsvtnCnt);
    });


    if(monthlyCountChart !== undefined)
        monthlyCountChart.destroy();

    monthlyCountChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '상담완료',
                    data: chatCountData,
                    borderColor: '#a0adef',
                    borderWidth: 2
                },
                {
                    label: '예약상담완료',
                    data: rsvtnCountData,
                    borderColor: '#bababa',
                    borderWidth: 2
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {if (value % 1 === 0) {return value;}}
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                },
            },
        }
    });
}

function setPerfHourCharByMonth(data, searchStartDt, searchEndDt) {
    var labels = [];
    var avgCnslDurations = [];
    var ctx = document.getElementById('monthlyAvgHourChart').getContext('2d');

    var startDate = new Date(searchStartDt);
    var endDate = new Date(searchEndDt);

    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        var yyyy = currentDate.getFullYear();
        var mm = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        var dd = currentDate.getDate().toString().padStart(2, '0');
        var mmddDate = mm + "-" + dd;
        var yyyyMMDDDate = yyyy + "-" + mm + "-" + dd;

        var item = data.find(item => item.cnslDate === yyyyMMDDDate);

        labels.push(mmddDate);
        avgCnslDurations.push((item !== undefined && item.postProcType === "CHAT") ? item.avgCnslDuration : 0);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if(monthlyAvgHourChart !== undefined)
        monthlyAvgHourChart.destroy();

    monthlyAvgHourChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '평균 상담시간',
                data: avgCnslDurations,
                borderColor: '#3ac9a2',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                },
            },
        }
    });
}
*/
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}