const menuURL = "/member/list";

let pageSize = 10;
let pageNum = 1;

const createURL = "/member/create";
const grpMngURL = "/member/groupManager";

var sortObj = {
    "sortField":"mbrName",
    "sortType":-1
};

$(document).on("click", "td[data-name=sendEmail]", function() {
    let targetId = $(this).parent("tr").data("id");
    uiConfirm("해당 사용자에 등록된 이메일로 임시 비밀번호가 발송됩니다.\n" +
        "임시 비밀번호를 발송 하시겠습니까?", function(eventTarget, isConfirm) {
        if(isConfirm) {
            const url = "/rest/api/member/tmp-pwd/" + targetId;
            $.ajax({
                url : url,
                type : "POST",
                dataType : "json",
                success : function(ajaxData) {
                },
                error : function(error) {
                    console.log(error);
                }
            })
        }
    })
})

$(document).ready(function() {
    initCombo();
    initEvents();

    loadInitList();
})

function initEvents() {
    $("#searchBtn").on("click", function() {
        movePage(1);
    })

    $("input[data-id=searchStr]").on("keyup",function(key){
        if(key.keyCode==13) {
            movePage(1);
        }
    });

    $("#resetBtn").on("click", function() {
        selectOptionByText("select[data-id=mbrGrpCombo]", "전체");
        selectOptionByText("select[data-id=authCombo]", "전체");
        selectOptionByText("select[data-id=condition]", "전체");
        $("input[data-id=searchStr]").val("");
    })


    let mbrListRtClickEvent = new RtMouseClickEvent( {
        selector : "#mbrTable tr:gt(0)",
        menus : {
            "update" : {
                menuName : "수정",
                callback : openUpdate,
                args : ["id", "mbrname"]
            },
            "delete" : {
                menuName : "삭제",
                callback : doDelete,
                args : ["id"]
            }
        }
    })

    var dropDownMenuEvent = new DropDownMenuEvent({
        selector : "div.setting_line_oj",
        menus : {
            "create" : {
                menuName : "신규",
                callback : openCreate,
                args : []
            },
            "download" : {
                menuName : "다운로드",
                callback : doDownload,
                args : []
            },
            "mngGrp" : {
                menuName : "그룹설정",
                callback : openGrpMng,
                args : []
            }
        }
    });

    var callback = function(params) {
        sortObj = params;
        loadList();
    };

    var sortingOpt = {
        "fields" : ["","mbrName","authName","mbrID","grpName","mbrEmplNum","mbrExtension","mbrMobile", "mbrEmail",""],
        "sortField": "regDate",
        "sortType": -1,
        "callback": callback
    };

    $("#mbrTable tr.table_title_line").commonSorting(sortingOpt);
}

function openCreate(event) {
    let eventData = {
        type : "openNewWindow",
        params : {
            url : createURL,
            menuId : "memberCreate",
            menuName : "사용자 관리 - 신규",
            sendParams : {
                type : "create"
            }
        }
    }

    window.parent.postMessage(eventData, "*");
}



function openUpdate(event, id, mbrName) {
    let eventData = {
        type : "openNewWindow",
        params : {
            url : createURL,
            menuId : "memberCreate" + mbrName,
            menuName : "사용자 관리 - 수정(" + mbrName + ")",
            sendParams : {
                type : "update",
                id : id,
            }
        }
    }

    window.parent.postMessage(eventData, "*");
}

function openGrpMng(event) {
    let eventData = {
        type : "openNewWindow",
        params : {
            url : grpMngURL,
            menuId : "groupManager",
            menuName : "사용자 관리 - 그룹설정",
        }
    }

    window.parent.postMessage(eventData, "*");
}

function doDelete(event, id) {
    let mbrName = $("tr[data-id=" + id + "] td[data-name=mbrName]").text();

    uiConfirm("삭제 하시겠습니까?", function(eventTarget, isConfirmed) {
        if(isConfirmed) {
            const url = "/rest/api/member/remove/" + id;
            $.ajax({
                url : url,
                data : {
                    mbrName : mbrName
                },
                type : "POST",
                dataType : "json",
                success : function(ajaxData) {
                    uiAlert(ajaxData.data, () => { location.reload() });
                },
                error : function(error) {
                    console.log(error);
                }
            })
        }

    })
}

