/// <reference path="../app.ts" />

module NuevaLuz {

    export class DaisyPlayerService {
        
        private cordovaMedia : any;
        private cordovaFile : ngCordova.IFileService;
        private player : Media;
        private book : DaisyBook;
        private rootScope : ng.IScope;
        private interval : ng.IIntervalService;
        private playerInfo : PlayerInfo;
        
        constructor($cordovaMedia : any, $cordovaFile : ngCordova.IFileService, $interval : ng.IIntervalService, $rootScope : ng.IScope) {
            this.cordovaMedia = $cordovaMedia;
            this.cordovaFile = $cordovaFile;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.playerInfo = new PlayerInfo();
            
            // Timer
            this.interval(() => {
                this.rootScope.$broadcast('playerInfo', this.playerInfo);                    
            }, 500);
        }
        
        loadBook(id : string) : DaisyBook {
            // Load Audio Book
            this.book = new DaisyBook(this.cordovaFile);
            this.book.readDaisyBook(id);

            if (this.player) {
                this.player.stop();
            }
            
            // Initialize player
            this.player = new Media("documents://" + this.book.id + "/a000009.mp3", 
                () => {
                    
                }, 
                (error : MediaError) => {
                    
                }, 
                (status : number) => {
                    this.playerInfo.status = status;
                }
            );
            
            // Save book and player info
            this.playerInfo.book = this.book;
            this.playerInfo.media = this.player;

            return this.book;
        }
        
        getCurrentBook() : DaisyBook {
            return this.book;
        }
        
        play() {
            if (this.player) {
                this.player.play();                
            }
        }
        
        stop() {
            if (this.player) {
                this.player.stop();
            }
        }
        
        pause() {
            if (this.player) {
                this.player.pause();
            }
        }
    }
    
    export class PlayerInfo {
        book : DaisyBook;
        media : Media;
        status : number;
    }
    
    export class DaisyBook {
        private cordovaFile : ngCordova.IFileService;
        private htmlContent : string;
        private x2js : IX2JS;
        
        // Metadata info
        id : string;
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
            this.id = id;
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
                           else if (s._name==="dc:subject") this.subject = s._content;
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