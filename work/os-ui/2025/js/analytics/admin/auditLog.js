let pageSize = 10;
let pageNum = 1;
let blockSize = 5;
let jsonData = "";

let searchObj = {};
let sortObj = {};
let isLoading = false;

const viewURL = "/analytics/admin/rsnChck";
const mappingPath = "/rest/api/analytics/admin/auditLog";

/*
const auditLogCategMap = {
	"loginLogout":"로그인/로그아웃", 
	"convoHist":"상담(대화)이력",
	"mngMbr":"사용자 관리",
	"mngAuth":"권한 관리"
};

const auditLogCodeMap = {
	"loginLogout" : {
		"login": "로그인", 
		"logout": "로그아웃",
	},
	"convoHist" : {
		"view_convo": "조회", 
		"download": "다운로드",
	}, 
	"mngMbr" : {
		"init_pwd": "비밀번호 초기화", 
		"view_mbrData": "상세 정보 조회",
		"del_mbrData": "삭제",
		"reg_mbrData": "신규 등록",
		"mod_mbrData": "정보 수정"
	},
	"mngAuth" : {
		"mod_authData": "수정", 
		"reg_authData": "신규등록",
		"del_authData": "삭제"
	}	
};

function convLogCodeToStr(categ, code) {
	var rst = code ? auditLogCodeMap[categ][code] : auditLogCategMap[categ];
	if(!rst) rst = "-";
	return rst;
}
*/

$(document).on("click", function (event) {
    if ($(event.target)[0] !== $(`div[name=dupNameWrap]`)[0] && !$.contains($(`div[name=dupNameWrap]`)[0], $(event.target)[0])) {
        $(`div[name=dupNameWrap]`).addClass("display_none");
    }
})

$(document).ready(function () {
    sortObj = {
        "sortField": "regDate",
        "sortType": -1
    };

    initEvents();
    getList();
})

function initEvents() {
    // $("#endDate").attr("max", getTodayForInput());

    var dropDownMenuEvent = new DropDownMenuEvent({
        selector: "div.setting_line_oj",
        menus: {
            "download": {
                menuName: "다운로드",
                callback: download,
                args: ["id"]
            }
        }
    });

    setDatesByFlag(2, 'init')

    $("#periodSelector").change(function () {
        setDatesByFlag(parseInt($(this).val()));
    })

    $("#searchBtn").on("click", function () {
        $("div[name=dupNameWrap]").addClass("display_none");
        $.when(checkDupName()).then(function (ajaxData) {

            if (ajaxData.data.length > 1) {
                showDupNameWrap(ajaxData);
            } else {
                searchObj["mbrOid"] = null;
                search();
            }
        }).fail(function (error) {
            console.log(error);
        });
    });

    $("#auditLogTgtName").on("keyup", function (key) {
        if (key.keyCode == 13) {
            $("div[name=dupNameWrap]").addClass("display_none");
            $.when(checkDupName()).then(function (ajaxData) {

                if (ajaxData.data.length > 1) {
                    showDupNameWrap(ajaxData);
                } else {
                    searchObj["mbrOid"] = null;
                    search();
                }
            }).fail(function (error) {
                console.log(error);
            });
            // search();
        }
    });

    $("#initBtn").on("click", function () {
        $("#searchDiv input").val("");
        setDatesByFlag(2);
    });

    var callback = function (params) {
        sortObj = params;
        getList();
    };

    var sortingOpt = {
        "fields": ["", "regDate", "auditLogIp", "regName", "regId", "auditLogCateg", "auditLogCode", "auditLogTgtName", ""],
        "sortField": "regDate",
        "sortType": -1,
        "callback": callback
    };

    $("#logTable tr[class=table_title_line]").commonSorting(sortingOpt);
}

function showDupNameWrap(ajaxData) {
    $("div[name=dupNameWrap]").removeClass("display_none");
    $("div[name=inputDupName]").text(`이름 : ${$("#auditLogTgtName").val()}`);

    $("#dupNameTbl tr").not(".table_title_line").remove();
    Object.keys(ajaxData.data).forEach(function (key) {
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

        $tr.on("click", function () {
            pageNum = 1;
            var startDate = $("#startDate").val();
            var endDate = $("#endDate").val();

            if (startDate && endDate) {
                if (startDate > endDate) {
                    uiAlert("조회 시작일이 종료일보다 큽니다");
                    return;
                }
            }
            searchObj["auditLogTgtName"] = null;
            searchObj["mbrOid"] = $(this).attr("id");
            getList();
            $("div[name=dupNameWrap]").addClass("display_none");
        });
    });

}

