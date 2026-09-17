$(document).ready(function () {
    initEvents();
    loadAccountInfo();
})

function initEvents() {
    var dropDownMenuEvent = new DropDownMenuEvent({
        selector: "div.setting_line_oj",
        menuContextHandler: dropDownMenuHandler,
        menus: {
            "update": {
                menuName: "수정",
                callback: activateUpdate,
                args: []
            },
            "save": {
                menuName: "저장",
                callback: doSave,
                args: []
            },
            "cancel": {
                menuName: "취소",
                callback: doCancel,
                args: []
            }
        }
    })
}

function dropDownMenuHandler(target) {
    if($("td[fieldType=editable]").find("input").length > 0) {
        let targetMenu = $("#dropDownMenu").find(`span`).filter(function () { return ($.trim($(this).justtext()) === "수정"); });
        targetMenu.addClass("inactive");
        targetMenu.removeClass("active");
        targetMenu.off("click");

        targetMenu = $("#dropDownMenu").find(`span`).filter(function () {
            return ($.trim($(this).justtext()) === "취소") || ($.trim($(this).justtext()) === "저장");
        });
        targetMenu.addClass("active");
        targetMenu.removeClass("inactive");

        //if targetMenu is "취소" bind doCancel, if "저장" bind doSave
        targetMenu.off("click").on("click", function() {
            if($.trim($(this).justtext()) === "취소") {
                doCancel();
            } else {
                doSave();
            }
        })


        // targetMenu.off("click").on("click", doCancel);
        return;
    }

    if($("td[fieldType=editable]").find("input").length === 0) {
        let targetMenu = $("#dropDownMenu").find(`span`).filter(function () { return ($.trim($(this).justtext()) === "수정"); });
        targetMenu.addClass("active");
        targetMenu.removeClass("inactive");
        targetMenu.off("click").on("click", activateUpdate);

        targetMenu = $("#dropDownMenu").find(`span`).filter(function () {
            return ($.trim($(this).justtext()) === "취소") || ($.trim($(this).justtext()) === "저장");
        });
        targetMenu.addClass("inactive");
        targetMenu.removeClass("active");
        targetMenu.off("click");
        return;
    }
}

