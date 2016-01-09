/// <reference path="../app.ts" />

module NuevaLuz {

    export class DaisyPlayerService {
        
        private cordovaMedia : any;
        private cordovaFile : ngCordova.IFileService;
        private rootScope : ng.IScope;
        private interval : ng.IIntervalService;
        private q : ng.IQService;
        
        private book : DaisyBook;
        private playerInfo : PlayerInfo;
        private loading : boolean;
        private wasPlaying = false;
        
        constructor($cordovaMedia : any, $cordovaFile : ngCordova.IFileService, $interval : ng.IIntervalService, $rootScope : ng.IScope, $q : ng.IQService) {
            
            this.cordovaMedia = $cordovaMedia;
            this.cordovaFile = $cordovaFile;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.q = $q;
                                     
            this.loading = true; // prevent player info broadcast
            this.interval(() => {
                if (!this.loading && this.playerInfo && this.playerInfo.media) {
                    // refresh player info
                    this.playerInfo.media.getCurrentPosition((position : number) => {
                        
                        if (position>-1) {
                            this.playerInfo.position.currentTC = position;
                        }

                        if (this.book.sequence[this.playerInfo.position.currentIndex].tcout<position) {
                            this.playerInfo.position.currentIndex++;
                            this.playerInfo.position.currentTitle = this.book.sequence[this.playerInfo.position.currentIndex].title;
                        }
                                                
                        this.rootScope.$broadcast('playerInfo', this.playerInfo); 
                    });
                }                
            }, 250);
        }
        
        private processPlayerStatusChange(status : number) {
            this.playerInfo.status = status;
            if (!this.loading && status===Media.MEDIA_STOPPED && this.wasPlaying) {
                this.loadNextFile(true);
            }
        }
        
        private loadNextFile(autoplay : boolean) {
            if (this.book.sequence.length>this.playerInfo.position.currentIndex+1) {
                this.playerInfo.position.currentIndex++;
                this.playerInfo.position.currentSOM = this.book.sequence[this.playerInfo.position.currentIndex].som;
                this.playerInfo.position.currentTC = 0;
                this.playerInfo.position.currentTitle = this.book.sequence[this.playerInfo.position.currentIndex].title;
                this.playerInfo.media = new Media("documents://" + this.book.id + "/" + this.book.sequence[this.playerInfo.position.currentIndex].filename, 
                    () => {
                    }, 
                    (error : MediaError) => {
                        this.loading = false;
                    }, 
                    (status : number) => {
                        this.processPlayerStatusChange(status);
                    });
                    
                if (autoplay) {
                    this.play(this.playerInfo.position);
                }
            }
        }
        
