/*
 * 数据序列化组件扩展  
 * Copyright (c) 2014 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil.@163.com
 * Date: 2014-12-27
 */
!(function ($, win) {
    var rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
    var rselectTextarea = /^(?:select|textarea)/i;
    /*skynet 提交页面数据序列化*/
    $.fn.extend({
        skynetBuildSubmitUrL: function () {
            jQuery.param(this.skynetBuildSubmitArray());
        },
        skynetBuildSubmitArray: function () {
            return this.map(function () {
                return this.elements ? jQuery.makeArray(this.elements) : this;
            })
                .filter(function () {
                    var elem = jQuery(this);
                    return !isEmpty(elem.attr("skynet-name"))
                        && !isEmpty(elem.val())
                        && !this.disabled
                        && (this.checked || rselectTextarea.test(this.nodeName) || rinput.test(this.type));
                })
                .map(function (i, elem) {
                    var elem = jQuery(this);
                    var val = elem.val();
                    return val == null ? null :
                        jQuery.isArray(val) ?
                            jQuery.map(val, function (val, i) {
                                return {
                                    name: elem.attr("skynet-name"),
                                    value: val.replace(/\r?\n/g, "\r\n")
                                };
                            }) : {
                            name: elem.attr("skynet-name"),
                            value: val.replace(/\r?\n/g, "\r\n")
                        };
                }).get();
        }
    });

    win.Map = function () {
        var struct = function (key, value) {
            this.key = key;
            this.value = value;
        };
        var put = function (key, value) {
            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i].key == key) {
                    this.arr[i].value = value;
                    return;
                }
            }
            this.arr[this.arr.length] = new struct(key, value);
        };
        var get = function (key) {
            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i].key == key) {
                    return this.arr[i].value;
                }
            }
            return null;
        };
        var remove = function (key) {
            var v;
            for (var i = 0; i < this.arr.length; i++) {
                v = this.arr.pop();
                if (v.key == key) {
                    continue;
                }
                this.arr.unshift(v);
            }
        };
        var size = function () {
            return this.arr.length;
        };
        var isEmpty = function () {
            return this.arr.length <= 0;
        };
        var containsKey = function (key) {
            var result = false;
            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i].key == key) {
                    result = true;
                }
            }
            return result;
        };
        var containsValue = function (value) {
            var result = false;
            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i].value == value) {
                    result = true;
                }
            }
            return result;
        };
        var keySet = function () {
            var result = new Array();
            for (var i = 0; i < this.arr.length; i++) {
                result.push(this.arr[i].key);
            }
            return result;
        };
        this.arr = new Array();
        this.get = get;
        this.put = put;
        this.remove = remove;
        this.size = size;
        this.isEmpty = isEmpty;
        this.containsKey = containsKey;
        this.containsValue = containsValue;
        this.keySet = keySet;
    };
})(jQuery, window);
/*
 * skynetForm  
 * 数据绑定验证提交Jquery插件
 * Copyright (c) 2014 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil.@163.com
 * Date: 2014-12-27
 */
