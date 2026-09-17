(function ($) {
    $.fn.twoBtnPopup = function (options, confirmParams, cancelParams) {
        var defaults = {
            title: 'Default Title',
            context: 'Default Context',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            confirmCallback: function () {},
            cancelCallback: function () {},
            id: ''
        };

        options = $.extend({}, defaults, options);
        if(!options.id) options.id = "tmp_"+new Date().getTime();

        var $alert = $('<div class="iframe_in_popup">\
                            <div class="iframe_in_container">\
                                <div class="iframe_in_popup_text_1">' + options.title + '</div>\
                                <div class="iframe_in_popup_text_2">' + options.context + '</div>\
                                <div class="popup_buttom_bu_wrap">\
                                    <button class="popup_bu color_1" id="' + options.id + '-confirm">' + options.confirmText + '</button>\
                                    <button class="popup_bu color_2" id="' + options.id + '-cancel">' + options.cancelText + '</button>\
                                </div>\
                            </div>\
                        </div>');

        //$('.iframe_body').append($alert);
        $('.iframe_body').length > 0 ? $('.iframe_body').append($alert) : $('body').append($alert);

        $('#' + options.id + '-confirm').focus();

        $('#' + options.id + '-confirm').on('blur', function() {
            $('#' + options.id + '-confirm').focus();
        });

        $('#' + options.id + '-confirm').on("keypress", function(event) {
            event.preventDefault();
        });
        $('.iframe_in_popup').on("keydown",function(key){
            if(key.keyCode==13) {
                $('#' + options.id + '-confirm').trigger("click");
            }
        });
        $('.iframe_in_popup').on("keydown",function(key){
            if(key.keyCode==27) {
                key.stopPropagation();
                $('#' + options.id + '-cancel').trigger("click");
            }
        });
        /*$('#' + options.id + '-confirm').on("keydown",function(key){
            if(key.keyCode == 27)
                $('#' + options.id + '-confirm').trigger("click");
        });*/

       /* $('.iframe_in_popup').on("keyup",function(key){
            if(key.keyCode==13) {
                $('#' + options.id + '-confirm').trigger("click");
            } else if(key.keyCode == 27) {
                $('#' + options.id + '-cancel').trigger("click");
            }
        });*/

        $('#' + options.id + '-confirm').on('click', function () {
            options.confirmCallback(this, true, confirmParams);
            $alert.remove();
        });

        $('#' + options.id + '-cancel').on('click', function () {
            options.cancelCallback(this, false, cancelParams);
            $alert.remove();
        });

        $alert.removeAlert = function () {
            $alert.remove();
        };

        return $alert;
    };
    
    uiConfirm = function(context, confirmCallback, title, confirmText, cancelText) {
		
		if(!title) title = "알림";
		if(!confirmText) confirmText = "확인";
		if(!cancelText) cancelText = "취소";
		
		var optioins = {
            title: title,
            context: context,
            confirmText: confirmText,
            cancelText: cancelText,
            confirmCallback: confirmCallback,
        };
        
        $.fn.twoBtnPopup(optioins);
	}
})(jQuery);

(function ($) {
    $.fn.oneBtnPopup = function (options, confirmParams) {
		
        var defaults = {
            title: 'Default Title',
            context: 'Default Context',
            confirmText: 'Confirm',
            confirmCallback: function () { $alert.removeAlert(); },
            id: ''
        };

        options = $.extend({}, defaults, options);

        var $alert = $('<div class="iframe_in_popup">\
                            <div class="iframe_in_container">\
                                <div class="iframe_in_popup_text_1">' + options.title + '</div>\
                                <div class="iframe_in_popup_text_2">' + options.context + '</div>\
                                <div class="popup_buttom_bu_wrap">\
                                    <button class="popup_bu color_1" id="' + options.id + '-confirm">' + options.confirmText + '</button>\
                                </div>\
                            </div>\
                        </div>');

        if($('.iframe_body').length > 0) {
            $('.iframe_body').append($alert);
        } else {
            $('body').append($alert);
        }

        $('#' + options.id + '-confirm').focus();
        $('#' + options.id + '-confirm').on("keypress", function(event) {
            event.preventDefault();
        });
        $('.iframe_in_popup').on("keydown",function(key){
            if(key.keyCode==13) {
                $('#' + options.id + '-confirm').trigger("click");
            }
        });


        $('#' + options.id + '-confirm').on('click', function () {
            options.confirmCallback(this, confirmParams);
            $alert.remove();
        });

        $alert.removeAlert = function () {
            $alert.remove();
        };

        return $alert;
    };
    
    uiAlert = function(context, confirmCallback, title, confirmText) {

		if(!title) title = "알림";
		if(!confirmText) confirmText = "확인";
		
		var options = {
		    title: title, //팝업창 타이틀
		    context: context, //팝업창 내용
		    confirmText: confirmText //팝업창 버튼속 텍스트
		};
		
		if(typeof(confirmCallback) == "function") {
			options.confirmCallback = confirmCallback;
		}
		
		$.fn.oneBtnPopup(options);
	}
    
})(jQuery);
