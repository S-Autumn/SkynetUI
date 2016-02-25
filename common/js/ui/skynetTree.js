/*
 * skynetTree
 * 下拉树树组件
 * 基于ztree封装扩展 感谢ztree原作者
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
    if (isEmpty(win.equalsSimpleArray)) win.equalsSimpleArray = function (list1, list2, isSort) {
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
/*skynetTree 构造方法*/
(function ($, win) {
    /*下拉树属性*/
    var option = {
        url: null,                      // 数据请求URL
        data: null,						// 静态节点数据
        mode: 'comboBox',               // 树模型 normal,comboBox
        isEdit: false,                  // 是否允许编辑
        isCheck: false,                 // 是否多选
        readonly: false,				// 树只读
        disabled: false,				// 树禁用
        isReSize: true,					// 外框是否能拖拽变更大小
        minWidth: 160,					// 下拉最小宽度
        minHeight: 120,					// 下拉最小高度
        zIndex: 120,					// 下拉框层级
        splitRegex: ',',                // 数据分割规则 默认是逗号 可以是其他正则或符号
        rootPId: null,                  // 根节点ID
        reId: "id",						// 树数据关联属性id 别名
        rePid: "pid",                   // 树数据关联属性pid 别名
        reValue: "id",					// 树选中值属性别名
        reText: "name",                 // 树选中显示值属性别名
        onBeforeCreate: null,           // 创建前
        onCreateSuccess: null,          // 创建完成
        onChange: null,                 // 值改变
        callBack: {
            beforeAsync: null,
            onAsyncSuccess: null,
            beforeClick: null,
            onClick: null,
            beforeExpand: null,
            onExpand: null,
            beforeCheck: null,
            onCheck: null,
            beforeDrag: null,
            beforeDrop: null,
            addNode: null,
            editNode: null,
            removeNode: null,
            moveNode: null
        }
    };
    /*ztree属性*/
    var setting = {
        async: {
            enable: true,							    // 是否开启异步加载模式  true为开启（当节点为父节点，且其下又不存在加载过的子节点时重新发送请求）
            type: "post",							    // 请求发送方式
            url: "",								    // 请求地址
            dataType: "json",						    // 数据接收类型
            autoParam: ["id"],						    // 默认发送节点的那个（些）参数   例如 ["id=zid"]   id必须是>>节点数据存在的属性<< 这里zid代表发送时别名
            otherParam: "",							    // 其他附带想发送到后台的参数 例如 { key1:value1, key2:value2 }
            dataFilter: null						    // 数据过滤 function ajaxDataFilter(treeId, parentNode, responseData) 返回数据进行预处理的函数 必须返回一个JSON数据对象
        },
        check: {
            enable: false,							    // 是否多选  为true时多选  false时单选
            chkDisabledInherit: false,				    // 当父节点设置 chkDisabled = true 时，设置子节点是否自动继承 chkDisabled = true
            nocheckInherit: false,					    // 当父节点设置 nocheck = true 时，设置子节点是否自动继承 nocheck = true
            chkStyle: "checkbox",					    // 勾选框类型(checkbox 或 radio）[setting.check.enable = true 时生效]
            radioType: "level",						    // radio 的分组范围 radioType = "level" 时在每一级节点范围内当做一个分组,radioType = "all" 时在整棵树范围内当做一个分组
            chkboxType: { "Y": "ps", "N": "ps" }	    // 勾选 checkbox 对于父子节点的关联关系 Y属性定义 checkbox 被勾选后的情况；N属性定义 checkbox 取消勾选后的情况；"p" 表示操作会影响父级节点；"s" 表示操作会影响子级节点。
        },
        data: {
            simpleData: {
                enable: true,						    // 数据类型 true简单类型（每个对象包含id、pid关系属性的数组） false需要标准数据（嵌套父子关系的JONS数据）
                idKey: "id",						    // 简单数据中的节点唯一标识属性
                pIdKey: "pid",						    // 简单数据中的父节点标识属性
                rootPId: null						    // 修正根节点的父属性值
            }
        }
    };
    /*配置合并初始化*/
    var initOption = function (tree, _option) {
        var config = tree.target.data('skynettree');
        if (!isEmpty(config)) $.extend(true, tree.option, config);
        var url = tree.target.attr('data-url');
        if (!isEmpty(url)) tree.option.url = url;
        if (!isEmpty(_option)) $.extend(true, tree.option, _option);
        if (isEmpty(tree.option.mode))  tree.option.mode = 'combobox';
        var _readonly = tree.target.is('[readonly="readonly"],[readonly="true"]');
        var _disabled = tree.target.is('[disabled="disabled"],[disabled="true"]');
        _readonly == true && (tree.option.readonly = _readonly);
        _disabled == true && (tree.option.disabled = _disabled);
        tree.aop = new SkynetAop(tree);
        tree.loader = new SkynetLoader(tree, skynetLoaders.getLoader(tree.option.mode + '.skynetTree'));
    };
    /*skynetTree实例方法*/
    var handles = {
        create: function (_option, _setting) {
            var tree = this;
            initOption(tree, _option);
            tree.aop.initing.add.call(tree, tree.loader.load.initSettings);
            tree.aop.building.add.call(tree, tree.loader.load.buildElement);
            tree.aop.building.add.call(tree, tree.loader.event.bindEvent);
            tree.loader.initing(_setting);
            tree.target.data('tree.skynetTree', tree);
            if (typeof tree.option.onBeforeCreate === 'function' && tree.option.onBeforeCreate.call(tree) == false) return tree.target;
            tree.loader.building();
            tree.loader.loading();
            return tree.target;
        },
        reload: function (_option, _setting) {
            var tree = this;
            initOption(tree, _option);
            tree.loader.initing(_setting);
            if (typeof tree.option.onBeforeCreate === 'function' && tree.option.onBeforeCreate.call(tree) == false) return tree.target;
            tree.loader.loading();
            return tree.target;
        },
        refresh: function () {
            var tree = this;
            setTimeout(function () {
                tree.plugins['zTree.skynetTree'].load();
            }, 0);
            return tree.target;
        },
        search: function (params) {
            var tree = this;
            tree.staticFind(params);
            return tree.target;
        },
        destroy: function () {
            var tree = this;
            tree.Tree.destroy();
            tree.loader.destroy();
            return tree.target;
        }
    };
    var skynetTree = function () {
        this.init = function () {
            var tar = arguments[0];
            if (typeof tar === 'string') {
                return $(tar).data('tree.skynetTree');
            } else {
                var $element = $(tar);
                if (isEmpty($element) || !$element.is('div') || !$element.is('[data-skynetTree]')) {
                    throw new Error('使用错误,请对正确的元素进行初始化！！');
                } else {
                    var _option = arguments[1],//属性配置
                        _setting = arguments[2];//ztree配置
                    var _id = isEmpty($element.attr('id')) ? Math.uuid() : $element.attr('id');
                    $element.attr('id', _id);
                    var tree = $element.data('tree.skynetTree');
                    if (!isEmpty(tree)) {
                        tree.reload.call(tree, _option, _setting);
                        return tree;
                    } else {
                        var that = this;
                        that.id = _id;//id记录
                        that.version = 2.0;//版本号
                        that.target = $element;//元素绑定
                        that.loader = null;
                        that.aop = null;
                        that.Tree = null;
                        that.plugins = null;
                        that.unloadVal = [];
                        that.unloadText = [];
                        that.option = clone(option);
                        that.setting = clone(setting);
                        for (var key in handles) {
                            that[key] = $.proxy(handles[key], that);
                        }
                        that.create.call(that, _option, _setting);
                        return this;
                    }
                }
            }
        };
        return this.init.apply(this, arguments);
    };
    win.skynetTree = win.SkynetTree = win.skynettree = skynetTree;
})($, window);
/*skynetTree Loader 加载器实现*/
(function ($, win) {
    var comboBox = {
        load: {
            initSettings: function (_setting) {
                var tree = this;
                var sName = isEmpty(tree.target.data('sname')) ? tree.target.attr('name') : tree.target.data('sname');
                var sValue = isEmpty(tree.target.data('svalue')) ? tree.target.val() : tree.target.data('svalue');
                sName = isEmpty(sName) ? '' : sName;
                sValue = isEmpty(sValue) ? '' : sValue;
                tree.target.removeAttr('data-sname');
                tree.target.removeAttr('data-svalue');
                tree.target.data('sname', sName);
                tree.target.data('svalue', sValue);
                tree.target.val(sValue);
                $.extend(true, tree.setting, _setting);
                tree.setting.async.url = tree.option.url;
                if (typeof tree.option.isCheck == "boolean") tree.setting.check.enable = tree.option.isCheck;
                tree.setting.callback = {};
                if (!isEmpty(tree.option.reId)) tree.setting.data.idKey = tree.option.reId;
                if (!isEmpty(tree.option.pIdKey)) tree.setting.data.pIdKey = tree.option.pIdKey;
                if (!isEmpty(tree.option.rootPId)) tree.setting.data.rootPId = tree.option.rootPId;
                tree.plugins = skynetPlugins.getPlugins('skynetTree');
                if (isEmpty(tree.plugins)) tree.plugins = null;
            },
            buildElement: function () {
                var tree = this;
                tree.loader.load.initTarget(tree);
                tree.$DivText = tree.loader.load.createDivText(tree);
                tree.$DivClear = tree.loader.load.createDivClear(tree);
                tree.$DivIcon = tree.loader.load.createDivIcon(tree);
                tree.$IptContent = tree.loader.load.createIptContent(tree);
                tree.$DivComboBox = tree.loader.load.createDivComboBox(tree);
                tree.$DivRMenu = tree.loader.load.createDivRMenu(tree);
                tree.$Tree = tree.loader.load.createTree(tree);
                tree.target.append(tree.$DivText);
                tree.target.append(tree.$DivClear);
                tree.target.append(tree.$DivIcon);
                tree.target.append(tree.$IptContent);
                tree.$DivComboBox.append(tree.$Tree);
                tree.loader.load.initSize(tree);
            },
            destroy: function () {
                var tree = this;
                tree.$DivComboBox.remove();
                tree.$IptContent.remove();
                tree.$DivIcon.remove();
                tree.$DivClear.remove();
                tree.$DivText.remove();
            },
            initTarget: function (tree) {
                tree.target.addClass('skynetComboTree');
                tree.target.empty();
            },
            createDivText: function (tree) {
                var $DivText = $(document.createElement('div'));
                $DivText.attr('name', 'divText');
                $DivText.text('请选择');
                $DivText.addClass('skynetComboTree-Text');
                return $DivText;
            },
            createDivClear: function (tree) {
                var $DivClear = $(document.createElement('div'));
                $DivClear.attr('name', 'divClear');
                $DivClear.addClass('skynetComboTree-Clear');
                return $DivClear;
            },
            createDivIcon: function (tree) {
                var $DivIcon = $(document.createElement('div'));
                $DivIcon.attr('name', 'divIcon');
                $DivIcon.addClass('skynetComboTree-Icon');
                return $DivIcon;
            },
            createIptContent: function (tree) {
                var name = tree.target.data('sname'),
                    value = tree.target.data('svalue');
                var content = document.createElement('input');
                content.type = 'text';
                var $IptContent = $(content);
                $IptContent.attr('name', name);
                $IptContent.val(value);
                $IptContent.hide();
                return $IptContent;
            },
            createDivComboBox: function (tree) {
                var $DivComboBox = $(document.createElement('div'));
                $DivComboBox.addClass('skynetComboBox');
                $DivComboBox.css({'minWidth': tree.option.minWidth, 'minHeight': tree.option.minHeight, 'zIndex': tree.option.zIndex});
                $DivComboBox[0].style.display = 'none';
                return $DivComboBox;
            },
            createDivRMenu: function (tree) {
                var $DivRMenu = $(document.createElement('div'));
                $DivRMenu.addClass('skynetTree-RMenu');
                $DivRMenu.hide();
                return $DivRMenu;
            },
            createTree: function (tree) {
                var $Tree = $(document.createElement('ul'));
                $Tree.attr('id', tree.id + '_tree');
                return $Tree;
            },
            initSize: function (tree) {
                tree.visible = tree.target.is(':visible');
                if (tree.visible) {
                    var width = tree.target.innerWidth();
                    var height = tree.target.innerHeight();
                    width = width - ((parseInt(tree.target.css('paddingLeft')) || 0) + (parseInt(tree.target.css('paddingRight')) || 0));
                    height = height - ((parseInt(tree.target.css('paddingTop')) || 0) + (parseInt(tree.target.css('paddingBottom')) || 0));
                    var textWidth = width - tree.$DivClear.width() - tree.$DivIcon.width();
                    var textHeight = height - (parseInt(tree.$DivText.css('paddingTop')) || 0) - (parseInt(tree.$DivText.css('paddingBottom')) || 0);
                    textWidth = textWidth - (parseInt(tree.$DivText.css('paddingLeft')) || 0) - (parseInt(tree.$DivText.css('paddingRight')) || 0);
                    tree.$DivText.width(textWidth);
                    tree.$DivText.height(textHeight);
                    tree.$DivClear.height(height);
                    tree.$DivIcon.height(height);
                    tree.$DivText.css('lineHeight', textHeight + 'px');
                    tree.$DivClear.css('lineHeight', (height + 5) + 'px');
                    tree.$DivIcon.css('lineHeight', height + 'px');
                }
            }
        },
        event: {
            bindEvent: function () {
                var tree = this;
                tree.target.on('resizeElement.skynetTree', tree, tree.loader.event.autoBound);
                tree.$DivClear.on('click.skynetTree', tree, tree.loader.event.clear);
            },
            destroy: function () {
                var tree = this;
                tree.target.off('.skynetTree');
                tree.$DivClear.off('.skynetTree');
            },
            autoBound: function (e) {
                var tree = e.data;
                tree.loader.load.initSize(tree)
            },
            clear: function (e) {
                var tree = e.data;
                if (tree.option.readonly != true && tree.option.disabled != true)
                    tree.fn('clear', true);
            }
        }
    };
    var normal = {
        load: {
            buildElement: function () {
                var tree = this;
                tree.loader.load.initTarget(tree);
                tree.$DivRMenu = tree.loader.load.createDivRMenu(tree);
                tree.$Tree = tree.loader.load.createTree(tree);
                tree.target.append(tree.$Tree);
            },
            destroy: function () {
                this.target.empty();
            },
            initSettings: function (_setting) {
                var tree = this;
                var sName = isEmpty(tree.target.attr('data-sname')) ? tree.target.attr('name') : tree.target.attr('data-sname');
                var sValue = isEmpty(tree.target.attr('data-svalue')) ? tree.target.val() : tree.target.attr('data-svalue');
                sName = isEmpty(sName) ? '' : sName;
                sValue = isEmpty(sValue) ? '' : sValue;
                tree.target.removeAttr('data-sname');
                tree.target.removeAttr('data-svalue');
                tree.target.data('sname', sName);
                tree.target.data('svalue', sValue);
                tree.target.val(sValue);
                $.extend(true, tree.setting, _setting);
                tree.setting.async.url = tree.option.url;
                if (typeof tree.option.isCheck == "boolean") tree.setting.check.enable = tree.option.isCheck;
                tree.setting.callback = {};
                if (!isEmpty(tree.option.reId)) tree.setting.data.idKey = tree.option.reId;
                if (!isEmpty(tree.option.pIdKey)) tree.setting.data.pIdKey = tree.option.pIdKey;
                if (!isEmpty(tree.option.rootPId)) tree.setting.data.rootPId = tree.option.rootPId;
                tree.plugins = skynetPlugins.getPlugins('skynetTree');
                if (!isEmpty(tree.plugins) && !isEmpty(tree.plugins['comboBox']))
                    delete tree.plugins['comboBox'];
                if (isEmpty(tree.plugins)) tree.plugins = null;
            },
            initTarget: function (tree) {
                tree.target.addClass('skynetTree');
                tree.target.empty();
                var zIndex = tree.target.css('zIndex'),
                    minWidth = tree.target.css('minWidth'),
                    minHeight = tree.target.css('minHeight');
                if ((isEmpty(zIndex) || zIndex == 'auto') && !isEmpty(tree.option.zIndex))
                    tree.target.css('zIndex', tree.option.zIndex || 0);
                if ((isEmpty(minWidth) || minWidth == 'auto') && !isEmpty(tree.option.minWidth))
                    tree.target.css('zIndex', tree.option.minWidth || 0);
                if ((isEmpty(minHeight) || minHeight == 'auto') && !isEmpty(tree.option.minHeight))
                    tree.target.css('zIndex', tree.option.minHeight || 0);
            },
            createDivRMenu: function (tree) {
                var $DivRMenu = $(document.createElement('div'));
                $DivRMenu.addClass('skynetTree-RMenu');
                $DivRMenu.hide();
                return $DivRMenu;
            },
            createTree: function (tree) {
                var $Tree = $(document.createElement('ul'));
                $Tree.attr('id', tree.id + '_tree');
                return $Tree;
            }
        },
        event: {
            bindEvent: function () {
                this.target.on('blur.skynetTree', this, function (e) {
                    var tree = e.data;
                    if (tree.option.disabled === true || tree.option.readonly === true) return false;
                    var ztree = tree.Tree;
                    var model = tree.setting.check.enable;
                    var nodes = model ? ztree.getCheckedNodes(true) : ztree.getSelectedNodes();
                    var reValue = tree.option.reValue;
                    var reText = tree.option.reText;
                    var splitRegex = tree.option.splitRegex;
                    var val = tree.target.data('svalue');
                    var beforeVal = [];
                    if(!isEmpty(val)){
                    	if(typeof val == 'string')
                    		beforeVal=val.split(splitRegex);
                    	else
                    		beforeVal=[val];
                    }
                    var resultVal = [], resultText = [];
                    $.each(nodes, function (j, node) {
                        resultVal.push(node[reValue]);
                        resultText.push(node[reText]);
                    });
                    var nowValue = _.union(resultVal, tree.unloadVal);
                    if (equalsSimpleArray(nowValue, beforeVal) == true) return;
                    var nowText = _.union(resultText, tree.unloadText);
                    tree.fn('setValue', nowValue.join(splitRegex), nowText.join(splitRegex), true);
                });
            },
            destroy: function () {
                this.target.off('.skynetTree');
            }
        }
    };
    skynetLoaders.setLoader('normal.skynetTree', normal);
    skynetLoaders.setLoader('comboBox.skynetTree', comboBox);
})(jQuery, window);
/*skynetTree 公开方法*/
(function (skynetTree, win) {
    var setValue = function (newVal, newText, flag) {
        var tree = this;
        var ztree = tree.Tree;
        var model = tree.setting.check.enable;
        var splitRegex = tree.option.splitRegex;
        var reValue = tree.option.reValue;
        var reText = tree.option.reText;
        var beforeVal = tree.target.data('svalue');
        var texts = [];
        var vals = [];
        if(!isEmpty(newVal)){
        	if(typeof newVal == 'string')
        		vals=newVal.split(splitRegex);
        	else
        		vals=[newVal];
        }
        if(!isEmpty(newText)){
        	if(typeof newText == 'string')
        		texts=newText.split(splitRegex);
        	else
        		texts=[newText];
        }
        var unloadVal = [], unloadText = [], findText = [];
        //获得文本信息、未加载信息
        $.each(vals, function (i, val) {
            if (isEmpty(val)) return true;
            var nodes = ztree.getNodesByParam(reValue, val);
            if (nodes.length <= 0) {
                unloadVal.push(val);
            } else {
                if (!isEmpty(nodes[0][reText])) findText.push(nodes[0][reText]);
            }
        });
        var nowValue = _.union(vals, unloadVal);
        var nowText = _.union(findText, texts);
        var _nowValue = nowValue.join(splitRegex);
        var _nowText = nowText.join(splitRegex);
        //调用变更事件
        var isChangeFn = (typeof tree.option.onChange == 'function' && tree.option.onChange.call(tree, _nowValue, beforeVal) == true);
        var isChange = (tree.option.onChange == true || isEmpty(tree.option.onChange));
        if (!(isChangeFn || isChange)) return;
        //记录未加载的数据
        tree.unloadVal = unloadVal;
        tree.unloadText = _.difference(texts, findText);
        //设置值
        tree.target.data('svalue', _nowValue);
        tree.target.data('stext', _nowText);
        tree.target.val(_nowValue);
        !isEmpty(tree.$IptContent) && tree.$IptContent.val(_nowValue);
        !isEmpty(tree.$DivText) && tree.$DivText.text((isEmpty(_nowText) ? '请选择' : _nowText));
        //设置树勾选
        if (flag != true) {
            if (model == true) {
                ztree.checkAllNodes(false);
                if (!isEmpty(nowValue)) {
                    $.each(nowValue, function (i, val) {
                        if (isEmpty(val)) return true;
                        var nodes = ztree.getNodesByParam(reValue, val);
                        if (!isEmpty(nodes) && nodes.length > 0) {
                            $.each(nodes, function (k, node) {
                                if (!isEmpty(node))
                                    ztree.checkNode(node, true, false);
                            });
                        }
                    })
                }
            } else {
                ztree.cancelSelectedNode();
                if (!isEmpty(nowValue) && !isEmpty(nowValue[0])) {
                    var nodes = ztree.getNodesByParam(reValue, nowValue[0]);
                    if (!isEmpty(nodes))
                        ztree.selectNode(nodes[0], true);
                }
            }
        }
        if(isEmpty(beforeVal)){
        	beforeVal=[];
        }else{
        	if(typeof beforeVal == 'string')
        		beforeVal=beforeVal.split(splitRegex);
        	else
        		beforeVal=[beforeVal];
        }
        if (equalsSimpleArray(nowValue, beforeVal) == true) return;
        //触发change事件
        tree.target.change();
    };
    var getValue = function () {
        return this.target.data("svalue");
    };
    var getText = function () {
        return this.target.data("stext");
    };
    var getNodes = function (key, value) {
        var tree = this;
        if (tree.option.disabled === true || tree.option.readonly === true) return;
        var ztree = tree.Tree;
        var model = tree.setting.check.enable;
        var nodes = [];
        if (isEmpty(key)) {
            nodes = model ? ztree.getCheckedNodes(true) : ztree.getSelectedNodes();
        } else {
            nodes = ztree.getNodesByParam(key, value);
        }
        return nodes;
    };
    var clear = function (flag) {
        var tree = this;
        if (tree.option.disabled === true || tree.option.readonly === true) return;
        var ztree = tree.Tree;
        var model = tree.setting.check.enable;
        tree.target.data('svalue', '');
        tree.target.data('stext', '');
        tree.target.val('');
        !isEmpty(tree.$IptContent) && tree.$IptContent.val('');
        !isEmpty(tree.$DivText) && tree.$DivText.text('请选择');
        if (model == true) {
            ztree.checkAllNodes(false);
        } else {
            ztree.cancelSelectedNode();
        }
        if (flag == true) {
            tree.unloadVal = [];
            tree.unloadText = [];
        }
    };
    var readonly = function (flag) {
        var tree = this,
            nodes = tree.Tree.getNodes();
        if (flag == true) {
            flag = true;
        } else {
            flag = false;
        }
        tree.option.readonly = flag;
        tree.Tree.setting.check.chkDisabledInherit = flag;
        $.each(nodes, function (i, node) {
            tree.Tree.setChkDisabled(node, flag, true, true);
        });
    };
    var disabled = function (flag) {
        var tree = this,
            nodes = tree.Tree.getNodes();
        if (flag == true) {
            flag = true;
            if (tree.option.mode == 'comboBox') {
                tree.$DivClear.hide();
                tree.target.addClass('skynetComborTree-disabled');
            }
        } else {
            flag = false;
            if (tree.option.mode == 'comboBox') {
                tree.$DivClear.show();
                tree.target.removeClass('skynetComborTree-disabled');
            }
        }
        tree.option.disabled = flag;
        tree.Tree.setting.check.chkDisabledInherit = flag;
        $.each(nodes, function (i, node) {
            tree.Tree.setChkDisabled(node, flag, true, true);
        });
    };
    var create = function (_option, _setting) {
        var tree = this;
        tree.create(_option, _setting);
        return tree.target;
    };
    var refresh = function () {
        var tree = this;
        tree.refresh();
        return tree.target;
    };
    var render = function (_option, _setting) {
        var tree = this;
        tree.reload(_option, _setting);
        return tree.target;
    };
    var destroy = function () {
        var tree = this;
        tree.destroy();
        return tree.target;
    };
    var fnStore = {
        setValue: setValue,     //获得ztree
        getValue: getValue,     //获得选中节点值字符串
        getText: getText,       //获得选中节点值信息
        getReNodes: getNodes,   //获得节点 无参数是是选中节点  带参数则是按参数查找
        clear: clear,           //清除选择值
        readonly: readonly,     //树只读
        disabled: disabled,     //树禁用
        create: create,         //树创建
        refresh: refresh,       //树刷新
        render: render,         //树重渲染
        destroy: destroy        //树销毁
    };
    var fn = function () {
        this.init = function () {
            var args = arguments, argArray = Array.prototype.slice.call(args, 1);
            var name = args[0];
            if (isEmpty(name) || isEmpty(fnStore[name])) return;
            return fnStore[name].apply(this, argArray);
        };
        return this.init.apply(this, arguments);
    };
    skynetTree.prototype.fn = fn;
})(skynetTree, window);
/*skynetTree 添加跨window浮动层 comboBox*/
(function (skynetTree, win) {
    var comboBox = {
        aopBuildQueue: function () {
            var tree = this;
            if (!(tree instanceof skynetTree)) return;
            tree.target.hover(function () {
                tree.$DivComboBox.addClass('skynetComboBox-hover');
            }, function () {
                tree.$DivComboBox.removeClass('skynetComboBox-hover');
            });
            tree.target.attr('data-', false);
            tree.target.skynetComboBox({
                float: tree.$DivComboBox,
                data: tree,
                hoverIn: function () {
                    this.target.addClass('skynetComboTree-Hover');
                },
                hoverOut: function () {
                    this.target.removeClass('skynetComboTree-Hover');
                },
                show: function (e) {
                    var opt = this;
                    var tree = opt.data;
                    if (tree.option.disabled === true) return false;
                },
                shown: function (e) {
                    var opt = this;
                    var tree = opt.data;
                    tree.target.attr('data-isShowFloat', true);
                },
                hidden: function (e) {
                    var opt = this;
                    var tree = opt.data;
                    tree.target.attr('data-isShowFloat', false);
                    if (tree.option.disabled === true || tree.option.readonly === true) return false;
                    var ztree = tree.Tree;
                    var model = tree.setting.check.enable;
                    var nodes = model ? ztree.getCheckedNodes(true) : ztree.getSelectedNodes();
                    var reValue = tree.option.reValue;
                    var reText = tree.option.reText;
                    var splitRegex = tree.option.splitRegex;
                    var val = tree.target.data('svalue');
                    var beforeVal = [];
                    if(!isEmpty(val)){
                    	if(typeof val == 'string')
                    		beforeVal=val.split(splitRegex);
                    	else
                    		beforeVal=[val];
                    }
                    var resultVal = [], resultText = [];
                    $.each(nodes, function (j, node) {
                        resultVal.push(node[reValue]);
                        resultText.push(node[reText]);
                    });
                    var nowValue = _.union(resultVal, tree.unloadVal);
                    if (equalsSimpleArray(nowValue, beforeVal) == true) return;
                    var nowText = _.union(resultText, tree.unloadText);
                    tree.fn('setValue', nowValue.join(splitRegex), nowText.join(splitRegex), true);
                }
            });
        }
    };
    win.skynetPlugins.setPlugin('comboBox.skynetTree', comboBox);
})(skynetTree, window);
/*skynetTree 添加跨window浮动层右键菜单*/
(function (skynetTree, win) {
    var addNode = function (e) {
        var data = e.data,
            menu = data.menu,
            tree = menu.data,
            ztree = tree.Tree,
            $Tree = tree.$Tree,
            node = data.node;
        $Tree.find('.skynetTree-RNode').removeClass('skynetTree-RNode');
        menu.float.hide();
        if (typeof tree.option.callBack.addNode === 'function') {
            tree.option.callBack.addNode.call(tree, node, ztree, e);
        } else {
            var newNode = {name: '新建节点'};
            if (!isEmpty(node)) {
                ztree.editName(ztree.addNodes(node, 0, newNode)[0]);
            } else {
                ztree.editName(ztree.addNodes(null, -1, newNode)[0]);
            }
        }
    };
    var editNode = function (e) {
        var data = e.data,
            menu = data.menu,
            tree = menu.data,
            ztree = tree.Tree,
            $Tree = tree.$Tree,
            node = data.node;
        $Tree.find('.skynetTree-RNode').removeClass('skynetTree-RNode');
        menu.float.hide();
        if (typeof tree.option.callBack.editNode === 'function') {
            tree.option.callBack.editNode.call(tree, node, ztree, e);
        } else {
            if (!isEmpty(node))   ztree.editName(node);
        }
    };
    var removeNode = function (e) {
        var data = e.data,
            menu = data.menu,
            tree = menu.data,
            ztree = tree.Tree,
            $Tree = tree.$Tree,
            node = data.node;
        $Tree.find('.skynetTree-RNode').removeClass('skynetTree-RNode');
        menu.float.hide();
        if (!isEmpty(node)) {
            var msg = '确定删除节点？';
            var hasChildren = node.children && node.children.length;
            if (hasChildren) msg = "操作节点包含子节点，删除将连同子节点一起移除！！";
            if (isEmpty(skynetDialog)) {
                if (confirm(msg) == true) {
                    if (typeof tree.option.callBack.removeNode === 'function') {
                        tree.option.callBack.removeNode.call(tree, node, ztree, e);
                    } else {
                        hasChildren && ztree.removeChildNodes(node);
                        ztree.removeNode(node);
                    }
                }
            } else {
                skynetDialog.confirm(msg, function () {
                    if (typeof tree.option.callBack.removeNode === 'function') {
                        tree.option.callBack.removeNode.call(tree, node, ztree, e);
                    } else {
                        hasChildren && ztree.removeChildNodes(node);
                        ztree.removeNode(node);
                    }
                }, null);
            }
        }
    };
    var rMenu = {
        aopBuildQueue: function () {
            var tree = this;
            if (!(tree instanceof skynetTree) && tree.option.isEdit != true) return;
            tree.$Tree.parent('div').skynetRightMenu({
                float: tree.$DivRMenu,
                data: tree,
                show: function () {
                    if (this.data.option.isEdit != true)
                        return false;
                    return true;
                },
                shown: function (e) {
                    var tree = this.data;
                    tree.$Tree.find('.skynetTree-RNode').removeClass('skynetTree-RNode');
                    this.float.empty();
                    var $node = tree.$Tree.find(e.target).filter('li[treenode]');
                    if ($node.length <= 0)
                        $node = tree.$Tree.find(e.target).parents('li[treenode]:first');
                    if ($node.length > 0) {
                        var node = tree.Tree.getNodeByTId($node.attr('id'));
                        $node.addClass('skynetTree-RNode');
                        if (!isEmpty(node)) {
                            //根据属实决定是否可以编辑 删除
                            //这里定义为节点上的 isAdd isEdit  isRemove
                            if (node['isAdd'] != false) {
                                var add1 = $('<button type="button" class="btn btn-add icofont-plus" style="width: 90px;height: 30px;">内部添加</button><br />');
                                this.float.append(add1);
                                add1.one("click", {menu: this, $node: $node, node: node}, addNode);
                            }
                            if (node['isEdit'] != false) {
                                var edit = $('<button type="button" class="btn btn-amend icofont-pencil" style="width: 90px;height: 30px;">编辑</button><br />');
                                this.float.append(edit);
                                edit.one("click", {menu: this, $node: $node, node: node}, editNode);
                            }
                            if (node['isRemove'] != false) {
                                var remove = $('<button type="button" class="btn btn-delete icofont-minus" style="width: 90px;height: 30px;">删除</button><br />');
                                this.float.append(remove);
                                remove.one("click", {menu: this, $node: $node, node: node}, removeNode);
                            }
                        }
                    } else {
                        var add = $('<button type="button" class="btn btn-add icofont-plus" style="width: 90px;height: 30px;">添加</button>');
                        this.float.append(add);
                        add.one("click", {menu: this, $node: null, node: null}, addNode);
                    }
                },
                hidden: function () {
                    this.data.$Tree.find('.skynetTree-RNode').removeClass('skynetTree-RNode');
                }
            });
        }
    };
    win.skynetPlugins.setPlugin('rMenu.skynetTree', rMenu);
})(skynetTree, window);
/*skynetTree 添加zTree插件功能*/
(function (skynetTree, win) {
    var _Callback = {
        beforeClick: function (event, treeId, treeNode) {
            if (this.option.disabled == true || this.option.readonly == true) return false;
            var flag = true;
            if (typeof this.option.callBack.beforeClick === 'function')
                flag = !(this.option.callBack.beforeClick.apply(this, arguments) == false);
            if (this.option.isCheck != true && this.Tree.isSelectedNode(treeNode) === true) {
                this.target.click();
                flag = false;
            }
            return flag;
        },
        onClick: function (event, treeId, treeNode) {
            if (this.option.disabled == true || this.option.readonly == true) return false;
            if (this.option.isCheck == true) {
                this.Tree.checkNode(treeNode, null, false, false);
            }
            if (treeNode.isParent === true) {
                this.Tree.expandNode(treeNode, true, false, false);
            }
            if (typeof this.option.callBack.onClick === 'function')
                this.option.callBack.onClick.apply(this, arguments);
        },
        onCheck: function (event, treeId, treeNode) {
            if (this.option.disabled == true || this.option.readonly == true) return false;
            if (this.option.isCheck == true || treeNode.isParent === true) {
                this.Tree.expandNode(treeNode, true, false, false);
            }
            if (typeof this.option.callBack.onCheck === 'function')
                this.option.callBack.onCheck.apply(this, arguments);
        },
        onNodeCreated: function (event, treeId, treeNode) {
            var tree = this;
            var ztree = tree.Tree;
            if (isEmpty(ztree)) {
                ztree = $.fn.zTree.getZTreeObj(treeId);
                tree.Tree = ztree;
            }
            var val = tree.target.data('svalue')||'';
            var model = tree.setting.check.enable;
            var splitRegex = tree.option.splitRegex;
            var reValue = tree.option.reValue;
            var vals = [] ;
            if(!isEmpty(val)){
            	if(typeof val == 'string')
            		vals=val.split(splitRegex);
            	else
            		vals=[val];
            }
            if ($.inArray(treeNode[reValue], vals) > -1) {
                tree.Tree.setChkDisabled(treeNode, false, false, false);
                if (model == true)
                    ztree.checkNode(treeNode, true, false);
                else
                    ztree.selectNode(treeNode);
                if (tree.option.disabled == true || tree.option.readonly == true)
                    tree.Tree.setChkDisabled(treeNode, false, false, false);
            }
            if (typeof this.option.callBack.onNodeCreated === 'function')
                this.option.callBack.onNodeCreated.apply(this, arguments);
        },
        onAsyncSuccess: function (event, treeId, treeNode, msg) {
            if (treeNode == null) {
                this.fn('setValue', this.target.data('svalue'), this.target.data('stext'));
                if (this.option.disabled == true) {
                    this.fn('disabled', true);
                    return;
                }
                if (this.option.readonly == true) {
                    this.fn('readonly', true);
                    return;
                }
                if (typeof this.option.onCreateSuccess === 'function')
                    this.option.onCreateSuccess.call(this);
            }
        },
        beforeDrag: function (treeId, treeNode) {
            for (var i = 0, l = treeNode.length; i < l; i++) {
                if (treeNode[i].drag === false) {
                    this.curDragNodes = null;//拖拽节点 不允许拖拽时禁用拖拽
                    return false;
                }
                if (treeNode[i].parentTId && treeNode[i].getParentNode()['childDrag'] === false) {
                    this.curDragNodes = null;//拖拽节点 当其父节点不允许拖拽时禁用拖拽
                    return false;
                }
            }
            this.curDragNodes = treeNode;
            if (typeof this.option.callBack.beforeDrag === 'function')
                this.option.callBack.beforeDrag.apply(this, arguments);
            return true;
        },
        onDrag: function () {
            win.top.$('.zTreeDragUL').css('zIndex', parseInt(this.$Tree.parent('div').css('zIndex')) || 0 + 1);
        }
    };
    var _Edit = {
        enable: true,//是否启用编辑模式
        showRemoveBtn: false,//是否启用删除按钮（图标）
        showRenameBtn: false,//是否启用节点重命名（图标）
        drag: {
            autoExpandTrigger: true,// 拖拽时父节点自动展开是否触发onExpand事件回调函数
            prev: function (treeId, nodes, targetNode) {
                //释放到目标节点前（位置）触发
                var pNode = targetNode.getParentNode();
                if (pNode && pNode['dropInner'] === false) {
                    return false;//释放节点的父节点 不允许加入子节点时 禁止释放
                } else {
                    for (var i = 0, l = this.curDragNodes.length; i < l; i++) {
                        var curPNode = this.curDragNodes[i].getParentNode();
                        if (curPNode && curPNode !== targetNode.getParentNode() && curPNode['childOuter'] === false) {
                            return false;//当前拖拽节点 不是拖拽到自己的父且其父节点不允许其子节点拖拽时 禁止释放
                        }
                    }
                }
                return true;
            },
            inner: function (treeId, nodes, targetNode) {
                //释放到目标节点内部（位置）触发
                if (targetNode && targetNode['dropInner'] === false) {
                    return false;//释放节点的父节点 不允许加入子节点时禁止释放
                } else {
                    for (var i = 0, l = this.curDragNodes.length; i < l; i++) {
                        var curPNode = this.curDragNodes[i].getParentNode();
                        if (!targetNode && this.curDragNodes[i]['dropRoot'] === false) {
                            return false;//拖拽节点不允许拖拽到根时禁止释放
                        }
                        if (curPNode && curPNode !== targetNode && curPNode['childOuter'] === false) {
                            return false;//当前拖拽节点 不是拖拽到自己的父且其父节点不允许其子节点拖拽时 禁止释放
                        }
                    }
                }
                return true;
            },
            next: function dropNext(treeId, nodes, targetNode) {
                //释放到目标节点后（位置）触发
                var pNode = targetNode.getParentNode();
                if (pNode && pNode['dropInner'] === false) {
                    return false;//释放节点的父节点 不允许加入子节点时 禁止释放
                } else {
                    for (var i = 0, l = this.curDragNodes.length; i < l; i++) {
                        var curPNode = this.curDragNodes[i].getParentNode();
                        if (curPNode && curPNode !== targetNode.getParentNode() && curPNode['childOuter'] === false) {
                            return false;//当前拖拽节点 不是拖拽到自己的父且其父节点不允许其子节点拖拽时 禁止释放
                        }
                    }
                }
                return true;
            }
        }
    };
    var zTree = {
        aopLoadQueue: function () {
            var tree = this;
            if (!(tree instanceof skynetTree)) return;
            tree.$Tree.empty();
            tree.$Tree.addClass('ztree');
            if (tree.option.isEdit == true && tree.option.disabled != true && tree.option.readonly != true) {
                if (isEmpty(tree.setting.edit))
                    tree.setting.edit = clone(_Edit);
                else
                    $.extend(true, tree.setting.edit, clone(_Edit));
                tree.setting.edit.drag.prev = $.proxy(tree.setting.edit.drag.prev, tree);
                tree.setting.edit.drag.inner = $.proxy(tree.setting.edit.drag.inner, tree);
                tree.setting.edit.drag.next = $.proxy(tree.setting.edit.drag.next, tree);
            }
            for (var _cbk in _Callback) {
                if (typeof _Callback[_cbk] === 'function')
                    tree.setting.callback[_cbk] = $.proxy(_Callback[_cbk], tree);
            }
            for (var cbk in tree.option.callBack) {
                if (_.keys(_Callback).join().indexOf(cbk) > -1) continue;
                if (typeof tree.option.callBack[cbk] === 'function')
                    tree.setting.callback[cbk] = $.proxy(tree.option.callBack[cbk], tree);
            }
            if (!isEmpty(tree.setting.async.url)) {
                $.fn.zTree.init(tree.$Tree, tree.setting);
                tree.Tree = $.fn.zTree.getZTreeObj(tree.$Tree.attr("id"));
            } else {
                $.fn.zTree.init(tree.$Tree, tree.setting, tree.option.data);
                tree.Tree = $.fn.zTree.getZTreeObj(tree.$Tree.attr("id"));
                tree.fn('setValue', tree.target.data('svalue'), tree.target.data('stext'));
                if (tree.option.disabled == true || tree.option.readonly == true) {
                    if (tree.option.readonly == true) {
                        tree.fn('readonly', true);
                    } else {
                        tree.fn('disabled', true);
                    }
                }
                if (typeof tree.option.onCreateSuccess === 'function')
                    tree.option.onCreateSuccess.call(tree);
            }
        }
    };
    win.skynetPlugins.setPlugin('zTree.skynetTree', zTree);
})(skynetTree, window);
/*TODO skynetTree 静态数据筛选使用 HTML  WebWork进行多线程计算  需要实现 work.js 的调度*/
(function (skynetTree, win) {
    var expression = function () {
    };
    var find = function (expression) {
    };
    var staticFind = {
        expression: expression,
        find: find
    };
    skynetTree.prototype.staticFind = staticFind;
})(skynetTree, window);
/*jquery插件支持*/
(function ($) {
    if (!isEmpty($) && isEmpty($.fn.skynetTree)) {
        $.fn.skynetTree = function (method) {
            var args = arguments, argArray = Array.prototype.slice.call(args, 1), val = [];
            var $comboTree = $(this);
            if (!$(this).is('div') || !$(this).is('[data-skynetTree]')) {
                $comboTree = $(this).find('div[data-skynetTree]');
            }
            $comboTree.each(function () {
                var _this = $(this),
                    tree = _this.data('tree.skynetTree');
                if (!isEmpty(method) && !isEmpty(tree) && typeof(method) === 'string') {
                    val.push(tree.fn.apply(tree, args));
                } else if (typeof method === 'object' || isEmpty(method)) {
                    new skynetTree(_this, args[0], args[1], args[2]);
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
})(jQuery);