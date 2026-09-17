let windowList = [];
let menuMap = new Map();
let eventSource = null;
const sseConnectUrl = "/rest/api/sse/connect";
let sseTargeMap = new Map();

$(document).on("contextmenu", function(event) {
    event.preventDefault();
})

$(document).ready(function() {
    /*
    setTimeout(function() {
        try {
            customerStomp.sub("mainFrame", (data) => {
                console.log(customerStomp._sessionId);
                updateSocketSession(customerStomp._sessionId);


            }, {"id":"mainFrame"});
        } catch(e) {
        }

    }, 2000);
    */
    //cnslStatus 초기값 세팅
    if(!localStorage.getItem("cnslStatus")) {
        localStorage.setItem("cnslStatus","onln");
    }
    //localStorage.setItem("cnslStatus", cnslStatus);

    initClock(true);
    loadMenuList();
    controlMenuWrapper();
    eventKeyBind();
    initSSE();
})

function initSSE() {
    if(window.EventSource != null) {
        eventSource = new ServerSentEvent(sseConnectUrl);

        eventSource.onopen = function() {
            //console.log("open");
        }

        eventSource.onerror = function(error) {
        }

        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const dataCode = data.code;

            if(dataCode && sseTargeMap.size > 0) {
                let targetFrame = sseTargeMap.has(data.code) && sseTargeMap.get(data.code)();
                
                //실행창 열려 있으면 데이터 전송
                if(targetFrame && targetFrame.length > 0) {
                    targetFrame[0].contentWindow.postMessage(event.data, "*");
                } else {
                    targetFrame && sseTargeMap.delete(data.code);
                    notifyAssign(data);
                }
            } else {
                notifyAssign(data);
            }
        }
        eventSource.onclose = function() {
        }

        eventSource.connect();
    }
}

function notifyAssign(data) {
    //배정알림
    /*if(data.code == SSE_DATA_CODE.CNSL_CHAT) {
        //console.log(data);
        if(data?.data?.customer) {
            const isAssign = $.grep(data.data.customer, e=>e.cnslrStatusCode == "assign");
            if(isAssign.length > 0) {
                //배정되었습니다.
            }
        }
    }*/
}

function getSseTargetObj(code) {
    return sseTargeMap.get(code);
}

function eventKeyBind() {
    //단축키 등록
    iframeWindow.bindShortcutKey(document);
}

$(document).on("maximize", function(event, menuId) {
    $("#" + menuId).trigger("click");
});

$(document).on('click', function(event) {
    if (!$(event.target).closest('#topMenuWrapper').length && !$(event.target).closest('.main_menu_bu').length) {
        $('.cube').removeClass('active');
        $('.main_menu_wrap').removeClass('active');
    } else {
        $('.cube').addClass('active');
        $('.main_menu_wrap').addClass('active');
    }
});

window.addEventListener("message", function(event) {
    checkSessionAlive();
    let eventData = event.data;

    switch (eventData.type) {
        case "openNewWindow": {
			let targetMenuId = eventData.params.menuId;
			if($("#" + targetMenuId).length > 0) { //아이프레임이 떠 있으면
				if($(`#taskbar button[name='${targetMenuId}']`).hasClass("inactive")) { //비활성화 되어 있으면 활성화
					$(`#taskbar button[name='${targetMenuId}']`).click();
				}
                //최상단으로
                $(document).trigger("maximize", [targetMenuId]);
				return;	
			}
            let $iframeWindow = assignDragFunction(eventData.params);
            $("body").append($iframeWindow);

            windowList.push($iframeWindow);
            break;
        }
        case "triggerFunction" : {
            let targetMenuId = eventData.params.menuId;
            let targetFunction = eventData.params.functionName;
            let targetParams = eventData.params.functionParams;
            let targetIframe = $(`#${targetMenuId}`).find("iframe")[0].contentWindow;
            targetIframe[targetFunction](targetParams);
            break;
        }
        case "closeWindow" : {
            let targetMenuId = eventData.params.menuId;
            let targetWindow = $(`#${targetMenuId}`);
            targetWindow.find("button.esc").trigger("click");
            break;
        }
        case "blinkTaskbar" : {
            let targetMenuId = eventData.params.menuId;
            if($("#taskbar").find(`button[name='${targetMenuId}']`).hasClass("inactive"))
                $("#taskbar").find(`button[name='${targetMenuId}']`).addClass("blinker");
            break;
        }
        case "stopBlinkTaskbar" : {
            let targetMenuId = eventData.params.menuId;
            $("#taskbar").find(`button[name='${targetMenuId}']`).removeClass("blinker");
            break;
        }
        case "receiveSseDataRegister" : {
            sseTargeMap.get(event.data.dataCode) || sseTargeMap.set(event.data.dataCode, () => $("iframe[src^='"+event.data.src+"']"));
        }
        default : {
            break;
        }
    }
})

