/*
 * skynetPager
 * 分页栏组件
 * Copyright (c) 2014 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil.@163.com
 * Date: 2015-10-10
 */
/*基础工具方法*/
(function ($, win) {
    if (undefined == win.isEmpty || null == win.isEmpty) {
        win.isEmpty = function (obj) {
            if (obj == undefined || obj == null || _.isNaN(obj)) return true;
            if (typeof obj === "function")  return false;
            if (typeof obj === "string" && $.trim(obj).length > 0) return false;
            else if (typeof obj === "string" && $.trim(obj).length <= 0) return true;
            if (typeof obj === "number" || typeof obj === "boolean" || obj instanceof RegExp)  return false;
            if (obj == obj.window || obj.nodeType)  return false;
            if (obj instanceof jQuery && obj.length > 0) return false;
            else if (obj instanceof jQuery && obj.length <= 0) return true;
            return _.isEmpty(obj);
        }
    }
    if (isEmpty(win.clone)) {
        win.clone = function (obj) {
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
        }
    }
})(jQuery, window);
/*分页条实现*/
(function ($) {
    var option = {
            id: null,
            name: null,
            pageType: null,//0静态分页
            total: 1,
            pageCount: 1,
            page: 1,
            rows: 10,
            maxCount: 1,
            minCount: 1,
            step: 3,
            sizeArray: [10, 20, 30, 40],
            model: "full",//full,normal,tiny
            pageList: []
        },
        callback = {
            beforeClick: undefined,
            beforeClickPage: undefined,
            beforeChangeSize: undefined,
            getDataSize: undefined,
            onCreateSuccess: undefined,
            onClick: undefined,
            onClickPage: undefined,
            onChangeSize: undefined,
            loaderData: undefined
        },
        event = {
            clickPage: function (e) {
                var that = this,
                    flag = true,
                    $target = that.target,
                    pageNumber = handles.getNextPage($(e.currentTarget), that);
                if (!isEmpty(that.callback.beforeClick) &&
                    typeof that.callback.beforeClick == "function") {
                    flag = that.callback.beforeClick.call(that, pageNumber, e.currentTarget);
                }
                if (flag != true) return false;
                that.option.page = pageNumber;
                that = handles.reSetPage(that);
                $target.data("skynetPager", that);
                that.callback.loaderData.call(that, "clickPage");
                if (!isEmpty(that.callback.onClick) &&
                    typeof that.callback.onClick == "function") {
                    flag = that.callback.onClick.call(that, e.currentTarget);
                }
                return flag;
            },
            goPage: function (e) {
                var that = this,
                    $target = that.target,
                    flag = true,
                    goPageNumber = parseInt($target.find("#" + that.option.id + "_pageIpt").val()),
                    pagerCount = parseInt(that.option.pageCount);
                if (!isEmpty(that.callback.beforeClickPage) &&
                    typeof that.callback.beforeClickPage == "function") {
                    flag = that.callback.beforeClickPage.call(that, goPageNumber, e.currentTarget);
                }
                if (flag != true) return false;
                if (typeof goPageNumber === "number") {
                    if (goPageNumber < 0) {
                        flag = false;
                        alert("页码必须大于0！");
                    } else if (goPageNumber > pagerCount) {
                        flag = false;
                        alert("页码必须小于最大页！");
                    } else if (goPageNumber <= pagerCount && goPageNumber >= 1) {
                        that.option.page = goPageNumber;
                        that = handles.reSetPage(that);
                        $target.data("skynetPager", that);
                        that.callback.loaderData.call(that, "goPage");
                        if (!isEmpty(that.callback.onClickPage) &&
                            typeof that.callback.onClickPage == "function") {
                            flag = that.callback.onClickPage.call(that, e.currentTarget);
                        }
                    }
                } else {
                    flag = false;
                    alert("不能识别的页码！");
                }
                return flag;
            },
            changePage: function (e) {
                var that = this,
                    $target = that.target,
                    flag = true,
                    goPageNumber = parseInt($target.find("#" + that.option.id + "_pageSel").val()),
                    pagerCount = parseInt(that.option.pageCount);
                if (!isEmpty(that.callback.beforeClickPage) &&
                    typeof that.callback.beforeClickPage == "function") {
                    flag = that.callback.beforeClickPage.call(that, goPageNumber, e.currentTarget);
                }
                if (flag != true) return false;
                if (goPageNumber <= pagerCount && goPageNumber >= 1) {
                    that.option.page = goPageNumber;
                    that = handles.reSetPage(that);
                    $target.data("skynetPager", that);
                    that.callback.loaderData.call(that, "goPage");
                    if (!isEmpty(that.callback.onClickPage) &&
                        typeof that.callback.onClickPage == "function") {
                        flag = that.callback.onClickPage.call(that, e.currentTarget);
                    }
                }
                return flag;
            },
            changeSize: function (e) {
                var that = this,
                    $target = that.target,
                    pageSize = parseInt($(e.currentTarget).val()),
                    flag = true;
                if (pageSize != that.option.rows) {
                    if (!isEmpty(that.callback.beforeChangeSize) &&
                        typeof that.callback.beforeChangeSize == "function") {
                        flag = that.callback.beforeChangeSize.call(that, pageSize, e.currentTarget);
                    }
                    if (flag != true) return false;
                    that.option.rows = pageSize;
                    that = handles.reSetPage(that);
                    $target.data("skynetPager", that);
                    that.callback.loaderData.call(that, "resize");
                    if (!isEmpty(that.callback.onChangeSize) &&
                        typeof that.callback.onChangeSize == "function") {
                        flag = that.callback.onChangeSize.call(that, e.currentTarget);
                    }
                }
                return flag;
            }
        },
        handles = {
            initElement: function (skynetPager) {
                var that = skynetPager, $target = that.target;
                handles.initAttr(that);
                handles.rebuildPager(that);
                $target.data("skynetPager", that);
                if (!isEmpty(that.callback.onCreateSuccess) &&
                    typeof that.callback.onCreateSuccess == "function") {
                    that.callback.onCreateSuccess.call(that)
                }
            },
            initAttr: function (skynetPager) {
                var that = skynetPager;
                that.option.id = that.target.attr('id');
                if (isEmpty(that.option.id)) {
                    that.option.id = Math.uuid();
                    that.target.attr('id', that.option.id);
                }
                if (isEmpty(that.option.name)) that.option.name = that.option.id + "_Pager";
                if (isEmpty(that.option.pageType)) that.option.pageType = 0;
                if (isEmpty(that.option.model)) that.option.model = "Full";
                that.option.total = that.callback.getDataSize.call(that);
                that.option.pageCount = Math.ceil(that.option.total / that.option.rows);
                return that;
            },
            bindEvent: function (skynetPager) {
                var $target = skynetPager.target;
                $('#' + skynetPager.option.id + '_pagerBar a', $target[0]).live("click.skynetPage", $.proxy(event.clickPage, skynetPager));
                $('#' + skynetPager.option.id + '_pageBtn', $target[0]).live("click.skynetPage", $.proxy(event.goPage, skynetPager));
                $('#' + skynetPager.option.id + '_rowsSel', $target[0]).live("change.skynetPage", $.proxy(event.changeSize, skynetPager));
                $('#' + skynetPager.option.id + '_pageSel', $target[0]).live("change.skynetPage", $.proxy(event.changePage, skynetPager));
            },
            unbindEvent: function (skynetPager) {
                skynetPager.target.die();
            },
            createPageNumber: function (skynetPager) {
                var id = skynetPager.option.id,
                    pageList = skynetPager.option.pageList,
                    maxPage = skynetPager.option.pageCount,
                    li = ''
                        + '<li><a href="javascript:void(0)" name="fristpage" page="' + 1 + '" >&laquo;</a></li>'
                        + '<li><a href="javascript:void(0)" name="previous" page="previous" >&lt;</a></li>';
                for (var i = 0; i < pageList.length; i++) {
                    li += ''
                        + '<li><a href="javascript:void(0)" name="bodypage" page="' + pageList[i] + '" >' + pageList[i] + '</a></li>';
                }
                li += ''
                    + '<li><a href="javascript:void(0)" name="next" page="next" >&gt;</a></li>'
                    + '<li><a href="javascript:void(0)" name="maxpage" page="' + maxPage + '" >&raquo;</a></li>';
                var pageNumber = '<div id="' + id + '_pagerBar" class="skynetPager">'
                    + '<ul class="skynetPagination">' + li + '</ul>'
                    + '</div>';
                return pageNumber;
            },
            createPageInput: function (skynetPager) {
                var page = skynetPager.option.page,
                    id = skynetPager.option.id,
                    pageInput = ''
                        + '第<input type="text" id="' + id + '_pageIpt" class="" value="' + page + '" />'
                        + '页<button type="button" id="' + id + '_pageBtn" class="btn btn-grey skynetPager-GoPageBtn">Go!</button>';
                return pageInput;
            },
            createPageSize: function (skynetPager) {
                var sizeArray = skynetPager.option.sizeArray,
                    id = skynetPager.option.id,
                    pageSize = '', option = '';
                if (isEmpty(sizeArray) || !$.isArray(sizeArray))sizeArray = [5, 10, 15, 20];
                for (var i = 0; i < sizeArray.length; i++) {
                    option += '<option value ="' + sizeArray[i] + '" >' + sizeArray[i] + '</option>'
                }
                pageSize = '&nbsp;&nbsp;&nbsp;每页显示'
                    + '<select id="' + id + '_rowsSel" class="">' + option + '</select>'
                    + '条 ';
                return pageSize;
            },
            createPageCount: function (skynetPager) {
                var maxPage = skynetPager.option.pageCount, pageCount = "";
                pageCount = "共 " + maxPage + "页 ";
                return pageCount;
            },
            createPageTotal: function (skynetPager) {
                var total = skynetPager.option.total, pageTotal = "";
                pageTotal = total + "行数据";
                return pageTotal;
            },
            createPageTiny: function (skynetPager) {
                var id = skynetPager.option.id;
                var li = '<li><a href="javascript:void(0)" name="previous"  page="previous" >&lt;</a></li>';
                li += '<li><select id="' + id + '_pageSel">';
                for (var i = 1; i <= skynetPager.option.pageCount; i++) {
                    li += '<option value="' + i + '">' + i + '</option>';
                }
                li += '</select></li>';
                li += '<li><a href="javascript:void(0)" name="next"  page="next" >&gt;</a></li>';
                var pagerTiny = '<div id="' + id + '_pagerBar" class="skynetPager">'
                    + '<ul class="skynetPagination">' + li + '</ul>'
                    + '</div>';
                return pagerTiny;
            },
            create: function (skynetPager) {
                var model = skynetPager.option.model,
                    page = skynetPager.option.page,
                    rows = skynetPager.option.rows,
                    $target = skynetPager.target,
                    id = skynetPager.option.id;
                switch (model.toLowerCase()) {
                    case 'full':
                        var $tipsDiv = $(document.createElement("div"));
                        $tipsDiv.addClass("skynetPagerTips");
                        $tipsDiv.append(handles.createPageInput(skynetPager));
                        $tipsDiv.append(handles.createPageSize(skynetPager));
                        $tipsDiv.append(handles.createPageCount(skynetPager));
                        $tipsDiv.append(handles.createPageTotal(skynetPager));
                        $tipsDiv.css('float', 'right');
                        $target.append(handles.createPageNumber(skynetPager));
                        $target.append($tipsDiv);
                        $target.find("a[name='bodypage'][page='" + page + "']").parent("li").addClass("active");
                        $target.find("#" + id + "_rowsSel").val(rows);
                        break;
                    case 'normal':
                        $target.append(handles.createPageNumber(skynetPager));
                        $target.find("a[name='bodypage'][page='" + page + "']").parent("li").addClass("active");
                        break;
                    case 'tiny':
                        $target.append(handles.createPageTiny(skynetPager));
                        $target.find("#" + id + "_pageSel").val(page);
                        break;
                }
                return $target;
            },
            getShowPageList: function (skynetPager) {
                var that = skynetPager,
                    page = parseInt(that.option.page),
                    pagecount = parseInt(that.option.pagecount),
                    step = that.option.step,
                    list = new Array();
                if (pagecount <= step) {
                    for (var a = 1; a <= pagecount; a++) {
                        list.push(a);
                    }
                } else {
                    if (page - step > 0 && page + step <= pagecount) {
                        for (var b = page - step; b <= page + step; b++) {
                            list.push(b);
                        }
                    } else if (page - step <= 0 && page + step <= pagecount) {
                        var max = page + step + (step - page);
                        max = pagecount < max ? pagecount : max;
                        for (var c = 1; c <= max; c++) {
                            list.push(c);
                        }
                    } else if (page - step > 0 && page + step > pagecount) {
                        var min1 = page - step - ((page + step) - pagecount);
                        min1 = min1 > 0 ? min1 : 0;
                        for (var d = pagecount; d > min1; d--) {
                            list.push(d);
                        }
                        list = list.reverse();
                    } else if (page - step <= 0 && page + step >= pagecount) {
                        var min2 = page - step;
                        min2 = min2 > 0 ? min2 : 0;
                        for (var e = pagecount; e > min2; e--) {
                            list.push(e);
                        }
                        list = list.reverse();
                    }
                }
                return list;
            },
            rebuildPager: function (skynetPager) {
                var that = skynetPager,
                    $target = that.target,
                    page = parseInt(that.option.page),
                    pagecount = parseInt(that.option.pagecount),
                    rows = parseInt(that.option.rows),
                    maxCount = 1,
                    minCount = 1;
                var pageList = handles.getShowPageList(that);
                if (isEmpty(pageList)) {
                    pageList = new Array();
                    pageList[0] = 1;
                }
                minCount = isEmpty(pageList[0]) ? 1 : pageList[0];
                maxCount = isEmpty(pageList[pageList.length - 1]) ? 1 : pageList[pageList.length - 1];
                that.option.maxCount = maxCount;
                that.option.minCount = minCount;
                that.option.pageList = pageList;
                if (page > pagecount) that.option.page = pagecount;
                $target.empty();
                handles.create(that);
                return that;
            },
            getNextPage: function ($eam, skynetPager) {
                var pageNumber = $eam.attr("page"),
                    name = $eam.attr("name"),
                    $pageA = $eam.parents("ul").find(".active a");
                switch (name) {
                    case "fristpage":
                        pageNumber = 1;
                        break;
                    case "previous":
                        if (isEmpty($pageA)) {
                            pageNumber = $eam.parents("ul").find('select[id$="_pageSel"]').val();
                        } else {
                            pageNumber = $pageA.attr("page");
                        }
                        if (pageNumber >= 0)
                            pageNumber = pageNumber;
                        else
                            pageNumber = 0;
                        pageNumber = parseInt(pageNumber);
                        if (pageNumber - 1 > 0)  pageNumber = pageNumber - 1;
                        break;
                    case "bodypage":
                        if (isEmpty(pageNumber)) {
                            pageNumber = 1;
                        } else {
                            pageNumber = parseInt(pageNumber);
                        }
                        break;
                    case "next":
                        if (isEmpty($pageA)) {
                            pageNumber = $eam.parents("ul").find('select[id$="_pageSel"]').val();
                        } else {
                            pageNumber = $pageA.attr("page");
                        }
                        if (pageNumber >= 0)
                            pageNumber = pageNumber;
                        else
                            pageNumber = 0;
                        pageNumber = parseInt(pageNumber);
                        if (pageNumber + 1 <= skynetPager.option.pagecount) pageNumber = pageNumber + 1;
                        break;
                    case "maxpage":
                        pageNumber = skynetPager.option.pagecount;
                        break;
                    default:
                        pageNumber = 1;
                        break;
                }
                return pageNumber;
            },
            reSetPage: function (skynetPager) {
                var $target = skynetPager.target,
                    count = Math.ceil(skynetPager.option.total / skynetPager.option.rows);
                if (skynetPager.option.pageType === 0) {
                    skynetPager.option.total = skynetPager.callback.getDataSize.call(skynetPager, null);
                }
                skynetPager.option.pagecount = Math.ceil(skynetPager.option.total / skynetPager.option.rows);
                $target.find("li").removeClass("active");
                if (skynetPager.option.page >= skynetPager.option.maxCount
                    || skynetPager.option.page <= skynetPager.option.minCount
                    || skynetPager.option.page > count) {
                    skynetPager = handles.rebuildPager(skynetPager);
                    $target.data("skynetPager", skynetPager);
                } else {
                    $target.find("a[name='bodypage'][page='" + skynetPager.option.page + "']").parent("li").addClass("active");
                    $target.find("input[id$='_pageIpt']").val(skynetPager.option.page);
                }
                return skynetPager;
            },
            result: {
                arrayAdd: function (value) {
                    if (!isEmpty(value)) {
                        this.data.push(value);
                    }
                },
                getNew: function () {
                    this.data = new Array();
                },
                data: []
            }
        },
        methods = {
            init: function (opt, fn) {
                var $target = this, that = $target.data("skynetPager");
                if (isEmpty(that)) {
                    that = {
                        option: clone(option),
                        callback: clone(callback),
                        target: $target
                    };
                    if (!isEmpty(opt.sizeArray) && $.isArray(opt.sizeArray)) delete that.option.sizeArray;
                    $.extend(true, that.option, opt);
                    $.extend(true, that.callback, fn);
                    handles.initElement(that);
                    handles.bindEvent(that);
                } else {
                    methods.render.call(that, opt, fn);
                }
                return this;
            },
            render: function (opt, fn) {
                var that = this;
                if (!isEmpty(opt.sizeArray) && $.isArray(opt.sizeArray)) delete that.option.sizeArray;
                $.extend(true, that.option, opt);
                $.extend(true, that.callback, fn);
                handles.initElement(that);
            }
        };

    $.fn.skynetPager = function (method, callback) {
        var that = this, args = arguments, argArray = Array.prototype.slice.call(arguments, 1);
        if (that.length == 1) {
            if (methods[method]) {
                return methods[method].apply(that.data("skynetPager"), argArray);
            } else if (typeof method === 'object' || !method) {
                setTimeout($.proxy(function () {
                    methods.init.apply(this, args);
                }, that), 0);
                return that;
            }
        } else {
            var result = handles.result.getNew();
            that.each(function () {
                var $target = $(this);
                if (methods[method]) {
                    handles.result.arrayAdd(methods[method].apply($target.data("tree"), argArray));
                } else if (typeof method === 'object' || !method) {
                    setTimeout($.proxy(function () {
                        methods.init.apply(this, args);
                    }, $target), 0);
                    handles.result.arrayAdd($target);
                }
            });
            return result.data;
        }
    };
})(jQuery);