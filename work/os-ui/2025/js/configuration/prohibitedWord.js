/**
 *      약어 목록
 *
 *      prhb  =  prohibit       // 금하다, 금지하다
 *
 * */
let pageSize = 50;
let pageNum = 1;
let blockSize = 5;

const prohibitUrl = "/rest/api/prohibited-word";

$(document).ready(function () {
    initEvents();
});

function initEvents() {

    $("#savePrhbWord").on("click", function () {
        pageNum = 1;
        savePrhbWord();
    });

    $("#searchPrhbWord").on("click", function () {
        pageNum = 1;
        getPrhbWordList();
    });

    $("#saveText").on("keyup", function (event) {
        if (event.keyCode === 13) {
            savePrhbWord();
        }
    });

    $("#searchText").on("keyup", function (event) {
        if (event.keyCode === 13) {
            getPrhbWordList();
        }
    });

    getPrhbWordList();
}


function getPrhbWordList() {

    let searchText = $('#searchText').val();
    let params = {
        "pageSize": pageSize,
        "pageNum": pageNum,
        searchText: searchText
    };

    $("#prhbWordList").empty();

    $.ajax({
        url: prohibitUrl + '/prhbWordList',
        type: 'POST',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: "application/json",
        success: function (ajaxData) {

            let prhbWordData = ajaxData.data.prhbWordList;

            $.each(prhbWordData, function (index, element) {
                generatePrhbWordItem(undefined, element);
            })

            creagePaging(pageNum, ajaxData.data.totalCnt, blockSize, pageSize);

        },
        error: function (error) {
            console.error("An error occurred:", error);
        }
    });

}

//페이징 생성
function creagePaging(page, totalCnt, size, limit) {

    if (!page) page = 1;
    var opts = {
        'total_record': totalCnt
        , 'current_page': page
        , 'block_size': size
        , 'items_per_page': limit
        , 'link_to': 'movePage(__id__)'
        //,	'curCss' : 'active'
    }
    $(".pageing_wrap").paging(opts);
}

//페이지 이동
function movePage(page) {
    pageNum = page;

    getPrhbWordList();
}


function generatePrhbWordItem(event, data) {

    let html = "";
    html += `<div class="bad_word_oj_wrap">`;
    html += `    <div class="bad_word_oj">` + data.prhbWordItem + `    </div>`;
    html += `   <div data-id="${data.id}" onclick="removePrhb.call(this)" class="bad_word_icon esc"></div>`;
    html += `</div>`;

    let $html = $(html);
    $("#prhbWordList").append($html);
}

function removePrhb() {

    let id = this.getAttribute('data-id');

    uiConfirm("삭제 하시겠습니까?", function (eventTarget, isConfirmed) {
        if (isConfirmed) {
            $.ajax({
                url: prohibitUrl + '/' + id + '/remove',
                dataType: "json",
                type: "DELETE",
                success: function (ajaxData) {
                    // uiAlert(ajaxData.data, () => {
                    getPrhbWordList()
                    // });
                },
                error: function (error) {
                    console.log(error);
                }
            })
        }

    })

}

function savePrhbWord() {

    let prohibitWordItem = $('#saveText').val();

    if (prohibitWordItem.trim() === "") {
        uiAlert("금지어 내용이 없습니다.");
        return;
    }
    savePrhbWordFn();
    // uiConfirm("저장 하시겠습니까?", savePrhbWordFn);

}

function savePrhbWordFn() {

    let prohibitWordItem = $('#saveText').val().trim();

    let params = {
        prohibitWordItem: prohibitWordItem
    }

    $.ajax({
        url: prohibitUrl + '/save',
        type: 'POST',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: "application/json",
        success: function (ajaxData) {
            $('#searchText').val('');
            setTimeout(function () {
                if (ajaxData.data !== "")
                    uiAlert(ajaxData.data, getPrhbWordList);
                else
                    getPrhbWordList();
            }, 500);

            $('#saveText').val('');
        },
        error: function (error) {
            uiAlert("저장 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });

}
