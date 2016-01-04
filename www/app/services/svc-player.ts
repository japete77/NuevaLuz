/// <reference path="../app.ts" />

module NuevaLuz {

    export class DaisyPlayerService {
        
        private cordovaMedia : any;
        private cordovaFile : ngCordova.IFileService;
        private rootScope : ng.IScope;
        private interval : ng.IIntervalService;
        private q : ng.IQService;
        
        private player : Media;
        private book : DaisyBook;
        private playerInfo : PlayerInfo;
        private loading : boolean;
        
        constructor($cordovaMedia : any, $cordovaFile : ngCordova.IFileService, $interval : ng.IIntervalService, $rootScope : ng.IScope, $q : ng.IQService) {
            
            this.cordovaMedia = $cordovaMedia;
            this.cordovaFile = $cordovaFile;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.q = $q;
             
            this.loading = true; // prevent player info broadcast
            this.interval(() => {
                if (!this.loading) {
                    // refresh player position
                    this.player.getCurrentPosition((position : number) => {
                        this.playerInfo.sinfo.currentTC = position;
                        this.rootScope.$broadcast('playerInfo', this.playerInfo); 
                    });
                }                
            }, 250);
        }
        
        loadBook(id : string) : ng.IPromise<DaisyBook> {
            
            var defer = this.q.defer();
            
            this.loading = true;
            
            if (this.player) {
                this.player.stop();
            }
            
            var bdir = workingDir + id + "/";
            var bfile = "ncc.html";
            
            this.cordovaFile.readAsBinaryString(bdir, bfile)
            .then((result : string) => {
                this.book = new DaisyBook();
                this.book.id = id;
                this.book.parseDaisyBook(result);
                
                // Read all smil files...
                var promises : Array<ng.IPromise<string>> = new Array<ng.IPromise<string>>();
                this.book.body.forEach(s => {
                    promises.push(this.cordovaFile.readAsBinaryString(bdir, s.filename)); 
                });
                
                this.q.all(promises)
                .then((result : string[]) => {
                    for (var i=0; i<result.length; i++) {
                        this.book.parseSmils(result[i], this.book.body[i].id, this.book.body[i].title, this.book.body[i].level);     
                    }
                    
                    // Initialize player info                    
                    this.playerInfo = new PlayerInfo();
                    this.playerInfo.sinfo = new SeekInfo();
                    this.playerInfo.sinfo.currentIndex = 0;
                    this.playerInfo.sinfo.currentTC = this.book.sequence[this.playerInfo.sinfo.currentIndex].som;
                    this.playerInfo.sinfo.currentTitle = this.book.sequence[this.playerInfo.sinfo.currentIndex].title;
                    this.player = new Media("documents://" + this.book.id + "/" + this.book.sequence[this.playerInfo.sinfo.currentIndex].filename, 
                        () => {
                        }, 
                        (error : MediaError) => {
                            this.loading = false;
                            defer.reject("Error cargando fichero de audio");
                        }, 
                        (status : number) => {
                            this.playerInfo.status = status;
                        });                    

                    this.loading = false;
                    defer.resolve(this.book);
                });               
            });
            
            return defer.promise;
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
        
        next(level : number) {
            this.player.seekTo(5000);
            this.player.getCurrentPosition((position : number) => {
               this.rootScope.$broadcast('playerInfo', this.playerInfo);
            });
        }
        
        prev(level : number) {
            
        }
    }
    
    // Player info object
    export class PlayerInfo {
        media : Media;
        status : number;
        sinfo : SeekInfo;
        bookmarks : Array<Bookmark>;
    }
    
    // Helper for seeking audio book
    export class SeekInfo {
        currentIndex : number;
        currentTitle : string;
        currentTC : number;
        navigationLevel : number; 
    }
    
    // Daisy audio book navigation info
    export class SmilInfo {
        id : string;
        filename : string;
        title : string;
        level : number;
    }
    
    // Sequence item
    export class Sequence {
        filename : string;
        title : string;
        level : number;
        som : number;
        tcin : number;
        tcout : number;
    }
    
