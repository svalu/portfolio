
const notepadUrl = "/rest/api/notepad"
let preAreaText = ""

$(document).ready(function () {
    initEvents();
});

function initEvents() {

    initLtClickEvents();
    getNotepadList();
    saveNotepad();
}

/**
 *  메모장 제목 클릭 시 내용 보기
 */

function showNotepadContent(targetId) {

    let firstCondition = $(this).find('input[id="notepadInput"]');
    let secondCondition = $("#notepadList").find('input[id="notepadInput"]');

    if (firstCondition.length === 0 && secondCondition.length > 0) {
        uiAlert("입력 중 입니다.");
        return;
    }

    let id;
    if(!targetId)
        id = this.getAttribute('data-id');
    else {
        id = targetId;

    }
    $("#notepadList td").removeClass("checked");
    $("#notepadList").find(`td[data-id=${id}]`).addClass("checked");

    if(id !== $("#notepadArea").data("id")) {
        $.ajax({
            url: notepadUrl + "/" + id + '/content', // 요청할 URL
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                // 요청이 성공했을 때 실행될 함수
                $('#notepadArea').val(data.data.notepadContent).data("id", id);
                preAreaText = data.data.notepadContent;

            },
            error: function (error) {
                // 요청이 실패했을 때 실행될 함수
                console.error("An error occurred:", error);
            }
        });
    }


}

function saveNotepad() {

    $('#saveNotepad').click(function () {

        let checkInput = $("#notepadList").find('input[id="notepadInput"]');

        if (checkInput.length === 0) {
            uiAlert("작성 중이 아닙니다.");
            return;
        }

        if(checkInput.val().trim().length === 0) {
            uiAlert("제목을 입력해 주세요.");
            return;
        }

        if($("#notepadArea").val().trim().length === 0) {
            uiAlert("내용을 입력해 주세요.");
            return;
        }

        uiConfirm("저장 하시겠습니까??",saveNotepadFn);


        function saveNotepadFn() {

            let notepadContent = $('#notepadArea').val();
            let notReadonlyElement = document.querySelector('td[name="notepadTitle"] input[id="notepadInput"]');
            let id = $(notReadonlyElement).parent().data('id');
            let notepadTitle = notReadonlyElement.value;

            const params = {
                notepadTitle: notepadTitle,
                notepadContent: notepadContent
            }

            if (id !== "")
                params.id = id;

            $.ajax({
                url: notepadUrl,
                type: 'POST',
                data: JSON.stringify(params),
                dataType: 'json',
                contentType : "application/json",
                success: function (data) {
                    // 요청이 성공했을 때 실행될 함수
                    getNotepadList();
                    $('#notepadArea').val('').data("id", "");

                },
                error: function (error) {
                    // 요청이 실패했을 때 실행될 함수
                    console.error("An error occurred:", error);
                }
            });
        }
    });

}

// 마우스 좌클릭 이벤트 생성 (드롭다운)
function initLtClickEvents() {

    var dropDownMenuEvent = new DropDownMenuEvent({
        selector: "div[name=menu]",
        menuContextHandler: dropDownMenuHandler,
        menus: {
            "create": {
                menuName: "신규",
                callback: createNotepad,
                args: []
            },
            "cancle": {
                menuName: "신규 취소",
                callback: cancle,
                args: []
            }
        }
    });
}

// 마우스 우클릭 이벤트 생성
function initRtClickEvents() {

    var notepadRtClickEvent = new RtMouseClickEvent({
        selector: "td[name=notepadTitle][data-ismenuable=true]",
        menuContextHandler: rtClickEventMenuHandler,
        menus: {
            "update": {
                menuName: "수정",
                callback: updateNotepad,
                args: ["id"]
            },
            "remove": {
                menuName: "삭제",
                callback: removeNote,
                args: ["id"]
            },
            "cancle": {
                menuName: "취소",
                callback: cancleUpdate,
                args: ["id"]
            }
        }
    });

}


