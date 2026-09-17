let pageSize = 10;
let pageNum = 1;
const counselingClassifierUrl = "/rest/api/counselingClassifier";
const resvDetailUrl = "/counseling/reservation/detail";
const chatLogUrl = "/counseling/chatHist";

let zTreeObj;
var setting = {
    view: {
        selectedMulti: false,
        editNodeBlur: true
    },
    data: {
        simpleData: {
            enable: true,
            pIdKey: "parentId",
            rootPId:null
        }
    },
    callback: {
        onClick: categoryClick
    }
};
let searchObj = {};
var sortObj = {
    "sortField":"regDate",
    "sortType":-1
};
let isHidden = true; //숨김 여부

$(document).ready(function () {
    if(mbrType == "SYS_ADMIN") {
        getGroup();
    }
    // $("#accessConfirm").on("click", function() {
        saveAccessLog();
        //if(getMbrType() != "USER") {
    // })

    // $("#accessDeny").on("click", function() {
    //     $(window.parent.document).find("iframe[src='/analytics/admin/totalCounselingHistory']").parents("div[name=iframeWindow]").find("button[data-action=close]").click();
    // })
})

function getGroup() {
    $.ajax({
        url : "/rest/api/grp-manager/list",
        type : "POST",
        dataType : "json",
        async : false,
        success : function(ajaxData) {
            let html = `<option value="">전체</option>`;
            $(ajaxData.data).each(function(idx, obj) {
                html += `<option value="${obj.id}">${obj.grpName}</option>`;
            });
            $("#searchMbrGrp").append(html);
            $("#searchGroupDiv").removeClass("display_none");
            $("#searchGroupDiv").next(".contour_col").removeClass("display_none");
        },
        error : function(error) {
            console.log(error);
        },
        beforeSend : function(xhr) {
        }
    })
}

function search() {
    pageNum = 1;

    const checkDateRst = validationSearchDate($("#searchStartDt").val(), $("#searchEndDt").val());
    if(!checkDateRst.success) {
        uiAlert(checkDateRst.msg);
        return;
    }

    $.when(checkDupName()).then(function(ajaxData) {
        if(ajaxData.data.length > 1 && $("#searchCondition").val() === "mbrName") {
            showDupNameWrap(ajaxData);
        } else {
            loadDatas();
        }
    }).fail(function(error) {
        console.log(error);
    });
}

function initEvents() {
    // $("#searchEndDt").attr("max", getTodayForInput());

    $("#searchBtn").on("click", function() {

        search();
       /* pageNum = 1;

        const checkDateRst = validationSearchDate($("#searchStartDt").val(), $("#searchEndDt").val());
        if(!checkDateRst.success) {
            uiAlert(checkDateRst.msg);
            return;
        }
        $.when(checkDupName()).then(function(ajaxData) {
            if(ajaxData.data.length > 1 && $("#searchCondition").val() === "mbrName") {
                showDupNameWrap(ajaxData);
            } else {
                loadDatas();
            }
        }).fail(function(error) {
            console.log(error);
        });*/
    })

    $("#searchStr").on("keyup",function(key){
        if(key.keyCode==13) {
            search();

            /*$.when(checkDupName()).then(function(ajaxData) {
                if(ajaxData.data.length > 1 && $("#searchCondition").val() === "mbrName") {
                    showDupNameWrap(ajaxData);
                } else {
                    loadDatas();
                }
            }).fail(function(error) {
                console.log(error);
            });*/
            // search();
        }
    });

    $("#resetBtn").on("click", function() {
        $("#searchStr").val("");
        $("#searchStartDt").val("");
        $("#searchEndDt").val("");
        $("#cnslReviewGrade").val(0);
        hiddenCategoryOff();
        $("#currCategLevel").val("");
        $("#currCategId").val("");
        $("#periodSelector").val("-1");
        $("#searchCondition").val("");
        $("#searchMbrGrp").val("");
    });

    $("#periodSelector").on("change", function() {
        adjustSearchCalendar($(this).val());
    })

    var dropDownMenuEvent = new DropDownMenuEvent({
        selector: "div.setting_line_oj",
        menuContextHandler: dropDownMenuHandler,
        menus: {
            "hiddenItemOn": {
                menuName: "숨김항목 보기",
                callback: hiddenCategoryOn,
                args: []
            },
            "hiddenItemOff": {
                menuName: "숨김항목 끄기",
                callback: hiddenCategoryOff,
                args: []
            },
            "download": {
                menuName: "다운로드",
                callback: doDownload,
                args: []
            }
        }
    });

    var callback = function(params) {
        sortObj = params;
        loadDatas();
    };

    var sortingOpt = {
        "fields" : ["","userName","cnslDate","grpName","categName","postProcTitle","postProcContent", "mbrName","cnslReviewGrade","postProcReivew", "closeChat", "postProcType", "regDate"],
        "sortField": "regDate",
        "sortType": -1,
        "callback": callback
    };

    $("#cnslHistTable tr.table_title_line").commonSorting(sortingOpt);
}

