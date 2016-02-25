$(document).ready(function () {
    //主页
    $('.headLogo').click(function () {
        window.location.reload();
    });
    //时间显示
    (function () {
        var localtime = new Date();
        var stime = $('#time').val();
        var time = localtime;
        if (!isEmpty(stime)) {
            var servertime = new Date(stime);
            if (localtime.getTime() - servertime.getTime() > 60000) time = servertime;
        }
        var $clock = $('#clock');
        $clock.text(time.format('yyyy-MM-dd hh:mm'));
        setInterval(function () {
            time.setTime(time.getTime() + 60000);
            $clock.text(time.format('yyyy-MM-dd hh:mm'));
        }, 60000);
    })();
    //menuBar控制 TODO menu 生成
    (function ($) {
        var inTime = 0, outTime = 0, hover_in = null, hover_out = null;
        var _dir = -1, step = 15, scrollMenu = null;
        var _Maxtop = parseInt($('.menu-zone').css('paddingTop')) || 0;
        var _Mintop = -($('.menu-ul').height() || 0) + ($('.menu-content').height() || 0) - (parseInt($('.menu-zone').css('paddingTop')) || 0);
        var showMenu = function () {
            outTime = 0;
            if (!isEmpty(hover_out)) {
                clearInterval(hover_out);
                hover_out = null;
            }
            if (isEmpty(hover_in))
                var $this = $(this);
            hover_in = setInterval(function () {
                inTime++;
                if (inTime >= 1) {
                    if (!$('.menuContain').is('.menu-in') && $this.is('[data-open]')) {
                        $('.menuContain').animate({width: 190}, 'fast', 'swing', function () {
                            $('.menu').show();
                            $('.menuContain').addClass('menu-in');
                            $('.menuContain').removeClass('menu-out');
                            _Maxtop = parseInt($('.menu-zone').css('paddingTop')) || 0;
                            _Mintop = -($('.menu-ul').height() || 0) + ($('.menu-content').height() || 0) - _Maxtop;
                            clearInterval(hover_in);
                        });
                    }
                    clearInterval(hover_in);
                }
            }, 500);
        };
        var hideMenu = function () {
            inTime = 0;
            if (!isEmpty(hover_in)) {
                clearInterval(hover_in);
                hover_in = null;
            }
            if (isEmpty(hover_out))
                hover_out = setInterval(function () {
                    outTime++;
                    if (outTime >= 1) {
                        if (!$('.menuContain').is('.menu-out')) {
                            $('.menuContain').animate({width: 0}, 'fast', 'swing', function () {
                                $('.menu').hide();
                                $('.menuContain').addClass('menu-out');
                                $('.menuContain').removeClass('menu-in');
                            });
                        }
                        clearInterval(hover_out);
                    }
                }, 1000);
        };
        var scrolling = function () {
            var dir = $(this).attr('name').indexOf('down') > -1 ? -1 : 1;
            _dir = dir;
            scrollMenu == null && (scrollMenu = setInterval(function () {
                var _step = step;
                var _top = parseInt($('.menu-content').css('top'));
                (_top < 0 || _top >= 0) ? _top = _top : _top = 0;
                (_dir < 0) && (_step = _step * -1);
                var top = _top + _step;
                if (top < _Mintop) top = _Mintop;
                if (top > _Maxtop) top = _Maxtop;
                $('.menu-content').css('top', top);
            }, 1000 / 24));
        };
        var stopScroll = function () {
            if (scrollMenu != null) {
                clearInterval(scrollMenu);
                scrollMenu = null;
            }
        };
        var scrollWheel = function (e, dir) {
            _dir = dir;
            var _step = step;
            var _top = parseInt($('.menu-content').css('top'));
            (_top < 0 || _top >= 0) ? _top = _top : _top = 0;
            (_dir < 0) && (_step = _step * -1);
            var top = _top + _step;
            if (top < _Mintop) top = _Mintop;
            if (top > _Maxtop) top = _Maxtop;
            $('.menu-content').css('top', top);
        };
        $('.menuBar').hover(showMenu, hideMenu);
        $('.menuLine').click(function (e) {
            var $target = $(e.target);
            if (!$target.is('[data-group]') && !$target.parent().is('[data-group]')) {
                inTime = 0, outTime = 0;
                if (!isEmpty(hover_in)) {
                    clearInterval(hover_in);
                    hover_in = null;
                }
                if (!isEmpty(hover_out)) {
                    clearInterval(hover_out);
                    hover_out = null;
                }
                $('#menuGroups>li').css('backgroundColor', '');
                $('.menu-item-content').hide();
                $('.menu-item').show();
                $('.menu-item-select').removeClass("menu-item-select");
                if (!$('.menuContain').is('.menu-in')) {
                    $('.menuContain').animate({width: 190}, 'fast', 'swing', function () {
                        $('.menu').show();
                        $('.menuContain').addClass('menu-in');
                        $('.menuContain').removeClass('menu-out');
                        _Maxtop = parseInt($('.menu-zone').css('paddingTop')) || 0;
                        _Mintop = -($('.menu-ul').height() || 0) + ($('.menu-content').height() || 0) - _Maxtop;
                    });
                }
            }
        });
        $('.menuLive').click(function (e) {
            if (!$('.menuBar').is('[data-open]')) {
                $('.menuBar').attr('data-open', '');
                $('.menuBar,.menuLine,.menuBg').animate({height: '100%'}, 'fast', 'swing');
                $('.menuContain').show();
            }
            else {
                $('.menuBar').removeAttr('data-open');
                $('.menuBar,.menuLine,.menuBg').animate({height: '26px'}, 'fast', 'swing');
                $('.menuContain').hide();
            }
            e.stopPropagation();
            return false;
        });
        $('[name="menu_up"],[name="menu_down"]').mousedown(scrolling).mouseup(stopScroll);
        $('.menu').mousewheel(scrollWheel);
        $('#menuGroups>li').hover(function (e) {
            $('.menu-item-select').removeClass("menu-item-select");
            inTime = 0, outTime = 0;
            if (!isEmpty(hover_in)) {
                clearInterval(hover_in);
                hover_in = null;
            }
            if (!isEmpty(hover_out)) {
                clearInterval(hover_out);
                hover_out = null;
            }
            var $this = $(this);
            var gcode = $this.data('group');
            if (!isEmpty(gcode)) {
                $this.css('backgroundColor', '#FFFFFF');
                $('#menuGroups>li').not($this).css('backgroundColor', '');
                $('.menu-item-content').hide();
                $('.menu-item-group[data-group="' + gcode + '"]').parent().show();
                $('.menu-item-group:not([data-group="' + gcode + '"])').parent().hide();
            }
            if (!$('.menuContain').is('.menu-in')) {
                $('.menuContain').animate({width: 190}, 'fast', 'swing', function () {
                    $('.menu').show();
                    $('.menuContain').addClass('menu-in');
                    $('.menuContain').removeClass('menu-out');
                    _Maxtop = parseInt($('.menu-zone').css('paddingTop')) || 0;
                    _Mintop = -($('.menu-ul').height() || 0) + ($('.menu-content').height() || 0) - _Maxtop;
                });
            }
            e.stopPropagation();
            return false;
        });
        $('.menu-item').click(function () {
            var $group = $(this).children('.menu-item-group');
            var $content = $(this).children('.menu-item-content');
            $('.menu-item-select').not($content).removeClass('menu-item-select');
            $('.menu-item-content').not($content).slideUp('fast');
            $content.slideToggle('fast');
            if ($group.is('.menu-item-select')) {
                $group.removeClass('menu-item-select');
            } else {
                $group.addClass('menu-item-select');
            }
        });

    })($);
    //app控制 TODO app 生成 左右翻页滑动
    (function ($) {
        var $appArrowUp = $(".app-Arrow-up");
        var $appArrowDw = $(".app-Arrow-down");
        var $appUp = $appArrowUp.parent().parent();
        var $appDw = $appArrowDw.parent().parent();
        var hoverIn = function () {
            var $wrap = $('#appwrap');
            var isOff = $wrap.is('.app-wrap-off');
            var isNormal = $wrap.is('.app-wrap');
            var isFull = $wrap.is('.app-wrap-on');
            if (isOff) {
                $appUp.hide();
                $appDw.css({'top': '', 'bottom': 0}).show();
            } else if (isFull) {
                $appUp.css({'top': '', 'bottom': 0}).show();
                $appDw.hide();
            } else if (isNormal) {
                $appUp.css({'top': 0, 'bottom': ''}).show();
                $appDw.css({'top': '', 'bottom': 0}).show();
            }
        };
        var hoverOut = function () {
            $appUp.hide();
            $appDw.hide();
        };
        var arrowClick = function () {
            var $this = $(this);
            var isBg = $('#bg').is(":visible");
            var isUp = $this.is(".app-Arrow-up");
            var $wrap = $('#appwrap');
            var $shadow = $('#appshadow')
            var $appblock = $('.app-block')
            var isOff = $wrap.is('.app-wrap-off');
            var isNormal = $wrap.is('.app-wrap');
            var isFull = $wrap.is('.app-wrap-on');
            if (isNormal || isBg) {
                if (isUp) {
                    var $eam = isBg ? $wrap : $this.parents('td:first');
                    $eam.animate({height: "15px"}, 'fast', 'swing', function () {
                        $this.parents('td:first').height('15px');
                        $wrap.attr('class', 'app-wrap-off');
                        $wrap.attr('style', '');
                        $shadow.attr('class', 'app-shadow');
                        $appblock.hide();
                        $appUp.hide();
                        $appDw.css({'top': '', 'bottom': 0}).show();
                    });
                } else {
                    $wrap.attr('class', 'app-wrap-ing');
                    $shadow.attr('class', 'app-shadow-on');
                    $wrap.animate({height: '450px'}, 'fast', 'swing', function () {
                        $wrap.attr('class', 'app-wrap-on');
                        $wrap.attr('style', '');
                        $appblock.show();
                        $appUp.css({'top': '', 'bottom': 0}).show();
                        $appDw.hide();
                    });
                }
            } else if (!isNormal && !isBg) {
                var $eam = isUp ? $wrap : $this.parents('td:first');
                $eam.animate({height: "95px"}, 'fast', 'swing', function () {
                    3
                    $this.parents('td:first').height('95px');
                    $wrap.attr('class', 'app-wrap');
                    $wrap.attr('style', '');
                    $shadow.attr('class', 'app-shadow');
                    $appblock.show();
                    $appUp.css({'top': 0, 'bottom': ''}).show();
                    $appDw.css({'top': '', 'bottom': 0}).show();
                });
            }
        }
        $("#appwrap").hover(hoverIn, hoverOut);
        $(".app-Arrow>div").click(arrowClick);
    })($);
    //功能跳转
    $('[name="menuBtn"]').click(function (e) {
        var $middle = $('.middle');
        $middle.skynetShadowBox({initShow: true});
        var $this = $(this);
        var url = $this.data('url');
        var text = $this.data('text') || '';
        if (isEmpty(url)) return;
        if (url.indexOf("?") < 0)url = url + "?";
        var $detail = $("#detail"), $detaiWin = $('#detaiWin'), iframe = null;
        $detail.show();
        $('#navBar').text(text);
        $('#appwrap').parent().height('95px');
        $('#appwrap').attr('class', 'app-wrap');
        $('.app-block').show();
        if (isEmpty($detaiWin)) {
            iframe = document.createElement("iframe");
            iframe.src = url + "&t=" + Math.random();
            $detaiWin = $(iframe);
            $detaiWin.attr('id', 'detaiWin');
            $detaiWin.attr('class', 'frameView');
            $detail.append($detaiWin);
            $detaiWin.on('load', function () {
                var iwin = iframe.contentWindow;
                var ibody = iwin.document.body;
                ibody.style.height = ($detail.innerHeight() - 20) + 'px';
                $middle.skynetShadowBox('hide');
            });
            $detail.on('resizeElement', function () {
                var height = $(this).innerHeight();
                try {
                    var iwin = iframe.contentWindow;
                    var ibody = iwin.document.body;
                    ibody.style.height = (height - 20) + 'px';
                } catch (e) {
                }
            });
        } else {
            iframe = $detaiWin[0];
            iframe.src = url + "&t=" + Math.random();
        }
        e.stopPropagation();
        return false;
    });
});