/**
 * 어디에 둘지 모호한 공통 유틸 함수/가능들을 모아놓는 파일입니다.
 * 추후에 비슷한 기능이 모이면 하나의 js 로 분리할 예정.
 */

/**
 * 1단계 밑에 있는 텍스트만 반환하는 함수
 * ex) <td>
 *          text
 *          <div>foo1</div>
 *          <div>foo2</div>
 *     </td>
 *     $(td).text() -> text foo1 foo2
 *     $(td).justtext() -> text
 */
$.fn.justtext = function() {
    return $(this).clone()
        .children()
        .remove()
        .end()
        .text();

};

$(document).ready(function() {
    $("input[type=date]").attr("max", getTodayForInput())
})

function generateQueryString(params) {
    var queryString = "";
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            if (queryString !== "") {
                queryString += "&";
            }
            queryString += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
        }
    }
    return queryString;
}

function getQueryParameters() {
    var queryString = window.location.search.substring(1);
    var queryParams = queryString.split("&");
    var paramsObj = {};

    for (var i = 0; i < queryParams.length; i++) {
        var pair = queryParams[i].split("=");
        var name = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        paramsObj[name] = value;
    }

    return paramsObj;
}

function isEmptyString(str) {
    return str === undefined || str === null || str.trim() === '';
}

// 맨 마지막 글자에 받침이 있는지 찾아서 있다면 true, 없다면 false 를 반환
function isEndWithConsonant(korStr) {
    const finalChrCode = korStr.charCodeAt(korStr.length - 1)
    // 0 = 받침 없음, 그 외 = 받침 있음
    const finalConsonantCode = (finalChrCode - 44032) % 28
    return finalConsonantCode !== 0
};

// 을/를 덧붙히기
String.prototype.appendEulReul = function() {
    return this + (isEndWithConsonant(this) ? "을" : "를")
};

String.prototype.appendEunNeun = function() {
    return this + (isEndWithConsonant(this) ? "은" : "는")
};

//html 태그 제거
function getStripTag(txt) {
	var rst = txt.replace(/<[^>]*>?/g, '');
	return rst;
}

function getMbrType() {
    let result = "";
    $.ajax({
        url : "/rest/api/member/getMbrType",
        type : "POST",
        dataType : "json",
        async : false,
        success : function(ajaxData) {
            result = ajaxData.data;
        },
        error : function(error) {
            console.log(error);
        },
        beforeSend : function(xhr) {
        }
    })

    return result;
}

function checkSessionAlive() {
    $.ajax({
        url : "/rest/api/login/session/validation",
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            if(!ajaxData.data) {
                if ( self !== top )
                    window.parent.location.href = "/login";
                else
                    window.location.href = "/login";
            }
        },
        error : function(error) {
            console.log(error);
        },
        beforeSend : function(xhr) {

        }
    })
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        checkSessionAlive();
    }
})

function getTodayForInput() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function generateTextMemo(targetObj) {
     if($(targetObj)[0].offsetWidth < $(targetObj)[0].scrollWidth) {
        const postProcContent = $(targetObj).html();
         /*var firstPartText = $(targetObj).contents().filter(function() {
             return this.nodeType === 3; // 텍스트 노드만 필터링
         }).text().trim(); // 텍스트를 가져오고 양쪽 공백 제거*/
        let $footnote = $(`<div class="table_footnote"></div>`);
        let $footnoteArea = $(`<textarea class="table_meno_wrap textarea_style" readonly></textarea>`).text(postProcContent);

         $(targetObj).on("mouseover", function (event) {
            $footnoteArea.addClass("active");
            $footnoteArea.css("left", ($(targetObj).offset().left + ($(targetObj).width() / 2)) + "px")
            adjustFootnoteArea($footnoteArea, event);
        })
         $(targetObj).on("mouseleave", function () {
            $footnoteArea.removeClass("active");
        });
        $(targetObj).append($footnote);
        $(targetObj).append($footnoteArea);
    }
}

function adjustFootnoteArea(target, event) {
    const iframe = $("div.iframe_body").get(0);
    const textarea = target.get(0);
    const iframeRect = iframe.getBoundingClientRect();
    const textareaBottom = textarea.offsetTop + textarea.clientHeight;
    const textareaRight = textarea.offsetLeft + textarea.clientWidth;

    if (textareaBottom > iframeRect.bottom) {
        const newTop = textarea.offsetTop - (textareaBottom - iframeRect.bottom+5);
        textarea.style.top = newTop + 'px';
    }

    if(textareaRight > iframeRect.right) {
        const newLeft = textarea.offsetLeft - (textareaRight - iframeRect.right+5);
        textarea.style.left = newLeft + 'px';
    }
}

async function loadScript(scripts) {
    for (let key in scripts) {
        let scriptArr = Array.from(document.querySelectorAll("script[src]"))
            .map(script => script.getAttribute("src"));

        //중복제외
        if (scriptArr.includes(scripts[key])) continue;

        let script = document.createElement('script');
        script.src = scripts[key];
        script.type = "text/javascript";
        await document.head.append(script);
        script.onerror = function () {
            console.error("fail : " + this.src);
        }
    }
}

function validationSearchDate(startDate, endDate) {
    let result = {
        "success" : true,
        "msg" : ""
    };

    if(startDate && endDate) {
        if(startDate > endDate) {
            result.success = false;
            result.msg = "조회 시작일이 종료일 보다 큽니다";
        }
    }

    return result;
}