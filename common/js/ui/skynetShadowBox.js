/*
 * skynetShadowBox
 * 遮罩框组件
 * Copyright (c) 2014 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil.@163.com
 * Date: 2014-12-27
 */
(function ($, win) {
    if (undefined == win.isEmpty || null == win.isEmpty) win.isEmpty = function (obj) {
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
    if (isEmpty(win.clone))win.clone = function (obj) {
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
    if (isEmpty(win.String.prototype.trim)) win.String.prototype.trim = function () {
        return $.trim(this);
    };
})(jQuery, window);
(function ($, win) {
    var option = {
        id: null,
        zIndex: null,
        initShow: false,
        shadow: '<div class="skynetShadow" ></div>',//默认黑透明:skynetShadow,白色遮罩：skynetShadowWhite
        shadowMsg: null,
        show: null,
        shown: null,
        hide: null,
        hidden: null
    };
    var methods = {
        init: function (opt) {
            var that = this, thatOpt = null;
            if (that[0].window == that[0]) that = that[0].$(that[0].document);
            if (!isEmpty(that.data("sknyetShadowBox"))) {
                thatOpt = that.data("sknyetShadowBox");
                if (!isEmpty(opt)) {
                    $.extend(true, thatOpt, opt);
                    methods.hide.call(that);
                    handle.initElements.call(that, thatOpt);
                }
            } else {
                thatOpt = clone(option);
                $.extend(true, thatOpt, opt);
                handle.initElements.call(that, thatOpt);
            }
            this.data("sknyetShadowBox", thatOpt);
            if (thatOpt.initShow === true)
                methods.show.call(that);
        },
        show: function () {
            var that = this;
            if (that[0].window == that[0]) that = that[0].$(that[0].document);
            var opt = that.data("sknyetShadowBox");
            if (isEmpty(opt.shadow)) return false;
            var zIndex = opt.zIndex > 0 ? opt.zIndex : handle.getTopzIndex();
            opt.shadow.css('zIndex', zIndex + 1);
            !isEmpty(opt.shadowMsg) && opt.shadowMsg.css('zIndex', zIndex + 2);
            if (typeof opt.show == "function" && opt.show.call(that) == false) return false;
            var top = that.scrollTop();
            var left = that.scrollLeft();
            if (!(that.is('body') || that[0] instanceof Document)) {
                that.data('position.prop', that.css('position'));
                if (that.css('position') == 'static') that.css('position', 'relative');
            }
            that.on('mousewheel.sknyetShadowBox', function () {
                return false;
            });
            that.on('mousedown.sknyetShadowBox', function (e) {
                if (e.target == this.documentElement || e.target == win.top.$('body')[0] || e.target == $(this)[0]) return false;
            });
            that.on('scroll.sknyetShadowBox', function () {
                $(this).scrollTop(top).scrollLeft(left);
            });
            opt.shadow.show();
            if (!isEmpty(opt.shadowMsg)) {
                opt.shadowMsg.show();
                opt.shadowMsg.css('top', (opt.shadow.height() - opt.shadowMsg.height()) / 2);
                opt.shadowMsg.css('left', (opt.shadow.width() - opt.shadowMsg.width()) / 2);
            }
            if (typeof opt.shown == "function") opt.shown.call(this);
        },
        hide: function () {
            var that = this;
            if (that[0].window == that[0]) that = that[0].$(that[0].document);
            var opt = that.data("sknyetShadowBox");
            if (isEmpty(opt.shadow)) return false;
            if (typeof opt.hide == "function" && opt.hide.call(this) == false) return false;
            if (!isEmpty(that.data('position.prop'))) that.css('position', that.data('position.prop'));
            that.off('.sknyetShadowBox');
            opt.shadow.hide();
            if (!isEmpty(opt.shadowMsg)) opt.shadowMsg.hide();
            if (typeof opt.hidden == "function") opt.hidden.call(this);
        }
    };
    var handle = {
        getTopzIndex: function () {
            var _zIndex = 0;
            win.top.$(':visible').each(function () {
                var zIndex = win.top.$(this).css('zIndex');
                if (isEmpty(zIndex) || zIndex == 'auto') return true;
                zIndex = parseInt(zIndex) || 0;
                if (_zIndex < zIndex) _zIndex = zIndex;
            });
            return _zIndex;
        },
        initElements: function (opt) {
            var that = this;
            if (this[0] instanceof Document) that = this.find('body');
            var sid = isEmpty(opt.id) ? Math.uuid() : opt.id, $shadow = $(opt.shadow);
            $shadow.attr("data-sknyetShadowBox", sid);
            $shadow.hide();
            if (!isEmpty(opt.shadowMsg)) {
                var $shadowMsg = $(opt.shadowMsg);
                $shadowMsg.attr("data-sknyetShadowBox", sid);
                $shadowMsg.hide();
                that.append($shadowMsg);
                opt.shadowMsg = $shadowMsg;
            }
            that.append($shadow);
            opt.shadow = $shadow;
            if (!isEmpty(opt.shadowMsg)) {
                var eventName = 'resizeElement.sknyetShadowBox';
                if ($shadow[0].window == $shadow[0]) eventName = 'resize.sknyetShadowBox';
                $shadow.on(eventName, function () {
                    if (!isEmpty(opt.shadowMsg) && opt.shadow.is(':visible') && opt.shadowMsg.is(':visible')) {
                        opt.shadowMsg.css('top', (opt.shadow.height() - opt.shadowMsg.height()) / 2);
                        opt.shadowMsg.css('left', (opt.shadow.width() - opt.shadowMsg.width()) / 2);
                    }
                });
            }
        }
    };
    $.fn.skynetShadowBox = function (method) {
        var argArray = Array.prototype.slice.call(arguments, 1),
            args = arguments;
        return this.each(function () {
            var flag = !(isEmpty($(this).data("sknyetShadowBox")));
            if (flag === true && methods[method]) {
                methods[method].apply($(this), argArray);
            } else if (typeof method === 'object' || !method) {
                methods.init.apply($(this), args);
            }
        });
    };
})(jQuery, window);

window.createMsgShadow = function (element, cfg) {
    var opt = {
        shadow: '<div class="skynetShadowBox-Wait-Shadow"></div>',
        shadowMsg: '<div class="skynetShadowBox-Wait-Msg"></div>'
    };
    var config = $.extend(true, cfg, opt);
    element.skynetShadowBox(config);
};