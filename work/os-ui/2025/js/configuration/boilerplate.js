/**
 *      약어 목록
 *
 *      blrplt  =  boilerplate     // 상용구
 *
 *
 * */

const blrpltUrl = '/rest/api/boilerplate'
let preAreaText = "";

$(document).ready(function () {
    initEvents();
});

function initEvents() {

    initClickEvents();
    getBlrpltList();

}


// 마우스 클릭 이벤트 생성
function initClickEvents() {

    /**
     * 드롭다운 메뉴 이벤트 정의
     * @type {DropDownMenuEvent}
     */
    var dropDownMenuEvent = new DropDownMenuEvent({
        selector: "div.setting_line_oj",
        menuContextHandler: dropDownMenuHandler,
        menus: {
            "create": {
                menuName: "신규",
                callback: generateBlrpltItem,
                args: []
            },
            "cancle": {
                menuName: "신규 취소",
                callback: remove,
                args: []
            }
        }
    });


    /**
     * 마우스 오른족 클릭 이벤트 정의
     * @type {RtMouseClickEvent}
     */
    var blrpltRtClickEvent = new RtMouseClickEvent({
        selector: `td.text_l[data-ismenuable=true]`,
        menuContextHandler: rtClickEventMenuHandler,
        menus: {
            "update": {
                menuName: "수정",
                callback: updateBlrplt,
                args: ["id"]
            },
            "delete": {
                menuName: "삭제",
                callback: removeBlrplt,
                args: ["id"]
            },
            "cancle": {
                menuName: "취소",
                callback: cancelUpdate,
                args: ["id"]
            },
        }
    });

    /**
     * 저장버튼 클릭 이벤트
     */
    $("#saveBlrplt").on("click", saveBlrplt);

}

function remove(event, target) {
    $('#blrpltArea').val('')
    if (target === undefined) {
        $("#blrpltList tr:last-child").remove();
        $("#blrpltList").find(`td.text_l`).attr("data-ismenuable", true);
    } else
        $("#blrpltList").find(`td[data-id=${target}]`).parent().remove();

    getBlrpltList();
}


function cancelUpdate(event, target) {

    target ? $('#blrpltArea').val(preAreaText) : $('#blrpltArea').val('');
    getBlrpltList();
}

/**
 * 모든 상용구 오른쪽 클릭 이벤트 block
 */
function blockAllBlrpltList() {
    $("#blrpltList").find("td.text_l").attr("data-ismenuable", false);
}

function generateBlrpltItem(event, data) {

    $("#blrpltList td").removeClass("checked");

    let checkInput = $("#blrpltList").find('input[id="blrpltInput"]');

    if (!(checkInput.length === 0)) {
        uiAlert("입력 중 입니다.");
        return;
    }

    const isNew = data !== undefined ? "false" : "true";
    const id = data !== undefined ? data.id : "";
    let status = data !== undefined ? "normal" : "update";


    const blrpltTitle = data !== undefined ? data.blrpltTitle : "";


    let html = "";
    html += `<tr>`;
    html += `   <td name="blrpltTitle" class="text_l cursor_po" data-type="" 
                 data-ismenuable="true" data-status="${status}" data-isNew="${isNew}" data-id="${id}" `;

    // id가 없다면 onclick 이벤트를 주지않는다.
    if (id === "")
        html += `  >`;
    else
        html += `  onclick="showBlrpltContent.call(this)">`;

    if (blrpltTitle === "")
        html += `<input id="blrpltInput" class="input_correction" type="text" value="" maxlength="50">`;
    else
        html += `${blrpltTitle}`;

    html += `</td>`;
    html += `</tr>`;
    let $html = $(html);
    if (isNew === "true"){
        $("#blrpltList").find(`td.text_l`).attr("data-ismenuable", false);
        $('#blrpltArea').val('').attr("readonly", false);
    }

    $("#blrpltList").append($html);
}

/**
 * 모든 상용구 오른쪽 클릭 이벤트 block 해제
 */
// function restoreBlockedList() {
//     $("#blrpltList").find("td.text_l").attr("data-ismenuable", true);
// }

function saveBlrplt() {

    let checkInput = $("#blrpltList").find('input[id="blrpltInput"]');

    if (checkInput.length === 0) {
        uiAlert("저장할 내용이 없습니다.");
        return;
    }

    uiConfirm("저장하시겠습니까?",saveBlrpltFn);

    function saveBlrpltFn() {

        let selectedTd = $("#blrpltList").find('td[name="blrpltTitle"] input[id="blrpltInput"]').parent();

        let id = selectedTd.data("id");

        let blrpltTitle = selectedTd.justtext() === "" ? selectedTd.find("input").val() : selectedTd.justtext();
        let blrpltContent = $('#blrpltArea').val();

        if (blrpltTitle.trim() === "") {
            uiAlert("상용구 제목이 없습니다.");
            return;
        }

        if (blrpltContent.trim() === "") {
            uiAlert("상용구 내용이 없습니다.");
            return;
        }

        let params = {
            blrpltTitle: blrpltTitle,
            blrpltContent: blrpltContent
        }
        if (id !== "")
            params.id = id;

        $.ajax({
            url: blrpltUrl,
            type: 'POST',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType : "application/json",
            success: function (ajaxData) {

                //uiAlert("저장되었습니다.", getBlrpltList);
                getBlrpltList();
                $('#blrpltArea').val('');

            },
            error: function (error) {
                console.error("An error occurred:", error);
            }
        });
    }
}

