/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksDetailController = (function () {
        function ABooksDetailController($scope, $timeout, $http, $location, $ionicLoading, $stateParams, $ionicPopup, sessionSvc, DownloadSvc, MyABooksSvc) {
            var _this = this;
            this.scope = $scope;
            this.scope.control = this;
            this.timeout = $timeout;
            this.http = $http;
            this.location = $location;
            this.ionicLoading = $ionicLoading;
            this.stateParams = $stateParams;
            this.ionicPopup = $ionicPopup;
            this.SessionSvc = sessionSvc;
            this.downloadSvc = DownloadSvc;
            this.myABooksSvc = MyABooksSvc;
            this.scope.downloadInfo = null;
            this.scope.showDetail = false;
            this.currentId = this.padleft(this.stateParams["abookId"], 4, "0");
            this.scope.$on(NuevaLuz.STATUS_INSTALLING, function (event, download) {
                if (_this.currentId == download.id) {
                    $scope.downloadInfo = download;
                }
            });
            this.scope.$on(NuevaLuz.STATUS_DOWNLOADING, function (event, download) {
                if (_this.currentId == download.id) {
                    $scope.downloadInfo = download;
                }
            });
            this.scope.$on(NuevaLuz.STATUS_DOWNLOADED, function (event, download) {
                if (_this.currentId == download.id) {
                    $scope.downloadInfo = download;
                }
            });
            this.scope.$on(NuevaLuz.STATUS_COMPLETED, function (event, download) {
                if (_this.currentId == download.id) {
                    $scope.downloadInfo = null;
                }
            });
            this.scope.$on(NuevaLuz.STATUS_CANCELLED, function (event, download) {
                if (_this.currentId == download.id) {
                    $scope.downloadInfo = null;
                }
            });
            this.scope.$on(NuevaLuz.STATUS_ERROR, function (event, download) {
                if (_this.currentId == download.id) {
                    _this.scope.downloadInfo = download;
                }
            });
            this.scope.$on(NuevaLuz.STATUS_PENDING, function (event, download) {
                if (_this.currentId == download.id) {
                    _this.scope.downloadInfo = download;
                }
            });
            this.initialize();
        }
        ABooksDetailController.prototype.padleft = function (str, count, char) {
            var pad = "";
            for (var i = 0; i < count; i++) {
                pad += char;
            }
            return pad.substring(0, pad.length - str.length) + str;
        };
        ABooksDetailController.prototype.initialize = function () {
            var _this = this;
            this.ionicLoading.show({
                template: 'Cargando...'
            });
            this.http({
                method: 'GET',
                url: NuevaLuz.baseUrl + 'GetAudioBookDetail?Session=' + this.SessionSvc.getSession() + '&Id=' + this.stateParams["abookId"]
            })
                .then(function (response) {
                _this.scope.detail = response.data.GetAudioBookDetailResult;
                _this.ionicLoading.hide();
                _this.scope.showDetail = true;
            }, function (reason) {
                _this.SessionSvc.isSessionValid()
                    .then(function (result) {
                    _this.initialize();
                })
                    ['catch'](function (reason) {
                    _this.location.path("/login");
                    _this.ionicLoading.hide();
                });
            });
        };
        ABooksDetailController.prototype.play = function (id) {
            this.location.path('/myabooks/player/' + id);
        };
        ABooksDetailController.prototype.downloadBook = function (id, title) {
            this.downloadSvc.download(id, title);
        };
        ABooksDetailController.prototype.cancelDownload = function (id) {
            this.downloadSvc.cancel(id);
        };
        ABooksDetailController.prototype.deleteDownload = function (id) {
            this.myABooksSvc.deleteBook(id);
            this.scope.downloadInfo = null;
        };
        ABooksDetailController.prototype.showDescription = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            if (index >= 0) {
                return this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_INSTALLING ||
                    this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_DOWNLOADING ||
                    this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_DOWNLOADED ||
                    this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_ERROR ||
                    this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_PENDING;
            }
            return false;
        };
        ABooksDetailController.prototype.isCancellable = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            if (index >= 0) {
                return this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_PENDING ||
                    this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_DOWNLOADING;
            }
            return false;
        };
        ABooksDetailController.prototype.isProgressing = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            if (index >= 0) {
                return this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_DOWNLOADING ||
                    this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_DOWNLOADED ||
                    this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_INSTALLING;
            }
            return false;
        };
        ABooksDetailController.prototype.isDownloadable = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            return index < 0;
        };
        ABooksDetailController.prototype.isDownloading = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            if (index >= 0) {
                return this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_DOWNLOADING;
            }
            return false;
        };
        ABooksDetailController.prototype.isAvailable = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            if (index >= 0) {
                return this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_COMPLETED;
            }
            return false;
        };
        ABooksDetailController.prototype.isErasable = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            if (index >= 0) {
                return this.myABooksSvc.abooks[index].statusKey === NuevaLuz.STATUS_ERROR;
            }
            return false;
        };
        ABooksDetailController.prototype.isBookLoaded = function () {
            return this.SessionSvc.getCurrentBook() != null && this.SessionSvc.getCurrentBook() != undefined;
        };
        ABooksDetailController.prototype.getCurrentBookId = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        };
        ABooksDetailController.prototype.getCurrentBookTitle = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        };
        ABooksDetailController.prototype.copy2SD = function (id) {
            this.SessionSvc.copy2SD(id)
                .then(function (res) {
                alert("Ok!");
            }, function (error) {
                alert(error.code + ": " + error.message);
            });
        };
        ABooksDetailController.prototype.copy2Phone = function (id) {
            this.SessionSvc.copy2Phone(id)
                .then(function (res) {
                alert("Ok!");
            }, function (error) {
                alert(error.code + ": " + error.message);
            });
        };
        return ABooksDetailController;
    })();
    NuevaLuz.ABooksDetailController = ABooksDetailController;
})(NuevaLuz || (NuevaLuz = {}));
;
