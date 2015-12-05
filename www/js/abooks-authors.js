// Authors
controllers.controller('AuthorsCtrl', ['$scope', '$http', '$ionicLoading', '$location', 'NLSvc', 
function($scope, $http, $ionicLoading, $location, NLSvc) {
	var index = 1;
	var maxAuthors = 9999999;
	var pageSize = 25;
	var requesting = false;
	
	$scope.authors = [];

	$scope.GetNextAuthors = function() {
	
		if (!requesting && index<maxAuthors) {
			
			requesting = true;
			
			$http({
				method: 'GET',
				url: baseUrl + 'GetAuthors?Session=' + NLSvc.GetSession() + '&Index=' + index + '&Count=' + pageSize
			})
			.then(function success(response) {
			
				maxAuthors = response.data.GetAuthorsResult.Total;
				
				response.data.GetAuthorsResult.Authors.forEach(function(element) {
					$scope.authors.push(element);
				}, this);
				
				index += pageSize;
				
				requesting = false;
			})
		}
	}
  
	$scope.loadMore = function() {
		$scope.GetNextAuthors();
		$scope.$broadcast('scroll.infiniteScrollComplete');
	} 
  
	$scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();
	});
}]);