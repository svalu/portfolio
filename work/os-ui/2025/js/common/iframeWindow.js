var iframeWindow = (function($) {
    function generateIframeWindow() {
        let left = 100 + windowList.length * 20;
        let top = 95 + windowList.length * 20;
        return $(`
                  <div name="iframeWindow" class="popup_wrap" style="position: relative; left: ${left}px;top: ${top}px;">
                    <div class="bts_dragg display_none"></div>
                    <div class="popup_top_line">
                      <div class="popup_inline left_wrap">
                        <div name="iframeWindowName" class="con_title_text_1"></div>
                      </div>
                      <div class="popup_inline right_wrap">
                        <button data-action="reload" class="popup_bu_icon reload"></button>
                        <button data-action="minimize" class="popup_bu_icon minus"></button>
                        <button data-action="close" class="popup_bu_icon esc"></button>
                      </div>
                    </div>
                    <iframe></iframe>
                  </div>
                `);
    }

    function openIframeWindow(coordinate, params) {
        var $iframeWindow = generateIframeWindow();
        var $iframe = $iframeWindow.find('iframe');
        var $resizeObserver;
        thisWindow = $iframeWindow;

        $iframeWindow.attr("id", params.menuId);
        $iframeWindow.find("div[name=iframeWindowName]").text(params.menuName);

        let queryParams = "";
        if(params.sendParams !== undefined)
            queryParams = "?" + generateQueryString(params.sendParams);

        $iframe.attr("src", params.url + queryParams);

        $iframe.on('load', function() {
            const iframeDocument = $iframe[0].contentWindow;
            bindShortcutKey(iframeDocument);

            /*$(iframeDocument).on('keydown', function(event) {
                const eventTarget = event.target;
                //textarea, input 일 때는 제외
                /!*switch (event.target.nodeName) {
                    case "INPUT":
                    case "TEXTAREA":
                        return;
                        break;
                }*!/
                //event.key === 'Escape' ||
                //ESC 클릭
                /!*if (event.keyCode === 27) {
                    if($(parent.document).find(".iframe_in_popup:not(.display_none)").length ==0) closeLastOpenedIframe("iframeWindow");
                }*!/


            });*/
        });

        $iframeWindow.find("button").on("click", function() {
            var iframeWindow = $(this).parents("div[name=iframeWindow]");
            var action = $(this).data("action");
            switch (action) {
                case "minimize":
                    iframeWindow.addClass("display_none");
                    taskbar.minimize(params.menuId);
                    break;
                case "reload":
                    var targetIframe = $(this).parents("div[name=iframeWindow]").find("iframe");
                    var targetIframeSrc = $(targetIframe).attr("src");
                    $iframeWindow.data("reload", "true");
                    $(targetIframe).attr("src", targetIframeSrc);
                    break;
                case "close":
                    try {
                        var targetIframe = $(this).parents("div[name=iframeWindow]").find("iframe");
                        var targetObserve = $(targetIframe).contents().find('.iframe_body').get(0);
                        if(targetObserve) $resizeObserver.unobserve(targetObserve);
                        {
                            let index = windowList.indexOf(iframeWindow[0]);
                            windowList.splice(index, 1);
                        }
                        // windowList.remove(iframeWindow);
                    } catch(e) {
                        console.error(e);
                    }
                    iframeWindow.remove();
                    taskbar.remove(params.menuId);
                    break;
            }

        });

        //$iframeWindow.find("iframe").on("load", function() {
        $iframe.on("load", function() {
            focus($iframeWindow);
            taskbar.regist(params.menuId, params.menuName);
            $(this).contents().on("contextmenu", function(event) {
                event.preventDefault();
            })
            observeIframeContentResize($(this));
            $iframeWindow.on("click", function() {
                focus($iframeWindow);
            });

            var iframeDocument = $iframeWindow.find("iframe").contents();
            iframeDocument.find("body").on("click", function () {
                focus($iframeWindow);
            });
        });


        $iframeWindow[0].adjustOuterDivSize = adjustOuterDivSize;

        function observeIframeContentResize(iframe) {
            var $observerTarget = $(iframe).contents().find('.iframe_body').get(0);
            $resizeObserver = new ResizeObserver((entries) => {
                entries.forEach((entry) => {
                    var { width, height } = entry.contentRect;

                    if(!$iframeWindow.data("minWidth")) {
                        $iframeWindow.data("minWidth", width);
                        $iframeWindow.data("minHeight", height);
                        iframeWindowAssignEvent($iframeWindow); //drag, resizable
                    }

                    $(iframe).css("width", width);
                    $(iframe).css("height", height);

                    //$iframeWindow, iframe width 다르면 맞춤
                    let iframeWidth = $iframeWindow.css("width").replace("px", "");
                    const maxWidth = Math.max(width, iframeWidth);
                    if(width > iframeWidth) {
                        $iframeWindow.css("width", width);
                    } else if(width < iframeWidth && $iframeWindow.data("reload") == "true") { //처음 로딩할 때 맞추면 아이프레임 넓이가 처음 크기로 고정되어서 리로드 일 때만 맞춤
                        width = iframeWidth;
                        $(iframe).contents().find(".iframe_body").css({"width": width});
                    } else {
                        $iframeWindow.css("width", width);
                    }

                    //console.log("observeIframeContentResize.width : ", width, " ::::::::::: iframeWidth : ", iframeWidth);
                    //console.log("observeIframeContentResize :: ", width, height);
                    iframeWindowCheckPosition(iframe, width, height);
                });
            });
            if($observerTarget) $resizeObserver.observe($observerTarget);
        }

        return $iframeWindow;
    }

    function getAvailableViewportHeight() {
        var windowHeight = window.innerHeight; // 현재 브라우저 창의 높이
        var windowOuterHeight = window.outerHeight; // 브라우저 창의 전체 높이 (탭, 주소표시줄 포함)
        var windowChromeHeight = windowOuterHeight - windowHeight; // 브라우저 창의 크롬 부분 (탭, 주소표시줄 등)
        var screenAvailableHeight = screen.availHeight;

        var availableHeight = screenAvailableHeight - windowChromeHeight;
        return availableHeight;
    }

    //화면 하단으로 안 내려가게 처리
    function iframeWindowCheckPosition(iframe, width, height) {
        const addPos = 10;
        let offset = $(iframe).offset();
        const screenHeight = parseInt(screen.height);
        //let iframeBottom = parseInt(offset.top) + parseInt($(iframe).height());
        let iframeBottom = parseInt(offset.top) + parseInt(height);
        let maxHeightPos = getAvailableViewportHeight();
        let topAdjustment = maxHeightPos - iframeBottom - addPos;
        let leftAdjustment = screen.availWidth - (parseInt(offset.left) + parseInt(width)) - addPos
        const minTop = 80;

        if(topAdjustment < 0) {
            let topPos = (offset.top + (topAdjustment)) < minTop ? minTop : (offset.top + (topAdjustment));
            var iframeWindow = $(iframe).parents("div[name=iframeWindow]");
            iframeWindow.css("top", topPos);
        };

        if(leftAdjustment < 0) {
            let leftPos = (offset.left + (leftAdjustment)) < 0 ? 0 : (offset.left + (leftAdjustment));
            var iframeWindow = $(iframe).parents("div[name=iframeWindow]");
            iframeWindow.css("left", leftPos);
        }

    }

    function focus($iframeWindow) {
        let index = windowList.indexOf($iframeWindow);
        if(index === -1) {
            windowList.push($iframeWindow);
            return;
        } else {
            windowList.splice(index, 1);
            windowList.push($iframeWindow);
        }

        windowList.forEach(function(iframe, index) {
            $(iframe).css('z-index', index);
        });
    }

    function adjustOuterDivSize() {
        var iframeHeight = $(this).find("iframe").contents().find("div.iframe_body").height();
        var iframeWidth = $(this).find("iframe").contents().find("div.iframe_body").width();
        $(this).height(iframeHeight);
        $(this).width(iframeWidth);
    }

    function closeLastOpenedIframe(type) {
        if(windowList.length > 0) {
            const lastIframe =windowList[windowList.length - 1];
            uiConfirm(`'${$(lastIframe).find("div[name=iframeWindowName]").text()}'창을 닫으시겠습니까?`, function() {
                $(lastIframe).find("button[data-action=close]").trigger("click");
            });
        }
    }

    function minimizeWindow() {
        if(windowList.length > 0) {
            const copyArr = [...windowList].reverse();
            $(copyArr).each(function(idx, obj) {
                if(!$(obj).hasClass("display_none") ) {
                    $(obj).find("button[data-action=minimize]").trigger("click");
                    return false;
                }
            });
        }
    }


    function maximizeWindow() {
        if(windowList.length > 0) {
            const copyArr = [...windowList].reverse();
            $(copyArr).each(function(idx, obj) {
                if($(obj).hasClass("display_none") ) {
                    const targetTaskBarBtnName = $(obj).attr("id");
                    $("div[id='taskbar'] button[name='"+targetTaskBarBtnName+"']").click();
                    return false;
                }
            });
        }
    }

    function bindShortcutKey(evtTarget) {
        $(evtTarget).keydown(function(event) {
            const key = event.keyCode || event.which;
            const target = self !== top ? this : iframeWindow;

            if(key == 27) {
                if($(parent.document).find(".iframe_in_popup:not(.display_none)").length ==0) target.closeLastOpenedIframe("iframeWindow");
            }

            if (event.ctrlKey) {
                switch (event.key) {
                    case "ArrowUp":
                        target.minimizeWindow();
                        break;
                    case "ArrowDown":
                        target.maximizeWindow();
                        break;
                }
            }
        });
    }

    return {
        openIframeWindow,
        focus,
        closeLastOpenedIframe,
        minimizeWindow,
        maximizeWindow,
        bindShortcutKey
    };
})(jQuery);