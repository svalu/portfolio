(function($) {
    $.fn.validateOnInput = function(validationType) {
        return this.each(function() {
            var $input = $(this);

            $input.on("keyup", function() {
                var inputValue = $input.val();
                var formattedValue = formatInput(inputValue, validationType);

                $input.val(formattedValue);
            });
        });
    };

    function formatInput(inputValue, type) {
        if (type === "phone") {
            return inputValue.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
        } else if (type === "number") {
            return inputValue.replace(/\D/gi, "");
        } else if (type === "alphabet") {
            return inputValue.replace(/[^a-zA-Z]/gi, "");
        } else if (type === "number-alphabet") {
            return inputValue.replace(/[^a-zA-Z0-9]/gi, "");
        } else if (type === "korean") {
            return inputValue.replace(/[^\uAC00-\uD7A3\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/gi, "");
        } else if (type === "korean-number") {
            return inputValue.replace(/[^0-9\uAC00-\uD7A3\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/gi, "");
        } else if (type === "korean-alphabet") {
            return inputValue.replace(/[^\uAC00-\uD7A3\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FFa-zA-Z]/gi, "");
        } else if (type === "non-special") {
            return inputValue.replace(/[^a-zA-Z0-9\uAC00-\uD7A3\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/gi, "");
        }else if (type === "no-korean") {
            return inputValue.replace(/[\uAC00-\uD7A3\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/gi, "");
        }else {
            return inputValue;
        }
    }
})(jQuery);


String.prototype.validate = function(validationType) {
    if (Object.prototype.toString.call(this) !== '[object String]') {
        return false;
    }

    function validatePhone(inputValue) {
        return /^010-\d{3,4}-\d{4}$/.test(inputValue);
    }

    function validateEmail(inputValue) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(inputValue);
    }

    if (validationType === "phone") {
        return validatePhone(this);
    } else if (validationType === "email") {
        return validateEmail(this);
    }

    return false;
};