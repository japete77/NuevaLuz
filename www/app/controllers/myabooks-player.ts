/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksPlayerScope extends ng.IScope {
        control : ABooksPlayerController;
        currentBook : DaisyBook;
        currentPosition : string;
        showPlay : boolean;
        ready : boolean;
    }
    
    export class ABooksPlayerController {
        private scope : IABooksPlayerScope;
        private player : DaisyPlayerService;
        private location: ng.ILocationService;
        private ionicLoading : ionic.loading.IonicLoadingService;
        
        constructor($scope : IABooksPlayerScope, $stateParams : any, $location : ng.ILocationService, $ionicLoading : ionic.loading.IonicLoadingService, player : DaisyPlayerService) {
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
            if (this.player.getCurrentBook() && this.player.getCurrentBook().id===$stateParams.abookId) {
                this.scope.currentBook = this.player.getCurrentBook();
            }
            else {
                this.scope.currentBook = this.player.loadBook($stateParams.abookId);
            }
            
            this.scope.$on('playerInfo', (event : ng.IAngularEvent, info : PlayerInfo) => {
                if (info.book.id===this.scope.currentBook.id) {
                    this.scope.showPlay = !info.status ||
                                          info.status===Media.MEDIA_NONE ||
                                          info.status===Media.MEDIA_PAUSED ||
                                          info.status===Media.MEDIA_STOPPED;
                                          
                    // Only update current position if playing media
                    if (!this.scope.showPlay) {
                        info.media.getCurrentPosition((position : number) => {
                            this.scope.currentPosition = this.seconds2TC(position);                        
                        });
                    }
                    
                    this.ionicLoading.hide();
                    this.scope.ready = true;
                }
            });
        }
        
        private seconds2TC(seconds : number) : string {
            if (seconds<0) seconds = 0;
            
            return Math.floor(seconds/3600).toString() + ":" + 
                this.padleft(Math.floor((seconds/60)%60).toString(), 2, "0") + ":" + 
                this.padleft(Math.floor(seconds%60).toString(), 2, "0");
        }
        
        private padleft(str : string, count : number, char : string) {
            var pad = "";
            for (var i = 0; i<count; i++) { pad += char; }
            return pad.substring(0, pad.length - str.length) + str
        }
        
        play() {
            this.player.play();
        }
        
        stop() {
            this.player.stop();
        }
        
        pause() {
            this.player.pause();
        }
        
        showPlayIcon() {
            return 
        }
        
        showInfo(id : string) {
            this.location.path("/myabooks/info/" + this.scope.currentBook.id);
        }
    }

}