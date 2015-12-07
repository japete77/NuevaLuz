// Audio books controller
app.controller('ABooksTitlesCtrl', ['$scope', '$timeout', '$http', '$ionicLoading', 'SvcNL', 
function($scope, $timeout, $http, $ionicLoading, SvcNL) {

	var index = 1;
	var maxTitles = 9999999;
	var pageSize = 25;
	var requesting = false;
	
	$scope.titles = [];

	$scope.GetNextTitles = function() {
	
		if (!requesting && index<maxTitles) {
			
			requesting = true;
			
			$http({
				method: 'GET',
				url: baseUrl + 'GetTitles?Session=' + SvcNL.GetSession() + '&Index=' + index + '&Count=' + pageSize
			})
			.then(function success(response) {
			
				maxTitles = response.data.GetTitlesResult.Total;
				
				response.data.GetTitlesResult.Titles.forEach(function(element) {
					$scope.titles.push(element);
				}, this);
				
				index += pageSize;
				
				requesting = false;
			})
		}
	}
  
	$scope.loadMore = function() {
		$scope.GetNextTitles();
		$scope.$broadcast('scroll.infiniteScrollComplete');
	} 
  
	$scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();
	});  
}]);