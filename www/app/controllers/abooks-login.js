/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../services/svc-session.ts" />
/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var LoginController = (function () {
        function LoginController($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, sessionService) {
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
        LoginController.prototype.login = function (username, password) {
            var _control = this;
            this.scope.errorMessage = "";
            this.timeout(function () {
                _control.ionicLoading.show({
                    template: 'Verificando credenciales...'
                });
            }, 0);
            this.http({
                method: 'GET',
                url: NuevaLuz.baseUrl + 'Login?Username=' + username + '&Password=' + password
            })
                .then(function success(response) {
                if (response.data.LoginResult.Success) {
                    _control.sessionService.setSession(response.data.LoginResult.Session);
                    _control.scope.showErrorLogin = false;
                    _control.ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    _control.location.path("/");
                }
                else {
                    _control.scope.errorMessage = 'Acceso denegado';
                    _control.scope.showErrorLogin = true;
                }
                // Close dialog  
                _control.timeout(function () {
                    _control.ionicLoading.hide();
                }, 0);
            }, function error(response) {
                this.timeout(function () {
                    _control.ionicLoading.hide();
                }, 0);
                _control.scope.errorMessage = 'Biblioteca de audio libros fuera de servicio';
                _control.scope.showErrorLogin = true;
            });
        };
        // Get the link to next screen based on auth info
        LoginController.prototype.getLink = function () {
            if (this.isAuthenticated()) {
                return '#/abooks/menu';
            }
            else {
                return '#/login';
            }
        };
        // Checks if the user is authenticated
        LoginController.prototype.isAuthenticated = function () {
            return this.sessionService.getSession() !== "";
        };
        return LoginController;
    })();
    NuevaLuz.LoginController = LoginController;
})(NuevaLuz || (NuevaLuz = {}));
