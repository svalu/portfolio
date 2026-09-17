let pageSize = 10;
let pageNum = 1;
const counselingClassifierUrl = "/rest/api/counselingClassifier"
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
    // $("#accessConfirm").on("click", function() {
        saveAccessLog();
        // $("#searchEndDt").attr("max", getTodayForInput());
    // })

    // $("#accessDeny").on("click", function() {
    //     $(window.parent.document).find("iframe[src='/analytics/personal/counselingHistory']").parents("div[name=iframeWindow]").find("button[data-action=close]").click();
    // })

})

function initEvents() {
    $("#searchBtn").on("click", function() {

        const checkDateRst = validationSearchDate($("#searchStartDt").val(), $("#searchEndDt").val());
        if(!checkDateRst.success) {
            uiAlert(checkDateRst.msg);
            return;
        }

        movePage(1);
    })

    $("#searchStr").on("keyup",function(key){
        if(key.keyCode==13) {
            movePage(1);
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
        "fields" : ["","grpName","userName","userMobile","cnslDate","categName","postProcContent", "regDate", "postProcType"],
        "sortField": "regDate",
        "sortType": -1,
        "callback": callback
    };

    $("#cnslHistTable tr.table_title_line").commonSorting(sortingOpt);
}

function doDownload(event) {
    if($("#cnslHistTable tr").not(".table_title_line").find("td").length <= 1) {
        uiAlert("데이터가 없습니다.");
        return;
    }
    let params = {
        sysName : "CNSL LOG",
        title : "개인 상담이력 관리",
        fileName : "개인 상담이력 관리 목록(" + new Date().format("yyyy-mm-dd") + ")"
    }
    $.extend(true, params, searchObj, sortObj);

    downloadFile("/rest/api/analytics/user/cnsl-hist/download/list", params);
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

function getCategoryList() {
    $("#cnslHistTable tr:gt(0)").remove();
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

function loadDatas() {
    let params = {
        searchCondition : $("#searchCondition").val(),
        searchStr : $("#searchStr").val(),
        searchStartDt : $("#searchStartDt").val(),
        searchEndDt : $("#searchEndDt").val(),
        cnslReviewGrade : $("#cnslReviewGrade").val(),
        pageSize : pageSize,
        pageNum : pageNum
    }
    searchObj = params;
    $.extend(true, params, sortObj);

    if($("#currCategLevel").val() !== "" && $("#currCategId").val() !== "") {
        params.categLevel = parseInt($("#currCategLevel").val()) - 1; //root node 추가로 인하여 -1
        params.categId = $("#currCategId").val();
    }

    const url = "/rest/api/analytics/user/cnsl-hist/list";
    $.ajax({
        url : url,
        data : params,
        type : 'POST',
        dataType : 'json',
        success : function(ajaxData) {
            $("#cnslHistTable tr:gt(0)").empty();
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
    let $grpName = $(`<td></td>`).text(data.grpName); //그룹
    let $userName = $(`<td></td>`).text(data.userName);//고객명
    let $userHp = $(`<td></td>`).text(data.userMobile);//고객명//고객 전화번호
    let $cnslDate = $(`<td class="table_text_num"></td>`).html(data.cnslDate); //상담시간
    let categName = $(`<td></td>`).text(data.categName); //상담분류
    let $postProcContent = $(`<td class="table_text_over"></td>`).text(data.postProcContent); //상담내용
    let regDate = new Date(data.regDate).format("yyyy-mm-dd HH:MM:ss");
    let $regDate =$(`<td class="table_text_num"></td>`).html(regDate.replace(" ", "<br>"));

    //let $postProcType = $(`<td></td>`).text(data.postProcType); //상담유형
    let $postProcType = $(`<td></td>`); //상담유형

    let $iconWrap = $(`<div class="table_icon_wrap"></div>`);
    let $icon = $(`<div class="table_icon ${data.postProcCd === 'RSVTN' ? 'clock' : 'chatting'}"></div>`);
    let $iconText = $(`<span></span>`).text(data.postProcType);

    $iconWrap.append($icon);
    $iconWrap.append($iconText);
    $postProcType.append($iconWrap);

    $iconWrap.on("click", function() {
        viewHistory(data.postProcCd, data.targetId);
    })

    $tr.append(`<td>${index}</td>`);
    $tr.append($grpName);
    $tr.append($userName);
    $tr.append($userHp);
    $tr.append($cnslDate);
    $tr.append(categName);
    $tr.append($postProcContent);
    $tr.append($regDate);
    $tr.append($postProcType);
    $tr.css("cursor", "pointer");
    $tr.find("td:not(:last-child)").on("click", function() {
        //console.log( $(this).html() );
        logDetail(data.id);
    });

    $("#cnslHistTable").append($tr);
}

function logDetail(data) {
    let eventData = {
        type : "openNewWindow",
        params : {
            url : "/analytics/personal/chatHistDetail",
            menuId : `logView_${data}`,
            menuName : `상세내용`,
            sendParams : {
                id : data
            }
        }
    }
    window.parent.postMessage(eventData, "*");
}

function chatView(data) {
    console.log("chatView", data);
    /*
    let eventData = {
        type : "openNewWindow",
        params : {
            url : "",
            menuId : `noticeView_${noticeData[ord].id}`,
            menuName : `${menuTitle} - 상세내용`,
            sendParams : {
                id : noticeData[ord].id
            }
        }
    }
    window.parent.postMessage(eventData, "*");
    */
}
function generateNoResultTr() {
    //if($("#cnslHistTable").find("tr").length === 1)
        $("#cnslHistTable").append(
            `<tr>\
                <td colspan="10">데이터가 없습니다.</td>\
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

        /*today.setHours(today.getHours() + 9);
        $("#searchStartDt").val(getDateAgo(offset));
        $("#searchEndDt").val( today.toISOString().slice(0, 10));*/
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

function saveAccessLog() {
    const url = "/rest/api/analytics/user/cnsl-hist/access";
    $.ajax({
        url : url,
        type : 'POST',
        // data : { accessRsn : $("#auditLogRsn").val()},
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