/*
 * skynetFloat
 * 跨iframe浮动层组件
 * Copyright (c) 2015 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil@163.com
 * Date: 2015-10-12
 */
/*基础工具方法*/
(function ($, win) {
    if (isEmpty(win.String.prototype.trim)) win.String.prototype.trim = function () {
        return $.trim(this);
    };
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
    if (isEmpty(win.windowFind)) win.windowFind = function (filter, _window) {
        if (!filter) return null;
        if (!_window) _window = window;
        var find = _window.$(_window.document).find(filter);
        if (find.length) return {element: find, win: _window};
        if (_window.parent && _window != _window.parent) {
            return windowFind(filter, _window.parent);
        }
    };
    if (isEmpty(win.getWindowBound)) win.getWindowBound = function (obj) {
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
    if (isEmpty(win.getWindowPosition))  win.getWindowPosition = function (element, site, _window) {
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
                scrollWidth = windowBound.width - Math.max(_window.document.body.clientWidth,_window.document.documentElement.clientWidth);
                scrollHeight = windowBound.height - Math.max(_window.document.body.clientHeight,_window.document.documentElement.clientHeight);
            }
            scrollLeft = (g.scrollLeft || f.scrollLeft) - i;
            scrollTop = (g.scrollTop || f.scrollTop) - h;
            scrollWidth=scrollWidth<0?0:scrollWidth;
            scrollHeight=scrollHeight<0?0:scrollHeight;
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
    if (isEmpty(win.throughEvent)) win.throughEvent = function (target, eventName, data, callBack, only, _win) {
        if (isEmpty(eventName) || isEmpty(callBack)) return;
        if (isEmpty(_win)) _win = win;
        if (target == 'document') target = _win.document;
        if (target == 'window') target = _win;
        eventName = eventName.trim();
        if (only == true) {
            var isHad = false;
            var element = _win.$(target)[0];
            var events = _win.$._data(element, 'events');
            if (!isEmpty(events)) {
                var name = eventName.split('.')[0];
                var nameSpace = eventName.replace(name + '.', '');
                if (!isEmpty(events[name])) {
                    if (isEmpty(nameSpace) || (!isEmpty(nameSpace) && !isEmpty(skynetWhere(events[name], {namespace: nameSpace}, true))))
                        isHad = true;
                }
            }
            if (!isHad) _win.$(target).on(eventName, data, callBack);
        } else {
            _win.$(target).on(eventName, data, callBack);
        }
        if (!_win.parent || _win == _win.parent) return;
        throughEvent(target, eventName, data, callBack, only, _win.parent);
    };
})(jQuery, window);
/*skynetFloat 夸window浮动层*/
(function ($, win) {
    var option = {
        id: null,
        data: null,
        float: null,
        target: null,
        isBorn: true,
        helper: {
            whichShow: 'click', //click focus mouseover
            whichHide: 'click', //click blur mouseleave
            _show: function (e) {
                var elementTarget = windowFind(e.currentTarget);
                var site = {left: e.pageX, top: e.pageY};
                if (elementTarget.win != win.top) {
                    site.left = site.left - elementTarget.win.document.body.scrollLeft;
                    site.top = site.top - elementTarget.win.document.body.scrollTop;
                    var element = elementTarget.win['frameElement'];
                    if (element && elementTarget.win.parent && elementTarget.win != elementTarget.win.parent)
                        site = getWindowPosition(element, site, elementTarget.win.parent);
                }
                var css = {}, _zIndex = 0, padding = 50;
                var pTop = site.top - win.top.document.body.scrollTop;
                var pLeft = site.left - win.top.document.body.scrollLeft;
                var viewBound = getWindowBound(win.top);
                var viewHeight = viewBound.height;
                var viewWidth = viewBound.width;
                var fullWidth = win.top.document.body.clientWidth;
                var fullHeight = win.top.document.body.clientHeight;
                if (win.top.$.browser['msie'] == true) {
                    fullWidth = win.top.document.documentElement.clientWidth;
                    fullHeight = win.top.document.documentElement.clientHeight;
                }
                if ((viewHeight / 2) < pTop) {
                    css['bottom'] = fullHeight - site.top;
                    css['top'] = 'auto';
                    css['maxHeight'] = pTop - padding;
                } else {
                    css['top'] = site.top;
                    css['bottom'] = 'auto';
                    css['maxHeight'] = viewHeight - pTop - padding;
                }
                if ((viewWidth / 2) < pLeft) {
                    css['right'] = fullWidth - site.left;
                    css['left'] = 'auto';
                    css['maxWidth'] = pLeft - padding;
                } else {
                    css['left'] = site.left;
                    css['right'] = 'auto';
                    css['maxWidth'] = viewWidth - pLeft - padding;
                }
                win.top.$(':visible').each(function () {
                    var zIndex = win.top.$(this).css('zIndex');
                    if (isEmpty(zIndex) || zIndex == 'auto') return true;
                    zIndex = parseInt(zIndex) || 0;
                    if (_zIndex < zIndex) _zIndex = zIndex;
                });
                if (_zIndex > 0)
                    css['zIndex'] = _zIndex + 36;
                else
                    css['zIndex'] = 4096;
                this.float.css(css);
            },
            _shown: function (e) {
                return true
            },
            hoverIn: null,
            hoverOut: null,
            show: null,
            shown: null,
            hide: null,
            hidden: null,
            eventLogic: function () {
                var _this = this, that = _this.option;
                $.each(that.helper.whichShow.split(','), function (i, event) {
                    that.target.on(event + '.skynetFloat', that, function (e) {
                        var opt = e.data;
                        var isShow = opt.float.is(':visible');
                        if (!isShow) {
                            _this.show.call(_this, opt, e);
                        } else if (isShow && opt.helper.whichHide.indexOf('click') > -1) {
                            _this.hide.call(_this, opt, e);
                        }
                    });
                });
                $.each(that.helper.whichHide.split(','), function (i, event) {
                    if (event == 'click') return true;
                    that.target.on(event + '.skynetFloat', that, function (e) {
                        _this.hide.call(_this, e.data, e);
                    });
                });
                that.float.hover($.proxy(that.helper.hoverIn, that), $.proxy(that.helper.hoverOut, that));
            }
        }
    };
    var hideFloat = function (e) {
        var that = this;
        setTimeout(function () {
            var _opts = win.top.$(that).data('data.skynetFloat');
            $.isArray(_opts) && $.each(_opts, function (i, _opt) {
                if (!(typeof _opt.helper.hide === 'function' && _opt.helper.hide.call(_opt, e) == false)) {
                    _opt.float.hide();
                    if (typeof _opt.helper.hidden === 'function') _opt.helper.hidden.call(_opt, e);
                }
            });
        }, 0);
    };
    var skynetFloat = function () {
        this.initTarget = function () {
            this.option.id = this.option.target.attr('data-skynetFloat');
            if (isEmpty(this.option.id)) {
                this.option.id = Math.uuid();
                this.option.target.attr('data-skynetFloat', this.option.id);
            }
        };
        this.initFloat = function () {
            this.option.float.hide();
            this.option.float.attr('data-skynetFloat', this.option.id);
            this.option.float.css('position', 'absolute');
        };
        this.loadFloat = function (opt) {
            win.top.$('body').append(opt.float);
            opt.float = win.top.$('body').find(opt.float);//非常重要 指向最外层实际浮动层
            var data = opt.float.data('data.skynetFloat') || [];
            data.push(opt);
            opt.float.data('data.skynetFloat', data);
        };
        this.show = function (opt, e) {
            if (win.top.$('body').find(opt.float).length < 1) this.loadFloat(opt);
            opt.helper._show.call(opt, e);
            if (!(typeof opt.helper.show === 'function' && opt.helper.show.call(opt, e) == false)) {
                opt.float.show();
                opt.helper._shown.call(opt, e);
                (typeof opt.helper.shown === 'function') && (opt.helper.shown.call(opt, e));
            }
        };
        this.hide = function (opt, e) {
            if (opt.float.is(':visible')) {
                if (!(typeof opt.helper.hide === 'function' && opt.helper.hide.call(opt, e) == false)) {
                    opt.float.hide();
                    if (typeof opt.helper.hidden === 'function') opt.helper.hidden.call(opt, e);
                }
            }
        };
        this.eventBind = function () {
            this.option.helper.eventLogic.call(this);
            var offParent = this.option.target.parent('*:first');
            if (!isEmpty(offParent)) {
                offParent = offParent[0];
                do {
                    var isOverFlow = ((offParent.offsetWidth - offParent.clientWidth) + (offParent.offsetHeight - offParent.clientHeight)) > 0;
                    isOverFlow == true && $(offParent).on('scroll.skynetFloat', function (e) {
                        win.top.$('[data-skynetFloat]:visible').each(function () {
                            hideFloat.call(this, e);
                        });
                    });
                    if (!isEmpty($(offParent).parent('*:first')))
                        offParent = $(offParent).parent('*:first')[0];
                    else
                        offParent = null;
                }
                while (offParent);
            }
        };
        this.init = function () {
            var that = this;
            var target = arguments[0];
            var opt = arguments[1];
            that.option = clone(option);
            that.option.target = target;
            $.extend(true, that.option, opt);
            that.initTarget();
            that.initFloat();
            if (that.option.isBorn == true) that.loadFloat(that.option);
            that.eventBind();
        };
        this.init.apply(this, arguments);
    };
    win.skynetFloat = win.skynetfloat = win.SkynetFloat = skynetFloat;
    if (!isEmpty($) && isEmpty($.fn.skynetFloat)) {
        $.fn.skynetFloat = function (method) {
            var that = $(this);
            if (typeof method === 'object' || isEmpty(method))
                skynetFloat(that, method);
            return that;
        };
    }
    throughEvent('document', 'mouseup.skynetFloat', null, function (e) {
        if ($(e.target).is('.ui-resizable-helper') || $(e.target).is('[data-resizeDesktop]')) return;
        var flag = false;
        var dom = $(e.target).filter('[data-skynetFloat]');
        if (dom.length > 0) flag = true;
        if (flag == false) dom = $(e.target).parents('[data-skynetFloat]');
        if (dom.length > 0) flag = true;
        var filter = '[data-skynetFloat]:visible';
        if (flag == true && !isEmpty(dom.attr('data-skynetFloat'))) {
            dom.each(function () {
                filter += '[data-skynetFloat!="' + $(this).attr('data-skynetFloat') + '"]';
            });
        }
        win.top.$(filter).each(function () {
            hideFloat.call(this, e);
        });
        e.stopPropagation();
    }, true);
    throughEvent('window', 'scroll.skynetFloat', null, function (e) {
        if (e.target.window == e.target || e.target instanceof Document)
            win.top.$('[data-skynetFloat]:visible').each(function () {
                hideFloat.call(this, e);
            });
    }, true);
    throughEvent('window', 'resize.skynetFloat', null, function (e) {
        if (e.target.window == e.target)
            win.top.$('[data-skynetFloat]:visible').each(function () {
                hideFloat.call(this, e);
            });
    }, true);
    $(win).on('unload.skynetFloat', function () {
        $('[data-skynetFloat]').each(function () {
            var fid = $(this).attr('data-skynetFloat');
            if (isEmpty(fid)) return true;
            win.top.$('[data-skynetFloat="' + fid + '"]').remove();
        });
    });
})($, window);
/*skynetRightMenu 右键菜单*/
(function ($, win) {
    var option = {
        float: null,
        data: null,
        hoverIn: null,
        hoverOut: null,
        show: null,
        shown: null,
        hide: null,
        hidden: null
    };
    var skynetRightMenu = function () {
        this.create = function (opt) {
            var rMenu = this;
            $.extend(true, rMenu.option, opt);
            if (isEmpty(rMenu.target) || isEmpty(rMenu.option.float)) return;
            win.top.$(win.top.document).find(rMenu.option.float).remove();
            var _helper = {
                hoverIn: rMenu.option.hoverIn,
                hoverOut: rMenu.option.hoverOut,
                show: rMenu.option.show,
                shown: rMenu.option.shown,
                hide: rMenu.option.hide,
                hidden: rMenu.option.hidden,
                eventLogic: function () {
                    var _this = this, that = _this.option;
                    that.target.attr('oncontextmenu', 'return false');
                    that.float.attr('oncontextmenu', 'return false');
                    that.target.on('mouseup.skynetFloat', that, function (e) {
                        var opt = e.data;
                        opt.float.remove();
                        if (e.button == 2)  _this.show.call(_this, opt, e);
                    });
                    that.float.hover($.proxy(that.helper.hoverIn, that), $.proxy(that.helper.hoverOut, that));
                }
            };
            rMenu.target.skynetFloat({
                float: rMenu.option.float,
                data: rMenu.option.data,
                helper: _helper,
                isBorn: false
            });
        };
        this.init = function () {
            var tar = arguments[0];
            if (typeof tar === 'string') {
                return $(tar).data('data.skynetRightMenu');
            } else {
                var $element = $(tar);
                if (isEmpty($element)) {
                    throw new Error('使用错误,请对正确的元素进行初始化！！');
                } else {
                    var _option = arguments[1];
                    var _id = isEmpty($element.attr('id')) ? Math.uuid() : $element.attr('id');
                    $element.attr('id', _id);
                    var that = this;
                    that.id = _id;
                    that.version = 1.0;
                    that.target = $element;
                    that.option = clone(option);
                    that.create.call(that, _option);
                    return this;
                }
            }
        };
        return this.init.apply(this, arguments);
    };
    win.skynetRightMenu = skynetRightMenu;
    if (!isEmpty($) && isEmpty($.fn.skynetRightMenu)) {
        $.fn.skynetRightMenu = function (method) {
            var that = $(this);
            if (typeof method === 'object' || isEmpty(method))
                skynetRightMenu(that, method);
            return that;
        };
    }
})(jQuery, window);
/*skynetComboBox 弹出菜单*/
(function ($, win) {
    var option = {
        float: null,
        data: null,
        hoverIn: null,
        hoverOut: null,
        show: null,
        shown: null,
        hide: null,
        hidden: null
    };
    var skynetComboBox = function () {
        this.create = function (opt) {
            var comboBox = this;
            $.extend(true, comboBox.option, opt);
            if (isEmpty(comboBox.target) || isEmpty(comboBox.option.float)) return;
            var _helper = {
                _show: function () {
                    var opt = this;
                    var ui = opt.data;
                    var css = {}, _handles = null, _zIndex = 0, dzIndex = 0, padding = 50;
                    var site = getWindowPosition(opt.target[0], {left: 0, top: 0, bottom: 0, right: 0}, win);
                    var borderWidth = (opt.target.outerHeight() - opt.target.innerHeight()) / 2;
                    var pTop = site.top + opt.target.height() - win.top.document.body.scrollTop;
                    var pLeft = site.left + opt.target.width() - win.top.document.body.scrollLeft;
                    var viewBound = getWindowBound(win.top);
                    var viewHeight = viewBound.height;
                    var viewWidth = viewBound.width;
                    if ((viewHeight / 2) < pTop) {
                        css['bottom'] = site.bottom + opt.target.height() + borderWidth;
                        css['top'] = 'auto';
                        css['maxHeight'] = pTop - opt.target.height() - padding;
                        css['borderRadius'] = '4px 4px 0px 0px';
                        _handles = 'n';
                    } else {
                        css['top'] = site.top + opt.target.height() + borderWidth;
                        css['bottom'] = 'auto';
                        css['maxHeight'] = viewHeight - pTop - padding;
                        css['borderRadius'] = '0px 0px 4px 4px';
                        _handles = 's';
                    }
                    if ((viewWidth / 2) < pLeft) {
                        css['right'] = site.right - ($.browser['msie'] == true && borderWidth) || 0;
                        css['left'] = 'auto';
                        css['maxWidth'] = pLeft - padding;
                        _handles += 'w';
                    } else {
                        css['left'] = site.left - ($.browser['msie'] == true && borderWidth) || 0;
                        css['right'] = 'auto';
                        css['maxWidth'] = viewWidth - pLeft + opt.target.width() - padding;
                        _handles += 'e';
                    }
                    switch (_handles) {
                        case 'sw':
                            css['boxShadow'] = 'inset 0px 0px 0px rgba(0, 0, 0, 0.075),-2px 2px 6px rgba(0, 0, 0, 0.085)';
                            break;
                        case 'se':
                            css['boxShadow'] = 'inset 0px 0px 0px rgba(0, 0, 0, 0.075),2px 2px 6px rgba(0, 0, 0, 0.085)';
                            break;
                        case 'ne':
                            css['boxShadow'] = 'inset 0px 0px 0px rgba(0, 0, 0, 0.075),2px -2px 6px rgba(0, 0, 0, 0.085)';
                            break;
                        case 'nw':
                            css['boxShadow'] = 'inset 0px 0px 0px rgba(0, 0, 0, 0.075),-2px -2px 6px rgba(0, 0, 0, 0.085)';
                            break;
                    }
                    win.top.$(':visible').each(function () {
                        var zIndex = win.top.$(this).css('zIndex');
                        if (isEmpty(zIndex) || zIndex == 'auto') return true;
                        zIndex = parseInt(zIndex) || 0;
                        if (zIndex > _zIndex) _zIndex = zIndex;
                    });
                    if (_zIndex > 0) {
                        var step = opt.float.css('zIndex');
                        if (isEmpty(step) || step == 'auto') step = 36;
                        else step = parseInt(step);
                        css['zIndex'] = _zIndex + step;
                        dzIndex = css['zIndex'] - 1;
                    }
                    if (ui.option.isReSize == true && typeof win.top.$.fn.resizable == 'function') {
                        opt.float.resizable({
                            handles: _handles,
                            ghost: true,
                            zIndex: css['zIndex'],
                            minWidth: parseInt(opt.target.width()),
                            minHeight: parseInt(opt.target.height()),
                            start: function (e, ui) {
                                ui.helper.children().css('overflow', 'hidden');
                                ui.helper.children().css('border', 'none');
                                ui.helper.css('border', '1px dotted #A5A5A5');
                                win.top.$('body').append(ui.helper);
                                if (dzIndex > 0) {
                                    var $desktop = $('<div data-resizeDesktop></div>');
                                    $desktop.css({top: 0, right: 0, bottom: 0, left: 0, zIndex: dzIndex, position: 'fixed'});
                                    win.top.$('body').append($desktop);
                                }
                            },
                            stop: function (e, ui) {
                                win.top.$('[data-resizeDesktop]').remove();
                            }
                        });
                        if (!isEmpty(opt.float.children('.ui-resizable-handle'))) {
                            var className = 'ui-resizable-handle';
                            className += ' ui-resizable-' + _handles;
                            className += ' skynetFloat-ReSize-' + _handles;
                            opt.float.children('.ui-resizable-handle').attr('class', className);
                        }
                        opt.float.css('resize', 'none');
                    } else if (ui.option.isReSize == true) {
                        opt.float.css('resize', 'both');
                    }
                    opt.float.css(css);
                },
                _shown: function () {
                    var opt = this;
                    if (isEmpty(opt.float.prop('initWidth'))) {
                        var _width = opt.target.width();
                        _width = _width - (parseInt(opt.float.css('paddingLeft')) || 0) - (parseInt(opt.float.css('paddingRight')) || 0);
                        opt.float.width(_width);
                        opt.float.prop('initWidth', opt.float.width());
                        opt.float.scroll(function () {
                            if ('auto' != opt.float.children('.ui-resizable-handle').css('top'))
                                opt.float.children('.ui-resizable-handle').css('top', opt.float[0].scrollTop);
                            if ('auto' != opt.float.children('.ui-resizable-handle').css('bottom'))
                                opt.float.children('.ui-resizable-handle').css('bottom', -opt.float[0].scrollTop);
                            if ('auto' != opt.float.children('.ui-resizable-handle').css('left'))
                                opt.float.children('.ui-resizable-handle').css('left', opt.float[0].scrollLeft);
                            if ('auto' != opt.float.children('.ui-resizable-handle').css('right'))
                                opt.float.children('.ui-resizable-handle').css('right', -opt.float[0].scrollLeft);
                        });
                    }
                },
                hoverIn: comboBox.option.hoverIn,
                hoverOut: comboBox.option.hoverOut,
                show: comboBox.option.show,
                shown: comboBox.option.shown,
                hide: comboBox.option.hide,
                hidden: comboBox.option.hidden,
                eventLogic: function () {
                    var _this = this, that = _this.option;
                    that.target.on('click.skynetFloat', that, function (e) {
                        var opt = e.data;
                        var isShow = opt.float.is(':visible');
                        if (!isShow) {
                            _this.show.call(_this, opt, e);
                        } else {
                            _this.hide.call(_this, opt, e);
                        }
                    });
                    that.float.hover($.proxy(that.helper.hoverIn, that), $.proxy(that.helper.hoverOut, that));
                }
            };
            comboBox.target.skynetFloat({
                float: comboBox.option.float,
                data: comboBox.option.data,
                helper: _helper
            });
        };
        this.init = function () {
            var tar = arguments[0];
            if (typeof tar === 'string') {
                return $(tar).data('data.skynetComboBox');
            } else {
                var $element = $(tar);
                if (isEmpty($element)) {
                    throw new Error('使用错误,请对正确的元素进行初始化！！');
                } else {
                    var _option = arguments[1];
                    var _id = isEmpty($element.attr('id')) ? Math.uuid() : $element.attr('id');
                    $element.attr('id', _id);
                    var that = this;
                    that.id = _id;
                    that.version = 1.0;
                    that.target = $element;
                    that.option = clone(option);
                    that.create.call(that, _option);
                    return this;
                }
            }
        };
        return this.init.apply(this, arguments);
    };
    win.skynetComboBox = skynetComboBox;
    if (!isEmpty($) && isEmpty($.fn.skynetComboBox)) {
        $.fn.skynetComboBox = function (method) {
            var that = $(this);
            if (typeof method === 'object' || isEmpty(method))
                skynetComboBox(that, method);
            return that;
        };
    }
})(jQuery, window);