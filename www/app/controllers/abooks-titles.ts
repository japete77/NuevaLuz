/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksTitlesScope extends ng.IScope {
        control : ABooksTitlesController;
        stopLoading : boolean;
        showScroll : boolean;
        titles : Array<any>;
        filterText : string;
    }
    
    export class ABooksTitlesController {
        private scope : IABooksTitlesScope;
        private timeout : ng.ITimeoutService;
        private http : ng.IHttpService;
        private ionicLoading : ionic.loading.IonicLoadingService; 
        private ionicScrollDelegate : ionic.scroll.IonicScrollDelegate;
        private SessionSvc : SessionService;
        private location : ng.ILocationService;
            
        private index : number = 1;
        private maxTitles : number = 9999999;
        private pageSize : number = 15;
        private timer : ng.IPromise<void> = null;

        constructor($scope : IABooksTitlesScope, $timeout : ng.ITimeoutService, 
        $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
        $ionicScrollDelegate : ionic.scroll.IonicScrollDelegate, sessionSvc : SessionService,
        $location : ng.ILocationService) {
            
            this.scope = $scope;
            this.scope.control = this;
            this.scope.stopLoading = false;
            this.scope.showScroll = true;
            this.scope.titles = [];
            this.scope.filterText = "";

            this.timeout = $timeout;
            this.http = $http;
            this.ionicLoading = $ionicLoading;
            this.ionicScrollDelegate = $ionicScrollDelegate;
            this.SessionSvc = sessionSvc;
            this.location = $location;

            // Filter watch
            this.scope.$watch('filterText', () => {
                
                this.scope.stopLoading = true;
                
                if (this.timer) {
                    this.timeout.cancel(this.timer);
                }
                
                // delay to avoid many requests when writing search text
                this.timer = $timeout(() => {
                    this.index = 1;
                    this.maxTitles = 9999999;
                    this.scope.titles = [];
                    this.ionicScrollDelegate.scrollTop();
                    this.getNextTitles();
                }, 1000);
            });
        }
        
        public getNextTitles() {
            
            if (this.index<this.maxTitles) {
                this.scope.showScroll = true;

                if (this.scope.filterText=="") {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'GetTitles?Session=' + this.SessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then((response : any) => {
                    
                        this.maxTitles = response.data.GetTitlesResult.Total;
                        
                        response.data.GetTitlesResult.Titles.forEach((element : any) => {
                            this.scope.titles.push(element);
                        }, this);
                        
                        this.index += this.pageSize;
                        
                        this.timer = null;
                        this.scope.stopLoading = false;
                        this.scope.$broadcast('scroll.infiniteScrollComplete');
                    },
                    (reason : any) => {
                        this.SessionSvc.isSessionValid()
                        .then((result : number) => {
                            this.getNextTitles();
                        })
                        .catch((reason : any) => {
                            this.location.path("/login");
                        })
                    });
                }
                else {
                    
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'SearchTitles?Session=' + this.SessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then((response : any) => {
                    
                        this.maxTitles = response.data.SearchTitlesResult.Total;
                        
                        response.data.SearchTitlesResult.Titles.forEach((element) => {
                            this.scope.titles.push(element);                            
                        }, this);
                        
                        this.index += this.pageSize;

                        this.timer = null;
                        this.scope.stopLoading = false;
                        this.scope.$broadcast('scroll.infiniteScrollComplete');
                    }, (reason : any) => {
                        this.SessionSvc.isSessionValid()
                        .then((result : number) => {
                            this.getNextTitles();
                        })
                        .catch((reason : any) => {
                            this.location.path("/login");
                        })
                    });
                }
            }
            else {
                this.scope.showScroll = false;
            }
        }
    
        public loadMore() {
            if (!this.scope.stopLoading) {
                this.getNextTitles();
            }
        } 
        
        isBookLoaded() : boolean {
            return this.SessionSvc.getCurrentBook()!=null && this.SessionSvc.getCurrentBook()!=undefined;
        }
        
        getCurrentBookId() : string {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        }
        
        getCurrentBookTitle() : string {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        }
    }

};