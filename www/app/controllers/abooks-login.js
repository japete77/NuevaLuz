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
            var _this = this;
            this.scope.errorMessage = "";
            this.timeout(function () {
                _this.ionicLoading.show({
                    template: 'Verificando credenciales...'
                });
            }, 0);
            this.http({
                method: 'GET',
                url: NuevaLuz.baseUrl + 'Login?Username=' + username + '&Password=' + password
            })
                .then(function (response) {
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
                _this.timeout(function () {
                    _this.ionicLoading.hide();
                }, 0);
            }, function (response) {
                _this.timeout(function () {
                    _this.ionicLoading.hide();
                }, 0);
                _this.scope.errorMessage = 'Biblioteca de audio libros fuera de servicio';
                _this.scope.showErrorLogin = true;
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
        LoginController.prototype.play = function () {
            alert(NuevaLuz.workingDir);
            var m = new Media(NuevaLuz.playDir + "/1212/a000001.mp3", function () {
            }, function (error) {
            }, function (status) {
                alert("Status: " + status);
            });
            m.play();
        };
        return LoginController;
    })();
    NuevaLuz.LoginController = LoginController;
})(NuevaLuz || (NuevaLuz = {}));
