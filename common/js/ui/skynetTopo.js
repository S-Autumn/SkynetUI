/*
 * skynetTopo
 * 基于HTML5的 绘图插件
 * Copyright (c) 2015 S_Autumn
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: magic_devil.@163.com
 * Date: 2015-09-02
 */
(function ($) {
    //画布 源模型
    var stageMode = {
        frames: 24,
        mode: "normal",
        event: {
            click: null,
            dbclick: null,
            mousedown: null,
            mouseup: null,
            mouseover: null,
            mousemove: null,
            mousedrag: null,
            mousewheel: null
        }
    };
    //场景 源模型
    var sceneMode = {
        alpha: 1,
        backgroundColor: '255,255,255',
        background: null,
        visible: true,
        areaSelect: true,
        mode: 'normal',
        translate: false,
        translateX: null,
        translateY: null,
        event: {
            click: null,
            dbclick: null,
            mousedown: null,
            mouseup: null,
            mouseover: null,
            mousemove: null,
            mousedrag: null,
            mousewheel: null
        }
    };
    //容器 源模型
    var containerMode = {
        alpha: 0,
        zIndex: 20,
        showSelected: true,
        showMouseOver: true,
        childDragble: true,
        dragable: true
    };
    //节点 源模型
    var nodeMode = {
        Normal: {
            width: 20,
            height: 20,
            alpha: 1,
            fillColor: '0,200,255',
            fontColor: '0,0,0',
            zIndex: 15,
            showSelected: true,
            showMouseOver: true,
            dragable: true
        },
        Circle: {
            radius: 10,
            alpha: 1,
            fillColor: '0,200,255',
            fontColor: '0,0,0',
            zIndex: 15,
            showSelected: true,
            showMouseOver: true,
            dragable: true
        },
        Link: {
            alpha: 1,
            href: '',
            target: '_blank',
            font: '12px 微软雅黑',
            fontColor: '0,0,0',
            visitedColor: '0,0,255',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            zIndex: 15,
            showSelected: true,
            showMouseOver: true,
            dragable: true
        },
        Text: {
            alpha: 1,
            font: '12px 微软雅黑',
            fontColor: '0,0,0',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            zIndex: 15,
            showSelected: true,
            showMouseOver: true,
            dragable: true
        }
    };
    //关系 源模型
    var lineMode = {
        Normal: {
            lineWidth: 2,
            alpha: 1,
            bundleOffset: 10,
            bundleGap: 15,
            textOffsetY: 0,
            textOffsetX: 0,
            strokeColor: '0,0,0',
            arrowsRadius: 0,
            dashedPattern: undefined,
            direction: 'horizontal',
            zIndex: 14,
            font: '12px 微软雅黑',
            fontColor: "0,0,0",
            showSelected: true,
            showMouseOver: true,
            shadow: true,
            dragable: true,
            selected: true
        },
        Fold: {
            lineWidth: 1,
            alpha: 1,
            bundleOffset: 10,
            bundleGap: 15,
            textOffsetY: 0,
            textOffsetX: 0,
            strokeColor: '0,0,0',
            arrowsRadius: 0,
            dashedPattern: undefined,
            direction: 'horizontal',
            zIndex: 14,
            font: '12px 微软雅黑',
            fontColor: "0,0,0",
            showSelected: true,
            showMouseOver: true,
            shadow: true,
            dragable: true,
            selected: true
        },
        Flexional: {
            lineWidth: 1,
            alpha: 1,
            offsetGap: 10,
            bundleGap: 15,
            textOffsetY: 0,
            textOffsetX: 0,
            strokeColor: '0,0,0',
            arrowsRadius: 0,
            dashedPattern: undefined,
            direction: 'horizontal',
            zIndex: 14,
            font: '12px 微软雅黑',
            fontColor: "0,0,0",
            showSelected: true,
            showMouseOver: true,
            shadow: true,
            dragable: true,
            selected: true
        },
        Curve: {
            lineWidth: 1,
            alpha: 1,
            bundleOffset: 10,
            bundleGap: 15,
            textOffsetY: 0,
            textOffsetX: 0,
            strokeColor: '0,0,0',
            arrowsRadius: 0,
            dashedPattern: undefined,
            direction: 'horizontal',
            zIndex: 14,
            font: '12px 微软雅黑',
            fontColor: "0,0,0",
            showSelected: true,
            showMouseOver: true,
            shadow: true,
            dragable: true,
            selected: true
        }
    };
    var option = {
        mode: "normal",
        url: null,
        params: null,
        data: null,
        target: null,
        canvas: null,
        stage: null,
        scene: null,
        stageOpt: stageMode,
        sceneOpt: sceneMode,
        containerOpt: containerMode,
        nodeOpt: nodeMode,
        lineOpt: lineMode,
        draglink: false,
        loadFilter: null,
        beforeload: null,
        createSuccess: null,
        draw: null
    };
    //工具私有方法
    var handles = {
        modules: {},
        buildModules: function (opt) {
            if (!isEmpty(handles.modules)) {
                for (var pop in handles.modules) {
                    if (opt[pop] == true && typeof handles.modules[pop] == 'function')
                        handles.modules[pop].call(this, opt);
                }
            }
        },
        loadCanvas: function (opt) {
            if (isEmpty(opt) || !this.is("div")) return false;
            var $Canvas = null,
                _width = this.width(),
                _height = this.height();
            if (isEmpty(opt['canvas'])) {
                var id = Math.uuid();
                $Canvas = '<canvas id="' + id + '" style="" width="' + _width + 'px" height="' + _height + 'px"></canvas>';
                this.append($Canvas);
                opt['canvas'] = this.find("#" + id);
            } else {
                $Canvas = opt['canvas'];
                $Canvas.attr("width", _width)
                $Canvas.attr("height", _height)
            }
            return true;
        },
        loadStage: function (opt) {
            if (isEmpty(opt) || isEmpty(opt['canvas'])) return false;
            var stage = opt["stage"];
            if (isEmpty(stage)) stage = new JTopo.Stage(opt['canvas'][0]);
            var thisEvent = clone(opt.stageOpt.event);
            delete opt.stageOpt.event;
            if (!isEmpty(opt.stageOpt)) stage = $.extend(true, stage, opt.stageOpt);
            for (var key in thisEvent) {
                if (typeof thisEvent[key] === 'function')
                    stage[key] = thisEvent[key];
            }
            opt["stage"] = stage;
            return true;
        },
        loadScene: function (opt) {
            if (isEmpty(opt) || isEmpty(opt["stage"])) return false;
            var scene = opt["scene"];
            if (isEmpty(scene)) scene = new JTopo.Scene(opt["stage"]);
            var thisEvent = clone(opt.sceneOpt.event);
            delete opt.sceneOpt.event;
            if (!isEmpty(opt.sceneOpt)) scene = $.extend(true, scene, opt.sceneOpt);
            for (var key in thisEvent) {
                if (typeof thisEvent[key] === 'function')
                    scene[key] = thisEvent[key];
            }
            opt["scene"] = scene;
            return true;
        },
        loading: function (opt) {
            if (isEmpty(opt)) return false;
            if (typeof opt.beforeload === 'function' && opt.beforeload() != true) return;
            var $this = this, stage = opt.stage, scene = opt.scene;
            if (isEmpty(opt.url)) {
                if (typeof opt.loadFilter === "function")
                    opt.data = opt.loadFilter.call($this, opt.data);
                setTimeout(function () {
                    handles.drawing.call($this, opt);
                    if (typeof opt.createSuccess === "function")
                        opt.createSuccess($this, opt);
                }, 0);
            } else {
                var params = isEmpty(opt.params) ? null : opt.params;
                $.ajax({
                    url: opt.url,
                    type: "POST",
                    data: params,
                    dataType: "json",
                    complete: function (XHR, TS) {
                        if ("parsererror" == TS)
                            $("body").append("<div id='powerTips_Div' style='display:none'>" + XHR.responseText + "<div>");
                    },
                    success: function (data) {
                        if (typeof data === "string") data = JSON.parse(data);
                        if (typeof opt.loadFilter === "function") {
                            data = opt.loadFilter.call($this, data);
                        }
                        opt.data = data;
                        setTimeout(function () {
                            handles.drawing.call($this, opt);
                            if (typeof opt.createSuccess === "function")
                                opt.createSuccess.call($this, opt);
                        }, 0);
                    }
                });
            }
        },
        drawing: function (opt) {
            var data = opt.data;
            if (isEmpty(opt) || isEmpty(data)) {
                handles.loadStage.call(this, opt);
                handles.loadScene.call(this, opt);
                handles.setMode.call(this, opt);
            } else {
                if (typeof  opt.draw == 'function') {
                    handles.loadStage.call(this, opt);
                    handles.loadScene.call(this, opt);
                    opt.draw.call(opt);
                    handles.setMode.call(this, opt);
                } else {
                    var obj = JTopo.deSeriailzeByJSON(data, opt.canvas[0]);
                    opt.stage = obj.stage;
                    opt.scene = obj.scenes[0];
                    handles.setMode.call(this, opt);
                }
            }
            handles.buildModules.call(this, opt);
        },
        setMode: function (opt) {
            var mode = opt.mode;
            var containerOpt = opt.containerOpt;
            var nodeOpt = opt.nodeOpt;
            var lineOpt = opt.lineOpt;
            if (mode == "readonly") {
                opt.scene.mode = 'drag';
                opt.stage.mode = 'drag';
            } else {
                opt.scene.mode = mode;
                opt.stage.mode = mode;
            }
            var childs = opt.scene.childs;
            if (isEmpty(childs)) return;
            $.each(childs, function (i, item) {
                if (item instanceof JTopo.Node ||
                    item instanceof JTopo.TextNode ||
                    item instanceof JTopo.LinkNode ||
                    item instanceof JTopo.CircleNode ||
                    item instanceof JTopo.AnimateNode) {
                    if (mode == "readonly") {
                        item['showSelected'] = false;
                        item['showMouseOver'] = false;
                        item['dragable'] = false;
                    } else {
                        var nodeMode = null;
                        if (item instanceof JTopo.CircleNode) {
                            nodeMode = opt.nodeOpt['Circle'];
                        } else if (item instanceof JTopo.LinkNode) {
                            nodeMode = opt.nodeOpt['Link'];
                        } else if (item instanceof JTopo.TextNode) {
                            nodeMode = opt.nodeOpt['Text'];
                        } else {
                            nodeMode = opt.nodeOpt['Normal'];
                        }
                        item['showSelected'] = nodeMode['showSelected'];
                        item['showMouseOver'] = nodeMode['showMouseOver'];
                        item['dragable'] = nodeMode['dragable'];
                    }
                } else if (item instanceof JTopo.Link ||
                    item instanceof JTopo.FoldLink ||
                    item instanceof JTopo.FlexionalLink ||
                    item instanceof JTopo.CurveLink
                    ) {
                    if (mode == "readonly") {
                        item['showSelected'] = false;
                        item['showMouseOver'] = false;
                        item['shadow'] = false;
                        item['dragable'] = false;
                        item['selected'] = false;
                    } else {
                        var lineMode = null;
                        if (item instanceof JTopo.FoldLink) {
                            lineMode = opt.lineOpt['Fold'];
                        } else if (item instanceof JTopo.FlexionalLink) {
                            lineMode = opt.nodeOpt['Flexional'];
                        } else if (item instanceof JTopo.CurveLink) {
                            lineMode = opt.nodeOpt['Curve'];
                        } else {
                            lineMode = opt.nodeOpt['Normal'];
                        }
                        item['showSelected'] = lineMode['showSelected'];
                        item['showMouseOver'] = lineMode['showMouseOver'];
                        item['shadow'] = lineMode['shadow'];
                        item['dragable'] = lineMode['dragable'];
                        item['selected'] = lineMode['selected'];
                    }
                } else if (item instanceof JTopo.Container) {
                    if (mode == "readonly") {
                        item['showSelected'] = false;
                        item['showMouseOver'] = false;
                        item['childDragble'] = false;
                        item['dragable'] = false;
                    } else {
                        item['showSelected'] = opt.containerOpt['showSelected'];
                        item['showMouseOver'] = opt.containerOpt['showMouseOver'];
                        item['childDragble'] = opt.containerOpt['childDragble'];
                        item['dragable'] = opt.containerOpt['dragable'];
                    }
                }
            });
        }
    };
    //公开方法
    var methods = {
        init: function (opt) {
            var $this = $(this);
            if (!$this.is("div")) return false;
            var data = $this.data("skynetTopo");
            opt = $.extend(true, {}, option, opt);
            opt.target = $this;
            opt.mode = isEmpty(opt.mode) ? "normal" : opt.mode;
            $this.data("skynetTopo", opt);
            if (!isEmpty(data)) {
                methods.render.call($this, opt);
            } else {
                handles.loadCanvas.call($this, opt)
                handles.loading.call($this, opt);
                $this.data("skynetTopo", opt);
            }
        },
        addModule: function (key, module) {
            if (!isEmpty(key) && !isEmpty(module) && typeof module == 'function')
                handles.modules[key] = module;
        },
        removeModule: function (key) {
            delete handles.modules[key];
        },
        getElements: function (checkCall) {
            if (isEmpty(checkCall)) return null;
            var $this = $(this), data = $this.data("skynetTopo");
            if (isEmpty(data)) return null;
            if (typeof checkCall != 'function') return null;
            return data.scene.findElements(checkCall);
        },
        addNode: function (text, type, node, before, after) {
            if (isEmpty(text)) return false;
            var $this = $(this), data = $this.data("skynetTopo");
            if (isEmpty(data)) return false;
            var jNode = null;
            if (!isEmpty(node) && !isEmpty(node._id)) {
                jNode = data.scene.findElements(function (e) {
                    return e._id == node._id;
                })[0];
                if (!isEmpty(jNode)) return false;
            }
            if (isEmpty(type)) type = "Normal";
            jNode = new JTopo[type.replace("Normal", "") + "Node"](text);
            $.extend(true, jNode, data.nodeOpt[type]);
            if (!isEmpty(node)) $.extend(true, jNode, node);
            if (typeof before === 'function') before.call($this, jNode);
            data.scene.add(jNode);
            if (typeof after === 'function') after.call($this, jNode);
            return jNode;
        },
        addLine: function (node, toNode, text, type, line, before, after) {
            if (isEmpty(node) || isEmpty(toNode)) return false;
            var $this = $(this), data = $this.data("skynetTopo");
            if (isEmpty(data)) return false;
            var jLine = null;
            if (!isEmpty(line) && !isEmpty(line._id)) {
                jLine = data.scene.findElements(function (e) {
                    return e._id == line._id;
                })[0];
                if (!isEmpty(jLine)) return false;
            }
            var jNode = data.scene.findElements(function (e) {
                return e._id == node._id;
            })[0];
            var jtoNode = data.scene.findElements(function (e) {
                return e._id == toNode._id;
            })[0];
            if (isEmpty(jNode) || isEmpty(jtoNode)) return false;
            if (isEmpty(type)) type = "Normal";
            if (isEmpty(text)) {
                jLine = new JTopo[type.replace("Normal", "") + "Link"](jNode, jtoNode);
            } else {
                jLine = new JTopo[type.replace("Normal", "") + "Link"](jNode, jtoNode, text);
            }
            $.extend(true, jLine, data.lineOpt[type]);
            if (!isEmpty(line)) $.extend(true, jLine, line);
            if (typeof before === 'function') before.call($this, jNode, jtoNode, jLine);
            data.scene.add(jLine);
            if (typeof after === 'function') after.call($this, jNode, jtoNode, jLine);
            return jLine;
        },
        updateElement: function (elem) {
            if (isEmpty(elem)) return false;
            var $this = $(this), data = $this.data("skynetTopo");
            if (isEmpty(data)) return false;
            var jElem = data.scene.findElements(function (e) {
                return e._id == elem._id;
            })[0];
            if (!isEmpty(jElem)) $.extend(true, jElem, elem);
        },
        removeElement: function (elem) {
            if (isEmpty(elem)) return false;
            var $this = $(this), data = $this.data("skynetTopo");
            if (isEmpty(data)) return false;
            var jElem = data.scene.findElements(function (e) {
                return e._id == elem._id;
            })[0];
            if (!isEmpty(jElem)) data.scene.remove(jElem);
        },
        changeMode: function (mode) {
            if (isEmpty(mode)) return;
            var $this = $(this), data = $this.data("skynetTopo");
            data.mode = mode;
            handles.setMode.call($this, data);
        },
        toJSON: function (cbk) {
            var $this = $(this), data = $this.data("skynetTopo");
            if (typeof cbk == "function")
                return JTopo.seriailzeToJSON(data.stage, cbk);
            else
                return JTopo.seriailzeToJSON(data.stage);
        },
        fromJSON: function (json) {
            var $this = $(this), data = $this.data("skynetTopo");
            if (!isEmpty(json))
                JTopo.deSeriailzeByJSON(json, data.canvas[0]);
        },
        clear: function () {
            var $this = $(this),
                data = $this.data("skynetTopo");
            data.scene.clear();
        },
        render: function (opt) {
            var $this = $(this),
                data = $this.data("skynetTopo");
            data.scene.clear();
            data.stage.clear();
            $.extend(true, data.stage, opt.stage);
            $.extend(true, data.scene, opt.scene);
            handles.loading.call($this, opt);
            $this.data("skynetTopo", data);
        },
        destroy: function () {
            var $this = $(this), data = $this.data("skynetTopo");
            data.scene.clear();
            data.stage.clear();
            $this.removeData("skynetTopo");
            delete JTopo.stage[$this.attr('id')]
        }
    };

    //模块扩展 连线拖拽编辑模块
    (function () {
        var draglink = function (opt) {
            if (opt.mode == "drag" || opt.mode == "readonly") return;
            var beginNode = null, endNode = null, startNode = null, dragingNode = null;
            (function () {
                if (typeof opt['dragAccept'] != "function") {
                    opt['dragAccept'] = function (e) {
                        if (!isEmpty(e.target) &&
                            (e.target instanceof JTopo.Node ||
                                e.target instanceof JTopo.TextNode ||
                                e.target instanceof JTopo.LinkNode ||
                                e.target instanceof JTopo.CircleNode ||
                                e.target instanceof JTopo.AnimateNode))
                            return true;
                        return false;
                    }
                }
            })();
            (function () {
                if (typeof opt['dropAccept'] != "function") {
                    opt['dropAccept'] = function (e, beginNode) {
                        if (!isEmpty(e.target) && !isEmpty(beginNode) &&
                            beginNode !== e.target &&
                            (e.target instanceof JTopo.Node ||
                                e.target instanceof JTopo.TextNode ||
                                e.target instanceof JTopo.LinkNode ||
                                e.target instanceof JTopo.CircleNode ||
                                e.target instanceof JTopo.AnimateNode))
                            return true;
                        return false;
                    }
                }
            })();
            (function () {
                if (isEmpty(opt['dragLinkStyle'])) {
                    opt['dragLinkStyle'] = {
                        lineWidth: 3,
                        bundleOffset: 1,
                        strokeColor: '0,200,255',
                        arrowsRadius: 12
                    };
                }
            })();
            (function () {
                startNode = new JTopo.Node('startNode');
                dragingNode = new JTopo.Node('dragingNode');
                startNode.setSize(10, 10);
                startNode.alpha = 0;
                dragingNode.setSize(10, 10);
                dragingNode.alpha = 0;
            })();
            function createLink(nodeA, nodeZ) {
                var link = new JTopo.Link(nodeA, nodeZ);
                $.extend(true, link, opt['dragLinkStyle'])
                return link;
            };
            var _link = createLink(startNode, dragingNode);
            opt.scene.addEventListener("dbclick", function (e) {
                opt.scene.remove(_link);
                if (opt.dragAccept(e)) {
                    beginNode = e.target;
                    opt.scene.add(_link);
                    startNode.setLocation(e.x, e.y);
                    dragingNode.setLocation(e.x, e.y);
                }
            });
            opt.scene.addEventListener("mousemove", function (e) {
                !isEmpty(dragingNode) && dragingNode.setLocation(e.x, e.y);
            });
            opt.scene.addEventListener("click", function (e) {
                opt.scene.remove(_link);
                if (opt.dropAccept(e, beginNode)) {
                    endNode = e.target;
                    var link = createLink(beginNode, endNode)
                    opt.scene.add(link);
                    if (typeof opt['dragLinkSuccess'] == 'function')
                        opt['dragLinkSuccess'].call(opt.target, link, beginNode, endNode);
                }
                beginNode = null;
                endNode = null;
            });
        };
        methods.addModule("draglink", draglink);
    })();

    $.fn.skynetTopo = function (method) {
        var args = arguments, argArray = Array.prototype.slice.call(args, 1), elements = this;
        var data = elements.data("skynetTopo");
        if (methods[method] && !isEmpty(data)) {
            return methods[method].apply(elements, argArray);
        } else if (typeof method === 'object' || !method) {
            setTimeout($.proxy(function () {
                methods.init.apply(this, args);
            }, elements), 0);
            return elements;
        }
    };
})(jQuery);