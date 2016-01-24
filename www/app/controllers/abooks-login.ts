/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../services/svc-session.ts" />
/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface ILoginScope {
        control : LoginController;
        showErrorLogin : boolean;
        errorMessage : string;
    }
    
    export class LoginController {
        scope : ILoginScope;
        location :  ng.ILocationService;
        timeout : ng.ITimeoutService;
        ionicLoading : ionic.loading.IonicLoadingService;
        http : ng.IHttpService;
        ionicHistory : ionic.navigation.IonicHistoryService;
        SessionSvc : SessionService;
        
        constructor($scope : ILoginScope, $location : ng.ILocationService, 
            $timeout : ng.ITimeoutService, $http : ng.IHttpService,
            $ionicLoading : ionic.loading.IonicLoadingService, $ionicHistory : ionic.navigation.IonicHistoryService, 
            SessionSvc : SessionService) {
            
            // super(SessionSvc);
            this.SessionSvc = SessionSvc;
            this.scope = $scope;
            this.scope.control = this;
            this.scope.showErrorLogin = false;
            this.scope.errorMessage = "";
            
            this.location = $location;
            this.timeout = $timeout;
            this.ionicLoading = $ionicLoading;
            this.http = $http;
            this.ionicHistory = $ionicHistory;
            
            this.ionicHistory.clearHistory();
            
            //this.SessionSvc.loadSessionInfo();
        }
        
        // Login
        login(username : string, password : string) {

            this.scope.errorMessage = "";
            
            this.timeout(() => {
                this.ionicLoading.show({
                    template: 'Verificando credenciales...'
                });
            }, 0)
            
            this.SessionSvc.login(username, password)
            .then((result : SessionInfo) => {
                
                this.scope.showErrorLogin = false;

                this.ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                
                this.SessionSvc.saveSessionInfo()
                .then(() => {
                    this.location.path("/abooks/menu");
                    
                    this.timeout(() => {
                        this.ionicLoading.hide();
                    }, 0); 
                });
            })
            .catch((reason : string) => {
                
                this.timeout(() => {
                    this.ionicLoading.hide();
                }, 0);
                            
                this.scope.errorMessage = reason;
                this.scope.showErrorLogin = true;  
                              
            });

        }
        
        // Get the link to next screen based on auth info
        getLink() : string {
            if (this.SessionSvc.isAuthenticated()) {
                return '#/abooks/menu';
            }
            else {
                return '#/login';
            }
        }
        
    }
    
};