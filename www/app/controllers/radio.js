/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var RadioController = (function () {
        function RadioController($scope, svcRadio) {
            this.scope = $scope;
            this.scope.control = this;
            this.svcRadio = svcRadio;
        }
        RadioController.prototype.switchRadio = function () {
            this.svcRadio.switchRadio();
        };
        RadioController.prototype.getStatus = function () {
            this.svcRadio.getStatus();
        };
        return RadioController;
    })();
    NuevaLuz.RadioController = RadioController;
})(NuevaLuz || (NuevaLuz = {}));
