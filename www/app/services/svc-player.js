/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var DaisyPlayerService = (function () {
        function DaisyPlayerService($cordovaMedia, $cordovaFile, $interval, $rootScope, $q) {
            var _this = this;
            this.cordovaMedia = $cordovaMedia;
            this.cordovaFile = $cordovaFile;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.q = $q;
            this.loading = true; // prevent player info broadcast
            this.interval(function () {
                if (!_this.loading && _this.playerInfo && _this.playerInfo.media) {
                    // refresh player info
                    _this.playerInfo.media.getCurrentPosition(function (position) {
                        if (position > -1) {
                            _this.playerInfo.position.currentTC = position;
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
        DaisyPlayerService.prototype.loadNextFile = function (autoplay) {
            var _this = this;
            if (this.book.sequence.length > this.playerInfo.position.currentIndex + 1) {
                this.playerInfo.position.currentIndex++;
                this.playerInfo.position.currentSOM = this.book.sequence[this.playerInfo.position.currentIndex].som;
                this.playerInfo.position.currentTC = 0;
                this.playerInfo.position.currentTitle = this.book.sequence[this.playerInfo.position.currentIndex].title;
                this.playerInfo.media = new Media("documents://" + this.book.id + "/" + this.book.sequence[this.playerInfo.position.currentIndex].filename, function () {
                }, function (error) {
                    _this.loading = false;
                }, function (status) {
                    _this.playerInfo.status = status;
                    if (!_this.loading && status === Media.MEDIA_STOPPED) {
                        // If stopped, try to load next file if exists...
                        _this.loadNextFile(true);
                    }
                });
                if (autoplay) {
                    this.play(this.playerInfo.position);
                }
            }
        };
        DaisyPlayerService.prototype.loadBook = function (id) {
            var _this = this;
            this.loading = true;
            var defer = this.q.defer();
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
                    // Initialize player info   
                    _this.loadStatus()
                        .then(function (result) {
                        _this.playerInfo = result;
                        // Initialize media player
                        _this.playerInfo.media = new Media("documents://" + _this.book.id + "/" + _this.book.sequence[_this.playerInfo.position.currentIndex].filename, function () { }, function (error) { }, function (status) {
                            _this.playerInfo.status = status;
                            if (!_this.loading && status === Media.MEDIA_STOPPED) {
                                // If stopped, try to load next file if exists...
                                _this.loadNextFile(true);
                            }
                        });
                        _this.loading = false;
                        defer.resolve(_this.book);
                    });
                });
            });
            return defer.promise;
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
            }
        };
        DaisyPlayerService.prototype.stop = function () {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.stop();
            }
        };
        DaisyPlayerService.prototype.pause = function () {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.pause();
            }
        };
        DaisyPlayerService.prototype.release = function () {
            if (this.playerInfo && this.playerInfo.media) {
                this.playerInfo.media.stop();
                this.playerInfo.media.release();
            }
        };
        DaisyPlayerService.prototype.next = function () {
        };
        DaisyPlayerService.prototype.prev = function () {
        };
        DaisyPlayerService.prototype.loadStatus = function () {
            var _this = this;
            var p = this.q.defer();
            var bdir = NuevaLuz.workingDir + this.book.id + "/";
            var bfile = "status.json";
            this.cordovaFile.checkFile(bdir, bfile)
                .then(function (entry) {
                _this.cordovaFile.readAsBinaryString(bdir, bfile)
                    .then(function (result) {
                    _this.playerInfo.position = JSON.parse(decodeURI(result));
                    p.resolve(_this.playerInfo);
                });
            }, function (error) {
                _this.playerInfo.position = new SeekInfo();
                _this.playerInfo.position.navigationLevel = 1;
                _this.playerInfo.position.currentIndex = 0;
                _this.playerInfo.position.currentSOM = _this.book.sequence[0].som;
                _this.playerInfo.position.currentTC = _this.book.sequence[0].som;
                _this.playerInfo.position.currentTitle = _this.book.sequence[0].title;
                _this.playerInfo.position.absoluteTC = "0:00:00";
                p.resolve(_this.playerInfo);
            });
            return p.promise;
        };
        DaisyPlayerService.prototype.saveStatus = function (pinfo) {
            var p = this.q.defer();
            this.playerInfo = pinfo;
            try {
                var bdir = NuevaLuz.workingDir + this.book.id + "/";
                var bfile = "status.json";
                this.cordovaFile.writeFile(bdir, bfile, encodeURI(JSON.stringify(this.playerInfo.position)), true)
                    .then(function (event) {
                    if (event.loaded === event.total) {
                        p.resolve();
                    }
                });
            }
            catch (e) {
                p.reject("Error saving status: " + e);
            }
            return p.promise;
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
    var DaisyBook = (function () {
        function DaisyBook() {
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
                    level: level,
                    som: som,
                    tcin: tcin,
                    tcout: tcout
                });
                som += (tcout - tcin);
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
