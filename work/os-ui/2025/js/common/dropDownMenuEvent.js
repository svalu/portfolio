function DropDownMenuEvent(params) {
    this.params = params;
    this.init();
}

DropDownMenuEvent.prototype.init = function() {
    var self = this;

    var $this = $(this);
    var menuWrapper = $(`<div id="dropDownMenu" class="setting_line_oj_item_wrap"></div>`);
    $.each(self.params.menus, function(key, menuData) {
        var menu = $(`<span>${menuData.menuName}</span>`);
        menu.off("click").on("click", function(event) {
            event.stopPropagation();
            var callbackArgs = [$this];

            if (menuData.args && Array.isArray(menuData.args)) {
                menuData.args.forEach(function (attrName) {
                    callbackArgs.push($this.data(attrName));
                });
            }

            menuData.callback(...callbackArgs);
            menuWrapper.parent().removeClass("active");
        });
        menuWrapper.append(menu);
    })
    $(self.params.selector).append(menuWrapper);

    $(document).on("click", self.params.selector, function(event) {
        self.params.menuContextHandler && self.params.menuContextHandler($this);
        // event.preventDefault();
        $(this).toggleClass("active");
    })

    $(document).on("click", function(event) {
        // event.stopPropagation();
        if($(event.target)[0] !== $(self.params.selector)[0] && !$.contains($(self.params.selector)[0], $(event.target)[0])) {
            $("#dropDownMenu").parent().removeClass("active");
        }
    })
}
//
// DropDownMenuEvent.prototype.disableMenuItem = function(menuId) {
//     var menuData = this.params.menus[menuId];
//     if (menuData && !menuData.disabled) {
//         menuData.disabled = true;
//         let targetMenu = $("#dropDownMenu").find(`span`).filter(function() { return $.trim($(this).justtext()) === $.trim(menuData.menuName); });
//         targetMenu.addClass("inactive");
//     }
// };
//
// DropDownMenuEvent.prototype.enableMenuItem = function(menuId) {
//     var menuData = this.params.menus[menuId];
//     if(menuData && menuData.disabled) {
//         menuData.disabled = false;
//         let targetMenu = $("#dropDownMenu").find(`span`).filter(function() { return $.trim($(this).justtext()) === $.trim(menuData.menuName); });
//         targetMenu.removeClass("inactive");
//     }
// };


