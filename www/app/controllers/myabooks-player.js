/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksPlayerController = (function () {
        function ABooksPlayerController($scope, $stateParams, $location, $ionicLoading, player) {
            var _this = this;
            this.scope = $scope;
            this.scope.ready = false;
            this.scope.control = this;
            this.player = player;
            this.location = $location;
            this.ionicLoading = $ionicLoading;
            this.ionicLoading.show({
                template: 'Cargando...'
            });
            // Prepare audio player
            if (this.player.getCurrentBook() && this.player.getCurrentBook().id === $stateParams.abookId) {
                this.scope.currentBook = this.player.getCurrentBook();
                this.ionicLoading.hide();
                this.scope.ready = true;
            }
            else {
                // Load daisy book...
                this.player.loadBook($stateParams.abookId)
                    .then(function (book) {
                    _this.scope.currentBook = book;
                    _this.ionicLoading.hide();
                    _this.scope.ready = true;
                })
                    .catch(function (reason) {
                    _this.ionicLoading.hide();
                    alert(reason);
                });
            }
            this.scope.currentPosition = this.seconds2TC(0);
            this.scope.showPlay = true;
            this.scope.$on('playerInfo', function (event, info) {
                _this.scope.showPlay = !info.status ||
                    info.status === Media.MEDIA_NONE ||
                    info.status === Media.MEDIA_PAUSED ||
                    info.status === Media.MEDIA_STOPPED;
                // Only update current position if playing media
                if (!_this.scope.showPlay && info.sinfo) {
                    _this.scope.currentPosition = _this.seconds2TC(info.sinfo.currentTC);
                    _this.scope.currentTitle = info.sinfo.currentTitle;
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
            this.player.play();
        };
        ABooksPlayerController.prototype.stop = function () {
            this.player.stop();
        };
        ABooksPlayerController.prototype.pause = function () {
            this.player.pause();
        };
        ABooksPlayerController.prototype.next = function () {
            this.player.next(1);
        };
        ABooksPlayerController.prototype.showInfo = function (id) {
            this.location.path("/myabooks/info/" + this.scope.currentBook.id);
        };
        return ABooksPlayerController;
    })();
    NuevaLuz.ABooksPlayerController = ABooksPlayerController;
})(NuevaLuz || (NuevaLuz = {}));