function logout() {
    const url = "/rest/api/main/logout"
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        success : function(ajaxData) {
            location.href = "/";
        },
        error : function(error) {
            console.log(error);
        }
    });
}

function openLogoutPopup() {
    $("#logoutPopup").removeClass("display_none");
    $("#logoutBu_confirm").focus();
    $("#logoutBu_confirm").on("keyup", function(event) {
       if(event.keyCode == 27) {
            $("#logoutBu_cancle").trigger("click");
        }
    })

    $("#logoutBu_confirm").on("click", function() {
        $("#logoutPopup").addClass("display_none");
        logout();
    })

    $("#logoutBu_cancle").on("click", function() {
        closeLogoutPopup();
    })
}

function closeLogoutPopup() {
    $("#logoutPopup").addClass("display_none");
}

function bindMenuClickEvent() {
    $("div[name=menuIcon]").on("click", function(e) {
        e.stopPropagation();
        checkSessionAlive();
        var params = {
            url : $(this).attr("url"),
            menuId : $(this).attr("menuId"),
            menuName : $(this).attr("menuName")
        }
        if(taskbar.findAndMaximize(params.menuId)) return;
        if($("#" + params.menuId).length > 0) return;

        let $iframeWindow = assignDragFunction(params);
        $("body").append($iframeWindow);

        $("div.menu_container").find(".active").removeClass("active");

        windowList.push($iframeWindow);
    })
}

function iframeWindowAssignEvent($iframeWindow) {
    $iframeWindow.resizable({
        minHeight: $iframeWindow.data("minHeight"),
        minWidth: $iframeWindow.data("minWidth"),
        helper: "ui-resizable-helper",

        resize: function(event, ui) {
        },
        stop : function(event, ui) {
            const width = $(this).closest("div[name=iframeWindow]").width();
            const height = $(this).closest("div[name=iframeWindow]").height();

            $(this).css({ "width": width, "height": height });
            $iframeWindow.find("iframe").contents().find(".iframe_body").css({ "width" : width, "height" : height, "max-height" : 'none' });
            $iframeWindow.find("iframe").contents().find(".workspace").css({ "max-height" : height });

            /*let contentsHeight = height;
            //메뉴 높이 빼기
            if($iframeWindow.find("iframe").contents().find(".popup_setting_line").length > 0) {
                contentsHeight = contentsHeight - $iframeWindow.find("iframe").contents().find(".popup_setting_line").height();
            }
            //패딩 높이 빼기
            if(!$iframeWindow.find("iframe").contents().find(".workspace").hasClass("iframeWindowResizable")) {
                let padding = $iframeWindow.find("iframe").contents().find(".workspace").css("padding").replace("px","");
                if(!isNaN(padding)) {
                    padding = padding * 2;
                } else {
                    padding = 20;
                }
                contentsHeight -= padding;
            }
            $iframeWindow.find("iframe").contents().find(".iframeWindowResizable").css({ "width" : "100%", "height": contentsHeight,contentsHeight, "max-height" : contentsHeight });
            */
            //$iframeWindow.find("iframe").contents().find(".resiableMaxHeightRemove").css({ "max-height" : "none" });



            /*let contentsHeight = height;
            //메뉴 높이 빼기
            if($iframeWindow.find("iframe").contents().find(".popup_setting_line").length > 0) {
                contentsHeight = contentsHeight - $iframeWindow.find("iframe").contents().find(".popup_setting_line").height();
            }

            //패딩 높이 빼기
            if(!$iframeWindow.find("iframe").contents().find(".workspace").hasClass("jqueryUiResizabled")) {
                let padding = $iframeWindow.find("iframe").contents().find(".workspace").css("padding").replace("px","");
                if(!isNaN(padding)) {
                    padding = padding * 2;
                } else {
                    padding = 20;
                }
                contentsHeight -= padding;
            }

            $iframeWindow.find("iframe").contents().find(".jqueryUiResizabled").css({ "width" : "100%", "height": contentsHeight, "max-height" : contentsHeight });
            $iframeWindow.find("iframe").contents().find(".jqueryUiResizabledWidth").css({ "width" : "98%", "max-width" : "98%"});*/

        }
    });

    $iframeWindow.draggable(
        {
            cursor: "move",
            handle: ".popup_wrap",
            refreshPositions : true,
            scroll: false,
            containment: "body",
            start: function (event, ui) {
                event.stopPropagation();
                iframeWindow.focus($iframeWindow);
            },
            drag: function (event, ui) {
                ui.position.top = Math.max(ui.position.top, 70);
                $(this).css("top", ui.position.top); // Use $(this) to refer to the specific instance
                $(this).find(".bts_dragg").removeClass("display_none");
            },
            stop: function (event, ui) {
                $(this).find(".bts_dragg").addClass("display_none");
            },
        },
    );
}