function dropDownMenuHandler(target) {
    // let isHIdden = $("#treeCounsellingClassifier li:hidden").length > 0;

    let hiddenOnMenu = $("#dropDownMenu span").filter( function() { return $(this).justtext() === "숨김항목 보기" } );
    let hiddenOffMenu = $("#dropDownMenu span").filter( function() { return $(this).justtext() === "숨김항목 끄기" } );

    if(isHidden) {
        hiddenOnMenu.removeClass("inactive").off("click").on("click", hiddenCategoryOn);
        hiddenOffMenu.addClass("inactive").off("click");
    } else {
        hiddenOffMenu.removeClass("inactive").off("click").on("click", hiddenCategoryOff);
        hiddenOnMenu.addClass("inactive").off("click");
    }
}

function showDupNameWrap(ajaxData) {
    $("div[name=dupNameWrap]").removeClass("display_none");
    $("div[name=inputDupName]").text(`이름 : ${$("#searchStr").val()}`);

    $("#dupNameTbl tr").not(".table_title_line").remove();
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

        $("#dupNameTbl").append($tr);

        $tr.on("click", function() {
            /*var startDate = $("#searchStartDt").val();
            var endDate = $("#searchEndDt").val();

            if(startDate && endDate) {
                if(startDate > endDate) {
                    uiAlert("조회 시작일이 종료일 보다 큽니다");
                    return;
                }
            }*/
            const checkDateRst = validationSearchDate($("#searchStartDt").val(), $("#searchEndDt").val());
            if(!checkDateRst.success) {
                uiAlert(checkDateRst.msg);
                return;
            }
            pageNum = 1;
            loadDatas($(this).attr("id"));
            $("div[name=dupNameWrap]").addClass("display_none");
        });
    });
}

