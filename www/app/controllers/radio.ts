/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IRadioScope extends ng.IScope {
        control : RadioController;
    }
    
    export class RadioController {
        scope : IRadioScope;
        svcRadio : IRadioService;
        
        constructor($scope: IRadioScope, svcRadio : IRadioService) {
            this.scope = $scope;
            this.scope.control = this;
            this.svcRadio = svcRadio;
        }
        
        switchRadio() {
            this.svcRadio.switchRadio();
        }
        
        getStatus() {
            this.svcRadio.getStatus();
        }
    }
    
}