function assignDragFunction(params) {
    var $iframeWindow = iframeWindow.openIframeWindow("", params);
    return $iframeWindow;
}

function loadMenuList() {
    const url = "/rest/api/main/menu-icons";
    $.ajax({
        url : url,
        type : "POST",
        dataType : "json",
        success : function(ajaxData) {
            $("#menuWrapper").empty();
            $("#topMenuWrapper").empty();

            let userSessionVo = ajaxData.data.userSessionVo;
            let topMenuList = ajaxData.data.topMenuList;

            generateTopMenuUserInfo(userSessionVo);
            generateTopMenuItems(topMenuList, userSessionVo.menuAuthInfos);

            Object.keys(userSessionVo.menuAuthInfos).forEach(function(key) {
                generateMenuIcons(userSessionVo.menuAuthInfos[key]);
            })
            bindMenuClickEvent();
            $("div.main_icon_group_wrap").each(function() {
                if($(this).find("div[name=parentMenuWrapper]").children().length === 0)
                    $(this).addClass("display_none");
            });
        },
        error : function(error) {
            console.log(error);
        }
    })
}

function generateTopMenuUserInfo(userSession) {
    let html = "";

    html += `<div class="menu_user_line">`;
    html += `    <div class="menu_left_wrap">`;
    html += `        <div class="menu_icon user"></div>`;
    html += `        <div class="menu_name">${userSession.mbrName}</div>`;
    html += `    </div>`;
    html += `    <div class="menu_right_wrap" onclick="openLogoutPopup()">`;
    html += `        <div class="menu_text" >Logout</div>`;
    html += `        <div class="menu_icon logout"></div>`;
    html += `    </div>`;
    html += `</div>`;

    $("#topMenuWrapper").append($(html));
}

