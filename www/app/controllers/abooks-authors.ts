/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IAuthorsScope extends ng.IScope {
        control : AuthorsController;
        stopLoading : boolean;
        showScroll : boolean;
        authors : Array<any>;
        filterText : string;
    }
    
    export class AuthorsController {
        scope : IAuthorsScope;
        timeout : ng.ITimeoutService;
        http : ng.IHttpService;
        ionicLoading : ionic.loading.IonicLoadingService; 
        ionicScrollDelegate : ionic.scroll.IonicScrollDelegate;
        sessionSvc : SessionService;
            
        index : number = 1;
        maxAuthors : number = 9999999;
        pageSize : number = 15;
        timer : ng.IPromise<void> = null;
        
        constructor($scope : IAuthorsScope, $timeout : ng.ITimeoutService, 
            $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
            $ionicScrollDelegate : ionic.scroll.IonicScrollDelegate, sessionSvc : SessionService) {
            
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
            this.sessionSvc = sessionSvc;
            
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
            
            if (this.index<this.maxAuthors) {
                this.scope.showScroll = true;		
                
                if (this.scope.filterText=="") {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'GetAuthors?Session=' + this.sessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
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
                    })
                }
                else {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'SearchAuthors?Session=' + this.sessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
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
                    })              
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
    }

}