/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksPlayerController = (function () {
        function ABooksPlayerController($scope, $stateParams, $location, player) {
            this.scope = $scope;
            this.scope.control = this;
            this.player = player;
            this.location = $location;
            // Prepare audio player
            this.scope.currentBook = this.player.loadBook($stateParams.abookId);
        }
        ABooksPlayerController.prototype.test = function () {
            this.player.play();
        };
        ABooksPlayerController.prototype.showInfo = function (id) {
            this.location.path("/myabooks/info/" + this.scope.currentBook.id);
        };
        return ABooksPlayerController;
    })();
    NuevaLuz.ABooksPlayerController = ABooksPlayerController;
})(NuevaLuz || (NuevaLuz = {}));
