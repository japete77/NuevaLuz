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
            
            var _control = this;
            
            // Filter
            this.scope.$watch('filterText', function() {
                _control.scope.stopLoading = true;
                
                if (_control.timer) {
                    _control.timeout.cancel(this.timer);
                }
                
                // delay to avoid many requests when writing search text
                _control.timer = _control.timeout(() => {
                    _control.index = 1;
                    _control.maxAuthors = 9999999;
                    _control.scope.authors = [];
                    _control.ionicScrollDelegate.scrollTop();
                    _control.getNextAuthors();
                }, 1000);
            });
         }
         
         public getNextAuthors() {
        
            var _control = this;
            
            if (this.index<this.maxAuthors) {
                this.scope.showScroll = true;		
                
                if (this.scope.filterText=="") {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'GetAuthors?Session=' + this.sessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then(function success(response : any) {
                    
                        _control.maxAuthors = response.data.GetAuthorsResult.Total;
                        
                        response.data.GetAuthorsResult.Authors.forEach(function(element) {
                            _control.scope.authors.push(element);
                        }, _control);
                        
                        _control.index += _control.pageSize;
                        
                        _control.timer = null;
                        _control.scope.stopLoading = false;
                        _control.scope.$broadcast('scroll.infiniteScrollComplete');
                    })
                }
                else {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'SearchAuthors?Session=' + this.sessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then(function success(response : any) {
                    
                        _control.maxAuthors = response.data.SearchAuthorsResult.Total;
                        
                        response.data.SearchAuthorsResult.Authors.forEach(function(element) {
                            _control.scope.authors.push(element);
                        }, _control);
                        
                        _control.index += _control.pageSize;
                        
                        _control.timer = null;
                        _control.scope.stopLoading = false;
                        _control.scope.$broadcast('scroll.infiniteScrollComplete');
                    })              
                }
            }
            else {
                this.scope.showScroll = false;
            }
        }

        public loadMore = function() {
            if (!this.scope.stopLoading) {
                this.scope.GetNextAuthors();
            }
        } 
    }

}