/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksController = (function () {
        function ABooksController($scope, $timeout, $http, myAbooksSvc, $stateParams, $ionicHistory, SessionSvc) {
            var _this = this;
            this.scope = $scope;
            this.scope.control = this;
            this.timeout = $timeout;
            this.http = $http;
            this.myABooksSvc = myAbooksSvc;
            this.SessionSvc = SessionSvc;
            if ($stateParams["command"] == "clear") {
                $ionicHistory.clearHistory();
            }
            // Retrieve all my audio books
            this.myABooksSvc.getBooks(function (response) {
                _this.scope.abooks = response;
            });
        }
        ABooksController.prototype.getLink = function (id) {
            var index = this.getABookIndex(id);
            if (index >= 0) {
                if (this.scope.abooks[index].statusKey == NuevaLuz.STATUS_COMPLETED) {
                    return '#/myabooks/player/' + id;
                }
                else {
                    return '#/abooks/menu/detail/' + id;
                }
            }
        };
        ABooksController.prototype.getABookIndex = function (id) {
            if (this.scope.abooks != null) {
                for (var i = 0; i < this.scope.abooks.length; i++) {
                    if (this.scope.abooks[i].id == id)
                        return i;
                }
            }
            return -1;
        };
        ABooksController.prototype.isShowable = function (id) {
            var index = this.getABookIndex(id);
            if (index >= 0) {
                return this.scope.abooks[index].statusKey == NuevaLuz.STATUS_DOWNLOADING ||
                    this.scope.abooks[index].statusKey == NuevaLuz.STATUS_INSTALLING ||
                    this.scope.abooks[index].statusKey == NuevaLuz.STATUS_COMPLETED;
            }
            false;
        };
        ABooksController.prototype.isProgressing = function (id) {
            var index = this.getABookIndex(id);
            if (index >= 0) {
                return this.scope.abooks[index].statusKey == NuevaLuz.STATUS_DOWNLOADING ||
                    this.scope.abooks[index].statusKey == NuevaLuz.STATUS_INSTALLING;
            }
            false;
        };
        ABooksController.prototype.isCompleted = function (id) {
            var index = this.getABookIndex(id);
            if (index >= 0) {
                return this.scope.abooks[index].statusKey == NuevaLuz.STATUS_COMPLETED;
            }
            false;
        };
        ABooksController.prototype.isBookLoaded = function () {
            return this.SessionSvc.getCurrentBook() != null && this.SessionSvc.getCurrentBook() != undefined;
        };
        ABooksController.prototype.getCurrentBookId = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        };
        ABooksController.prototype.getCurrentBookTitle = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        };
        return ABooksController;
    })();
    NuevaLuz.ABooksController = ABooksController;
})(NuevaLuz || (NuevaLuz = {}));
;
