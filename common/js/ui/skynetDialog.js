/*
 * skynetDialog
 * drag功能 依赖于jqueryUI 中draggable
 * resize功能 依赖于jqueryUI 中resizable
 * Copyright (c) 2014 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil.@163.com
 * Date: 2015-11-23
 */
/*基础工具方法*/
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
/*对话框*/
(function ($, win) {
    var dialogHTML =
        '<div name="dialog-wrap" data-skynetDialog class="skynetDialog-wrap">'
            + '<div name="dialog-head" class="skynetDialog-head skynetBlue">'
            + '<button name="dialog-close" type="button" class="skynetDialog-close">'
            + '<i name="closeI" class="icofont-remove white font-18"></i>'
            + '</button>'
            + '<h3 name="dialog-title" class="skynetDialog-title" ></h3>'
            + '</div>'
            + '<div name="dialog-box" style="position:relative;">'
            + '<div name="dialog-body" class="skynetDialog-body"></div>'
            + '<div name="dialog-foot" class="skynetDialog-foot"></div>'
            + '<div name="dialog-shadow"></div>'
            + '<div name="dialog-wait"></div>'
            + '</div>'
            + '</div>';
    var option = {
        id: null,
        content: null,                        // 对话框内容
        title: "消息",						  // 标题. 默认'消息'
        isCloseBtn: true,					  // 标题. 旁边的关闭按钮
        isShadow: true,                       // 是否需要遮罩
        button: null,						  // 自定义按钮
        ok: null,							  // 确定按钮回调函数
        cancel: null,						  // 取消按钮回调函数
        okText: "确定",						  // 确定按钮文本. 默认"确定"
        cancelText: "取消",					  // 取消按钮文本. 默认"取消"
        width: "auto",						  // 内容宽度
        height: null,						  // 内容高度
        minWidth: 250,						  // 最小宽度限制
        minHeight: 150,						  // 最小高度限制
        init: null,							  // 对话框初始化后执行的函数
        shown: null,						  // 对话框显示后执行的函数
        close: null,						  // 对话框关闭前执行的函数
        foot: true,							  // 是否包含页脚
        initShow: true,						  // 初始化后是否显示对话框
        resize: false,						  // 是否允许用户调节尺寸
        drag: true 							  // 是否允许用户拖动位置
    };
    var skynetDialog = function (config, ok, cancel) {
        var api = null;
        if (!isEmpty(config) && !isEmpty(config.id)) api = skynetDialog.get(config.id);
        if (!isEmpty(api)) return api.zIndex().focus();
        this.option = clone(option);
        $.extend(true, this.option, config);
        !isEmpty(ok) && (this.option.ok = ok);
        !isEmpty(cancel) && (this.option.cancel = cancel);
        isEmpty(this.option.id) && (this.option.id = Math.uuid());
        return new skynetDialog.fn.init(this.option);
    };
    skynetDialog.focus = null;
    skynetDialog.top = win.top;
    !skynetDialog.top.skynetDialog && (skynetDialog.top.skynetDialog = skynetDialog);
    !skynetDialog.top.skynetDialog.cache && (skynetDialog.top.skynetDialog.cache = {});
    skynetDialog.data = function (name, value) {
        var top = skynetDialog.top,
            cache = top['skynetDialog.DATA'] || {};
        top['skynetDialog.DATA'] = cache;
        if (!isEmpty(name) && value !== undefined) {
            cache[name] = value;
        } else if (!isEmpty(name) && value === undefined) {
            return cache[name];
        }
        return cache;
    };
    skynetDialog.removeData = function (name) {
        var cache = skynetDialog.top['skynetDialog.DATA'];
        if (cache && cache[name]) delete cache[name];
    };
    skynetDialog.save = function (key, value) {
        if (!isEmpty(key)) skynetDialog.top.skynetDialog.cache[key] = value;
    };
    skynetDialog.get = function (id) {
        return isEmpty(id) ? skynetDialog.top.skynetDialog.cache : skynetDialog.top.skynetDialog.cache[id];
    };
    skynetDialog.fn = skynetDialog.prototype = {
        init: function (option) {
            this.closed = false;
            this.option = option;
            this.buttonCache = {};
            this.DOM = this.getDOM();
            this.title(this.option.title);
            this.closeBtn(this.option.isCloseBtn);
            this.content(this.option.content);
            this.foot(this.option.foot);
            this.button(this.option.button);
            this.size(this.option.width, this.option.height);
            this.create();
            return this;
        },
        getDOM: function () {
            var id = this.option.id;
            var wrap = $(dialogHTML);
            $(wrap).attr('id', id);
            return {
                dialog: $(wrap),
                head: $(wrap).find('div[name="dialog-head"]'),
                close: $(wrap).find('[name="dialog-close"]'),
                title: $(wrap).find('[name="dialog-title"]'),
                box: $(wrap).find('div[name="dialog-box"]'),
                body: $(wrap).find('div[name="dialog-body"]'),
                foot: $(wrap).find('div[name="dialog-foot"]'),
                shadow: $(wrap).find('div[name="dialog-shadow"]'),
                wait: $(wrap).find('div[name="dialog-wait"]')
            };
        },
        title: function (text) {
            var title = this.DOM.title;
            if (!isEmpty(text) && typeof text != 'boolean') {
                title.html(text).show(0);
            } else {
                title.html("").hide();
            }
            return this;
        },
        closeBtn: function (flag) {
            var that = this, close = that.DOM.close;
            close.on('click.skynetDialog', function () {
                that.close()
            })
            if (flag === false) {
                close.hide();
            } else {
                close.show(0);
            }
            return this;
        },
        content: function (_content) {
            var $body = this.DOM.body;
            if (_content instanceof HTMLElement) {
                _content.style.display = 'inline-block';
                $body.append(_content);
            } else if (_content instanceof jQuery && _content.length > 0) {
                _content.css("display", "inline-block");
                $body.append(_content);
            } else if (typeof _content === "string") {
                $body.html(_content);
            }
            $body.show(0);
            return this;
        },
        foot: function (flag) {
            var foot = this.DOM.foot;
            if (flag === false) {
                foot.hide();
            } else {
                if (flag instanceof HTMLElement) {
                    flag.style.display = 'inline-block';
                    foot.append(flag);
                } else if (flag instanceof jQuery && flag.length > 0) {
                    flag.css("display", "inline-block");
                    foot.append(flag);
                } else if (typeof flag === "string") {
                    foot.html(flag);
                }
                foot.show(0);
            }
            return this;
        },
        button: function (buttons) {
            var that = this;
            var foot = this.DOM.foot;
            if (isEmpty(buttons)) buttons = [];
            var id = this.option.id;
            var ok = this.option.ok;
            var cancel = this.option.cancel;
            var okText = this.option.okText;
            var cancelText = this.option.cancelText;
            ok && buttons.push({
                id: id + "_btnOk",
                text: okText,
                click: function () {
                    if (typeof ok === 'function' && ok.apply(this, arguments) == false)
                        return;
                    this.close();
                },
                className: "btn btn-ensure icofont-share-alt btn-sm"//TODO killer bootstrap
            });
            cancel && buttons.push({
                id: id + "_btnCancel",
                text: cancelText,
                click: function () {
                    if (typeof cancel === 'function' && cancel.apply(this, arguments) == false)
                        return;
                    this.close();
                },
                className: "btn btn-cancel icofont-undo btn-sm"//TODO killer bootstrap
            });
            if (isEmpty(buttons)) return;
            $.each(buttons, function (i, newBTN) {
                if (isEmpty(newBTN)) return true;
                var button = newBTN, isNew = true;
                isEmpty(newBTN.id) && (newBTN.id = Math.uuid());
                var $button = that.buttonCache[newBTN.id];
                if (isEmpty($button)) {
                    $button = $(document.createElement("button"))
                } else {
                    isNew = false;
                }
                isEmpty($button) && ($button = $(document.createElement("button")));
                if (!isEmpty(newBTN.attr)) {
                    for (var key in newBTN.attr) {
                        if (isEmpty(key) || !newBTN.attr.hasOwnProperty(key)) continue;
                        $button.attr(key, newBTN.attr[key]);
                    }
                }
                $button.attr('id', newBTN.id);
                $button.attr('type', 'button');
                $button.html(newBTN.text);
                !isEmpty(newBTN.className) && $button.attr('class', newBTN.className);
                $button.off('.skynetDialog');
                typeof newBTN.click === 'function' && $button.on('click.skynetDialog', $.proxy(newBTN.click, that));
                typeof newBTN.focus === 'function' && $button.on('focus.skynetDialog', $.proxy(newBTN.focus, that));
                typeof newBTN.blur === 'function' && $button.on('blur.skynetDialog', $.proxy(newBTN.blur, that));
                if (isNew) {
                    foot.append($button);
                    that.buttonCache[newBTN.id] = $button;
                }
            });
            return this;
        },
        size: function (width, height) {
            var blankSize = 35;
            var winSize = getWindowBound(win.top);
            var maxWidth = winSize.width - (blankSize * 2);
            var maxHeight = winSize.height - (blankSize * 2);
            var DOM = this.DOM;
            DOM.dialog.css({'maxWidth': maxWidth, 'maxHeight': maxHeight});
            !isEmpty(width) && DOM.dialog.css('width', width);
            !isEmpty(height) && height != 'auto' && DOM.dialog.css('height', height);
            if (DOM.dialog.is(':visible')) {
                var headHeight = (this.option.head === false ? 0 : DOM.head.outerHeight(true));
                var footHeight = (this.option.foot === false ? 0 : DOM.foot.outerHeight(true));
                var _height = DOM.dialog.innerHeight();
                _height = _height - (parseInt(DOM.dialog.css('paddingTop'))) || 0;
                _height = _height - (parseInt(DOM.dialog.css('paddingBottom'))) || 0;
                _height = _height - (parseInt(DOM.body.css('paddingTop'))) || 0;
                _height = _height - (parseInt(DOM.body.css('paddingBottom'))) || 0;
                _height = _height - headHeight - footHeight;
                _height <= 0 ? _height = 40 : null;
                DOM.body.height(_height);
            }
            return this;
        },
        zIndex: function () {
            var DOM = this.DOM;
            var _zIndex = parseInt(DOM.dialog.css('zIndex')) || 0;
            win.top.$(':visible').each(function () {
                var $this = win.top.$(this);
                if ($this[0] != DOM.dialog[0]) {
                    var zIndex = win.top.$(this).css('zIndex');
                    if (isEmpty(zIndex) || zIndex == 'auto') return true;
                    zIndex = parseInt(zIndex) || 0;
                    if (zIndex > _zIndex) _zIndex = zIndex;
                }
            });
            if (_zIndex != parseInt(DOM.dialog.css('zIndex')) || parseInt(DOM.dialog.css('zIndex')) == 0) _zIndex = _zIndex + 36;
            DOM.dialog.css('zIndex', _zIndex);
            skynetDialog.focus = this;
            return this;
        },
        site: function () {
            var DOM = this.DOM;
            if (DOM.dialog.is(':visible')) {
                var width = DOM.dialog.outerWidth(true);
                var height = DOM.dialog.outerHeight(true);
                var winSize = getWindowBound(win.top);
                var left = (winSize.width - width) / 2;
                var top = (winSize.height - height) / 2;
                top = (top - winSize.height / 10) > 36 ? (top - winSize.height / 10) : 36;
                DOM.dialog.css({'left': left, 'top': top});
            }
            return this;
        },
        create: function () {
            if (isEmpty(this.DOM)) return this;
            var that = this,
                dialog = that.DOM.dialog,
                isDrag = that.option.drag,
                isReSize = that.option.resize,
                initShow = that.option.initShow,
                $winBody = skynetDialog.top.$("body");
            var minWidth = 250;
            var minHeight = 150;
            if (!isEmpty(that.option.minWidth) && that.option.minWidth != 'auto' && parseInt(that.option.minWidth) > 250)
                minWidth = parseInt(that.option.minWidth);
            if (!isEmpty(that.option.minHeight) && that.option.minHeight != 'auto' && parseInt(that.option.minHeight) > 150)
                minHeight = parseInt(that.option.minHeight);
            dialog.css({'minWidth': minWidth, 'minHeight': minHeight}).hide();
            that.DOM.close.off('.skynetDialog');
            that.DOM.close.on("click.skynetDialog", that, function (e) {
                var that = e.data;
                if (!isEmpty(that)) that.close();
            });
            if (isDrag == true) {
                dialog.draggable({scroll: false, handle: that.DOM.head});
            }
            if (isReSize == true) {
                dialog.resizable({
                    handles: 'se',
                    ghost: true,
                    minWidth: minWidth,
                    minHeight: minHeight,
                    maxWidth: function () {
                        return dialog.css('maxWidth')
                    },
                    maxHeight: function () {
                        return dialog.css('maxHeight')
                    },
                    start: function (e, ui) {
                        ui.helper.find('div[name="dialog-box"]').css('visibility', 'hidden');
                    },
                    stop: function (e, ui) {
                        var headHeight = (that.option.head === false ? 0 : that.DOM.head.outerHeight(true));
                        var footHeight = (that.option.foot === false ? 0 : that.DOM.foot.outerHeight(true));
                        var _height = that.DOM.dialog.innerHeight();
                        _height = _height - headHeight - footHeight - 30;
                        _height <= 0 ? _height = 40 : null;
                        that.DOM.body.height(_height);
                    }
                });
                if (!isEmpty(dialog.children('.ui-resizable-handle'))) {
                    var className = 'ui-resizable-handle';
                    className += ' ui-resizable-se';
                    className += ' skynetFloat-ReSize-se';
                    dialog.children('.ui-resizable-handle').attr('class', className);
                }
            }
            if (typeof that.option.init === 'function' && that.option.init.call(that, win) === false) return that;
            skynetDialog.save(that.option.id, that);
            $winBody.append(dialog);
            initShow == true && that.show();
            return this;
        },
        loadingShadow: function (flag) {
            if (isEmpty(this.DOM) || isEmpty(this.DOM.shadow)) return this;
            var $shadow = this.DOM.shadow;
            var $wait = this.DOM.wait;
            if (flag == true) {
                !$shadow.hasClass('skynetDialogShadow-Inner') && $shadow.addClass('skynetDialogShadow-Inner');
                !$wait.hasClass('skynetDialogShadow-Wait') && $wait.addClass('skynetDialogShadow-Wait');
                $wait.css({left: ($shadow.width() - $wait.width()) / 2, top: ($shadow.height() - $wait.height()) / 2});
            } else if (flag == false) {
                $shadow.removeClass('skynetDialogShadow-Inner');
                $wait.removeClass('skynetDialogShadow-Wait');
                $wait.removeAttr('style');
            } else {
                if ($shadow.hasClass('skynetDialogShadow-Inner')) {
                    $shadow.removeClass('skynetDialogShadow-Inner');
                } else {
                    $shadow.addClass('skynetDialogShadow-Inner');
                }
                if ($wait.hasClass('skynetDialogShadow-Wait')) {
                    $wait.removeClass('skynetDialogShadow-Wait');
                    $wait.removeAttr('style');
                } else {
                    $wait.addClass('skynetDialogShadow-Wait');
                    $wait.css({left: ($shadow.width() - $wait.width()) / 2, top: ($shadow.height() - $wait.height()) / 2});
                }
            }
            return this;
        },
        show: function () {
            if (isEmpty(this.DOM) || isEmpty(this.option)) return this;
            this.zIndex().focus().DOM.dialog.css('position', '').show();
            this.size(this.option.width, this.option.height);
            this.site();
            if (win.top.$('body>div.skynetDialogShadow-Screen:visible').length <= 0) {
                win.top.$(win.top.document).off('mousewheel.sknyetDialog');
                win.top.$(win.top.document).off('mousedown.sknyetDialog');
                win.top.$(win.top.document).off('scroll.sknyetDialog');
                var top = win.top.$(win.top.document).scrollTop();
                var left = win.top.$(win.top.document).scrollLeft();
                win.top.$(win.top.document).on('mousewheel.sknyetDialog', function (e) {
                	if (e.target == this.documentElement || e.target == win.top.$('body')[0]||e.target == win.top.document) 
                		return false;
                });
                win.top.$(win.top.document).on('mousedown.sknyetDialog', function (e) {
                    if (e.target == this.documentElement || e.target == win.top.$('body')[0]||e.target == win.top.document) 
                    	return false;
                });
                win.top.$(win.top.document).on('scroll.sknyetDialog', function (e) {
                	if (e.target == this.documentElement || e.target == win.top.$('body')[0]||e.target == win.top.document)
                		$(this).scrollTop(top).scrollLeft(left);
                });
            }
            var isShadow = this.option.isShadow;
            if (isShadow == true) {
                var sid = this.option.id + '_DialogShadow';
                var $shadow = win.top.$("body").find('#' + sid);
                if ($shadow.length <= 0) {
                    $shadow = $('<div></div>');
                    $shadow.attr('id', sid);
                    win.top.$("body").append($shadow);
                }
                $shadow.is('.skynetDialogShadow-Screen') == false && $shadow.addClass("skynetDialogShadow-Screen");
                $shadow.css('zIndex', parseInt(this.DOM.dialog.css('zIndex')) - 1);
            }
            if (typeof this.option.shown === 'function')
                this.option.shown.call(this, win);
            return this;
        },
        hide: function () {
            if (isEmpty(this.DOM)) return this;
            this.DOM.dialog.hide();
            var sid = this.option.id + '_DialogShadow';
            var $shadow = win.top.$("body").find('#' + sid);
            if ($shadow.length > 0) $shadow.remove();
            if (win.top.$('body>div.skynetDialogShadow-Screen:visible').length <= 0) {
                win.top.$(win.top.document).off('mousewheel.sknyetDialog');
                win.top.$(win.top.document).off('mousedown.sknyetDialog');
                win.top.$(win.top.document).off('scroll.sknyetDialog');
            }
            return this;
        },
        close: function () {
            if (isEmpty(this) || this.closed) return this;
            var closeFn = null;
            if (!isEmpty(this.option) && !isEmpty(this.option.close)) closeFn = this.option.close;
            if (typeof closeFn === "function" && closeFn.call(this, win) === false) return this;
            this.hide();
            if (skynetDialog.focus === this) skynetDialog.focus = null;
            if (!isEmpty(this.option) && !isEmpty(this.option.id) && !isEmpty(skynetDialog.get(this.option.id)))
                delete skynetDialog.top.skynetDialog.cache[this.option.id];
            if (!isEmpty(this.DOM) && !isEmpty(this.DOM.dialog)) this.DOM.dialog.remove();
            for (var key in this) {
                if (this.hasOwnProperty(key)) delete this[key];
            }
            this.closed = true;
            return this;
        },
        focus: function () {
            if (this.DOM.dialog.is(':visible')) {
                var element = null;
                if (this.DOM.head.is(':visible')) element = this.DOM.head;
                else if (this.DOM.title.is(':visible')) element = this.DOM.title;
                else if (this.DOM.close.is(':visible')) element = this.DOM.close;
                else if (this.DOM.body.is(':visible')) element = this.DOM.body;
                else if (this.DOM.foot.is(':visible')) element = this.DOM.foot;
                else element = this.DOM.dialog;
                if (!isEmpty(element)) element.focus();
            }
            skynetDialog.focus = this;
            return this;
        }
    };
    skynetDialog.fn.init.prototype = skynetDialog.fn;
    skynetDialog.top.$(skynetDialog.top).on("unload.skynetDialog", function () {
        var cache = skynetDialog.get();
        for (var id in cache) {
            var dialog = cache[id];
            if (!isEmpty(dialog)) dialog.close();
        }
    });
    win.skynetDialog = skynetDialog;
    $.fn.skynetDialog = function (method) {
        var argArray = Array.prototype.slice.call(arguments, 1),
            $this = $(this);
        if (typeof method === 'object') {
            if (isEmpty(method['content'])) method['content'] = $this;
            return skynetDialog(method);
        } else if (!method) {
            return skynetDialog({content: $this});
        } else if (typeof method === 'string' && skynetDialog[method]) {
            if (skynetDialog[method] === 'function')
                return skynetDialog[method].apply($this, argArray);
            return skynetDialog[method];
        }
    };
    if (!win.top.skynetDialog) {
        win.top.skynetDialog = skynetDialog;
        win.top.$.fn.skynetDialog = function (method) {
            var argArray = Array.prototype.slice.call(arguments, 1),
                $this = $(this);
            if (typeof method === 'object') {
                if (isEmpty(method['content'])) method['content'] = $this;
                return skynetDialog(method);
            } else if (!method) {
                return skynetDialog({content: $this});
            } else if (typeof method === 'string' && skynetDialog[method]) {
                if (skynetDialog[method] === 'function')
                    return skynetDialog[method].apply($this, argArray);
                return skynetDialog[method];
            }
        };
    }
})(jQuery, window);
/*跨框架对话框*/
(function ($, win, skynetDialog) {
    var _requestCode = 200,
        _top = skynetDialog.top, _topDialog = _top.skynetDialog,
        _open = "skynetDialog.OPEN",
        _opener = "skynetDialog.OPENER",
        _winId = win.skynetDialogWinId = win.skynetDialogWinId || "skynetDialog.WINID" + Math.uuid();
    skynetDialog.through = function () {
        return _topDialog.apply(this, arguments);
    };
    skynetDialog.open = function (url, options, cache) {
        if (isEmpty(url)) return this;
        if (cache === false)  url += (/\?/.test(url) ? "&" : "?") + "_t=" + Math.random();
        options = options || {};
        if (isEmpty(options['id'])) options['id'] = 'OPEN' + Math.uuid();
        var dialog = null;
        var iframe = _top.document.createElement("iframe");
        var $iframe = _top.$(iframe);
        iframe.src = url;
        iframe.id = options['id'];//这里的iframe.name会随着window创建而赋值到window上
        iframe.style.cssText = 'position:absolute;left:-9999em;top:-9999em;width:100%;height:100%;border:none 0;background:transparent';
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("framespacing", "0");
        iframe.setAttribute("allowTransparency", "true");
        var _init = options.init;
        var _close = options.close;
        var _initShow = isEmpty(options.initShow) ? true : options.initShow;
        options.initShow = false;
        options.content = $iframe;
        options.init = function () {
            var $box = this.DOM.box;
            var $body = this.DOM.body;
            $box.css('position', 'absolute');
            $body.css('position', 'absolute');
        };
        options.close = function () {
            var $iframe = this.DOM.body.find('iframe');
            var iwin = $iframe[0].contentWindow;
            if (typeof _close === 'function' && _close.call(this, iwin) == false) return false;
            $iframe[0].src = "about:blank";
            $iframe.css("display", "none").off(".skynetDialog");
            $iframe.remove();
            skynetDialog.removeData($iframe[0].id + _open);
            skynetDialog.removeData($iframe[0].id + _opener);
        };
        $iframe.one('load.skynetDialog', function () {
            var iwin = iframe.contentWindow;
            var idoc = iwin.document.documentElement;
            var ibody = iwin.document.body;
            var width = options.width, _width = 0, _height = 0;
            var height = options.height;
            if (isEmpty(width) || width == 'auto' || isEmpty(height) || height == 'auto') {
                if (_requestCode != 200) {
                    _width = 630 - 17;
                    _height = 430 - 17;
                } else {
                    _width = width;
                    _height = height;
                    debugger;
                    var _iwidth = ibody.offsetWidth || ibody.clientWidth || idoc.offsetWidth || idoc.clientWidth;
                    var _iheight = ibody.offsetHeight || ibody.clientHeight || idoc.offsetHeight || idoc.clientHeight;
                    if (isEmpty(width) || width == 'auto') _width = _iwidth;
                    if (isEmpty(height) || height == 'auto') _height = _iheight;
                    _width = _width + 30;
                    _height = _height + 30;
                }
            } else {
                _width = parseInt(width) - 30 - 17;
                _height = parseInt(height) - 30 - 17;
            }
            options.width = _width + 17;
            options.height = _height + 17;
            dialog.option.width = options.width;
            dialog.option.height = options.height;
            !!ibody && (ibody.style.overflow = 'auto');
            !!ibody && (ibody.style.margin = '0 auto');
            dialog.DOM.box.css('position', 'relative');
            dialog.DOM.body.css('position', '');
            iframe.style.cssText = 'width:100%;height:100%;border:none 0';
            if (_initShow == true) dialog.show();
        });
        _top.$.ajax({
            url: url,
            type: 'POST',
            cache: false,
            complete: function (XMLHttpRequest, textStatus) {
                _requestCode = XMLHttpRequest.status;
                if (_requestCode != 200)  options['foot'] = false;
                dialog = skynetDialog.through(options);
                var iwin = iframe.contentWindow;
                if (typeof _init === 'function' && _init.call(dialog, iwin) == false) {
                    dialog.close();
                } else {
                    iwin.skynetDialogWinId = iframe.id;
                    skynetDialog.data(iframe.id + _opener, win);
                    skynetDialog.data(iframe.id + _open, dialog);
                }
            }
        });
    };
    skynetDialog.open.api = skynetDialog.data(_winId + _open);
    skynetDialog.opener = skynetDialog.data(_winId + _opener);
    skynetDialog.close = function () {
        var api = skynetDialog.data(_winId + _open);
        api && api.close();
        return false;
    };
    _top != win && win.$(win.document).bind("mousedown.skynetDialog", function () {
        var api = skynetDialog.open.api;
        api && api.zIndex();
    });
})(jQuery, window, skynetDialog);
/*通用对话框实例（便捷使用）*/
(function ($, skynetDialog) {
    /**
     * Ajax填充内容
     * @param    {String}            地址
     * @param    {Object}            配置参数
     * @param    {Boolean}            是否允许缓存. 默认true
     */
    skynetDialog.load = function (url, options, cache) {
        if (isEmpty(url)) return false;
        cache = cache || false;
        var opt = options || {};
        $.ajax({
            url: url,
            type: 'POST',
            cache: cache,
            success: function (content) {
                options.content = content;
                skynetDialog.through(options);
            }
        });
        return true;
    };
    /**
     * 消息
     * @param    {String}    消息内容
     */
    skynetDialog.alert = function (content, callback) {
        return skynetDialog.through({
            id: "Alert",
            content: "<table style='width:100%;height:100%;'>"
                + "<tr>"
                + "<td style='width:32px;'>"
                + "<image src=\"" + getUIPath() + "/images/dialog/msg.png\" class=\"skynetMessager\" />"
                + "</td>"
                + "<td style='text-align:left;padding-left: 15px;font-size:14px;'>"
                + content
                + "</td>"
                + "</tr>"
                + "<table>",
            width: 320,
            height: 60,
            ok: true,
            close: callback
        });
    };
    /**
     * 错误
     * @param    {String}    消息内容
     */
    skynetDialog.error = function (content, callback) {
        return skynetDialog.through({
            id: "error",
            title: "错误",
            content: "<table style='width:100%;height:100%;'>"
                + "<tr>"
                + "<td style='width:32px;'>"
                + "<image src=\"" + getUIPath() + "/images/dialog/error.png\" class=\"skynetMessager\" />"
                + "</td>"
                + "<td  style='text-align:left;padding-left: 15px;font-size:14px;'>"
                + content
                + "</td>"
                + "</tr>"
                + "<table>",
            width: 320,
            height: 60,
            ok: true,
            close: callback
        });
    };
    /**
     * 警告
     * @param    {String}    消息内容
     */
    skynetDialog.warning = function (content, callback) {
        return skynetDialog.through({
            id: "warning",
            content: "<table style='width:100%;height:100%;'>"
                + "<tr>"
                + "<td style='width:32px;'>"
                + "<image src=\"" + getUIPath() + "/images/dialog/warning.png\" class=\"skynetMessager\" />"
                + "</td>"
                + "<td  style='text-align:left;padding-left: 15px;font-size:14px;'>"
                + content
                + "</td>"
                + "</tr>"
                + "<table>",
            width: 320,
            height: 60,
            ok: true,
            close: callback
        });
    };
    /**
     * 成功
     * @param    {String}    消息内容
     */
    skynetDialog.success = function (content, callback) {
        return skynetDialog.through({
            id: "success",
            content: "<table style='width:100%;height:100%;'>"
                + "<tr>"
                + "<td style='width:32px;'>"
                + "<image src=\"" + getUIPath() + "/images/dialog/success.png\" class=\"skynetMessager\" />"
                + "</td>"
                + "<td  style='text-align:left;padding-left: 15px;font-size:14px;'>"
                + content
                + "</td>"
                + "</tr>"
                + "<table>",
            width: 320,
            height: 60,
            ok: true,
            close: callback
        });
    };
    /**
     * 确认
     * @content    {String}    消息内容
     * @yes    {Function}    确定按钮回调函数
     * @no    {Function}    取消按钮回调函数
     */
    skynetDialog.confirm = function (content, yes, no) {
        return skynetDialog.through({
            id: "Confirm",
            content: "<table style='width:100%;height:100%;'>"
                + "<tr>"
                + "<td style='width:32px;' class='skynetMessager-question'>"
                + "<image src=\"" + getUIPath() + "/images/dialog/confirm.png\" class=\"skynetMessager\" />"
                + "</td>"
                + "<td style='text-align:left;padding-left: 15px;font-size:14px;'>"
                + content
                + "</td>"
                + "</tr>"
                + "<table>",
            width: 320,
            height: 60,
            ok: function (here) {
                return yes.call(this, here);
            },
            cancel: function (here) {
                return no && no.call(this, here);
            }
        });
    };
    /**
     * 信息
     * @param    {String}    内容
     * @param    {String}    类型
     * @param    {Function}    确认按钮回调
     * @param    {Function}    取消按钮回调
     */
    skynetDialog.msg = function (content, flag, okFun, closeFun) {
        var msgFg;
        switch (flag) {
            case 'success':
                msgFg = "success.png";
                break;
            case 'warning':
                msgFg = "warning.png";
                break;
            case 'error':
                msgFg = "error.png";
                break;
            case 'question':
                msgFg = "confirm.png";
                break;
            default:
                msgFg = "msg.png"
                break;
        }
        return skynetDialog.through({
            id: "msg",
            content: "<table style='width:100%;height:100%;'>"
                + "<tr>"
                + "<td style='width:32px;'>"
                + "<image src=\"" + getUIPath() + "/images/dialog/" + msgFg + "\" class=\"skynetMessager\" />"
                + "</td>"
                + "<td style='text-align:left;padding-left: 15px;font-size:14px;'>"
                + content
                + "</td>"
                + "</tr>"
                + "<table>",
            width: 320,
            height: 60,
            ok: function (here) {
                return okFun && okFun.call(this);
            },
            close: function (here) {
                return closeFun && closeFun.call(this);
            }
        });
    };
    /**
     * 验证提示
     * @param    {String}    内容
     * @param    {String}    宽度
     */
    skynetDialog.reg = function (content, width) {
        var w = (!isEmpty(width) && !isNaN(width)) && width > 0 ? width : 420;
        return skynetDialog.through({
            id: "msg",
            content: "<table style='width:100%;height:100%;'>"
                + "<tr>"
                + "<td style='width:32px;'>"
                + "<image src=\"" + getUIPath() + "/images/dialog/warning.png\" class=\"skynetMessager\" />"
                + "</td>"
                + "<td><div class='skynetDialog-Reg' style='text-align:left;margin-left: 15px;'>"
                + content
                + "</div></td>"
                + "</tr>"
                + "<table>",
            width: w,
            ok: true,
            close: false
        });
    };
})(jQuery, skynetDialog);
/**
 * 简单弹出一个iframe对话框，支持重载
 * @param url       地址
 * @param tittle   标题
 * @param width    对话框的宽度
 * @param height   对话框的高度
 * @param closeFun 关闭对话框回调函数
 * @param id       设置对话框的id
 */
(function (win, skynetDialog) {
    win.openDialog = function (url, tittle, width, height, closeFun, id) {
        var option = null;
        if (arguments.length == 1) {
            option = {
                title: "",
                foot: false
            };
        } else if (arguments.length == 2) {
            option = {
                title: tittle,
                foot: false
            };
        } else if (arguments.length == 3) {
            option = {
                title: tittle,
                width: width,
                foot: false
            };
        } else if (arguments.length == 4) {
            option = {
                title: tittle,
                width: width,
                height: height,
                foot: false
            };
        } else if (arguments.length == 5) {
            option = {
                title: tittle,
                width: width,
                height: height,
                close: closeFun,
                foot: false
            };
        } else if (arguments.length == 6) {
            option = {
                id: id,
                title: tittle,
                width: width,
                height: height,
                close: closeFun,
                foot: false
            };
        }
        skynetDialog.open(url, option, false);
    };
})(window, skynetDialog);