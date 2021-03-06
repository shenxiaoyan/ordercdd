"use strict";
/* Controllers */

app.controller("AppCtrl",
    [
        "$scope",
        "$http",
        "$translate",
        "$localStorage",
        "$window",
        "$rootScope",
        "$state",
        "$filter",
        "entity",
        function ($scope, $http, $translate, $localStorage, $window, $rootScope, $state, $filter, entity) {

            $rootScope.updateUser = {};

            /*
            * header中的返回列表按钮
            * @author  金杭
            * @param   无
            * @return  无
            * */
            $scope.globalListHashJump = function(){
                var url = window.sessionStorage.getItem("globalListType");
                var params = JSON.parse(window.sessionStorage.getItem("globalListParams"));
                $state.go(url,params,{reload:true});
            };

            $rootScope.myinfo = angular.copy(window.myinfo);

            $rootScope.updateUser.nickname   = $rootScope.myinfo.nickname;
            $rootScope.updateUser.sex        = $rootScope.myinfo.sex;
            $rootScope.updateUser.country    = $rootScope.myinfo.country;
            $rootScope.updateUser.province   = $rootScope.myinfo.province;
            $rootScope.updateUser.city       = $rootScope.myinfo.city;
            $rootScope.updateUser.headimgurl = $rootScope.myinfo.headimgurl;

            entity.getDetail("rest/roles/" + $rootScope.myinfo.role.id).then(function (menuResResult) {
                $rootScope.menus = menuResResult.visibleMenuTree;
            });

            $http.get("getEntityInfo").success(function (response) {
                $rootScope.allEntitiesInfo = response;
                console.log($rootScope.allEntitiesInfo);
            });

            /*
            * 重置密码函数
            * @author 金杭
            * */
            $scope.oldPwd     = null;
            $scope.newPwd     = null;
            $scope.confirmPwd = null;

            $scope.resetPassword = function () {

                $http({
                    method: "PATCH",
                    url: "/rest/users/" + $rootScope.myinfo.id,
                    data: {
                        act: "Modifypassword",
                        password: $scope.oldPwd,
                        newPassword: $scope.confirmPwd
                    }
                }).success(function (resResult) {
                    $rootScope.toasterSuccess("成功！", "修改密码成功！");
                    $("#reset_password_modal").modal("hide");
                    window.location.href = "/logout";
                });

            };

            /*
            * 登录用户主动修改信息
            * @author  金杭
            * @param   无
            * @return  无
            * */
            $scope.updateUserInfo = function () {

                $rootScope.updateUser.act = "update";

                $http({
                    method: "PATCH",
                    url: "/rest/users/" + $rootScope.myinfo.id,
                    data: $rootScope.updateUser
                }).success(function (resResult) {
                    $rootScope.toasterSuccess("成功！", "修改用户信息成功！");
                    $("#user_update_modal").modal("hide");
                    window.location.reload(true);
                });

            };

            /*
            * 登录用户主动修改头像
            * @author  金杭
            * @param   无
            * @return  无
            * */
            $scope.updateHeadimg = function () {

                var fd = new FormData();

                var headimg = $("#headimgurl_update_input")[0].files[0];

                if (headimg) {

                    fd.append("fileType", "image");
                    fd.append("file", headimg);

                    $http({
                        method: "POST",
                        url: "fileUpload",
                        data: fd,
                        headers: {
                            "Content-type": undefined
                        }
                    }).success(function (resResult) {

                        $http({
                            method: "PATCH",
                            url: "/rest/users/" + $rootScope.myinfo.id,
                            data: {
                                act: "update",
                                headimgurl: "http://files.xiaojinpingtai.com/" + resResult.result.newFileName
                            }
                        }).success(function (resResult) {
                            $rootScope.toasterSuccess("成功！", "修改用户头像成功！");
                            $("#headimg_update_modal").modal("hide");
                            window.location.reload(true);
                        });

                    });

                }

            };

            $rootScope.toasterSuccess = function (title, text) {
                toastr.success(text, title);
            };

            $rootScope.toasterError = function (title, text) {
                toastr.error(text, title);
            };

            $rootScope.toasterWarning = function (title, text) {
                toastr.warning(text, title);
            };

            $rootScope.toasterInfo = function (title, text) {
                toastr.info(text, title);
            };

            /*
            * 封装 sweetalert，减少代码量
            * @author 金杭
            * @date   2017/07/20
            * @param  {object} options
            *    options属性：
            *    title     弹出框的标题            string
            *    text      弹出框的具体内容    string
            *    type      弹出框 的类型           string
            *    callback  确认后执行的内容    function
            * @return 无
            * */
            $rootScope.sweetConfirm = function (options) {
                swal({
                    title: options.title,
                    text: options.text,
                    type: options.type,
                    showCancelButton: true,
                    confirmButtonColor: "#F05050",
                    cancelButtonText: "不，让我想想",
                    confirmButtonText: "是，我想好了",
                    closeOnConfirm: true
                }, function () {
                    options.callback();
                });
            };

            /*
            * 设置分页的函数
            * @author  金杭
            * @param   selector  {string}    分页的选择器
            * @param   pageList  {object}    分页参数
            * @param   callback  {function}  点击页码后的回调函数
            * */
            $rootScope.setPaginator = function (selector, pageList, callback) {

                //分页的配置
                var pageOptions = {
                    bootstrapMajorVersion: 3, //版本
                    currentPage: pageList.current_page + 1, //当前页数
                    // numberOfPages:pageList.num_page,//显示页数
                    totalPages: pageList.total_page, //总页数
                    tooltipTitles: function (type, page, current) {
                        //修改鼠标悬停title为中文
                        switch (type) {
                            case "next":
                                return "下一页";
                            case "last":
                                return "末页";
                            case "page":
                                return "第" + page + "页";
                        }
                    },
                    itemTexts: function (type, page, current) {
                        //修改按钮文字为中文
                        switch (type) {
                            case "first":
                                return "首页";
                            case "prev":
                                return "上一页";
                            case "next":
                                return "下一页";
                            case "last":
                                return "末页";
                            case "page":
                                return page;
                        }
                    },
                    onPageChanged: function (event, oldPage, newPage) {
                        //Ajax来刷新整个list列表
                        callback(newPage - 1);
                    }
                };
                //设置分页插件
                $(selector).bootstrapPaginator(pageOptions);
            };

            //消息通知开始
            $rootScope.unReadNumber = 0;

            $rootScope.notice = new SockJS(window.location.origin + "/notice");

            $rootScope.notice.onopen = function(){
                entity.getUnReadNotice();
            };

            $rootScope.notice.onmessage = function(e){
                $rootScope.toasterInfo("消息提示！","您有一条新的消息！");
                entity.getUnReadNotice();
                $rootScope.getNoticeList(0);
            };

            $rootScope.notice.onclose = function(e){
                //alert("链接被关闭，请重新连接");
            };

            $rootScope.noticeForms = {};
            /*搜索值的对象*/
            $rootScope.noticeSearchForms = {};

            $rootScope.noticeForms.size = "10";
            $rootScope.noticeForms.sort = "id,desc";

            $rootScope.noticePageList = {
                size: 0,
                total_elements: 0,
                current_page: 0,
                num_page: 1,
                total_page: 1
            };

            $rootScope.noticeList = [];

            $rootScope.getNoticeList = function(page){

                $rootScope.noticeList = [];

                $rootScope.noticeForms.page = page;

                $http.get("/notice/search", {
                    params: $rootScope.noticeForms
                }).then(function (resResult) {

                    $rootScope.noticeList = resResult.data.content;

                    if ($rootScope.noticeList.length > 0) {

                        $rootScope.noticeList = $rootScope.noticeList.sort(function(a,b){
                            return new Date(b.noticeInfo.createdAt) - new Date(a.noticeInfo.createdAt);
                        });

                        $rootScope.noticePageList = {
                            size: resResult.data.size,
                            total_elements: resResult.data.totalElements,
                            current_page: resResult.data.number,
                            num_page: resResult.data.totalPages,
                            total_page: resResult.data.totalPages
                        };
                    } else {
                        $rootScope.noticePageList = {
                            size: 0,
                            total_elements: 0,
                            current_page: 0,
                            num_page: 1,
                            total_page: 1
                        };
                    }

                    $rootScope.setPaginator("#notice_list_paginator", $rootScope.noticePageList, $rootScope.getNoticeList);

                });

            };

            /*搜索*/
            $rootScope.noticeSearchSubmit = function () {

                if($rootScope.noticeForms.isRead === ""){
                    delete $rootScope.noticeForms.isRead;
                }

                /*合并对象*/
                $rootScope.noticeForms = Object.assign($rootScope.noticeSearchForms, $rootScope.noticeForms);

                $rootScope.getNoticeList(0);

            };

            //清除搜索
            $rootScope.noticeClearSearch = function () {
                $rootScope.noticeForms       = {};
                $rootScope.noticeSearchForms = {};

                $rootScope.noticeForms.size = "10";
                $rootScope.noticeForms.sort = "id,desc";

                $rootScope.getNoticeList(0);
            };

            $rootScope.readNotice = function(noticeId, isRead, reload){
                $http({
                    method:"PATCH",
                    url:"/rest/notices/" + noticeId,
                    data:{
                        read:isRead
                    }
                }).success(function(resResult){

                    entity.getUnReadNotice();

                    if(reload){
                        $rootScope.getNoticeList(0);
                    }

                });
            };

            $rootScope.toNoticeDetail = function(noticeId, notice){
                var entity = $filter("formatNoticeEntity")(notice);
                $rootScope.readNotice(noticeId,true,false);
                $state.go(entity.entityType + ".home.profile.info",{id:entity.entityId,workflow_id:entity.workflowId,entity_key:entity.entityName},{reload:true});
            };

            //消息通知结束

            $rootScope.global_configs = {
                isEnabled: [
                    {key: 0, name: '不启用'},
                    {key: 1, name: '启用'}
                ],
                product_types: {
                    credit_load: '信用贷',
                    mortgage_load: '抵押',
                    pledge_load: '质押'
                },
                repayment_types: {
                    dengerbenxi: '等额本息',
                    dengerbenjin: '等额本金',
                    xianxihouben: '先息后本'
                },
                customer_types: {
                    personal: '个人',
                    enterprise: '企业'
                },
                time_units: {
                    day: '天',
                    week: '周',
                    month: '月'
                }
            };

            // add 'ie' classes to html
            var isIE = !!navigator.userAgent.match(/MSIE/i);
            if (isIE) {
                angular.element($window.document.body).addClass('ie');
            }
            if (isSmartDevice($window)) {
                angular.element($window.document.body).addClass('smart')
            }
            // config
            $scope.app = {
                name: '小金平台',
                version: '1.0.0',
                // for chart colors
                color: {
                    primary: '#7266ba',
                    info: '#23b7e5',
                    success: '#27c24c',
                    warning: '#fad733',
                    danger: '#f05050',
                    light: '#e8eff0',
                    dark: '#3a3f51',
                    black: '#1c2b36'
                },
                settings: {
                    themeID: 13,
                    navbarHeaderColor: "bg-dark",
                    navbarCollapseColor: "bg-white-only",
                    asideColor: "bg-dark",
                    headerFixe: true,
                    asideFixed: true,
                    asideFolded: false,
                    asideDock: false,
                    container: false
                }
            };

            // save settings to local storage
            if (angular.isDefined($localStorage.settings)) {
                $scope.app.settings = $localStorage.settings;
            } else {
                $localStorage.settings = $scope.app.settings;
            }

            $scope.$watch('app.settings', function () {
                if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
                    // aside dock and fixed must set the header fixed.
                    $scope.app.settings.headerFixed = true;
                }
                // for box layout, add background image
                $scope.app.settings.container ? angular.element('html').addClass('bg') : angular.element('html').removeClass('bg');
                // save to local storage
                $localStorage.settings = $scope.app.settings;
            }, true);
            // angular translate
            $scope.lang = {isopen: false};

            $translate.use("getEntityInfo");

            function isSmartDevice($window) {
                // Adapted from http://www.detectmobilebrowsers.com
                var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
            }


        }
    ]
)
    .run([
        '$rootScope',
        '$state',
        '$stateParams',
        '$templateCache',
        '$log',
        function ($rootScope, $state, $stateParams, $templateCache, $log) {

            $rootScope.$on("$stateChangeSuccess",function(event, toState, toParams, fromState, fromParams){
                //$state.reload();
                if(toState.name === "workflowEntity.list" || toState.name === "auditEntity.list"){
                    window.sessionStorage.setItem("globalListType",toState.name);
                    window.sessionStorage.setItem("globalListParams",JSON.stringify(toParams));
                }
            });

        }
    ]);