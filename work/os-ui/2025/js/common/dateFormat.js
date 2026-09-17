/*
 * Date Format 1.2.3 (http://blog.stevenlevithan.com/archives/date-time-format)
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 * 요일명, 월 정보 추가
 * 예시)
 * let today = new Date(); dateFormat(today, dateFormat.masks.monthKoreanName);
 * let today = new Date(); dateFormat(today, dateFormat.masks.dayKoreanName);
 * let today = new Date(); dateFormat(today, dateFormat.masks.isoDate);
 */

var dateFormat = function() {
    var token = /d{1,5}|m{1,5}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function(date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                ddddd: dF.i18n.dayNames[D + 14],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                mmmmm: dF.i18n.monthNames[m + 24],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "오전" : "오후",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();


var getDateRange = function(flag, date) {

    if(!date) date = new Date();
    const dateFunctionMap = {
        "0":getCurrentWeekRange, //이번주
        "1":getLastWeekRange, //저번주
        "2":getCurrentMonthRange, //이번달
        "3":getLastMonthRange, //저번달
        "4":getCurrentYearRange, //올해
        "5":getTodayRange,       //오늘
        "thisWeek":getCurrentWeekRange, //이번주
        "lastWeek":getLastWeekRange, //저번주
        "thisMonth":getCurrentMonthRange, //이번달
        "lastMonth":getLastMonthRange, //저번달
        "thisYear":getCurrentYearRange, //올해
        "today":getTodayRange       //오늘
    }

    if(!dateFunctionMap[flag]) {
        alert("잘못된 접근입니다");
    } else {
        const dateObj = dateFunctionMap[flag](date);
        return dateObj;    
    }
}

var getTodayRange = function(date) {
    return { start: date, end: date };
}

// 이번 주의 시작일과 종료일
var getCurrentWeekRange = function(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // 일요일로 이동
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + (6 - date.getDay())); // 토요일로 이동
    return { start: startOfWeek, end: endOfWeek };
}

// 저번 주의 시작일과 종료일
var getLastWeekRange = function(date) {
    const { start: currentWeekStart } = getCurrentWeekRange(date);
    const startOfLastWeek = new Date(currentWeekStart);
    startOfLastWeek.setDate(currentWeekStart.getDate() - 7); // 1주일 전
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // 1주일 후
    return { start: startOfLastWeek, end: endOfLastWeek };
}

// 이번 달의 시작일과 종료일
var getCurrentMonthRange = function(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start: startOfMonth, end: endOfMonth };
}

// 저번 달의 시작일과 종료일
var getLastMonthRange = function(date) {
    const startOfLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const endOfLastMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    return { start: startOfLastMonth, end: endOfLastMonth };
}

// 올해의 시작일과 종료일
var getCurrentYearRange = function(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const endOfYear = new Date(date.getFullYear(), 11, 31);
    return { start: startOfYear, end: endOfYear };
}

// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    dayEnglishName: "ddd",
    dayKoreanName: "dddd",
    dayKoreanShortName: "ddddd",
    monthEnglishName: 'mmmm',
    monthKoreanName: 'mmmmm',
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일",
        "일", "월", "화", "수", "목", "금", "토"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
        "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
    ]
};

const dateAddTime = function(paramDate, mask, time) {

	var date;
	if(paramDate instanceof Date) {
		date = paramDate;		
	} else if(paramDate instanceof String) {
		date = new Date(paramDate);
	}
	
	var addDate = date.setHours(date.getHours() + time);
	return dateFormat(addDate, mask);	
}




// For convenience...
Date.prototype.format = function(mask, utc) {
    return dateFormat(this, mask, utc);
};

String.prototype.addTime = function(mask, time) {
	return dateAddTime(this, mask, time);
};