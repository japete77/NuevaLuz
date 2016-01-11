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
            if (this.player.getCurrentBook() && this.player.getCurrentBook().id === $stateParams["abookId"]) {
                this.scope.currentBook = this.player.getCurrentBook();
                this.scope.currentStatus = this.player.getPlayerInfo();
                this.ionicLoading.hide();
                this.scope.ready = true;
            }
            else {
                this.player.release();
                // Load daisy book...
                this.player.loadBook($stateParams["abookId"], function (book) {
                    _this.scope.currentBook = book;
                    _this.scope.currentStatus = _this.player.getPlayerInfo();
                    _this.ionicLoading.hide();
                    _this.scope.ready = true;
                });
            }
            this.scope.showPlay = true;
            this.scope.$on('playerInfo', function (event, info) {
                _this.scope.showPlay = !info.status ||
                    info.status === Media.MEDIA_NONE ||
                    info.status === Media.MEDIA_STARTING ||
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
            this.player.saveStatus(this.scope.currentStatus, function () { }, function (error) { });
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
            this.location.path("/myabooks/player/level/" + this.scope.currentBook.id);
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
                    _this.player.saveBooksmarks(_this.scope.currentStatus.bookmarks, function () { }, function (message) { });
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
            this.location.path("/myabooks/player/bookmarks/" + this.scope.currentBook.id);
            // 
            //             this.scope.tmpBookmark = new Bookmark();
            //             
            //             var myPopup = this.ionicPopup.show({
            //                 template: '<ion-list>' + 
            //                             ' <ion-radio ng-model="tmpBookmark.id" ng-repeat="bookmark in currentStatus.bookmarks" ng-value="{{bookmark.id}}">{{bookmark.title}}</ion-radio>' +
            //                           '</ion-list>',
            //                 title: 'Selecciona marca',
            //                 scope: this.scope,
            //                 buttons: [
            //                 { text: '<b>Ir</b>',
            //                   type: 'button-positive',
            //                   onTap: (e : MouseEvent) => {
            //                       var result : BookmarkEvent = {
            //                           type : BOOKMARK_GO,
            //                           boomark : this.getBookmark(this.scope.tmpBookmark.id)
            //                       }
            //                       return result;
            //                   }
            //                 },
            //                 { text: 'Cerrar',
            //                   onTap: (e : MouseEvent) => {
            //                       var result : BookmarkEvent = {
            //                           type : BOOKMARK_NONE,
            //                           boomark : this.getBookmark(this.scope.tmpBookmark.id)
            //                       }
            //                       return result;                                          
            //                   }
            //                 },
            //                 { text: 'Borrar',
            //                   type: 'button-assertive',
            //                   onTap: (e : MouseEvent) => {
            //                       this.deleteBookmark(this.scope.tmpBookmark.id);
            //                       this.player.saveBooksmarks(this.scope.currentStatus.bookmarks, () => {}, (message: string) => {});
            //                       e.preventDefault();
            //                   }
            //                 }
            //                 ]
            //             });
            //             
            //             myPopup.then((e : BookmarkEvent) => {
            //                 if (e.type===BOOKMARK_GO) {
            //                     // Seek to the position
            //                     this.player.seek(e.boomark);
            //                 }
            //             });             
        };
        return ABooksPlayerController;
    })();
    NuevaLuz.ABooksPlayerController = ABooksPlayerController;
})(NuevaLuz || (NuevaLuz = {}));
