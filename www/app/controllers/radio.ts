/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IRadioScope extends ng.IScope {
        control : RadioController;
    }
    
    export class RadioController {
        private scope : IRadioScope;
        private svcRadio : IRadioService;
        
        constructor($scope: IRadioScope, svcRadio : IRadioService, SessionSvc : SessionService) {        
            
            // super(SessionSvc);
            
            this.scope = $scope;
            this.scope.control = this;
            this.svcRadio = svcRadio;
        }
        
        switchRadio() {
            this.svcRadio.switchRadio();
        }
        
    }
    
}