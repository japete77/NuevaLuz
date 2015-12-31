/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksPlayerScope extends ng.IScope {
        control : ABooksPlayerController;
        currentBook : DaisyBook;
    }
    
    export class ABooksPlayerController {
        private scope : IABooksPlayerScope;
        private player : DaisyPlayerService;
        private location: ng.ILocationService;
        
        constructor($scope : IABooksPlayerScope, $stateParams : any, $location : ng.ILocationService, player : DaisyPlayerService) {
            this.scope = $scope;
            this.scope.control = this;
            this.player = player;
            this.location = $location;
            
            // Prepare audio player
            this.scope.currentBook = this.player.loadBook($stateParams.abookId);
        }
        
        test() {
            this.player.play();
        }
        
        showInfo(id : string) {
            this.location.path("/myabooks/info/" + this.scope.currentBook.id);
        }
    }

}