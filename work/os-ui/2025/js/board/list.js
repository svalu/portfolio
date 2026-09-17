let pageSize = 10;
let pageNum = 1;
let blockSize = 5;
let noticeData = "";
let searchObj = {};
let sortObj = {};
let isLoading = false;
//let mbrName = "";
const menuTitle = isAdmin ? "공지사항 관리" : "공지사항";

//createURL
//viewURL

$(document).ready(function () {

	sortObj = {
		"sortField": "regDate",
		"sortType": -1
	};

	initEvents();
	search();

})

function initEvents() {
	// $("#endDate").attr("max", getTodayForInput());

	setPeriodSelector(2);
	$("#periodSelector").change(function () {
		setDatesByFlag(parseInt($(this).val()));
	})
	if (isAdmin) {
		$(".setting_line_oj").removeClass("display_none");
		var authListRtClickEvent = new RtMouseClickEvent({
			selector: `#noticeTable tr:not(.table_title_line)`,
			menus: {
				"update": {
					menuName: "수정",
					callback: update,
					args: ["id"]
				},
				"delete": {
					menuName: "삭제",
					callback: remove,
					args: ["id"]
				},
			}
		});

		var dropDownMenuEvent = new DropDownMenuEvent({
			selector: "div.setting_line_oj",
			menus: {
				"create": {
					menuName: "신규",
					callback: create,
					args: ["id"]
				}
			}
		});
	} else {
		$(".popup_setting_line").remove();
	}

	$("#searchBtn").on("click", function () {
		search();
	});

	$("#brdNoticeTitle").on("keyup", function (key) {
		if (key.keyCode == 13) {
			search();
		}
	});

	$("#initBtn").on("click", function () {
		$("#searchDiv input").val("");
		setDatesByFlag(2); //this month

		/*
        $("#brdNoticeTitle").val("");
        $("#startDate").val("");
        $("#endDate").val("");
        */
	});

	var callback = function (params) {
		sortObj = params;
		getList();
	};

	var sortingOpt = {
		"fields": ["", "brdNoticeIsNotice", "brdNoticeTitle", "regName", "regDate", "modName", "modDate"],
		"sortField": "regDate",
		"sortType": -1,
		"callback": callback
	};

	$("#noticeTable tr[class=table_title_line]").commonSorting(sortingOpt);
}

//공지사항 리스트
function getList() {

	if (isLoading) {
		return;
	} else {
		isLoading = true;
	}

	$("#noticeTable tr").not(".table_title_line").remove();
	var param = {
		"pageSize": pageSize,
		"pageNum": pageNum,
		"isAdmin": isAdmin
	};

	$.extend(true, param, searchObj, sortObj);

	$.ajax({
		url: mappingPath + '/list',
		type: 'POST',
		data: param,
		dataType: 'json',
		success: function (rstData) {
			isLoading = false;
			noticeData = rstData.data.result;
			var totalCnt = rstData.data.totalCnt;
			var html = "";
			var dataLength = noticeData.length;
			//mbrName = rstData.data.mbrName;

			if (dataLength == 0) {
				$("#totalCnt").html(0);
				html = `<tr>
							<td colspan="7">데이터가 없습니다.</td>
						</tr>`;
			} else {
				$("#totalCnt").html(totalCnt);
				var start = totalCnt - ((pageNum - 1) * pageSize);

				for (var i = 0; i < 10; i++) {
					var obj = noticeData[i];

					if (obj) {
						html += `<tr id="${obj.id}">
			                        <td>${start - i}</td>
			                        <td class="display_none" data="isAdmin">${(obj.brdNoticeStatus) ? noticeStautsMap[obj.brdNoticeStatus] : ""}</td>
			                        <td class="table_text_over ${obj.brdNoticeIsTop ? 'color_red' : ''}">${obj.brdNoticeTitle}</td>
			                        <td>${obj.regName}</td>
			                        <td>${new Date(obj.regDate).format(DATETIME_FORMAT)}</td>
			                        <td>${obj.modName}</td>
			                        <td>${new Date(obj.modDate).format(DATETIME_FORMAT)}</td>
			                     </tr>`;
					} else {
						html += `<tr>
									<td></td>
									<td class="display_none" data="isAdmin"></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>`;
					}
				}
			}
			$("#noticeTable").append(html);

			if (isAdmin) $("#noticeTable tr td[data=isAdmin]").removeClass("display_none");

			//말줌일 적용
			$(".table_text_over").each(function (idx, obj) {
				generateTextMemo(obj);
				/*
                if($(obj)[0].clientWidth < $(obj)[0].scrollWidth) {
                    $(obj).attr("title", $(obj).html().replace(/\"/g, "&quot;"));
                }
                */
			});

			$("#noticeTable tr[id]").each(function (idx, obj) {
				$(obj).attr("data-id", idx);
			});

			$("#noticeTable tr[id]").on("click", function (e) {
				let ord = $(e.currentTarget).index() - 1;
				noticeView(ord);
			}).css("cursor", "pointer");

			creagePaging(pageNum, totalCnt, blockSize, pageSize);

		},
		error: function (error) {
			isLoading = false;
			uiAlert("서버와의 통신에 실패하였습니다.");
			console.error("An error occurred:", error);
		}
	});
}

