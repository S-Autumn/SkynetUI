/* Simplified Chinese translation for the jQuery Timepicker Addon /
 / Written by Will Lu */
(function ($) {
    $.timepicker.regional['zh-CN'] = {
        timeOnlyTitle: '选择时间',
        timeText: '时间',
        hourText: '小时',
        minuteText: '分钟',
        secondText: '秒钟',
        millisecText: '毫秒',
        microsecText: '微秒',
        timezoneText: '时区',
        currentText: '现在时间',
        closeText: '关闭',
        timeFormat: 'HH:mm',
        timeSuffix: '',
        amNames: ['AM', 'A'],
        pmNames: ['PM', 'P'],
        isRTL: false
    };
    $.timepicker.setDefaults($.timepicker.regional['zh-CN']);

    $.datepicker.regional['zh-CN'] = { // Default regional settings
        closeText: "关闭", // Display text for close link
        prevText: "&#x3C;上月", // Display text for previous month link
        nextText: "下月&#x3E;", // Display text for next month link
        currentText: "今天", // Display text for current month link
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], // Names of months for drop-down and formatting
        monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], // For formatting
        dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'], // For formatting
        dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'], // For formatting
        dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'], // Column headings for days starting at Sunday
        weekHeader: "周", // Column header for week of the year
        dateFormat: "yy-mm-dd", // See format options on parseDate
        firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
        isRTL: false, // True if right-to-left language, false if left-to-right
        showMonthAfterYear: false, // True if the year select precedes month, false for month then year
        yearSuffix: "年" // Additional text to append to the year in the month headers
    };
    $.datepicker.setDefaults($.datepicker.regional['zh-CN']);

})(jQuery);