function doSave() {
    let data = {};
    $("td[fieldType=editable]").each(function() {
        let key = $(this).attr("name");
        let value = $(this).find("input").length > 0 ? $(this).find("input").val() : $(this).text();
        data[key] = value;
    });

    let emptyFieldCnt = 0;
    $("td[fieldType=editable][type=essential]").each(function() {
        if($(this).text() === "" && $(this).find("input").val() === "") {
            emptyFieldCnt++;
        }
    });

    if(emptyFieldCnt > 0) {
        uiAlert("필수 입력 항목을 입력해주세요.");
        return;
    }

    if(!data.mbrEmail.validate("email")) {
        uiAlert("이메일 형식이 올바르지 않습니다.");
        return;
    }
    if(!data.mbrMobile.validate("phone")) {
        uiAlert("휴대폰 번호 형식이 올바르지 않습니다.");
        return;
    }
    data["existingPw"] = "";
    data["newPw"] = "";
    if($("input[name=newPw]").val() != "" ||  $("input[name=newPwConfirm]").val() != "") {

        const existingPw = $.trim($("input[name=existingPw]").val());
        const newPw = $.trim($("input[name=newPw]").val());
        const newPwConfirm = $.trim($("input[name=newPwConfirm]").val());
        if(existingPw == "") {
            uiAlert("기존 비밀번호를 입력해 주세요.");
            return;
        }

        if(newPw !== newPwConfirm) {
            uiAlert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        data["existingPw"] = existingPw;
        data["newPw"] = newPw;
    }
    updateProc(data);
    //return;
    /*
    if($("input[name=existingPw]").val() !== "") {
        if($("input[name=newPw]").val() !== $("input[name=newPwConfirm]").val()) {
            uiAlert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        let params = {
            existingPw: $("input[name=existingPw]").val(),
            newPw: $("input[name=newPw]").val(),
        }

        const url = "/rest/api/account-info/update-pw";
        $.ajax({
            url: url,
            type: "POST",
            dataType : "json",
            data: params,
            success: function (ajaxData) {
                if(!ajaxData.data.result) {
                    uiAlert(ajaxData.data.msg);
                } else {
                    updateProc(data);
                }

            },
            error: function (error) {
                console.log(error);
            }
        });
    } else {
        updateProc(data);
    }
    */
}

function updateProc(data) {
    const url = "/rest/api/account-info/update";
    $.ajax({
        url: url,
        type: "POST",
        dataType : "json",
        data: data,
        success: function (ajaxData) {
            uiAlert(ajaxData.data, function() {
                if(ajaxData.data == "저장되었습니다.") {
                    location.reload();
                }
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function activateUpdate() {
    $("td[fieldType=editable]").each(function() {
        let text = $(this).text();
        $(this).text("");
        let $input = $(`<input type="text" class="input_correction" value="${text}"/>`);
        if($(this).attr("name") === "mbrMobile")
            $input.validateOnInput("phone");
        else if($(this).attr("name") === "mbrEmail")
            $input.validateOnInput("no-korean");
        $(this).append($input);

    });
    generatePwChangeUIs();
}

function generatePwChangeUIs() {
    let $existingPw = $(`<tr name="pwChange"></tr>`);
    $existingPw.append(`<td class="td_title_1">기존 비밀번호</td>`);
    let $existingPwWrapper = $(`<td></<td>`);
    $existingPwWrapper.append(`<input type="password" class="input_correction add_pass" name="existingPw"/>`);
    $existingPwWrapper.append(`<div class="pass_popup_input_eye add_pass"></div>`);
    $existingPwWrapper.find("div.pass_popup_input_eye").on("click", function() {
        $(this).toggleClass("active");
        let $input = $(this).siblings("input");
        $input.attr("type", $input.attr("type") === "password" ? "text" : "password");
    })
    $existingPw.append($existingPwWrapper);

    let $newPw = $(`<tr name="pwChange"></tr>`);
    $newPw.append(`<td class="td_title_1">새 비밀번호</td>`);
    let $newPwWrapper = $(`<td></<td>`);
    $newPwWrapper.append(`<input type="password" class="input_correction add_pass" name="newPw"/>`);
    $newPwWrapper.append(`<div class="pass_popup_input_eye add_pass"></div>`)
    $newPwWrapper.find("div.pass_popup_input_eye").on("click", function() {
        $(this).toggleClass("active");
        let $input = $(this).siblings("input");
        $input.attr("type", $input.attr("type") === "password" ? "text" : "password");
    })
    $newPw.append($newPwWrapper);

    let $newPwConfirm = $(`<tr name="pwChange"></tr>`);
    $newPwConfirm.append(`<td class="td_title_1">새 비밀번호 확인</td>`);
    let $newPwConfirmWrapper = $(`<td></<td>`);
    $newPwConfirmWrapper.append(`<input type="password" class="input_correction add_pass" name="newPwConfirm"/>`);
    $newPwConfirmWrapper.append(`<div class="pass_popup_input_eye add_pass"></div>`);
    $newPwConfirmWrapper.find("div.pass_popup_input_eye").on("click", function() {
        $(this).toggleClass("active");
        let $input = $(this).siblings("input");
        $input.attr("type", $input.attr("type") === "password" ? "text" : "password");
    })
    $newPwConfirm.append($newPwConfirmWrapper);

    $("#userAccTbl").append($existingPw);
    $("#userAccTbl").append($newPw);
    $("#userAccTbl").append($newPwConfirm);

}

function removePwChangeUIs() {
    $("tr[name=pwChange]").remove();
}

function doCancel() {
    $("td[fieldType=editable]").each(function() {
        //let text = $(this).find("input").val();
        let text = $(this).data("initData");
        $(this).text(text);
        $(this).find("input").remove();
        removePwChangeUIs();
    });
}


function loadAccountInfo() {
    const url = "/rest/api/account-info/data";
    $.ajax({
        url: url,
        type: "POST",
        dataType : "json",
        success: function (ajaxData) {
            setAccountInfo(ajaxData.data);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function setAccountInfo(data) {
    $("td[name=mbrName]").text(data.mbrName).data("initData", data.mbrName);
    $("td[name=mbrEmplNum]").text(data.mbrEmplNum).data("initData", data.mbrEmplNum);
    $("td[name=mbrID]").text(data.mbrID).data("initData", data.mbrID);
    $("td[name=regDate]").text(formatDate(data.regDate)).data("initData", formatDate(data.regDate));
    $("td[name=mbrEmail]").text(data.mbrEmail).data("initData", data.mbrEmail);
    $("td[name=mbrMobile]").text(data.mbrMobile).data("initData", data.mbrMobile);
    $("td[name=mbrExtension]").text(data.mbrExtension).data("initData", data.mbrExtension);
    $("td[name=authName]").text(data.authName).data("initData", data.authName);
    $("td[name=grpName]").text(data.grpName).data("initData", data.grpName);
    $("td[name=mbrType]").text(MBR_TYPE[data.mbrType]).data("initData", MBR_TYPE[data.mbrType]);

}

function formatDate(date) {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
}