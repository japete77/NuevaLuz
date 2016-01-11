/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksLevelsController = (function () {
        function ABooksLevelsController($scope, $stateParams, $location, DaisyPlayerSvc) {
            this.scope = $scope;
            this.scope.control = this;
            this.stateParams = $stateParams;
            this.location = $location;
            this.player = DaisyPlayerSvc;
            this.scope.currentLevel = this.player.getPlayerInfo().position.navigationLevel;
        }
        ABooksLevelsController.prototype.setLevel = function (level) {
            var _this = this;
            var pInfo = this.player.getPlayerInfo();
            pInfo.position.navigationLevel = level;
            this.player.saveStatus(pInfo, function () {
                _this.location.path("/myabooks/player/" + _this.stateParams["abookId"]);
            }, function (message) {
                alert(message);
            });
        };
        return ABooksLevelsController;
    })();
    NuevaLuz.ABooksLevelsController = ABooksLevelsController;
})(NuevaLuz || (NuevaLuz = {}));