(function ($) {
    /**验证字典*/
    var regDic = new Map();
    regDic.put("need", "必须填选!");
    regDic.put("sfzh", "身份证号格式错误!");
    regDic.put("minlength", "小于最小长度!");
    regDic.put("maxlength", "超过最大长度!");
    regDic.put("phone", "手机号码格式错误!");
    regDic.put("tphone", "座机号码格式（区号-座机号）错误!");
    regDic.put("allphone", "电话号码格式（区号-座机号,或手机号码）错误!");
    regDic.put("number", "只能填写数字!");
    regDic.put("number-z", "只能填写整数!");
    regDic.put("number-f", "只能填写小数!");
    regDic.put("<", "值过大!");
    regDic.put("<=", "值过大!");
    regDic.put(">", "值过小!");
    regDic.put(">=", "值过小!");
    regDic.put("checkbyurl", "验证不通过!");
    regDic.put("zhen", "只能输入英文!");
    regDic.put("zhennumber", "只能输入英文和数字!");
    regDic.put("date", "日期格式错误!");
    /**验证不通过样式*/
    var regCssError = ".skynet-CheckError,.skynet-CheckError-Border,"
        + ".skynet-CheckError-Time,.skynet-CheckError-Select";
    /**验证通过样式*/
    var regCssSuccess = ".skynet-CheckSuccess,.skynet-CheckSuccess-Border,"
        + ".skynet-CheckSuccess-Time,.skynet-CheckSuccess-Select";
    /**表单属性*/
    var option = {
        bindUrl: "",
        bindParam: "",
        bindData: "",
        submitUrl: "",
        submitParam: "",
        checkAfter: undefined,
        checkBefore: undefined,
        createSuccess: function (datas) {
        },
        submitCallBack: function (datas) {
            skynetDialog.msg(datas.msg.msg, datas.msg.flag, null);
        }
    };
    /**后端验证*/
    var regByUrl = function ($Element, regflag, fn) {
        this.result = {msg: [], flag: true, elements: [$Element[0]], msgByLx: new Map(), isTitle: !isEmpty($Element.attr("title"))};
        this.status = -1;
        this.getResult = function () {
            return {result: that.result, status: that.status};
        };
        this.docheck = function ($Element, url) {
            if (that.result.isTitle == true) that.result.msgByLx.put(regflag.split("-")[0], $Element[0]);
            if (isEmpty(url)) {
                that.result.flag = false;
                that.result.msg = ["验证失败!"];
                that.status = 1;
            } else {
                var val = $Element.val(),
                    field = (!isEmpty($Element.attr("skynet-name")) ? $Element.attr("skynet-name") : $Element.attr("name"));
                that.result.flag = false;
                that.result.msg = ["验证中!"];
                that.status = 0;
                var param = {};
                param[field] = val;
                param["checkFeild"] = field;
                param["checkVal"] = val;
                $.ajax({
                    url: url,
                    type: "POST",
                    data: param,
                    dataType: "json",
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        that.result.flag = false;
                        that.result.msg = ["验证失败!"];
                        that.status = 1;
                    },
                    complete: function (XHR, TS) {
                        if ("parsererror" == TS) {
                            that.result.flag = false;
                            that.result.msg = ["验证失败!"];
                            that.status = 1;
                            var elemt = "<div id='powerTips_Div' style='display:none'>"
                                + XHR.responseText + "<div>";
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
                        if (!isEmpty(datas)) {
                            if (!isEmpty(datas["msg"])) that.result.msg = [datas["msg"]];
                            if (!isEmpty(datas["flag"]) && (datas["flag"] == true || datas["flag"] == "true")) {
                                that.result.flag = true;
                            } else {
                                that.result.flag = false;
                            }
                        }
                        that.status = 1;
                        that.successCallBack.call(that, that.result);
                    }
                });
            }
        };
        var that = this;
        if (fn != undefined && typeof fn === "function") {
            this.successCallBack = fn;
        } else {
            this.successCallBack = function (result) {
            };
        }
        that.docheck($Element, regflag.split("-")[1]);
        return that;
    };
    /**日期验证*/
    var regDate = function ($Element, regflag) {
        var val = $Element.val(), partten = "", reg = null,
            format = isEmpty($Element.attr("dateFormat")) ? "yyyy-MM-dd hh:mm:ss" : $Element.attr("dateFormat"),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if (!isEmpty(val)) {
            var n = "^\\d{4}($|年)";
            var ny1 = "^\\d{4}(-|\/|\.|年)([0][1-9]|[1][0-2])($|月)";
            var nyr1 = "^\\d{4}(-|\/|\.|年)([0][1-9]|[1][0-2])(-|\/|\.|月)([0][1-9]|[1-2][0-9]|[3][0-1])($|日)";
            var nyrsfm1 = "^\\d{4}(-|\/|\.|年)([0][1-9]|[1][0-2])(-|\/|\.|月)([0][1-9]|[1-2][0-9]|[3][0-1])[\\s]+([0-12]|0?[1-9]|1?[0-9]|2?[0-3])(:|时)([0-5][0-9])(:|分)([0-5][0-9])($|秒$)";
            var sfm1 = "^([0-12]|0?[1-9]|1?[0-9]|2?[0-3])(:|时)([0-5][0-9])(:|分)([0-5][0-9])($|秒$)";
            var sf1 = "^([0-12]|0?[1-9]|1?[0-9]|2?[0-3])(:|时)([0-5][0-9])($|分$)";
            var fm1 = "^([0-5][0-9])(:|分)([0-5][0-9])($|秒$)";
            var ny2 = "^\\d{4}([0][1-9]|[1][0-2])$";
            var nyr2 = "^\\d{4}([0][1-9]|[1][0-2])([0][1-9]|[1-2][0-9]|[3][0-1])$";
            var nyrsfm2 = "^\\d{4}([0][1-9]|[1][0-2])([0][1-9]|[1-2][0-9]|[3][0-1])([0-12]|0?[1-9]|1?[0-9]|2?[0-3])([0-5][0-9])([0-5][0-9])$";
            var sfm2 = "^([0-12]|0?[1-9]|1?[0-9]|2?[0-3])([0-5][0-9])([0-5][0-9])$";
            var sf2 = "^([0-12]|0?[1-9]|1?[0-9]|2?[0-3])([0-5][0-9])$";
            var fm2 = "^([0-5][0-9])([0-5][0-9])$";
            switch (format) {
                case "yyyy":
                    partten = n;
                    reg = new RegExp(partten);
                    if (reg.test(val)) {
                        val = val.substring(0, 4);
                    } else {
                        val = "";
                        reval.flag = false;
                        reval.msg = "格式必须为4位整数!";
                    }
                    break;
                case "yyyy-MM":
                    partten = ny1;
                    reg = new RegExp(partten);
                    if (reg.test(val)) {
                        val = val.replace(/(-|\/|\.|年)/g, "-");
                        val = val.replace(/(月)/g, "");
                        $Element.val(val);
                        $Element.change();
                    } else {
                        partten = ny2;
                        reg = new RegExp(partten);
                        if (reg.test(val)) {
                            val = val.substring(0, 4)
                                + "-" + val.substring(4, 6);
                        } else {
                            val = "";
                            reval.flag = false;
                            reval.msg = "格式必须为:年-月(月不足2位需补0)!";
                        }
                    }
                    break;
                case "yyyy-MM-dd":
                    partten = nyr1;
                    reg = new RegExp(partten);
                    if (reg.test(val)) {
                        val = val.replace(/(-|\/|\.|年|月)/g, "-");
                        val = val.replace(/(日)/g, "");
                    } else {
                        partten = nyr2;
                        reg = new RegExp(partten);
                        if (reg.test(val)) {
                            val = val.substring(0, 4) + "-"
                                + val.substring(4, 6) + "-"
                                + val.substring(6, 8);
                        } else {
                            val = "";
                            reval.flag = false;
                            reval.msg = "格式必须为：年-月-日(月、日不足2位需补0)!";
                        }
                    }
                    break;
                case "yyyy-MM-dd hh:mm:ss":
                    partten = nyrsfm1;
                    reg = new RegExp(partten);
                    if (reg.test(val)) {
                        val = val.replace(/(-|\/|\.|年|月|日|时|分)/g, "-");
                        val = val.replace(/(秒)/g, "");
                    } else {
                        partten = nyrsfm2;
                        reg = new RegExp(partten);
                        if (reg.test(val)) {
                            val = val.substring(0, 4) + "-"
                                + val.substring(4, 6) + "-"
                                + val.substring(6, 8) + " "
                                + val.substring(8, 10) + ":"
                                + val.substring(10, 12) + ":"
                                + val.substring(12, 14);
                        } else {
                            val = "";
                            reval.flag = false;
                            reval.msg = "格式必须为：年-月-日(月、日不足2位需补0)  时:分:秒(二十四小时制)!";
                        }
                    }
                    break;
                case "hh:mm:ss":
                    partten = sfm1;
                    reg = new RegExp(partten);
                    if (reg.test(val)) {
                        val = val.replace(/(-|\/|\.|年|月|日|时|分)/g, "-");
                        val = val.replace(/(秒)/g, "");
                    } else {
                        partten = sfm2;
                        reg = new RegExp(partten);
                        if (reg.test(val)) {
                            val = val.substring(0, 4) + "-"
                                + val.substring(4, 6) + "-"
                                + val.substring(6, 8) + " "
                                + val.substring(8, 10) + ":"
                                + val.substring(10, 12) + ":"
                                + val.substring(12, 14);
                        } else {
                            val = "";
                            reval.flag = false;
                            reval.msg = "格式必须为： 时:分:秒!";
                        }
                    }
                    break;
                case "hh:mm":
                    partten = sf1;
                    reg = new RegExp(partten);
                    if (reg.test(val)) {
                        val = val.replace(/(-|\/|\.|时)/g, "-");
                        val = val.replace(/(分)/g, "");
                    } else {
                        partten = sf2;
                        reg = new RegExp(partten);
                        if (reg.test(val)) {
                            val = val.substring(0, 2) + ":"
                                + val.substring(2, 4);
                        } else {
                            val = "";
                            reval.flag = false;
                            reval.msg = "格式必须为：时:秒!!";
                        }
                    }
                    break;
                case "mm:ss":
                    partten = fm1;
                    reg = new RegExp(partten);
                    if (reg.test(val)) {
                        val = val.replace(/(-|\/|\.|分)/g, "-");
                        val = val.replace(/(秒)/g, "");
                    } else {
                        partten = fm2;
                        reg = new RegExp(partten);
                        if (reg.test(val)) {
                            val = val.substring(0, 2) + ":"
                                + val.substring(2, 4);
                        } else {
                            val = "";
                            reval.flag = false;
                            reval.msg = "格式必须为: 分:秒!!";
                        }
                    }
                    break;
            }
            $Element.val(val);
        }
        return reval;
    };
    /**数字大小验证*/
    var regNumberSize = function ($Element, regflag) {
        var reg = regflag.split("-")[0], val = $Element.val(), refer = regflag.substring(regflag.indexOf("-") + 1, regflag.length),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: reg, isTitle: !isEmpty($Element.attr("title"))};
        if (!isEmpty(val) && !isNaN(val) && !isNaN(refer)) {
            val = Number(val);
            refer = Number(refer);
            switch (reg) {
                case ">":
                    reval.flag = (val > refer ? true : false);
                    reval.msg = "必须大于" + refer + "!";
                    break;
                case ">=":
                    reval.flag = (val >= refer ? true : false);
                    reval.msg = "必须大于等于" + refer + "!";
                    break;
                case "<":
                    reval.flag = (val < refer ? true : false);
                    reval.msg = "必须小于" + refer + "!";
                    break;
                case "<=":
                    reval.flag = (val <= refer ? true : false);
                    reval.msg = "必须小于等于" + refer + "!";
                    break;
            }
        }
        return reval;
    };
    /**英文验证*/
    var regZhEn = function ($Element, regflag) {
        var reg = "[^a-zA-Z]", val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if (!isEmpty(val)) {
            var myReg = new RegExp(reg, "g");
            reval.flag = myReg.test(val);
        }
        return reval;
    };
    /**英文数字验证*/
    var regZhEnNumber = function ($Element, regflag) {
        var reg = "[^a-zA-Z0-9]", val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if (!isEmpty(val)) {
            var myReg = new RegExp(reg, "g");
            reval.flag = myReg.test(val);
        }
        return reval;
    };
    /** 电话验证 */
    var regAllPhone = function ($Element, regflag) {
        var reg = "(^1\\d{10}$)|(^\\d{3,4}\-\\d{7,8}$)", val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if (!isEmpty(val)) {
            var myReg = new RegExp(reg);
            reval.flag = myReg.test(val);
        }
        return reval;
    };
    /**手机验证*/
    var regPhone = function ($Element, regflag) {
        var reg = "^1\\d{10}$", val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if (!isEmpty(val)) {
            var myReg = new RegExp(reg);
            reval.flag = myReg.test(val);
        }
        return reval;
    };
    /**座机验证*/
    var regTphone = function ($Element, regflag) {
        var reg = "^\\d{3,4}\-\\d{7,8}$", val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if (!isEmpty(val)) {
            var myReg = new RegExp(reg);
            reval.flag = myReg.test(val);
        }
        return reval;
    };
    /**最小长度验证*/
    var regMinlength = function ($Element, regflag) {
        var reg = parseInt(regflag.split("-")[1]), val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: reg, isTitle: !isEmpty($Element.attr("title"))};
        if ((reg > 0) && !isEmpty(val) && val.length < reg) reval.flag = false;
        return reval;
    };
    /**最大长度验证*/
    var regMaxlength = function ($Element, regflag) {
        var reg = parseInt(regflag.split("-")[1]), val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: reg, isTitle: !isEmpty($Element.attr("title"))};
        if ((reg > 0) && !isEmpty(val) && val.length > reg)reval.flag = false;
        return reval;
    };
    /**必填验证*/
    var regNeed = function ($Element, regflag) {
        var reg = regflag, key = true, val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if ($Element.is("div[skynet-ComborTree]")) val = $Element.attr("reValue");
        if (isEmpty(val))reval.flag = false;
        return reval;
    };
    /**数字验证*/
    var regNumber = function ($Element, regflag) {
        var reg = "" , val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if ($Element.is("div[skynet-ComborTree]")) val = $Element.attr("reValue");
        switch (regflag) {
            /* 正整数 */
            case "number-z":
                reg = "^-?\\d+$";
                break;
            /* 小数 */
            case "number-f":
                reg = "^-?([1-9][0-9]*|0)[\.]([0-9]+)$";
                break;
            /* 数字 */
            case "number":
                reg = "^-?(?:[1-9][0-9]*|0)(?:\.[0-9]+)?$";
                break;
        }
        if (reg.length > 0 && !isEmpty(val)) {
            var myReg = new RegExp(reg, "g");
            reval.flag = myReg.test(val);
        }
        return reval;
    };
    /**身份证验证(只验证有效性)*/
    var regSfzh = function ($Element, regflag) {
        var year = null, month = null, day = null, val = $Element.val(),
            reval = {msg: methods.regDic.get(regflag), flag: true, element: $Element[0], regLx: regflag, isTitle: !isEmpty($Element.attr("title"))};
        if (!isEmpty(val)) {
            if (val.indexOf(" ") != -1) {
                reval.flag = false;
                return reval;
            }
            if (val.length != 15 && val.length != 18) {
                reval.flag = false;
                return reval;
            }
            if (val.length == 15) {
                year = '19' + "" + val.substring(6, 8);
                month = val.substring(8, 10);
                day = val.substring(10, 12);
            }
            if (val.length == 18) {
                year = val.substring(6, 10);
                month = val.substring(10, 12);
                day = val.substring(12, 14);
            }
            var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
            if (temp_date.getFullYear() != parseFloat(year)
                || temp_date.getMonth() != parseFloat(month) - 1
                || temp_date.getDate() != parseFloat(day)) {
                reval.flag = false;
                return reval;
            }
        }
        return reval;
    };

    /**工具方法（句柄）*/
    var handles = {
        /**根据 字段名称（关键字）获得数据*/
        getDataByKey: function (id, datas) {
            if (isEmpty(id) || isEmpty(datas) || typeof(id) !== "string")return "";
            var revlue = null, tmp = id.split("."), tmpdata = datas, cnt = 0;
            var pattern = "(\\[(\\d*)\\]){1}", myReg = new RegExp(pattern);
            if (typeof(tmpdata) === "string") {
                try {
                    tmpdata = JSON.parse(tmpdata);
                } catch (e) {
                    tmpdata = datas;
                }
            } else {
                tmpdata = datas;
            }
            var key = "", index = "", data = null;
            for (var i = 0; i < tmp.length; i++) {
                if (myReg.test(tmp[i])) {
                    key = tmp[i].substring(0, tmp[i].indexOf("["));
                    index = tmp[i].substring(tmp[i].indexOf("[") + 1, tmp[i].indexOf("]")) || 0;
                    index = parseInt(index);
                } else {
                    key = tmp[i];
                    index = null;
                }
                for (data in tmpdata) {
                    cnt = 0;
                    if (data == key) {
                        tmpdata = tmpdata[data];
                        if ($.isArray(tmpdata) && !isEmpty(index) && index >= 0) {
                            tmpdata = tmpdata[index];
                        }
                        revlue = tmpdata;
                        cnt = 1;
                        break;
                    }
                }
            }
            if (cnt == 0)revlue = "";
            return revlue;
        },
        /**根据数据渲染元素*/
        loadElements: function ($domElements, datas) {
            var that = this,
                patten = "^\\d{4}-([0][1-9]|[1][0-2])-([0][1-9]|[1-2][0-9]|[3][0-1])[\\s]+\\d([0-1][0-9]|2?[0-3]):([0-5][0-9]):([0-5][0-9])$",
                myReg = new RegExp(patten),
                ishave = $domElements.is("[skynet-name]"),
                $Elements = (ishave == true ? $domElements.filter("[skynet-name]") : $domElements.find("[skynet-name]"));
            $Elements.each(function () {
                var $Element = $(this),
                    key = $Element.attr("skynet-name"),
                    val = $Element.attr("skynet-value"),
                    data = (isEmpty(val) ? that.getDataByKey(key, datas) : val),
                    tagName = $Element[0].tagName;
                if (isEmpty(data)) data = "";
                switch (tagName) {
                    case "INPUT":
                        if ($Element.is(":checkbox")) {
                            if (Number(data) == 1 || data.toLowerCase() == "true" || data.toLowerCase() == "t" || data.toLowerCase() == "y") {
                                $Element[0].checked = true;
                            } else {
                                $Element[0].checked = false;
                            }
                        } else {
                            //日期数据处理
                            var datelength = $Element.is("[dateFormat]") ? $Element.attr("dateFormat").length : 0;
                            if (datelength > 0 && myReg.test(data)) data = data.substring(0, datelength);
                            $Element.val(data);
                        }
                        break;
                    case "SELECT":
                        var dicName = $Element.attr("skynet-data"), dicData = null,
                            name = (isEmpty($Element.attr("skynet-listName")) ? "mc" : $Element.attr("skynet-listName")),
                            key = (isEmpty($Element.attr("skynet-listKey")) ? "dm" : $Element.attr("skynet-listKey")),
                            dfname = $Element.attr("skynet-defaultName"),
                            dfval = $Element.attr("skynet-defaultVal"),
                            option = "<option value =\"" + (isEmpty(dfval) ? "" : dfval) + "\">" + (isEmpty(dfname) ? "请选择" : dfname) + "</option>";
                        if (!isEmpty(dicName)) {
                            if (typeof(dicName) === "string") {
                                try {
                                    //若自身是json数据
                                    dicData = JSON.parse(dicName);
                                } catch (e) {
                                    //否则从数据中寻找字典数据
                                    dicData = that.getDataByKey(dicName, datas);
                                }
                            } else {
                                //字典数据等于名称
                                dicData = dicName;
                            }
                            if ($.isArray(dicData)) {
                                //若字典数据是数组
                                for (var i = 0; i < dicData.length; i++) {
                                    if (dicData[i][key] && dicData[i][name]) {
                                        option += "<option value = \"" + dicData[i][key] + "\">"
                                            + dicData[i][name]
                                            + "</option>";
                                    }
                                }
                            } else {
                                //若字典数据是对象
                                for (var key in dicData) {
                                    option += "<option value = \"" + key + "\">"
                                        + dicData[key]
                                        + "</option>";
                                }
                            }
                            $Element.html(option);
                        }
                        $Element.val((!isEmpty(data) ? data : (!isEmpty(dfval) ? dfval : "")));
                        break;
                    case "DIV":
                        if ($Element.is("[skynet-ComborTree]")) {
                            var isInit = !isEmpty($Element.data("skynet.tree")),
                                text = $Element.attr("skynet-text");
                            if (!isInit) {
                                //若树未创建同时存在文本时 保持属性
                                $Element.attr("skynet-value", data);
                                if (!isEmpty(text))$Element.attr("skynet-text", text);
                            } else {
                                //若树已创建同时存在文本时 设置其值
                                $Element.skynetComborTree("setTreeValue", data);
                                if (!isEmpty(text))$Element.attr("skynet-text", text);
                            }
                        } else {
                            $Element.html(data);
                        }
                        break;
                    default:
                        $Element.html(data);
                        break;
                }
            });
        },
        /**日期时间组件配置初始化*/
        initDateOption: function (_format) {
            _format = _format || "yyyy-MM-dd hh:mm:ss"
            _format = $.datepicker.splitDateTime(_format);
            var option = {
                onClose: function (value, data, picker) {
                    if (!isEmpty(value)) {
                        try {
                            var dateTime = $.datepicker.parseDateTime(data.settings.dateFormat, data.settings.timeFormat, value);
                            $.datepicker._setTime(picker.inst, dateTime);
                        } catch (e) {
                            this.value = '';
                            data.input.change();
                        }
                    }
                }

            };
            var dateFormat = _format['dateString'];
            var timeFormat = _format['timeString'];
            if (!isEmpty(timeFormat)) {
                option['timeFormat'] = timeFormat;
            } else {
                option['showTimepicker'] = false;
            }
            if (!isEmpty(dateFormat)) {
                option['dateFormat'] = dateFormat;
                if (dateFormat.indexOf('yy') > -1) option['changeYear'] = true;
                if (dateFormat.indexOf('mm') > -1) option['changeMonth'] = true;
            }
            return option;
        },
        /**验证样式变更*/
        changeReg: function ($Element, reval) {
            var key = $Element[0].tagName.toLowerCase();
            if (!isEmpty($Element.data("bs.popover"))) $Element.data("bs.popover").options["skynetForm.reg"].result = reval;
            if (reval.flag !== true) {
                switch (key) {
                    case "textarea":
                        $Element.removeClass("skynet-CheckSuccess-Border");
                        $Element.addClass("skynet-CheckError-Border");
                        break;
                    case "select":
                        $Element.removeClass("skynet-CheckSuccess-Select");
                        $Element.addClass("skynet-CheckError-Select");
                        break;
                    case "input":
                        if ($Element.is(".form-datetime,[form-datetime]")) {
                            $Element.removeClass("skynet-CheckSuccess-Time");
                            $Element.addClass("skynet-CheckError-Time");
                        } else {
                            $Element.removeClass("skynet-CheckSuccess");
                            $Element.addClass("skynet-CheckError");
                        }
                        break;
                    case "div":
                        if ($Element.is("[skynet-ComborTree]")) {
                            $Element.removeClass("skynet-CheckSuccess-Border");
                            $Element.addClass("skynet-CheckError-Border");
                        }
                        break;
                    default:
                        break;
                }
            } else {
                switch (key) {
                    case "textarea":
                        $Element.removeClass("skynet-CheckError-Border");
                        $Element.addClass("skynet-CheckSuccess-Border");
                        if (!isEmpty($Element.data("bs.popover"))) $Element.popover("hide");
                        break;
                    case "select":
                        $Element.removeClass("skynet-CheckError-Select");
                        $Element.addClass("skynet-CheckSuccess-Select");
                        if (!isEmpty($Element.data("bs.popover"))) $Element.popover("hide");
                        break;
                    case "input":
                        if ($Element.is(".form-datetime,[form-datetime]")) {
                            $Element.removeClass("skynet-CheckError-Time");
                            $Element.addClass("skynet-CheckSuccess-Time");
                        } else {
                            $Element.removeClass("skynet-CheckError");
                            $Element.addClass("skynet-CheckSuccess");
                        }
                        if (!isEmpty($Element.data("bs.popover"))) $Element.popover("hide");
                        break;
                    case "div":
                        if ($Element.is("[skynet-ComborTree]")) {
                            $Element.removeClass("skynet-CheckError-Border");
                            $Element.addClass("skynet-CheckSuccess-Border");
                            if (!isEmpty($Element.data("bs.popover"))) $Element.popover("hide");
                        }
                        break;
                    default:
                        break;
                }
            }
        },
        /**设置验证提示框内容*/
        setTips: function ($Element, msg, reval) {
            var id = isEmpty($Element.attr("id")) ? Math.uuid() : $Element.attr("id");
            $Element.attr("id", id);
            $Element.data("skynetForm.reg", {result: reval});
            if (!isEmpty($Element.data("bs.popover"))) {
                $Element.data("bs.popover").options.content = msg;
                $("[tipsid='" + $Element.attr("id") + "'].skynetPopOver").html(msg);
            } else {
                var model = '<div tipsid="' + id + '" class="popover skynetErrorTips">'
                    + '<div class="arrow"></div>'
                    + '<div tipsid="' + id + '" class="popover-content skynetPopOver"></div>'
                    + '</div>';
                var _container = 'body';
                if ($Element.parents("div[name='modal-body']").length > 0) _container = $Element.parents("div[name='modal-body']")[0];
                $Element.popover({
                    container: _container,
                    content: msg,
                    placement: function () {
                        var _placement = 'auto', $Element = this.$element;
                        if ($Element.is(".form-datetime,[form-datetime],select")) {
                            _placement = 'top';
                        } else if ($Element.is("div[skynet-ComborTree]")) {
                            var tree = $Element.data("tree");
                            if (tree.option.showSite === "UP") {
                                _placement = 'bottom';
                            } else {
                                _placement = 'top';
                            }
                        }
                        return _placement;
                    },
                    trigger: "manual",
                    animation: false,
                    template: model
                });
                $Element.on('shown.bs.popover', function () {
                    var w = $Element.width() - 10;
                    $("[tipsid='" + $Element.attr("id") + "'].skynetErrorTips").css({zIndex: 9999, width: w});
                    var $tip = $Element.data("bs.popover").$tip;
                    var $arrow = $Element.data("bs.popover").$arrow;
                    if ($tip && $arrow) {
                        $tip.is(".top") && $arrow.addClass("skynetTipsTop");
                        $tip.is(".bottom") && $arrow.addClass("skynetTipsBottom");
                        $tip.is(".left") && $arrow.addClass("skynetTipsLeft");
                        $tip.is(".right") && $arrow.addClass("skynetTipsRight");
                    }
                });
            }
        },
        /**
         * 验证
         */
        checkForm: function ($Element, regArray) {
            var result = {msg: [], flag: true, elements: [], msgByLx: new Map(), isTitle: false}, errorCnt = 0;
            for (var i = 0; i < regArray.length; i++) {
                var reg = regArray[i], tip = reg.split("-")[0];
                var reval = {flag: true, msg: "", element: null, regLx: ""};
                switch (tip) {
                    case "number":
                        reval = regNumber($Element, reg);
                        break;
                    case "need":
                        reval = regNeed($Element, reg);
                        break;
                    case "sfzh":
                        reval = regSfzh($Element, reg);
                        break;
                    case "minlength":
                        reval = regMinlength($Element, reg);
                        break;
                    case "maxlength":
                        reval = regMaxlength($Element, reg);
                        break;
                    case "<":
                        reval = regNumberSize($Element, reg);
                        break;
                    case "<=":
                        reval = regNumberSize($Element, reg);
                        break;
                    case ">":
                        reval = regNumberSize($Element, reg);
                        break;
                    case ">=":
                        reval = regNumberSize($Element, reg);
                        break;
                    case "phone":
                        reval = regPhone($Element, reg);
                        break;
                    case "tphone":
                        reval = regTphone($Element, reg);
                        break;
                    case "allphone":
                        reval = regAllPhone($Element, reg);
                        break;
                    case "zhen":
                        reval = regZhEn($Element, reg);
                        break;
                    case "zhennubmer":
                        reval = regZhEnNumber($Element, reg);
                        break;
                    case "date":
                        reval = regDate($Element, reg);
                        break;
                }
                if (reval.flag !== true) {
                    if (reval.isTitle == true) result.msgByLx.put(tip, reval.element);
                    result.isTitle = reval.isTitle;
                    result.msg.push(reval.msg);
                    result.elements.push(reval.element);
                    errorCnt++;
                }
            }
            if (errorCnt > 0) {
                result.flag = false;
            }
            handles.changeReg($Element, result);
            if (result.flag !== true) handles.setTips($Element, ((result.isTitle == true) ? "【" + $Element.attr("title") + "】" : "") + result.msg.join(), result);
            return result;
        }
    };
    /**公开方法*/
    var methods = {
        regDic: regDic,
        init: function (opt) {
            /*合并配置*/
            var config = {};
            var that = this, form = that.data("skynet.Form");
            if (isEmpty(form)) {
                $.extend(true, config, option, opt);
                form = {
                    option: config,
                    target: that
                }
            } else {
                $.extend(true, config, form.option, opt);
                form.option = config;
            }
            /*验证组件初始化*/
            methods.initReg.call(this);
            /*验证组件事件初始化*/
            methods.bindRegEvent.call(this);
            /*日期时间组件初始化*/
            methods.initDate.call(this);
            that.data("skynet.Form", form);
            return form;
        },
        /**日期时间组件配置初始化*/
        initDate: function () {
            var $Elements = (this.is(".form-datetime") ? this.filter(".form-datetime") : this.find(".form-datetime"));
            $Elements.each(function () {
                $(this).datetimepicker(handles.initDateOption($(this).attr("data-dateFormat")));
            });
        },
        /**日期组件销毁*/
        destroyDate: function () {
            var $Elements = (this.is(".form-datetime,[form-datetime]") ? this.filter(".form-datetime,[form-datetime]") : this.find(".form-datetime,[form-datetime]"));
            $Elements.each(function () {
                $(this).datetimepicker("destroy");
            });
        },
        /**验证初始化*/
        initReg: function () {
            /*日期组件强制添加日期验证*/
            var $Elements = this.is(".form-datetime,[form-datetime]") ? this.filter(".form-datetime,[form-datetime]") : this.find(".form-datetime,[form-datetime]");
            $Elements.each(function () {
                var reg = isEmpty($(this).attr("reg")) ? "date" : $(this).attr("reg");
                if (reg != "date") {
                    var regArray = reg.split(","), cnt = 0;
                    for (var key = 0; key < regArray.length; key++) {
                        if (regArray[key].split("-")[0] == "date")
                            cnt++;
                    }
                    if (cnt == 0) reg = reg + ",date"
                }
                $(this).attr("reg", reg)
            });
            /*重新定位验证元素*/
            $Elements = (this.is("[reg]") ? this.filter("[reg]") : this.find("[reg]"));
            /*数字输入限制*/
            $Elements.each(function () {
                var regall = $(this).attr("reg");
                if (regall.indexOf("number") > -1) {
                    /* 禁止使用输入法 */
                    $(this).css("ime-mode", "disabled");
                    /* 数字 -号 . 按键限制 */
                    $(this).keydown(function (event) {
                        var info = $(this).attr("reg"),
                            code = parseInt(event.keyCode),
                            keyval = event.key,
                            val = $(this).val(),
                            flagArry = info.split(",");
                        if (code >= 96 && code <= 105 || code >= 48 && code <= 57
                            || code === 8 || code === 110 || code === 190
                            || code === 37 || code === 39 || keyval === '-') {
                            if (code === 46 || code === 110 || code === 190) {
                                if (val.indexOf(".") != -1 || val.length == 0) {
                                    return false;
                                }
                            }
                            if (keyval === '-') {
                                if (val.length !== 0) {
                                    return false;
                                }
                            }
                            return true;
                        } else {
                            return false;
                        }
                    });
                }
            });
        },
        /**验证*/
        checkForm: handles.checkForm,
        /**验证事件绑定*/
        bindRegEvent: function () {
            var $Elements = (this.is("[reg]") ? this.filter("[reg]:not([readonly],[disabled])") : this.find("[reg]:not([readonly],[disabled])"));
            var _mousedown = function (e) {
                var elem = e.target, tagName = elem.tagName
                var key = "id", name = $(elem).attr(key);
                if (isEmpty(name)) {
                    key = "skynet-name";
                    name = $(elem).attr(key);
                    if (isEmpty(name)) {
                        key = "name";
                        name = $(elem).attr(key);
                    }
                }
                /*下拉树是Div离开焦点事件不能正常触发所以使用鼠标点击事件处理*/
                $Elements.each(function () {
                    var $Element = $(this);
                    var refer = $Element.attr(key);
                    if (tagName == $Element[0].tagName && !isEmpty(refer) && refer == name) {
                        return true;
                    } else {
                        var regErrorFlag = $Element.is(regCssError);
                        var noRegFlag = !$Element.is(regCssSuccess) && !$Element.is(regCssError);
                        var regComborTree = $Element.is("[skynet-ComborTree][reg]");
                        if ((regErrorFlag || noRegFlag) && regComborTree && !isEmpty($Element.data("bs.popover"))) $Element.blur();
                    }
                });
            };
            var _blur = function (e) {
                if (this != e.target) return;
                var $Element = $(this), regArray = [], cnt = 0, reg = $Element.attr("reg");
                if (isEmpty(reg)) return;
                reg = reg.toLowerCase();
                regArray = reg.split(",");
                for (var key = 0; key < regArray.length; key++) {
                    if (regArray[key].split("-")[0] == "need") cnt++;
                }
                if (cnt > 0) {
                    /*若包含必填且当前自身验证通过，那么进行重新验证*/
                    var reval = handles.checkForm($Element, regArray);
                    if (reval.flag == true) {
                        /*若前端验证通过，进行后端验证*/
                        for (var key = 0; key < regArray.length; key++) {
                            var regurl = regArray[key];
                            if (regurl.split("-")[0] == "checkbyurl") {
                                var tmp = new regByUrl($Element, regurl, function (result) {
                                    handles.changeReg($Element, result);
                                    if (result.flag !== true) handles.setTips($Element, ((result.isTitle == true) ? "【" + $Element.attr("title") + "】" : "") + result.msg.join(), result);
                                });
                                var result = tmp.getResult().result;
                                handles.changeReg($Element, result);
                                if (result.flag !== true) handles.setTips($Element, ((result.isTitle == true) ? "【" + $Element.attr("title") + "】" : "") + result.msg.join(), result);
                                break;
                            }
                        }
                    }
                }
                if (!isEmpty($Element.data("bs.popover"))) $Element.popover("hide");
            };
            var _change = function (e) {
                var $Element = $(this), regArray = [], reg = $Element.attr("reg");
                if (isEmpty(reg) || isEmpty($Element)) return false;
                reg = reg.toLowerCase();
                regArray = reg.split(",");
                var reval = handles.checkForm($Element, regArray);
                if (reval.flag == true) {
                    /*若前端验证通过，进行后端验证*/
                    for (var key = 0; key < regArray.length; key++) {
                        var regurl = regArray[key];
                        if (regurl.split("-")[0] == "checkbyurl") {
                            var tmp = new regByUrl($Element, regurl, function (result) {
                                handles.changeReg($Element, result);
                                if (result.flag !== true) handles.setTips($Element, ((result.isTitle == true) ? "【" + $Element.attr("title") + "】" : "") + result.msg.join(), result);
                            });
                            var result = tmp.getResult().result;
                            handles.changeReg($Element, result);
                            if (result.flag !== true) handles.setTips($Element, ((result.isTitle == true) ? "【" + $Element.attr("title") + "】" : "") + result.msg.join(), result);
                            break;
                        }
                    }
                }
                if (!isEmpty($Element.data("bs.popover"))) {
                    $Element.popover("hide");
                    if (reval.flag !== true) $Element.popover("show");
                }
            };
            var _focus = function (e) {
                if (this != e.target) return;
                $Elements.each(function () {
                    var $elem = $(this);
                    if (!isEmpty($elem.data("bs.popover"))) $elem.popover("hide");
                });
                var $Element = $(this);
                if (!isEmpty($Element.data("bs.popover"))) {
                    var result = $Element.data("bs.popover").options["skynetForm.reg"].result;
                    if (result.flag !== true) $Element.popover("show");
                }
            };
            /*鼠标移出按下触发焦点移出（处理验证框不消失问题） */
            $(document).bind('mousedown.skynetForm.reg', _mousedown);
            /*必填焦点移出验证 */
            $Elements.bind("blur.skynetForm.reg", _blur);
            /*元素发生改变验证并显示 */
            $Elements.bind("change.skynetForm.reg", _change);
            /*焦点显示验证 */
            $Elements.bind("focus.skynetForm.reg", _focus);
            /*未来元素代理*/
            if (this.is("[reg]") === false) {
                this.delegate("[reg]", "blur.skynetForm.reg", _blur);
                this.delegate("[reg]", "change.skynetForm.reg", _change);
                this.delegate("[reg]", "focus.skynetForm.reg", _focus);
            }
        },
        /**验证事件卸载*/
        unbindRegEvent: function () {
            var $Elements = (this.is("[reg]") ? this.filter("[reg]") : this.find("[reg]"));
            $Elements.unbind("focus.skynetForm.reg");
            $Elements.unbind("blur.skynetForm.reg");
            $Elements.unbind("change.skynetForm.reg");
            $(document).unbind('mousedown.skynetForm.reg');
            if (this.is("[reg]") === false) this.undelegate(".skynetForm.reg");
        },
        /**验证组件销毁*/
        destroyReg: function () {
            var $Elements = (this.is("[reg]") ? this.filter("[reg]") : this.find("[reg]"));
            methods.unbindRegEvent.call(this)
            $Elements.removeClass("skynet-CheckError");
            $Elements.removeClass("skynet-CheckError-Border");
            $Elements.removeClass("skynet-CheckError-Time");
            $Elements.removeClass("skynet-CheckError-Select");
            $Elements.removeClass("skynet-CheckSuccess");
            $Elements.removeClass("skynet-CheckSuccess-Border");
            $Elements.removeClass("skynet-CheckSuccess-Time");
            $Elements.removeClass("skynet-CheckSuccess-Select");
            $Elements.removeData("skynetForm.reg");
        },
        /**提交验证*/
        checkSubmit: function () {
            var $Elements = (this.is("[reg]") ? this.filter("[reg]") : this.find("[reg]")),
                result = {flag: true, msg: [], elements: [], defaultTips: "", msgByLx: new Map(), regDic: methods.regDic},
                errorCnt = 0;
            $Elements.each(function () {
                var $Element = $(this),
                    cnt = 0,
                    reval = {flag: true},
                    reg = $Element.attr("reg"),
                    regArray = isEmpty(reg) ? [] : reg.split(",");
                if (isEmpty(reg)) return false;
                if ($Element.is(regCssError)) {
                    reval = $Element.data("skynetForm.reg").result;
                    /*若值为空验证属性又不包含必填和后端验证那么将验证结果重置为成功*/
                    for (var key = 0; key < regArray.length; key++) {
                        if (regArray[key].split("-")[0] == "need" || regArray[key].split("-")[0] == "checkbyurl") {
                            cnt++;
                            break;
                        }
                    }
                    if (cnt <= 0 && isEmpty($Element.val())) reval = handles.checkForm($Element, regArray);
                } else {
                    reg = reg.toLowerCase();
                    reval = handles.checkForm($Element, regArray);
                }
                /*组装错误提示信息*/
                if (reval.flag !== true) {
                    errorCnt++;
                    if (reval.isTitle === true) {
                        for (var i = 0; i < reval.msgByLx.keySet().length; i++) {
                            var key = reval.msgByLx.keySet()[i];
                            var val = reval.msgByLx.get(key);
                            if (result.msgByLx.containsKey(key)) {
                                var array = result.msgByLx.get(key);
                                array.push(val);
                                result.msgByLx.put(key, array);
                            } else {
                                result.msgByLx.put(key, [val]);
                            }
                        }
                    }
                    result.msg = result.msg.concat(reval.msg);
                    result.elements = result.elements.concat(reval.elements);
                }
            });
            if (errorCnt > 0) {
                result.flag = false;
                var msgArray = [];
                for (var i = 0; i < result.msgByLx.keySet().length; i++) {
                    var key = result.msgByLx.keySet()[i];
                    var tip = "<b style='font-size:13px;'>" + result.regDic.get(key) + ":</b><br/>";
                    var val = result.msgByLx.get(key);
                    var titleArray = [];
                    for (var j = 0; j < val.length; j++) {
                        titleArray.push("【" + $(val[j]).attr("title") + "】");
                    }
                    tip = tip + titleArray.join();
                    msgArray.push(tip);
                }
                result.defaultTips = msgArray.join("<br/>");
            }
            return result;
        },
        /**
         * paramObj
         * 数据重组
         * 获得指定作用域组件的值 并且 重组为 js对象
         */
        reBuildDataToObj: function () {
            var $Elements = (this.is("[skynet-name]") ? this.filter("[skynet-name]") : this.find("[skynet-name]"));
            if (typeof($Elements.skynetBuildSubmitArray) === "function") {
                return $Elements.skynetBuildSubmitArray();
            } else {
                return $Elements.serializeArray();
            }
        },
        /**
         * url
         * 数据重组
         * 获得指定作用域组件的值 并且 重组为 url字符串参数
         */
        reBuildDataToUrl: function () {
            var $Elements = (this.is("[skynet-name]") ? this.filter("[skynet-name]") : this.find("[skynet-name]"));
            if (typeof($Elements.skynetBuildSubmitUrL) === "function") {
                return $Elements.skynetBuildSubmitUrL();
            } else {
                return $Elements.serialize();
            }
        },
        /**数据绑定*/
        dataBind: function (opt) {
            if (!isEmpty(opt)) {
                //旧方法支持 参数名称变动
                opt['bindUrl'] = opt['url'];
                opt['bindParam'] = opt['param'];
                opt['bindData'] = opt['data'];
                delete opt['url'];
                delete opt['param'];
                delete opt['data'];
            }
            var that = this,
                form = methods.init.call(that, opt);
            if (isEmpty(form.option.bindUrl)) {
                setTimeout(function () {
                    handles.loadElements(that, form.option.bindData);
                    form.option.createSuccess.call(that, form.option.bindData);
                }, 0);
            } else {
                $.ajax({
                    url: form.option.bindUrl,
                    type: "POST",
                    data: form.option.bindParam,
                    dataType: "json",
                    complete: function (XHR, TS) {
                        if ("parsererror" == TS) {
                            var elemt = "<div id='powerTips_Div' style='display:none'>" + XHR.responseText + "<div>";
                            $("body").append(elemt);
                        }
                    },
                    success: function (obj) {
                        var datas = null;
                        if (typeof(obj) === "string") {
                            try {
                                datas = JSON.parse(obj);
                            } catch (e) {
                            }
                        } else {
                            datas = obj;
                        }
                        handles.loadElements(that, datas);
                        form.option.createSuccess.call(that, datas);
                    }
                });
            }
            return that;
        },
        submit: function (opt) {
            if (!isEmpty(opt)) {
                //旧方法支持 参数名称变动
                opt['submitUrl'] = opt['url'];
                opt['submitParam'] = opt['param'];
                delete opt['url'];
                delete opt['param'];
            }
            var that = this,
                form = methods.init.call(that, opt);
            var flag = false;
            // 自定义的检查函数
            if (typeof(form.option.checkBefore) === 'function' && !form.option.checkBefore(flag)) {
                flag = false;
                return false;
            }
            // 自定义的检查函数 兼容旧
            if (typeof(checkBefore) === 'function' && !checkBefore()) {
                flag = false;
                return false;
            }
            /*表单验证*/
            var result = methods.checkSubmit.call(that);
            flag = result.flag;
            /*提交验证弹窗提示*/
            if (flag == false) skynetDialog.reg(result.defaultTips);
            // 自定义的检查函数
            if (typeof(form.option.checkAfter) === 'function' && !form.option.checkAfter(flag)) {
                flag = false;
                return false;
            }
            // 自定义的检查函数 兼容旧
            if (typeof(checkAfter) === 'function' && !checkAfter(flag)) {
                flag = false;
                return false;
            }
            if (flag === true && !isEmpty(form.option.submitUrl)) {
                var that = this;
                /*表单序列化*/
                var pm = methods.reBuildDataToObj.call(this);
                /*参数赋值*/
                if (!isEmpty(form.option.submitParam)) {
                    pm = pm.concat(form.option.submitParam);
                }
                /*表单提交*/
                $.ajax({
                    url: form.option.submitUrl,
                    type: "POST",
                    data: pm,
                    dataType: "json",
                    complete: function (XHR, TS) {
                        if ("parsererror" == TS) {
                            var elemt = "<div id='powerTips_Div' style='display:none'>" + XHR.responseText + "<div>";
                            $("body").append(elemt);
                        }
                    },
                    success: function (obj) {
                        var datas = null;
                        if (typeof(obj) === "string") {
                            try {
                                datas = JSON.parse(obj);
                            } catch (e) {
                                alert("数据源出错,非标准json数据！");
                            }
                        } else {
                            datas = obj;
                        }
                        form.option.submitCallBack.call(this, datas);
                    }
                });
            }
            return this;
        },
        reset: function () {
            var that = this,
                $Elements = (that.is("[skynet-name]") ? that.filter("[skynet-name]") : that.find("[skynet-name]"));
            methods.init.dataBind.call(that);
        }
    };
    $.fn.skynetForm = function (method) {
        var from = this, args = arguments, argArray = Array.prototype.slice.call(arguments, 1);
        if (methods[method]) {
            return methods[method].apply(from, argArray);
        } else if (typeof method === 'object' || !method) {
            setTimeout($.proxy(function () {
                methods.init.apply(this, args);
                if (!isEmpty(args)) methods.dataBind.call(this);
            }, from), 0);
            return from;
        }
    };
})(jQuery);