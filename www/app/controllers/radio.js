/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var RadioController = (function () {
        function RadioController($scope, svcRadio, SessionSvc, $controller) {
            this.scope = $scope;
            this.scope.control = this;
            this.SessionSvc = SessionSvc;
            this.svcRadio = svcRadio;
        }
        RadioController.prototype.switchRadio = function () {
            this.svcRadio.switchRadio();
        };
        RadioController.prototype.getStatus = function () {
            return this.svcRadio.status;
        };
        RadioController.prototype.addCounter = function () {
            this.scope.count = this.scope.count + 1;
        };
        RadioController.prototype.isBookLoaded = function () {
            return this.SessionSvc.getCurrentBook() != null && this.SessionSvc.getCurrentBook() != undefined;
        };
        RadioController.prototype.getCurrentBookId = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        };
        RadioController.prototype.getCurrentBookTitle = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        };
        return RadioController;
    })();
    NuevaLuz.RadioController = RadioController;
})(NuevaLuz || (NuevaLuz = {}));
;
