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
        sessionService : SessionService;
        ionicHistory : ionic.navigation.IonicHistoryService;
        
        constructor($scope : ILoginScope, $location : ng.ILocationService, 
            $timeout : ng.ITimeoutService, $http : ng.IHttpService,
            $ionicLoading : ionic.loading.IonicLoadingService, $ionicHistory : ionic.navigation.IonicHistoryService, 
            sessionService : SessionService) {
            
            this.scope = $scope;
            this.scope.control = this;
            this.scope.showErrorLogin = false;
            this.scope.errorMessage = "";
            
            this.location = $location;
            this.timeout = $timeout;
            this.ionicLoading = $ionicLoading;
            this.http = $http;
            this.sessionService = sessionService;
            this.ionicHistory = $ionicHistory;
        }
        
        // Login
        login(username : string, password : string) {
            var _this = this;
            
            this.scope.errorMessage = "";
            
            this.timeout(function() {
                _this.ionicLoading.show({
                    template: 'Verificando credenciales...'
                });
            }, 0)
            
            this.http({
                method: 'GET',
                url: baseUrl + 'Login?Username=' + username + '&Password=' + password
            })
            .then(function success(response : any) {
                if (response.data.LoginResult.Success) {           
                
                    _this.sessionService.setSession(response.data.LoginResult.Session);
            
                    _this.scope.showErrorLogin = false;
                    
                    _this.ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    
                    _this.location.path("/");
                }
                else {           
                    _this.scope.errorMessage = 'Acceso denegado';
                    _this.scope.showErrorLogin = true;
                }
            
                // Close dialog  
                _this.timeout(function() {
                    _this.ionicLoading.hide();
                }, 0);			
            },
            function error(response) {
                
                this.timeout(function() {
                    _this.ionicLoading.hide();
                }, 0);
                            
                _this.scope.errorMessage = 'Biblioteca de audio libros fuera de servicio';
                _this.scope.showErrorLogin = true;
            })
        }
        
        // Get the link to next screen based on auth info
        getLink() : string {
            if (this.isAuthenticated()) {
                return '#/abooks/menu';
            }
            else {
                return '#/login';
            }
        }
        
        // Checks if the user is authenticated
        isAuthenticated() : boolean {
            return this.sessionService.getSession()!=="";
        } 
    }
    
}