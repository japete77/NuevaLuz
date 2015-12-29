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
        private sessionSvc : SessionService;
            
        private index : number = 1;
        private maxTitles : number = 9999999;
        private pageSize : number = 15;
        private timer : ng.IPromise<void> = null;

        
        constructor($scope : IABooksTitlesScope, $timeout : ng.ITimeoutService, 
        $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
        $ionicScrollDelegate : ionic.scroll.IonicScrollDelegate, sessionSvc : SessionService ) {
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
            this.sessionSvc = sessionSvc;
            
            var _control = this;
            
            // Filter watch
            this.scope.$watch('filterText', function() {
                
                _control.scope.stopLoading = true;
                
                if (_control.timer) {
                    _control.timeout.cancel(_control.timer);
                }
                
                // delay to avoid many requests when writing search text
                _control.timer = $timeout(function() {
                    _control.index = 1;
                    _control.maxTitles = 9999999;
                    _control.scope.titles = [];
                    _control.ionicScrollDelegate.scrollTop();
                    _control.getNextTitles();
                }, 1000);
            });
        }
        
        public getNextTitles() {
            var _control = this;
            
            if (this.index<this.maxTitles) {
                this.scope.showScroll = true;

                if (this.scope.filterText=="") {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'GetTitles?Session=' + this.sessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then(function success(response : any) {
                    
                        _control.maxTitles = response.data.GetTitlesResult.Total;
                        
                        response.data.GetTitlesResult.Titles.forEach(function(element : any) {
                            _control.scope.titles.push(element);
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
                        url: baseUrl + 'SearchTitles?Session=' + this.sessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then(function success(response : any) {
                    
                        _control.maxTitles = response.data.SearchTitlesResult.Total;
                        
                        response.data.SearchTitlesResult.Titles.forEach(function(element) {
                            _control.scope.titles.push(element);                            
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
    
        public loadMore() {
            if (!this.scope.stopLoading) {
                this.getNextTitles();
            }
        } 
    }

}