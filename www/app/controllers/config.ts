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
        private prevStorage : string;
        private timeout: ng.ITimeoutService;
        private ionicLoading : ionic.loading.IonicLoadingService;
        private movingMessages : string = "Moviendo audio libros ...";
        
        constructor($scope : IConfigScope, SessionSvc : SessionService, 
            $ionicPopup : ionic.popup.IonicPopupService, $timeout: ng.ITimeoutService, 
            $ionicLoading : ionic.loading.IonicLoadingService) {
            this.SessionSvc = SessionSvc;
            this.scope = $scope;
            this.scope.control = this;
            this.ionicPopup = $ionicPopup; 
            this.timeout = $timeout;
            this.ionicLoading = $ionicLoading;
            
            this.scope.config = new StorageConfig();
            this.scope.config.showStorageConfig = ionic.Platform.isAndroid();
            this.scope.config.availableStorages = [];
            if (internalStorage) {
                this.scope.config.availableStorages.push(storageTypes[0]);
                this.scope.config.storage = storageTypes[0];
                this.prevStorage = storageTypes[0];
            }
            if (externalStorage) {
                this.scope.config.availableStorages.push(storageTypes[1]);
                this.scope.config.storage = storageTypes[1];
                this.prevStorage = storageTypes[1];
            }
            if (externalStorage2) {
                this.scope.config.availableStorages.push(storageTypes[2]);
                this.scope.config.storage = storageTypes[2];
                this.prevStorage = storageTypes[2];
            }
            
            this.SessionSvc.loadSessionInfo()
            .then((result: boolean) => {
                if (result) {
                    var temp = this.SessionSvc.getStorage();
                    console.log("NLUZ Storage selected: " + temp);
                    if (temp) this.scope.config.storage = temp;
                }
            });
            
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
                if (result) {
                    this.SessionSvc.setStorage(this.scope.config.storage);
                    this.SessionSvc.saveSessionInfo().then((result: boolean) => {
                        console.log("NLUZ Saved config " + this.scope.config.storage);
                    });
                    this.prevStorage = this.scope.config.storage;
                    this.moveBooks("","");
                }
                else {
                    this.scope.config.storage = this.prevStorage;
                }
            });

        }
        
        moveBooks(sourcePath: string, targetPath: string) {
            this.timeout(() => {
                this.ionicLoading.show({
                    template: this.movingMessages
                });
            }, 0)

            // this.SessionSvc.isSessionValid()
            // .then((result : number) => {
            // })
            // .catch((reason : any) => {
            // })
            // .finally(() => {
            //     this.timeout(() => {
            //         this.ionicLoading.hide();
            //     }, 0); 
            // });

            this.timeout(() => {
                this.ionicLoading.hide();
            }, 0); 
        }
        
    }
};