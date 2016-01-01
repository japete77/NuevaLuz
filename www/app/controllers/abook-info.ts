/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABookInfoScope extends ng.IScope {
        control : ABookInfoController;
        currentBook : DaisyBook;
    }
    
    export class ABookInfoController {
        private scope : IABookInfoScope;
        private location : ng.ILocationService;
        private playerSvc : DaisyPlayerService;
        private ionicPopup : ionic.popup.IonicPopupService;
        private myABooksSvc : MyABooksService;
  
        constructor($scope : IABookInfoScope, $ionicPopup : ionic.popup.IonicPopupService, 
            $location : ng.ILocationService, DaisyPlayerSvc : DaisyPlayerService, MyABooksSvc : MyABooksService) {
            this.scope = $scope;
            this.scope.control = this;
            this.location = $location;
            this.playerSvc = DaisyPlayerSvc;
            this.scope.currentBook = this.playerSvc.getCurrentBook();
            this.ionicPopup = $ionicPopup;
            this.myABooksSvc = MyABooksSvc;
        }
        
        delete(id : string) {
            var confirmPopup : ionic.popup.IonicPopupConfirmPromise;
            confirmPopup = this.ionicPopup.confirm({
                title: "Borrar Audio Libro",
                template: "El audio libro se eliminará definitivamente, ¿está seguro?"
            });
            
            confirmPopup.then((result : boolean) => {
                if (result) {
                    // Stop playing
                    this.playerSvc.stop();
                    
                    // Delete book
                    this.myABooksSvc.deleteBook(id);
                    
                    // Redirect to my audio books
                    this.location.path("/myabooks");
                }
            });
        }
    }
}