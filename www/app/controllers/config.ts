/// <reference path="../app.ts" />
    
module NuevaLuz {
    export interface IConfigScope extends ng.IScope {
        control : ConfigController;
    }
    
    export class ConfigController {
        protected SessionSvc : SessionService;
        private ionicPopup : ionic.popup.IonicPopupService;
        private scope : IConfigScope;
        
        constructor($scope : IConfigScope, SessionSvc : SessionService, $ionicPopup : ionic.popup.IonicPopupService) {
            this.SessionSvc = SessionSvc;
            this.scope = $scope;
            this.scope.control = this;
            this.ionicPopup = $ionicPopup;
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
        
    }
}