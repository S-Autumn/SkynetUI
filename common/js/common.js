/*
 * Js SimplTools
 *
 * Copyright (c) 2014 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil.@163.com
 * Date: 2015-10-10
 */
(function ($, win) {
    /**
     * 日期对象扩展格式化方法
     */
    var format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };
    /**
     * 字符串对象扩展 删除左右两端的空格
     */
    var trim = function () {
        return $.trim(this);
    };
    /**
     * 判断会否为空 支持常规对象、NaN、html元素、jQuery元素、数组、对象，
     * 对象没有属性时（自身属性不包括父属性）数组没有成员时 和 其他为null 空 或者 undefined情况返回真
     */
    var isEmpty = function (obj) {
        if (obj == undefined || obj == null || _.isNaN(obj)) return true;
        if (typeof obj === "function")  return false;
        if (typeof obj === "string" && $.trim(obj).length > 0) return false;
        else if (typeof obj === "string" && $.trim(obj).length <= 0) return true;
        if (typeof obj === "number" || typeof obj === "boolean" || obj instanceof RegExp)  return false;
        if (obj == obj.window || obj.nodeType)  return false;
        if (obj instanceof jQuery && obj.length > 0) return false;
        else if (obj instanceof jQuery && obj.length <= 0) return true;
        return _.isEmpty(obj);
    };
    /**
     * Js clone
     * 针对基础对象、元素、jQuery元素 深度克隆包括自身属性和方法
     * 注意:
     *     1.对象父属性不保留
     *     2.方法父对象不克隆（引用）-----无法通过非eval来实现
     */
    var clone = function (obj) {
        if (!obj || obj === obj.window || obj instanceof Document) return obj;
        var buf;
        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || typeof obj === 'function') {
            return obj;
        } else if ($.isPlainObject(obj)) {
            buf = {};
            for (var k in obj) {
                if (obj.hasOwnProperty(k))
                    buf[k] = arguments.callee(obj[k]);
            }
            return buf;
        } else if (obj instanceof Array) {
            buf = [];
            var i = obj.length;
            while (i--) {
                buf[i] = arguments.callee(obj[i]);
            }
            return buf;
        } else if (obj instanceof HTMLElement) {
            return $(obj).clone(true);
        } else if (obj instanceof jQuery) {
            return obj.clone(true);
        } else {
            return obj;
        }
    };
    /**
     * 在对象或数组中寻找值
     */
    var skynetFind = function (data, find, context, flag) {
        if (isEmpty(data)) return null;
        if (flag == true) {
            return _.find(data, find, context);
        } else {
            return _.filter(data, find, context)
        }
        return null;
    };
    /**
     * 在 数组[对象,...] 中寻找值
     */
    var skynetWhere = function (data, find, flag) {
        if (!$.isArray(data)) return null;
        if (flag == true) {
            return _.findWhere(data, find)
        } else {
            return _.where(data, find);
        }
        return null;
    };
    /**
     * 简单类型成员 忽略顺序集合比对（当确认2个集合都排序时将使用最优算法）
     */
    var equalsSimpleArray = function (list1, list2, isSort) {
        if (isSort == true)
            return _.isEqual(list1, list2);
        else {
            var key = false;
            if ($.isArray(list1) && $.isArray(list2)) {
                if (list1.length == list2.length && list1.length > 0) {
                    var _list1 = clone(list1), _list2 = clone(list2);
                    var i = _list1.length;
                    while (i--) {
                        if (_list2.length <= 0) break
                        var k = _list2.length;
                        while (k--) {
                            if (_list1[i] == _list2[k]) {
                                _list2.splice(k, 1);
                                break;
                            }
                        }
                        if (_list2.length == 0) {
                            if (i == 0) key = true;
                            break;
                        }
                    }
                } else if (list1.length == list2.length && list1.length == 0) {
                    key = true;
                }
            }
            return key;
        }
    };
    /**
     * 数据筛选
     * 关键字 keyWords 例如bean.pop.a[2].go表示去datas中找属性为bean的对象下pop子属性对象下的属性a的第三个成员的go属性
     * 被筛选数据 datas 可是{}和[]
     */
    var getDataByKey = function (data, keyWords) {
        if (isEmpty(keyWords) || isEmpty(data) || typeof keyWords !== "string")return "";
        var dataMode = data;
        if (typeof data === "string")
            dataMode = JSON.parse(dataMode);
        if (isEmpty(dataMode)) return null;
        var keys = keyWords.split(".");
        var i = 0, imax = keys.length;
        for (; i < imax; i++) {
            var key = keys[i];
            if (isEmpty(key)) return null;
            var keySteps = _.compact(key.split(/\[|\]/));
            var k = 0, kmax = keySteps.length;
            for (; k < kmax; k++) {
                var keyStep = keySteps[k];
                if (isEmpty(keyStep)) return null;
                if (isEmpty(dataMode[keyStep])) return dataMode[keyStep];
                dataMode = dataMode[keyStep];
            }
        }
        return dataMode;
    };
    /**
     * 夸窗口寻找元素 返回 元素和所在window
     */
    var windowFind = function (filter, _window) {
        if (!filter) return null;
        if (!_window) _window = window;
        var find = _window.$(_window.document).find(filter);
        if (find.length) return {element: find, win: _window};
        if (_window.parent && _window != _window.parent) {
            return windowFind(filter, _window.parent);
        }
    };
    /**
     * 获得窗口大小
     */
    var getWindowBound = function (obj) {
        var viewHeight = obj.innerHeight;
        var viewWidth = obj.innerWidth;
        if (typeof viewHeight != 'number') {
            if (obj.document.compatMode == 'number') {
                viewHeight = obj.document.documentElement.clientHeight;
                viewWidth = obj.document.documentElement.clientWidth;
            } else {
                viewHeight = obj.document.body.clientHeight;
                viewWidth = obj.document.body.clientWidth;
            }
        }
        return {width: viewWidth, height: viewHeight};
    };
    /**
     * 获得元素在顶层窗口的相对位置
     */
    var getWindowPosition = function (element, site, _window) {
        if (!element || !_window || isEmpty(site) || !("getBoundingClientRect" in _window.document.documentElement))
            return site;
        var windowBound = getWindowBound(_window);
        var scrollWidth = 0;
        var scrollHeight = 0;
        var d = element.getBoundingClientRect(),
            e = element.ownerDocument,
            f = e.body,
            g = e.documentElement,
            h = g.clientTop || f.clientTop || 0,
            i = g.clientLeft || f.clientLeft || 0;
        var scrollLeft = -i;
        var scrollTop = -h;
        if (_window == _window.parent) {
            if ($.browser['msie'] == true) {
                scrollWidth = windowBound.width - _window.document.documentElement.clientWidth;
                scrollHeight = windowBound.height - _window.document.documentElement.clientHeight;
            } else {
                scrollWidth = windowBound.width - Math.max(_window.document.body.clientWidth, _window.document.documentElement.clientWidth);
                scrollHeight = windowBound.height - Math.max(_window.document.body.clientHeight, _window.document.documentElement.clientHeight);
            }
            scrollLeft = (g.scrollLeft || f.scrollLeft) - i;
            scrollTop = (g.scrollTop || f.scrollTop) - h;
            scrollWidth = scrollWidth < 0 ? 0 : scrollWidth;
            scrollHeight = scrollHeight < 0 ? 0 : scrollHeight;
        }
        var b = d.top + scrollTop;
        var c = d.left + scrollLeft;
        var j = windowBound.height - b - d.height - scrollHeight;
        var k = windowBound.width - c - d.width - scrollWidth;
        site.top = site.top + b;
        site.left = site.left + c;
        site.bottom = site.bottom + j;
        site.right = site.right + k;
        element = _window['frameElement'];
        if (!element || !_window.parent || _window == _window.parent)
            return site;
        else
            return getWindowPosition(element, site, _window.parent);
    };
    /**
     * 夸窗口事件
     */
    var throughEvent = function (target, eventName, data, callBack, only, _win) {
        if (isEmpty(eventName) || isEmpty(callBack)) return;
        if (isEmpty(_win)) _win = win;
        if (target == 'document') target = _win.document;
        if (target == 'window') target = _win;
        eventName = eventName.trim();
        if (only == true) {
            var element = _win.$(target)[0];
            var isHad = isHadEvent(eventName, element, _win);
            if (!isHad) _win.$(target).on(eventName, data, callBack);
        } else {
            _win.$(target).on(eventName, data, callBack);
        }
        if (!_win.parent || _win == _win.parent) return;
        throughEvent(target, eventName, data, callBack, only, _win.parent);
    };
    /**
     * 检查是否已经绑定事件
     */
    var isHadEvent = function (eventName, element, _win) {
        if (isEmpty(eventName) || isEmpty(element)) return false;
        if (isEmpty(_win)) _win = windowFind(element).win;
        var events = _win.$._data(element, 'events');
        if (isEmpty(events)) return false;
        var name = eventName.split('.')[0];
        var nameSpace = eventName.replace(name + '.', '');
        if (!isEmpty(events[name])) {
            if (isEmpty(nameSpace) || (!isEmpty(nameSpace) && !isEmpty(skynetWhere(events[name], {namespace: nameSpace}, true))))
                return  true;
        }
        return false;
    }
    /**
     * 获得基础URL
     */
    var getBaseUrl = function () {
        var pathName = window.document.location.pathname,
            projectName = pathName.substring(0, pathName.substr(1).indexOf("/") + 1);
        return projectName;
    };
    /**
     * 获得组件基础路径
     */
    var getUIPath = function () {
        var uiPath = window.UIPath;
        if (isEmpty(uiPath)) {
            uiPath = getBaseUrl() + "/commmon";
            window.UIPath = uiPath
        }
        return uiPath;
    };
    /**
     * 元素大小改变事件
     * 使用 $(element).on("resizeElement",function(){...})
     */
    (function ($, h, c) {
        var a = $([]),
            e = $.resize = $.extend($.resize, {}),
            i,
            k = "setTimeout",
            j = "resizeElement",
            d = j + "-special-event",
            b = "delay",
            f = "throttleWindow";
        e[b] = (1000 / 24);
        e[f] = true;
        $.event.special[j] = {
            setup: function () {
                if (!e[f] && this[k]) {
                    return false;
                }
                var l = $(this);
                a = a.add(l);
                $.data(this, d, {
                    _w: l.width(),
                    _h: l.height(),
                    w: l.width(),
                    h: l.height()
                });
                if (a.length === 1) {
                    g();
                }
            },
            teardown: function () {
                if (!e[f] && this[k]) {
                    return false;
                }
                var l = $(this);
                a = a.not(l);
                l.removeData(d);
                if (!a.length) {
                    clearTimeout(i);
                }
            },
            add: function (l) {
                if (!e[f] && this[k]) {
                    return false;
                }
                var n;

                function m(s, o, p) {
                    var q = $(this),
                        r = $.data(this, d);
                    r.w = o !== c ? o : q.width();
                    r.h = p !== c ? p : q.height();
                    n.apply(this, arguments);
                }

                if ($.isFunction(l)) {
                    n = l;
                    return m;
                } else {
                    n = l.handler;
                    l.handler = m;
                }
            }
        };
        function g() {
            i = h[k](function () {
                    a.each(function () {
                        var n = $(this),
                            m = n.width(),
                            l = n.height(),
                            o = $.data(this, d);
                        o._w = o.w, o._h = o.h
                        if (m !== o.w || l !== o.h) {
                            n.trigger(j, [o.w = m, o.h = l]);
                        }
                    });
                    g();
                },
                e[b]);
        }
    })($, this);
    win.Reg_yyyy = "^\\d{1,4}($|年)";
    win.Reg_yyyyMM = "^\\d{1,4}(-|\/|\.|年)?([1-9]|[0][1-9]|[1][0-2])($|月)";
    win.Reg_yyyyMMdd = "^\\d{1,4}(-|\/|\.|年)?([1-9]|[0][1-9]|[1][0-2])(-|\/|\.|月)?([1-9]|[0][1-9]|[1-2][0-9]|[3][0-1])($|日)";
    win.Reg_yyyyMMddhh = "^\\d{1,4}(-|\/|\.|年)?([1-9]|[0][1-9]|[1][0-2])(-|\/|\.|月)?([1-9]|[0][1-9]|[1-2][0-9]|[3][0-1])([\\s]+|日)?([0-12]|0?[1-9]|1?[0-9]|2?[0-3])($|时)";
    win.Reg_yyyyMMddhhmm = "^\\d{1,4}(-|\/|\.|年)?([1-9]|[0][1-9]|[1][0-2])(-|\/|\.|月)?([1-9]|[0][1-9]|[1-2][0-9]|[3][0-1])([\\s]+|日)?([0-12]|0?[1-9]|1?[0-9]|2?[0-3])(:|时)?([0-5][0-9])($|分)";
    win.Reg_yyyyMMddhhmmss = "^\\d{1,4}(-|\/|\.|年)?([1-9]|[0][1-9]|[1][0-2])(-|\/|\.|月)?([1-9]|[0][1-9]|[1-2][0-9]|[3][0-1])([\\s]+|日)?([0-12]|0?[1-9]|1?[0-9]|2?[0-3])(:|时)?([0-5][0-9])(:|分)?([0-5][0-9])($|秒$)";
    win.Reg_hhmmss = "^([0-12]|0?[1-9]|1?[0-9]|2?[0-3])(:|时)?([0-5][0-9])(:|分)?([0-5][0-9])($|秒$)";
    win.Reg_hhmm = "^([0-12]|0?[1-9]|1?[0-9]|2?[0-3])(:|时)?([0-5][0-9])($|分$)";
    win.Reg_mmss = "^([0-5][0-9])(:|分)?([0-5][0-9])($|秒$)";
    win.Reg_timeWords = "(" + Reg_yyyy + ")|" + "(" + Reg_yyyyMM + ")|" + "(" + Reg_yyyyMMdd + ")|"
        + "(" + Reg_yyyyMMddhh + ")|" + "(" + Reg_yyyyMMddhhmm + ")|" + "(" + Reg_yyyyMMddhhmmss + ")|"
        + "(" + Reg_hhmmss + ")|" + "(" + Reg_hhmm + ")|" + "(" + Reg_mmss + ")";
    win.RegIsTime = new RegExp(win.Reg_timeWords);
    win.Date.prototype.format = format;
    win.String.prototype.trim = trim;
    win.isEmpty = isEmpty;
    win.clone = clone;
    win.skynetFind = skynetFind;
    win.skynetWhere = skynetWhere;
    win.equalsSimpleArray = equalsSimpleArray;
    win.getDataByKey = getDataByKey;
    win.windowFind = windowFind;
    win.getWindowBound = getWindowBound;
    win.getWindowPosition = getWindowPosition;
    win.throughEvent = throughEvent;
    win.getBaseUrl = getBaseUrl;
    win.getUIPath = getUIPath;
})(jQuery, window);