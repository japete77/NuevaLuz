/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ConfigController = (function () {
        function ConfigController($scope, SessionSvc, $ionicPopup) {
            this.SessionSvc = SessionSvc;
            this.scope = $scope;
            this.scope.control = this;
            this.ionicPopup = $ionicPopup;
        }
        ConfigController.prototype.clearCredentials = function () {
            var _this = this;
            this.ionicPopup.confirm({
                title: "Resetear Credenciales",
                template: "El usuario y la contraseña se resetearán y deberá introducirlas de nuevo para acceder a la audioteca de Nueva Luz, ¿desea continuar?"
            })
                .then(function (result) {
                if (result) {
                    _this.SessionSvc.clearSessionInfo();
                }
            });
        };
        return ConfigController;
    })();
    NuevaLuz.ConfigController = ConfigController;
})(NuevaLuz || (NuevaLuz = {}));
