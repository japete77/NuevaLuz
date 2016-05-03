/// <reference path="../app.ts" />

module NuevaLuz {

    export interface IABooksIndexScope extends ng.IScope {
        control : ABooksIndexController;
        book : DaisyBook;
        currentLevel : number;
    }
    
    export class ABooksIndexController {
        private scope : IABooksIndexScope;
        private stateParams : angular.ui.IStateParamsService;       
        private player : DaisyPlayerService;
        private location : ng.ILocationService
    
        constructor($scope : IABooksIndexScope, $stateParams : angular.ui.IStateParamsService, 
            $location : ng.ILocationService, DaisyPlayerSvc : DaisyPlayerService) {
            this.scope = $scope;
            this.scope.control = this;
            this.stateParams = $stateParams;    
            this.location = $location;
            this.player = DaisyPlayerSvc;
            this.scope.book = this.player.getCurrentBook();
            this.scope.currentLevel = this.player.getPlayerInfo().position.navigationLevel;
        }
                
        seek(index : number) {
            
            var res : Bookmark = null;
            for (var i=0; i<this.scope.book.sequence.length; i++) {
                if (this.scope.book.sequence[i].id===this.scope.book.body[index].id) {
                    res = {
                        id: 0,
                        index: i,
                        title: this.scope.book.sequence[i].title,
                        tc: this.scope.book.sequence[i].tcin,
                        som: this.scope.book.sequence[i].som,
                        absoluteTC: this.player.seconds2TC(this.scope.book.sequence[i].tcin + this.scope.book.sequence[i].som)
                    };
                    break;
                }
            }

            this.player.seek(res);
            this.player.playFromCurrentPos();
        }
    }

};