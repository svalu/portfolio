let countdownSeconds = 180;
let countdownInterval = null;

$(document).ready(function() {
    initEvents();
    getValidationRule();
    //getTwoFactorAuth();
    localStorage.removeItem("cnslStatus");
})

/*function getTwoFactorAuth() {
    const url = "/rest/api/login/useTwoFactorAuth";
    $.ajax({
        url : url,
        data : "",
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            twoFactor = ajaxData.data;
            console.log(twoFactor);
        },
        error : function(error) {
            console.log(error);
        }
    })
}*/

function initEvents() {
    var cUserId = getCookie("cUserId");
    if(cUserId.length > 0){
        $("#userId").val(cUserId);
        $("#saveUserIdCheck").attr("checked", true);
        $("#password").focus();
    }else{
        $("#userId").focus();
    }

    $(".login_text").on("click", function() {
        loginProc();
    })

    $("#userId").on("keyup", function(event) {
        if(event.which === 13)
            loginProc();
    })

    $("#password").on("keyup", function(event) {
        if(event.which === 13)
            loginProc();
    })

    $("#openFindPw").on("click", function() {
        openPwFindPop();
    })

    // $("#newPwInput_re").on("keyup", function(event) {
    //     if(event.which === 13)
    //         resetPwConfirm();
    // })
    //
    // $("#resetPw_confirmBtn").on("click", function() {
    //     resetPwConfirm();
    // })
}

function loginProc() {
    const url = "/rest/api/login/proc";
    $.ajax({
        url : url,
        data : {
            mbrID : $("#userId").val(),
            mbrPwd : $("#password").val()
        },
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            loginResultProc(ajaxData.data);
        },
        error : function(error) {
            console.log(error);
        }
    })
}

function loginResultProc(loginResult) {
    switch (loginResult.statusCode) {
        case 200: {
            setCookie("cUserId", $("#userId").val(), 30);
            location.href = "main";
            break;
        }
        case 300 : {
            openTextConfirmPop(loginResult.outcomeMessage);
            break;
        }
        case 423 : {
            $("#resetPwPop").removeClass("display_none");
            // $("#findPwPopDim").removeClass("display_none");
            $("#textConfirmPopup").addClass("display_none");
            break;
        }
        case 421:
            openTwoFactorAuthPop(loginResult);
            //console.log("421 :::", loginResult);
            break;
        case 400 :
        case 401 :
        case 500 :
        default : {
            openTextPop(loginResult.outcomeMessage);
        }
    }
}

function setCookie(cName, cValue, cDay){
    var expire = new Date();
    expire.setDate(expire.getDate() + cDay);
    cookies = ("acs_cnsl_" + cName) + "=" + encodeURIComponent(cValue) + "; path=/ ";

    if(typeof cDay != "undefined"){
        cookies += ";expires=" + expire.toGMTString() + ";";
    }

    document.cookie = cookies;
}

// 쿠키 가져오기
function getCookie(cName){
    cName = ("acs_cnsl_" + cName) + "=";

    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = "";

    if(start != -1){
        start += cName.length;
        var end = cookieData.indexOf(";", start);
        if(end == -1)end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }

    return encodeURIComponent(cValue);
}


function sendEmailForTempPw() {
    var params = {
        mbrID	: $("#findPw_id").val().trim(),
        mbrName	: $("#findPw_name").val().trim(),
        mbrEmail   : $("#findPw_email").val().trim()
    };

    if($('#findPw_id').val() === '') {
        openTextPop("ID가 입력되지 않았습니다.");
        return;
    }
    if($('#findPw_name').val() === ''){
        openTextPop("이름이 입력되지 않습니다.");
        return;
    }
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}')
    let findPw_email = $('#findPw_email').val();
    if(findPw_email === '' || !regex.test(findPw_email)){
        openTextPop("E-mail이 입력되지 않았거나, 형식이 일치하지 않습니다.");
        return;
    }

    $.ajax({
        url : "/rest/api/login/find-pwd/exist",
        data : params,
        type : "POST",
        dataType : "json",
        success : function(ajaxData){
            if(ajaxData.data) {
                $("#mailSendAnim").removeClass("display_none");

                $.ajax({
                    url: "/rest/api/login/find-pwd/send",
                    data: params,
                    type : "POST",
                    dataType : "json",
                    success: function (ajaxData) {
                        $("#mailSendAnim").addClass("display_none");
                        if (ajaxData.data) {
                            openTextPop("임시 비밀번호를 이메일로 발송했습니다.<br>" +
                                "해당 임시 비밀번호는 1시간 동안만 사용이 가능합니다.", function() {
                                // $("#findPwPopDim").addClass("display_none");
                                $("#findPwUserInfoPop").addClass("display_none");
                            });

                            $("#findPw_id").val("");
                            $("#findPw_name").val("");
                            $("#findPw_email").val("");

                            $(document).off("keyup");
                        } else {
                            openMailTextPop("이메일 발송에 실패했습니다.");
                        }
                    }
                });
            }else{
                openMailTextPop("가입정보와 입력하신 정보가 일치하지 않습니다.<br>입력하신 정보를 다시한번 확인해 주세요.");
            }
        }
    });
}

