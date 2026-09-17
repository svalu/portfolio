const isWrite = location.pathname.indexOf("admin") > -1;
/*const listMenuId = "64ebfdf11f634946e2336079";*/
let postProcOid;
$(document).ready(function() {
    let queryParams = getQueryParameters();
    if(queryParams.id) {
        postProcOid = queryParams.id;
        loadData(queryParams.id);
    }

    if(isWrite) {
        $("#evalSave").on("click", function() {
            evalSave();
        })
    }

});

function evalSave() {
    let params = {
        "postProcOid": postProcOid,
        "evalComment": $("#evalComment").val(),
    };

    let evalArr = [];

    $("input[name=evalPoint]").each(function(idx, obj) {
        const tmpObj = { "itemOid":$(this).attr("data"), "evalPoint":$(this).val() };
        evalArr.push(tmpObj);
    });
    params.evalPoints = evalArr;

    $.ajax({
        url : "/rest/api/analytics/admin/tot-cnsl-hist/evalSave",
        type : 'POST',
        dataType : 'json',
        contentType : "application/json",
        data : JSON.stringify(params),
        success : function(ajaxData) {
            if(ajaxData == true) {
                var callback = () => {
                    try {
                        $(window.parent.document).find("div[name=iframeWindow][id='logDetailView_"+postProcOid+"']").find("button[data-action=reload]").click();
                        const listIframe = $(window.parent.document).find("iframe[src$=totalCounselingHistory]").get(0).contentWindow;
                        if(typeof(listIframe.loadDatas) == "function") listIframe.loadDatas();
                    } catch(e) {
                        //refreshList(listMenuId);
                    }
                    closeWindow();
                };
                uiAlert("저장되었습니다.", callback);

            } else {
                uiAlert("저장에 실패했습니다.");
            }
        },
        error : function(error) {
            console.log(error);
        }
    });

}

function loadData(id) {
    const url = "/rest/api/analytics/user/cnsl-hist/cnslEvalDetail";
    const params = {
        "id" : id
    }
    $.ajax({
        url : url,
        type : 'POST',
        dataType : 'json',
        data : params,
        success : function(ajaxData) {
            //console.log(ajaxData.evalScores);
            $(ajaxData.evalScores).each(function(idx, obj) {
                let tmpObj = $.grep(ajaxData.evalScores, e => e.itemCateg == obj.itemCateg);
                if(tmpObj.length > 1) {
                    let tmpObj2 = $.grep(ajaxData.evalScores, e => e.itemCateg == obj.itemCateg && e.rowspan);
                    if(tmpObj2.length == 0) obj.rowspan = tmpObj.length;
                }
            });

            let html = "";
            //미평가 시 기본값 최고점
            const tmpEvalScore = ajaxData.evalScore ? ajaxData.evalScore : ajaxData.itemScore;
            $(ajaxData.evalScores).each(function(idx, obj) {
                //미평가 시 기본값 최고점
                const tmpEvalPoint = obj.evalPoint ? obj.evalPoint : obj.itemPoint;

                html += `<tr>
                            `+function() {
                                if(obj.rowspan) {
                                    return `<td rowspan="2" class="td_title_1">${obj.itemCateg}</td>`;
                                }
                            }()+`
                            <td class="text_l">${obj.itemName} (${obj.itemPoint})</td>
                            <td class="width_20px">
                                <input class="input_style num text_c" min="0" max="${obj.itemPoint}" data="${obj.itemOid}" name="evalPoint" type="number" placeholder="" value="${tmpEvalPoint}">
                            </td>
                        </tr>`;
            });
            html += `<tr>
                    <td rowspan="2" class="td_title_1">총점</td>
                    <td colspan="2" class=""><span id="scoreSum">${tmpEvalScore}</span> / ${ajaxData.itemScore}</td>
                </tr>`;

            $("tbody").append(html);

            if(isWrite) {

                $("#evalComment").val(ajaxData.evalComment);

                $("#evalComment, #evalSave").removeClass("display_none");
                $("input[name=evalPoint]").on("keyup", function() {
                    let evalPoint = $(this).val() ?? 0;

                    addPoint(this, evalPoint);
                })
                $("input[name=evalPoint]").bind('wheel', function(event){
                    let evalPoint = $(this).val() ?? 0;
                    //const max = $(this).attr("max");

                    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                        evalPoint++;
                    } else {
                        evalPoint--;
                    }
                    addPoint(this, evalPoint);
                });
            }
        },
        error : function(error) {
            console.log(error);
        }
    });
}

function addPoint(obj, evalPoint) {
    const max = parseInt($(obj).attr("max"));
    evalPoint = parseInt(evalPoint);
    if(isNaN(evalPoint)) evalPoint = 0;

    if(evalPoint < 0) evalPoint = 0;
    if(evalPoint > max) evalPoint = max;
    $(obj).val(evalPoint);
    scoreSum();
}

function scoreSum() {
    let score = 0;
    $("input[name=evalPoint]").each(function(idx, obj) {

        score += $(this).val() ? parseInt($(this).val()) : 0;
    });

    $("#scoreSum").html(score);

}

function closeWindow() {
    let eventData = {
        type : "closeWindow",
        params : {
            menuId : "evalDetailView_"+postProcOid
        }
    };
    window.parent.postMessage(eventData, "*");
}

/*function refreshList(menuId) {
    const listMenuId = menuId;
    let eventData = {
        type : "triggerFunction",
        params : {
            menuId : listMenuId,
            functionName : "movePage",
            functionParams : [1],
        }
    }
    window.parent.postMessage(eventData, "*");
}*/
