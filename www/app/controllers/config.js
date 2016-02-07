/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var StorageConfig = (function () {
        function StorageConfig() {
        }
        return StorageConfig;
    })();
    NuevaLuz.StorageConfig = StorageConfig;
    var ConfigController = (function () {
        function ConfigController($scope, SessionSvc, $ionicPopup) {
            this.storageTypes = ["Interno", "Externo 1", "Externo 2"];
            this.SessionSvc = SessionSvc;
            this.scope = $scope;
            this.scope.control = this;
            this.ionicPopup = $ionicPopup;
            this.scope.config = new StorageConfig();
            this.scope.config.showStorageConfig = ionic.Platform.isAndroid();
            this.scope.config.availableStorages = [];
            if (NuevaLuz.internalStorage) {
                this.scope.config.availableStorages.push(this.storageTypes[0]);
                this.scope.config.storage = this.storageTypes[0];
            }
            if (NuevaLuz.externalStorage) {
                this.scope.config.availableStorages.push(this.storageTypes[1]);
                this.scope.config.storage = this.storageTypes[1];
            }
            if (NuevaLuz.externalStorage2) {
                this.scope.config.availableStorages.push(this.storageTypes[2]);
                this.scope.config.storage = this.storageTypes[2];
            }
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
        ConfigController.prototype.isBookLoaded = function () {
            return this.SessionSvc.getCurrentBook() != null && this.SessionSvc.getCurrentBook() != undefined;
        };
        ConfigController.prototype.getCurrentBookId = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        };
        ConfigController.prototype.getCurrentBookTitle = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        };
        ConfigController.prototype.storageChange = function () {
            this.ionicPopup.confirm({
                title: "Cambiar ubicacion almacenamiento",
                template: "Se cambiará la ubicación del almacenamiento de los audio libros a " + this.scope.config.storage + ", ¿desea continuar?"
            })
                .then(function (result) {
            });
        };
        return ConfigController;
    })();
    NuevaLuz.ConfigController = ConfigController;
})(NuevaLuz || (NuevaLuz = {}));
;
