/// <reference path="../app.ts" />
    
module NuevaLuz {
    export interface IConfigScope extends ng.IScope {
        control : ConfigController;
        config : StorageConfig;
    }
    
    export class StorageConfig {
        storage: string;
        showStorageConfig : boolean;
        availableStorages: string[];
    }
    
    export class ConfigController {
        protected SessionSvc : SessionService;
        private ionicPopup : ionic.popup.IonicPopupService;
        private scope : IConfigScope;
        private storageTypes: string[] = [ "Interno", "Externo 1", "Externo 2" ];
        
        constructor($scope : IConfigScope, SessionSvc : SessionService, $ionicPopup : ionic.popup.IonicPopupService) {
            this.SessionSvc = SessionSvc;
            this.scope = $scope;
            this.scope.control = this;
            this.ionicPopup = $ionicPopup; 
            
            this.scope.config = new StorageConfig();
            this.scope.config.showStorageConfig = ionic.Platform.isAndroid();
            this.scope.config.availableStorages = [];
            if (internalStorage) {
                this.scope.config.availableStorages.push(this.storageTypes[0]);
                this.scope.config.storage = this.storageTypes[0];
            }
            if (externalStorage) {
                this.scope.config.availableStorages.push(this.storageTypes[1]);
                this.scope.config.storage = this.storageTypes[1];
            }
            if (externalStorage2) {
                this.scope.config.availableStorages.push(this.storageTypes[2]);
                this.scope.config.storage = this.storageTypes[2];
            }
        }
                
        clearCredentials() {
            this.ionicPopup.confirm({
                title: "Resetear Credenciales",
                template: "El usuario y la contraseña se resetearán y deberá introducirlas de nuevo para acceder a la audioteca de Nueva Luz, ¿desea continuar?"
            })
            .then((result : boolean) => {
                if (result) {
                    this.SessionSvc.clearSessionInfo();
                }
            });
        }
        
        isBookLoaded() : boolean {
            return this.SessionSvc.getCurrentBook()!=null && this.SessionSvc.getCurrentBook()!=undefined;
        }
        
        getCurrentBookId() : string {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        }
        
        getCurrentBookTitle() : string {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        }
        
        storageChange() {
            this.ionicPopup.confirm({
                title: "Cambiar ubicacion almacenamiento",
                template: "Se cambiará la ubicación del almacenamiento de los audio libros a " + this.scope.config.storage + ", ¿desea continuar?"
            })
            .then((result : boolean) => {
            });

        }
        
    }
};