function openTextConfirmPop(message, onCloseFn) {
    $("#textConfirmPopupContents").empty();
    $("#textConfirmPopupContents").append(message);
    $("#textConfirmPopup").removeClass("display_none");
    // $("#findPwPopDim").removeClass("display_none");

    $("#textConfirmPopupOk").off("click").on("click", function() {
        closeTextConfirmPop(true);
        onCloseFn && onCloseFn();
    })
}

function closeTextConfirmPop(isConfirmed) {
    if(isConfirmed) {
        const url = "/rest/api/login/proc/force";
        $.ajax({
            url : url,
            data : {
                mbrID : $("#userId").val(),
                mbrPwd : $("#password").val()
            },
            type : "POST",
            dataType : "json",
            success : function(ajaxData) {
                if(ajaxData.data)
                    location.href = "main";
                else
                    openTextPop("로그인 정보가 일치하지 않습니다.");
            },
            error : function(error) {
                console.log(error);
            }
        })
    }
    else {
        $("#textConfirmPopupContents").empty();
        $("#textConfirmPopup").addClass("display_none");
        // $("#findPwPopDim").addClass("display_none");
    }
}

function openTwoFactorAuthPop(rst, onCloseFn) {
    $("#twoFactorAuthContents").html(rst.outcomeMessage);
    $("#twoFactorAuthSendType").html(`${rst.sendType} 인증`);
    $("#twoFactorAuthPop").removeClass("display_none");

    sendEvent(); //인증코드 발송 버튼 이벤트

    //닫기
    $("#twoFactorSendEmailCancleBtn").off("click").on("click", function() {
        $("#twoFactorAuthPop").addClass("display_none");
    })
}

//인증코드 발송 버튼 이벤트
function sendEvent() {
    $("#twoFactorSendEmailBtn").off("click").on("click", function() {
        sendAuthCode();
    });

}

function sendAuthenticationNum() {
    const contents = `· 인증 번호를 ${twoFactorSendType === "EMAIL" ? "이메일" : "문자"}로 보내드렸습니다.<br>· 인증 번호를 입력해 주세요<span id="countdown" class="login_span_time">( 03:00 )</span>`;
    $("#twoFactorAuthContents").html(contents);
    $("#authenticationNum").removeClass("display_none").removeClass("readonly");
    $("#twoFactorAuthPopupMessage").removeClass("active");
    $("#twoFactorSendEmailBtn").text("확인");
    authenticationEvent();
    startTwoFactorAuthCountdown();
    onCertificationNumInput();
}

function onCertificationNumInput() {
    const input = $("#authenticationNum");
    input.removeClass("display_none");
    input.removeClass("readonly");
    input.prop("readonly", false);
    input.val("");
}

function authenticationEvent() {
    $("#twoFactorSendEmailBtn").off("click").on("click", function() {

        const authCode = $("#authenticationNum").val();
        if(authCode === "") {
            setTwoFactorAuthMessage("인증 번호를 입력하지 않았습니다.");
            return;
        }

        const params = {
            authCode : authCode,
            mbrID	: $("#userId").val(),
            mbrPwd		: $("#password").val()
        };

        $.ajax({
            url : "/rest/api/login/proc/checkAuthCode",
            data : params,
            type : "POST",
            dataType : "json",
            success : function(ajaxData) {
                console.log(ajaxData);
                if(ajaxData.data.result == "success") {
                    closeTextConfirmPop(true);
                    //loginProc();
                } else {
                    setTwoFactorAuthMessage(ajaxData.data.msg);
                }

            },
            error : function(error) {
                console.log(error);
            }
        })

    });
}

function startTwoFactorAuthCountdown() {
    countdownInterval = setInterval(() => {
        let minutes = Math.floor(countdownSeconds / 60);
        let seconds = countdownSeconds % 60;
        let formattedTime = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        let countdownSpan = $("#countdown");
        countdownSpan.text(`( ${formattedTime} )`);

        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            countdownSpan.text("( 00:00 )");
            countdownSeconds = 180;
            setTwoFactorAuthMessage("인증 번호 유효시간이 초과 되었습니다. 인증 번호 재발급 후 이용해 주세요.");
            $("#twoFactorSendEmailBtn").text("재발송");
            sendEvent();
            offCertificationNumInput();
        }

        countdownSeconds--;
    }, 1000);
}


function setTwoFactorAuthMessage(message) {
    const messageDiv = $("#twoFactorAuthPopupMessage");
    messageDiv.addClass("active");
    messageDiv.html(message);
}

function offCertificationNumInput() {
    const input = $("#authenticationNum");
    input.addClass("readonly");
    input.prop("readonly", true);
}

