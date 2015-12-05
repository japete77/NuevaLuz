controllers.controller('ABooksDetailCtrl', ['$scope', '$timeout', '$http', '$ionicLoading', '$stateParams', 'NLSvc', 
function($scope, $timeout, $http, $ionicLoading, $stateParams, NLSvc) {
	
	$scope.init = function() {
	
		$ionicLoading.show({
			template: 'Cargando...'
		});
				
		$http({
			method: 'GET',
			url: baseUrl + 'GetAudioBookDetail?Session=' + NLSvc.GetSession() + '&Id=' + $stateParams.abookId
		})
		.then(function success(response) {
			$scope.detail = response.data.GetAudioBookDetailResult;
			$ionicLoading.hide();
		})
	}
	
	$scope.init();
}]);