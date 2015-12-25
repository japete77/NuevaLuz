/// <reference path="app.ts" />
app.controller('ABooksLoginCtrl', ['$cordovaFile', '$scope', '$location', '$ionicLoading', '$ionicHistory', '$timeout', '$http', 'SvcNL', 'SvcDownload',
    function ($cordovaFile, $scope, $location, $ionicLoading, $ionicHistory, $timeout, $http, SvcNL, SvcDownload) {
        $scope.showErrorLogin = false;
        $scope.errorMessage = '';
        $scope.Login = function (u, p) {
            $scope.errorMessage = '';
            $timeout(function () {
                $ionicLoading.show({
                    template: 'Verificando credenciales...'
                });
            }, 0);
            $http({
                method: 'GET',
                url: baseUrl + 'Login?Username=' + u + '&Password=' + p
            })
                .then(function success(response) {
                if (response.data.LoginResult.Success) {
                    SvcNL.SetSession(response.data.LoginResult.Session);
                    $scope.showErrorLogin = false;
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    $location.path('/');
                }
                else {
                    $scope.errorMessage = 'Acceso denegado';
                    $scope.showErrorLogin = true;
                }
                // Close dialog  
                $timeout(function () {
                    $ionicLoading.hide();
                }, 0);
            }, function error(response) {
                $timeout(function () {
                    $ionicLoading.hide();
                }, 0);
                $scope.errorMessage = 'Biblioteca de audio libros fuera de servicio';
                $scope.showErrorLogin = true;
            });
        };
        $scope.GetLink = function () {
            if (SvcNL.IsLoggedIn()) {
                return '#/abooks/menu';
            }
            else {
                return '#/login';
            }
        };
        $scope.IsAuthenticated = function () {
            return SvcNL.IsLoggedIn();
        };
    }]);
