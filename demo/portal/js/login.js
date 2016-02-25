$(document).ready(function () {
    $('#loginIn').click(loginDailog);
});
var loginDailog = function () {
    var html =
        "<table class=\"loginDialog\"><tr><td style=\"font-weight: bolder;\">"
            + "账 户："
            + "</td><td>"
            + "<input type=\"text\" class=\"form-name\" name=\"account\"  id=\"account\" value=\"\" />"
            + "<td></tr><tr><td style=\"font-weight: bolder;\">"
            + "密 码："
            + "</td><td>"
            + "<input type=\"password\" class=\"form-key\" name=\"password\" id=\"password\" value=\"\" />"
            + "<td></tr><tr><td colspan=\"2\" style=\"text-align: center;\">"
            + "<button type=\"button\" name=\"login\"  id=\"login\" class=\"login_dl\"></button>"
            + "<td></tr></table>";
    skynetDialog.through({
        id: 'loginDiv',
        title: "登录",
        content: html,
        foot: false,
        width: 420,
        height: 290,
        init: function () {
            var dialog = this;
            var body = this.DOM.body;
            body.find("#account,#password").keydown(function (event) {
                if (event.keyCode == 13) {
                    body.find("button[name='login']").click();
                }
            });
            body.skynetShadowBox("hide");
            body.attr("style", body.attr("style") + "overflow-x:Hidden;overflow-y:Hidden");
            var btnStatus = function (flag) {
                if (flag == true) {
                    body.find("button[name='login']").removeAttr("disabled");
                } else {
                    body.find("button[name='login']").attr("disabled", "disabled");
                }
            };
            btnStatus(true);
            body.find("button[name='login']").click(function () {
                var form = document.forms[0],
                    account = body.find("input[name='account']").val(),
                    password = body.find("input[name='password']").val();
                btnStatus(false);
                if (!isEmpty(account) && !isEmpty(password)) {
                    body.skynetShadowBox({initShow: true, shadowType: "static"});
                    $.ajax({url: "sys/login", type: "GET",
                        data: {"account": account, "password": password},
                        dataType: "json",
                        success: function (obj) {
                            var datas = null, flag = "error", msg = "登录错误！";
                            if (typeof(obj) === "string") {
                                datas = JSON.parse(obj);
                            }
                            else {
                                datas = obj;
                            }
                            if (!isEmpty(datas)) {
                                flag = isEmpty(datas.flag) ? flag : datas.flag;
                                msg = isEmpty(datas.msg) ? msg : datas.msg;
                            }
                            if (flag === "success") {
                                $('#loginIn').hide();
                                $('#loginOut').show();
                                $('#useName').text(obj.data.xm);
                                body.skynetShadowBox("hide");
                                dialog.close();
                            } else {
                                skynetDialog.msg(msg, "warning", null, function () {
                                    btnStatus(true);
                                    body.skynetShadowBox("hide");
                                });
                            }

                        }
                    });
                }
                if (isEmpty(account)) {
                    skynetDialog.msg("登录账户不能为空！", "warning", null, function () {
                        btnStatus(true);
                    });
                } else if (isEmpty(password)) {
                    skynetDialog.msg("用户密码不能为空！", "warning", null, function () {
                        btnStatus(true);
                    });
                }
            });
        },
        shown: function () {
            var body = this.DOM.body;
            body.find("input[name='account']").focus();
        }
    });
};