/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksPlayerController = (function () {
        function ABooksPlayerController($scope, $stateParams, $location, $ionicLoading, $ionicPopup, player) {
            var _this = this;
            this.scope = $scope;
            this.scope.ready = false;
            this.scope.control = this;
            this.player = player;
            this.location = $location;
            this.ionicLoading = $ionicLoading;
            this.ionicPopup = $ionicPopup;
            this.ionicLoading.show({
                template: 'Cargando...'
            });
            // Prepare audio player
            if (this.player.getCurrentBook() && this.player.getCurrentBook().id === $stateParams.abookId) {
                this.scope.currentBook = this.player.getCurrentBook();
                this.scope.currentStatus = this.player.getPlayerInfo();
                this.ionicLoading.hide();
                this.scope.ready = true;
            }
            else {
                this.player.release();
                this.scope.currentStatus = new NuevaLuz.PlayerInfo();
                this.scope.currentStatus.position = new NuevaLuz.SeekInfo();
                // Load daisy book...
                this.player.loadBook($stateParams.abookId)
                    .then(function (book) {
                    _this.scope.currentBook = book;
                    _this.scope.currentStatus = _this.player.getPlayerInfo();
                    _this.ionicLoading.hide();
                    _this.scope.ready = true;
                })
                    .catch(function (reason) {
                    _this.ionicLoading.hide();
                    alert(reason);
                });
            }
            this.scope.showPlay = true;
            this.scope.$on('playerInfo', function (event, info) {
                _this.scope.showPlay = !info.status ||
                    info.status === Media.MEDIA_NONE ||
                    info.status === Media.MEDIA_PAUSED ||
                    info.status === Media.MEDIA_STOPPED;
                if (_this.scope.currentStatus && _this.scope.currentStatus.position) {
                    _this.scope.currentStatus.position.currentIndex = info.position.currentIndex;
                    _this.scope.currentStatus.position.currentSOM = info.position.currentSOM;
                    _this.scope.currentStatus.position.currentTitle = info.position.currentTitle;
                    if (info.position.currentTC > -1) {
                        _this.scope.currentStatus.position.currentTC = info.position.currentTC;
                        _this.scope.currentStatus.position.absoluteTC = _this.seconds2TC(_this.scope.currentStatus.position.currentTC + _this.scope.currentStatus.position.currentSOM);
                    }
                }
            });
        }
        ABooksPlayerController.prototype.seconds2TC = function (seconds) {
            if (seconds < 0)
                seconds = 0;
            return Math.floor(seconds / 3600).toString() + ":" +
                this.padleft(Math.floor((seconds / 60) % 60).toString(), 2, "0") + ":" +
                this.padleft(Math.floor(seconds % 60).toString(), 2, "0");
        };
        ABooksPlayerController.prototype.padleft = function (str, count, char) {
            var pad = "";
            for (var i = 0; i < count; i++) {
                pad += char;
            }
            return pad.substring(0, pad.length - str.length) + str;
        };
        ABooksPlayerController.prototype.play = function () {
            this.player.play(this.scope.currentStatus.position);
        };
        ABooksPlayerController.prototype.stop = function () {
            this.player.stop();
        };
        ABooksPlayerController.prototype.pause = function () {
            this.player.saveStatus(this.scope.currentStatus);
            this.player.pause();
        };
        ABooksPlayerController.prototype.next = function () {
            this.player.next();
        };
        ABooksPlayerController.prototype.prev = function () {
            this.player.prev();
        };
        ABooksPlayerController.prototype.showInfo = function (id) {
            this.location.path("/myabooks/info/" + this.scope.currentBook.id);
        };
        ABooksPlayerController.prototype.selectLevel = function () {
            var _this = this;
            var currenLevel;
            var myPopup = this.ionicPopup.show({
                template: '<ion-list>' +
                    '<ion-radio ng-model="currentStatus.position.navigationLevel" ng-value="1">Nivel 1</ion-radio>' +
                    '<ion-radio ng-model="currentStatus.position.navigationLevel" ng-value="2">Nivel 2</ion-radio>' +
                    '<ion-radio ng-model="currentStatus.position.navigationLevel" ng-value="3">Nivel 3</ion-radio>' +
                    '<ion-radio ng-model="currentStatus.position.navigationLevel" ng-value="4">Nivel 4</ion-radio>' +
                    '<ion-radio ng-model="currentStatus.position.navigationLevel" ng-value="5">Nivel 5</ion-radio>' +
                    '<ion-radio ng-model="currentStatus.position.navigationLevel" ng-value="6">Nivel 6</ion-radio>' +
                    '<ion-radio ng-model="currentStatus.position.navigationLevel" ng-value="7">Frase</ion-radio>' +
                    '</ion-list>',
                title: 'Selecciona nivel de navegación',
                scope: this.scope,
                buttons: [
                    { text: 'Cerrar' },
                ]
            });
            myPopup.then(function () {
                _this.player.saveStatus(_this.scope.currentStatus);
            });
        };
        return ABooksPlayerController;
    })();
    NuevaLuz.ABooksPlayerController = ABooksPlayerController;
})(NuevaLuz || (NuevaLuz = {}));
