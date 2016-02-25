/*
 * skynetPower
 * 前端权限验证组件
 * Copyright (c) 2014 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil.@163.com
 * Date: 2014-12-27
 */
;(function ($) {
    var option = {
            id: undefined,
            url: "",
            param: null,
            result: null,
            initCheck: true,
            powerCode: undefined,
            todo: ["use-disabled"]
        },
        callback = {
            beforeCheck: undefined,
            onCheck: undefined,
            checkFilter: function (data, $target, type, pop) {
                if (isEmpty(data) || data.flag != "success") {
                    if (type == "use") {
                        if (pop == "remove") {
                            $target.remove();
                            return;
                        }
                        if ($target.is("[skynet-ComborTree]")) {
                            if (pop == "disabled" || pop == "readonly") {
                                $target.skynetComborTree(pop, true);
                            } else {
                                $target.attr(pop, pop);
                            }
                        } else if ($target.is("[skynet-EditTree]")) {
                            if (pop == "disabled" || pop == "readonly") {
                                $target.skynetEditTree(pop, true);
                            } else {
                                $target.attr(pop, pop);
                            }
                        } else if ($target[0].tagName == "A") {
                            if (pop == "disabled" || pop == "readonly") {
                                var $cA = $target.children("a"),
                                    $cEam = $target.children(),
                                    $ccTree = $target.children("[skynet-ComborTree]"),
                                    $ceTree = $target.children("[skynet-EditTree]");
                                $target.removeAttr("href");
                                $target.removeAttr("onclick");
                                $target.addClass("adisabled");
                                $target.off("click");
                                $cEam.attr(pop, pop);
                                $cA.removeAttr("href");
                                $cA.removeAttr("onclick");
                                $cA.off("click");
                                $cA.addClass("adisabled");
                                if ($ccTree.length > 0)$ccTree.skynetComborTree(pop, true);
                                if ($ceTree.length > 0)$ceTree.skynetEditTree(pop, true);
                            } else {
                                $target.attr(pop, pop);
                            }
                        } else if ($target[0].tagName == "DIV"
                            || $target[0].tagName == "TABLE"
                            || $target[0].tagName == "TR"
                            || $target[0].tagName == "TD") {
                            if (pop == "disabled" || pop == "readonly") {
                                var $cA = $target.children("a"),
                                    $cEam = $target.children(),
                                    $ccTree = $target.children("[skynet-ComborTree]"),
                                    $ceTree = $target.children("[skynet-EditTree]");
                                $target.removeAttr("href");
                                $target.removeAttr("onclick");
                                $target.addClass("adisabled");
                                $cEam.attr(pop, pop);
                                $cA.removeAttr("href");
                                $cA.removeAttr("onclick");
                                $cA.addClass("adisabled");
                                if ($ccTree.length > 0)$ccTree.skynetComborTree(pop, true);
                                if ($ceTree.length > 0)$ceTree.skynetEditTree(pop, true);
                            } else {
                                $target.attr(pop, pop);
                            }
                        } else {
                            $target.attr(pop, pop);
                        }
                    } else {
                        switch (type) {
                            case "vs":
                                if (pop == "hide") {
                                    $target.hide();
                                } else if (pop == "show") {
                                    $target.show();
                                }
                                break;
                            case "css":
                                if (pop) $target.addClass(pop);
                                break;
                        }
                    }
                }
            }
        },
        handles = {
            initCfg: function (that, config, fn) {
                $.extend(true, that.option, config);
                $.extend(true, that.callback, fn);
                if (isEmpty(that.option.todo)) {
                    that.option.todo = undefined;
                } else if (!isEmpty(that.option.todo) && !$.isArray(that.option.todo)) {
                    that.option.todo = [that.option.todo];
                }
            },
            initAttr: function (that) {
                var $target = that.target,
                    id = $target.attr("id"),
                    cfg = $target.attr("skynet-Power");
                if (!isEmpty(cfg)) {
                    cfg = JSON.parse(cfg);
                    $.extend(true, that.option, cfg);
                }
                if (isEmpty(that.option.id) && !isEmpty(id)) {
                    that.option.id = id
                } else if (isEmpty(that.option.id) && isEmpty(id)) {
                    that.option.id = "skynetPower_" + Math.uuid();
                }
                if (isEmpty(that.option.todo)) {
                    that.option.todo = undefined;
                } else if (!isEmpty(that.option.todo) && !$.isArray(that.option.todo)) {
                    that.option.todo = [that.option.todo];
                }
                if (isEmpty(that.option.url) && getBaseUrl) {
                    that.option.url = getBaseUrl() + "/sys/power/checkPower";
                }
            },
            doFilter: function (that, data) {
                var todo = that.option.todo,
                    $target = that.target;
                $.each(todo, function (i, v) {
                    var type = v.split("-")[0],
                        pop = v.split("-")[1];
                    that.callback.checkFilter.call(that, data, $target, type, pop);
                });
            },
            requestSend: function (that) {
                if (isEmpty(that.option.param))that.option.param = {};
                that.option.param.powerCode = that.option.powerCode;
                if (isEmpty(that.option.url))return;
                $.ajax({
                    url: that.option.url,
                    type: "POST",
                    data: that.option.param,
                    dataType: "json",
                    complete: function (XHR, TS) {
                        if ("parsererror" == TS) {
                            var elemt = "<div id='powerTips_Div' style='display:none'>"
                                + XHR.responseText
                                + "<div>";
                            $("body").append(elemt);
                        }
                    },
                    success: function (obj) {
                        var datas = null;
                        if (typeof(obj) === "string") {
                            datas = JSON.parse(obj);
                        } else {
                            datas = obj;
                        }
                        handles.requestDone(that, datas);
                    }
                });
            },
            requestDone: function (that, datas) {
                handles.doFilter(that, datas);
                that.callback.onCheck && that.callback.onCheck.call(that, datas);
                that.option.result = datas;
                that.target.data("power", that);
            }
        },
        methods = {
            init: function (config, fn) {
                var power = this, that = power.data("power");
                if (isEmpty(that)) {
                    that = {
                        option: clone(option),
                        callback: clone(callback),
                        target: power
                    }
                }
                handles.initCfg(that, config, fn);
                handles.initAttr(that);
                power.data("power", that);
                if (that.option.initCheck === true) {
                    handles.requestSend(that);
                }
            },
            check: function () {
                var that = this, flag = true;
                if (that.callback.beforeCheck) {
                    flag = that.callback.beforeCheck.call(that, null);
                }
                if (flag === true) {
                    handles.requestSend(that);
                }
            }
        };

    $.fn.skynetPower = function (method, callback) {
        var argArray = Array.prototype.slice.call(arguments, 1),
            args = arguments, ishave = this.is("[skynet-Power]"), powerElements = null;
        if (ishave === true) {
            powerElements = this.filter("[skynet-Power]");
        } else {
            powerElements = this.find("[skynet-Power]");
        }
        var that = powerElements;
        if (powerElements.length == 1) {
            if (methods[method]) {
                return methods[method].apply(that.data("power"), argArray);
            } else if (typeof method === 'object' || !method) {
                setTimeout($.proxy(function () {
                    methods.init.apply(this, args);
                }, that), 0);
                return that;
            }
        } else {
            var result = {
                arrayAdd: function (value) {
                    if (!isEmpty(value)) {
                        this.data.push(value);
                    }
                },
                data: []
            };
            powerElements.each(function () {
                //无阻塞调用（并行）
                that = $(this);
                if (methods[method]) {
                    result.arrayAdd(methods[method].apply(that.data("power"), argArray));
                } else if (typeof method === 'object' || !method) {
                    setTimeout($.proxy(function () {
                        methods.init.apply(this, args);
                    }, that), 0);
                    result.arrayAdd(that);
                }
            });
            return result.data;
        }
    };
})(jQuery);