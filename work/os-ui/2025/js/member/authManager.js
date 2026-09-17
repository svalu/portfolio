const TEMPAUTH = "TEMPAUTH"; //복사된 권한 임시 아이디

/**
 * 권한그룹 클릭 이벤트
 */
$(document).on("mousedown", "#authListTbl td.text_l[data-type=authItem]", function(event) {
    if(event.which === 1) { //왼쪽클릭으로만 선택
        selectAuth($(this));
        var allChecked = $('input[type=checkbox][data-name=isAllow]:checked').length === $('input[type=checkbox][data-name=isAllow]').length;
        $('#checkAll').prop('checked', allChecked);
    }
})

$(document).on('change', 'input[type=checkbox][data-name=isAllow]', function () {
    var allChecked = $('input[type=checkbox][data-name=isAllow]:checked').length === $('input[type=checkbox][data-name=isAllow]').length;
    $('#checkAll').prop('checked', allChecked);
});

$(document).ready(function() {
    initEvent();
    loadAuthList();
    loadMenuList();
})

/**
 * 권한그룹 리스트 로드
 */
function loadAuthList() {
    const url = "/rest/api/auth-manager/auth/list"
    $.ajax({
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            let data = ajaxData.data;
            $.each(data, function(index, element) {
                generateAuthItem(undefined, element);
            })
        },
        error : function(error) {
            console.log(error);
        }
    })
}

/**
 * 권한그룹 데이터 오른족 테이블과 맵핑
 * @param authData
 */
function mapAuthData(authData) {
    $.each(authData, function(index, element) {
        $(`input[type=checkbox][data-id=${element.menuId}]`).prop("checked", element.isAllow);
    })
}

/**
 * 메뉴 권한 테이블 초기화
 */
function clearAuthData() {
    $(`input[type=checkbox]`).prop("checked", false);
}

/**
 * 메뉴 권한 테이블 로드
 */
function loadMenuList() {
    const url = "/rest/api/auth-manager/menu/list"
    $.ajax({
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            let data = ajaxData.data;
            $.each(data, function(index, element) {
                generateMenuTable(element);
            })
        },
        error : function(error) {
            console.log(error);
        }
    })
}

/**
 * 이벤트 초기화
 */
function initEvent() {
    /**
     * 마우스 오른족 클릭 이벤트 정의
     * @type {RtMouseClickEvent}
     */
    var authListRtClickEvent = new RtMouseClickEvent({
        selector : `#authListTbl td[data-ismenuable=true]`,
        menuContextHandler : rtClickEventMenuHandler,
        menus : {
            "update" : {
                menuName : "수정",
                callback : activeUpdate,
                args : ["id"]
            },
            "copy" : {
                menuName : "복사",
                callback : duplicateAuth,
                args : ["id"]
            },
            "delete" : {
                menuName : "삭제",
                callback : remove,
                args : ["id"]
            },
            "cancel" : {
                menuName : "취소",
                callback : cancelUpdate,
                args : ["id"]
            },
        }
    });

    /**
     * 드롭다운 메뉴 이벤트 정의
     * @type {DropDownMenuEvent}
     */
    var dropDownMenuEvent = new DropDownMenuEvent({
        selector : "div.setting_line_oj",
        menuContextHandler : dropDownMenuHandler,
        menus : {
            "create" : {
                menuName : "신규",
                callback : generateAuthItem,
                args : []
            },
            "cancel" : {
                menuName : "신규 취소",
                callback : remove,
                args : []
            }
        }
    });

    /**
     * 권한선택 체크박스 클릭 이벤트
     */
    $("#checkAll").on("click", function() {
        var flag = $(this).prop('checked');
        $('input[type=checkbox][data-name=isAllow]').prop('checked', flag);
    });
    /**
     * 저장버튼 클릭 이벤트
     */
    $("#authSave").on("click", saveAuth);
}


/**
 * 메뉴 권한 테이블 생성
 * @param data
 */