function search() {


	const checkDateRst = validationSearchDate($("#startDate").val(), $("#endDate").val());
	if(!checkDateRst.success) {
		uiAlert(checkDateRst.msg);
		return;
	}


	$("#searchDiv input").each(function(idx, obj) {
		var key = $(obj).attr("id");
		searchObj[key] = $(obj).val();
	});
	getList();

}

//상세보기
function noticeView(ord) {
	let eventData = {
		type: "openNewWindow",
		params: {
			url: viewURL,
			menuId: `noticeView_${noticeData[ord].id}`,
			menuName: `${menuTitle} - 상세내용`,
			sendParams: {
				id: noticeData[ord].id
			}
		}
	}
	window.parent.postMessage(eventData, "*");
}

//신규
function create() {
	let eventData = {
		type: "openNewWindow",
		params: {
			url: createURL,
			menuId: "noticeCreate",
			menuName: `${menuTitle} - 신규`
		}
	}
	window.parent.postMessage(eventData, "*");
}

//수정
function update(event, target) {
	var ord = target;

	var eventData = {
		type: "openNewWindow",
		params: {
			url: createURL,
			menuId: "noticeCreate",
			menuName: `${menuTitle} - 수정`,
			sendParams: {
				id: noticeData[ord].id
			}
		}
	}
	window.parent.postMessage(eventData, "*");
}

//삭제 Confirm
function remove(event, target) {
	var confirmCallback = function () {
		removeAct(noticeData[target].id);
	}
	uiConfirm("삭제하시겠습니까?", confirmCallback);
}

//삭제
function removeAct(id) {
	/*
    var param = {
        "id" : id
    };
    */

	$.ajax({
		url: mappingPath + '/' + id,
		type: 'DELETE',
		data: "",
		dataType: 'json',
		success: function (rstData) {
			if (rstData.data == "success") {
				getList();
			} else {
				//alert("삭제 실패했습니다.");
				uiAlert("삭제 실패했습니다.");
			}
		},
		error: function (error) {
			uiAlert("서버와의 통신에 실패하였습니다.");
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

	//검색 설정
	for (const key in searchObj) {
		$("#" + key).val(searchObj[key]);
	}

	getList();
}

function setDatesByFlag(flag) {

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
}

function setPeriodSelector(initValue) {
	const $select = $('<select></select>')
		.addClass("input_style")
		.attr("id", "periodSelector");

	const options = [
		{value: "5", text: "오늘"},
		{value: "0", text: "이번주"},
		{value: "1", text: "저번주"},
		{value: "2", text: "이번달"},
		{value: "3", text: "전달"},
		{value: "4", text: "올해"}
	];

	options.forEach(option => {
		const $option = $("<option></option>")
			.attr("value", option.value)
			.text(option.text);
		$select.append($option);
	});

	$select.val(initValue);

	$("#dateControls").append($select);

	setDatesByFlag(initValue);
}


