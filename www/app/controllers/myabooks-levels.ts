/// <reference path="../app.ts" />

module NuevaLuz {

    export interface IABooksLevelsScope extends ng.IScope {
        control : ABooksLevelsController;
        currentLevel : number;
    }
    
    export class ABooksLevelsController {
        private scope : IABooksLevelsScope;
        private stateParams : angular.ui.IStateParamsService;       
        private player : DaisyPlayerService;
        private location : ng.ILocationService
    
        constructor($scope : IABooksLevelsScope, $stateParams : angular.ui.IStateParamsService, 
            $location : ng.ILocationService, DaisyPlayerSvc : DaisyPlayerService) {
            this.scope = $scope;
            this.scope.control = this;
            this.stateParams = $stateParams;    
            this.location = $location;
            this.player = DaisyPlayerSvc;
            
            this.scope.currentLevel = this.player.getPlayerInfo().position.navigationLevel;
        }
        
        setLevel(level : number) {
            var pInfo : PlayerInfo = this.player.getPlayerInfo();
            pInfo.position.navigationLevel = level;
            this.player.saveStatus(pInfo, () => {
                this.location.path("/myabooks/player/" + this.stateParams["abookId"]);
            },
            (message : string) => {
                alert(message);
            })
        }
    }

}