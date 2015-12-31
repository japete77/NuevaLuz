/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksPlayerController = (function () {
        function ABooksPlayerController($scope, $cordovaMedia, $cordovaFile) {
            this.scope = $scope;
            this.scope.control = this;
            this.cordovaMedia = $cordovaMedia;
            this.currentBook = new DaisyBook($cordovaFile);
            this.currentBook.readDaisyBook("1145");
        }
        ABooksPlayerController.prototype.test = function (id) {
            var m = this.cordovaMedia.newMedia("documents://1108/a000009.mp3");
            m.play();
        };
        return ABooksPlayerController;
    })();
    NuevaLuz.ABooksPlayerController = ABooksPlayerController;
    var DaisyBook = (function () {
        function DaisyBook($cordovaFile) {
            this.cordovaFile = $cordovaFile;
        }
        DaisyBook.prototype.readDaisyBook = function (id) {
            var _this = this;
            var bdir = NuevaLuz.workingDir + id + "/";
            var bfile = "ncc.html";
            this.cordovaFile.checkFile(bdir, bfile)
                .then(function (success) {
                _this.cordovaFile.readAsText(bdir, bfile)
                    .then(function (result) {
                    _this.htmlContent = result;
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
