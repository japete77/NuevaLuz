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
        private timeout : ng.ITimeoutService;
        private processStatusChange : boolean = true;
        
        constructor($cordovaMedia : any, $cordovaFile : ngCordova.IFileService, $interval : ng.IIntervalService, $rootScope : ng.IScope, $q : ng.IQService, $timeout : ng.ITimeoutService) {
            
            this.cordovaMedia = $cordovaMedia;
            this.cordovaFile = $cordovaFile;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.q = $q;
            this.timeout = $timeout;
                                                 
            this.interval(() => {
                if (this.playerInfo && this.playerInfo.media) {
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
            
            if (appleDevice) {
                if (status===Media.MEDIA_STOPPED) {
                    this.loadNextFile(1);
                    this.play(this.playerInfo.position);
                }                
            }
            else {
                if (this.processStatusChange && status===Media.MEDIA_STOPPED) {
                    this.loadNextFile(1);
                    this.play(this.playerInfo.position);
                }
                
                if (status===Media.MEDIA_STOPPED) {
                    this.processStatusChange = true;            
                }
            }
        }
        
        private loadNextFile(step : number) {
            
            if (this.book.sequence.length>this.playerInfo.position.currentIndex+step &&
                this.playerInfo.position.currentIndex+step>=0) {
                this.release();
                this.playerInfo.position.currentIndex += step;
                this.playerInfo.position.currentSOM = this.book.sequence[this.playerInfo.position.currentIndex].som;
                this.playerInfo.position.currentTC = 0;
                this.playerInfo.position.currentTitle = this.book.sequence[this.playerInfo.position.currentIndex].title;
                this.playerInfo.media = new Media(playDir + "/" + this.book.id + "/" + this.book.sequence[this.playerInfo.position.currentIndex].filename, 
                    () => {
                    }, 
                    (error : MediaError) => {
                    }, 
                    (status : number) => {
                        this.processPlayerStatusChange(status);
                    });

                    this.saveStatus(this.playerInfo, () => {}, (error : string) => {});
            }
            
        }
        
        loadBook(id : string, sucessCallback : (book : DaisyBook) => any)  {
            // Save status of a previous book loaded
            if (this.playerInfo) {
                this.saveStatus(this.playerInfo, () => {}, () => {})
            }            
                                    
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
                    
                    sucessCallback(this.book);
                    
                    // Initialize player info   
                    this.loadStatus((result : PlayerInfo) => { 
                        this.playerInfo = result;
                                                    
                        // Initialize media player
                        this.playerInfo.media = new Media(playDir + "/" + this.book.id + "/" + this.book.sequence[this.playerInfo.position.currentIndex].filename, 
                            () => {},
                            (error) => {},
                            (status : number) => {
                                this.processPlayerStatusChange(status);
                            });
                                                    
                        this.play(this.playerInfo.position);

                        // load bookmarks
                        this.loadBookmarks((bookmarks : Array<Bookmark>) => {
                            this.playerInfo.bookmarks = bookmarks;  
                            
                            sucessCallback(this.book);                         
                        });
                    });                    
                });               
            }, (error : any) => {
                console.log(error);
            });
            
        }
        
        getLevels() : Array<string> {
            var levels : Array<string> = new Array<string>();
            for (var i : number = 1; i<=this.book.maxLevels; i++) {
                levels.push("Nivel " + i);
            }
            return levels;
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
            }
        }
        
        stop() {
            if (this.playerInfo && this.playerInfo.media) {
                if (!appleDevice) {
                    this.processStatusChange = false;
                }
                this.playerInfo.media.stop();
            }
        }
        
        pause() {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.pause();
            }
        }
        
        release() {
            if (this.playerInfo && this.playerInfo.media) {
                if (!appleDevice) {
                    this.processStatusChange = false;
                }
                this.playerInfo.media.release();
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
            
            var isPlaying : boolean = (this.playerInfo.status===Media.MEDIA_RUNNING);

            if (this.book.sequence[index].filename!==filename) {
                if (!appleDevice) {
                    this.processStatusChange = false;
                }
                this.loadNextFile(0);
            }
            
            this.saveStatus(this.playerInfo, () => {}, (error : string) => {});

            if (isPlaying) {
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
            
            var isPlaying : boolean = (this.playerInfo.status===Media.MEDIA_RUNNING);
            
            if (this.book.sequence[this.playerInfo.position.currentIndex].filename!==filename) {
                if (!appleDevice) {
                    this.processStatusChange = false;
                }
                this.loadNextFile(0);
            }
            
            this.saveStatus(this.playerInfo, () => {}, (error : string) => {});
            
            if (isPlaying) {
                this.playerInfo.media.play();
            }

            this.playerInfo.media.seekTo(this.playerInfo.position.currentTC*1000);
                        
        }
        
        seek(bookmark : Bookmark) {            
            // If filename is not currently laoded, load the right one
            if (this.book.sequence[bookmark.index].filename!=this.book.sequence[this.playerInfo.position.currentIndex].filename) {
                
                if (!appleDevice) {
                    this.processStatusChange = false;
                }
                
                this.release();
                this.playerInfo.media = new Media(playDir + "/" + this.book.id + "/" +  this.book.sequence[bookmark.index].filename, 
                    () => {
                    }, 
                    (error : MediaError) => {
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
        
        loadBookmarks(sucessCallback : (bookmarks : Array<Bookmark>) => any) {
            
            var bdir = workingDir + this.book.id + "/";
            var bfile = "bookmarks.json";
            
            this.cordovaFile.checkFile(bdir, bfile)
            .then((entry : FileEntry) => {
                this.cordovaFile.readAsBinaryString(bdir, bfile)
                .then((result : string) => {
                    this.playerInfo.bookmarks = JSON.parse(atob(result));
                    sucessCallback(this.playerInfo.bookmarks);
                });
            }, (error : ngCordova.IFileError) => {
                sucessCallback(new Array<Bookmark>());
            });
            
        }
        
        saveBooksmarks(bookmarks : Array<Bookmark>, sucessCallback : () => any, errorCallback : (message : string) => any) {
            
            this.playerInfo.bookmarks = bookmarks;
            
            try {
                var bdir = workingDir + this.book.id + "/";
                var bfile = "bookmarks.json";        
                
               this.cordovaFile.writeFile(bdir, bfile, btoa(JSON.stringify(this.playerInfo.bookmarks)), true)
                .then((event : ProgressEvent) => {
                    if (event.loaded===event.total) {
                        sucessCallback();
                    }
                });
            } 
            catch (e) {
                errorCallback("Error saving bookmarks: " + e);
            }
            
        }
        
        loadStatus(sucessCallback : (playerInfo : PlayerInfo) => any) {                                    
            var bdir = workingDir + this.book.id + "/";
            var bfile = "status.json";
            
            this.cordovaFile.checkFile(bdir, bfile)
            .then((entry : FileEntry) => {
                this.cordovaFile.readAsBinaryString(bdir, bfile)
                .then((result : string) => {
                    this.playerInfo.position = JSON.parse(atob(result));
                    sucessCallback(this.playerInfo);
                });                
            }, (error : ngCordova.IFileError) => {
                this.playerInfo.position = new SeekInfo();
                this.playerInfo.position.navigationLevel = 1;
                this.playerInfo.position.currentIndex = 0;
                this.playerInfo.position.currentSOM = this.book.sequence[0].som;
                this.playerInfo.position.currentTC = this.book.sequence[0].som;
                this.playerInfo.position.currentTitle = this.book.sequence[0].title;
                this.playerInfo.position.absoluteTC = "0:00:00";
                sucessCallback(this.playerInfo);
            });
        }
        
        saveStatus(pinfo : PlayerInfo, sucessCallback : () => any, errorCallback : (message:string) => any) {
            
            this.playerInfo = pinfo;
            
            try {
                var bdir = workingDir + this.book.id + "/";
                var bfile = "status.json";        
                
                this.cordovaFile.writeFile(bdir, bfile, btoa(JSON.stringify(this.playerInfo.position)), true)
                .then((event : ProgressEvent) => {
                    if (event.loaded===event.total) {
                        sucessCallback();
                    }
                });
            } 
            catch (e) {
                errorCallback("Error saving status: " + e);
            }
            
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
        
        maxLevels : number = 0;
        
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
                
                if (level<7 && this.maxLevels<level) {
                    this.maxLevels = level;
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