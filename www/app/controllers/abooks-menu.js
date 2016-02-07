/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksMenuController = (function () {
        function ABooksMenuController($scope, SessionSvc, $location, ionicLoading, $timeout) {
            var _this = this;
            this.scope = $scope;
            this.scope.control = this;
            this.scope.ready = false;
            this.SessionSvc = SessionSvc;
            this.location = $location;
            this.ionicLoading = ionicLoading;
            this.timeout = $timeout;
            this.timeout(function () {
                _this.ionicLoading.show({
                    template: 'Verificando credenciales...'
                });
            }, 0);
            this.SessionSvc.isSessionValid()
                .then(function (result) {
                _this.scope.ready = true;
            })
                ['catch'](function (reason) {
                _this.location.path("/login");
            })
                ['finally'](function () {
                _this.timeout(function () {
                    _this.ionicLoading.hide();
                }, 0);
            });
        }
        ABooksMenuController.prototype.isBookLoaded = function () {
            return this.SessionSvc.getCurrentBook() != null && this.SessionSvc.getCurrentBook() != undefined;
        };
        ABooksMenuController.prototype.getCurrentBookId = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        };
        ABooksMenuController.prototype.getCurrentBookTitle = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        };
        return ABooksMenuController;
    })();
    NuevaLuz.ABooksMenuController = ABooksMenuController;
})(NuevaLuz || (NuevaLuz = {}));
;
