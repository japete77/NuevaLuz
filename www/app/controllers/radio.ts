/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IRadioScope extends ng.IScope {
        control : RadioController;
    }
    
    export class RadioController {
        private scope : IRadioScope;
        private svcRadio : IRadioService;
        private SessionSvc : SessionService;
        
        constructor($scope: IRadioScope, svcRadio : IRadioService, 
            SessionSvc : SessionService, $controller : ng.IControllerService) {
            
            this.scope = $scope;
            this.scope.control = this;
            this.SessionSvc = SessionSvc;
            this.svcRadio = svcRadio;
        }
        
        switchRadio() {
            this.svcRadio.switchRadio();
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
        
    }
    
};