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
            this.sessionSvc = sessionSvc;
            this.scope.showScroll = true;
            this.scope.stopLoading = false;
        }
        AuthorsBooksController.prototype.getNextTitles = function () {
            var _this = this;
            if (this.index < this.maxTitles) {
                this.scope.showScroll = true;
                this.http({
                    method: 'GET',
                    url: NuevaLuz.baseUrl + 'GetTitlesByAuthor?Session=' + this.sessionSvc.getSession() + '&Id=' + this.stateParams.authorId + '&Index=' + this.index + '&Count=' + this.pageSize
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
        return AuthorsBooksController;
    })();
    NuevaLuz.AuthorsBooksController = AuthorsBooksController;
})(NuevaLuz || (NuevaLuz = {}));
