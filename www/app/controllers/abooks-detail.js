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
            this.scope.$on('downloading', function (event, download) {
                if (this.stateParams.abookId == download.id) {
                    $scope.downloadInfo = download;
                }
            });
            this.scope.$on('downloaded', function (event, download) {
                if ($stateParams.abookId == download.id) {
                    $scope.downloadInfo = null;
                }
            });
            this.scope.$on('cancelled', function (event, download) {
                if ($stateParams.abookId == download.id) {
                    $scope.downloadInfo = null;
                }
            });
            this.scope.$on('error', function (event, download) {
                if ($stateParams.abookId == download.id) {
                    $ionicPopup.alert({
                        title: 'Error en la descarga',
                        template: download.downloadStatus
                    });
                    $scope.downloadInfo = null;
                }
            });
            this.initialize();
        }
        ABooksDetailController.prototype.initialize = function () {
            var _control = this;
            this.ionicLoading.show({
                template: 'Cargando...'
            });
            this.http({
                method: 'GET',
                url: NuevaLuz.baseUrl + 'GetAudioBookDetail?Session=' + this.sessionSvc.getSession() + '&Id=' + this.stateParams.abookId
            })
                .then(function success(response) {
                _control.scope.detail = response.data.GetAudioBookDetailResult;
                _control.ionicLoading.hide();
                _control.scope.showDetail = true;
            });
        };
        ABooksDetailController.prototype.play = function (id) {
            this.location.path('#/myabooks/player/' + id);
        };
        ABooksDetailController.prototype.isDownloaded = function (id) {
            return this.myABooksSvc.existsABook(id);
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
