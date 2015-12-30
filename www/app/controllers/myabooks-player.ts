/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksPlayerScope extends ng.IScope {
        control : ABooksPlayerController;
    }
    
    export class ABooksPlayerController {
        private scope : IABooksPlayerScope;
        private cordovaMedia : any;
        
        constructor($scope : IABooksPlayerScope, $cordovaMedia : any) {
            this.scope = $scope;
            this.scope.control = this;
            this.cordovaMedia = $cordovaMedia;
        }
        
        test(id : string) {
            var m = this.cordovaMedia.newMedia("documents://1108/a000009.mp3");
            m.play();
        }
    }
    
}