function generateTopMenuItems(topMenus, subMenus) {
    Object.keys(topMenus).forEach(function(topMenuKey) {
        menuMap.set(topMenus[topMenuKey].id, topMenus[topMenuKey].menuName);

        let cateWrap = $("<div>").addClass("category_wrap");
        let topMenuWrap = $("<div>").addClass("main_category").text(topMenus[topMenuKey].menuName);
        topMenuWrap.data("name", "topMenu");
        topMenuWrap.attr("menuId", topMenus[topMenuKey].id);
        if(topMenus[topMenuKey].menuURL !== "") {
            topMenuWrap.attr("name", "menuIcon");
            topMenuWrap.attr("url", topMenus[topMenuKey].menuURL);
            topMenuWrap.attr("menuName", topMenus[topMenuKey].menuName);
        }

        let triangle = $("<div>").addClass("menu_triangle").text("▼");

        let topMenuVisiblityFlag = true;

        let subMenuWrap = $("<div>").addClass("middle_wrap");
        Object.keys(subMenus).forEach(function(subMenuKey) {
            if(subMenus[subMenuKey].parentId === topMenus[topMenuKey].id
                && subMenus[subMenuKey].isAllow === true) {
                let subMenuItem = $("<div>").addClass("middle_category_oj").text(`· ${subMenus[subMenuKey].menuName}`);
                subMenuItem.attr("menuId", subMenus[subMenuKey].menuId);
                subMenuItem.attr("name", "menuIcon");
                subMenuItem.attr("url", subMenus[subMenuKey].menuURL);
                subMenuItem.attr("menuName", subMenus[subMenuKey].menuName);

                subMenuWrap.append(subMenuItem);
            }

            if(subMenus[subMenuKey].menuId === topMenus[topMenuKey].id
                && subMenus[subMenuKey].isAllow === false)
                topMenuVisiblityFlag = false;
        })

        if(!topMenuVisiblityFlag)
            return false;

        if(subMenuWrap.children().length > 0) {
            topMenuWrap.append(triangle);
            cateWrap.append(subMenuWrap);
        }
        cateWrap.prepend(topMenuWrap);

        cateWrap.on("click", function() {
            $(this).toggleClass("active");
            $(this).find("div.main_category").toggleClass("active");
        })

        $("#topMenuWrapper").append(cateWrap);
    })
}

function generateMenuIcons(menu) {
    if(menu.isAllow === false) return;
    let targetParentMenuName = menuMap.get(menu.parentId);
    if(targetParentMenuName === undefined)
        targetParentMenuName = "기타";
    let targetParentMenuSpan = $(`span[name=parentMenuName]`).filter(function() {
        return $(this).text() === targetParentMenuName;
    });
    let targetParentMenuWrapper = targetParentMenuSpan.parent().siblings("div[name=parentMenuWrapper]");

    let className = menu.menuURL.replaceAll("/", "_").substring(1, menu.menuURL.length);

    let html = "";

    html += `<div class="main_icon_group">`;
    html += `    <div class="bg_icon_wrap" menuId="${menu.menuId}" name="menuIcon" url="${menu.menuURL}" menuName="${menu.menuName}">`;
    html += `        <div class="bg_icon ${className}"></div>`;
    html += `        <div class="bg_icon_text">${menu.menuName}</div>`;
    html += `    </div>`;
    html += `</div>`;

    targetParentMenuWrapper.append($(html));

    // $("#menuWrapper").append($(html));
}

function controlMenuWrapper() {
    $("div.main_group_title").on("click", function() {
        $(this).parent().toggleClass("fold");
    });
}

function menuIconClick(params) {
	if($("#" + params.menuId).length > 0) {
		if(typeof(params.callback) == "function") {
			params.callback();
		}
	} else {
		var $iframeWindow = iframeWindow.openIframeWindow("", params);
        $iframeWindow.draggable({refreshPositions : true});
        $("body").append($iframeWindow);
	}
}


function initClock(initFlag) {
    $("#YMD").text(new Date().format("yy-mm-dd"));
    $("#hour").text(new Date().format("TT hh:MM"))
    if(initFlag) {
        setInterval("initClock()", 1000);
    }
}

function updateSocketSession(sessionId) {
    const url = "/rest/api/counseling/customer/chat/session/"+sessionId;
    
    let param = {};
    if(localStorage.getItem("cnslStatus")) param.cnslStatus = localStorage.getItem("cnslStatus");
    
    $.ajax({
        url: url,
        type: "PUT",
        data: param,
        dataType: "json",
        success : function(ajaxData) {
           
        },
        error : function(error) {
            console.log(error);
        }
    });
}

