/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
/// <reference path="svc-download.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var MyABooksService = (function () {
        function MyABooksService($cordovaFile) {
            var _this = this;
            this.abooksIndexFilename = "abooks-index.json";
            this.abooks = new Array();
            this.ready = false;
            this.cordovaFile = $cordovaFile;
            ionic.Platform.ready(function () {
                _this.ready = true;
                // Load my audio books
                _this.getBooks(function (abooks) { _this.abooks = abooks; });
            });
        }
        MyABooksService.prototype.updateABooksFile = function () {
            if (this.ready) {
                this.cordovaFile.writeFile(NuevaLuz.workingDir, this.abooksIndexFilename, JSON.stringify(this.abooks), true)
                    .then(function (success) {
                }, function (error) {
                    console.log(error);
                });
            }
        };
        MyABooksService.prototype.getABookIndex = function (id) {
            if (this.abooks) {
                for (var i = 0; i < this.abooks.length; i++) {
                    if (this.abooks[i].id == id) {
                        return i;
                    }
                }
            }
            return -1;
        };
        MyABooksService.prototype.existsABook = function (id) {
            if (this.abooks) {
                for (var i = 0; i < this.abooks.length; i++) {
                    if (this.abooks[i].id == id) {
                        return true;
                    }
                }
            }
            return false;
        };
        MyABooksService.prototype.addUpdateBook = function (book) {
            var index = this.getABookIndex(book.id);
            if (index < 0) {
                this.abooks.push({
                    id: book.id,
                    title: book.title,
                    status: book.progress < 100 ? 'downloading' : 'downloaded'
                });
            }
            else {
                // update book status
                this.abooks[index].status = book.progress < 100 ? 'downloading' : 'downloaded';
            }
            this.updateABooksFile();
        };
        MyABooksService.prototype.deleteBook = function (id) {
            this.abooks.splice(this.getABookIndex(id), 1);
            this.updateABooksFile();
        };
        MyABooksService.prototype.getBooks = function (callback) {
            var _this = this;
            if (this.ready) {
                this.cordovaFile.checkFile(NuevaLuz.workingDir, this.abooksIndexFilename)
                    .then(function (success) {
                    _this.cordovaFile.readAsText(NuevaLuz.workingDir, _this.abooksIndexFilename)
                        .then(function (result) {
                        _this.abooks = JSON.parse(result);
                        callback(_this.abooks);
                    }, function (error) {
                        console.log(error);
                    });
                }, function (error) {
                    _this.cordovaFile.createFile(NuevaLuz.workingDir, _this.abooksIndexFilename, true);
                    console.log(error);
                });
            }
        };
        return MyABooksService;
    })();
    NuevaLuz.MyABooksService = MyABooksService;
})(NuevaLuz || (NuevaLuz = {}));
