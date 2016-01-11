/// <reference path="../app.ts" />

module NuevaLuz {
    
    class BData {
        selectedIndex : number;
    }

    export interface IABooksBookmarksScope extends ng.IScope {
        control : ABooksBookmarksController;
        bookmarks : Bookmark[];
        editMode : boolean;
        bdata : BData;
    }
    
    export class ABooksBookmarksController {
        private scope : IABooksBookmarksScope;
        private stateParams : angular.ui.IStateParamsService;       
        private player : DaisyPlayerService;
        private location : ng.ILocationService
    
        constructor($scope : IABooksBookmarksScope, $stateParams : angular.ui.IStateParamsService, $location : ng.ILocationService, DaisyPlayerSvc : DaisyPlayerService) {
            this.scope = $scope;
            this.scope.control = this;
            this.stateParams = $stateParams;    
            this.location = $location;
            this.player = DaisyPlayerSvc;
            this.scope.bookmarks = this.player.getPlayerInfo().bookmarks;
            this.scope.editMode = false;
            this.scope.bdata = new BData();
            this.scope.bdata.selectedIndex = -1;
        }
        
        seekTo(id : number) {
            this.player.seek(this.scope.bookmarks[id]);
            this.location.path("/myabooks/player/" + this.stateParams["abookId"]);
        }
        
        setEditMode(editMode : boolean) {
            this.scope.editMode = editMode;
        }
        
        deleteBookmark() {
            if (this.scope.bdata.selectedIndex>-1) {
                this.scope.bookmarks.splice(this.scope.bdata.selectedIndex, 1);
                this.player.saveBooksmarks(this.scope.bookmarks, () => {}, (message: string) => {});
                this.scope.bdata.selectedIndex = -1;
            }
        }
    }

}