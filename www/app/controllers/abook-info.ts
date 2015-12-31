/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABookInfoScope extends ng.IScope {
        control : ABookInfoController;
        currentBook : DaisyBook;
    }
    
    export class ABookInfoController {
        private scope : IABookInfoScope;
        private playerSvc : DaisyPlayerService;
  
        constructor($scope : IABookInfoScope, DaisyPlayerSvc : DaisyPlayerService) {
            this.scope = $scope;
            this.scope.control = this;
            this.playerSvc = DaisyPlayerSvc;
            this.scope.currentBook = this.playerSvc.getCurrentBook();
        }
    }
}