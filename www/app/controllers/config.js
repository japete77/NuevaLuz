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
        function ConfigController($scope, SessionSvc, $ionicPopup, $timeout, $ionicLoading) {
            var _this = this;
            this.movingMessages = "Moviendo audio libros ...";
            this.SessionSvc = SessionSvc;
            this.scope = $scope;
            this.scope.control = this;
            this.ionicPopup = $ionicPopup;
            this.timeout = $timeout;
            this.ionicLoading = $ionicLoading;
            this.scope.config = new StorageConfig();
            this.scope.config.showStorageConfig = ionic.Platform.isAndroid();
            this.scope.config.availableStorages = [];
            if (NuevaLuz.internalStorage) {
                this.scope.config.availableStorages.push(NuevaLuz.storageTypes[0]);
                this.scope.config.storage = NuevaLuz.storageTypes[0];
                this.prevStorage = NuevaLuz.storageTypes[0];
            }
            if (NuevaLuz.externalStorage) {
                this.scope.config.availableStorages.push(NuevaLuz.storageTypes[1]);
                this.scope.config.storage = NuevaLuz.storageTypes[1];
                this.prevStorage = NuevaLuz.storageTypes[1];
            }
            if (NuevaLuz.externalStorage2) {
                this.scope.config.availableStorages.push(NuevaLuz.storageTypes[2]);
                this.scope.config.storage = NuevaLuz.storageTypes[2];
                this.prevStorage = NuevaLuz.storageTypes[2];
            }
            this.SessionSvc.loadSessionInfo()
                .then(function (result) {
                if (result) {
                    var temp = _this.SessionSvc.getStorage();
                    console.log("NLUZ Storage selected: " + temp);
                    if (temp)
                        _this.scope.config.storage = temp;
                }
            });
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
            var _this = this;
            this.ionicPopup.confirm({
                title: "Cambiar ubicacion almacenamiento",
                template: "Se cambiará la ubicación del almacenamiento de los audio libros a " + this.scope.config.storage + ", ¿desea continuar?"
            })
                .then(function (result) {
                if (result) {
                    _this.SessionSvc.setStorage(_this.scope.config.storage);
                    _this.SessionSvc.saveSessionInfo().then(function (result) {
                        console.log("NLUZ Saved config " + _this.scope.config.storage);
                    });
                    _this.prevStorage = _this.scope.config.storage;
                    _this.moveBooks("", "");
                }
                else {
                    _this.scope.config.storage = _this.prevStorage;
                }
            });
        };
        ConfigController.prototype.moveBooks = function (sourcePath, targetPath) {
            var _this = this;
            this.timeout(function () {
                _this.ionicLoading.show({
                    template: _this.movingMessages
                });
            }, 0);
            // this.SessionSvc.isSessionValid()
            // .then((result : number) => {
            // })
            // ['catch']((reason : any) => {
            // })
            // ['finally'](() => {
            //     this.timeout(() => {
            //         this.ionicLoading.hide();
            //     }, 0); 
            // });
            this.timeout(function () {
                _this.ionicLoading.hide();
            }, 0);
        };
        return ConfigController;
    })();
    NuevaLuz.ConfigController = ConfigController;
})(NuevaLuz || (NuevaLuz = {}));
;
