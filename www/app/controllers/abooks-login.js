/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../services/svc-session.ts" />
/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var LoginController = (function () {
        function LoginController($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc) {
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
        LoginController.prototype.login = function (username, password) {
            var _this = this;
            this.scope.errorMessage = "";
            this.timeout(function () {
                _this.ionicLoading.show({
                    template: 'Verificando credenciales...'
                });
            }, 0);
            this.SessionSvc.login(username, password)
                .then(function (result) {
                _this.scope.showErrorLogin = false;
                _this.ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                _this.SessionSvc.saveSessionInfo()
                    .then(function () {
                    _this.location.path("/abooks/menu");
                    _this.timeout(function () {
                        _this.ionicLoading.hide();
                    }, 0);
                });
            })
                ['catch'](function (reason) {
                _this.timeout(function () {
                    _this.ionicLoading.hide();
                }, 0);
                _this.scope.errorMessage = reason;
                _this.scope.showErrorLogin = true;
            });
        };
        // Get the link to next screen based on auth info
        LoginController.prototype.getLink = function () {
            if (this.SessionSvc.isAuthenticated()) {
                return '#/abooks/menu';
            }
            else {
                return '#/login';
            }
        };
        return LoginController;
    })();
    NuevaLuz.LoginController = LoginController;
})(NuevaLuz || (NuevaLuz = {}));
;
