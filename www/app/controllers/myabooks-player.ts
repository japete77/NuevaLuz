/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksPlayerScope extends ng.IScope {
        control : ABooksPlayerController;
    }
    
    export class ABooksPlayerController {
        private scope : IABooksPlayerScope;
        private cordovaMedia : any;
        currentBook : DaisyBook;
        
        constructor($scope : IABooksPlayerScope, $cordovaMedia : any, $cordovaFile : any) {
            this.scope = $scope;
            this.scope.control = this;
            this.cordovaMedia = $cordovaMedia;
            
            this.currentBook = new DaisyBook($cordovaFile);
            this.currentBook.readDaisyBook("1145");
        }
        
        test(id : string) {
            var m = this.cordovaMedia.newMedia("documents://1108/a000009.mp3");
            m.play();
        }
    }
    
    export class DaisyBook {
        private cordovaFile : IFileService;
        private htmlContent : string;
        
        constructor($cordovaFile : any) {
            this.cordovaFile = $cordovaFile;
        }
        
        public readDaisyBook(id : string) {
            var bdir = workingDir + id + "/";
            var bfile = "ncc.html";
             
            this.cordovaFile.checkFile(bdir, bfile)
            .then((success) => {
                this.cordovaFile.readAsText(bdir, bfile)
                .then((success) => {
                    this.htmlContent = success;
                },
                (error) => {
                    console.log(error);
                });                   
            },
            (error) => {
                alert("Audio libro no encontrado: " + error);
            });
        }
    }
}