$(document).ready(function() {
    // $("#searchEndDt").attr("max", getTodayForInput());

    setDatesByFlag(2); //this month

    if(mbrType == "SYS_ADMIN") {
        $("#searchGroupDiv, #searchMonthGroupDiv").removeClass("display_none");
        $("#searchGroupDiv, #searchMonthGroupDiv").next(".contour_col").removeClass("display_none");

    }

    switch(mbrType) {
        case "SYS_ADMIN":
        case "GROUP_ADMIN":
            $("#searchMbrNameDiv, #searchMonthMbrNameDiv").removeClass("display_none");
            $("#searchMbrNameDiv, #searchMonthMbrNameDiv").next(".contour_col").removeClass("display_none");
            break;
    }

    $("#periodSelector").change(function() {
        setDatesByFlag(parseInt($(this).val()));
    })

    $("#periodSelector").val(2);

    $("#searchBtn").on("click", function() {

        $('div[name=dupNameWrap]').addClass('display_none');
        // loadUpperChartDatas();
        $.when(checkDupName($("#searchStr").val())).then(function(ajaxData) {
            if(ajaxData && ajaxData.data.length != 1) {
                showDupNameWrap(ajaxData, "main");
            } else {
                loadUpperChartDatas();
            }
        }).fail(function(error) {
            console.log(error);
        });
    });

    $("#resetBtn").on("click", function() {
        setDatesByFlag(2); //this month
        $("#periodSelector").val(2);
        $("#searchStr").val("");
        $("#mbrGrpCombo").val("");
    });

/*    $("#monthInput").on("change", function() {
        loadLowerChartDatas();
    });*/

    $("#searchBtn2").on("click", function() {
        $('div[name=dupNameWrap2]').addClass('display_none');
        // loadLowerChartDatas();
        $.when(checkDupName($("#searchStr2").val())).then(function(ajaxData) {
            if(ajaxData && ajaxData.data.length != 1) {
                showDupNameWrap(ajaxData, "sub");
            } else {
                loadLowerChartDatas();
            }
        }).fail(function(error) {
            console.log(error);
        });
    });

    $("#resetBtn2").on("click", function() {
        setDatesByFlag(2, new Date());
        $("#searchStr2").val("");
    });

    $("#searchStr").on("keyup",function(key){
        if(key.keyCode==13) {
            $.when(checkDupName($("#searchStr").val())).then(function(ajaxData) {
                if(ajaxData.data.length != 1) {
                    showDupNameWrap(ajaxData, "main");
                } else {
                    loadUpperChartDatas();
                }
            }).fail(function(error) {
                console.log(error);
            });
            // search();
        }
    });

    $("#searchStr2").on("keyup",function(key){
        /*if(key.keyCode==13) {
            loadLowerChartDatas();
        }*/

        if(key.keyCode==13) {
            $.when(checkDupName($("#searchStr2").val())).then(function(ajaxData) {
                if(ajaxData.data.length != 1) {
                    showDupNameWrap(ajaxData, "sub");
                } else {
                    loadLowerChartDatas();
                }
            }).fail(function(error) {
                console.log(error);
            });
            // search();
        }
    });

    $(document).on('click', function(event) {

        //console.log($(event.target).closest('div[name=dupNameWrap]').length);
        if(!$('div[name=dupNameWrap]').hasClass("display_none")) {
            if (!$(event.target).closest('div[name=dupNameWrap]').length) {
                if($(`#dupNameTbl tr`).length == 2) {
                    $('div[name=dupNameWrap]').addClass('display_none');
                }
            }
        }

        if(!$('div[name=dupNameWrap2]').hasClass("display_none")) {
            if (!$(event.target).closest('div[name=dupNameWrap2]').length) {
                if($(`#dupNameTbl2 tr`).length == 2) {
                    $('div[name=dupNameWrap2]').addClass('display_none');
                }
            }
        }
    });

    $(document).on("click", function(event) {
        if($(event.target)[0] !== $(`div[name=dupNameWrap]`)[0] && !$.contains($(`div[name=dupNameWrap]`)[0], $(event.target)[0])) {
            $(`div[name=dupNameWrap]`).addClass("display_none");
        }

        if($(event.target)[0] !== $(`div[name=dupNameWrap2]`)[0] && !$.contains($(`div[name=dupNameWrap2]`)[0], $(event.target)[0])) {
            $(`div[name=dupNameWrap2]`).addClass("display_none");
        }
    })

    loadUpperChartDatas();
    var currentDate = new Date();
    var currentMonth = currentDate.toISOString().slice(0, 7);
    $("#monthInput").val(currentMonth);
    loadLowerChartDatas();

    initCombo();
});

function initCombo() {
    const url = "/rest/api/member/combo-items";
    $.ajax({
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            generateComboItems(ajaxData.data);
        },
        error : function(error) {
            console.log(error);
        }
    })
}

