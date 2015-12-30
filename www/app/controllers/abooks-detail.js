/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksDetailController = (function () {
        function ABooksDetailController($scope, $timeout, $http, $location, $ionicLoading, $stateParams, $ionicPopup, sessionSvc, DownloadSvc, MyABooksSvc) {
            this.scope = $scope;
            this.scope.control = this;
            this.timeout = $timeout;
            this.http = $http;
            this.location = $location;
            this.ionicLoading = $ionicLoading;
            this.stateParams = $stateParams;
            this.ionicPopup = $ionicPopup;
            this.sessionSvc = sessionSvc;
            this.downloadSvc = DownloadSvc;
            this.myABooksSvc = MyABooksSvc;
            this.scope.downloadInfo = null;
            this.scope.showDetail = false;
            var _this = this;
            this.scope.$on('downloading', function (event, download) {
                if (_this.stateParams.abookId == download.id) {
                    $scope.downloadInfo = download;
                }
            });
            this.scope.$on('downloaded', function (event, download) {
                if (_this.stateParams.abookId == download.id) {
                    $scope.downloadInfo = null;
                }
            });
            this.scope.$on('cancelled', function (event, download) {
                if (_this.stateParams.abookId == download.id) {
                    $scope.downloadInfo = null;
                }
            });
            this.scope.$on('error', function (event, download) {
                if (_this.stateParams.abookId == download.id) {
                    _this.ionicPopup.alert({
                        title: 'Error en la descarga',
                        template: download.downloadStatus
                    });
                    _this.scope.downloadInfo = null;
                }
            });
            this.initialize();
        }
        ABooksDetailController.prototype.initialize = function () {
            var _this = this;
            this.ionicLoading.show({
                template: 'Cargando...'
            });
            this.http({
                method: 'GET',
                url: NuevaLuz.baseUrl + 'GetAudioBookDetail?Session=' + this.sessionSvc.getSession() + '&Id=' + this.stateParams.abookId
            })
                .then(function success(response) {
                _this.scope.detail = response.data.GetAudioBookDetailResult;
                _this.ionicLoading.hide();
                _this.scope.showDetail = true;
            });
        };
        ABooksDetailController.prototype.play = function (id) {
            this.location.path('/myabooks/player/' + id);
        };
        ABooksDetailController.prototype.isDownloadable = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            if (index >= 0) {
                return (this.myABooksSvc.abooks[index].status !== "downloading" &&
                    this.myABooksSvc.abooks[index].status !== "downloaded");
            }
            return true;
        };
        ABooksDetailController.prototype.isAvailable = function (id) {
            var index = this.myABooksSvc.getABookIndex(id);
            if (index >= 0) {
                return this.myABooksSvc.abooks[index].status === "downloaded";
            }
            return false;
        };
        ABooksDetailController.prototype.downloadBook = function (id, title, downloadId) {
            this.downloadSvc.download(id, title, downloadId);
        };
        ABooksDetailController.prototype.cancelDownload = function (id) {
            this.downloadSvc.cancel(id);
        };
        return ABooksDetailController;
    })();
    NuevaLuz.ABooksDetailController = ABooksDetailController;
})(NuevaLuz || (NuevaLuz = {}));
