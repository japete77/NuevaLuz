/// <reference path="../app.ts" />

module NuevaLuz {

    export interface IABooksLevelsScope extends ng.IScope {
        control : ABooksLevelsController;
        levels : Array<string>;
        currentLevel : number;
        hasPages : boolean;
        hasBookmarks : boolean;
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
            
            this.scope.levels = this.player.getLevels();
            this.scope.hasPages = this.player.getCurrentBook().hasPages;
            this.scope.hasBookmarks = this.player.getPlayerInfo().bookmarks && this.player.getPlayerInfo().bookmarks.length>0;
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

};