    // Bookmark info
    export class Bookmark {
        index : number;
        title : string;
        tc : number;
    }
    
    export class DaisyBook {
        
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
        
        // body smil info
        body : Array<SmilInfo>;
        
        // audio navigation helper
        sequence : Array<Sequence>;
        
        constructor() {
            this.body = new Array<SmilInfo>();
            this.sequence = new Array<Sequence>();
        }
        
        public parseDaisyBook(content : string) {
                            
            var xmlParser = new DOMParser();
            var doc = xmlParser.parseFromString(content, "text/xml");
            
            // Read header metadata
            var meta = doc.getElementsByTagName("meta");
            for (var i=0; i<meta.length; i++) {
                if (meta.item(i).attributes.getNamedItem("name")) {
                    if (meta.item(i).attributes.getNamedItem("name").value==="dc:creator")
                        this.creator = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="dc:date")
                        this.date = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="dc:format")
                        this.format = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="dc:identifier")
                        this.identifier = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="dc:publisher")
                        this.publisher = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="dc:subject")
                        this.subject = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="dc:source")
                        this.source = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="dc:title")
                        this.title = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="ncc:charset")
                        this.charset = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="ncc:generator")
                        this.generator = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="ncc:narrator")
                        this.narrator = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="ncc:producer")
                        this.producer = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value==="ncc:totalTime")
                        this.totalTime = meta.item(i).attributes.getNamedItem("content").value;                            
                } 
            }
            
            // Read body
            var tmpSmil : SmilInfo;
            
            var bodyElements = doc.getElementsByTagName("body").item(0).children;
            for (var i=0; i<bodyElements.length; i++) {
                var href : string[] = bodyElements.item(i).getElementsByTagName("a").item(0).attributes.getNamedItem("href").value.split("#");
                var level : number;
                switch (bodyElements.item(i).tagName) {
                    case "h1":
                        level = 1;
                        break;
                    case "h2":
                        level = 2;
                        break;
                    case "h3":
                        level = 3;
                        break;
                    case "h4":
                        level = 4;
                        break;
                    case "h5":
                        level = 5;
                        break;
                    case "h6":
                        level = 6;
                        break;
                    case "span":
                        level = 7;
                        break;
                    case "div":
                        level = 7;
                        break;
                }
                
                this.body.push({
                    id : href[1],
                    title : bodyElements.item(i).getElementsByTagName("a").item(0).innerText,
                    filename : href[0],
                    level : level
                });
            }       
        }
        
        // Read smil file....
        parseSmils(content : string, id : string, title : string, level : number) {        
            var xmlParser = new DOMParser();
            var doc = xmlParser.parseFromString(content, "text/xml");
            
            // Read SOM
            var som : number = this.tc2secs(doc.querySelector('meta[name="ncc:totalElapsedTime"]').attributes.getNamedItem("content").value);
            
            // Read audio sequences
            var query = doc.querySelector('text[id="' + id + '"]');            
            var audioElements = query.parentElement.querySelectorAll("audio");
            for (var i=0; i<audioElements.length; i++) {
                var tcin : number = this.ntp2number(audioElements.item(i).attributes.getNamedItem("clip-begin").value);
                var tcout : number = this.ntp2number(audioElements.item(i).attributes.getNamedItem("clip-end").value);
                this.sequence.push({
                     filename : audioElements.item(i).attributes.getNamedItem("src").value,
                     title : title,
                     level : level,
                     som : som,
                     tcin : tcin,
                     tcout : tcout
                });             
                som += (tcout-tcin);
            }
        }
        
        private ntp2number(value : string) : number {
            value = value.replace("npt=", "");
            value = value.replace("s", "");
            return parseFloat(value);
        }
        
        private tc2secs(value : string) : number {
            var parts : string[] = value.split(":");
            return parseFloat(parts[0])*3600 + 
                    parseFloat(parts[1])*60 + 
                    parseFloat(parts[2]);
        }
    }
}