function checkDupName() {
    const url = "/rest/api/member/check-dup-name";
    const params = {
        "mbrName": $("#searchStr").val(),
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

function getCategoryList() {
    $.ajax({
        url: counselingClassifierUrl+'/list', // 요청할 URL
        type: 'POST',
        dataType: 'json',
        success: function (rstData) {
            let dataList = rstData.data;

            //숨김처리
            $(dataList).each(function(idx, obj) {
                obj.originData = obj.name;
                if(String(obj.categIsUse) == "false") {
                    obj.name = obj.name+" - 숨김";
                }

                if(obj.parentId === undefined)
                    obj.parentId = "root";
            });

            var rootNode = {
              id : "root",
              name : "전체",
              isParent : true,
            };

            dataList.unshift(rootNode);

            zTreeObj = $.fn.zTree.init($("#treeCounsellingClassifier"), setting, dataList);
            hiddenCategoryOff(); //숨김항목 안나오게
            // zTreeObj.expandAll(true); //모든 트리 펼치기
            // pageStatus = pageStatusMap.INIT;
            // initRtClickEvents();

            //전체 하이라이트
            const root = zTreeObj.getNodeByParam("id", rootNode.id);
            $("#" + root.tId + "_a").addClass("curSelectedNode");

        },
        error: function (error) {
            // 요청이 실패했을 때 실행될 함수
            console.error("An error occurred:", error);
        }
    });
}

function hiddenCategoryOn() {
    var nodes = zTreeObj.getNodesByParam("categIsUse", "false");
    isHidden = false;
    zTreeObj.showNodes(nodes);
}

function hiddenCategoryOff() {
    var nodes = zTreeObj.getNodesByFilter(node=>(String(node.categIsUse) === "false")); // search the array of the nodes
    isHidden = true;
    zTreeObj.hideNodes(nodes);
}

function loadDatas(mbrOid) {
    let params = {
        searchCondition : $("#searchCondition").val(),
        searchStr : $("#searchStr").val(),
        searchStartDt : $("#searchStartDt").val(),
        searchEndDt : $("#searchEndDt").val(),
        searchMbrGrp : $("#searchMbrGrp").val(),
        cnslReviewGrade : $("#cnslReviewGrade").val(),
        pageSize : pageSize,
        pageNum : pageNum
    }
    searchObj = params;
    if($("#currCategLevel").val() !== "" && $("#currCategId").val() !== "") {
        params.categLevel = parseInt($("#currCategLevel").val()) - 1; //root node 추가로 인하여 -1
        params.categId = $("#currCategId").val();
    }

    $.extend(true, params, sortObj);

    if(mbrOid !== undefined)
        params.mbrOid = mbrOid;

    const url = "/rest/api/analytics/admin/tot-cnsl-hist/list";
    $.ajax({
        url : url,
        data : params,
        type : 'POST',
        dataType : 'json',
        success : function(ajaxData) {
            //console.log(ajaxData);
            $("#cnslHistTable tr:gt(0)").remove();
            if(ajaxData.cnslHistList.length > 0) {
                let startPos = ajaxData.totalCnt - ((pageNum - 1) * pageSize);
                Object.keys(ajaxData.cnslHistList).forEach(function(key) {
                    generateTableItem(ajaxData.cnslHistList[key], (startPos - parseInt(key)));
                });
                createPaging(pageNum, ajaxData.totalCnt, 5, pageSize);
            } else {
                generateNoResultTr();
                $(".pageing_wrap").html("");
            }




            //툴팁
            $(".table_text_over").each(function(idx, obj) {
                generateTextMemo(obj);
            });
            // console.log(ajaxData);
        },
        error : function(error) {
            console.error("An error occurred:", error);
        }
    })
}

function generateTableItem(data, index){
    let $tr = $(`<tr></tr>`).data("id", data.id);
    let $grpName = $(`<td></td>`).text(data.grpName);
    let $mbrName = $(`<td></td>`).text(data.mbrName);
    let $userName = $(`<td></td>`).text(data.userName);
    let $userMobile = $(`<td></td>`).text(data.userMobile);
    let $cnslDate = $(`<td class="table_text_num"></td>`).html(data.cnslDate);
    let categName = $(`<td></td>`).text(data.categName);
    let $postProcContent = $(`<td class="table_text_over"></td>`).text(data.postProcContent);
    let regDate = new Date(data.regDate).format("yyyy-mm-dd HH:MM:ss");
    let $regDate =$(`<td class="table_text_num"></td>`).html(regDate.replace(" ", "<br>"));
    let $postProcType = $(`<td class="text_red"></td>`);
    let $cnslReviewGrade = $(`<td></td>`).text(data.cnslReviewGrade > 0 ? data.cnslReviewGrade + "/5" : "");

    let cnslEval = "미완료";
    if(data.cnslEval) {
        cnslEval = `${data.cnslEval.evalScore}/${data.cnslEval.itemScore}`;
    }

    let $cnslEvaluation = $(`<td class="text_red"></td>`).text(cnslEval);
    let $closeChat = $(`<td></td>`).text(CLOSE_CHAT[data.closeChat]); //채팅 종료한 사람

    //if(cnslEval) {
    if(data.postProcCd == "CHAT") {
        $cnslEvaluation.on("click", function () {
            evalView(data.id);
        });
    } else {
        $cnslEvaluation.css("cursor", "default");
    }
    //}

    let $iconWrap = $(`<div class="table_icon_wrap"></div>`);
    let $icon = $(`<div class="table_icon ${data.postProcCd === 'RSVTN' ? 'clock' : 'chatting'}"></div>`);
    let $iconText = $(`<span></span>`).text(data.postProcType);

    $iconWrap.append($icon);
    $iconWrap.append($iconText);
    $postProcType.append($iconWrap);

    $postProcType.on("click", function() {
        viewHistory(data.postProcCd, data.targetId);
    })

    $tr.append(`<td>${index}</td>`);
    $tr.append($grpName);
    $tr.append($mbrName);
    $tr.append($userName);
    $tr.append($userMobile);
    $tr.append($cnslDate);
    $tr.append(categName);
    $tr.append($postProcContent);
    $tr.append($regDate);
    $tr.append($postProcType);
    $tr.append($cnslReviewGrade);
    $tr.append($cnslEvaluation);
    $tr.css("cursor", "pointer");
    $tr.find("td").not([$postProcType[0], $cnslEvaluation[0]]).on("click", function() {
        logDetail(data.id);
    });



    /*$([$grpName[0],$mbrName[0],$userName[0],$userMobile[0],$cnslDate[0],categName[0],$postProcContent[0]]).on("click", function () {
        logDetail(data.id);
    })*/


    /*$tr.find("td").filter(function() {
        return $._data(this, "events")?.click === undefined;
    }).on("click", function() {
        logDetail(data.id);
    });*/

    /*
    $tr.find("td").not(":nth-last-child(-n+3)").on("click", function() {
        logDetail(data.id);
    })
    */

    /*$tr.append($postProcTitle);
    $tr.append($cnslReviewDesc);
    $tr.append($closeChat);*/


    $("#cnslHistTable").append($tr);
}
function generateNoResultTr() {
    //if($("#cnslHistTable").find("tr").length === 1)
        $("#cnslHistTable").append(
            `<tr>\
                <td colspan="12">데이터가 없습니다.</td>\
             </tr>`
        );
}

function createPaging(page, totalCnt, blockSize, limit) {
    if(!page) page = 1;
    var opts = {
        'total_record' : totalCnt
        ,	'current_page' : page
        ,	'block_size'   : blockSize
        ,	'items_per_page' : limit
        ,	'link_to' : 'javascript:movePage(__id__)'
    }
    $(".pageing_wrap").paging(opts);
}
function movePage(page) {
    pageNum = page;
    loadDatas();
}

function categoryClick(event, treeId, treeNode) {
    if(treeNode.id === "root") {
        $("#currCategLevel").val("");
        $("#currCategId").val("");
    } else {
        $("#currCategLevel").val(treeNode.level);
        $("#currCategId").val(treeNode.id);
    }

   loadDatas();
}

function adjustSearchCalendar(offset) {
    if(offset > -1) {
        var today = new Date();
        var dateObj = getDateRange(offset, today);

        var startDate = dateObj["start"].format("yyyy-mm-dd");
        var endDate = dateObj["end"].format("yyyy-mm-dd");

        $("#searchStartDt").val(startDate);
        $("#searchEndDt").val(endDate);

    } else {
        $("#searchStartDt").val("");
        $("#searchEndDt").val("");
    }

}

function getDateAgo(offset) {
    var today = new Date();
    today.setHours(today.getHours() + 9);

    if(offset === 30)
        today.setMonth(today.getMonth() - 1);
    else
        today.setDate(today.getDate() - offset);
    return today.toISOString().slice(0, 10);
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

function logDetail(data) {
    let eventData = {
        type : "openNewWindow",
        params : {
            url : "/analytics/admin/chatHistDetail",
            menuId : `logDetailView_${data}`, // 상세페이지에 닫기 있어서 아이디 변경되면 같이 변경해 줘야 함.
            menuName : `상세내용`,
            sendParams : {
                id : data
            }
        }
    }
    window.parent.postMessage(eventData, "*");
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

function saveAccessLog() {
    const url = "/rest/api/analytics/admin/tot-cnsl-hist/access";
    $.ajax({
        url : url,
        type : 'POST',
        /*data : { accessRsn : $("#auditLogRsn").val()},*/
        dataType : 'json',
        success : function(ajaxData) {
            $(".iframe_in_popup").addClass("display_none");

            initEvents();
            getCategoryList();
            loadDatas();
        },
        error : function(error) {
            console.error("An error occurred:", error);
        }
    })
}

function doDownload(event) {
    if($("#cnslHistTable tr").not(".table_title_line").find("td").length <= 1) {
        uiAlert("데이터가 없습니다.");
        return;
    }

    let params = {
        sysName : "CNSL LOG",
        title : "전체 상담이력 관리",
        fileName : "전체 상담이력 관리 목록(" + new Date().format("yyyy-mm-dd") + ")"
    }
    $.extend(true, params, searchObj, sortObj);

    downloadFile("/rest/api/analytics/admin/tot-cnsl-hist/download/list", params);
}

/*
function adjustFootnoteArea(target, event) {
    const iframe = $("div.iframe_body").get(0);
    const textarea = target.get(0);
    const iframeRect = iframe.getBoundingClientRect();
    const textareaBottom = textarea.offsetTop + textarea.clientHeight;

    if (textareaBottom > iframeRect.bottom) {
        const newTop = textarea.offsetTop - (textareaBottom - iframeRect.bottom);
        textarea.style.top = newTop + 'px';
    }
}
*/
