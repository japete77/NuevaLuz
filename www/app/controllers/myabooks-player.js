/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var BOOKMARK_NONE = 0;
    var BOOKMARK_GO = 1;
    var BOOKMARK_DELETE = 2;
    var BookmarkEvent = (function () {
        function BookmarkEvent() {
        }
        return BookmarkEvent;
    })();
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
            if (this.player.getCurrentBook() && this.player.getCurrentBook().id === $stateParams["abookId"]) {
                this.scope.currentBook = this.player.getCurrentBook();
                this.scope.currentStatus = this.player.getPlayerInfo();
                this.ionicLoading.hide();
                this.scope.ready = true;
            }
            else {
                this.player.release();
                // Load daisy book...
                this.player.loadBook($stateParams["abookId"])
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
                        _this.scope.currentStatus.position.absoluteTC = _this.player.seconds2TC(_this.scope.currentStatus.position.currentTC + _this.scope.currentStatus.position.currentSOM);
                    }
                }
            });
        }
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
        ABooksPlayerController.prototype.addBookmark = function () {
            var _this = this;
            var s = this.player.getPlayerInfo().position;
            this.scope.tmpBookmark = new NuevaLuz.Bookmark();
            this.scope.tmpBookmark.index = s.currentIndex;
            this.scope.tmpBookmark.tc = s.currentTC;
            this.scope.tmpBookmark.som = s.currentSOM;
            this.scope.tmpBookmark.absoluteTC = s.absoluteTC;
            var counter = 1;
            if (this.scope.currentStatus.bookmarks && this.scope.currentStatus.bookmarks.length > 0) {
                counter = this.scope.currentStatus.bookmarks[this.scope.currentStatus.bookmarks.length - 1].id + 1;
            }
            this.scope.tmpBookmark.id = counter;
            this.scope.tmpBookmark.title = "Marcador " + counter;
            var myPopup = this.ionicPopup.show({
                template: '<div><input type="text" ng-model="tmpBookmark.title" autofocus></input></div>',
                title: 'Añadir marca',
                scope: this.scope,
                buttons: [
                    { text: 'Cancelar',
                        onTap: function () { return false; }
                    },
                    { text: '<b>Guardar</b>',
                        type: 'button-positive',
                        onTap: function () { return true; }
                    }
                ]
            });
            myPopup.then(function (result) {
                if (result) {
                    _this.scope.currentStatus.bookmarks.push(_this.scope.tmpBookmark);
                    _this.player.saveBooksmarks(_this.scope.currentStatus.bookmarks);
                }
            });
        };
        ABooksPlayerController.prototype.deleteBookmark = function (id) {
            var count = 0;
            var pos = -1;
            this.scope.currentStatus.bookmarks.forEach(function (s) {
                if (s.id === id) {
                    pos = count;
                }
                count++;
            });
            if (pos != -1) {
                this.scope.currentStatus.bookmarks.splice(pos, 1);
            }
        };
        ABooksPlayerController.prototype.getBookmark = function (id) {
            var count = 0;
            var pos = -1;
            this.scope.currentStatus.bookmarks.forEach(function (s) {
                if (s.id === id) {
                    pos = count;
                }
                count++;
            });
            if (pos != -1) {
                return this.scope.currentStatus.bookmarks[pos];
            }
            else {
                return null;
            }
        };
        ABooksPlayerController.prototype.showBookmarks = function () {
            var _this = this;
            this.scope.tmpBookmark = new NuevaLuz.Bookmark();
            var myPopup = this.ionicPopup.show({
                template: '<ion-list>' +
                    ' <ion-radio ng-model="tmpBookmark.id" ng-repeat="bookmark in currentStatus.bookmarks" ng-value="{{bookmark.id}}">{{bookmark.title}}</ion-radio>' +
                    '</ion-list>',
                title: 'Selecciona marca',
                scope: this.scope,
                buttons: [
                    { text: '<b>Ir</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            var result = {
                                type: BOOKMARK_GO,
                                boomark: _this.getBookmark(_this.scope.tmpBookmark.id)
                            };
                            return result;
                        }
                    },
                    { text: 'Cerrar',
                        onTap: function (e) {
                            var result = {
                                type: BOOKMARK_NONE,
                                boomark: _this.getBookmark(_this.scope.tmpBookmark.id)
                            };
                            return result;
                        }
                    },
                    { text: 'Borrar',
                        type: 'button-assertive',
                        onTap: function (e) {
                            _this.deleteBookmark(_this.scope.tmpBookmark.id);
                            _this.player.saveBooksmarks(_this.scope.currentStatus.bookmarks);
                            e.preventDefault();
                        }
                    }
                ]
            });
            myPopup.then(function (e) {
                if (e.type === BOOKMARK_GO) {
                    // Seek to the position
                    _this.player.seek(e.boomark);
                }
            });
        };
        return ABooksPlayerController;
    })();
    NuevaLuz.ABooksPlayerController = ABooksPlayerController;
})(NuevaLuz || (NuevaLuz = {}));