function generateMenuTable(data) {
    let children = data.children;
    let classifierId = children.length > 0 ? children[0].id : data.id;
    let childCnt = Math.max(children.length, 1);
    let classifierName = data.menuName;
    let html = "";

    html += `<tr>`;
    html += `   <td data-type="classifier" rowspan="${childCnt}" class="text_l">${classifierName}</td>`;
    if(childCnt > 0) {
        html += `   <td data-type="menu" class="text_l">${children.length > 0 ? children[0].menuName : classifierName}</td>`;
        html += `   <td class=""><input data-name="isAllow" data-id="${classifierId}" type="checkbox"></td>`
    }
    html += `</tr>`;
    if(childCnt > 1) {
        $.each(children, function(index, element) {
            if(index === 0) return true;

            html += `<tr>`;
            html += `   <td data-type="menu" class="text_l">${element.menuName}</td>`;
            html += `   <td class=""><input data-name="isAllow" data-id=${element.id} type="checkbox"></td>`
            html += `</tr>`;
        })
    }

    $("#menuTable").append($(html));
}

/**
 * 오른쪽 마우스 버튼 클릭시 노출되는 메뉴 제어
 * @param target : 선택된 메뉴권한
 */
function rtClickEventMenuHandler(target) {
    let status = target.data("status");
    switch(status) {
        case "sysMgr": {
            let targetMenu = $("#itemMenu").find(`div`).filter(function() { return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정" || $.trim($(this).justtext()) === "취소"); });
            targetMenu.addClass("inactive");
            targetMenu.removeClass("active");
            targetMenu.off("click");
            return;
        }
        case "normal" : {
            let targetMenu = $("#itemMenu").find(`div`).filter(function() {
                return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정" || $.trim($(this).justtext()) === "복사"); });
            targetMenu.addClass("active");
            targetMenu.removeClass("inactive");

            targetMenu = $("#itemMenu").find(`div`).filter(function() { return ($.trim($(this).justtext()) === "취소");});
            targetMenu.addClass("inactive");
            targetMenu.removeClass("active");
            targetMenu.off("click");
            return;
        }
        case "update" : {
            let isNew = $("#authListTbl").find("td[data-isnew=true]").length > 0;
            let targetMenu;
            if(isNew)
                targetMenu = $("#itemMenu").find(`div.mouse_right_oj`);
            else
                targetMenu = $("#itemMenu").find(`div`).filter(function() { return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정" || $.trim($(this).justtext()) === "복사");});

            targetMenu.addClass("inactive");
            targetMenu.removeClass("active");
            targetMenu.off("click");
            return;
        }
    }
}

/**
 * 드롭다운 메뉴 제어
 * @param target
 */
function dropDownMenuHandler(target) {
    let isNew = $("#authListTbl").find("td[data-isnew=true]").length > 0;
    let updating = $("#authListTbl").find("td[data-status=update]").length > 0;

    if(updating) {
        let targetMenu = $("#dropDownMenu").find("span");
        targetMenu.addClass("inactive");
        targetMenu.off("click");
    }

    if(updating && isNew) {
        let targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규"});
        targetMenu.addClass("inactive");
        targetMenu.off("click");

        targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규 취소"});
        targetMenu.removeClass("inactive");
        targetMenu.off("click").on("click", remove);
    } else {
        let targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규"});
        if(updating) {
            targetMenu.addClass("inactive");
            targetMenu.off("click").on("click", generateAuthItem);
        } else {
            targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규"});
            targetMenu.removeClass("inactive");
            targetMenu.off("click").on("click", generateAuthItem);
        }

        targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규 취소"});
        targetMenu.addClass("inactive");
        targetMenu.off("click");


    }
}

/**
 * 권한 그룹 항목 생성
 * @param event : 오른쪽 마우스 클릭 이벤트 객체
 * @param data : 선택된 권한 그룹 항목(td)
 */
function generateAuthItem(event, data) {
    const isNew = data !== undefined ? "false" : "true";
    const id = data !== undefined ? data.id : "";
    const isEdit = data !== undefined ? data.authIsEdit : true;
    const authName = data !== undefined ? data.authName : "";
    let status = data !== undefined ? "normal" : "update";
    let fixed = "";
    if (!isEdit) {//시스템 관리자
        fixed = "checked_hold"
        status = "sysMgr";
    }
    let html  = "";
    html += `<tr>`;
    html += `   <td class="text_l cursor_po ${fixed} table_text_over w_300" data-type="authItem" data-ismenuable="true" data-status="${status}" data-isNew="${isNew}" data-id="${id}" data-isEdit="${isEdit}">`;

    if(authName === "")
        html += `<input id="authInput" class="input_correction" type="text" value="" maxlength="50">`;
    else
        html += `${authName}`;

    html += `</td>`;
    html += `</tr>`;
    let $html = $(html);
    if(isNew === "false")
        $html.data("authData", data.menuElements);
    else {
        clearAuthData();
        $("#authListTbl").find("td.text_l").removeClass("checked");
        $("#authListTbl").find(`td.text_l`).attr("data-ismenuable", false);
        $html.find("td").addClass("checked");
    }

    $("#authListTbl").append($html);
}

/**
 * 권한그룹 항목 삭제
 * @param event
 * @param target : undefined면 드롭다운 메뉴 상의 "신규 취소"
 */
function remove(event, target) {
    if(target === undefined) {
        $("#authListTbl tr:last-child").remove();
        $("#authListTbl").find(`td.text_l`).attr("data-ismenuable", true);
    }
    else {
        let authname = $("#authListTbl").find(`td[data-id=${target}]`).justtext();
        uiConfirm("삭제 하시겠습니까?", function(eventTarget, isConfirmed) {
            if(isConfirmed) {
                const url = "/rest/api/auth-manager/remove/" + target;
                $.ajax({
                    url : url,
                    type : "POST",
                    data : { authName : authname },
                    dataType : "json",
                    success : function(ajaxData) {
                        location.reload();
                        //uiAlert(ajaxData.data, () => location.reload());
                    },
                    error : function(error) {
                        console.log(error);
                    }
                })

            }
        })

    }
}

/**
 * 권한그룹 수정모드
 * @param event
 * @param target
 */
function activeUpdate(event, target) {
    if(!target || target === "") return;

    var td = $("#authListTbl").find(`td[data-id=${target}]`);

    blockAllAuthList();
    var html = `<input id="authInput" class="input_correction" type="text" value="${td.justtext()}" maxlength="50">`;
    td.empty();
    td.append($(html));
    td.attr("data-status", "update");
    td.data("status", "update");
    td.attr("data-ismenuable", true);

    $("div.setting_line_oj").removeClass("active");
    selectAuth(td);
}

/**
 * 권한그룹 수정 취소
 * @param event
 * @param target
 */
function cancelUpdate(event, target) {
    if(!target || target === "") return;

    var td = $("#authListTbl").find(`td[data-id=${target}]`);
    if(target === TEMPAUTH) {
        td.remove();
    } else {
        var authName = td.find("input").val();
        td.empty().text(authName);
        td.attr("data-status", "normal");
        td.data("status", "normal");
    }

    restoreBlockedList();
    $("div.setting_line_oj").removeClass("active");
}

/**
 * 권한그룹 복제
 * @param event
 * @param target
 */
function duplicateAuth(event, target) {
    if(!target || target === "") return;

    var td = $("#authListTbl").find(`td[data-id=${target}]`);

    blockAllAuthList();
    var tempInput = $(`<input id="authInput" class="input_correction" type="text" value="${td.justtext() + " - 복사본"}" maxlength="50">`)
    var newTd = td.clone();
    newTd.attr("data-id", TEMPAUTH);
    newTd.data("isnew", true);
    newTd.data("status", "update");
    newTd.attr("data-status", "update");
    newTd.empty().append(tempInput);
    newTd.attr("data-ismenuable", true);

    //현재 선택중인 권한 포커스 해제
    clearAuthData();
    td.removeClass("checked");

    $("#authListTbl").append($("<tr></tr>").append(newTd));

    selectAuth(newTd);
}

/**
 * 저장
 */
function saveAuth() {
    let selectedTd = $("#authListTbl").find("td.checked");
    let id = selectedTd.data("id");
    let authName = selectedTd.justtext() === "" ? selectedTd.find("input").val() : selectedTd.justtext();
    let authSeq = $("#authListTbl").find("td.text_l").index();
    let menuElements = gatherAuthData();
    let isNew = selectedTd.data("isnew");

    let params = {
        authName : authName,
        authSeq : authSeq,
        menuElements : menuElements,
        isNew : isNew
    }
    if(id !== "" && id !== TEMPAUTH)
        params.id = id;

    if(authName === "" || authName === undefined) {
        $.fn.oneBtnPopup({
            title: "확인창",
            context: "권한명이 없습니다. 권한명을 입력해주세요.",
            confirmText: "확인",
            id: 'noAuthName-alert',
        });

        return;
    }

    const url = "/rest/api/auth-manager/save/menu";
    $.ajax({
        url : url,
        data : JSON.stringify(params),
        type : "POST",
        dataType : "json",
        contentType : "application/json",
        success : function(ajaxData) {
            const result = ajaxData.data.split("||")[0];
            const msg = ajaxData.data.split("||")[1];
            $.fn.oneBtnPopup({
                title: "확인창",
                context: msg,
                confirmText: "확인",
                id: 'saveResult-alert',
                confirmCallback : function() {
                    if(result === "true")
                        location.reload();
                }
            });

        },
        error : function(error) {
            console.log("error : ", error);
        }
    })

}

/**
 * 메뉴 권한 테이블에서 체크된 항목들 취합
 * @returns {*|jQuery}
 */
function gatherAuthData() {
    return $("#menuTable").find("input[data-name=isAllow]").map(function() {
                return {
                    isAllow : $(this).prop("checked"),
                    menuId : $(this).data("id")
                }
            }).get();
}

/**
 * 모든 권한 그룹 오른쪽 클릭 이벤트 block
 */
function blockAllAuthList() {
    $("#authListTbl").find("td.text_l").attr("data-ismenuable", false);
}

/**
 * 모든 권한 그룹 오른쪽 클릭 이벤트 block 해제
 */
function restoreBlockedList() {
    $("#authListTbl").find("td.text_l").attr("data-ismenuable", true);
}

function removeConfirm(callback1, callback2, param1, param2) {
    $.fn.twoBtnPopup({
        title: "확인창",
        context: "삭제 하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        confirmCallback : callback1,
        cancelCallback : callback2,
        id: 'remove-alert'
    }, param1, param2);
}

function remainUserPopup(callback, param) {
    $.fn.oneBtnPopup({
        title: "확인창",
        context: "해당 권한에 속한 사용자가 있습니다. 해당 사용자를 다른 권한으로 변경 후 삭제 가능합니다.",
        confirmText: "확인",
        confirmCallback : callback,
        id: 'remainUser-alert'
    }, param)
}

function selectAuth(target) {
    const prevState = $(target).hasClass("checked");

    if($(target).hasClass("checked") && $(target).data("status") === "update") { //수정중인 권한 포커스 유지
        return;
    }

    if($("#authListTbl").find("td.text_l[data-status=update]").length > 0 && $(target).attr("data-status") !== "update") { //수정중에 다른 권한 선택 불가
        uiAlert("수정중인 권한이 있습니다.<br>수정을 완료해주세요.");
        return;
    }

    $("#authListTbl").find("td.text_l").removeClass("checked");

    if(!prevState) {
        $(target).addClass("checked");
        let authData = $(target).parent().data("authData");
        if(authData !== undefined) {
            mapAuthData(authData);
            if(!$(target).data("isedit"))
                $("#authSave").addClass("inactive").css("pointer-events", "none");
            else
                $("#authSave").removeClass("inactive").css("pointer-events", "auto");
        }

        $("#authDefaultPage_off").addClass("display_none");
        $("#authDefaultPage_on").removeClass("display_none");
    } else {
        clearAuthData();
        $("#authDefaultPage_off").removeClass("display_none");
        $("#authDefaultPage_on").addClass("display_none");
    }

}
