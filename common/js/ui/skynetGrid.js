/*
 * skynetGrid  数据列表展现组件（需要jquery）
 * version 2.0
 * Copyright (c) 2015 S_Autumn
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
    if (isEmpty(win.String.prototype.trim)) win.String.prototype.trim = function () {
        return $.trim(this);
    }
    if (isEmpty(win.Date.prototype.format)) {
        win.Date.prototype.format = function (format) {
            var o = {
                'M+': this.getMonth() + 1, //month
                'd+': this.getDate(), //day
                'h+': this.getHours(), //hour
                'm+': this.getMinutes(), //minute
                's+': this.getSeconds(), //second
                'q+': Math.floor((this.getMonth() + 3) / 3), //quarter
                'S': this.getMilliseconds() //millisecond
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp('(' + k + ')').test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
                }
            }
            return format;
        };
    }
    if (isEmpty(win.skynetFind)) {
        win.skynetFind = function (data, find, context, flag) {
            if (isEmpty(data)) return null;
            if (flag == true) {
                return _.find(data, find, context);
            } else {
                return _.filter(data, find, context)
            }
            return null;
        };
    }
    if (isEmpty(win.skynetIsDom)) {
        win.skynetIsDom = function (obj) {
            if (isEmpty(obj)) return false;
            if (obj instanceof HTMLElement) return true;
            if (obj instanceof jQuery && obj.length > 0) return true;
            return false;
        };
    }
    if (isEmpty(win.Reg_yyyy)) {
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
    }
    if (isEmpty(win.RegIsTime)) {
        win.RegIsTime = RegExp(win.Reg_timeWords);
    }
    if (isEmpty($.event.special['resizeElement'])) {
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
    }
})(jQuery, window);
/*skynetGrid定义*/
(function ($, win) {
    //属性
    var option = {
        autoCreate: true,   //是否自动创建
        mode: 'normal',     //模式 normal：常规模式
        url: null,          //查询访问的url
        saveUrl: null,      //保存时使用提交的url
        method: 'POST',     //请求方式
        params: null,       //请求参数
        loadData: null,     //请求返回的原数据
        data: null,         //filter处理后的数据 {rows:[...],pager:{...},ck:[...]}
        pageData: [],       //当前页数据 默认是data中rows数据
        checkData: [],      //选中的数据id [fieldid1,fieldid2,...,fieldidn]
        searchData: {},     //静态搜索的数据 {rows:[...]}
        addData: null,      //新添加的数据  {"aaa":{...},"bbb":{...},...,"nnn":{...}}  键是 fieldid
        changeData: null,   //变更的数据 {"aaa":{...},"bbb":{...},...,"nnn":{...}}  键是 fieldid
        removeData: null,   //删除的数据 [fieldid1,fieldid2,...,fieldidn]
        isIndex: true,      //是否显示行号
        isCheck: true,      //是否显示勾选栏
        isToolbar: true,    //是否显示工具栏
        isFoot: true,       //是否显示页脚
        isPager: true,      //是否进行分页
        isResize: true,     //是否允许拖拽列宽
        fieldId: null,      //唯一行识别键 影响你的选中行的值
        pager: {            //分页配置
            pageType: 1,    //分页方式 1 动态分页，0 静态分页
            total: 0,       //数组总条数
            pageCount: 1,   //总页数
            page: 1,        //当前页码
            rows: 10,       //当前页大小
            maxCount: 1,    //当前页码最小页码序列
            minCount: 1,    //当前页码最大页码序列
            step: 3,        //页码序列步长
            sizeArray: [10, 20, 30, 40],//页大小可选范围
            model: 'full'   //分页组件模式 full simple tiny
        },
        columns: [],        //表头配置（数组）
        columnCfg: [],      //数据列配置（数组不填）
        tools: null,        //工具栏配置（数组）
        toolAlign: 'left',  //工具按钮排布方式
        loadRowGroup: null, //行合并配置
        loadColGroup: null  //列合并配置
    };
    //列模型
    var columnMode = {
        field: null,            //列绑定 数据字段
        title: '',              //列头描述
        formatter: function (val, row, index) {
            return val;
        },                      //内容渲染器 默认渲染 该列的数据内容
        width: 'auto',          //列宽度
        thAlign: 'center',      //列头内容显示位置
        rowAlign: 'center',     //列内容显示位置
        columnEdit: true,       //列是否可以编辑（在编辑模式下）
        columnReSize: true,     //列是否可以拖拽
        isShowMore: false,      //是否双击查看单元格详细信息
        attr: null,             //自定义属性（js对象）
        rowSpan: 1,             //子列属性 强制指定跨x行合并单元格
        childs: null            //子列属性 适用于多行表头
    };
    //工具模型
    var toolMode = {
        content: null,          //内容
        id: null,               //工具的id
        name: null,             //工具的id
        class: null,            //工具的CSS
        style: null,            //工具的CSS
        events: null            //工具的点击事件（对象）
    };
    //默认皮肤定义
    var defaultSkin = {
        mainTable_CSS: 'skynetGrid',//主表格样式
        mainTable_STYLE: '',
        mainTr_CSS: '',//主表 行CSS
        mainTr_STYLE: '',
        mainTd_CSS: '',//主表 单元格CSS
        mainTd_STYLE: '',
        boxDiv_CSS: 'skynetGridBoxDiv',//主容器div CSS
        boxDiv_STYLE: '',
        shadowDiv_CSS: 'skynetGridShadowDiv',//遮罩CSS
        shadowDiv_STYLE: '',
        msgDiv_HTML: '<div class="skynetShadowBox-Wait-Msg"></div>',
        container_CSS: 'skynetGridContainer',
        container_STYLE: '',
        toolBar_CSS: 'skynetGridToolBar',//工具栏样式
        toolBar_STYLE: '',
        headContent_CSS: 'skynetGridHeadContent',//列头容器CSS
        headContent_STYLE: '',
        divHead_CSS: 'skynetGridHead',//头表块样式
        divHead_STYLE: '',
        divBody_CSS: 'skynetGridBody',//内容表块样式
        divBody_STYLE: '',
        headTable_CSS: 'skynetGridTable',//头表格的CSS
        bodyTable_CSS: 'skynetGridTable skynetHoverTab skynetStripedTab',//非编辑模式下的 内容表格CSS
        bodyEditTable_CSS: 'skynetGridTable skynetEditGrid skynetHoverTab skynetEditGridStripedTab',//非编辑模式下的 内容表格CSS
        divFoot_CSS: 'skynetGridFoot',//脚表块样式
        divFoot_STYLE: '',
        footBar_CSS: '',//脚表格的CSS
        checkColumn_CSS: 'skynetGridCkColumn',//选择列样式
        checkColumn_STYLE: '',
        indexColumn_CSS: 'skynetGridIndexColumn',//行号列样式
        indexColumn_STYLE: '',
        selectRow_CSS: 'skynetGridSelectRow',
        pager: 'skynetPagerBar'
    };
    //默认外部回调方法
    var callback = {
        onBeforeCreate: null,   //创建之前回调
        onCreateSuccess: null,  //创建完成触发
        onBeforeLoad: null,     //加载数据前触发
        onLoadSuccess: null,    //加载完成触发
        onBeforeSubmit: null,   //提交之前回调
        onSubmitSuccess: null,  //提交完成触发
        onClickCell: null,      //单击单元格
        onDbClickCell: null,    //双击单元格
        onClickRow: null,       //单击行
        onDbClickRow: null,     //双击行
        afterCheck: null,       //选中之后
        loadFilter: null,       //对加载数据过滤筛选
        rowLoad: null           //行加载
    };
    //默认行为方法
    var handles = {
        //创建
        create: function (opt, cbk, skin) {
            var grid = this;
            var mode = 'normal';
            if (!isEmpty(opt) && !isEmpty(opt.mode)) mode = opt.mode;
            if (mode.toLowerCase() == 'edit') grid.columnMode.isShowMore = true;
            //初始化AOP loader
            grid.aop = new skynetAop(grid);
            grid.loader = new skynetLoader(grid, skynetLoaders.getLoader(mode + '.skynetGrid'));
            //初始化
            grid.aop.initing.add.call(grid, grid.loader.load.initOption);
            grid.aop.initing.add.call(grid, grid.loader.load.initPlugins);
            grid.loader.initing(opt, cbk, skin);
            //主体创建
            grid.aop.building.add.call(grid, grid.loader.load.buildElement);
            grid.aop.building.add.call(grid, grid.loader.event.bindEvent);
            if (typeof grid.callback.onCreateSuccess === 'function')
                grid.aop.building.add.call(grid, grid.callback.onCreateSuccess);
            //数据渲染
            if (typeof grid.callback.onBeforeLoad === 'function')
                grid.aop.loading.add.call(grid, grid.callback.onBeforeLoad);
            var onShadow = function () {
                this.shadow(true);
            };
            var offShadow = function () {
                this.shadow(false);
            };
            grid.aop.loading.add.call(grid, onShadow);
            grid.aop.loading.add.call(grid, grid.dataManager.load);
            //行为结束
            grid.aop.ending.add.call(grid, offShadow);
            if (typeof grid.callback.onLoadSuccess === 'function')
                grid.aop.ending.add.call(grid, grid.callback.onLoadSuccess);
            if (typeof grid.callback.onBeforeCreate === 'function' && grid.callback.onBeforeCreate.call(grid) == false) return grid.target;
            if (grid.option.autoCreate !== true) return grid.target;
            //构建grid
            grid.loader.building();
            grid.loader.loading('init');
        },
        //重加载
        reload: function (opt, cbk, skin) {
            var grid = this;
            var mode = 'normal';
            if (!isEmpty(opt) && !isEmpty(opt.mode)) mode = opt.mode;
            if (mode.toLowerCase() == 'edit') grid.columnMode.isShowMore = true;
            if (mode != grid.option.mode)
                grid.loader = new skynetLoader(grid, skynetLoaders.getLoader(mode + '.skynetGrid'));
            grid.loader.initing(opt, cbk, skin);
            if (typeof grid.callback.onBeforeCreate === 'function' && grid.callback.onBeforeCreate.call(grid) == false) return grid.target;
            if (grid.option.autoCreate !== true) return grid.target;
            grid.loader.building();
            grid.loader.loading('init');
        },
        //刷新
        refresh: function () {
            var grid = this;
            grid.loader.loading('refresh');
        },
        //查询
        search: function (params) {
            var grid = this;
            if (isEmpty(params)) params = {};
            params['pageNumber'] = grid.option.pager.page = 1;
            params['pageSize'] = grid.option.pager.rows;
            grid.option.params = params;
            grid.loader.loading('refresh');
        },
        //静态搜索
        staticSearch: function () {
            setTimeout(function () {
                //TODO
            }, 0);
        },
        //翻页（设置页大小、直接跳转指定页、点击页码）刷新
        goPage: function (pager) {
            var grid = this;
            var isAsync = (grid.option.pager.pageType == 1 && !isEmpty(grid.option.url));
            var isEdit = (grid.option.mode.toLowerCase() == 'edit');
            var isChange = (!isEmpty(grid.option.addData) || !isEmpty(grid.option.changeData) || !isEmpty(grid.option.removeData));
            if (isEmpty(grid.option.params)) grid.option.params = {};
            if (isAsync && isEdit && isChange) {
                win.confirm('当前Grid存在编辑数据，翻页编辑数据将不被保存，是否继续翻页?', function () {
                    if (isEmpty(pager)) pager = {page: 1};
                    $.extend(true, grid.option.pager, pager);
                    grid.option.params['pageNumber'] = grid.option.pager.page;
                    grid.option.params['pageSize'] = grid.option.pager.rows;
                });
            } else {
                if (isEmpty(pager)) pager = {page: 1};
                $.extend(true, grid.option.pager, pager);
                grid.option.params['pageNumber'] = grid.option.pager.page;
                grid.option.params['pageSize'] = grid.option.pager.rows;
            }
            grid.loader.loading('pager');
        },
        //销毁
        destroy: function () {
            var grid = this;
            grid.loader.destroy();
            return grid.target;
        }
    };
    //Grid构造定义
    var skynetGrid = function () {
        this.init = function () {
            var tar = arguments[0];
            if (typeof tar === 'string') {
                return $(tar).data('grid.skynetGrid');
            } else {
                var $element = $(tar);
                var opt = arguments[1],
                    cbk = arguments[2],
                    skin = arguments[3];
                if (isEmpty($element) || !$element.is('table')) {
                    throw new Error('使用错误，请检查第一个参数是否是已渲染的Table，是否引用了Jquery！！');
                    return false;
                }
                //id绑定 保证唯一且id是存在的
                var _id = isEmpty($element.attr('id')) ? Math.uuid() : $element.attr('id');
                $element.attr('id', _id);
                //使用jquery获得Grid缓存数据
                var grid = $element.data('grid.skynetGrid');
                if (!isEmpty(grid)) {
                    grid.reload.call(grid, opt, cbk, skin);
                    return grid;
                } else {
                    var that = this;
                    that.id = _id;//id记录
                    that.version = 2.0;//版本号
                    that.target = $element;//元素绑定
                    that.loader = null;
                    that.aop = null;
                    that.plugins = null;
                    that.toolMode = clone(toolMode);
                    that.columnMode = clone(columnMode);
                    that.skin = clone(defaultSkin);
                    that.option = clone(option);
                    that.callback = clone(callback);
                    //基础方法初始化
                    for (var key in handles) {
                        that[key] = $.proxy(handles[key], that);
                    }
                    that.create.call(that, opt, cbk, skin);
                    return this;
                }
            }
        };
        return this.init.apply(this, arguments);
    }
    win.SkynetGrid = win.Skynetgrid = win.skynetGrid = win.skynetgrid = skynetGrid;
})($, window);
/*skynetGrid 加载器 normal模式*/
(function (skynetGrid, win) {
    var normal = {
        load: {
            initOption: function (opt, cbk, skin) {
                var grid = this;
                grid.option.data = null;
                grid.option.searchData = [];
                grid.option.pageData = [];
                grid.option.checkData = [];
                grid.option.addData = {};
                grid.option.changeData = {};
                grid.option.removeData = {};
                grid.option.pager['page'] = 1;
                grid.option.pager['total'] = 0;
                grid.option.pager['pageCount'] = 1;
                grid.loadCount = 0;
                grid.TextPaddingX = 0;
                grid.ColumnBound = {width: 0, height: 0};
                grid.columnCnt = 0;
                grid.reSizeFlag = false;
                grid.visible = grid.target.is(':visible');
                var config = grid.target.attr('data-skynetGrid');
                if (!isEmpty(config) && typeof config == 'string') {
                    try {
                        config = JSON.parse(config);
                    } catch (e) {
                        config = null;
                    }
                }
                if (!isEmpty(config)) grid.option = $.extend(true, {}, grid.option, config);
                var url = grid.target.attr('data-url');
                if (!isEmpty(url)) grid.option.url = url;
                if (!isEmpty(skin)) $.extend(true, grid.skin, skin);
                if (!isEmpty(cbk)) $.extend(true, grid.callback, cbk);
                if (!isEmpty(opt) && !isEmpty(opt.columns) && $.isArray(opt.columns)) {
                    grid.option.columns = clone(opt.columns);
                    delete opt.columns
                }
                if (!isEmpty(opt) && !isEmpty(opt.loadData) && $.isArray(opt.loadData)) {
                    grid.option.loadData = clone(opt.loadData);
                    delete opt.loadData
                }
                if (!isEmpty(opt) && !isEmpty(opt.pager) && !isEmpty(opt.pager.sizeArray) && $.isArray(opt.pager.sizeArray)) {
                    grid.option.pager.sizeArray = clone(opt.pager.sizeArray);
                    delete opt.pager.sizeArray
                }
                if (!isEmpty(opt)) grid.option = $.extend(true, {}, grid.option, opt);
                if (isEmpty(grid.option.mode)) grid.option.mode = 'normal';
                if (isEmpty(grid.option.method)) grid.option.method = 'POST';
                if (isEmpty(grid.option.pager)) grid.option.pager = {};
                if (isEmpty(grid.option.pager['pageType'])) grid.option.pager['pageType'] = 1;
                if (isEmpty(grid.option.pager['rows'])) grid.option.pager['rows'] = 10;
                if (isEmpty(grid.option.pager['minCount'])) grid.option.pager['minCount'] = 1;
                if (isEmpty(grid.option.pager['maxCount'])) grid.option.pager['maxCount'] = 1;
                if (isEmpty(grid.option.pager['step'])) grid.option.pager['step'] = 3;
                if (isEmpty(grid.option.pager['sizeArray'])) grid.option.pager['sizeArray'] = [10, 20, 30, 40];
                if (isEmpty(grid.option.pager['model'])) grid.option.pager['model'] = 'full';
                if (isEmpty(grid.option.params)) grid.option.params = {pageNumber: 1, pageSize: grid.option.pager.rows};
                grid.target.data('grid.skynetGrid', grid);
            },
            initPlugins: function () {
                var grid = this;
                grid.plugins = skynetPlugins.getPlugins('skynetGrid');
                if (isEmpty(grid.plugins)) grid.plugins = null;
            },
            buildElement: function () {
                var grid = this;
                grid.loader.load.createMainTable(grid);
                grid.loader.load.createDivBox(grid);
                grid.loader.load.createDivShadow(grid);
                grid.loader.load.createDivToolBar(grid);
                grid.loader.load.createHeadContent(grid);
                grid.loader.load.createDivHead(grid);
                grid.loader.load.createDivBody(grid);
                grid.loader.load.createDivFoot(grid);
                grid.loader.load.createTool(grid); //工具创建
                grid.loader.load.createHead(grid);//表头创建
                grid.$DivBody.empty();//表内容清空
                grid.visible = grid.target.is(':visible');
                grid.loader.load.initSize(grid);//初始化大小
            },
            destroy: function () {
                var grid = this;
                grid.$DivToolBar.remove('*');
                grid.$DivHead.remove('*');
                grid.$DivBody.remove('*');
                grid.$DivFoot.remove('*');
                grid.$DivToolBar.remove();
                grid.$DivHead.remove();
                grid.$DivBody.remove();
                grid.$DivFoot.remove();
                grid.target.empty();
            },
            loadWorking: function (grid) {
                var defer = $.Deferred();
                setTimeout(function () {
                    grid.loader.load.createBody(grid);
                    grid.loader.load.createFoot(grid);
                    defer.resolve();
                }, 0);
                return defer.promise();
            },
            createMainTable: function (grid) {
                var $MainTable = grid.target, MainTable = $MainTable[0], id = grid.id;
                $MainTable.empty();//清空主表内容
                var swidth = MainTable.style['width'], sheight = MainTable.style['height'];//原有宽高
                swidth = isEmpty(swidth) ? '100%' : swidth;//存在值时使用值 否则使用最大自动化
                sheight = isEmpty(sheight) ? '100%' : sheight;//存在值时使用值 否则使用最大自动化
                $MainTable.addClass(grid.skin.mainTable_CSS);//设置样式 这里使用覆盖防止样式冲突
                $MainTable.attr('style', grid.skin.mainTable_STYLE);//设置风格 这里使用覆盖防止样式冲突
                $MainTable.prop('skinCSS', 'mainTable_CSS');
                $MainTable.prop('skinStyle', 'mainTable_STYLE');
                MainTable.style.width = swidth;//宽度设置
                MainTable.style.height = sheight;//高度设置
                var MainTbody = document.createElement('TBODY'), $MainTbody = $(MainTbody),
                    MainTr = document.createElement('TR'), $MainTr = $(MainTr),
                    MainTd = document.createElement('TD'), $MainTd = $(MainTd);
                $MainTr.attr('id', id + '_MainTr');
                $MainTr.addClass(grid.skin.mainTr_CSS);
                $MainTr.attr('style', grid.skin.mainTr_STYLE);
                $MainTr.prop('skinCSS', 'mainTr_CSS');
                $MainTr.prop('skinStyle', 'mainTr_STYLE');
                $MainTd.attr('id', id + '_MainTd');
                $MainTd.addClass(grid.skin.mainTd_CSS);
                $MainTd.attr('style', grid.skin.mainTd_STYLE);
                $MainTd.prop('skinCSS', 'mainTd_CSS');
                $MainTd.prop('skinStyle', 'mainTd_STYLE');
                $MainTr.append($MainTd);
                $MainTbody.append($MainTr);
                $MainTable.append($MainTbody);
                grid.$MainTable = $MainTable;//结构存储方便获取 提高效率
                return $MainTable;
            },
            createDivBox: function (grid) {
                var $MainTable = grid.$MainTable, id = grid.id;
                var DivBox = document.createElement('DIV'), $DivBox = $(DivBox);
                var $Container = $(document.createElement('TABLE')),
                    $ContainerBody = $(document.createElement('TBODY'));
                $DivBox.attr('id', id + '_DivBox');
                $DivBox.addClass(grid.skin.boxDiv_CSS);
                $DivBox.attr('style', grid.skin.boxDiv_STYLE)
                $DivBox.prop('skinCSS', 'boxDiv_CSS');
                $DivBox.prop('skinStyle', 'boxDiv_STYLE');
                $Container.addClass(grid.skin.container_CSS)
                $Container.attr('style', grid.container_STYLE);
                $Container.prop('skinCSS', 'container_CSS');
                $Container.prop('skinStyle', 'container_STYLE');
                $Container.append($ContainerBody);
                $DivBox.append($Container);
                $MainTable.find('td:first').append($DivBox);
                grid.$DivBox = $DivBox;
                grid.$Container = $Container;
                return $DivBox;
            },
            createDivShadow: function (grid) {
                var $DivBox = grid.$DivBox, id = grid.id;
                var DivShadow = document.createElement('DIV'), $DivShadow = $(DivShadow);
                $DivShadow.attr('id', id + '_DivShadow');
                $DivShadow.addClass(grid.skin.shadowDiv_CSS);
                $DivShadow.attr('style', grid.skin.shadowDiv_STYLE);
                $DivShadow.prop('skinCSS', 'shadowDiv_CSS');
                $DivShadow.prop('skinStyle', 'shadowDiv_STYLE');
                if (!isEmpty(grid.skin.msgDiv_HTML)) {
                    var $DivMsg = $(grid.skin.msgDiv_HTML);
                    $DivMsg.attr('id', id + '_DivMsg');
                    $DivShadow.append($DivMsg);
                    grid.$DivMsg = $DivMsg;
                } else {
                    grid.$DivMsg = null;
                }
                $DivBox.prepend($DivShadow);
                grid.$DivShadow = $DivShadow;
                return $DivShadow;
            },
            createDivToolBar: function (grid) {
                var $Container = grid.$Container, id = grid.id;
                var DivToolBar = document.createElement('DIV'), $DivToolBar = $(DivToolBar);
                $DivToolBar.attr('id', id + '_DivToolBar');
                $DivToolBar.addClass(grid.skin.toolBar_CSS);
                $DivToolBar.attr('style', grid.skin.toolBar_STYLE);
                $DivToolBar.prop('skinCSS', 'toolBar_CSS');
                $DivToolBar.prop('skinStyle', 'toolBar_STYLE');
                var $tr = $(document.createElement('TR'));
                var $td = $(document.createElement('TD'));
                $td[0].style.width = '100%';
                $td.append($DivToolBar);
                $tr.append($td)
                if (grid.option.isToolbar != true) $tr.hide();
                $Container.prepend($tr);
                grid.$DivToolBar = $DivToolBar;
                $td.height($DivToolBar.height());
                return $DivToolBar;
            },
            createHeadContent: function (grid) {
                var $Container = grid.$Container, id = grid.id;
                var HeadContent = document.createElement('DIV'), $HeadContent = $(HeadContent);
                $HeadContent.attr('id', id + '_HeadContent');
                $HeadContent.addClass(grid.skin.headContent_CSS);
                $HeadContent.attr('style', grid.skin.headContent_STYLE);
                $HeadContent.prop('skinCSS', 'headContent_CSS');
                $HeadContent.prop('skinStyle', 'headContent_STYLE');
                $HeadContent[0].style.height = '100%';
                $HeadContent[0].style.width = '100%';
                $HeadContent[0].style.position = 'relative';
                $HeadContent[0].style.overflow = 'hidden';
                var $tr = $(document.createElement('TR'));
                var $td = $(document.createElement('TD'));
                $td[0].style.width = '100%';
                $td.append($HeadContent);
                $tr.append($td)
                $Container.append($tr);
                grid.$HeadContent = $HeadContent;
                return $HeadContent;
            },
            createDivHead: function (grid) {
                var $HeadContent = grid.$HeadContent, id = grid.id;
                var DivHead = document.createElement('DIV'), $DivHead = $(DivHead);
                $DivHead.attr('id', id + '_DivHead');
                $DivHead.addClass(grid.skin.divHead_CSS);
                $DivHead.attr('style', grid.skin.divHead_STYLE);
                $DivHead.prop('skinCSS', 'divHead_CSS');
                $DivHead.prop('skinStyle', 'divHead_STYLE');
                $DivHead[0].style.position = 'absolute';
                $HeadContent.append($DivHead);
                grid.$DivHead = $DivHead;
                return $DivHead;
            },
            createDivBody: function (grid) {
                var $Container = grid.$Container, id = grid.id;
                var DivBody = document.createElement('DIV'), $DivBody = $(DivBody);
                $DivBody.attr('id', id + '_DivBody');
                $DivBody.addClass(grid.skin.divBody_CSS);
                $DivBody.attr('style', grid.skin.divBody_STYLE);
                $DivBody.prop('skinCSS', 'divBody_CSS');
                $DivBody.prop('skinStyle', 'divBody_STYLE');
                $DivBody[0].style.overflowX = 'scroll';
                $DivBody[0].style.overflowY = 'scroll';
                var $tr = $(document.createElement('TR'));
                var $td = $(document.createElement('TD'));
                $tr.attr('name', 'container_body');
                $td[0].style.width = '100%';
                $td.append($DivBody);
                $tr.append($td)
                $Container.append($tr);
                $DivBody[0].style.width = '100%';
                $DivBody[0].style.height = '100%';
                grid.$DivBody = $DivBody;
                return $DivBody;
            },
            createDivFoot: function (grid) {
                var $Container = grid.$Container, id = grid.id;
                var DivFoot = document.createElement('DIV'), $DivFoot = $(DivFoot);
                $DivFoot.attr('id', id + '_DivFoot');
                $DivFoot.addClass(grid.skin.divFoot_CSS);
                $DivFoot.attr('style', grid.skin.divFoot_STYLE);
                $DivFoot.prop('skinCSS', 'divFoot_CSS');
                $DivFoot.prop('skinStyle', 'divFoot_STYLE');
                var $tr = $(document.createElement('TR'));
                var $td = $(document.createElement('TD'));
                $td[0].style.width = '100%';
                $td.append($DivFoot);
                $tr.append($td);
                if (grid.option.isFoot != true) $tr.hide();
                $Container.append($tr);
                grid.$DivFoot = $DivFoot;
                $td.height($DivFoot.height());
                return $DivFoot;
            },
            createTool: function (grid) {
                grid.$DivToolBar.empty();
                var $Tool = grid.loader.load.loadTool(grid);
                grid.$Tool = $Tool;
                if (!isEmpty($Tool)) {
                    $Tool.attr('id', grid.id + '_ToolBar');
                    grid.$DivToolBar.append($Tool);
                }
            },
            createHead: function (grid) {
                grid.$DivHead.empty();
                var $Head = grid.loader.load.loadHead(grid);
                grid.$Head = $Head;
                if (!isEmpty($Head)) {
                    $Head.attr('id', grid.id + '_Head');
                    grid.$DivHead.append($Head);
                }
            },
            createBody: function (grid) {
                grid.$DivBody.empty();
                var $Body = grid.loader.load.loadBody(grid);
                grid.$Body = $Body;
                if (!isEmpty($Body)) {
                    $Body.attr('id', grid.id + '_Body');
                    grid.$DivBody.append($Body);
                    grid.dataManager.checkLinkAge.call(grid);
                }
            },
            createFoot: function (grid) {
                grid.$DivFoot.empty();
                if (grid.$DivFoot.width() >= 700) {
                    grid.option.pager.model = 'full';
                } else if (grid.$DivFoot.width() >= 350 && grid.$DivFoot.width() <= 700) {
                    grid.option.pager.model = 'normal';
                } else if (grid.$DivFoot.width() < 350) {
                    grid.option.pager.model = 'tiny';
                }
                var $Foot = grid.loader.load.loadFoot(grid);
                grid.$Foot = $Foot;
                if (!isEmpty($Foot)) {
                    $Foot.attr('id', grid.id + '_Foot');
                    grid.$DivFoot.append($Foot);
                }
            },
            initSize: function (grid) {
                if (grid.visible != true) return false;
                var $FirstShowRow = grid.$Container.find('tbody:first>tr:visible:first');
                $FirstShowRow.css('border', 'none');
                $FirstShowRow.children('td').css('borderTop', '0px');
                grid.overFlowPly = grid.$DivBody[0].offsetWidth - grid.$DivBody[0].clientWidth;//获得滚动条厚度
                if (grid.$DivBody[0].offsetWidth == 0 || grid.$DivBody[0].clientWidth == 0) {
                    //IE兼容性 当不设置宽高时clientWidth无法获得
                    grid.$DivBody.css({'width': 20, 'height': 20});
                    grid.overFlowPly = grid.$DivBody[0].offsetWidth - grid.$DivBody[0].clientWidth;//获得滚动条厚度
                }
                var $Head = grid.$Head;
                if (!isEmpty($Head)) {
                    $Head.find('div.skynetGridContent').hide();//除去内容影响保证宽度真实
                    grid.ColumnBound = {width: grid.$Head.outerWidth(), height: grid.$Head.outerHeight()};
                    //获得自定义列长度
                    var columnCnt = grid.option.columnCfg.length;
                    if (grid.option.isCheck === true)  columnCnt--;
                    if (grid.option.isIndex === true)  columnCnt--;
                    grid.columnCnt = columnCnt;
                    //获得内容水平内补白
                    var $Content = $Head.find('th[field][columnCfg]>div:first');
                    grid.TextPaddingX = (parseInt($Content.css("paddingLeft")) || 0) + (parseInt($Content.css("paddingRight")) || 0);
                    grid.$HeadContent.parent('td').height(grid.ColumnBound.height);
                    var lackWidth = grid.$HeadContent.innerWidth() - grid.overFlowPly - grid.ColumnBound.width;
                    //获得并且像素化初始默认列宽
                    var columnIndex = 0;
                    if (lackWidth > 0) {
                        //自动补满平铺
                        var avgWidth = grid.columnCnt == 0 ? 0 : parseInt(lackWidth / grid.columnCnt);
                        var lastWidth = grid.columnCnt == 0 ? 0 : lackWidth % grid.columnCnt;
                        $.each(grid.option.columnCfg, function (i, column) {
                            var field = column.field;
                            if (field == 'gridCk') return true;
                            var $column = $Head.find('th[field="' + field + '"][columnCfg]');
                            var _width = $column.width();
                            var _innerWidth = $column.innerWidth();
                            if (field != 'gridIndex') {
                                _width = _width + avgWidth;
                                _innerWidth = _innerWidth + avgWidth;
                                if ((grid.columnCnt - 1) == columnIndex) {
                                    _width = _width + lastWidth;
                                    _innerWidth = _innerWidth + lastWidth;
                                }
                                grid.loader.load.createColumnStyle(column.className, grid, _width + 'px', (_innerWidth - grid.TextPaddingX) + 'px');
                                columnIndex++;
                            } else {
                                grid.loader.load.createColumnStyle(column.className, grid, _width + 'px', (_innerWidth - grid.TextPaddingX) + 'px');
                            }
                            $column.prop('dWidth', $column.width());
                            $column.prop('dInWidth', $column.innerWidth());
                        });
                    } else {
                        //默认平铺
                        $.each(grid.option.columnCfg, function (i, column) {
                            var field = column.field;
                            if (field == 'gridCk') return true;
                            var $column = $Head.find('th[field="' + field + '"][columnCfg]');
                            var _width = $column.width();
                            var _innerWidth = $column.innerWidth();
                            grid.loader.load.createColumnStyle(column.className, grid, _width + 'px', (_innerWidth - grid.TextPaddingX) + 'px');
                            $column.prop('dWidth', $column.width());
                            $column.prop('dInWidth', $column.innerWidth());
                        });
                    }
                    $Head.find('div.skynetGridContent').show();
                }
                //设置内容高度
                grid.$DivBody.css({'width': grid.$DivBody.parent('td').width(), 'height': grid.$DivBody.parent('td').height(), 'position': 'absolute'});
                grid.$DivBody.parent('td').css({'position': 'relative', 'verticalAlign': 'top'});
                var fixHeight = 0;
                grid.$Container.find('tbody:first>tr:visible').each(function () {
                    var $this = $(this);
                    if ($this.attr('name') != 'container_body') fixHeight += $this.outerHeight();
                    else {
                        fixHeight += (parseInt($this.children('td:first').css("borderTopWidth")) || 0);
                    }
                });
                grid.fixHeight = fixHeight;
                grid.ColumnBound = {width: grid.$Head.outerWidth(), height: grid.$Head.outerHeight()};
            },
            loadTool: function (grid) {
                var tools = grid.option.tools;
                var $Table = $(document.createElement('TABLE')),
                    $tbody = $(document.createElement('TBODY'));
                $Table.append($tbody);
                $Table[0].style.cssText = 'width:100%;height:100%;';
                if (isEmpty(tools)) return  $Table;
                var $tr = $(document.createElement('TR')),
                    $td = $(document.createElement('TD'));
                for (var i = 0; i < tools.length; i++) {
                    var tool = tools[i];
                    if (isEmpty(tool)) continue;
                    tool = $.extend({}, grid.toolMode, tool, true);
                    var content = tool.content;
                    var events = tool.events;
                    var $element = $(content);
                    isEmpty(tool.id) && (tool.id = Math.uuid());
                    for (var prop in tool) {
                        if (prop == 'content' || prop == 'events') continue;
                        var item = tool[prop];
                        if (isEmpty(item)) continue;
                        $element.attr(prop, item);
                    }
                    if (!isEmpty(events)) {
                        for (var event in events) {
                            if (isEmpty(event)) continue;
                            $element.on(event, grid, events[event]);
                        }
                    }
                    $td.append($element);
                }
                $td.css({
                    'textAlign': (isEmpty(grid.option.toolAlign) ? 'left' : grid.option.toolAlign),
                    'paddingTop': '0',
                    'paddingBottom': '0',
                    'paddingLeft': '0',
                    'paddingRight': '0'
                });
                $tr.append($td);
                $tbody.append($tr);
                return $Table;
            },
            loadHead: function (grid) {
                grid.option.columnCfg = [];
                var columns = grid.option.columns;
                var $head = $(document.createElement('TABLE')),
                    $thead = $(document.createElement('THEAD'));
                $head.addClass(grid.skin.headTable_CSS);
                $head.prop('skinCSS', 'headTable_CSS');
                $head.append($thead);
                if (isEmpty(columns)) return $head;
                //生成表头（复合表头实现）
                grid.loader.load.analyseColumns(null, columns, 0, $thead, grid);
                var $HeadRow = $thead.children('tr');
                var maxIndex = $HeadRow.length - 1;//最大下标
                //多行表头
                if (maxIndex > 0) {
                    //单元格 列合并修正
                    $HeadRow.each(function (r) {
                        var $row = $(this), $before = null;
                        $row.find('th[field]').each(function (c) {
                            var $col = $(this);
                            if (c == 0) {
                                $before = $col;
                            } else {
                                if ($before.attr('field') == $col.attr('field')) {
                                    var colspan1 = isEmpty($before.attr('colspan')) ? 1 : Number($before.attr('colspan'))
                                    var colspan2 = isEmpty($col.attr('colspan')) ? 1 : Number($col.attr('colspan'))
                                    $before.attr('colspan', colspan1 + colspan2);
                                    $col.remove();
                                }
                            }
                        });
                    });
                    //单元格 行合并补全
                    $HeadRow.children('th[columnCfg]').each(function () {
                        var $th = $(this),
                            isRowSpan = $th.is('rowspan');
                        if (isRowSpan == true) return true;//若 存在自定义行合并则跳过
                        var rowIndex = $th.attr('rowIndex');//获得行下标
                        var span = maxIndex - rowIndex;//
                        if (span <= 0)return true;//若 行下标已经是最大行下标或者已经超过最大行下标时 跳过
                        $th.attr('rowspan', span + 1);//若存在差值则该单元格进行行合并补全
                    });
                }
                //行号列补全
                if (grid.option.isIndex === true) {
                    var $IndexTh = grid.loader.load.giveIndexTh($HeadRow, grid)
                    var className = 'column-' + Math.uuid();
                    $IndexTh.prop('columnCss', className);
                    $IndexTh.addClass(className);
                    $HeadRow.filter('tr:first').prepend($IndexTh);
                    grid.option.columnCfg.splice(0, 0, {field: 'gridIndex', className: className, columnReSize: true});
                }
                //全选列补全
                if (grid.option.isCheck === true) {
                    $HeadRow.filter('tr:first').prepend(grid.loader.load.giveCheckTh($HeadRow, grid));
                    grid.option.columnCfg.splice(0, 0, {field: 'gridCk'});
                }
                $HeadRow.children('th[id]').removeAttr('id');
                $HeadRow.children('th[pid]').removeAttr('pid');
                return $head;
            },
            loadTh: function (parentsCode, column, rowIndex, $Head, grid) {
                if (isEmpty(column)) return null;
                var isLeaf = isEmpty(column.childs);
                var parent = !isEmpty(parentsCode) ? parentsCode.split(',').pop() : null;
                var field = isEmpty(column.field) ? '' : column.field;
                var title = isEmpty(column.title) ? '' : column.title;
                var thAlign = isEmpty(column.thAlign) ? 'center' : column.thAlign;
                var rowSpan = isEmpty(column.rowSpan) ? 1 : column.rowSpan;
                var $row = $Head.find('tr:eq(' + rowIndex + ')');
                var $th = $(document.createElement('TH')), id = Math.uuid();
                //行不存在时 创建行
                if (isEmpty($row)) {
                    $row = $(document.createElement('TR'));
                    $Head.append($row);
                }
                $th.attr('field', field);
                $th.attr('title', title);
                $th.css('textAlign', thAlign);
                (rowSpan > 1) && ($th.attr('rowspan', rowSpan));//存在自定义行合并时使用自定义行合并
                //值设置
                var $textDiv = $(document.createElement('DIV'));
                $textDiv.addClass('skynetGridContent');
                $textDiv.css('textAlign', thAlign);
                $textDiv.html(title);
                //描述属性
                if (isLeaf == true) {
                    column = $.extend({}, grid.columnMode, column, true)
                    column.className = 'column-' + Math.uuid();
                    var width = !isEmpty(column.width) ? column.width : 'auto;';
                    grid.loader.load.createColumnStyle(column.className, grid, width, null);
                    $th.addClass(column.className);
                    $th.css('borderBottom', '0px');
                    $th.attr('columnCfg', 'true');
                    $th.attr('rowIndex', rowIndex);//记录深度（用于行合并）
                    $th.prop('columnCss', column.className);
                    grid.option.columnCfg.push(column);
                }
                $th.html($textDiv);
                //多行表头属性
                $th.attr('id', id);//自身标识
                !isEmpty(parent) && ($th.attr('pid', parent));//父标识
                //父列合并
                if (isLeaf == false) {
                    var range = column.childs.length;
                    if (range > 1) {
                        $th.attr('colspan', range);
                        (!isEmpty(parentsCode)) && ($Head.find(parentsCode).each(function () {
                            var $pth = $(this),
                                colspan = isEmpty($pth.attr('colspan')) ? 0 : Number($th.attr('colspan'));
                            $pth.attr('colspan', colspan + range);
                        }));
                    }
                }
                if (isEmpty(parentsCode)) {
                    parentsCode = '#' + id;
                } else {
                    parentsCode = ',#' + id;
                }
                $row.append($th);
                return parentsCode;
            },
            loadBody: function (grid) {
                var columnCfg = grid.option.columnCfg,
                    pageData = grid.option.pageData,
                    checkData = grid.option.checkData,
                    isHadCk = !isEmpty(checkData);
                var $Body = $(document.createElement('TABLE'));
                var $Tbody = $(document.createElement('TBODY'));
                $Body.addClass(grid.skin.bodyTable_CSS);
                $Body.prop('skinCSS', 'bodyTable_CSS');
                $Body.append($Tbody);
                if (isEmpty(pageData) || isEmpty(columnCfg)) {
                    var $block = $(document.createElement('div'));
                    $block.attr('name', 'bankBlock');
                    $block.css({'height': 1, 'width': grid.$Head.width()});
                    grid.$DivBody.append($block);
                    return $Body;
                }
                var page = grid.option.pager.page;
                var rows = grid.option.pager.rows;
                var isloadRowFn = !isEmpty(grid.callback.rowLoad) && typeof grid.callback.rowLoad === 'function';
                var i = 0, imax = pageData.length;
                for (; i < imax; i++) {
                    var row = pageData[i];
                    var $tr = grid.loader.load.loadRow(row, parseInt(i) + (page - 1) * rows, columnCfg, grid);
                    if (isHadCk && $.inArray(row.fieldId, checkData) > -1) {
                        grid.option.isCheck == true && ($tr.find('input[name="ck"]')[0].checked = true);
                    }
                    $Tbody.append($tr);
                    (isloadRowFn) && (grid.callback.rowLoad(row, $tr));
                }
                typeof grid.option.loadColGroup === 'function' && grid.loader.load.colSpan(grid);
                typeof grid.option.loadRowGroup === 'function' && grid.loader.load.rowSpan(grid);
                return $Body;
            },
            loadRow: function (rowData, rowIndex, columnCfg, grid) {
                var $tr = $(document.createElement('TR'));
                $tr.attr('index', parseInt(rowIndex));
                $tr.data('row.skynetGrid', rowData);
                $tr.attr('fieldId', grid.dataManager.getFieldId.call(grid, rowData));
                $.each(columnCfg, function (i, item) {
                    var column = item;
                    var field = column['field'];
                    var $Td = null, $contentDiv = null;
                    if (field == 'gridCk') {
                        //选择列 处理
                        $Td = $(document.createElement('TD'));
                        $Td.attr('field', 'gridCk');
                        $Td.addClass(grid.skin.checkColumn_CSS);
                        $Td.attr('style', grid.skin.checkColumn_STYLE);
                        $Td.prop('skinCSS', 'checkColumn_CSS');
                        $Td.prop('skinStyle', 'checkColumn_STYLE');
                        $contentDiv = $(document.createElement('DIV'));
                        $contentDiv.addClass('skynetGridContent');
                        $contentDiv.html('<input type="checkbox" name="ck"/>');
                        $Td.append($contentDiv);
                    } else if (field == 'gridIndex') {
                        //行号列 处理
                        $Td = $(document.createElement('TD'));
                        $Td.attr('field', 'gridIndex');
                        $Td.addClass(grid.skin.indexColumn_CSS);
                        $Td.addClass(item.className);
                        $Td.attr('style', grid.skin.indexColumn_STYLE);
                        $Td.prop('skinCSS', 'indexColumn_CSS');
                        $Td.prop('skinStyle', 'indexColumn_STYLE');
                        $contentDiv = $(document.createElement('DIV'));
                        $contentDiv.addClass('skynetGridContent');
                        $contentDiv.html(rowIndex + 1);
                        $Td.append($contentDiv);
                    } else {
                        //普通列处理
                        $Td = grid.loader.load.loadTd(column, rowData, rowIndex, grid);
                    }
                    $tr.append($Td);
                });
                return $tr;
            },
            loadTd: function (column, rowData, rowIndex, grid) {
                var $Td = grid.loader.load.buildCel(column, grid);
                var field = isEmpty(column.field) ? '' : column.field;
                $Td.attr('field', field);
                var val = grid.loader.load.getValueIgnoreCase(field, rowData);
                val = grid.loader.load.valueFormat(val, $Td);
                var content = null, text = '';
                if (typeof column.formatter == 'function')
                    content = column.formatter.call(grid, val, rowData, rowIndex, $.proxy(function (text) {
                        this.attr('title', text);
                        this.children('div').html(text);
                    }, $Td));
                var isDom = skynetIsDom(content);
                if (!isEmpty(content) && isDom) {
                    var $content = $(content);
                    if ($content.is('input:text,textarea')) {
                        text = $content.val();
                        $Td.attr('title', text);
                        $Td.children('div').html(text);
                    } else if ($content.is('select')) {
                        text = $content.find('option:selected').text();
                        $Td.attr('title', text);
                        $Td.children('div').html(text);
                    } else if ($content.is('div[data-skynettree]')) {
                    } else {
                        text = $content;
                        $Td.attr('title', val);
                        $Td.children('div').html(text);
                    }
                } else {
                    text = isEmpty(content) ? '' : content;
                    $Td.attr('title', text);
                    $Td.children('div').html(text);
                }
                return $Td;
            },
            loadFoot: function (grid) {
                var $Foot = $(document.createElement('DIV'));
                $Foot.addClass(grid.skin.footBar_CSS);
                $Foot.prop('skinCSS', 'footBar_CSS');
                if (grid.option.isPager === true) {
                    $Foot.addClass(grid.skin.pager)
                    grid.loader.load.loadPager($Foot, grid);
                }
                return $Foot;
            },
            loadPager: function ($page, grid) {
                if (isEmpty($page)) return;
                var pager = grid.option.pager;
                $page.skynetPager(pager, {
                    getDataSize: function () {
                        return pager.total;
                    },
                    loaderData: function () {
                        var that = this;
                        $.extend(true, pager, that.option);
                        grid.goPage(pager);
                    }
                });
            },
            fixSize: function (grid, change) {
                var id = grid.id;
                var $target = grid.target;
                var $Head = grid.$Head;
                var $Foot = grid.$Foot;
                var CWidth = $target.innerWidth();
                var CHeight = $target.innerHeight();
                if ((!isEmpty(CWidth) && CWidth > 0) || (!isEmpty(CHeight) && CHeight > 0)) {
                    if (grid.visible == false) {
                        //之前是影藏本次是显示 进行重新初始化
                        grid.visible = grid.target.is(':visible');
                        grid.loader.initSize(grid);
                    } else {
                        //非初始化改变大小
                        //宽度改变
                        if (change._w != change.w) {
                            //未拖动过列大小
                            if (grid.reSizeFlag != true) {
                                var columnIndex = 0;
                                var lackWidth = CWidth - grid.overFlowPly - grid.ColumnBound.width;
                                if (lackWidth > 0) {
                                    // 拉伸
                                    var avgWidth = grid.columnCnt == 0 ? 0 : parseInt(lackWidth / grid.columnCnt);
                                    var lastWidth = grid.columnCnt == 0 ? 0 : lackWidth % grid.columnCnt;
                                    $.each(grid.option.columnCfg, function (i, column) {
                                        var field = column.field;
                                        if (field == 'gridCk' || field == 'gridIndex') return true;
                                        var $column = $Head.find('th[field="' + field + '"][columnCfg]');
                                        var _width = $column.prop('dWidth');
                                        var _innerWidth = $column.prop('dInWidth');
                                        _width = _width + avgWidth;
                                        _innerWidth = _innerWidth + avgWidth;
                                        if ((grid.columnCnt - 1) == columnIndex) {
                                            _width = _width + lastWidth;
                                            _innerWidth = _innerWidth + lastWidth;
                                        }
                                        grid.loader.load.createColumnStyle(column.className, grid, _width + 'px', (_innerWidth - grid.TextPaddingX) + 'px');
                                        columnIndex++;
                                    });
                                } else if (lackWidth < 0) {
                                    // 平铺
                                    $.each(grid.option.columnCfg, function (i, column) {
                                        var field = column.field;
                                        if (field == 'gridCk' || field == 'gridIndex') return true;
                                        var $column = $Head.find('th[field="' + field + '"][columnCfg]');
                                        var _width = $column.width();
                                        var _innerWidth = $column.innerWidth();
                                        grid.loader.load.createColumnStyle(column.className, grid, _width + 'px', (_innerWidth - grid.TextPaddingX) + 'px');
                                    });
                                } else {
                                    // 默认
                                    $.each(grid.option.columnCfg, function (i, column) {
                                        var field = column.field;
                                        if (field == 'gridCk') return true;
                                        var $column = $Head.find('th[field="' + field + '"][columnCfg]');
                                        var _width = $column.prop('dWidth');
                                        var _innerWidth = $column.prop('dInWidth');
                                        grid.loader.load.createColumnStyle(column.className, grid, _width + 'px', (_innerWidth - grid.TextPaddingX) + 'px');
                                    });
                                }

                            }
                            //分页适应
                            if (grid.option.isPager === true && !isEmpty($Foot)) {
                                if (CWidth >= 700 && grid.option.pager.model != 'full') {
                                    grid.option.pager.model = 'full';
                                    grid.loader.load.loadPager($Foot, grid);
                                } else if (CWidth >= 350 && CWidth <= 700 && grid.option.pager.model != 'normal') {
                                    grid.option.pager.model = 'normal';
                                    grid.loader.load.loadPager($Foot, grid);
                                } else if (CWidth < 350 && grid.option.pager.model != 'tiny') {
                                    grid.option.pager.model = 'tiny';
                                    grid.loader.load.loadPager($Foot, grid);
                                }
                            }
                            grid.$DivBody.css({'width': CWidth});
                        }
                        //高度改变
                        if (change._h != change.h) {
                            grid.$DivBody.css({'height': CHeight - (grid.fixHeight || 0)});
                        }
                    }
                }
                grid.visible = grid.target.is(':visible');
            },
            rowSpan: function (grid) {
                var $DivBody = grid.$DivBody;
                var groups = grid.option.loadRowGroup;
                if (isEmpty(groups) || groups.length <= 0) return;
                function merger(group) {
                    var groupData = [], _element = null;
                    if (isEmpty(group.checkGroup) || typeof group.checkGroup !== 'function')
                        group.checkGroup = function (before, now) {
                            return false;
                        };
                    function doGroup(now, $btd, $ntd) {
                        var bData = $btd.parent().data('row.skynetGrid');
                        var nData = $ntd.parent().data('row.skynetGrid');
                        var msg = group.checkGroup(bData, nData);
                        if (typeof msg == 'boolean')msg = {flag: msg};
                        if (msg.flag == true) {
                            groupData[groupData.length - 1].rowspan += 1;
                            !isEmpty(msg.html) && (groupData[groupData.length - 1].html = msg.html)
                        } else {
                            groupData.push(clone(now));
                        }
                    };
                    var expression = 'td:not([field="gridCk"]):not([field="gridIndex"])[field="' + group.Field + '"]';
                    $DivBody.find('table:first>tbody>tr').each(function (r) {
                        var $tr = $(this);
                        var $td = $tr.children(expression);
                        var val = $td.html();
                        var node = {Field: group.Field, html: val, rowspan: 1, index: r};
                        if (groupData.length == 0) {
                            groupData.push(node);
                        } else {
                            doGroup(node, _element, $td);
                        }
                        _element = $td;
                    });
                    var i = 0, imax = groupData.length;
                    for (; i < imax; i++) {
                        var item = groupData[i];
                        if (item.rowspan > 1) {
                            $DivBody.find('table:first>tbody>tr:eq(' + item.index + ')>' + expression).html(item.html);
                            $DivBody.find('table:first>tbody>tr:eq(' + item.index + ')>' + expression).attr('rowspan', item.rowspan);
                            $DivBody.find('table:first>tbody>' + 'tr:lt(' + (item.index + item.rowspan) + '):gt(' + item.index + ')>' + expression).attr('merger', 'true');
                        }
                    }
                    $DivBody.find(expression + '[merger]').remove();
                }

                var i = 0, imax = groups.length;
                for (; i < imax; i++) {
                    var group = groups[i];
                    if (isEmpty(group)) continue;
                    merger(group)
                }
            },
            colSpan: function (grid) {
                var $DivBody = grid.$DivBody;
                var groups = grid.option.loadColGroup;
                if (isEmpty(groups)) return;
                function merger(group) {
                    var rowData = [], groupData = [];
                    if (isEmpty(group.checkGroup) || typeof group.checkGroup !== 'function')
                        group.checkGroup = function (rowData, beforeField, nowField) {
                            return false;
                        };
                    function doGroup(now, $btd, $ntd) {
                        var rowData = $ntd.parent().data('row.skynetGrid');
                        var msg = group.checkGroup(rowData, $btd.attr('field'), now.Field);
                        if (typeof msg == 'boolean')msg = {flag: msg};
                        if (msg.flag == true) {
                            groupData[groupData.length - 1].colspan += 1;
                            !isEmpty(msg.html) && (groupData[groupData.length - 1].html = msg.html)
                        } else {
                            groupData.push(clone(now));
                        }
                    };
                    var expression = 'td:not([field="gridCk"]):not([field="gridIndex"])';
                    $DivBody.find('table:first>tbody>tr').each(function (r) {
                        var $tr = $(this);
                        var _element = null;
                        groupData = [];
                        $tr.children(expression).each(function (i) {
                            var $td = $(this), field = $td.attr('field'), val = $td.html();
                            var node = {Field: field, html: val, rowNumber: r, colNumber: i, colspan: 1};
                            if (groupData.length == 0) {
                                groupData.push(node);
                            } else {
                                doGroup(node, _element, $td);
                            }
                            _element = $td;
                        });
                        rowData.push(clone(groupData));
                    });
                    var i = 0, imax = rowData.length;
                    for (; i < imax; i++) {
                        var rowGroupData = rowData[i];
                        if (isEmpty(rowGroupData) || rowGroupData.length <= 0) continue;
                        var j = 0, jmax = rowGroupData.length;
                        for (; j < jmax; j++) {
                            var item = rowGroupData[j];
                            if (isEmpty(item) || item.colspan <= 1) continue;
                            $DivBody.find('table:first>tbody>tr:eq(' + i + ')>' + expression + ':eq(' + item.colNumber + ')').html(item.html);
                            $DivBody.find('table:first>tbody>tr:eq(' + i + ')>' + expression + ':eq(' + item.colNumber + ')').attr('colspan', item.colspan);
                            $DivBody.find('table:first>tbody>tr:eq(' + i + ')>' + expression + ':lt(' + (item.colNumber + item.colspan) + '):gt(' + item.colNumber + ')').attr('merger', 'true');
                        }
                    }
                    $DivBody.find(expression + '[merger]').remove();
                }

                merger(groups);
            },
            analyseColumns: function (parentsCode, columns, deep, $thead, grid) {
                if (isEmpty(columns)) return;
                if (isEmpty(deep)) deep = 0;
                var i = 0, imax = columns.length;
                for (; i < imax; i++) {
                    var column = columns[i];
                    if (isEmpty(column)) continue;
                    var code = grid.loader.load.loadTh(parentsCode, column, deep, $thead, grid);
                    var childs = column.childs;
                    if (!isEmpty(childs)) {
                        var nextRow = deep + 1;
                        grid.loader.load.analyseColumns(code, childs, nextRow, $thead, grid);
                    }
                }
            },
            createColumnStyle: function (id, grid, contentWidth, divWidth) {
                if (isEmpty(id))return;
                var $style = $('#styleColumn_' + id);
                if (!isEmpty($style))
                    $style.empty();
                else {
                    $style = $(document.createElement('style'));
                    $style[0].type = 'text/css';
                    $style[0].id = 'styleColumn_' + id;
                }
                var minWidth = contentWidth;
                if (!isEmpty(contentWidth)) contentWidth = 'width:' + contentWidth + ';';
                else contentWidth = '';
                if (minWidth == 'auto' || isEmpty(minWidth)) minWidth = '';
                else minWidth = 'min-width:' + minWidth + ' !important;';

                var _minWidth = divWidth;
                if (!isEmpty(divWidth)) divWidth = 'width:' + divWidth + ';';
                else divWidth = '';
                if (_minWidth == 'auto' || isEmpty(_minWidth)) _minWidth = '';
                else _minWidth = 'min-width:' + _minWidth + ' !important;';

                var _style = '';
                if (!isEmpty(contentWidth + minWidth)) {
                    _style = '.' + id + '{' + contentWidth + minWidth + '}';
                }
                if (!isEmpty(divWidth + _minWidth)) {
                    _style += '.' + id + '>div.skynetGridContent{' + divWidth + _minWidth + '}'
                }
                if (!isEmpty(_style)) $style.html(_style);
                if (!isEmpty(grid.$DivHead)) grid.$DivHead.append($style);
            },
            getValueIgnoreCase: function (key, data) {
                var val = '';
                if (!isEmpty(key) && !isEmpty(data[key])) {
                    val = data[key];
                } else if (!isEmpty(key) && !isEmpty(data[key.toLowerCase()])) {
                    val = data[key.toLowerCase()];
                } else if (!isEmpty(key) && !isEmpty(data[key.toUpperCase()])) {
                    val = data[key.toUpperCase()];
                }
                return val;
            },
            buildCel: function (column, grid) {
                var Td = document.createElement('TD'), $Td = $(Td);
                var $columnTd = grid.$Head.find('[field="' + column.field + '"][columnCfg]');
                var cAlign = isEmpty(column.rowAlign) ? 'center' : column.rowAlign;
                //样式设置
                $Td.css({textAlign: cAlign});
                //加入自定义属性
                if (!isEmpty(column.attr)) {
                    for (var key in column.attr) {
                        $Td.attr(key, column.attr[key]);
                    }
                }
                var $textDiv = $(document.createElement('DIV'));
                $textDiv.attr('name', 'textContent');
                $textDiv.addClass('skynetGridContent');
                $textDiv.css({textAlign: cAlign});
                $Td.addClass(column.className);
                $Td.append($textDiv);
                return $Td;
            },
            valueFormat: function (val, $Td) {
                if (isEmpty(val)) return '';
                else {
                    if ($.type(val) === 'boolean' || $.type(val) === 'regexp')val = val.toString();
                    if ($.type(val) === 'date') val = '' + val.getDate();
                    if ($.type(val) === 'string') {
                        var isFormat = $Td.is('[dateFormat]'), format = $Td.attr('dateFormat');
                        if (isFormat && win.RegIsTime.test(val)) {
                            if (isEmpty(format)) format = 'yyyy-MM-dd';
                            var date = new Date(val);
                            val = date.format(format);
                        }
                    }
                    return val;
                }
            },
            giveCheckTh: function ($HeadRow, grid) {
                var $CheckTh = $(document.createElement('TH'));
                var $contentDiv = $(document.createElement('DIV'));
                $CheckTh.addClass(grid.skin.checkColumn_CSS);
                $CheckTh.attr('style', grid.skin.checkColumn_STYLE);
                $CheckTh.css('borderBottom', '0px');
                $CheckTh.attr('columnCfg', 'true');
                $CheckTh.attr('field', 'gridCk');
                $CheckTh.attr('rowspan', $HeadRow.length);
                $CheckTh.prop('skinCSS', 'checkColumn_CSS');
                $CheckTh.prop('skinStyle', 'checkColumn_STYLE');
                $contentDiv.addClass('skynetGridContent');
                $contentDiv.html('<input type="checkbox" name="thck"/>');
                $CheckTh.append($contentDiv);
                return $CheckTh
            },
            giveIndexTh: function ($HeadRow, grid) {
                var $IndexTh = $(document.createElement('TH'));
                var $contentDiv = $(document.createElement('DIV'));
                $IndexTh.addClass(grid.skin.indexColumn_CSS);
                $IndexTh.attr('style', grid.skin.indexColumn_STYLE);
                $IndexTh.css('borderBottom', '0px');
                $IndexTh.attr('columnCfg', 'true');
                $IndexTh.attr('field', 'gridIndex');
                $IndexTh.attr('rowspan', $HeadRow.length);
                $IndexTh.prop('skinCSS', 'indexColumn_CSS');
                $IndexTh.prop('skinStyle', 'indexColumn_STYLE');
                $contentDiv.addClass('skynetGridContent');
                $contentDiv.html('序号');
                $IndexTh.append($contentDiv);
                return $IndexTh
            }
        },
        event: {
            bindEvent: function () {
                var grid = this,
                    $DivHead = grid.$DivHead,
                    $DivBody = grid.$DivBody;
                //双击单元格前禁止 浏览器双击选中
                $DivBody.attr('onselectstart', 'return false');
                //滚动事件处理
                $DivBody.on('scroll.skynetGrid', function (e) {
                    $DivHead.css('left', -(this.scrollLeft || 0));
                });
                //全选行 事件绑定
                $DivHead.find('input[name="thck"]').on('click.skynetGrid', grid, grid.loader.event.clickThCk);
                //单选行checkBox事件委托绑定
                $($DivBody.find('tbody:first>tr>td input[name="ck"]'), $DivBody[0]).live('click.skynetGrid', grid, grid.loader.event.clickCk);
                //单击行
                $($DivBody.find('tbody:first>tr'), $DivBody[0]).live('click.skynetGrid', grid, grid.loader.event.clickRow);
                //双击行
                $($DivBody.find('tbody:first>tr'), $DivBody[0]).live('dblclick.skynetGrid', grid, grid.loader.event.dbClickRow);
                //单击单元格
                $($DivBody.find('tbody:first>tr>td'), $DivBody[0]).live('click.skynetGrid', grid, grid.loader.event.clickCell);
                //双击单元格
                $($DivBody.find('tbody:first>tr>td'), $DivBody[0]).live('dblclick.skynetGrid', grid, grid.loader.event.dbClickCell);
                //编辑框缩回控制
                $(document).on('mousedown.skynetGrid', function (e) {
                    var dom = null, flag = false;
                    if (flag == false) {
                        dom = $(e.target).filter('.skynetGridContentTips');
                        flag = dom.is('div');
                    }
                    if (flag == false) {
                        dom = $(e.target).parents('.skynetGridContentTips');
                        flag = dom.is('div');
                    }
                    if (flag == false) {
                        dom = $(e.target).filter('[data-skynetfloat]');
                        flag = dom.is('div');
                    }
                    if (flag == false) {
                        dom = $(e.target).parents('[data-skynetfloat]');
                        flag = dom.is('div');
                    }
                    if (flag == false) {
                        $('body').find('div.skynetGridContentTips').each(function () {
                            var $this = $(this);
                            var data = $this.data('gridContent');
                            var $content = $this.children('*:first');
                            var fid = $content.data('skynetfloat');
                            var isShow = $content.is('[data-isShowFloat="true"]');
                            if (!isEmpty(fid) && isShow) return true;
                            data.grid.loader.event.leaveContent.call(this);
                        })
                    } else {
                        var isFloat = dom.is('[data-skynetfloat]');
                        var _fid = dom.data('skynetfloat') || '';
                        $('body').find('div.skynetGridContentTips').each(function () {
                            var $this = $(this);
                            var data = $this.data('gridContent');
                            var $content = $this.children('*:first');
                            if (isFloat) {
                                var fid = $content.data('skynetfloat');
                                (_fid != fid) && data.grid.loader.event.leaveContent.call(this);
                            } else {
                                (this != dom[0]) && data.grid.loader.event.leaveContent.call(this);
                            }
                        })
                    }
                    e.stopPropagation();
                });
                //自适应大小
                grid.loader.event.autoBound(grid);
            },
            destroy: function () {
                var grid = this;
                var tools = grid.option.tools;
                if (!isEmpty(tools)) {
                    var $DivToolBar = grid.$DivToolBar;
                    var i = 0, imax = tools.length;
                    for (; i < imax; i++) {
                        var tool = tools[i];
                        if (isEmpty(tool)) continue;
                        $DivToolBar.find('#' + tool.id).off();
                    }
                }
                grid.$DivHead.find('input[name="thck"]').off('.skynetGrid');
                grid.$DivHead.find('th').off('.skynetGrid');
                grid.$DivBody.off('.skynetGrid');
                grid.$DivBody.die('.skynetGrid');
                grid.target.off('.skynetGrid');
            },
            clickThCk: function (e) {
                var flag = $(this)[0].checked;
                var grid = e.data;
                grid.$DivBody.find('input[name="ck"]').each(function () {
                    var $ck = $(this);
                    var $row = $ck.parents('tr:first');
                    var row = $row.data('row.skynetGrid');
                    var key = row.fieldId;
                    if (flag == true) {
                        $ck[0].checked = true;
                        $.inArray(key, grid.option.checkData) <= -1 && grid.option.checkData.push(key);
                    } else {
                        $ck[0].checked = false;
                        var index = $.inArray(key, grid.option.checkData);
                        index > -1 && grid.option.checkData.splice(index, 1);
                    }
                    if (typeof grid.callback.afterCheck === 'function')
                        grid.callback.afterCheck.call(grid, $row, row, $ck[0].checked);
                });
            },
            clickCk: function (e) {
                var grid = e.data;
                var $rowck = $(this);
                var $row = $rowck.parents('tr:first');
                var row = $row.data('row.skynetGrid');
                var key = row.fieldId;
                if ($rowck[0].checked == true) {
                    $.inArray(key, grid.option.checkData) <= -1 && grid.option.checkData.push(key);
                } else {
                    var index = $.inArray(key, grid.option.checkData);
                    index > -1 && grid.option.checkData.splice(index, 1);
                }
                if (typeof grid.callback.afterCheck === 'function')
                    grid.callback.afterCheck.call(grid, $row, row, $rowck[0].checked);
                grid.dataManager.checkLinkAge.call(grid);
            },
            clickRow: function (e) {
                var grid = e.data;
                var id = grid.id;
                grid.$DivBody.find('#' + id + '_Body>tbody>tr').removeClass(grid.skin.selectRow_CSS);
                $(this).addClass(grid.skin.selectRow_CSS);
                if (typeof grid.callback.onClickRow === 'function') {
                    var row = $(this).data('row.skynetGrid');
                    grid.callback.onClickRow.call(grid, $(this), row, e);
                }
            },
            dbClickRow: function (e) {
                var grid = e.data;
                var id = grid.id;
                grid.$DivBody.find('#' + id + '_Body>tbody>tr').removeClass(grid.skin.selectRow_CSS);
                $(this).addClass(grid.skin.selectRow_CSS);
                if (typeof grid.callback.onDbClickRow === 'function') {
                    var row = $(this).data('row.skynetGrid');
                    grid.callback.onDbClickRow.call(grid, $(this), row, e);
                }
            },
            clickCell: function (e) {
                var grid = e.data;
                if (typeof grid.callback.onClickCell === 'function') {
                    var row = $(this).parents('tr:first').data('row.skynetGrid');
                    grid.callback.onClickCell.call(grid, $(this), row, e);
                }
            },
            dbClickCell: function (e) {
                var grid = e.data;
                var $Td = $(this);
                var $Tr = $Td.parent('tr');
                var rowData = $Tr.data('row.skynetGrid');
                var rowIndex = $Tr.attr('index');
                var field = $Td.attr('field');
                var val = grid.loader.load.getValueIgnoreCase(field, rowData);
                val = grid.loader.load.valueFormat(val, $Td);
                var column = skynetFind(grid.option.columnCfg, function (item) {
                    return field == item.field;
                }, null, true);
                var content = val, $content = null;
                if (column.isShowMore == true) {
                    if (typeof column.formatter == 'function')
                        content = column.formatter.call(grid, val, rowData, rowIndex, $.proxy(function (text) {
                            this.attr('title', text);
                            this.children('div').html(text);
                        }, $Td));
                    var isDom = skynetIsDom(content);
                    if (!isEmpty(content) && isDom) {
                        $content = $(content);
                        if ($content.is('input:text')) {
                            $content.attr("readonly", "readonly");
                        } else if ($content.is('select')) {
                            $content.attr("disabled", "disabled");
                        } else if ($content.is('textarea')) {
                            $content.attr("readonly", "readonly");
                        } else if ($content.is('div[data-skynettree]')) {
                            if (isEmpty($content.data('tree.skynetTree'))) {
                                $content.attr("readonly", "readonly");
                            } else {
                                $content.skynetTree('readonly', true);
                            }
                        }
                    } else {
                        content = $(document.createElement('textarea'));
                        $content = $(content);
                        $content.addClass('skynetEditGridTextArea');
                        $content.html(val);
                        $content.attr("readonly", "readonly");
                    }
                    var $contentDiv = $(document.createElement('DIV'));
                    $contentDiv.attr('gid', grid.id);
                    $contentDiv.attr('name', 'viewContent');
                    $contentDiv.addClass('skynetGridContent');
                    $contentDiv.addClass('skynetGridContentTips');
                    $contentDiv.data('gridContent', {grid: grid, $Td: $Td, $Tr: $Tr});
                    $contentDiv.append($content);
                    var site = grid.target.offset();
                    site['width'] = grid.target.innerWidth();
                    site['height'] = grid.target.innerHeight();
                    site['right'] = site['width'] + site.left;
                    site['bottom'] = site['height'] + site.top;
                    var winSize = getWindowBound(win);
                    var _site = {};
                    if (site['right'] - e.pageX < 300) {
                        _site['right'] = winSize.width - e.pageX;
                    } else {
                        _site['left'] = e.pageX;
                    }

                    if (site['bottom'] - e.pageY < 100) {
                        _site['bottom'] = winSize.height - e.pageY;
                    } else {
                        _site['top'] = e.pageY;
                    }
                    $contentDiv.css(_site);
                    $('body').append($contentDiv);
                }
                if (typeof grid.callback.onClickCell === 'function') {
                    grid.callback.onDbClickCell.call(grid, $(this), rowData, e);
                }
            },
            leaveContent: function () {
                var $contentDiv = $(this);
                var $content = $contentDiv.children('*:first');
                if (!isEmpty($content.data('tree.skynetTree'))) $content.skynetTree('destroy');
                $contentDiv.remove();
            },
            autoBound: function (grid) {
                grid.target.on('resizeElement.skynetGrid', grid, function (e) {
                    e.data.loader.load.fixSize(e.data, $(this).data('resizeElementSpecialEvent'))
                    e.stopPropagation();
                    return false;
                });
            }
        }
    };
    var edit = {
        load: {
            loadBody: function (grid) {
                grid.option.loadColGroup = null;
                grid.option.loadRowGroup = null;
                var $Body = normal.load.loadBody(grid);
                $Body.removeAttr('Class');
                $Body.addClass(grid.skin.bodyEditTable_CSS)
                $Body.prop('skinCSS', 'bodyEditTable_CSS');
                return $Body;
            },
            loadTd: function (column, rowData, rowIndex, grid) {
                var $Td = normal.load.loadTd(column, rowData, rowIndex, grid);
                var field = isEmpty(column.field) ? '' : column.field;
                var isEdit = isEmpty(column.columnEdit) ? true : column.columnEdit;
                var val = grid.loader.load.getValueIgnoreCase(field, rowData);
                val = grid.loader.load.valueFormat(val, $Td);
                $Td.prop('reValue', val);
                isEdit == true && $Td.attr('columnEdit', 'true');
                return $Td;
            }
        },
        event: {
            dbClickCell: function (e) {
                var grid = e.data;
                var $Td = $(this);
                var $Tr = $Td.parent('tr');
                var rowData = $Tr.data('row.skynetGrid');
                var rowIndex = $Tr.attr('index');
                var isEdit = $Td.is('[columnEdit]');
                var field = $Td.attr('field');
                var val = grid.loader.load.getValueIgnoreCase(field, rowData);
                val = grid.loader.load.valueFormat(val, $Td);
                var column = skynetFind(grid.option.columnCfg, function (item) {
                    return field == item.field;
                }, null, true);
                if (column.isShowMore == true) {
                    var content = val, $content = null;
                    if (typeof column.formatter == 'function')
                        content = column.formatter.call(grid, val, rowData, rowIndex, $.proxy(function (text) {
                            this.attr('title', text);
                            this.children('div').html(text);
                        }, $Td));
                    var isDom = skynetIsDom(content);
                    if (!isEmpty(content) && isDom) {
                        $content = $(content);
                        if ($content.is('input:text')) {
                            isEdit != true && $content.attr("readonly", "readonly");
                        } else if ($content.is('select')) {
                            isEdit != true && $content.attr("disabled", "disabled");
                        } else if ($content.is('textarea')) {
                            isEdit != true && $content.attr("readonly", "readonly");
                        } else if ($content.is('div[data-skynettree]')) {
                            if (isEmpty($content.data('tree.skynetTree'))) {
                                isEdit != true && $content.attr("readonly", "readonly");
                            } else {
                                isEdit != true && $content.skynetTree('readonly', true);
                            }
                        }
                    } else {
                        content = $(document.createElement('textarea'));
                        $content = $(content);
                        $content.addClass('skynetEditGridTextArea');
                        $content.html(val);
                        isEdit != true && $content.attr("readonly", "readonly");
                    }
                    var $contentDiv = $(document.createElement('DIV'));
                    $contentDiv.attr('gid', grid.id);
                    $contentDiv.attr('name', 'editContent');
                    $contentDiv.addClass('skynetGridContent');
                    $contentDiv.addClass('skynetGridContentTips');
                    $contentDiv.data('gridContent', {grid: grid, $Td: $Td, $Tr: $Tr});
                    $contentDiv.append($content);
                    var site = grid.target.offset();
                    site['width'] = grid.target.innerWidth();
                    site['height'] = grid.target.innerHeight();
                    site['right'] = site['width'] + site.left;
                    site['bottom'] = site['height'] + site.top;
                    var winSize = getWindowBound(win);
                    var _site = {};
                    if (site['right'] - e.pageX < 300) {
                        _site['right'] = winSize.width - e.pageX;
                    } else {
                        _site['left'] = e.pageX;
                    }

                    if (site['bottom'] - e.pageY < 100) {
                        _site['bottom'] = winSize.height - e.pageY;
                    } else {
                        _site['top'] = e.pageY;
                    }
                    $contentDiv.css(_site);
                    $('body').append($contentDiv);
                }
                if (typeof grid.callback.onDbClickCell === 'function')
                    grid.callback.onDbClickCell.call(grid, $(this), rowData, e);
            },
            leaveContent: function () {
                var $contentDiv = $(this);
                var $content = $contentDiv.children('*:first');
                var data = $contentDiv.data('gridContent');
                var $td = data.$Td;
                var $textDiv = $td.children('div[name="textContent"]');
                var $tr = data.$Tr;
                var grid = data.grid;
                var row = $tr.data('row.skynetGrid');
                var rowId = $tr.attr('fieldid');
                var index = $tr.attr('index');
                var field = $td.attr('field');
                var isEdit = $td.is('[columnEdit]');
                if (isEdit == true) {
                    var gridData = grid.option.data;
                    var changeData = grid.option.changeData;
                    var addData = grid.option.addData;
                    if (isEmpty(changeData)) grid.option.changeData = changeData = {};
                    var isAddRow = !isEmpty(addData) && !isEmpty(addData[rowId]);
                    var defaultValue = grid.loader.load.valueFormat(row[field], $td);
                    var nowValue = grid.loader.load.valueFormat($content.val(), $td);
                    //行值更新
                    row[field] = nowValue;
                    //显示值更新
                    var text = '';
                    if ($content.is('input:text,textarea')) {
                        text = nowValue;
                        $td.attr('title', text);
                    } else if ($content.is('select')) {
                        text = $content.find('option:selected').text();
                        $td.attr('title', text);
                    } else if ($content.is('div[data-skynetTree]')) {
                        text = $content.data('stext') || '';
                        $td.attr('title', text);
                    } else {
                        text = $content.clone(false);
                    }
                    $td.prop('reValue', nowValue);
                    $textDiv.html(text);
                    //数据更新
                    if (!isEmpty(gridData) && !isEmpty(gridData.rows)) gridData.rows[index] = row;
                    if (isAddRow === true) {
                        //如果是新增出来的行
                        addData[rowId] = clone(row);
                    } else {
                        //如果不是新增出来的行
                        //单元格变更标记
                        if (defaultValue == nowValue) {
                            $td.removeAttr('isChange');
                        } else {
                            $td.attr('isChange', 'true');
                        }
                        if ($tr.find('td[isChange]').length > 0) {
                            changeData[rowId] = clone(row);
                        } else {
                            !isEmpty(changeData[rowId]) && (delete changeData[rowId])
                        }
                    }
                }
                if (!isEmpty($content.data('tree.skynetTree'))) $content.skynetTree('destroy');
                $contentDiv.remove();
            }
        }
    };
    skynetLoaders.setLoader('normal.skynetGrid', normal);
    skynetLoaders.setLoader('edit.skynetGrid', $.extend(true, {}, normal, edit));
})(skynetGrid, window);
/*skynetGrid 遮罩控制*/
(function (skynetGrid, win) {
    var shadowBox = function (flag) {
        var grid = this;
        var $shadowDiv = grid.$DivShadow, $msgDiv = grid.$DivMsg;
        flag = (isEmpty(flag) ? (!$shadowDiv.is(':visible')) : flag);
        if (!isEmpty($msgDiv)) {
            if (flag === true) {
                $shadowDiv.show();
                $msgDiv.show();
                var msgleft = parseInt(($shadowDiv.width() - $msgDiv.width()) / 2),
                    msgtop = parseInt(($shadowDiv.height() / 2) - $msgDiv.height());
                $msgDiv.css({top: msgtop, left: msgleft});
            } else {
                $shadowDiv.hide();
                $msgDiv.hide();
            }
        }
    };
    skynetGrid.prototype.shadow = shadowBox;
})(skynetGrid, window);
/*skynetGrid 数据处理*/
(function (skynetGrid, win) {
    var load = function (type) {
        var grid = this;
        grid.loadType = isEmpty(type) ? 'init' : type;
        if (isEmpty(grid.option.url) || (grid.option.pager.pageType == 0 && grid.loadType == 'pager')) {
            grid.dataManager.dataLoad.call(grid, grid.option.loadData);
        } else {
            $.ajax({type: grid.option.method, cache: false, dataType: 'json',
                url: grid.option.url, data: grid.option.params})
                .fail(function (XHR, TS) {
                    if (TS.indexOf('error') > -1) {
                        grid.shadow(false);
                        throw new Error('数据请求错误！！');
                    }
                })
                .done(function (datas) {
                    if (typeof(datas) === 'string') {
                        try {
                            datas = JSON.parse(datas);
                        } catch (e) {
                            grid.shadow(false);
                            throw new Error('数据解析错误，请返回标准json数据！！');
                            return false;
                        }
                    }
                    grid.dataManager.dataLoad.call(grid, datas);
                });
        }
    };
    var dataLoad = function (loadData) {
        var grid = this,
            type = grid.loadType,
            url = grid.option.url,
            loadCount = grid.loadCount,
            callback = grid.callback;
        grid.loadCount = loadCount + 1;
        loadData = isEmpty(loadData) ? {rows: [], ck: []} : loadData;
        //TODO 使用HTML5 WebWork多线程替代
        setTimeout(function () {
            grid.option.loadData = clone(loadData);
        }, 0);
        if ((!isEmpty(url) && grid.option.pager.pageType == 1) || loadCount == 0 || type != 'pager') {
            if (typeof callback.loadFilter === 'function') {
                var _data = callback.loadFilter.call(grid, loadData);
                grid.option.data = isEmpty(_data) ? {rows: [], ck: []} : _data;
            } else {
                grid.option.data = loadData;
            }
            grid.dataManager.buildData.call(grid);
        }
        grid.option.pageData = grid.dataManager.getPagerData.call(grid);
        grid.loader.load.loadWorking(grid).done(function () {
            grid.aop.ending.go.call(grid);
        });
    };
    var buildData = function () {
        var grid = this, data = null,
            _data = grid.option.data;
        if ($.isArray(_data)) {
            data = {rows: _data, ck: []};
        } else {
            data = _data;
        }
        if (isEmpty(data)) data = {};
        if (isEmpty(data['rows'])) data['rows'] = [];
        if (isEmpty(data['ck'])) data['ck'] = [];
        grid.option.checkData = data['ck'];
        grid.option.addData = {};
        grid.option.changeData = {};
        grid.option.removeData = [];
        grid.option.searchData = [];
        grid.option.data = data;
    };
    var getPagerData = function () {
        var grid = this,
            pageData = [],
            data = grid.option.data;
        var pager = grid.option.pager;
        if (grid.option.isPager == false) {
            pager.total = data.rows.length;
            pager.pageCount = 1;
            pager.page = 1;
            pageData = data.rows;
            return pageData;
        }
        if (grid.option.pager.pageType == 0 || isEmpty(grid.option.url)) {
            pager.total = data.rows.length;//总条数
            if (isEmpty(pager.total) || pager.total < 0) pager.total = 0;
            (isEmpty(pager.page) || pager.page < 1) && (pager.page = 1);//当前页码
            (isEmpty(pager.rows) || pager.rows < 1) && (pager.rows = 10);//页大小（每页显示条数）
            pager.pagecount = Math.ceil(pager.total / pager.rows);//页总数
            if (isEmpty(pager.pagecount) || pager.pagecount <= 0) pager.pagecount = 1;
            //当前页大于 页总数时直接返回
            if (pager.page > pager.pagecount) return [];
            //页大小*页码-1（当前页最大数据下标）-页大小=当前页数据最小下标
            var min = (pager.rows * (pager.page - 1)) > 0 ? pager.rows * (pager.page - 1) : 0;
            //页大小*页码-1=当前页最大数据下标
            var max = (pager.rows * pager.page - 1) > pager.total - 1 ? pager.total - 1 : pager.rows * pager.page - 1;
            for (var i = min; i <= max; i++) {
                pageData.push(data.rows[i]);
            }
            return pageData;
        } else if (grid.option.pager.pageType == 1 && !isEmpty(grid.option.url)) {
            if (isEmpty(data.pager)) {
                pager.total = data.rows.length;
                pager.pageCount = 1;
                pager.page = 1;
                pageData = data.rows;
            } else {
                //分页配置设置
                pager.total = isEmpty(data.pager['recordCount']) ? 0 : data.pager['recordCount'];//总条数
                pager.page = isEmpty(data.pager['pageNumber']) ? 1 : data.pager['pageNumber'];//当前页码
                pager.rows = isEmpty(data.pager['pageSize']) ? 10 : data.pager['pageSize'];//页大小（每页显示条数）
                pager.pagecount = isEmpty(data.pager['pageCount']) ? 1 : data.pager['pageCount'];//总页码数
                pageData = data.rows;
            }
            return pageData;
        }
    };
    var getCheckData = function () {
        return isEmpty(this.option.checkData) ? [] : clone(this.option.checkData);
    };
    var getAddData = function () {
        return isEmpty(this.option.addData) ? [] : _.values(clone(this.option.addData));
    };
    var getChangeData = function () {
        return isEmpty(this.option.changeData) ? [] : _.values(clone(this.option.changeData));
    };
    var getRemoveData = function () {
        return isEmpty(this.option.removeData) ? [] : _.values(clone(this.option.removeData));
    };
    var saveAsRequest = function (params) {
        var grid = this;
        if (isEmpty(grid.option.saveUrl)) return;
        if (typeof grid.callback.onBeforeSubmit === 'function' && grid.callback.onBeforeSubmit.call(grid) != true) return;
        grid.shadow(true);
        $.ajax({
            type: 'POST',
            cache: false,
            dataType: 'json',
            url: grid.option.saveUrl,
            data: params
        }).fail(function (XHR, TS) {
                if (TS.indexOf('error') > -1) {
                    grid.shadow(false);
                    throw new Error('数据请求错误！！');
                }
            }).done(function (datas) {
                grid.shadow(false);
                if (typeof grid.callback.onSubmitSuccess === 'function')
                    grid.callback.onSubmitSuccess.call(grid, datas);
            });
    };
    var getFieldId = function (item) {
        if (!isEmpty(item.fieldId))
            return item.fieldId;
        else {
            var key = this.option.fieldId;
            if (isEmpty(key)) {
                item.fieldId = Math.uuid();
                return item.fieldId;
            }
            var fieldId = item[key];
            if (!isEmpty(fieldId)) {
                item.fieldId = fieldId;
                return fieldId;
            }
            fieldId = item[key.toLowerCase()];
            if (!isEmpty(fieldId)) {
                item.fieldId = fieldId;
                return fieldId;
            }
            fieldId = item[key.toUpperCase()];
            if (!isEmpty(fieldId)) {
                item.fieldId = fieldId;
                return fieldId;
            }
        }
    };
    var checkLinkAge = function () {
        var grid = this;
        var $ck = grid.$DivBody.find('input[name="ck"]');
        var $thck = grid.$DivHead.find('input[name="thck"]');
        if (!isEmpty($thck) && !isEmpty($ck)) {
            if ($ck.filter(':not([disabled])').length > 0) {
                //若存在可选
                if ($ck.filter(':not([disabled]):not(:checked)').length > 0) {
                    $thck[0].checked = false;
                } else {
                    $thck[0].checked = true;
                }
            }
            else
                $thck[0].checked = false;
        }
    };
    var dataManager = {
        load: load,
        dataLoad: dataLoad,
        buildData: buildData,
        getFieldId: getFieldId,
        checkLinkAge: checkLinkAge,
        getPagerData: getPagerData,
        getCheckData: getCheckData,
        getAddData: getAddData,
        getChangeData: getChangeData,
        getRemoveData: getRemoveData,
        saveAsRequest: saveAsRequest
    };
    skynetGrid.prototype.dataManager = dataManager;
})(skynetGrid, window);
/*TODO skynetGrid 静态数据筛选 使用HTML5 WebWork 多线程处理*/
(function (skynetGrid, win) {
    var expression = function () {
    };
    var find = function (expression) {
    };
    var staticFind = {
        expression: expression,
        find: find
    };
    skynetGrid.prototype.staticFind = staticFind;
})(skynetGrid, window);
/*skynetGrid 公开方法*/
(function (skynetGrid, win) {
    var reBuildIndexAndPager = function (index) {
        var grid = this, $rows = grid.$Body.find('tbody:first>tr');
        //行号重计算
        $rows.each(function () {
            var $row = $(this);
            $row.attr('index', index);
            $row.children('td[field="gridIndex"]').html(index + 1);
            index++;
        });
        //分页重计算
        if (grid.option.isPager === true) {
            var pager = grid.option.pager;
            grid.$Foot.skynetPager(pager, {
                getDataSize: function () {
                    return pager.total;
                },
                loaderData: function () {
                    $.extend(true, pager, this.option);
                    grid.goPage(pager);
                }
            });
        }
    };
    var getGrid = function (filter) {
        return $(filter).data('grid.skynetGrid');
    };
    var addRow = function (data) {
        var grid = this;
        if (grid.option.mode.toLowerCase() != 'edit') return;
        var pager = grid.option.pager;
        var $Body = grid.$Body;
        var $tbody = $Body.find('tbody:first');
        var addData = grid.option.addData;
        var min = (pager.rows * (pager.page - 1)) > 0 ? pager.rows * (pager.page - 1) : 0;//当前页数据最小下标
        $Body.hide();
        if (isEmpty(data)) data = {fieldId: Math.uuid()};
        grid.option.data.rows.splice(min, 0, data);//向grid.option.data添加新增行数据
        addData[data.fieldId] = data;//向grid.option.addData添加新增行数据
        //重新进行分页计算
        if (grid.option.pager.pageType == 0 || isEmpty(grid.option.url)) {
            //静态分页
            //加入后若当前页总行数大于页大小时删除最后一行
            if ($tbody.children('TR').length == pager.rows) {
                $tbody.children('TR').last().remove();
            }
            grid.option.pageData = grid.dataManager.getPagerData.call(grid); //页数据重赋值
        } else if (grid.option.pager.pageType == 1 && !isEmpty(grid.option.url)) {
            //动态分页
            //添加多行数据，当数量超过页大小时，动态分页将会彻底将你的操作行为刷新
            //因此动态分页插入算法是不能进行分页重计算的只能在当前页无限加
            pager.total = pager.total + 1;
            grid.option.pageData = data.rows;//页数据重赋值
        }
        var $tr = grid.loader.load.loadRow(data, min, grid.option.columnCfg, grid);//创建行
        $tbody.prepend($tr);//首行加入
        if (typeof grid.callback.rowLoad === 'function')
            grid.callback.rowLoad(data, $tr);
        $Body.show(0);//chrome 首行加入时会出现CSS渲染BUG 用此方法就能修正
        if (grid.option.isCheck == true)
            grid.$DivHead.find('input[name ="thck"]')[0].checked = false;
        reBuildIndexAndPager.call(grid, min);
    };
    var removeRow = function (fids) {
        var grid = this;
        if (grid.option.mode.toLowerCase() != 'edit') return;
        var gridData = grid.option.data;
        //已经删光了 直接退出
        if (isEmpty(gridData) || isEmpty(gridData.rows)) return;
        var $Tbody = grid.$Body.find('tbody:first');
        //若不传参数那么 fids=选中值
        if (isEmpty(fids)) fids = grid.dataManager.getCheckData.call(grid);
        //若还没有选中值则默认 fids=当前页首行
        if (isEmpty(fids)) {
            var _id = $Tbody.children('tr:first').attr('fieldid');
            if (!isEmpty(_id)) fids = [_id];
        }
        //若fids还是为空那么认为没有删除的数据直接返回
        if (isEmpty(fids)) return;
        if (!$.isArray(fids)) {
            if (typeof fids == 'number')
                fids = [fids];
            else {
                fids = '' + fids;
                fids = fids.split(',');
            }
        }
        var removeCount = 0;//删除行数
        var pager = grid.option.pager;
        var addData = grid.option.addData;
        var checkData = grid.option.checkData;
        var changeData = grid.option.changeData;
        var removeData = grid.option.removeData;
        var isCheckData = !isEmpty(checkData);
        var isChangeData = !isEmpty(changeData);
        var isAddData = !isEmpty(addData);
        var pageType = (grid.option.pager.pageType == 1) && (!isEmpty(grid.option.url));
        //删除行为 TODO 使用HTML5 WebWork 多线程处理
        for (var i = gridData.rows.length - 1; i >= 0; i--) {
            var row = gridData.rows[i];
            if (isEmpty(row)) continue;
            var fieldId = grid.dataManager.getFieldId.call(grid, row);
            if ($.inArray((fieldId), fids) > -1) {
                //删除数据存储
                removeData[row.fieldId] = clone(row);
                //向grid.option.data删除数据
                gridData.rows.splice(i, 1);
                if (isCheckData) {
                    var site1 = $.inArray(fieldId, checkData);
                    site1 > -1 && checkData.splice(site1, 1);
                }
                if (isChangeData) {
                    var site2 = $.inArray(fieldId, changeData);
                    site2 > -1 && changeData.splice(site2, 1);
                }
                if (isAddData) delete addData[fieldId];
                //若是动态分页则页面数据删除
                if (pageType == true) $Tbody.children('tr[fieldid="' + row.fieldId + '"]').remove();
                removeCount++;
            }
        }
        if (pageType == true) {
            //动态分页
            pager.total = pager.total - removeCount > 0 ? 0 : 0;
            grid.option.pageData = gridData.rows;
            var min = (pager.rows * (pager.page - 1)) > 0 ? pager.rows * (pager.page - 1) : 0;
            reBuildIndexAndPager.call(grid, min);
        } else {
            //静态分页
            //分页重计算并重新渲染（存在跨页删除所以要这么做）
            grid.option.pageData = grid.dataManager.getPagerData.call(grid);
            grid.loader.load.loadWorking(grid);
        }
        grid.dataManager.checkLinkAge.call(grid);
    };
    var changeRow = function (fieldId, data) {
        if (isEmpty(fieldId)) return;
        if (isEmpty(data)) data = {fieldId: fieldId};
        var grid = this;
        if (grid.option.mode.toLowerCase() != 'edit') return;
        var gridData = grid.option.data;
        if (isEmpty(gridData) || isEmpty((gridData.rows))) return;
        var $Tbody = grid.$Body.find('tbody:first');
        var isAddData = !isEmpty(grid.option.addData[fieldId]);
        //变更行为 TODO 使用HTML5 WebWork 多线程处理
        setTimeout(function () {
            $.each(gridData.rows, function (index, row) {
                if (isEmpty(row)) return true;
                var rowId = grid.dataManager.getFieldId.call(grid, row);
                if (('' + fieldId) == ('' + rowId)) {
                    data.fieldId = rowId;
                    gridData.rows[index] = data;
                    if (isAddData) grid.option.addData[rowId] = data;
                    grid.option.changeData[rowId] = data;
                }
            });
        }, 0);
        var $tr = $Tbody.find('tr[fieldid="' + fieldId + '"]');
        if ($tr.length > 0) {
            var $newTr = grid.loader.load.loadRow(data, parseInt($tr.attr('index')) || 0, grid.option.columnCfg, grid);
            $tr.replaceWith($newTr);
            if (typeof grid.callback.rowLoad === 'function')
                grid.callback.rowLoad(data, $newTr);
        }
    };
    var getSelectRow = function () {
        var $row = this.$DivBody.find('tr.' + this.skin.selectRow_CSS);
        var row = $row.length > 0 ? $row.data('row.skynetGrid') : null;
        if (!isEmpty(row)) return clone(row);
        return null;
    };
    var checkRow = function (fids, flag) {
        var grid = this;
        if (isEmpty(fids) || grid.option.isCheck != true) return;
        if (!$.isArray(fids)) {
            if (typeof fids == 'number')
                fids = [fids];
            else {
                fids = '' + fids;
                fids = fids.split(',');
            }
        }
        var $Tbody = grid.$Body.find('tbody:first');
        $.each(fids, function (i, fid) {
            if (isEmpty(fid)) return true;
            var $row = $Tbody.find('tr[fieldid="' + fid + '"]');
            var $ck = $Tbody.find('tr[fieldid="' + fid + '"]>td[field="gridCk"] input[name="ck"]');
            if (flag == true) {
                $.inArray(fid, grid.option.checkData) <= -1 && grid.option.checkData.push(fid)
                if ($ck.length > 0) $ck[0].checked = true;
            } else {
                if ($ck.length > 0) $ck[0].checked = false;
                var index = $.inArray(fid, grid.option.checkData);
                index > -1 && grid.option.checkData.splice(index, 1);
            }
            if (typeof grid.callback.afterCheck === 'function')
                grid.callback.afterCheck.call(grid, $row, $row.data('row.skynetGrid'), $ck[0].checked);
        });
        grid.dataManager.checkLinkAge.call(grid);
    };
    var getRow = function (ids) {
        var grid = this;
        var data = grid.option.data;
        if (isEmpty(ids) || isEmpty(data) || isEmpty(data.rows)) return null;
        if (!$.isArray(ids)) {
            if (typeof ids == 'number')
                ids = [ids];
            else {
                ids = '' + ids;
                ids = ids.split(',');
            }
        }
        var rows = [];
        $.each(grid.option.data.rows, function (index, row) {
            var fieldId = grid.dataManager.getFieldId.call(grid, row);
            if (_.contains(ids, fieldId))  rows.push(clone(row));
        });
        return rows;
    };
    var submit = function () {
        var grid = this;
        var ck = grid.dataManager.getCheckData.call(grid).join(',');
        var newData = grid.dataManager.getAddData.call(grid);
        var changeData = grid.dataManager.getChangeData.call(grid);
        var removeData = grid.dataManager.getRemoveData.call(grid);
        isEmpty(newData) ? newData = '' : newData = JSON.stringify(newData);
        isEmpty(changeData) ? changeData = '' : changeData = JSON.stringify(changeData);
        isEmpty(removeData) ? removeData = '' : removeData = JSON.stringify(removeData);
        var params = {"ck": ck, "new": newData, "change": changeData, "remove": removeData};
        grid.dataManager.saveAsRequest.call(grid, params);
    };
    var fnStore = {
        getGrid: getGrid,//根据id获得grid
        addRow: addRow,//添加行
        removeRow: removeRow,//删除行
        changeRow: changeRow,//变更行
        getSelectRow: getSelectRow,//选中行
        checkRow: checkRow,//选中行
        getRow: getRow,//获得指定行
        getCheckData: skynetGrid.prototype.dataManager.getCheckData,
        getAddData: skynetGrid.prototype.dataManager.getAddData,
        getChangeData: skynetGrid.prototype.dataManager.getChangeData,
        getRemoveData: skynetGrid.prototype.dataManager.getRemoveData,
        submit: submit//提交
    }
    //Grid公开扩展方法 首个参数是方法名，后面的参数类型和数量由实际情况定
    var fn = function () {
        this.init = function () {
            var args = arguments, argArray = Array.prototype.slice.call(args, 1);
            var name = args[0];
            if (isEmpty(name) || isEmpty(fnStore[name])) return;
            return fnStore[name].apply(this, argArray);
        };
        return this.init.apply(this, arguments);
    };
    skynetGrid.prototype.fn = fn;//Grid公开方法
})(skynetGrid, window);
/*skynetGrid 添加拖拽列改变宽度 使用了JqueryUI resizable*/
(function (skynetGrid, win) {
    var reSizeColumn = {
        aopBuildQueue: function () {
            var grid = this;
            if (isEmpty(grid) || grid.option.isResize != true) return;
            var columnCfg = grid.option.columnCfg;
            if (isEmpty(columnCfg)) return;
            var $columns = grid.$Head.find('th[field][columnCfg]');
            var columnIndex = 0;
            if (typeof $.fn.resizable !== 'function') return;
            $.each(columnCfg, function (i, column) {
                if (isEmpty(column) || column.columnReSize != true) return true;
                var $column = grid.$Head.find('th[field="' + column.field + '"][columnCfg]');
                try {
                    $column.resizable({
                        handles: 'e',
                        distance: 1,
                        minWidth: $column.width(),
                        alsoResize: $column.children('div.skynetGridContent'),
                        start: function (e, ui) {
                            grid.reSizeFlag = true;
                        },
                        resize: function (e, ui) {
                            var step = ui.size.width - ui.originalSize.width;
                            grid.$Head.parent('div').width(grid.$Head.parent('div').width() + step);
                        },
                        stop: function (e, ui) {
                            var width = ui.size.width;
                            if (!isEmpty(ui.originalElement.prop('columnCss'))) {
                                grid.loader.load.createColumnStyle(column.className, grid, width + 'px', (width - grid.TextPaddingX) + 'px');
                            }
                            var $bankBlock = grid.$DivBody.children('div[name="bankBlock"]');
                            if (!isEmpty($bankBlock)) $bankBlock.width(grid.$Head.width());
                        }
                    });
                } catch (e) {
                    return false;
                }
            });
        }
    };
    win.skynetPlugins.setPlugin('reSizeColumn.skynetGrid', reSizeColumn);
})(skynetGrid, window);
/*jquery插件化支持*/
(function ($, win) {
    if (!isEmpty($) && isEmpty($.fn.skynetGrid)) {
        $.fn.skynetGrid = function (method) {
            var args = arguments, argArray = Array.prototype.slice.call(args, 1), val = [];
            this.each(function () {
                var _this = $(this),
                    grid = _this.data('grid.skynetGrid');
                if (!isEmpty(method) && !isEmpty(grid) && typeof(method) === 'string') {
                    val.push(grid.fn(method, args));
                } else if (typeof method === 'object' || isEmpty(method)) {
                    new skynetGrid(_this, args[0], args[1], args[2]);
                }
            });
            if (val.length <= 0)
                return this;
            else if (val.length == 1)
                return val[0];
            else if (val.length > 1)
                return val;
        };
    }
})(jQuery, window);