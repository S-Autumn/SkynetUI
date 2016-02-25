/*
 * skynetUI
 * 组件的插件管理、AOP控制、 脚本动态加载
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
    if (undefined == win.isEmpty || null == win.isEmpty) win.isEmpty = function (obj) {
        if (obj == undefined || obj == null || (typeof obj === "number" && !(obj < 0) && !(obj >= 0))) return true;
        if (typeof obj === "function")  return false;
        if (typeof obj === "string" && $.trim(obj).length > 0) return false;
        else if (typeof obj === "string" && $.trim(obj).length <= 0) return true;
        if (typeof obj === "number" || typeof obj === "boolean" || obj instanceof RegExp)  return false;
        if (obj == obj.window || obj.nodeType)  return false;
        if (obj instanceof jQuery && obj.length > 0) return false;
        else if (obj instanceof jQuery && obj.length <= 0) return true;
        if (obj instanceof Array && obj.length < 1) return true;
        if (obj instanceof Object) {
            for (var t in obj) {
                if (!t || t == null) continue;
                if (obj.hasOwnProperty(t) == true) return false;
            }
            return true;
        }
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
/*skynet 缓存管理*/
(function ($, win) {
    var skynetStore = function (store) {
        if (isEmpty(store)) return null;
        Object.defineProperties(this, {
            setStore: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function (key, plugin) {
                    if (isEmpty(key) || isEmpty(plugin)) return;
                    var nameSpaces = key.split('.');
                    var _plugin = null;
                    $.each(nameSpaces, function (i, nameSpace) {
                        if (isEmpty(nameSpace)) return true;
                        var tmp = {};
                        if (i == 0) {
                            tmp[nameSpace] = plugin;
                        } else {
                            tmp[nameSpace] = _plugin;
                        }
                        _plugin = tmp;
                    });
                    $.extend(true, win[store], _plugin);
                }
            },
            getStore: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function (key) {
                    if (!isEmpty(key) && !isEmpty(win[store])) {
                        var nameSpaces = key.split('.').reverse();
                        var plugins = clone(win[store]);
                        $.each(nameSpaces, function (i, nameSpace) {
                            if (isEmpty(plugins)) return false;
                            plugins = plugins[nameSpace];
                        });
                        return plugins;
                    }
                    return null;
                }
            },
            removeStore: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function (key) {
                    if (!isEmpty(key) && !isEmpty(win[store])) {
                        var nameSpaces = key.split('.').reverse();
                        var plugins = win[store];
                        $.each(nameSpaces, function (i, nameSpace) {
                            if (isEmpty(plugins)) return false;
                            plugins = plugins[nameSpace];
                        });
                        if (!isEmpty(plugins)) delete plugins;
                    }
                }
            },
            clearStore: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function () {
                    win[store] = {};
                }
            },
            initStore: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function () {
                    if (isEmpty(win[store])) win[store] = {};
                    return this;
                }
            }
        });
        return this.initStore();
    };
    win.skynetStore = win.SkynetStore = skynetStore;
})(jQuery, window);
/*skynet 插件功能管理*/
(function ($, win) {
    var skynetPlugins = function () {
        var store = new skynetStore('skynetPluginsStore');
        Object.defineProperties(this, {
            setPlugin: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.setStore
            },
            getPlugins: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.getStore
            },
            removePlugin: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.removeStore
            },
            clearPlugins: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.clearStore
            },
            initPlugins: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.initStore
            }
        });
    };
    win.skynetPlugins = new skynetPlugins();
})(jQuery, window);
/*skynet Loader加载器*/
(function ($, win) {
    var skynetLoaders = function () {
        var store = new skynetStore('skynetLoaderStore');
        Object.defineProperties(this, {
            setLoader: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.setStore
            },
            getLoader: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.getStore
            },
            removeLoader: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.removeStore
            },
            clearLoader: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.clearStore
            },
            initLoader: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: store.initStore
            }
        });
    };
    var skynetLoader = function (ui, impl) {
        if (isEmpty(ui)) return null;
        this.load = impl.load;
        this.event = impl.event;
        Object.defineProperties(this, {
            initing: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function () {
                    ui.aop.initing.go.apply(ui, arguments);
                }
            },
            building: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function () {
                    ui.aop.building.go.apply(ui, arguments);
                }
            },
            loading: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function () {
                    ui.aop.loading.go.apply(ui, arguments);
                }
            },
            ending: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function () {
                    ui.aop.ending.go.apply(ui, arguments);
                }
            },
            destroy: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function () {
                    ui.loader.event.destroy.apply(ui, arguments);
                    ui.loader.load.destroy.apply(ui, arguments);
                }
            }
        });
    }
    win.skynetLoaders = new skynetLoaders();
    win.skynetLoader = win.SkynetLoader = skynetLoader;
})(jQuery, window);
/*skynet AOP切面过程*/
(function ($, win) {
    var Aop = function (ui, name) {
        if (isEmpty(ui) || isEmpty(name) || isEmpty(ui[name])) return null;
        Object.defineProperties(this, {
            add: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function (process) {
                    if (!isEmpty(ui) && !isEmpty(name) && !isEmpty(ui[name]))
                        ui[name].add(process);
                }
            },
            remove: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function (process) {
                    if (!isEmpty(ui) && !isEmpty(name) && !isEmpty(ui[name]))
                        ui[name].remove(process);
                }
            },
            go: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: function () {
                    if (!isEmpty(ui) && !isEmpty(name) && !isEmpty(ui[name])) {
                        if (!isEmpty(ui.plugins)) {
                            for (var key  in ui.plugins) {
                                var plugin = ui.plugins[key];
                                if (isEmpty(plugin)) continue;
                                var pluginProcess = plugin[name];
                                if (isEmpty(pluginProcess)) continue;
                                if (typeof pluginProcess === 'function') ui[name].add(pluginProcess);
                            }
                        }
                        ui[name].fire.apply(this, arguments);
                    }
                }
            }
        });
    };
    var skynetAop = function (ui) {
        if (isEmpty(ui)) return null;
        (function (ui) {
            if (isEmpty(ui.aopInitQueue))
                ui.aopInitQueue = $.Callbacks('unique stopOnFalse');
            else
                ui.aopInitQueue.empty();

            if (isEmpty(ui.aopBuildQueue))
                ui.aopBuildQueue = $.Callbacks('unique stopOnFalse');
            else
                ui.aopBuildQueue.empty();

            if (isEmpty(ui.aopLoadQueue))
                ui.aopLoadQueue = $.Callbacks('unique stopOnFalse');
            else
                ui.aopLoadQueue.empty();

            if (isEmpty(ui.aopEndQueue))
                ui.aopEndQueue = $.Callbacks('unique stopOnFalse');
            else
                ui.aopEndQueue.empty();
        })(ui);
        Object.defineProperties(this, {
            initing: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: new Aop(ui, 'aopInitQueue')
            },
            building: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: new Aop(ui, 'aopBuildQueue')
            },
            loading: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: new Aop(ui, 'aopLoadQueue')
            },
            ending: {
                writable: false,
                configurable: false,
                enumerable: true,
                value: new Aop(ui, 'aopEndQueue')
            }
        });
    };
    win.skynetAop = win.SkynetAop = skynetAop;
})(jQuery, window);
/*skynet 组件JS加载管理*/
(function ($, win) {
    var skynetUI = function (css, base, ui) {
        this.css = css;
        this.base = base;
        this.ui = ui;
        Object.defineProperties(this, {
            initJs: {
                writable: false,
                configurable: false,
                enumerable: false,
                value: function () {
                    $.holdReady(true);
                    var cPath = window.document.location.href;
                    var isLocal = false;
                    var isChrome = $.browser['chrome'];
                    if ('file' == cPath.substring(0, 4)) isLocal = true;
                    if (isChrome == true && isLocal == true)
                        throw new Error('谷歌浏览器下由于安全性考虑禁止对本地文件使用动态引用,自动加载失败！！');
                    var basePath = '';
                    var $head = $('head');
                    var reSrc = $head.find('script[src*="skynetUI.js"]').attr('src');
                    if (!isEmpty(reSrc)) {
                        basePath = reSrc.substring(0, reSrc.indexOf('/js/ui/skynetUI.js'));
                        win.UIPath = basePath;//动态获得相对路径
                        //加载CSS
                        if (!isEmpty(this.css) && $.isArray(this.css)) {
                            $.each(this.css, function (i, value) {
                                if (isEmpty(value)) return true;
                                if (value.indexOf('.css') <= -1) value = value + '.css';
                                if ($head.find('link[href$="' + value + '"]').length <= 0)
                                    $head.prepend('<link rel="stylesheet" href="' + basePath + '/css/' + value + '"/>');
                            });
                        }
                        //加载基础库
                        if (!isEmpty(this.base) && $.isArray(this.base)) {
                            $.each(this.base, function (k, value) {
                                if (isEmpty(value)) return true;
                                if (value.indexOf('.js') <= -1) value = value + '.js';
                                if ($head.find('script[src$="' + value + '"]').length <= 0) {
                                    if (isLocal) {
                                        $.ajax({url: UIPath + '/js/' + value, async: false, dataType: 'script', cache: true, ifModified: true, crossDomain: true});
                                    } else {
                                        $.ajax({url: UIPath + '/js/' + value, async: false, dataType: 'script', cache: true, ifModified: true});
                                    }
                                }

                            });
                        }
                        //参数处理 只支持  use(指定使用脚本)、pass(指定忽略脚本) 2种参数
                        var params = {};
                        var urlParams = reSrc.substring(reSrc.indexOf("?") + 1, reSrc.length);
                        if (!isEmpty(urlParams)) {
                            var paramsArray = urlParams.split("&");
                            for (var i = 0; i < paramsArray.length; i++) {
                                params[paramsArray[i].split("=")[0].toLowerCase()] = paramsArray[i].split("=")[1];
                            }
                        }
                        var nowUI = (isEmpty(params["use"]) ? [] : params["use"].split(','));
                        if (isEmpty(nowUI)) {
                            var passParams = (isEmpty(params["pass"]) ? [] : params["pass"].split(','));
                            nowUI = _.difference((isEmpty(this.ui) ? [] : clone(this.ui)), passParams);
                        }
                        //组件加载
                        var that = this;
                        $.each(nowUI, function (g, ui) {
                            if (isEmpty(ui)) return true;
                            that.loadUI(ui);

                        });
                        $.holdReady(false);
                    } else {
                        $.holdReady(false);
                        throw new Error("无法获得skynetUI,自动加载失败！！");
                    }
                }
            },
            loadUI: {
                writable: false,
                configurable: false,
                enumerable: false,
                value: function (ui) {
                    var cPath = window.document.location.href;
                    var isLocal = false;
                    var isChrome = $.browser['chrome'];
                    if ('file' == cPath.substring(0, 4)) isLocal = true;
                    if (isChrome == true && isLocal == true)
                        throw new Error('谷歌浏览器下由于安全性考虑禁止对本地文件使用动态引用,自动加载失败！！');
                    var $head = $('head');
                    if (ui.indexOf(".js") <= -1) ui = ui + ".js";
                    if ($head.find('script[src$="js/ui/' + ui + '"]').length <= 0) {
                        if (isLocal) {
                            $.ajax({url: UIPath + "/js/ui/" + ui, async: false, dataType: "script", cache: true, ifModified: true, crossDomain: true});
                        } else {
                            $.ajax({url: UIPath + "/js/ui/" + ui, async: false, dataType: "script", cache: true, ifModified: true});
                        }
                    }
                }
            }
        });
    };
    var css = ['skynet', 'bootstrap', 'webfont','jquery-ui'];
    var base = ['bootstrap', 'json2', 'jquery-mousewheel', 'jquery-ui', 'uuid', 'Underscore', 'common'];
    var ui = ['skynetFloat', 'skynetDialog', 'skynetGrid', 'skynetPower', 'skynetPager', 'skynetForm', 'skynetShadowBox', 'skynetTree', 'skynetTopo'];
    win.skynet = new skynetUI(css, base, ui);
    win.skynet.initJs();
})(jQuery, window);