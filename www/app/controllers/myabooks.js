/// <reference path="../app.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksController = (function (_super) {
        __extends(ABooksController, _super);
        function ABooksController($scope, $timeout, $http, myAbooksSvc, $stateParams, $ionicHistory, SessionSvc) {
            var _this = this;
            _super.call(this, SessionSvc);
            this.scope = $scope;
            this.scope.control = this;
            this.timeout = $timeout;
            this.http = $http;
            this.myABooksSvc = myAbooksSvc;
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
        return ABooksController;
    })(NuevaLuz.ControllerBase);
    NuevaLuz.ABooksController = ABooksController;
})(NuevaLuz || (NuevaLuz = {}));
;
