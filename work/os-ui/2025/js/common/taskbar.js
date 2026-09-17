var taskbar = (function($) {
    function regist(menuId, menuName) {
        
        //중복 방지
        if($("#taskbar button[name='"+menuId+"']").length > 0) {
            return "";
        }
        //let addClass = $("div.main_icon_group_container div[menuid="+menuId+"] .bg_icon").attr("class").replace("bg_icon","");
        var $html = $(`<button name="${menuId}" class="wrok_line_oj">`
                    + `    <div class="wrok_line_icon icon_1"></div>`
                    + `    <div class="wrok_line_text_1">${menuName}</div>`
                    + `</button>`);
        $html.on("click", function() {
            if($(this).hasClass("inactive"))
                maximize(menuId)
            else
                minimize(menuId);
        });
        $("#taskbar").append($html);

        return $html;
    }
    function minimize(menuId) {
        $(`#${menuId}`).addClass("display_none");
        $("#taskbar").find(`button[name=${menuId}]`).addClass("inactive");
    }

    function maximize(menuId) {
        $(`#${menuId}`).removeClass("display_none");
        $(`#${menuId}`).removeClass("blinker");
        $("#taskbar").find(`button[name=${menuId}]`).removeClass("inactive");
        $(document).trigger("maximize", [menuId]);
    }

    function remove(menuId) {
        $("#taskbar").find(`button[name=${menuId}]`).remove();
    }

    function findAndMaximize(menuId) {
        if($("#taskbar").find(`button[name=${menuId}]`).length > 0) {
            maximize(menuId);
            return true;
        } else
            return false;
    }

    return {
        regist : regist,
        minimize : minimize,
        remove : remove,
        findAndMaximize : findAndMaximize
    }
})(jQuery);