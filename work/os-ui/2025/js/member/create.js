const createURL = "/member/create";
const listMenuId = "64ebfdf11f634946e2336070";

$(document).ready(function() {
    initCombo();
    initEvents();
})

function refreshList() {
    let eventData = {
        type : "triggerFunction",
        params : {
            menuId : listMenuId,
            functionName : "movePage",
            functionParams : [1],
        }
    }
    window.parent.postMessage(eventData, "*");
}

function initEvents() {
    var dropDownMenuEvent = new DropDownMenuEvent({
        selector : "div.setting_line_oj",
        menus : {
            "save" : {
                menuName : "저장",
                callback : validate,
                args : []
            },
            "cancle" : {
                menuName : "취소",
                callback : doCancle,
                args : []
            }
        }
    });

    $("input[data-name=mbrMobile]").validateOnInput("phone");
    $("input[data-name=mbrName]").validateOnInput("non-special");
    $("input[data-name=mbrEmplNum]").validateOnInput("number-alphabet");
    $("input[data-name=mbrId]").validateOnInput("number-alphabet");
    $("input[data-name=mbrExtension]").validateOnInput("number-alphabet");
    $("input[data-name=mbrEmail]").validateOnInput("no-korean");
}

function initCombo() {
    const url = "/rest/api/member/combo-items";
    $.ajax({
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            generateComboItems(ajaxData.data);

            let queryParams = getQueryParameters();
            handleType(queryParams);
        },
        error : function(error) {
            console.log(error);
        }
    })
}

function generateComboItems(comboDatas) {
    let authCombos = comboDatas.authComboList;
    let mbrGrpCombos = comboDatas.mbrGrpComboList;
    let mbrTypeComboMap = comboDatas.mbrTypeComboMap;

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

    for(const key in mbrTypeComboMap) {
        $("select[data-id=mbrTypeCombo]").append(
            `<option value="${key}">${mbrTypeComboMap[key]}</option>`
        )
    }
}

function handleType(queryParam) {
    let type = queryParam.type;
    $("input[data-id=type]").val(type);
    if(type === "create") {
        $("td[data-name=regDate]").text(today());
    } else if(type === "update") {
        let id = queryParam.id;
        let parentTd = $("input[data-name=mbrId]").parent("td");
        $("input[data-name=mbrId]").remove();
        parentTd.attr("data-name", "mbrId");
        parentTd.addClass("text_l");
        loadMember(id);

        $("input[data-id=id]").val(id);
    }
}

function loadMember(id) {
    const url = "/rest/api/member/" + id;
    $.ajax({
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            setMemberInfo(ajaxData.data);
        },
        error : function(error) {
            console.log(error);
        }
    })
}

function setMemberInfo(data) {
    $("input[data-name=mbrName]").val(data.mbrName);
    $("input[data-name=mbrEmplNum]").val(data.mbrEmplNum);
    $("td[data-name=mbrId]").text(data.mbrID);
    $("td[data-name=regDate]").text(data.regDate);
    $("input[data-name=mbrMobile]").val(data.mbrMobile);
    $("input[data-name=mbrExtension]").val(data.mbrExtension);
    $("input[data-name=mbrEmail]").val(data.mbrEmail);
    $("select[data-id=authCombo]").val(data.authId);
    $("select[data-id=mbrGrpCombo]").val(data.grpId);
    $("select[data-id=mbrTypeCombo]").val(data.mbrType);
}

function validateParam(paramName, paramValue) {
    return new Promise((resolve, reject) => {
        !isEmptyString(paramValue) ? resolve() : reject({ type : "normal", value : paramName });
    });
}

function validate() {
    let params = {
        mbrName : $("input[data-name=mbrName]").val(), //필수
        mbrEmplNum : $("input[data-name=mbrEmplNum]").val(),
        mbrId : $("td[data-name=mbrId]").justtext() || $("input[data-name=mbrId]").val(), //필수
        mbrEmail : $("input[data-name=mbrEmail]").val(), //필수
        mbrMobile : $("input[data-name=mbrMobile]").val(), //필수
        mbrExtension : $("input[data-name=mbrExtension]").val(),
        authId : $("select[data-id=authCombo]").val(), //필수
        grpId : $("select[data-id=mbrGrpCombo]").val(),
        mbrType : $("select[data-id=mbrTypeCombo]").val()
    }

    if("update" === $("input[data-id=type]").val())
        params.id = $("input[data-id=id]").val();

    let validationPromises = [];

    let notEssential = ["mbrEmplNum", "mbrExtension", "grpId"];
    for (let paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            if(!notEssential.includes(paramName))
                validationPromises.push(validateParam(paramName, params[paramName]));
        }
    }

    validationPromises.push(new Promise((resolve, reject) => {
        return params.mbrEmail.validate("email") ? resolve() : reject({type : "wrongFormat", value :"이메일" });
    }));

    validationPromises.push(new Promise((resolve, reject) => {
        return params.mbrMobile.validate("phone") ? resolve() : reject({ type : "wrongFormat", value : "휴대전화" });
    }))

    Promise.all(validationPromises)
        .then(() => {
            save(params);
        })
        .catch((param) => {
            if("normal" === param.type) {
                let mappedName = "";
                switch(param.value) {
                    case "mbrName" :
                        mappedName = "이름";
                        break;
                    case "mbrId" :
                        mappedName = "계정";
                        break;
                    case "mbrEmail" :
                        mappedName = "이메일";
                        break;
                    case "mbrMobile" :
                        mappedName = "휴대전화";
                        break;
                    case "authId" :
                        mappedName = "권한";
                        break;
                    case "mbrType" :
                        mappedName = "사용자 구분";
                        break;    
                }
                uiAlert(mappedName + " 은(는) 필수 값 입니다.");
            } else if("wrongFormat" === param.type) {
                uiAlert(param.value + " 형식이 올바르지 않습니다.");
            }

        });
}

function save(params) {
    const url = "/rest/api/member/save";
    $.ajax({
        url : url,
        type : "POST",
        data : params,
        dataType : "json",
        success : function(ajaxData) {
            uiAlert(ajaxData.data, refreshList);
        },
        error : function(error) {
            uiAlert("시스템에 문제가 발생 하였습니다.")
        }
    })
}

function doCancle() {
    //close this iframe
    $(parent.document).find("div[name=iframeWindow]").has("iframe[src^='"+createURL+"']").find("button[data-action=close]").click();
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