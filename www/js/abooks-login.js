// Login controller
app.controller('ABooksLoginCtrl', ['$scope', '$location', '$ionicLoading', '$ionicHistory', '$timeout', '$http', 'SvcNL', 
function($scope, $location, $ionicLoading, $ionicHistory, $timeout, $http, SvcNL) {

	$scope.showErrorLogin = false;
	$scope.errorMessage = '';
	
	$scope.Login = function(u, p) {
	
		$scope.errorMessage = '';
		
		$timeout(function() {
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
			$timeout(function() {
				$ionicLoading.hide();
			}, 0);			
		},
		function error(response) {
			$timeout(function() {
				$ionicLoading.hide();
			}, 0);
			
			$scope.errorMessage = 'Biblioteca de audio libros fuera de servicio';
			$scope.showErrorLogin = true;
		})
	}

	$scope.IsAuthenticated = function() {
		return SvcNL.IsLoggedIn();
	}
}]);