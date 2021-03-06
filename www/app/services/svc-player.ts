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
        private isPlaying : boolean = false;
        
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

                        // if (this.isPlaying && this.playerInfo.status===Media.MEDIA_STOPPED) {
                        if (this.isPlaying && (this.playerInfo.position.currentTC<0 ||
                            this.playerInfo.status===Media.MEDIA_STOPPED)) {
                            this.loadNextFile(1);
                            this.playerInfo.status = Media.MEDIA_RUNNING;
                            this.play(this.playerInfo.position);
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
        
        loadBook(id : string, sucessCallback : (book : DaisyBook) => any, errorCallback : () => any)  {
            // Save status of a previous book loaded
            if (this.playerInfo) {
                this.saveStatus(this.playerInfo, () => {}, () => {})
            }            
                                    
            this.playerInfo = new PlayerInfo();
            this.playerInfo.position = new SeekInfo();
            this.playerInfo.position.currentIndex = -1;
            this.playerInfo.status = Media.MEDIA_STOPPED;
                  
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
                },
                (error : any) => {
                    errorCallback();
                });               
            }, (error : any) => {
                errorCallback();
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
        
        playFromCurrentPos() {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.play();   
                this.playerInfo.status = Media.MEDIA_RUNNING;
                this.isPlaying = true;
            }
        }
        
        play(position : SeekInfo) {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.play();   
                this.playerInfo.media.seekTo(position.currentTC*1000);
                this.playerInfo.status = Media.MEDIA_RUNNING;
                this.isPlaying = true;
            }
        }
        
        stop() {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.stop();
                this.playerInfo.status = Media.MEDIA_STOPPED;
                this.isPlaying = false;
            }
        }
        
        pause() {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.pause();
                this.playerInfo.status = Media.MEDIA_PAUSED;
                this.isPlaying = false;
            }
        }
        
        release() {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.release();
                this.playerInfo.status = Media.MEDIA_NONE;
                this.isPlaying = false;
            }
        }
        
        next() {
            this.isPlaying = false;
            var index : number = 0;
            
            if (this.playerInfo.position.navigationLevel<=NAV_LEVEL_PHRASE) {
                index = this.playerInfo.position.currentIndex;
                
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
            }
            else if (this.playerInfo.position.navigationLevel===NAV_LEVEL_PAGE) {
                index  = this.playerInfo.position.currentIndex;
                
                // protect bounds...
                if (index>=0 && this.book.sequence.length<=index) return;
                
                var filename : string = this.book.sequence[index].filename;
                var level : number = this.playerInfo.position.navigationLevel;
                
                do {
                    index++;
                } while (index<this.book.sequence.length && this.book.sequence[index].level!=NAV_LEVEL_PAGE);
                
                // protect bounds...
                if (index<0) {
                    index = this.playerInfo.position.currentIndex;
                    return;
                }
                if (index>=this.book.sequence.length) {
                    index = this.playerInfo.position.currentIndex;
                    return;
                }
                
                this.playerInfo.position.currentIndex = index;
                this.playerInfo.position.currentSOM = this.book.sequence[index].som;
                this.playerInfo.position.currentTC = this.book.sequence[index].tcin;
                this.playerInfo.position.absoluteTC = this.seconds2TC(this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC);
                this.playerInfo.position.currentTitle = this.book.sequence[index].title;

            }
            else if (this.playerInfo.position.navigationLevel===NAV_LEVEL_BOOKMARK) {
                if (this.playerInfo.bookmarks) {
                    var absoluteTC : number = this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC;
                 
                    var found : boolean = false;
                    var goBookmark : Bookmark = null;
                    this.playerInfo.bookmarks.forEach((bm : Bookmark, index : number, array : Bookmark[]) => {
                        if (!found && bm.som+bm.tc>absoluteTC) {
                            found = true;
                            goBookmark = bm;
                        }  
                    }); 
                    
                    if (goBookmark) {
                        this.seek(goBookmark);
                    }
                    
                    return;
                }
            }
            else if (this.playerInfo.position.navigationLevel===NAV_LEVEL_INTERVAL) {
                
            }
            
            var isPlaying : boolean = (this.playerInfo.status===Media.MEDIA_RUNNING);
            
            if (this.book.sequence[index].filename!==filename) {
                this.loadNextFile(0);
            }
            
            this.saveStatus(this.playerInfo, () => {}, (error : string) => {});

            this.playerInfo.media.play();
            this.playerInfo.status = Media.MEDIA_RUNNING;
            this.isPlaying = true;

            this.playerInfo.media.seekTo(this.playerInfo.position.currentTC*1000);

            if (!isPlaying) {
                this.playerInfo.media.pause();
                this.playerInfo.status = Media.MEDIA_PAUSED;
                this.isPlaying = false;
            }

        }
        
        prev() {
            this.isPlaying = false;
            var index : number = 0;
               
            if (this.playerInfo.position.navigationLevel<=NAV_LEVEL_PHRASE) {
                index = this.playerInfo.position.currentIndex;
                
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
                }
                if (index>=this.book.sequence.length) {
                    index = this.playerInfo.position.currentIndex;
                    return;
                }
        
                this.playerInfo.position.currentIndex = index;
                this.playerInfo.position.currentSOM = this.book.sequence[index].som;
                this.playerInfo.position.currentTC = this.book.sequence[index].tcin;
                this.playerInfo.position.absoluteTC = this.seconds2TC(this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC);
                this.playerInfo.position.currentTitle = this.book.sequence[index].title;
            }
            else if (this.playerInfo.position.navigationLevel<=NAV_LEVEL_PAGE) {
                index = this.playerInfo.position.currentIndex;
                
                // protect bounds...
                if (index>=0 && this.book.sequence.length<=index) return;
                
                var filename : string = this.book.sequence[index].filename;
                var level : number = this.playerInfo.position.navigationLevel;
                
                do {
                    index--;
                } while (index>0 && this.book.sequence[index].level!=NAV_LEVEL_PAGE);
                
                // protect bounds...
                if (index<0) {
                    index = this.playerInfo.position.currentIndex;
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
            }
            else if (this.playerInfo.position.navigationLevel===NAV_LEVEL_BOOKMARK) {
                if (this.playerInfo.bookmarks) {
                    var absoluteTC : number = this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC;
                 
                    var found : boolean = false;
                    var goBookmark : Bookmark = null;
                    for (var i = this.playerInfo.bookmarks.length-1; i>=0; i--) {
                        if (!found && this.playerInfo.bookmarks[i].som+this.playerInfo.bookmarks[i].tc<absoluteTC-5) {
                            found = true;
                            goBookmark = this.playerInfo.bookmarks[i];
                        }                          
                    }
                                        
                    if (goBookmark) {
                        this.seek(goBookmark);
                    }
                    
                    return;
                }                
            }
            else if (this.playerInfo.position.navigationLevel===NAV_LEVEL_INTERVAL) {
                
            }
            
            var isPlaying : boolean = (this.playerInfo.status===Media.MEDIA_RUNNING);
                        
            if (this.book.sequence[this.playerInfo.position.currentIndex].filename!==filename || index==0) {
                this.loadNextFile(0);
            }
            
            this.saveStatus(this.playerInfo, () => {}, (error : string) => {});
            
            this.playerInfo.media.play();
            this.playerInfo.status = Media.MEDIA_RUNNING;
            this.isPlaying = true;

            this.playerInfo.media.seekTo(this.playerInfo.position.currentTC*1000);

            if (!isPlaying) {
                this.playerInfo.media.pause();
                this.playerInfo.status = Media.MEDIA_PAUSED;
                this.isPlaying = false;
            }
                        
        }
        
        seek(bookmark : Bookmark) {
            
            this.isPlaying = false;
            var isPlaying : boolean = (this.playerInfo.status===Media.MEDIA_RUNNING);
                  
            // If filename is not currently laoded, load the right one
            if (this.book.sequence[bookmark.index].filename!=this.book.sequence[this.playerInfo.position.currentIndex].filename) {
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
            
            // update status
            this.playerInfo.position.absoluteTC = bookmark.absoluteTC;
            this.playerInfo.position.currentIndex = bookmark.index;
            this.playerInfo.position.currentSOM = bookmark.som;
            this.playerInfo.position.currentTC = bookmark.tc;
            this.playerInfo.position.currentTitle = this.book.sequence[bookmark.index].title;
           
            this.playerInfo.media.play();
            // Seek to the position in the player
            this.playerInfo.media.seekTo(bookmark.tc*1000);            
            // play if running
            if (!isPlaying) {
                this.playerInfo.media.pause();
            }

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
                    try {
                        this.playerInfo.position = JSON.parse(atob(result));
                    }
                    catch (e) {
                        this.playerInfo.position = new SeekInfo();
                        this.playerInfo.position.navigationLevel = 1;
                        this.playerInfo.position.currentIndex = 0;
                        this.playerInfo.position.currentSOM = this.book.sequence[0].som;
                        this.playerInfo.position.currentTC = this.book.sequence[0].som;
                        this.playerInfo.position.currentTitle = this.book.sequence[0].title;
                        this.playerInfo.position.absoluteTC = "0:00:00";
                    }
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
        id : string;
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
    
    export var NAV_LEVEL_1 : number = 1;
    export var NAV_LEVEL_2 : number = 2;
    export var NAV_LEVEL_3 : number = 3;
    export var NAV_LEVEL_4 : number = 4;
    export var NAV_LEVEL_5 : number = 5;
    export var NAV_LEVEL_6 : number = 6;
    export var NAV_LEVEL_PHRASE : number = 7;
    export var NAV_LEVEL_PAGE : number = 8;
    export var NAV_LEVEL_BOOKMARK : number = 9;
    export var NAV_LEVEL_INTERVAL : number = 10;

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
        hasPages : boolean = false;
                
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
                        level = NAV_LEVEL_1;
                        break;
                    case "h2":
                        level = NAV_LEVEL_2;
                        break;
                    case "h3":
                        level = NAV_LEVEL_3;
                        break;
                    case "h4":
                        level = NAV_LEVEL_4;
                        break;
                    case "h5":
                        level = NAV_LEVEL_5;
                        break;
                    case "h6":
                        level = NAV_LEVEL_6;
                        break;
                    case "span":
                        level = NAV_LEVEL_PAGE;
                        this.hasPages = true;
                        break;
                    case "div":
                        level = NAV_LEVEL_PAGE;
                        this.hasPages = true;
                        break;
                }
                
                if (level<=NAV_LEVEL_6 && this.maxLevels<level) {
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
                     id : id,
                     filename : audioElements.item(i).attributes.getNamedItem("src").value,
                     title : title,
                     level : i===0?level:NAV_LEVEL_PHRASE,
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
};