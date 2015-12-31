/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksPlayerScope extends ng.IScope {
        control : ABooksPlayerController;
        currentBook : DaisyBook;
    }
    
    export class ABooksPlayerController {
        private scope : IABooksPlayerScope;
        private cordovaMedia : any;
        
        constructor($scope : IABooksPlayerScope, $cordovaMedia : any, $cordovaFile : ngCordova.IFileService, $stateParams : any) {
            this.scope = $scope;
            this.scope.control = this;
            this.cordovaMedia = $cordovaMedia;
            
            this.scope.currentBook = new DaisyBook($cordovaFile);
            
            this.scope.currentBook.readDaisyBook($stateParams.abookId);
        }
        
        test(id : string) {
            var m = this.cordovaMedia.newMedia("documents://1108/a000009.mp3");
            m.play();
        }
    }
    
    export class DaisyBook {
        private cordovaFile : ngCordova.IFileService;
        private htmlContent : string;
        private x2js : IX2JS;
        
        // Metadata info
        creator : string;
        date : string;
        format : string;
        identifier : string;
        publisher : string;
        subject : string;
        source : string;
        title : string;
        charset : string;
        generator : string;
        narrator : string;
        producer : string;
        totalTime : string;
        
        constructor($cordovaFile : ngCordova.IFileService) {
            this.cordovaFile = $cordovaFile;
            
            // Initialize xml2json parser    
            this.x2js = new X2JS();
        }
        
        public readDaisyBook(id : string) {
            var bdir = workingDir + id + "/";
            var bfile = "ncc.html";
             
            this.cordovaFile.checkFile(bdir, bfile)
            .then((success : FileEntry) => {
                this.cordovaFile.readAsBinaryString(bdir, bfile)
                .then((result : string) => {
                    var nccData : any = this.x2js.xml_str2json(result);
                    
                    // Retrieve header metadata
                    if (nccData.html.head.meta) {
                        nccData.html.head.meta.forEach( s => {
                           if (s._name==="dc:creator") this.creator = s._content;
                           else if (s._name==="dc:date") this.date = s._content;
                           else if (s._name==="dc:format") this.format = s._content;
                           else if (s._name==="dc:identifier") this.identifier = s._content;
                           else if (s._name==="dc:publisher") this.publisher = s._content;
                           else if (s._name==="dc:source") this.source = s._content;
                           else if (s._name==="dc:title") this.title = s._content;
                           else if (s._name==="ncc:charset") this.charset = s._content;
                           else if (s._name==="ncc:generator") this.generator = s._content;
                           else if (s._name==="ncc:narrator") this.narrator = s._content;
                           else if (s._name==="ncc:producer") this.producer = s._content;
                           else if (s._name==="ncc:totalTime") this.totalTime = s._content;
                        });
                    }          
                },
                (reason : any) => {
                    console.log(reason);
                });                   
            },
            (reason : any) => {
                console.log(reason);
                alert("Audio libro no encontrado");
            });
        }
    }
}