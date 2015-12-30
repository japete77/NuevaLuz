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
            
            var _this = this;
            
            // Filter watch
            this.scope.$watch('filterText', function() {
                
                _this.scope.stopLoading = true;
                
                if (_this.timer) {
                    _this.timeout.cancel(_this.timer);
                }
                
                // delay to avoid many requests when writing search text
                _this.timer = $timeout(function() {
                    _this.index = 1;
                    _this.maxTitles = 9999999;
                    _this.scope.titles = [];
                    _this.ionicScrollDelegate.scrollTop();
                    _this.getNextTitles();
                }, 1000);
            });
        }
        
        public getNextTitles() {
            var _this = this;
            
            if (this.index<this.maxTitles) {
                this.scope.showScroll = true;

                if (this.scope.filterText=="") {
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'GetTitles?Session=' + this.sessionSvc.getSession() + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then(function success(response : any) {
                    
                        _this.maxTitles = response.data.GetTitlesResult.Total;
                        
                        response.data.GetTitlesResult.Titles.forEach(function(element : any) {
                            _this.scope.titles.push(element);
                        }, _this);
                        
                        _this.index += _this.pageSize;
                        
                        _this.timer = null;
                        _this.scope.stopLoading = false;
                        _this.scope.$broadcast('scroll.infiniteScrollComplete');
                    })
                }
                else {
                    
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'SearchTitles?Session=' + this.sessionSvc.getSession() + '&Text=' + this.scope.filterText + '&Index=' + this.index + '&Count=' + this.pageSize
                    })
                    .then(function success(response : any) {
                    
                        _this.maxTitles = response.data.SearchTitlesResult.Total;
                        
                        response.data.SearchTitlesResult.Titles.forEach(function(element) {
                            _this.scope.titles.push(element);                            
                        }, _this);
                        
                        _this.index += _this.pageSize;

                        _this.timer = null;
                        _this.scope.stopLoading = false;
                        _this.scope.$broadcast('scroll.infiniteScrollComplete');
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