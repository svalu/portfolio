var monthlyAvgHourChart;
var monthlyCountChart;
var monthlyGradeChart;

function setCountDatas(datas) {
    $("#totalCnslCnt").text(datas.totalCnslCnt+"건");
    $("#totalChatCnt").text(datas.totalChatCnt+"건");
    $("#totalRsvtnCnt").text(datas.totalRsvtnCnt+"건");
    $("#totAvgCnslDuration").text(datas.totAvgCnslDuration);

    let avgCnslReviewGrade = "-";
    if(datas.totalCnslReviewCnt > 0) avgCnslReviewGrade = (datas.totalCnslReviewGrade/datas.totalCnslReviewCnt).toFixed(1) + "점";
    $("#totAvgCnslReviewGrade").text(avgCnslReviewGrade);
}

function resetDayBarChart() {
    $("#dayBarWrap").empty();
    redrawDayBarChart("mon", "월");
    redrawDayBarChart("tue", "화");
    redrawDayBarChart("wed", "수");
    redrawDayBarChart("thu", "목");
    redrawDayBarChart("fri", "금");
    redrawDayBarChart("sat", "토");
    redrawDayBarChart("sun", "일");
}













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

function generateTimeBarChart(timeDatas) {
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
}

function generateGradeBarChart(dayDatas) {
    resetGradeBarChart();
    let $gardeBarWrap = $("#gardeBarWrap");

    Object.keys(dayDatas).forEach(function(key) {
        let barItemWrap = $gardeBarWrap.find(`div[name=${dayDatas[key].day}]`);
        switch (dayDatas[key].day) {
            case "mon": {
                barItemWrap.find("span[name=barText]").text(`월 (${dayDatas[key].cnslReviewCount}건)`);
                break;
            }
            case "tue": {
                barItemWrap.find("span[name=barText]").text(`화 (${dayDatas[key].cnslReviewCount}건)`);
                break;
            }
            case "wed": {
                barItemWrap.find("span[name=barText]").text(`수 (${dayDatas[key].cnslReviewCount}건)`);
                break;
            }
            case "thu": {
                barItemWrap.find("span[name=barText]").text(`목 (${dayDatas[key].cnslReviewCount}건)`);
                break;
            }
            case "fri": {
                barItemWrap.find("span[name=barText]").text(`금 (${dayDatas[key].cnslReviewCount}건)`);
                break;
            }
            case "sat": {
                barItemWrap.find("span[name=barText]").text(`토 (${dayDatas[key].cnslReviewCount}건)`);
                break;
            }
            case "sun": {
                barItemWrap.find("span[name=barText]").text(`일 (${dayDatas[key].cnslReviewCount}건)`);
                break;
            }
        }

        let percentage = 0;

        if(dayDatas[key].cnslReviewCount > 0) {
            percentage = (dayDatas[key].cnslReviewGrade / dayDatas[key].cnslReviewCount).toFixed(2);
        }

        barItemWrap.find("div[name=barItem]").css("height", `${(percentage/5)*100}%`);
        barItemWrap.find("div[name=barValue]").text(`${percentage}점`);
    });

    $("div.bar_item_wrap").find("div[name=barItem]").removeClass("display_none");
    $("div.bar_item_wrap").find("div[name=barValue]").removeClass("display_none");
}












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
            /*
            var item = data.find(item => item.cnslDate === yyyyMMDDDate);
            dateCountMap[mmddDate] = {
                chat: item.postProcType === "CHAT" ? item.count : 0,
                rsvtn: item.postProcType === "RSVTN" ? item.count : 0
            }
            dateCountMap[mmddDate] = {
                chat: item.find(item => item.postProcType == "CHAT").count,
                rsvtn: item.find(item => item.postProcType == "RSVTN").count
            }
            */
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
        var item = data.find(item => item.cnslDate === yyyyMMDDDate && item.postProcType === "CHAT");

        labels.push(mmddDate);
        avgCnslDurations.push((item !== undefined && item.postProcType === "CHAT") ? (item.avgCnslDurationSeconds/60).toFixed(1) : 0);
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

function setPerfGradeCharByMonth(data, searchStartDt, searchEndDt) {
    var labels = [];
    var avgGrades = [];
    var ctx = document.getElementById('monthlyAvgGradeChart').getContext('2d');

    var startDate = new Date(searchStartDt);
    var endDate = new Date(searchEndDt);

    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        var yyyy = currentDate.getFullYear();
        var mm = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        var dd = currentDate.getDate().toString().padStart(2, '0');
        var mmddDate = mm + "-" + dd;
        var yyyyMMDDDate = yyyy + "-" + mm + "-" + dd;
        var item = data.find(item => item.cnslDate === yyyyMMDDDate && item.postProcType === "CHAT");

        labels.push(mmddDate);
        let avgGrade = 0;
        if(item !== undefined && item.postProcType === "CHAT") {
            if(item.countCnslReview > 0) {
                avgGrade = (item.sumCnslReviewGrade / item.countCnslReview).toFixed(2);
            }
        }

        avgGrades.push(avgGrade);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if(monthlyGradeChart !== undefined)
        monthlyGradeChart.destroy();

    monthlyGradeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '평균 평점',
                data: avgGrades,
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


function redrawDayBarChart(labelName, labelInKorean) {
    let $barItemWrap = $(`<div class="bar_item_wrap" name="${labelName}"></div>`);
    let $barText = $(`<span name="barText">${labelInKorean} (0건)</span>`);
    let $barItem = $(`<div class="bar_oj_wrap" name="barItem"></div>`);
    let $barColor1 = $(`<div class="bar_oj color_1_1"></div>`);
    let $barColor2 = $(`<div class="bar_oj color_1_2"></div>`);
    let $barColor3 = $(`<div class="bar_oj color_1_3"></div>`);
    let $barValue = $(`<div class="per_text color_1" name="barValue">0%</div>`);
    $barItem.append($barColor1);
    $barItem.append($barColor2);
    $barItem.append($barColor3);
    $barItem.append($barValue);
    $barItemWrap.append($barText);
    $barItemWrap.append($barItem);
    $("#dayBarWrap").append($barItemWrap);
}

function redrawGradeBarChart(labelName, labelInKorean) {
    let $barItemWrap = $(`<div class="bar_item_wrap" name="${labelName}"></div>`);
    let $barText = $(`<span name="barText">${labelInKorean} (0건)</span>`);
    let $barItem = $(`<div class="bar_oj_wrap" name="barItem"></div>`);
    let $barColor1 = $(`<div class="bar_oj color_1_1"></div>`);
    let $barColor2 = $(`<div class="bar_oj color_1_2"></div>`);
    let $barColor3 = $(`<div class="bar_oj color_1_3"></div>`);
    let $barValue = $(`<div class="per_text color_1" name="barValue">0%</div>`);
    $barItem.append($barColor1);
    $barItem.append($barColor2);
    $barItem.append($barColor3);
    $barItem.append($barValue);
    $barItemWrap.append($barText);
    $barItemWrap.append($barItem);
    $("#gardeBarWrap").append($barItemWrap);
}

function resetGradeBarChart() {
    $("#gardeBarWrap").empty();
    redrawGradeBarChart("mon", "월");
    redrawGradeBarChart("tue", "화");
    redrawGradeBarChart("wed", "수");
    redrawGradeBarChart("thu", "목");
    redrawGradeBarChart("fri", "금");
    redrawGradeBarChart("sat", "토");
    redrawGradeBarChart("sun", "일");
}