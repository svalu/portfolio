$(document).ready(function() {
    initEvents();
    loadDatas();
})

function initEvents() {
    var authListRtClickEvent = new RtMouseClickEvent({
        selector : `tr[data-name=grpItem][data-ismenuable=true]`,
        menuContextHandler : rtClickEventMenuHandler,
        menus : {
            "update" : {
                menuName : "수정",
                callback : activateUpdate,
                args : ["id"]
            },
            "delete" : {
                menuName : "삭제",
                callback : remove,
                args : ["id"]
            },
            "cancle" : {
                menuName : "취소",
                callback : cancleUpdate,
                args : ["id"]
            },
        }
    });


    var dropDownMenuEvent = new DropDownMenuEvent({
        selector : "div.setting_line_oj",
        menuContextHandler : dropDownMenuHandler,
        menus : {
            "create" : {
                menuName : "신규",
                callback : doCreate,
                args : []
            },
            "cancle" : {
                menuName : "신규 취소",
                callback : remove,
                args : []
            }
        }
    });

    $("#authSave").on("click", function() {
        doSave();
    })
}

function rtClickEventMenuHandler(target) {
    let status = target.data("status");
    switch(status) {
        case "unGrouped": {
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
            let targetMenu = $("#itemMenu").find(`div`).filter(function() { return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정" || $.trim($(this).justtext()) === "복사");});
            targetMenu.addClass("inactive");
            targetMenu.removeClass("active");
            targetMenu.off("click");
            return;
        }
    }
}

function dropDownMenuHandler(target) {
    let isNew = $("#grpTable").find("tr[data-isnew=true]").length > 0;
    let isUpdating = $("#grpTable").find("tr[data-status=update]").length > 0;

    if(isUpdating) {
        $("#dropDownMenu").find("span").addClass("inactive");
        $("#dropDownMenu").find("span").off("click");
    }

    if(isUpdating && isNew) {
        let targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규"});
        targetMenu.addClass("inactive");
        targetMenu.off("click");

        targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규 취소"});
        targetMenu.removeClass("inactive");
        targetMenu.off("click").on("click", remove);
    } else {
        let targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규"});
        if(isUpdating === false) {
            targetMenu.removeClass("inactive");
            targetMenu.off("click").on("click", doCreate);
        }


        targetMenu = $("#dropDownMenu").find("span").filter(function() { return $.trim($(this).justtext()) === "신규 취소"});
        targetMenu.addClass("inactive");
        targetMenu.off("click");
    }


}

function doCreate() {
    let lastIndex = $("#grpTable").find("tr[data-name=grpItem]").length;
    disableAllMenuItems();
    generateGrpItem({grpIsEdit : true, id : "", grpName : "", grpMemberCnt : 0}, ++lastIndex, true);
}

function disableAllMenuItems() {
    $("#grpTable").find("tr[data-name=grpItem]").attr("data-ismenuable", false);
}

function enableAllMenuItems() {
    $("#grpTable").find("tr[data-name=grpItem]").attr("data-ismenuable", true);
}

function doSave() {
    let targetInput = $("input.input_correction").first();
    let id = $(targetInput).parents("tr").data("id");
    let grpName = targetInput.val();

    const url = "/rest/api/grp-manager/save";
    $.ajax({
        url : url,
        data : {
            id : id,
            grpName : grpName
        },
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            const result = ajaxData.data.split("||");
            uiAlert(result[0], function() {
                if(result[1] === "true")
                    location.reload();
            });
        },
        error : function(error) {

        }
    })
}

function loadDatas() {
    const url = "/rest/api/grp-manager/list";
    $.ajax( {
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            let grpMemberCnt = 0;
            Object.keys(ajaxData.data).forEach(function(key) {
                grpMemberCnt += parseInt(generateGrpItem(ajaxData.data[key], ++key, false));
            })
            $("#grpMemberCnt").empty().text(`(총 : ${grpMemberCnt}명)`);
        },
        error : function(error) {
            console.log(error);
        }
    })
}

function generateGrpItem(grp, index, flag) {
    const isNew = flag;
    let status = !flag ? "normal" : "update";
    let checked = "";
    if(grp.grpIsEdit === false) {
        status = "unGrouped"
        checked = "checked_hold";
    }

    let html = "";
    html += `<tr class="${checked}" data-name="grpItem" data-ismenuable=${!flag} data-status=${status} data-isnew=${isNew} data-isEdit=${grp.grpIsEdit} data-id=${grp.id}>`;
    html += `   <td>${index}</td>`;

    if(flag) {
        html += `    <td data-name="grpName">`;
        html += `       <input class="input_correction" type="text" value="${grp.grpName}" maxlength="50">`;
        html += `    </td>`;
    }
    else
        html += `<td data-name="grpName">${grp.grpName}</td>`;

    html += `   <td>${grp.grpMemberCnt}</td>`;
    html += `</tr>`;

    $("#grpTable").append($(html));
    if(flag)
        $("#authSave").removeClass("display_none");
    return grp.grpMemberCnt;
}

function remove(event, target) {
    if(target === undefined) {
        $("#grpTable tr:last-child").remove();
        $("#grpTable").find(`tr[data-name=grpItem]`).attr("data-ismenuable", true);
        $("#authSave").addClass("display_none");
    } else {
        uiConfirm("삭제 시 해당 그룹에 속한 인원은 미배정으로 이동 됩니다. \n" +
            "삭제 하시겠습니까?\n",
            function(eventTarget, isConfirm) {
                if(isConfirm) {
                    const url = "/rest/api/grp-manager/remove/" + target
                    $.ajax({
                        url : url,
                        type : "POST",
                        dataType : "json",
                        contentType : "application/json",
                        success : function(ajaxData) {
                            uiAlert(ajaxData.data, () => {location.reload();});
                        },
                        error : function(error) {
                            console.log(error);
                        }
                    })
                    $("#grpTable").find(`tr[data-id=${target}]`).remove();
                }
        })
    }

}

function activateUpdate(event, target) {
    if(!target || target === "") return;

    var tr = $("#grpTable").find(`tr[data-id=${target}]`);
    var td = tr.find(`td[data-name=grpName]`);
    blockAllGrpList();
    var html = `<input class="input_correction" type="text" value="${td.justtext()}" maxlength="50">`;
    td.empty();
    td.append($(html));
    tr.data("status", "update");
    tr.attr("data-status", "update");
    tr.attr("data-ismenuable", true);

    $("#authSave").removeClass("display_none");
}

function cancleUpdate(event, target) {
    if(!target || target === "") return;

    var tr = $("#grpTable").find(`tr[data-id=${target}]`);
    var td = tr.find(`td[data-name=grpName]`);
    var authName = td.find("input").val();
    td.empty().text(authName);
    tr.data("status", "normal");
    tr.attr("data-status", "normal");
    restoreBlockedList();

    $("#authSave").addClass("display_none");
}


function blockAllGrpList() {
    $("#grpTable").find("tr[data-name=grpItem]").attr("data-ismenuable", false);
}

function restoreBlockedList() {
    $("#grpTable").find("tr[data-name=grpItem]").attr("data-ismenuable", true);
}