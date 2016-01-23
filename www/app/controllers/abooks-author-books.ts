/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IAuthorsBooksScope extends ng.IScope {
        control : AuthorsBooksController;
        titles : Array<any>;
        showScroll : boolean;
        stopLoading : boolean;
    }
    
    export class AuthorsBooksController {
        scope : IAuthorsBooksScope;
        http : ng.IHttpService;
        location : ng.ILocationService; 
        ionicLoading : ionic.loading.IonicLoadingService;
        stateParams : any;
        sessionSvc : SessionService;
            
        index : number = 1;
        maxTitles : number = 9999999;
        pageSize : number = 9999999;
        timer : ng.IPromise<void> = null;

        constructor($scope : IAuthorsBooksScope, $http : ng.IHttpService, $location : ng.ILocationService, 
            $ionicLoading : ionic.loading.IonicLoadingService, $stateParams : any, sessionSvc : SessionService) {
                this.scope = $scope;
                this.scope.control = this;                
                this.scope.titles = [];
                this.http = $http;
                this.location = $location;
                this.ionicLoading = $ionicLoading;
                this.stateParams = $stateParams;
                this.stateParams = $stateParams;
                this.sessionSvc = sessionSvc;
                
                this.scope.showScroll = true;
                this.scope.stopLoading = false;
        }
        
        public getNextTitles() {
            
            if (this.index<this.maxTitles) {
                this.scope.showScroll = true;

                this.http({
                    method: 'GET',
                    url: baseUrl + 'GetTitlesByAuthor?Session=' + this.sessionSvc.getSession() + '&Id=' + this.stateParams.authorId + '&Index=' + this.index + '&Count=' + this.pageSize
                })
                .then((response : any) => {
                
                    this.maxTitles = response.data.GetTitlesByAuthorResult.Total;
                    
                    response.data.GetTitlesByAuthorResult.Titles.forEach((element : any) => {
                        this.scope.titles.push(element);
                    }, this);
                    
                    this.index += this.pageSize;
                    
                    this.timer = null;
                    this.scope.stopLoading = false;
                    this.scope.$broadcast('scroll.infiniteScrollComplete');
                    }, 
                    (reason : any) => {
                        this.sessionSvc.isSessionValid()
                        .then((result : number) => {
                            this.getNextTitles();
                        })
                        .catch((reason : any) => {
                            this.location.path("/login");
                        })
                    });
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