let isAuthCodeSending = false;

function sendAuthCode() {

    if(isAuthCodeSending) {
        return;
    } else {
        isAuthCodeSending = true;
    }

    let param = {
        mbrID : $("#userId").val()
    };
    $.ajax({
        url : "/rest/api/login/sendAuthCode",
        type : "POST",
        data : param,
        dataType : "json",
        success : function(ajaxData){
            isAuthCodeSending = false;
            //console.log(ajaxData);
            if(ajaxData.data.result == "success") {
                sendAuthenticationNum();
            } else {
                $("#twoFactorAuthPop").addClass("display_none");
                openTextPop("메일 발송 중 에러가 발생했습니다.");
            }
        },
        error : function(error) {
            console.log(error);
            isAuthCodeSending = false;
            $("#twoFactorAuthPop").addClass("display_none");
            openTextPop("메일 발송 중 에러가 발생했습니다.");
        }
    });
}

function openTextPop(message, onCloseFn) {
    $("#textPopupContents").empty();
    $("#textPopupContents").append(message);
    $("#textPopup").removeClass("display_none");
    // $("#findPwPopDim").removeClass("display_none");

    $("#findPwAlertCloseBtn").focus();
    $("#findPwAlertCloseBtn").off("click").on("click", function() {
        closeTextPop();
        onCloseFn && onCloseFn();
    })
}

function openPwFindPop() {
    // $("#findPwPopDim").removeClass("display_none");
    $("#findPwUserInfoPop").removeClass("display_none");

    $("#sendEmailBtn").off("click").on("click", function() {
        sendEmailForTempPw();
    })

    $('#findPw_email').off("keyup").on("keyup", function(event) {
        if(event.keyCode == 13){
            sendEmailForTempPw();
        }
    });

    $("#sendEmailCancleBtn").off("click").on("click", function() {
        // $("#findPwPopDim").addClass("display_none");
        $("#findPwUserInfoPop").addClass("display_none");
    })
}
function closeTextPop() {
    $("#textPopupContents").empty();
    // $("#findPwUserInfoPop").addClass("display_none");
    $("#textPopup").addClass("display_none");
    // $("#findPwPopDim").addClass("display_none");
}

function openMailTextPop(message) {
    $("#textPopupContents").empty();
    $("#textPopupContents").append(message);
    $("#textPopup").removeClass("display_none");
    $("#findPwAlertCloseBtn").removeClass("display_none");

    $("#findPwAlertCloseBtn").focus();
    $("#findPwAlertCloseBtn").off("click").on("click", function() {
        closeMailTextPop();
    })
}

function closeMailTextPop() {
    $("#textPopupContents").empty();
    $("#textPopup").addClass("display_none");
}

function switchPwInputType(eyeDiv) {
    var pwInput = $(eyeDiv).siblings("input");
    var type = pwInput.attr("type");
    if(type == "password") {
        pwInput.attr("type", "text");
        $(eyeDiv).addClass("active");
    } else {
        pwInput.attr("type", "password");
        $(eyeDiv).removeClass("active");
    }
}


function getValidationRule() {
    $.ajax({
        url : "rest/api/login/pwd/rule",
        type : "POST",
        dataType : "json",
        success : function(ajaxData){
            $("#pwRuleContext").val(ajaxData.data.replace(/"/gi, ''));
        },
        error : function(error) {
            console.log(error);
        }
    });
}

function validatePw() {
    var params = {
        "newPwd" : $("#newPwInput").val(),
        "tmpryPwd" : $("#password").val(),
        "mbrID" : $("#userId").val()
    }

    if($("#newPwInput").val() !== $("#newPwInput_re").val()){
        openTextPop("입력하신 비밀번호가 서로 다릅니다. <br>확인 후 다시 시도해주세요.");
        return;
    }

    $.ajax({
        url : "rest/api/login/change/pwd",
        data : params,
        type : "POST",
        dataType : "json",
        success : function(ajaxData){
            if(ajaxData.data.result){
                closeResetPwPop();
                openTextPop("비밀번호 변경이 완료 되었습니다.<br>다시 로그인해 주세요.");
                $('#password').val('');
            } else {
                $("#pwWarningMsgWrap").empty();
                $("#pwWarningMsgWrap").append(generatePwWarningMsgs(ajaxData.data.msg));
            }
        },
        error : function(error) {
            console.log(error);
        }
    });
}

function generatePwWarningMsgs(msgs) {
    var result = "";
    $.each(msgs, function (i, item) {
        result += '<div class="pass_popup_text_3 active">';
        result += item;
        result += '</div>';
    })

    return result;
}

function closeResetPwPop() {
    // $("#findPwPopDim").addClass("display_none");
    $("#resetPwPop").addClass("display_none");
    $("#pwWarningMsgWrap").empty();
    $("#newPwInput").val("");
    $("#newPwInput_re").val("");
}