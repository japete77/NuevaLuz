/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var AuthorsController = (function () {
        function AuthorsController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, sessionSvc, $location) {
            var _this = this;
            this.index = 1;
            this.maxAuthors = 9999999;
            this.pageSize = 15;
            this.timer = null;
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
            this.location = $location;
            // Filter
            this.scope.$watch('filterText', function () {
                _this.scope.stopLoading = true;
                if (_this.timer) {
                    _this.timeout.cancel(_this.timer);
                }
                // delay to avoid many requests when writing search text
                _this.timer = _this.timeout(function () {
                    _this.index = 1;
                    _this.maxAuthors = 9999999;
                    _this.scope.authors = [];
                    _this.ionicScrollDelegate.scrollTop();
                    _this.getNextAuthors();
                }, 1000);
            });
        }
        AuthorsController.prototype.getNextAuthors = function () {
            var _this = this;
            if (this.index < this.maxAuthors) {
                this.scope.showScroll = true;
                if (this.scope.filterText == "") {
                    this.http({
                        method: 'GET',
                        url: NuevaLuz.baseUrl + 'GetAuthors?Session=' + this.sessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                        .then(function (response) {
                        _this.maxAuthors = response.data.GetAuthorsResult.Total;
                        response.data.GetAuthorsResult.Authors.forEach(function (element) {
                            _this.scope.authors.push(element);
                        }, _this);
                        _this.index += _this.pageSize;
                        _this.timer = null;
                        _this.scope.stopLoading = false;
                        _this.scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function (reason) {
                        _this.sessionSvc.isSessionValid()
                            .then(function (result) {
                            _this.getNextAuthors();
                        })
                            .catch(function (reason) {
                            _this.location.path("/login");
                        });
                    });
                }
                else {
                    this.http({
                        method: 'GET',
                        url: NuevaLuz.baseUrl + 'SearchAuthors?Session=' + this.sessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                        .then(function (response) {
                        _this.maxAuthors = response.data.SearchAuthorsResult.Total;
                        response.data.SearchAuthorsResult.Authors.forEach(function (element) {
                            _this.scope.authors.push(element);
                        }, _this);
                        _this.index += _this.pageSize;
                        _this.timer = null;
                        _this.scope.stopLoading = false;
                        _this.scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function (reason) {
                        _this.sessionSvc.isSessionValid()
                            .then(function (result) {
                            _this.getNextAuthors();
                        })
                            .catch(function (reason) {
                            _this.location.path("/login");
                        });
                    });
                }
            }
            else {
                this.scope.showScroll = false;
            }
        };
        AuthorsController.prototype.loadMore = function () {
            if (!this.scope.stopLoading) {
                this.getNextAuthors();
            }
        };
        return AuthorsController;
    })();
    NuevaLuz.AuthorsController = AuthorsController;
})(NuevaLuz || (NuevaLuz = {}));