function updateBlrplt(event, target) {

    showBlrpltContent(target);

    if (!target || target === "") return;

    $("#blrpltList td").removeClass("checked");
    $("#blrpltArea").attr("readonly", false);

    blockAllBlrpltList();

    let td = $("#blrpltList").find(`td[data-id=${target}]`);


    let html = `<input id="blrpltInput" class="input_correction" type="text" value="${td.justtext()}" maxlength="50">`;
    td.empty();
    td.append($(html));
    td.data("status", "update");
    td.attr("data-ismenuable", true);


}


function removeBlrplt(event, target) {

    if (!target || target === "") return;

    uiConfirm("삭제 하시겠습니까?",removeBlrpltFn);

    function removeBlrpltFn() {

        let id = target;

        $.ajax({
            url: blrpltUrl + "/" + id, // 요청할 URL
            type: 'DELETE',
            dataType: 'json',
            success: function (data) {
                $('#blrpltArea').val('');
                getBlrpltList();
            },
            error: function (error) {
                uiAlert("삭제 실패하였습니다.");
                console.error("An error occurred:", error);
            }
        });
    }


}


function getBlrpltList() {

    $("#blrpltArea").attr("readonly", true);

    $('#blrpltList tr').not(':first').remove();

    $.ajax({
        url: blrpltUrl + '/list', // 요청할 URL
        type: 'GET',
        data: {},
        dataType: 'json',
        success: function (ajaxData) {

            let data = ajaxData.data;

            $.each(data, function (index, element) {
                generateBlrpltItem(undefined, element);
            })

        },
        error: function (error) {
            console.error("An error occurred:", error);
        }
    });


}


/**
 * 드롭다운 메뉴 제어
 * @param target
 */
function dropDownMenuHandler(target) {
    let isNew = $("#blrpltList").find("td[data-isnew=true]").length > 0;

    if (isNew) {
        let targetMenu = $("#dropDownMenu").find("span").filter(function () {
            return $.trim($(this).justtext()) === "신규"
        });
        targetMenu.addClass("inactive");
        targetMenu.off("click");

        targetMenu = $("#dropDownMenu").find("span").filter(function () {
            return $.trim($(this).justtext()) === "신규 취소"
        });
        targetMenu.removeClass("inactive");
        targetMenu.off("click").on("click", remove);
    } else {
        let targetMenu = $("#dropDownMenu").find("span").filter(function () {
            return $.trim($(this).justtext()) === "신규"
        });
        targetMenu.removeClass("inactive");
        targetMenu.off("click").on("click", generateBlrpltItem);

        targetMenu = $("#dropDownMenu").find("span").filter(function () {
            return $.trim($(this).justtext()) === "신규 취소"
        });
        targetMenu.addClass("inactive");
        targetMenu.off("click");
    }
}


/**
 * 오른쪽 마우스 버튼 클릭시 노출되는 메뉴 제어
 * @param target : 선택된 메뉴권한
 */
function rtClickEventMenuHandler(target) {
    let status = target.data("status");
    switch (status) {
        case "sysMgr": {
            let targetMenu = $("#itemMenu").find(`div`).filter(function () {
                return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정" || $.trim($(this).justtext()) === "취소");
            });
            targetMenu.addClass("inactive");
            targetMenu.removeClass("active");
            targetMenu.off("click");
            return;
        }
        case "normal" : {
            let targetMenu = $("#itemMenu").find(`div`).filter(function () {
                return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정" || $.trim($(this).justtext()) === "복사");
            });
            targetMenu.addClass("active");
            targetMenu.removeClass("inactive");

            targetMenu = $("#itemMenu").find(`div`).filter(function () {
                return ($.trim($(this).justtext()) === "취소");
            });
            targetMenu.addClass("inactive");
            targetMenu.removeClass("active");
            targetMenu.off("click");
            return;
        }
        case "update" : {

            let targetMenu = $("#itemMenu").find(`div`).filter(function () {
                return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정" || $.trim($(this).justtext()) === "복사");
            });
            targetMenu.addClass("inactive");
            targetMenu.removeClass("active");
            targetMenu.off("click");
            return;
        }
    }
}

/**
 *  상용구 명 클릭 시 내용 보기
 */
function showBlrpltContent(target) {

    let firstCondition = $(this).find('input[id="blrpltInput"]');
    let secondCondition = $("#blrpltList").find('input[id="blrpltInput"]');

    if (firstCondition.length === 0 && secondCondition.length > 0) {
        uiAlert("입력 중 입니다.");
        return;
    }

    if ($("#blrpltArea").prop("readonly") === false)
        return;


    let id;

    if(!target)
        id = this.getAttribute('data-id');
    else {
        id = target;

    }


    $("#blrpltList td").removeClass("checked");
    $("#blrpltList").find(`td[data-id=${id}]`).addClass("checked");


    $.ajax({
        url: blrpltUrl + "/" + id + '/content',
        type: 'GET',
        dataType: 'json',
        success: function (ajaxData) {
            let data = ajaxData.data;
            $('#blrpltArea').val(data.blrpltContent);
            preAreaText = data.blrpltContent;
        },
        error: function (error) {
            // 요청이 실패했을 때 실행될 함수
            console.error("An error occurred:", error);
        }
    });

}