function checkDupName() {
    const url = "/rest/api/member/check-dup-name";
    const params = {
        "mbrName": $("#auditLogTgtName").val()
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

//감사 로그 리스트
function getList() {
    if (isLoading) {
        return;
    } else {
        isLoading = true;
    }

    $("#logTable tr").not(".table_title_line").remove();


    var param = {
        "pageSize": pageSize,
        "pageNum": pageNum

    };

    $.extend(true, param, searchObj, sortObj);

    $.ajax({
        url: mappingPath + '/list',
        type: 'POST',
        data: param,
        dataType: 'json',
        success: function (rstData) {
            isLoading = false;
            jsonData = rstData.data.result;
            var totalCnt = rstData.data.totalCnt;
            var html = "";
            var dataLength = jsonData.length;

            if (dataLength == 0) {
                $("#totalCnt").html(0);
                html = `<tr>
							<td colspan="9">데이터가 없습니다.</td>
						</tr>`;
            } else {
                //$("#totalCnt").html(totalCnt);
                var start = totalCnt - ((pageNum - 1) * pageSize);

                for (var i = 0; i < 10; i++) {
                    var obj = jsonData[i];

                    if (obj) {
                        html += `<tr>
		                            <td>${start - i}</td>
		                            <td>${new Date(obj.regDate).format(DATETIME_FORMAT)}</td>
		                            <td>${obj.auditLogIp}</td>
		                            <td>${obj.regName}</td>
		                            <td>${obj.regId}</td>
		                            <td>${obj.auditLogCategStr}</td>
		                            <td>${obj.auditLogCodeStr}</td>
		                            <td>${obj.auditLogTgtName}</td>
		                            <td>` + (obj.auditLogRsn ? `<button class="table_icon file" data-id="${obj.id}"></button>` : "") + `</td>
		                        </tr>`;
                    } else {
                        html += `<tr>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>`;
                    }
                }
            }
            $("#logTable").append(html);

            $("#logTable tr").not(".table_title_line").find("td button").on("click", function (event) {
                logRsnView($(this).data("id"));
            });

            /*
            $("#logTable tr[id]").on("click", function(e) {
                let ord = $(e.currentTarget).index() - 1;
                noticeView(ord);
            }).css("cursor", "pointer");
            */
            creagePaging(pageNum, totalCnt, blockSize, pageSize);

        },
        error: function (error) {
            isLoading = false;
            uiAlert("서버와의 통신에 실패하였습니다.");
            console.error("An error occurred:", error);
        }
    });
}

//사유
function logRsnView(id) {
    let eventData = {
        type: "openNewWindow",
        params: {
            url: viewURL,
            menuId: "auditLogRsn",
            menuName: "감사로그 관리 - 사유",
            sendParams: {
                id: id
            }
        }
    }
    window.parent.postMessage(eventData, "*");
}


function download() {
    let params = {
        sysName: "AUDIT LOG",
        title: "감사로그 목록",
        fileName: "감사 로그 목록(" + new Date().format("yyyy-mm-dd") + ")"

    }
    //downloadFile("/rest/api/member/download/list", params);
    $.extend(true, params, searchObj, sortObj);
    downloadFile(mappingPath + "/download", params);
}

function search() {
    pageNum = 1;
    var startDate = $("#startDate").val();
    var endDate = $("#endDate").val();

    if (startDate && endDate) {
        if (startDate > endDate) {
            uiAlert("조회 시작일이 종료일보다 큽니다");
            return;
        }
    }

    $("#searchDiv input").each(function (idx, obj) {
        var key = $(obj).attr("id");
        searchObj[key] = $(obj).val();
    });
    getList();
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

    //검색 설정
    /*for (const key in searchObj) {
        $("#"+key).val(searchObj[key]);
    }*/

    getList();
}


function setDatesByFlag(flag, type) {

    $("#periodSelector").val(flag)

    var today = new Date();

    var startDate = new Date();
    var endDate = new Date();

    try {
        var dateObj = getDateRange(flag, today);
        startDate = dateObj["start"].format("yyyy-mm-dd");
        endDate = dateObj["end"].format("yyyy-mm-dd");
    } catch (e) {

    }

    const formattedStartDate = startDate;
    const formattedEndDate = endDate;

    $("#startDate").val(formattedStartDate);
    $("#endDate").val(formattedEndDate);

    if(type === "init"){
        $("#searchDiv input").each(function (idx, obj) {
            var key = $(obj).attr("id");
            searchObj[key] = $(obj).val();
        });
    }
}