function createNotepad() {

    $("#notepadList td").removeClass("checked");
    let checkInputTag = $("#notepadList").find('input[id="notepadInput"]');

    if (checkInputTag.length > 0) {
        uiAlert("입력 중 입니다.");
        return;
    }

    $('#notepadArea').val('').attr("readonly", false);

    blockAllNotepadList();


    let html = '';
    html += '<tr class="">';
    html += '<td name="notepadTitle" data-isNew="true" data-ismenuable="true" data-status="update">';
    html += '<input id="notepadInput" class="input_correction" type="text" maxlength="50">';
    html += '</td>';
    html += '</tr>';

    let tbody = document.querySelector('#notepadList tbody');
    tbody.insertAdjacentHTML('beforeend', html);

    initRtClickEvents();

    // 추가된 input 요소에 포커스 주기
    let lastInput = document.querySelector('#notepadList tbody tr:last-child td[name=notepadTitle] input');
    if (lastInput) {
        lastInput.focus();
    }

}

function cancle(event, target) {
    $("#notepadList").find('td[name="notepadTitle"]').attr("data-ismenuable", false);

    if (target === undefined) {

        $("#notepadList tr:last-child").remove();
        $("#notepadList").find('td[name="notepadTitle"]').attr("data-ismenuable", true);
    } else
        $("#notepadList").find(`td[data-id=${target}]`).parent().remove();

    getNotepadList();

}

function getNotepadList(target) {

    $("#notepadArea").attr("readonly", true);

    $('#notepadList tr').not(':first').remove();

    $.ajax({
        url: notepadUrl+'/list', // 요청할 URL
        type: 'GET',
        dataType: 'json',
        success: function (data) {

            let dataList = data.data;

            let status = "normal";

            for (var i = 0; i < dataList.length; i++) {

                let html = '';
                html += '<tr class="">';
                html += `<td class="text_l cursor_po" name="notepadTitle" data-status="${status}" data-isNew="false" data-ismenuable="true" 
                                     data-id="${dataList[i].id}" onclick="showNotepadContent.call(this)">`;
                html += dataList[i].notepadTitle
                html += '</td>';
                html += '</tr>';

                $("#notepadList tbody").append(html);
            }

            initRtClickEvents();

            target ? $('#notepadArea').val(preAreaText) : $('#notepadArea').val('');
        },
        error: function (error) {
            // 요청이 실패했을 때 실행될 함수
            console.error("An error occurred:", error);
        }
    });


}

function cancleUpdate(event, target) {

    getNotepadList(target);
}

function removeNote(event, target) {

    if (!target || target === "") return;

    uiConfirm("삭제 하시겠습니까?",removeNotepadFn);

    let id = target;

    function removeNotepadFn() {
        $.ajax({
            url: notepadUrl +"/"+ id,
            type: 'DELETE',
            dataType: 'json',
            success: function (data) {
                getNotepadList();
            },
            error: function (error) {
                console.error("An error occurred:", error);
            }
        });
    }

}

function returnFn() {
    return;
}

function updateNotepad(event, target) {

    showNotepadContent(target);

    if (!target || target === "") return;

    $("#notepadList td").removeClass("checked");
    $("#notepadArea").attr("readonly", false);

    blockAllNotepadList();

    let selectTd = $("#notepadList").find(`td[data-id=${target}]`);
    selectTd.data("status", "update");
    selectTd.attr("data-ismenuable", true);

    let html = `<input id="notepadInput" class="input_correction" type="text" value="${selectTd.justtext()}" maxlength="50">`;
    selectTd.empty();
    selectTd.append($(html));

}


/**
 *      우클릭 메뉴 항목 생성
 * */
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
                return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정" || $.trim($(this).justtext()) === "삭제");
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
                return ($.trim($(this).justtext()) === "삭제" || $.trim($(this).justtext()) === "수정");
            });
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
    let isNew = $("#notepadList").find("td[data-isnew=true]").length > 0;

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
        targetMenu.off("click").on("click", cancle);
    } else {
        let targetMenu = $("#dropDownMenu").find("span").filter(function () {
            return $.trim($(this).justtext()) === "신규"
        });
        targetMenu.removeClass("inactive");
        targetMenu.off("click").on("click", createNotepad);

        targetMenu = $("#dropDownMenu").find("span").filter(function () {
            return $.trim($(this).justtext()) === "신규 취소"
        });
        targetMenu.addClass("inactive");
        targetMenu.off("click");
    }
}

function blockAllNotepadList() {
    $("#notepadList").find('td[name="notepadTitle"]').attr("data-ismenuable", false);

}

