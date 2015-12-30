/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksDetailScope extends ng.IScope {
        control : ABooksDetailController;
        detail : any;
        downloadInfo : DownloadItem;
        showDetail : boolean;
    }
    
    export class ABooksDetailController {
        scope : IABooksDetailScope;
        timeout : ng.ITimeoutService;
        http : ng.IHttpService;
        location : ng.ILocationService; 
        ionicLoading : ionic.loading.IonicLoadingService;
        stateParams : any; 
        ionicPopup : ionic.popup.IonicPopupService;
        sessionSvc : SessionService;
        downloadSvc : DownloadService;
        myABooksSvc : MyABooksService;
        
        constructor($scope : IABooksDetailScope, $timeout : ng.ITimeoutService, 
            $http : ng.IHttpService, $location : ng.ILocationService, 
            $ionicLoading : ionic.loading.IonicLoadingService, $stateParams : any, 
            $ionicPopup : ionic.popup.IonicPopupService, sessionSvc : SessionService,
            DownloadSvc : DownloadService, MyABooksSvc : MyABooksService) {
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
            
            this.scope.$on('downloading', function(event, download) {
                if (this.stateParams.abookId==download.id) {
                    $scope.downloadInfo = download;
                }
            });
            
            this.scope.$on('downloaded', function(event, download) {
                if ($stateParams.abookId==download.id) {
                    $scope.downloadInfo = null;
                }
            });
            
            this.scope.$on('cancelled', function(event, download) {
                if ($stateParams.abookId==download.id) {
                    $scope.downloadInfo = null;
                }
            });

            this.scope.$on('error', function(event, download) {
                if ($stateParams.abookId==download.id) {
                    $ionicPopup.alert({
                        title: 'Error en la descarga',
                        template: download.downloadStatus
                    });
                    $scope.downloadInfo = null;
                }
            });

            this.initialize();
        }
        
        initialize() {
            var _this = this;
            
            this.ionicLoading.show({
                template: 'Cargando...'
            });
                    
            this.http({
                method: 'GET',
                url: baseUrl + 'GetAudioBookDetail?Session=' + this.sessionSvc.getSession() + '&Id=' + this.stateParams.abookId
            })
            .then(function success(response : any) {
                _this.scope.detail = response.data.GetAudioBookDetailResult;
                _this.ionicLoading.hide();
                _this.scope.showDetail = true;
            })
        }
        
        public play(id : string) {
            this.location.path('#/myabooks/player/' + id);
        }
        
        public isDownloaded(id : string) : boolean {
            return this.myABooksSvc.existsABook(id);
        }
        public downloadBook(id : string, title : string, downloadId : string) {
            this.downloadSvc.download(id, title, downloadId);
        }
        
        public cancelDownload(id : string) {
            this.downloadSvc.cancel(id);
        }
    }

}