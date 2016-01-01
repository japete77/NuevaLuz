/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABookInfoController = (function () {
        function ABookInfoController($scope, $ionicPopup, $location, DaisyPlayerSvc, MyABooksSvc) {
            this.scope = $scope;
            this.scope.control = this;
            this.location = $location;
            this.playerSvc = DaisyPlayerSvc;
            this.scope.currentBook = this.playerSvc.getCurrentBook();
            this.ionicPopup = $ionicPopup;
            this.myABooksSvc = MyABooksSvc;
        }
        ABookInfoController.prototype.delete = function (id) {
            var _this = this;
            var confirmPopup;
            confirmPopup = this.ionicPopup.confirm({
                title: "Borrar Audio Libro",
                template: "El audio libro se eliminará definitivamente, ¿está seguro?"
            });
            confirmPopup.then(function (result) {
                if (result) {
                    // Stop playing
                    _this.playerSvc.stop();
                    // Delete book
                    _this.myABooksSvc.deleteBook(id);
                    // Redirect to my audio books
                    _this.location.path("/myabooks");
                }
            });
        };
        return ABookInfoController;
    })();
    NuevaLuz.ABookInfoController = ABookInfoController;
})(NuevaLuz || (NuevaLuz = {}));