        loadBook(id : string) : ng.IPromise<DaisyBook> {
            
            this.loading = true; 
            
            var defer = this.q.defer();
            
            this.playerInfo = new PlayerInfo();
            this.playerInfo.position = new SeekInfo();
            this.playerInfo.position.currentIndex = -1;
                  
            this.release();
            
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
                    this.loadStatus()
                    .then((result : PlayerInfo) => { 
                        this.playerInfo = result;

                        // Initialize media player
                        this.playerInfo.media = new Media("documents://" + this.book.id + "/" + this.book.sequence[this.playerInfo.position.currentIndex].filename, 
                            () => {},
                            (error) => {},
                            (status : number) => {
                                this.processPlayerStatusChange(status);
                            });
                            
                        // load bookmarks
                        this.loadBookmarks()
                        .then((bookmarks : Array<Bookmark>) => {
                            this.playerInfo.bookmarks = bookmarks;  
                            
                            this.loading = false;                       
                            defer.resolve(this.book);                          
                        });
                    });                    
                });               
            }, (error : any) => {
                console.log(error);
            });
            
            return defer.promise;
        }
        
        getCurrentBook() : DaisyBook {
            return this.book;
        }
        
        getPlayerInfo() : PlayerInfo {
            return this.playerInfo;
        }
        
        play(position : SeekInfo) {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.play();   
                this.playerInfo.media.seekTo(position.currentTC*1000);
                this.wasPlaying = true;
            }
        }
        
        stop() {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.stop();
                this.wasPlaying = false;
            }
        }
        
        pause() {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.pause();
                this.wasPlaying = false;
            }
        }
        
        release() {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.stop();
                this.playerInfo.media.release();
                this.wasPlaying = false;
            }
        }
        
        next() {
            var index : number = this.playerInfo.position.currentIndex;
            
            // protect bounds...
            if (index>=0 && this.book.sequence.length<=index) return;
            
            var filename : string = this.book.sequence[index].filename;
            var level : number = this.playerInfo.position.navigationLevel;
            
            do {
                index++;
            } while (index<this.book.sequence.length && this.book.sequence[index].level>level);
            
            // protect bounds...
            if (index<0) {
                index = 0;
                return;
            }
            if (index>=this.book.sequence.length) {
                index = this.book.sequence.length-1;
                return;
            }
            
            this.playerInfo.position.currentIndex = index;
            this.playerInfo.position.currentSOM = this.book.sequence[index].som;
            this.playerInfo.position.currentTC = this.book.sequence[index].tcin;
            this.playerInfo.position.absoluteTC = this.seconds2TC(this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC);
            this.playerInfo.position.currentTitle = this.book.sequence[index].title;
            
            if (this.book.sequence[index].filename!==filename) {
                this.release();
                this.playerInfo.media = new Media("documents://" + this.book.id + "/" + this.book.sequence[index].filename, 
                    () => {
                    }, 
                    (error : MediaError) => {
                        this.loading = false;
                    }, 
                    (status : number) => {
                        this.processPlayerStatusChange(status);
                    });
            }
            
            this.saveStatus(this.playerInfo);
            if (this.playerInfo.status===Media.MEDIA_RUNNING) {
                this.playerInfo.media.play();
            }
            this.playerInfo.media.seekTo(this.playerInfo.position.currentTC*1000);
        }
        
        prev() {
            var index : number = this.playerInfo.position.currentIndex;
            
            // protect bounds...
            if (index>=0 && this.book.sequence.length<=index) return;
            
            var filename : string = this.book.sequence[index].filename;
            var level : number = this.playerInfo.position.navigationLevel;
            
            do {
                index--;
            } while (index>0 && this.book.sequence[index].level>level);
            
            // protect bounds...
            if (index<0) {
                index = 0;
                return;
            }
            if (index>=this.book.sequence.length) {
                index = this.book.sequence.length-1;
                return;
            }
       
            this.playerInfo.position.currentIndex = index;
            this.playerInfo.position.currentSOM = this.book.sequence[index].som;
            this.playerInfo.position.currentTC = this.book.sequence[index].tcin;
            this.playerInfo.position.absoluteTC = this.seconds2TC(this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC);
            this.playerInfo.position.currentTitle = this.book.sequence[index].title;
            
            if (this.book.sequence[this.playerInfo.position.currentIndex].filename!==filename) {
                this.release();
                this.playerInfo.media = new Media("documents://" + this.book.id + "/" + this.book.sequence[index].filename, 
                    () => {
                    }, 
                    (error : MediaError) => {
                        this.loading = false;
                    }, 
                    (status : number) => {
                        this.processPlayerStatusChange(status);
                    });
            }
            
            this.saveStatus(this.playerInfo);
            if (this.playerInfo.status===Media.MEDIA_RUNNING) {
                this.playerInfo.media.play();
            }           
            this.playerInfo.media.seekTo(this.playerInfo.position.currentTC*1000);
        }
        
        seek(bookmark : Bookmark) {            
            // If filename is not currently laoded, load the right one
            if (this.book.sequence[bookmark.index].filename!=this.book.sequence[this.playerInfo.position.currentIndex].filename) {
                this.release();
                this.playerInfo.media = new Media("documents://" + this.book.id + "/" +  this.book.sequence[bookmark.index].filename, 
                    () => {
                    }, 
                    (error : MediaError) => {
                        this.loading = false;
                    }, 
                    (status : number) => {
                        this.processPlayerStatusChange(status);
                    });
            }
            else {
            }

            // play if running
            if (this.playerInfo.status===Media.MEDIA_RUNNING) {
                this.playerInfo.media.play();
            }
            
            // update status
            this.playerInfo.position.absoluteTC = bookmark.absoluteTC;
            this.playerInfo.position.currentIndex = bookmark.index;
            this.playerInfo.position.currentSOM = bookmark.som;
            this.playerInfo.position.currentTC = bookmark.tc;
            this.playerInfo.position.currentTitle = this.book.sequence[bookmark.index].title;
            
            // Seek to the position in the player
            this.playerInfo.media.seekTo(bookmark.tc*1000);                
        }
        
        loadBookmarks() : ng.IPromise<Array<Bookmark>> {
            var p = this.q.defer();
            
            var bdir = workingDir + this.book.id + "/";
            var bfile = "bookmarks.json";
            
            this.cordovaFile.checkFile(bdir, bfile)
            .then((entry : FileEntry) => {
                this.cordovaFile.readAsBinaryString(bdir, bfile)
                .then((result : string) => {
                    this.playerInfo.bookmarks = JSON.parse(atob(result));
                    //this.playerInfo.bookmarks = JSON.parse(result);
                    p.resolve(this.playerInfo.bookmarks);
                });
            }, (error : ngCordova.IFileError) => {
                p.resolve(new Array<Bookmark>());
            });
            
            return p.promise;
        }
        
        saveBooksmarks(bookmarks : Array<Bookmark>) : ng.IPromise<{}> {
            var p = this.q.defer();
            
            this.playerInfo.bookmarks = bookmarks;
            
            try {
                var bdir = workingDir + this.book.id + "/";
                var bfile = "bookmarks.json";        
                
               this.cordovaFile.writeFile(bdir, bfile, btoa(JSON.stringify(this.playerInfo.bookmarks)), true)
                //this.cordovaFile.writeFile(bdir, bfile, JSON.stringify(this.playerInfo.bookmarks), true)
                .then((event : ProgressEvent) => {
                    if (event.loaded===event.total) {
                        p.resolve();
                    }
                });
            } 
            catch (e) {
                p.reject("Error saving bookmarks: " + e);
            }
            
            return p.promise;
        }
        
        loadStatus() : ng.IPromise<PlayerInfo> {
            var p = this.q.defer();
            
            var bdir = workingDir + this.book.id + "/";
            var bfile = "status.json";
            
            this.cordovaFile.checkFile(bdir, bfile)
            .then((entry : FileEntry) => {
                this.cordovaFile.readAsBinaryString(bdir, bfile)
                .then((result : string) => {
                    this.playerInfo.position = JSON.parse(atob(result));
                    p.resolve(this.playerInfo);
                });                
            }, (error : ngCordova.IFileError) => {
                this.playerInfo.position = new SeekInfo();
                this.playerInfo.position.navigationLevel = 1;
                this.playerInfo.position.currentIndex = 0;
                this.playerInfo.position.currentSOM = this.book.sequence[0].som;
                this.playerInfo.position.currentTC = this.book.sequence[0].som;
                this.playerInfo.position.currentTitle = this.book.sequence[0].title;
                this.playerInfo.position.absoluteTC = "0:00:00";
                p.resolve(this.playerInfo);
            });
            
            return p.promise;
        }
        
        saveStatus(pinfo : PlayerInfo) : ng.IPromise<{}> {
            var p = this.q.defer();
            
            this.playerInfo = pinfo;
            
            try {
                var bdir = workingDir + this.book.id + "/";
                var bfile = "status.json";        
                
                this.cordovaFile.writeFile(bdir, bfile, btoa(JSON.stringify(this.playerInfo.position)), true)
                .then((event : ProgressEvent) => {
                    if (event.loaded===event.total) {
                        p.resolve();
                    }
                });
            } 
            catch (e) {
                p.reject("Error saving status: " + e);
            }
            
            return p.promise;
        }
                
        seconds2TC(seconds : number) : string {
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
    }
    
    // Player info object
    export class PlayerInfo {
        media : Media; 
        status : number;
        position : SeekInfo;    
        bookmarks : Array<Bookmark>;
    }
    
    export class SeekInfo {
        currentIndex : number;
        currentTitle : string;
        currentTC : number;
        absoluteTC : string;
        currentSOM : number;
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
        id : number;
        index : number;
        title : string;
        tc : number;
        som : number;
        absoluteTC : string;
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
                     level : i===0?level:7,
                     som : som,
                     tcin : tcin,
                     tcout : tcout
                });
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