function generateComboItems(comboDatas) {
    let mbrGrpCombos = comboDatas.mbrGrpComboList;

    Object.keys(mbrGrpCombos).forEach(function(key) {
        $("#mbrGrpCombo, #mbrMonthGrpCombo").append(
            `<option value="${mbrGrpCombos[key].id}">${mbrGrpCombos[key].grpName}</option>`
        )
    })
}

function showDupNameWrap(ajaxData, flag) {
    $(`div[name=dupNameWrap${flag === "sub" ? "2" : ""}]`).removeClass("display_none");
    $(`div[name=inputDupName${flag === "sub" ? "2" : ""}]`).text(`이름 : ${flag === "main" ? $("#searchStr").val() : $("#searchStr2").val()}`);

    $(`#dupNameTbl${flag === "sub" ? "2" : ""} tr`).not(".table_title_line").remove();

    if(ajaxData.data.length == 0) {
        let $tr = $(`<tr><td colspan="4">일치하는 상담원이 없습니다.</td></tr>`);
        $(`#dupNameTbl${flag === "sub" ? "2" : ""}`).append($tr);
        return;
    }

    Object.keys(ajaxData.data).forEach(function(key) {
        let $tr = $(`<tr id='${ajaxData.data[key].id}'></tr>`);

        let $mbrName = $("<td></td>").text(ajaxData.data[key].mbrName);
        let $mbrID = $("<td></td>").text(ajaxData.data[key].mbrID);
        let $grpName = $("<td></td>").text(ajaxData.data[key].grpName);
        let $mbrMobile = $("<td></td>").text(ajaxData.data[key].mbrMobile);

        $tr.append($mbrName);
        $tr.append($mbrID);
        $tr.append($grpName);
        $tr.append($mbrMobile);

        $(`#dupNameTbl${flag === "sub" ? "2" : ""}`).append($tr);

        $tr.on("click", function() {
            flag === "main" ? loadUpperChartDatas($(this).attr("id")) : loadLowerChartDatas($(this).attr("id"));
            $(`div[name=dupNameWrap${flag === "sub" ? "2" : ""}]`).addClass("display_none");
        });
    });

}

function checkDupName(mbrName) {

    if($.trim(mbrName) == "") return null;

    const url = "/rest/api/member/check-dup-name";
    const params = {
        "mbrName": mbrName,
        "mbrType" : mbrType
    };

    return $.ajax({
        url: url,
        data: params,
        type: "POST",
        dataType: "json",
        async: false,
        success: function (ajaxData) {
            return ajaxData;
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function loadUpperChartDatas(mbrOid) {

    $('div[name=dupNameWrap]').addClass('display_none');

    let params = {
        searchStartDt :  new Date($("#searchStartDt").val()),
        searchEndDt : new Date($("#searchEndDt").val()),
        grpId : $("#mbrGrpCombo").val(),
        searchStr : $("#searchStr").val()
    }

    if(mbrOid !== undefined)
        params.mbrOid = mbrOid;

    const url = "/rest/api/analytics/admin/tot-perf/data";
    $.ajax({
        url : url,
        type : 'POST',
        dataType : 'json',
        data : params,
        success : function(ajaxData) {
            gerenateDayBarChart(ajaxData.dataByDays);
            generateTimeBarChart(ajaxData.dataByHours);
            generateGradeBarChart(ajaxData.dataByDays);
            setCountDatas(ajaxData);
        },
        error : function(error) {
            console.log(error);
        }
    });
}

function loadLowerChartDatas(mbrOid) {
    let params = setDatesByFlag(2, new Date($("#monthInput").val()));
    if(mbrOid !== undefined)
        params.mbrOid = mbrOid;

    params.grpId = $("#mbrMonthGrpCombo").val();

    const url = "/rest/api/analytics/admin/tot-perf/data/month";
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
    /!*$("#dayBarWrap").find("div.bar_item_wrap").each(function() {
        let dayInKorean = $(this).find("span[name=barText]").text().split(" ")[0];
        $(this).find("span[name=barText]").text(`${dayInKorean} (0건)`);

        $(this).find("div[name=barItem]").css("height", `0%`);
        $(this).find("div[name=barValue]").text(`0%`);
    });*!/
}*/
/*
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

function gerenateDayBarChart(dayDatas) {
    resetDayBarChart();
    let $dayBarWrap = $("#dayBarWrap");

    Object.keys(dayDatas).forEach(function(key) {
        let barItemWrap = $dayBarWrap.find(`div[name=${dayDatas[key].day}]`);
        switch(dayDatas[key].day) {
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
    } else {
        $("#monthInput").val(formattedStartDate.slice(0, 7));
    }

    return {
        searchStartDt: new Date(formattedStartDate),
        searchEndDt: new Date(formattedEndDate),
        searchStr : $("#searchStr2").val()
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
            datasets: [{
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