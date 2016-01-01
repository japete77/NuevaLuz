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
            }
            else {
                this.scope.currentBook = this.player.loadBook($stateParams.abookId);
            }
            this.scope.$on('playerInfo', function (event, info) {
                if (info.book.id === _this.scope.currentBook.id) {
                    _this.scope.showPlay = !info.status ||
                        info.status === Media.MEDIA_NONE ||
                        info.status === Media.MEDIA_PAUSED ||
                        info.status === Media.MEDIA_STOPPED;
                    // Only update current position if playing media
                    if (!_this.scope.showPlay) {
                        info.media.getCurrentPosition(function (position) {
                            _this.scope.currentPosition = _this.seconds2TC(position);
                        });
                    }
                    _this.ionicLoading.hide();
                    _this.scope.ready = true;
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
        ABooksPlayerController.prototype.showPlayIcon = function () {
            return;
        };
        ABooksPlayerController.prototype.showInfo = function (id) {
            this.location.path("/myabooks/info/" + this.scope.currentBook.id);
        };
        return ABooksPlayerController;
    })();
    NuevaLuz.ABooksPlayerController = ABooksPlayerController;
})(NuevaLuz || (NuevaLuz = {}));
