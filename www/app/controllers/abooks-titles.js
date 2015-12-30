/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksTitlesController = (function () {
        function ABooksTitlesController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, sessionSvc) {
            this.index = 1;
            this.maxTitles = 9999999;
            this.pageSize = 15;
            this.timer = null;
            this.scope = $scope;
            this.scope.control = this;
            this.scope.stopLoading = false;
            this.scope.showScroll = true;
            this.scope.titles = [];
            this.scope.filterText = "";
            this.timeout = $timeout;
            this.http = $http;
            this.ionicLoading = $ionicLoading;
            this.ionicScrollDelegate = $ionicScrollDelegate;
            this.sessionSvc = sessionSvc;
            var _this = this;
            // Filter watch
            this.scope.$watch('filterText', function () {
                _this.scope.stopLoading = true;
                if (_this.timer) {
                    _this.timeout.cancel(_this.timer);
                }
                // delay to avoid many requests when writing search text
                _this.timer = $timeout(function () {
                    _this.index = 1;
                    _this.maxTitles = 9999999;
                    _this.scope.titles = [];
                    _this.ionicScrollDelegate.scrollTop();
                    _this.getNextTitles();
                }, 1000);
            });
        }
        ABooksTitlesController.prototype.getNextTitles = function () {
            var _this = this;
            if (this.index < this.maxTitles) {
                this.scope.showScroll = true;
                if (this.scope.filterText == "") {
                    this.http({
                        method: 'GET',
                        url: NuevaLuz.baseUrl + 'GetTitles?Session=' + this.sessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                        .then(function success(response) {
                        _this.maxTitles = response.data.GetTitlesResult.Total;
                        response.data.GetTitlesResult.Titles.forEach(function (element) {
                            _this.scope.titles.push(element);
                        }, _this);
                        _this.index += _this.pageSize;
                        _this.timer = null;
                        _this.scope.stopLoading = false;
                        _this.scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }
                else {
                    this.http({
                        method: 'GET',
                        url: NuevaLuz.baseUrl + 'SearchTitles?Session=' + this.sessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                        .then(function success(response) {
                        _this.maxTitles = response.data.SearchTitlesResult.Total;
                        response.data.SearchTitlesResult.Titles.forEach(function (element) {
                            _this.scope.titles.push(element);
                        }, _this);
                        _this.index += _this.pageSize;
                        _this.timer = null;
                        _this.scope.stopLoading = false;
                        _this.scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }
            }
            else {
                this.scope.showScroll = false;
            }
        };
        ABooksTitlesController.prototype.loadMore = function () {
            if (!this.scope.stopLoading) {
                this.getNextTitles();
            }
        };
        return ABooksTitlesController;
    })();
    NuevaLuz.ABooksTitlesController = ABooksTitlesController;
})(NuevaLuz || (NuevaLuz = {}));
