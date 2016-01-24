/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var AuthorsBooksController = (function () {
        function AuthorsBooksController($scope, $http, $location, $ionicLoading, $stateParams, sessionSvc) {
            this.index = 1;
            this.maxTitles = 9999999;
            this.pageSize = 9999999;
            this.timer = null;
            this.scope = $scope;
            this.scope.control = this;
            this.scope.titles = [];
            this.http = $http;
            this.location = $location;
            this.ionicLoading = $ionicLoading;
            this.stateParams = $stateParams;
            this.stateParams = $stateParams;
            this.SessionSvc = sessionSvc;
            this.scope.showScroll = true;
            this.scope.stopLoading = false;
        }
        AuthorsBooksController.prototype.getNextTitles = function () {
            var _this = this;
            if (this.index < this.maxTitles) {
                this.scope.showScroll = true;
                this.http({
                    method: 'GET',
                    url: NuevaLuz.baseUrl + 'GetTitlesByAuthor?Session=' + this.SessionSvc.getSession() + '&Id=' + this.stateParams.authorId + '&Index=' + this.index + '&Count=' + this.pageSize
                })
                    .then(function (response) {
                    _this.maxTitles = response.data.GetTitlesByAuthorResult.Total;
                    response.data.GetTitlesByAuthorResult.Titles.forEach(function (element) {
                        _this.scope.titles.push(element);
                    }, _this);
                    _this.index += _this.pageSize;
                    _this.timer = null;
                    _this.scope.stopLoading = false;
                    _this.scope.$broadcast('scroll.infiniteScrollComplete');
                }, function (reason) {
                    _this.SessionSvc.isSessionValid()
                        .then(function (result) {
                        _this.getNextTitles();
                    })
                        ['catch'](function (reason) {
                        _this.location.path("/login");
                    });
                });
            }
            else {
                this.scope.showScroll = false;
            }
        };
        AuthorsBooksController.prototype.loadMore = function () {
            if (!this.scope.stopLoading) {
                this.getNextTitles();
            }
        };
        AuthorsBooksController.prototype.isBookLoaded = function () {
            return this.SessionSvc.getCurrentBook() != null && this.SessionSvc.getCurrentBook() != undefined;
        };
        AuthorsBooksController.prototype.getCurrentBookId = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        };
        AuthorsBooksController.prototype.getCurrentBookTitle = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        };
        return AuthorsBooksController;
    })();
    NuevaLuz.AuthorsBooksController = AuthorsBooksController;
})(NuevaLuz || (NuevaLuz = {}));
;
