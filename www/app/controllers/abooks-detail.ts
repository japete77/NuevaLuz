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
        stateParams : angular.ui.IStateParamsService; 
        ionicPopup : ionic.popup.IonicPopupService;
        sessionSvc : SessionService;
        downloadSvc : DownloadService;
        myABooksSvc : MyABooksService;
        currentId : string;
        
        constructor($scope : IABooksDetailScope, $timeout : ng.ITimeoutService, 
            $http : ng.IHttpService, $location : ng.ILocationService, 
            $ionicLoading : ionic.loading.IonicLoadingService, $stateParams : angular.ui.IStateParamsService, 
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
            
            this.currentId = this.padleft(this.stateParams["abookId"], 4, "0");
            
            this.scope.$on(STATUS_INSTALLING, (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.currentId==download.id) {
                    $scope.downloadInfo = download;
                }
            });

            this.scope.$on(STATUS_DOWNLOADING, (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.currentId==download.id) {
                    $scope.downloadInfo = download;
                }
            });
            
            this.scope.$on(STATUS_DOWNLOADED, (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.currentId==download.id) {
                    $scope.downloadInfo = download;
                }
            });
                        
            this.scope.$on(STATUS_COMPLETED, (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.currentId==download.id) {
                    $scope.downloadInfo = null;
                }
            });
            
            this.scope.$on(STATUS_CANCELLED, (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.currentId==download.id) {
                    $scope.downloadInfo = null;
                }
            });

            this.scope.$on(STATUS_ERROR, (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.currentId==download.id) {
                    this.scope.downloadInfo = download;
                }
            });

            this.scope.$on(STATUS_PENDING, (event : ng.IAngularEvent, download : DownloadItem) => {
                if (this.currentId==download.id) {
                    this.scope.downloadInfo = download;
                }
            });

            this.initialize();
        }
        
        private padleft(str : string, count : number, char : string) : string {
            var pad = "";
            for (var i = 0; i<count; i++) { pad += char; }
            return pad.substring(0, pad.length - str.length) + str
        }

        private initialize() {              
            this.ionicLoading.show({
                template: 'Cargando...'
            });
                    
            this.http({
                method: 'GET',
                url: baseUrl + 'GetAudioBookDetail?Session=' + this.sessionSvc.getSession() + '&Id=' + this.stateParams["abookId"]
            })
            .then((response : any) => {
                this.scope.detail = response.data.GetAudioBookDetailResult;
                this.ionicLoading.hide();
                this.scope.showDetail = true;
            }, 
            (reason : any) => {
                this.sessionSvc.isSessionValid()
                .then((result : number) => {
                    this.initialize();
                })
                .catch((reason : any) => {
                    this.location.path("/login");
                    
                    this.ionicLoading.hide();
                })
            });
        }
        
        public play(id : string) {
            this.location.path('/myabooks/player/' + id);
        }
        
        public downloadBook(id : string, title : string) {
            this.downloadSvc.download(id, title);
        }
        
        public cancelDownload(id : string) {
            this.downloadSvc.cancel(id);
        }
        
        public deleteDownload(id : string) {
            this.myABooksSvc.deleteBook(id);
            this.scope.downloadInfo = null;    
        }
        
        public showDescription(id : string) : boolean {
            var index : number = this.myABooksSvc.getABookIndex(id);
            if (index>=0) {
                return this.myABooksSvc.abooks[index].statusKey===STATUS_INSTALLING ||
                       this.myABooksSvc.abooks[index].statusKey===STATUS_DOWNLOADING ||
                       this.myABooksSvc.abooks[index].statusKey===STATUS_DOWNLOADED ||
                       this.myABooksSvc.abooks[index].statusKey===STATUS_ERROR ||
                       this.myABooksSvc.abooks[index].statusKey===STATUS_PENDING;
            } 
            return false;            
        }
        
        public isCancellable(id : string) : boolean {
            var index : number = this.myABooksSvc.getABookIndex(id);
            if (index>=0) {
                return this.myABooksSvc.abooks[index].statusKey===STATUS_PENDING ||
                       this.myABooksSvc.abooks[index].statusKey===STATUS_DOWNLOADING;
            } 
            return false;
        }
        
        public isProgressing(id : string) : boolean {
            var index : number = this.myABooksSvc.getABookIndex(id);
            if (index>=0) {
                return this.myABooksSvc.abooks[index].statusKey===STATUS_DOWNLOADING ||
                       this.myABooksSvc.abooks[index].statusKey===STATUS_DOWNLOADED ||
                       this.myABooksSvc.abooks[index].statusKey===STATUS_INSTALLING;
            } 
            return false;            
        }
        
        public isDownloadable(id : string) : boolean {
            var index : number = this.myABooksSvc.getABookIndex(id);
            return index<0;
        }
        
        public isDownloading(id : string) : boolean {
            var index : number = this.myABooksSvc.getABookIndex(id);
            if (index>=0) {
                return this.myABooksSvc.abooks[index].statusKey===STATUS_DOWNLOADING;
            }     
            return false;
        }
        
        public isAvailable(id : string) : boolean { 
            var index : number = this.myABooksSvc.getABookIndex(id);
            if (index>=0) {
                return this.myABooksSvc.abooks[index].statusKey===STATUS_COMPLETED;
            }
            return false;            
        }

        public isErasable(id : string) : boolean { 
            var index : number = this.myABooksSvc.getABookIndex(id);
            if (index>=0) {
                return this.myABooksSvc.abooks[index].statusKey===STATUS_ERROR;
            }
            return false;            
        }
    }

};