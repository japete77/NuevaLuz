/// <reference path="../app.ts" />

module NuevaLuz {

    export interface IABooksPlayerScope extends ng.IScope {
        control : ABooksPlayerController;
        currentBook : DaisyBook;        
        currentStatus : PlayerInfo;
        tmpBookmark : Bookmark;        
        showPlay : boolean;
        // msg : string;
        ready : boolean;
    }
    
    export class ABooksPlayerController {
        private scope : IABooksPlayerScope;
        private player : DaisyPlayerService;
        private location: ng.ILocationService;
        private ionicLoading : ionic.loading.IonicLoadingService;
        private ionicPopup : ionic.popup.IonicPopupService;
        private timeout : ng.ITimeoutService;
        private SessionSvc : SessionService;
        
        private levelDescription : string[] = ["Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4", "Nivel 5", "Nivel 6", "Frase", "Página", "Marcas", "Tiempo"];
        
        constructor($scope : IABooksPlayerScope, $stateParams : angular.ui.IStateParamsService, $location : ng.ILocationService, 
            $ionicLoading : ionic.loading.IonicLoadingService, $ionicPopup : ionic.popup.IonicPopupService, 
            player : DaisyPlayerService, $timeout : ng.ITimeoutService, SessionSvc : SessionService) {
            this.scope = $scope;
            this.scope.ready = false;
            this.scope.control = this;
            this.player = player;
            this.location = $location;
            this.ionicLoading = $ionicLoading;
            this.ionicPopup = $ionicPopup;
            this.timeout = $timeout;
            this.SessionSvc = SessionSvc;
            
            this.ionicLoading.show({
                template: 'Cargando...'
            });
            
            // Prepare audio player
            if (this.player.getCurrentBook() && this.player.getCurrentBook().id===$stateParams["abookId"]) {
                this.scope.currentBook = this.player.getCurrentBook();
                this.scope.currentStatus = this.player.getPlayerInfo();
                this.ionicLoading.hide();
                this.scope.ready = true;
            }
            else {
                this.player.release();
                
                // Load daisy book...
                this.player.loadBook($stateParams["abookId"], 
                (book : DaisyBook) => {
                    this.scope.currentBook = book;
                    this.scope.currentStatus = this.player.getPlayerInfo();
                    
                    this.SessionSvc.setCurrentBook({
                        id : book.id,
                        title : book.title,
                        statusKey : ""
                    });
                    
                    this.SessionSvc.saveSessionInfo()
                    .then(() => {
                        this.ionicLoading.hide();
                        this.scope.ready = true;                        
                    });
                }, 
                () => {
                    this.timeout(() => {
                        this.ionicLoading.hide();                    
                    });
                    
                    var alertPopup = $ionicPopup.alert({
                        title: "Aviso",
                        template: "<div class='col center'>Error cargado audio libro</div>"
                    });

                    alertPopup.then(() => {
                        this.location.path("/");
                    });
                });
            }
            
            this.scope.showPlay = true;
            
            this.scope.$on('playerInfo', (event : ng.IAngularEvent, info : PlayerInfo) => {
                // this.scope.msg = "S: " + JSON.stringify(info);

                this.scope.showPlay =  !info.status ||
                                       info.status===Media.MEDIA_NONE ||
                                       info.status===Media.MEDIA_STARTING ||
                                       info.status===Media.MEDIA_PAUSED ||
                                       info.status===Media.MEDIA_STOPPED;
                

                if (this.scope.currentStatus && this.scope.currentStatus.position) {
                    this.scope.currentStatus.position.currentIndex = info.position.currentIndex;
                    this.scope.currentStatus.position.currentSOM = info.position.currentSOM;
                    this.scope.currentStatus.position.currentTitle = info.position.currentTitle;
                    if (info.position.currentTC>-1) {
                        this.scope.currentStatus.position.currentTC = info.position.currentTC;
                        this.scope.currentStatus.position.absoluteTC = this.player.seconds2TC(this.scope.currentStatus.position.currentTC + this.scope.currentStatus.position.currentSOM);                    
                    }
                }
                
            });
        }
        
        getLevel() : string {
            return this.levelDescription[this.scope.currentStatus.position.navigationLevel-1];
        }
        
        play(on : boolean) {
            if (on) {
                this.player.play(this.scope.currentStatus.position);
            }
            else {
                this.player.saveStatus(this.scope.currentStatus, () => {}, (error:string) => {});
                this.player.pause();
            }
        }
        
        stop() {
            this.player.stop();
        }
        
        pause() {
            this.player.saveStatus(this.scope.currentStatus, () => {}, (error:string) => {});
            this.player.pause();
        }
        
        next() {
            this.player.next();
        }
        
        prev() {
            this.player.prev();
        }
        
        showInfo(id : string) {
            this.location.path("/myabooks/info/" + this.scope.currentBook.id);
        }
        
        selectLevel() {
            this.location.path("/myabooks/player/level/" + this.scope.currentBook.id);
        }
        
        goToIndex() {
            this.location.path("/myabooks/player/index/" + this.scope.currentBook.id);            
        }
        
        addBookmark() {
            var s : SeekInfo = this.player.getPlayerInfo().position;
            
            this.scope.tmpBookmark = new Bookmark();
            this.scope.tmpBookmark.index = s.currentIndex;
            this.scope.tmpBookmark.tc = s.currentTC;
            this.scope.tmpBookmark.som = s.currentSOM;
            this.scope.tmpBookmark.absoluteTC = s.absoluteTC;
            
            var counter : number = 1;
            if (this.scope.currentStatus.bookmarks && this.scope.currentStatus.bookmarks.length>0) {
                for (var i=0; i<this.scope.currentStatus.bookmarks.length; i++) {
                    if (counter<this.scope.currentStatus.bookmarks[i].id) {
                        counter = this.scope.currentStatus.bookmarks[i].id;
                    }
                }
                counter++;
            }
            this.scope.tmpBookmark.id = counter;
            this.scope.tmpBookmark.title = "Marcador " + counter;
            
            var myPopup = this.ionicPopup.show({
                template: '<div><input type="text" ng-model="tmpBookmark.title" autofocus></input></div>',
                title: 'Añadir marca',
                scope: this.scope,
                buttons: [
                {   text: 'Cancelar',
                    onTap: () => { return false; }
                },
                {   text: '<b>Guardar</b>',
                    type: 'button-positive',
                    onTap: () => { return true; }
                }
                ]
            });
            
            myPopup.then((result : boolean) => {
                if (result) {
                    this.scope.currentStatus.bookmarks.push(this.scope.tmpBookmark);
                    this.scope.currentStatus.bookmarks.sort((a : Bookmark, b : Bookmark) => {
                       return (a.som+a.tc)-(b.som+b.tc); 
                    });
                    this.player.saveBooksmarks(this.scope.currentStatus.bookmarks, () => {}, (message: string) => {});                    
                }
            });            
        }

        showBookmarks() {
            this.location.path("/myabooks/player/bookmarks/" + this.scope.currentBook.id);            
        }
    }
};