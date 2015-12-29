/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var AuthorsController = (function () {
        function AuthorsController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, sessionSvc) {
            this.index = 1;
            this.maxAuthors = 9999999;
            this.pageSize = 15;
            this.timer = null;
            this.LoadMore = function () {
                if (!this.scope.stopLoading) {
                    this.scope.GetNextAuthors();
                }
            };
            this.scope = $scope;
            this.scope.control = this;
            this.scope = $scope;
            this.scope.stopLoading = false;
            this.scope.showScroll = true;
            this.scope.authors = [];
            this.scope.filterText = "";
            this.timeout = $timeout;
            this.http = $http;
            this.ionicLoading = $ionicLoading;
            this.ionicScrollDelegate = $ionicScrollDelegate;
            this.sessionSvc = sessionSvc;
            var _control = this;
            // Filter
            this.scope.$watch('filterText', function () {
                _control.scope.stopLoading = true;
                if (_control.timer) {
                    _control.timeout.cancel(this.timer);
                }
                // delay to avoid many requests when writing search text
                _control.timer = _control.timeout(function () {
                    _control.index = 1;
                    _control.maxAuthors = 9999999;
                    _control.scope.authors = [];
                    _control.ionicScrollDelegate.scrollTop();
                    _control.getNextAuthors();
                }, 1000);
            });
        }
        AuthorsController.prototype.getNextAuthors = function () {
            var _control = this;
            if (this.index < this.maxAuthors) {
                this.scope.showScroll = true;
                if (this.scope.filterText == "") {
                    this.http({
                        method: 'GET',
                        url: NuevaLuz.baseUrl + 'GetAuthors?Session=' + this.sessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                        .then(function success(response) {
                        _control.maxAuthors = response.data.GetAuthorsResult.Total;
                        response.data.GetAuthorsResult.Authors.forEach(function (element) {
                            _control.scope.authors.push(element);
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
                        url: NuevaLuz.baseUrl + 'SearchAuthors?Session=' + this.sessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                        .then(function success(response) {
                        _control.maxAuthors = response.data.SearchAuthorsResult.Total;
                        response.data.SearchAuthorsResult.Authors.forEach(function (element) {
                            _control.scope.authors.push(element);
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
        return AuthorsController;
    })();
    NuevaLuz.AuthorsController = AuthorsController;
})(NuevaLuz || (NuevaLuz = {}));
