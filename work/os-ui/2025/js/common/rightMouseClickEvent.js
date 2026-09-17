function RtMouseClickEvent(params) {
    this.params = params;
    this.init();
}
RtMouseClickEvent.prototype.init = function() {
    var self = this;

    $(document).off("contextmenu", this.params.selector).on("contextmenu", this.params.selector, function (event) {
        event.preventDefault();

        //우클릭 기본 이벤트
        self.params.defaultEvent && self.params.defaultEvent($(this));

        if ($("#itemMenu").length > 0)
            $("#itemMenu").remove();

        var menuWrapper = $('<div id="itemMenu" class="mouse_right_bu_wrap"></div>');

        if ($(event.target).parent().find("div.mouse_right_bu_wrap").length > 0) return;

        var $this = $(this);

        menuWrapper.empty(); // Clear previous menu items
        $.each(self.params.menus, function (key, menuData) {
            var menu = $('<div class="mouse_right_oj active">' + menuData.menuName + '</div>');
            menu.on("click", function (event) {
                event.stopPropagation();

                var callbackArgs = [$this];

                if (menuData.args && Array.isArray(menuData.args)) {
                    menuData.args.forEach(function (attrName) {
                        callbackArgs.push($this.data(attrName));
                    });
                }

                menuData.callback(...callbackArgs);
                menuWrapper.remove();
            });
            menuWrapper.append(menu);
        });


        $(document).find("body div.iframe_body").append(menuWrapper);

        //메뉴가 iframe밖으로 나갈때 위치 보정
        let maxWidth = $(document).find("body div.iframe_body").width();
        let maxHeight = $(document).find("body div.iframe_body").height();

        let leftPos = event.pageX;
        let topPos = event.pageY;
        let bottomPos = $("#itemMenu").height() + topPos;
        let rightPos = $("#itemMenu").width() + leftPos;

        if(bottomPos >= maxHeight)
            topPos -= bottomPos - maxHeight;
        if(rightPos >= maxWidth)
            leftPos -= rightPos - maxWidth;

        $("#itemMenu").css("top", topPos);
        $("#itemMenu").css("left", leftPos);
        self.params.menuContextHandler && self.params.menuContextHandler($this);
    });

    $(document).on("click", function (event) {
        if (!$(event.target).is(self.params.selector)) {
            $("#itemMenu").remove();
        }
    });
}

