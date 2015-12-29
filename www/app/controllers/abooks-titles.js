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
            var _control = this;
            // Filter watch
            this.scope.$watch('filterText', function () {
                _control.scope.stopLoading = true;
                if (_control.timer) {
                    _control.timeout.cancel(_control.timer);
                }
                // delay to avoid many requests when writing search text
                _control.timer = $timeout(function () {
                    _control.index = 1;
                    _control.maxTitles = 9999999;
                    _control.scope.titles = [];
                    _control.ionicScrollDelegate.scrollTop();
                    _control.getNextTitles();
                }, 1000);
            });
        }
        ABooksTitlesController.prototype.getNextTitles = function () {
            var _control = this;
            if (this.index < this.maxTitles) {
                this.scope.showScroll = true;
                if (this.scope.filterText == "") {
                    this.http({
                        method: 'GET',
                        url: NuevaLuz.baseUrl + 'GetTitles?Session=' + this.sessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                        .then(function success(response) {
                        _control.maxTitles = response.data.GetTitlesResult.Total;
                        response.data.GetTitlesResult.Titles.forEach(function (element) {
                            _control.scope.titles.push(element);
                        }, _control);
                        _control.index += _control.pageSize;
                        _control.timer = null;
                        _control.scope.stopLoading = false;
                        _control.scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }
                else {
                    this.http({
                        method: 'GET',
                        url: NuevaLuz.baseUrl + 'SearchTitles?Session=' + this.sessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                        .then(function success(response) {
                        _control.maxTitles = response.data.SearchTitlesResult.Total;
                        response.data.SearchTitlesResult.Titles.forEach(function (element) {
                            _control.scope.titles.push(element);
                        }, _control);
                        _control.index += _control.pageSize;
                        _control.timer = null;
                        _control.scope.stopLoading = false;
                        _control.scope.$broadcast('scroll.infiniteScrollComplete');
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
