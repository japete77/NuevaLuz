/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksPlayerScope extends ng.IScope {
        control : ABooksPlayerController;
        
        currentBook : DaisyBook;        
        currentStatus : PlayerInfo;
        
        showPlay : boolean;
        ready : boolean;
    }
    
    export class ABooksPlayerController {
        private scope : IABooksPlayerScope;
        private player : DaisyPlayerService;
        private location: ng.ILocationService;
        private ionicLoading : ionic.loading.IonicLoadingService;
        private ionicPopup : ionic.popup.IonicPopupService;
        
        constructor($scope : IABooksPlayerScope, $stateParams : any, $location : ng.ILocationService, 
            $ionicLoading : ionic.loading.IonicLoadingService, $ionicPopup : ionic.popup.IonicPopupService, player : DaisyPlayerService) {
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
            if (this.player.getCurrentBook() && this.player.getCurrentBook().id===$stateParams.abookId) {
                this.scope.currentBook = this.player.getCurrentBook();
                this.scope.currentStatus = this.player.getPlayerInfo();
                this.ionicLoading.hide();
                this.scope.ready = true;
            }
            else {
                this.player.release();
                
                this.scope.currentStatus = new PlayerInfo();
                this.scope.currentStatus.position = new SeekInfo();
                
                // Load daisy book...
                this.player.loadBook($stateParams.abookId)
                .then((book : DaisyBook) => {
                    this.scope.currentBook = book;
                    this.scope.currentStatus = this.player.getPlayerInfo();
                    
                    this.ionicLoading.hide();
                    this.scope.ready = true;
                })
                .catch((reason : any) => {
                    this.ionicLoading.hide();
                    alert(reason);                    
                });
            }
            
            this.scope.showPlay = true;
            
            this.scope.$on('playerInfo', (event : ng.IAngularEvent, info : PlayerInfo) => {

                this.scope.showPlay = !info.status ||
                                       info.status===Media.MEDIA_NONE ||
                                       info.status===Media.MEDIA_PAUSED ||
                                       info.status===Media.MEDIA_STOPPED;
                
                if (this.scope.currentStatus && this.scope.currentStatus.position) {
                    this.scope.currentStatus.position.currentIndex = info.position.currentIndex;
                    this.scope.currentStatus.position.currentSOM = info.position.currentSOM;
                    this.scope.currentStatus.position.currentTitle = info.position.currentTitle;
                    if (info.position.currentTC>-1) {
                        this.scope.currentStatus.position.currentTC = info.position.currentTC;
                        this.scope.currentStatus.position.absoluteTC = this.seconds2TC(this.scope.currentStatus.position.currentTC + this.scope.currentStatus.position.currentSOM);                    
                    }
                }
                
            });
        }
        
        private seconds2TC(seconds : number) : string {
            if (seconds<0) seconds = 0;
            
            return Math.floor(seconds/3600).toString() + ":" + 
                this.padleft(Math.floor((seconds/60)%60).toString(), 2, "0") + ":" + 
                this.padleft(Math.floor(seconds%60).toString(), 2, "0");
        }
        
        private padleft(str : string, count : number, char : string) : string {
            var pad = "";
            for (var i = 0; i<count; i++) { pad += char; }
            return pad.substring(0, pad.length - str.length) + str
        }
        
        play() {
            this.player.play(this.scope.currentStatus.position);
        }
        
        stop() {
            this.player.stop();
        }
        
        pause() {
            this.player.saveStatus(this.scope.currentStatus);
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
            
            myPopup.then(() => {
                this.player.saveStatus(this.scope.currentStatus);
            });
        }
        
    }

}