function doDownload(event) {
    let params = {
        sysName : "AUDIT LOG",
        title : "사용자 목록",
        fileName : "사용자 목록(" + today() + ")"
    }
    downloadFile("/rest/api/member/download/list", params);
}

function today(){
    var date = new Date();
    var yyyy = date.getFullYear();
    var mm = date.getMonth()+1;
    mm = mm >= 10 ? mm : '0'+mm;
    var dd = date.getDate();
    dd = dd >= 10 ? dd : '0'+dd;
    return yyyy+'-'+mm+'-'+dd;
}

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
    let authCombos = comboDatas.authComboList;
    let mbrGrpCombos = comboDatas.mbrGrpComboList;

    Object.keys(mbrGrpCombos).forEach(function(key) {
        $("select[data-id=mbrGrpCombo]").append(
            `<option value="${mbrGrpCombos[key].id}">${mbrGrpCombos[key].grpName}</option>`
        )
    })

    Object.keys(authCombos).forEach(function(key) {
        $("select[data-id=authCombo]").append(
            `<option value="${authCombos[key].id}">${authCombos[key].authName}</option>`
        )
    })
}

function loadList(queryParam) {
    if(queryParam === undefined)
        queryParam = {
            pageNum : pageNum,
            pageSize : pageSize
        };

    $.extend(true, queryParam, sortObj);

    const url = "/rest/api/member/list"
    $.ajax({
        url : url,
        type : "POST",
        data : queryParam,
        dataType : "json",
        success : function(ajaxData) {
            $("#mbrTable tr:gt(0)").remove();
            let startPos = ajaxData.data.totalCnt - ((pageNum - 1) * pageSize);
            Object.keys(ajaxData.data.memberList).forEach(function(key) {
                generateMemberListItem(ajaxData.data.memberList[key], (startPos - parseInt(key)));
            })
            setTotalCnt(ajaxData.data.totalCnt);
            generateNoResultTr();

            createPaging(pageNum, ajaxData.data.totalCnt, 5, pageSize);
        },
        error : function(error) {
            console.log(error);
        }
    })
}

function setTotalCnt(totalCnt) {
    $("div[data-id=totalCnt]").text(`(총 : ${totalCnt}명)`);
}

function generateNoResultTr() {
    if($("#mbrTable").find("tr").length === 1)
        $("#mbrTable").append(
            `<tr>\
                <td colspan="10">데이터가 없습니다.</td>\
             </tr>`
        );
}

function loadInitList() {
    loadList();
}

function generateMemberListItem(member, index) {
    let html = "";
    html += `<tr data-id="${member.id}" data-mbrName="${member.mbrName}">`;
    html += `   <td data-name="index">${index}</td>`;
    html += `   <td data-name="mbrName">${member.mbrName}</td>>`;
    html += `   <td data-name="authName">${member.authName}</td>>`;
    html += `   <td data-name="mbrId">${member.mbrID}</td>>`;
    html += `   <td data-name="grpName">${member.grpName}</td>>`;
    html += `   <td data-name="mbrEmplNum">${member.mbrEmplNum}</td>>`;
    html += `   <td data-name="mbrExtension">${member.mbrExtension}</td>>`;
    html += `   <td data-name="mbrMobile">${member.mbrMobile}</td>>`;
    html += `   <td data-name="mbrEmail">${member.mbrEmail}</td>>`;
    html += `   <td data-name="sendEmail"><div class="table_icon email"></div></td>>`;
    html += `</tr>`;

    $("#mbrTable").append($(html));
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
    loadList({
        grpId : $("select[data-id=mbrGrpCombo] option:selected").val(),
        authId : $("select[data-id=authCombo] option:selected").val(),
        condition : $("select[data-id=condition] option:selected").val(),
        searchStr : $("input[data-id=searchStr]").val(),
        pageSize : pageSize,
        pageNum : pageNum
    });
}

function selectOptionByText(selector, text) {
    $(`${selector} option`).filter(function() {
        return $(this).text() === text;
    }).prop('selected', true);
}