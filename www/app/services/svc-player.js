/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var DaisyPlayerService = (function () {
        function DaisyPlayerService($cordovaMedia, $cordovaFile, $interval, $rootScope) {
            var _this = this;
            this.cordovaMedia = $cordovaMedia;
            this.cordovaFile = $cordovaFile;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.playerInfo = new PlayerInfo();
            // Timer
            this.interval(function () {
                _this.rootScope.$broadcast('playerInfo', _this.playerInfo);
            }, 500);
        }
        DaisyPlayerService.prototype.loadBook = function (id) {
            var _this = this;
            // Load Audio Book
            this.book = new DaisyBook(this.cordovaFile);
            this.book.readDaisyBook(id);
            if (this.player) {
                this.player.stop();
            }
            // Initialize player
            this.player = new Media("documents://" + this.book.id + "/a000009.mp3", function () {
            }, function (error) {
            }, function (status) {
                _this.playerInfo.status = status;
            });
            // Save book and player info
            this.playerInfo.book = this.book;
            this.playerInfo.media = this.player;
            return this.book;
        };
        DaisyPlayerService.prototype.getCurrentBook = function () {
            return this.book;
        };
        DaisyPlayerService.prototype.play = function () {
            if (this.player) {
                this.player.play();
            }
        };
        DaisyPlayerService.prototype.stop = function () {
            if (this.player) {
                this.player.stop();
            }
        };
        DaisyPlayerService.prototype.pause = function () {
            if (this.player) {
                this.player.pause();
            }
        };
        return DaisyPlayerService;
    })();
    NuevaLuz.DaisyPlayerService = DaisyPlayerService;
    var PlayerInfo = (function () {
        function PlayerInfo() {
        }
        return PlayerInfo;
    })();
    NuevaLuz.PlayerInfo = PlayerInfo;
    var DaisyBook = (function () {
        function DaisyBook($cordovaFile) {
            this.cordovaFile = $cordovaFile;
            // Initialize xml2json parser    
            this.x2js = new X2JS();
        }
        DaisyBook.prototype.readDaisyBook = function (id) {
            var _this = this;
            this.id = id;
            var bdir = NuevaLuz.workingDir + id + "/";
            var bfile = "ncc.html";
            this.cordovaFile.checkFile(bdir, bfile)
                .then(function (success) {
                _this.cordovaFile.readAsBinaryString(bdir, bfile)
                    .then(function (result) {
                    var nccData = _this.x2js.xml_str2json(result);
                    // Retrieve header metadata
                    if (nccData.html.head.meta) {
                        nccData.html.head.meta.forEach(function (s) {
                            if (s._name === "dc:creator")
                                _this.creator = s._content;
                            else if (s._name === "dc:date")
                                _this.date = s._content;
                            else if (s._name === "dc:format")
                                _this.format = s._content;
                            else if (s._name === "dc:identifier")
                                _this.identifier = s._content;
                            else if (s._name === "dc:publisher")
                                _this.publisher = s._content;
                            else if (s._name === "dc:subject")
                                _this.subject = s._content;
                            else if (s._name === "dc:source")
                                _this.source = s._content;
                            else if (s._name === "dc:title")
                                _this.title = s._content;
                            else if (s._name === "ncc:charset")
                                _this.charset = s._content;
                            else if (s._name === "ncc:generator")
                                _this.generator = s._content;
                            else if (s._name === "ncc:narrator")
                                _this.narrator = s._content;
                            else if (s._name === "ncc:producer")
                                _this.producer = s._content;
                            else if (s._name === "ncc:totalTime")
                                _this.totalTime = s._content;
                        });
                    }
                }, function (reason) {
                    console.log(reason);
                });
            }, function (reason) {
                console.log(reason);
                alert("Audio libro no encontrado");
            });
        };
        return DaisyBook;
    })();
    NuevaLuz.DaisyBook = DaisyBook;
})(NuevaLuz || (NuevaLuz = {}));
