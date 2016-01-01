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
            
            this.scope.$on('downloading', (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.stateParams.abookId==download.id) {
                    $scope.downloadInfo = download;
                }
            });
            
            this.scope.$on('downloaded', (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.stateParams.abookId==download.id) {
                    $scope.downloadInfo = null;
                }
            });
            
            this.scope.$on('cancelled', (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.stateParams.abookId==download.id) {
                    $scope.downloadInfo = null;
                }
            });

            this.scope.$on('error', (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.stateParams.abookId==download.id) {
                    this.ionicPopup.alert({
                        title: 'Error en la descarga',
                        template: download.downloadStatus
                    });
                    this.scope.downloadInfo = null;
                }
            });

            this.initialize();
        }
        
        initialize() {
                        
            this.ionicLoading.show({
                template: 'Cargando...'
            });
                    
            this.http({
                method: 'GET',
                url: baseUrl + 'GetAudioBookDetail?Session=' + this.sessionSvc.getSession() + '&Id=' + this.stateParams.abookId
            })
            .then((response : any) => {
                this.scope.detail = response.data.GetAudioBookDetailResult;
                this.ionicLoading.hide();
                this.scope.showDetail = true;
            })
        }
        
        public play(id : string) {
            this.location.path('/myabooks/player/' + id);
        }
        
        public isDownloadable(id : string) : boolean {
            var index : number = this.myABooksSvc.getABookIndex(id);
            if (index>=0) {
                return (this.myABooksSvc.abooks[index].status!=="downloading" &&
                        this.myABooksSvc.abooks[index].status!=="downloaded");
            }
            return true;
        }
        
        public isAvailable(id : string) : boolean {
            var index : number = this.myABooksSvc.getABookIndex(id);
            if (index>=0) {
                return this.myABooksSvc.abooks[index].status==="downloaded";
            }
            return false;            
        }

        public downloadBook(id : string, title : string) {
            this.downloadSvc.download(id, title);
        }
        
        public cancelDownload(id : string) {
            this.downloadSvc.cancel(id);
        }
    }

}