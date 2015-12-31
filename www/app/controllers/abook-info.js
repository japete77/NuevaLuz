/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABookInfoController = (function () {
        function ABookInfoController($scope, DaisyPlayerSvc) {
            this.scope = $scope;
            this.scope.control = this;
            this.playerSvc = DaisyPlayerSvc;
            this.scope.currentBook = this.playerSvc.getCurrentBook();
        }
        return ABookInfoController;
    })();
    NuevaLuz.ABookInfoController = ABookInfoController;
})(NuevaLuz || (NuevaLuz = {}));
