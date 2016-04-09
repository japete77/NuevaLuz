/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IAuthorsScope extends ng.IScope {
        control : AuthorsController;
        stopLoading : boolean;
        showScroll : boolean;
        authors : Array<any>;
        filterText : string;
        loading : boolean;
    }
    
    export class AuthorsController {
        private scope : IAuthorsScope;
        private timeout : ng.ITimeoutService;
        private http : ng.IHttpService;
        private ionicLoading : ionic.loading.IonicLoadingService; 
        private ionicScrollDelegate : ionic.scroll.IonicScrollDelegate;
        private SessionSvc : SessionService;
        private location : ng.ILocationService;
            
        index : number = 1;
        maxAuthors : number = 9999999;
        pageSize : number = 15;
        timer : ng.IPromise<void> = null;
        
        constructor($scope : IAuthorsScope, $timeout : ng.ITimeoutService, 
            $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
            $ionicScrollDelegate : ionic.scroll.IonicScrollDelegate, sessionSvc : SessionService,
            $location : ng.ILocationService) {
            
            this.scope = $scope;
            this.scope.control = this;
            this.scope = $scope;
            this.scope.stopLoading = false;
            this.scope.showScroll = true;
            this.scope.authors = [];
            this.scope.filterText = "";

            this.timeout = $timeout;
            this.http = $http;
            this.ionicLoading = $ionicLoading;
            this.ionicScrollDelegate = $ionicScrollDelegate;
            this.SessionSvc = sessionSvc;
            this.location = $location;
            this.scope.loading = true;
            
            // Filter
            this.scope.$watch('filterText', () => {
                this.scope.stopLoading = true;
                
                if (this.timer) {
                    this.timeout.cancel(this.timer);
                }
                
                // delay to avoid many requests when writing search text
                this.timer = this.timeout(() => {
                    this.index = 1;
                    this.maxAuthors = 9999999;
                    this.scope.authors = [];
                    this.ionicScrollDelegate.scrollTop();
                    this.getNextAuthors();
                }, 1000);
            });
         }
         
         public getNextAuthors() {
            
            this.scope.loading = true;

            if (this.index<this.maxAuthors) {
                this.scope.showScroll = true;		
                
                if (this.scope.filterText=="") {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'GetAuthors?Session=' + this.SessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then((response : any) => {
                    
                        this.maxAuthors = response.data.GetAuthorsResult.Total;
                        
                        response.data.GetAuthorsResult.Authors.forEach((element) => {
                            this.scope.authors.push(element);
                        }, this);
                        
                        this.index += this.pageSize;
                        
                        this.timer = null;
                        this.scope.stopLoading = false;
                        this.scope.$broadcast('scroll.infiniteScrollComplete');
                        this.scope.loading = false;

                    }, (reason : any) => {
                        this.SessionSvc.isSessionValid()
                        .then((result : number) => {
                            this.getNextAuthors();
                        })
                        .catch((reason : any) => {
                            this.location.path("/login");
                        })
                        this.scope.loading = false;
                    });
                }
                else {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'SearchAuthors?Session=' + this.SessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then((response : any) => {
                    
                        this.maxAuthors = response.data.SearchAuthorsResult.Total;
                        
                        response.data.SearchAuthorsResult.Authors.forEach((element) => {
                            this.scope.authors.push(element);
                        }, this);
                        
                        this.index += this.pageSize;
                        
                        this.timer = null;
                        this.scope.stopLoading = false;
                        this.scope.$broadcast('scroll.infiniteScrollComplete');
                        this.scope.loading = false;
                    }, (reason : any) => {
                        this.SessionSvc.isSessionValid()
                        .then((result : number) => {
                            this.getNextAuthors();
                        })
                        .catch((reason : any) => {
                            this.location.path("/login");
                        })
                        this.scope.loading = false;
                    });
                }
            }
            else {
                this.scope.showScroll = false;
            }
        }

        public loadMore() {
            if (!this.scope.stopLoading) {
                this.getNextAuthors();
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