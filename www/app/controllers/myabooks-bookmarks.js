/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var BData = (function () {
        function BData() {
        }
        return BData;
    })();
    var ABooksBookmarksController = (function () {
        function ABooksBookmarksController($scope, $stateParams, $location, DaisyPlayerSvc) {
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
        ABooksBookmarksController.prototype.seekTo = function (id) {
            this.player.seek(this.scope.bookmarks[id]);
            this.location.path("/myabooks/player/" + this.stateParams["abookId"]);
        };
        ABooksBookmarksController.prototype.setEditMode = function (editMode) {
            this.scope.editMode = editMode;
        };
        ABooksBookmarksController.prototype.deleteBookmark = function () {
            if (this.scope.bdata.selectedIndex > -1) {
                this.scope.bookmarks.splice(this.scope.bdata.selectedIndex, 1);
                this.player.saveBooksmarks(this.scope.bookmarks, function () { }, function (message) { });
                this.scope.bdata.selectedIndex = -1;
            }
        };
        return ABooksBookmarksController;
    })();
    NuevaLuz.ABooksBookmarksController = ABooksBookmarksController;
})(NuevaLuz || (NuevaLuz = {}));
;
