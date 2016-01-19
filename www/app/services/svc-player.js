/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var DaisyPlayerService = (function () {
        function DaisyPlayerService($cordovaMedia, $cordovaFile, $interval, $rootScope, $q, $timeout) {
            var _this = this;
            this.isPlaying = false;
            this.cordovaMedia = $cordovaMedia;
            this.cordovaFile = $cordovaFile;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.q = $q;
            this.timeout = $timeout;
            this.interval(function () {
                if (_this.playerInfo && _this.playerInfo.media) {
                    // refresh player info
                    _this.playerInfo.media.getCurrentPosition(function (position) {
                        if (position > -1) {
                            _this.playerInfo.position.currentTC = position;
                        }
                        if (_this.isPlaying && _this.playerInfo.status === Media.MEDIA_STOPPED) {
                            _this.loadNextFile(1);
                            _this.playerInfo.status = Media.MEDIA_RUNNING;
                            _this.play(_this.playerInfo.position);
                        }
                        if (_this.book.sequence[_this.playerInfo.position.currentIndex].tcout < position) {
                            _this.playerInfo.position.currentIndex++;
                            _this.playerInfo.position.currentTitle = _this.book.sequence[_this.playerInfo.position.currentIndex].title;
                        }
                        _this.rootScope.$broadcast('playerInfo', _this.playerInfo);
                    });
                }
            }, 250);
        }
        DaisyPlayerService.prototype.processPlayerStatusChange = function (status) {
            this.playerInfo.status = status;
        };
        DaisyPlayerService.prototype.loadNextFile = function (step) {
            var _this = this;
            if (this.book.sequence.length > this.playerInfo.position.currentIndex + step &&
                this.playerInfo.position.currentIndex + step >= 0) {
                this.release();
                this.playerInfo.position.currentIndex += step;
                this.playerInfo.position.currentSOM = this.book.sequence[this.playerInfo.position.currentIndex].som;
                this.playerInfo.position.currentTC = 0;
                this.playerInfo.position.currentTitle = this.book.sequence[this.playerInfo.position.currentIndex].title;
                this.playerInfo.media = new Media(NuevaLuz.playDir + "/" + this.book.id + "/" + this.book.sequence[this.playerInfo.position.currentIndex].filename, function () {
                }, function (error) {
                }, function (status) {
                    _this.processPlayerStatusChange(status);
                });
                this.saveStatus(this.playerInfo, function () { }, function (error) { });
            }
        };
        DaisyPlayerService.prototype.loadBook = function (id, sucessCallback) {
            var _this = this;
            // Save status of a previous book loaded
            if (this.playerInfo) {
                this.saveStatus(this.playerInfo, function () { }, function () { });
            }
            this.playerInfo = new PlayerInfo();
            this.playerInfo.position = new SeekInfo();
            this.playerInfo.position.currentIndex = -1;
            this.release();
            var bdir = NuevaLuz.workingDir + id + "/";
            var bfile = "ncc.html";
            this.cordovaFile.readAsBinaryString(bdir, bfile)
                .then(function (result) {
                _this.book = new DaisyBook();
                _this.book.id = id;
                _this.book.parseDaisyBook(result);
                // Read all smil files...
                var promises = new Array();
                _this.book.body.forEach(function (s) {
                    promises.push(_this.cordovaFile.readAsBinaryString(bdir, s.filename));
                });
                _this.q.all(promises)
                    .then(function (result) {
                    for (var i = 0; i < result.length; i++) {
                        _this.book.parseSmils(result[i], _this.book.body[i].id, _this.book.body[i].title, _this.book.body[i].level);
                    }
                    sucessCallback(_this.book);
                    // Initialize player info   
                    _this.loadStatus(function (result) {
                        _this.playerInfo = result;
                        // Initialize media player
                        _this.playerInfo.media = new Media(NuevaLuz.playDir + "/" + _this.book.id + "/" + _this.book.sequence[_this.playerInfo.position.currentIndex].filename, function () { }, function (error) { }, function (status) {
                            _this.processPlayerStatusChange(status);
                        });
                        _this.play(_this.playerInfo.position);
                        // load bookmarks
                        _this.loadBookmarks(function (bookmarks) {
                            _this.playerInfo.bookmarks = bookmarks;
                            sucessCallback(_this.book);
                        });
                    });
                });
            }, function (error) {
                console.log(error);
            });
        };
        DaisyPlayerService.prototype.getLevels = function () {
            var levels = new Array();
            for (var i = 1; i <= this.book.maxLevels; i++) {
                levels.push("Nivel " + i);
            }
            return levels;
        };
        DaisyPlayerService.prototype.getCurrentBook = function () {
            return this.book;
        };
        DaisyPlayerService.prototype.getPlayerInfo = function () {
            return this.playerInfo;
        };
        DaisyPlayerService.prototype.play = function (position) {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.play();
                this.playerInfo.media.seekTo(position.currentTC * 1000);
                this.isPlaying = true;
            }
        };
        DaisyPlayerService.prototype.stop = function () {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.stop();
                this.isPlaying = false;
            }
        };
        DaisyPlayerService.prototype.pause = function () {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.pause();
                this.isPlaying = false;
            }
        };
        DaisyPlayerService.prototype.release = function () {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.release();
                this.isPlaying = false;
            }
        };
        DaisyPlayerService.prototype.next = function () {
            this.isPlaying = false;
            var index = 0;
            if (this.playerInfo.position.navigationLevel <= NuevaLuz.NAV_LEVEL_PHRASE) {
                index = this.playerInfo.position.currentIndex;
                // protect bounds...
                if (index >= 0 && this.book.sequence.length <= index)
                    return;
                var filename = this.book.sequence[index].filename;
                var level = this.playerInfo.position.navigationLevel;
                do {
                    index++;
                } while (index < this.book.sequence.length && this.book.sequence[index].level > level);
                // protect bounds...
                if (index < 0) {
                    index = 0;
                    return;
                }
                if (index >= this.book.sequence.length) {
                    index = this.book.sequence.length - 1;
                    return;
                }
                this.playerInfo.position.currentIndex = index;
                this.playerInfo.position.currentSOM = this.book.sequence[index].som;
                this.playerInfo.position.currentTC = this.book.sequence[index].tcin;
                this.playerInfo.position.absoluteTC = this.seconds2TC(this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC);
                this.playerInfo.position.currentTitle = this.book.sequence[index].title;
            }
            else if (this.playerInfo.position.navigationLevel === NuevaLuz.NAV_LEVEL_PAGE) {
                index = this.playerInfo.position.currentIndex;
                // protect bounds...
                if (index >= 0 && this.book.sequence.length <= index)
                    return;
                var filename = this.book.sequence[index].filename;
                var level = this.playerInfo.position.navigationLevel;
                do {
                    index++;
                } while (index < this.book.sequence.length && this.book.sequence[index].level != NuevaLuz.NAV_LEVEL_PAGE);
                // protect bounds...
                if (index < 0) {
                    index = this.playerInfo.position.currentIndex;
                    return;
                }
                if (index >= this.book.sequence.length) {
                    index = this.playerInfo.position.currentIndex;
                    return;
                }
                this.playerInfo.position.currentIndex = index;
                this.playerInfo.position.currentSOM = this.book.sequence[index].som;
                this.playerInfo.position.currentTC = this.book.sequence[index].tcin;
                this.playerInfo.position.absoluteTC = this.seconds2TC(this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC);
                this.playerInfo.position.currentTitle = this.book.sequence[index].title;
            }
            else if (this.playerInfo.position.navigationLevel === NuevaLuz.NAV_LEVEL_BOOKMARK) {
                if (this.playerInfo.bookmarks) {
                    var absoluteTC = this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC;
                    var found = false;
                    var goBookmark = null;
                    this.playerInfo.bookmarks.forEach(function (bm, index, array) {
                        if (!found && bm.som + bm.tc > absoluteTC) {
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
            else if (this.playerInfo.position.navigationLevel === NuevaLuz.NAV_LEVEL_INTERVAL) {
            }
            var isPlaying = (this.playerInfo.status === Media.MEDIA_RUNNING);
            if (this.book.sequence[index].filename !== filename) {
                this.loadNextFile(0);
            }
            this.saveStatus(this.playerInfo, function () { }, function (error) { });
            this.playerInfo.media.play();
            this.isPlaying = true;
            this.playerInfo.media.seekTo(this.playerInfo.position.currentTC * 1000);
            if (!isPlaying) {
                this.playerInfo.media.pause();
                this.isPlaying = false;
            }
        };
        DaisyPlayerService.prototype.prev = function () {
            this.isPlaying = false;
            var index = 0;
            if (this.playerInfo.position.navigationLevel <= NuevaLuz.NAV_LEVEL_PHRASE) {
                index = this.playerInfo.position.currentIndex;
                // protect bounds...
                if (index >= 0 && this.book.sequence.length <= index)
                    return;
                var filename = this.book.sequence[index].filename;
                var level = this.playerInfo.position.navigationLevel;
                do {
                    index--;
                } while (index > 0 && this.book.sequence[index].level > level);
                // protect bounds...
                if (index < 0) {
                    index = 0;
                }
                if (index >= this.book.sequence.length) {
                    index = this.playerInfo.position.currentIndex;
                    return;
                }
                this.playerInfo.position.currentIndex = index;
                this.playerInfo.position.currentSOM = this.book.sequence[index].som;
                this.playerInfo.position.currentTC = this.book.sequence[index].tcin;
                this.playerInfo.position.absoluteTC = this.seconds2TC(this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC);
                this.playerInfo.position.currentTitle = this.book.sequence[index].title;
            }
            else if (this.playerInfo.position.navigationLevel <= NuevaLuz.NAV_LEVEL_PAGE) {
                index = this.playerInfo.position.currentIndex;
                // protect bounds...
                if (index >= 0 && this.book.sequence.length <= index)
                    return;
                var filename = this.book.sequence[index].filename;
                var level = this.playerInfo.position.navigationLevel;
                do {
                    index--;
                } while (index > 0 && this.book.sequence[index].level != NuevaLuz.NAV_LEVEL_PAGE);
                // protect bounds...
                if (index < 0) {
                    index = this.playerInfo.position.currentIndex;
                    return;
                }
                if (index >= this.book.sequence.length) {
                    index = this.book.sequence.length - 1;
                    return;
                }
                this.playerInfo.position.currentIndex = index;
                this.playerInfo.position.currentSOM = this.book.sequence[index].som;
                this.playerInfo.position.currentTC = this.book.sequence[index].tcin;
                this.playerInfo.position.absoluteTC = this.seconds2TC(this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC);
                this.playerInfo.position.currentTitle = this.book.sequence[index].title;
            }
            else if (this.playerInfo.position.navigationLevel === NuevaLuz.NAV_LEVEL_BOOKMARK) {
                if (this.playerInfo.bookmarks) {
                    var absoluteTC = this.playerInfo.position.currentSOM + this.playerInfo.position.currentTC;
                    var found = false;
                    var goBookmark = null;
                    for (var i = this.playerInfo.bookmarks.length - 1; i >= 0; i--) {
                        if (!found && this.playerInfo.bookmarks[i].som + this.playerInfo.bookmarks[i].tc < absoluteTC - 5) {
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
            else if (this.playerInfo.position.navigationLevel === NuevaLuz.NAV_LEVEL_INTERVAL) {
            }
            var isPlaying = (this.playerInfo.status === Media.MEDIA_RUNNING);
            if (this.book.sequence[this.playerInfo.position.currentIndex].filename !== filename || index == 0) {
                this.loadNextFile(0);
            }
            this.saveStatus(this.playerInfo, function () { }, function (error) { });
            this.playerInfo.media.play();
            this.isPlaying = true;
            this.playerInfo.media.seekTo(this.playerInfo.position.currentTC * 1000);
            if (!isPlaying) {
                this.playerInfo.media.pause();
                this.isPlaying = false;
            }
        };
        DaisyPlayerService.prototype.seek = function (bookmark) {
            var _this = this;
            this.isPlaying = false;
            var isPlaying = (this.playerInfo.status === Media.MEDIA_RUNNING);
            // If filename is not currently laoded, load the right one
            if (this.book.sequence[bookmark.index].filename != this.book.sequence[this.playerInfo.position.currentIndex].filename) {
                this.release();
                this.playerInfo.media = new Media(NuevaLuz.playDir + "/" + this.book.id + "/" + this.book.sequence[bookmark.index].filename, function () {
                }, function (error) {
                }, function (status) {
                    _this.processPlayerStatusChange(status);
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
            this.playerInfo.media.seekTo(bookmark.tc * 1000);
            // play if running
            if (!isPlaying) {
                this.playerInfo.media.pause();
            }
        };
        DaisyPlayerService.prototype.loadBookmarks = function (sucessCallback) {
            var _this = this;
            var bdir = NuevaLuz.workingDir + this.book.id + "/";
            var bfile = "bookmarks.json";
            this.cordovaFile.checkFile(bdir, bfile)
                .then(function (entry) {
                _this.cordovaFile.readAsBinaryString(bdir, bfile)
                    .then(function (result) {
                    _this.playerInfo.bookmarks = JSON.parse(atob(result));
                    sucessCallback(_this.playerInfo.bookmarks);
                });
            }, function (error) {
                sucessCallback(new Array());
            });
        };
        DaisyPlayerService.prototype.saveBooksmarks = function (bookmarks, sucessCallback, errorCallback) {
            this.playerInfo.bookmarks = bookmarks;
            try {
                var bdir = NuevaLuz.workingDir + this.book.id + "/";
                var bfile = "bookmarks.json";
                this.cordovaFile.writeFile(bdir, bfile, btoa(JSON.stringify(this.playerInfo.bookmarks)), true)
                    .then(function (event) {
                    if (event.loaded === event.total) {
                        sucessCallback();
                    }
                });
            }
            catch (e) {
                errorCallback("Error saving bookmarks: " + e);
            }
        };
        DaisyPlayerService.prototype.loadStatus = function (sucessCallback) {
            var _this = this;
            var bdir = NuevaLuz.workingDir + this.book.id + "/";
            var bfile = "status.json";
            this.cordovaFile.checkFile(bdir, bfile)
                .then(function (entry) {
                _this.cordovaFile.readAsBinaryString(bdir, bfile)
                    .then(function (result) {
                    try {
                        _this.playerInfo.position = JSON.parse(atob(result));
                    }
                    catch (e) {
                        _this.playerInfo.position = new SeekInfo();
                        _this.playerInfo.position.navigationLevel = 1;
                        _this.playerInfo.position.currentIndex = 0;
                        _this.playerInfo.position.currentSOM = _this.book.sequence[0].som;
                        _this.playerInfo.position.currentTC = _this.book.sequence[0].som;
                        _this.playerInfo.position.currentTitle = _this.book.sequence[0].title;
                        _this.playerInfo.position.absoluteTC = "0:00:00";
                    }
                    sucessCallback(_this.playerInfo);
                });
            }, function (error) {
                _this.playerInfo.position = new SeekInfo();
                _this.playerInfo.position.navigationLevel = 1;
                _this.playerInfo.position.currentIndex = 0;
                _this.playerInfo.position.currentSOM = _this.book.sequence[0].som;
                _this.playerInfo.position.currentTC = _this.book.sequence[0].som;
                _this.playerInfo.position.currentTitle = _this.book.sequence[0].title;
                _this.playerInfo.position.absoluteTC = "0:00:00";
                sucessCallback(_this.playerInfo);
            });
        };
        DaisyPlayerService.prototype.saveStatus = function (pinfo, sucessCallback, errorCallback) {
            this.playerInfo = pinfo;
            try {
                var bdir = NuevaLuz.workingDir + this.book.id + "/";
                var bfile = "status.json";
                this.cordovaFile.writeFile(bdir, bfile, btoa(JSON.stringify(this.playerInfo.position)), true)
                    .then(function (event) {
                    if (event.loaded === event.total) {
                        sucessCallback();
                    }
                });
            }
            catch (e) {
                errorCallback("Error saving status: " + e);
            }
        };
        DaisyPlayerService.prototype.seconds2TC = function (seconds) {
            if (seconds < 0)
                seconds = 0;
            return Math.floor(seconds / 3600).toString() + ":" +
                this.padleft(Math.floor((seconds / 60) % 60).toString(), 2, "0") + ":" +
                this.padleft(Math.floor(seconds % 60).toString(), 2, "0");
        };
        DaisyPlayerService.prototype.padleft = function (str, count, char) {
            var pad = "";
            for (var i = 0; i < count; i++) {
                pad += char;
            }
            return pad.substring(0, pad.length - str.length) + str;
        };
        return DaisyPlayerService;
    })();
    NuevaLuz.DaisyPlayerService = DaisyPlayerService;
    // Player info object
    var PlayerInfo = (function () {
        function PlayerInfo() {
        }
        return PlayerInfo;
    })();
    NuevaLuz.PlayerInfo = PlayerInfo;
    var SeekInfo = (function () {
        function SeekInfo() {
        }
        return SeekInfo;
    })();
    NuevaLuz.SeekInfo = SeekInfo;
    // Daisy audio book navigation info
    var SmilInfo = (function () {
        function SmilInfo() {
        }
        return SmilInfo;
    })();
    NuevaLuz.SmilInfo = SmilInfo;
    // Sequence item
    var Sequence = (function () {
        function Sequence() {
        }
        return Sequence;
    })();
    NuevaLuz.Sequence = Sequence;
    // Bookmark info
    var Bookmark = (function () {
        function Bookmark() {
        }
        return Bookmark;
    })();
    NuevaLuz.Bookmark = Bookmark;
    NuevaLuz.NAV_LEVEL_1 = 1;
    NuevaLuz.NAV_LEVEL_2 = 2;
    NuevaLuz.NAV_LEVEL_3 = 3;
    NuevaLuz.NAV_LEVEL_4 = 4;
    NuevaLuz.NAV_LEVEL_5 = 5;
    NuevaLuz.NAV_LEVEL_6 = 6;
    NuevaLuz.NAV_LEVEL_PHRASE = 7;
    NuevaLuz.NAV_LEVEL_PAGE = 8;
    NuevaLuz.NAV_LEVEL_BOOKMARK = 9;
    NuevaLuz.NAV_LEVEL_INTERVAL = 10;
    var DaisyBook = (function () {
        function DaisyBook() {
            this.maxLevels = 0;
            this.hasPages = false;
            this.body = new Array();
            this.sequence = new Array();
        }
        DaisyBook.prototype.parseDaisyBook = function (content) {
            var xmlParser = new DOMParser();
            var doc = xmlParser.parseFromString(content, "text/xml");
            // Read header metadata
            var meta = doc.getElementsByTagName("meta");
            for (var i = 0; i < meta.length; i++) {
                if (meta.item(i).attributes.getNamedItem("name")) {
                    if (meta.item(i).attributes.getNamedItem("name").value === "dc:creator")
                        this.creator = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "dc:date")
                        this.date = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "dc:format")
                        this.format = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "dc:identifier")
                        this.identifier = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "dc:publisher")
                        this.publisher = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "dc:subject")
                        this.subject = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "dc:source")
                        this.source = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "dc:title")
                        this.title = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "ncc:charset")
                        this.charset = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "ncc:generator")
                        this.generator = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "ncc:narrator")
                        this.narrator = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "ncc:producer")
                        this.producer = meta.item(i).attributes.getNamedItem("content").value;
                    else if (meta.item(i).attributes.getNamedItem("name").value === "ncc:totalTime")
                        this.totalTime = meta.item(i).attributes.getNamedItem("content").value;
                }
            }
            // Read body
            var tmpSmil;
            var bodyElements = doc.getElementsByTagName("body").item(0).children;
            for (var i = 0; i < bodyElements.length; i++) {
                var href = bodyElements.item(i).getElementsByTagName("a").item(0).attributes.getNamedItem("href").value.split("#");
                var level;
                switch (bodyElements.item(i).tagName) {
                    case "h1":
                        level = NuevaLuz.NAV_LEVEL_1;
                        break;
                    case "h2":
                        level = NuevaLuz.NAV_LEVEL_2;
                        break;
                    case "h3":
                        level = NuevaLuz.NAV_LEVEL_3;
                        break;
                    case "h4":
                        level = NuevaLuz.NAV_LEVEL_4;
                        break;
                    case "h5":
                        level = NuevaLuz.NAV_LEVEL_5;
                        break;
                    case "h6":
                        level = NuevaLuz.NAV_LEVEL_6;
                        break;
                    case "span":
                        level = NuevaLuz.NAV_LEVEL_PAGE;
                        this.hasPages = true;
                        break;
                    case "div":
                        level = NuevaLuz.NAV_LEVEL_PAGE;
                        this.hasPages = true;
                        break;
                }
                if (level <= NuevaLuz.NAV_LEVEL_6 && this.maxLevels < level) {
                    this.maxLevels = level;
                }
                this.body.push({
                    id: href[1],
                    title: bodyElements.item(i).getElementsByTagName("a").item(0).innerText,
                    filename: href[0],
                    level: level
                });
            }
        };
        // Read smil file....
        DaisyBook.prototype.parseSmils = function (content, id, title, level) {
            var xmlParser = new DOMParser();
            var doc = xmlParser.parseFromString(content, "text/xml");
            // Read SOM
            var som = this.tc2secs(doc.querySelector('meta[name="ncc:totalElapsedTime"]').attributes.getNamedItem("content").value);
            // Read audio sequences
            var query = doc.querySelector('text[id="' + id + '"]');
            var audioElements = query.parentElement.querySelectorAll("audio");
            for (var i = 0; i < audioElements.length; i++) {
                var tcin = this.ntp2number(audioElements.item(i).attributes.getNamedItem("clip-begin").value);
                var tcout = this.ntp2number(audioElements.item(i).attributes.getNamedItem("clip-end").value);
                this.sequence.push({
                    filename: audioElements.item(i).attributes.getNamedItem("src").value,
                    title: title,
                    level: i === 0 ? level : NuevaLuz.NAV_LEVEL_PHRASE,
                    som: som,
                    tcin: tcin,
                    tcout: tcout
                });
            }
        };
        DaisyBook.prototype.ntp2number = function (value) {
            value = value.replace("npt=", "");
            value = value.replace("s", "");
            return parseFloat(value);
        };
        DaisyBook.prototype.tc2secs = function (value) {
            var parts = value.split(":");
            return parseFloat(parts[0]) * 3600 +
                parseFloat(parts[1]) * 60 +
                parseFloat(parts[2]);
        };
        return DaisyBook;
    })();
    NuevaLuz.DaisyBook = DaisyBook;
})(NuevaLuz || (NuevaLuz = {}));
