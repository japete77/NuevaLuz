/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var RadioController = (function () {
        function RadioController($scope, svcRadio, SessionSvc) {
            // super(SessionSvc);
            this.scope = $scope;
            this.scope.control = this;
            this.svcRadio = svcRadio;
        }
        RadioController.prototype.switchRadio = function () {
            this.svcRadio.switchRadio();
        };
        return RadioController;
    })();
    NuevaLuz.RadioController = RadioController;
})(NuevaLuz || (NuevaLuz = {}));
;
