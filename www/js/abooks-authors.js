// Authors
app.controller('AuthorsCtrl', ['$scope', '$http', '$ionicLoading', '$ionicScrollDelegate', '$location', 'SvcNL', 
function($scope, $http, $ionicLoading, $ionicScrollDelegate, $location, SvcNL) {
	var index = 1;
	var maxAuthors = 9999999;
	var pageSize = 15;
	var requesting = false;
	
	$scope.authors = [];
    
    $scope.filterText = "";

	$scope.GetNextAuthors = function() {
	
		if (!requesting && index<maxAuthors) {
			
			requesting = true;
			
            if ($scope.filterText=="") {
                $http({
                    method: 'GET',
                    url: baseUrl + 'GetAuthors?Session=' + SvcNL.GetSession() + '&Index=' + index + '&Count=' + pageSize
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
            else {
                $http({
                    method: 'GET',
                    url: baseUrl + 'SearchAuthors?Session=' + SvcNL.GetSession() + '&Text=' + $scope.filterText + '&Index=' + index + '&Count=' + pageSize
                })
                .then(function success(response) {
                
                    maxAuthors = response.data.SearchAuthorsResult.Total;
                    
                    response.data.SearchAuthorsResult.Authors.forEach(function(element) {
                        $scope.authors.push(element);
                    }, this);
                    
                    index += pageSize;
                    
                    requesting = false;
                })
                
            }
		}
	}
  
	$scope.loadMore = function() {
		$scope.GetNextAuthors();
		$scope.$broadcast('scroll.infiniteScrollComplete');
	} 
  
	$scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();
	});
    
        // Filter
    $scope.$watch('filterText', function() {
        index = 1;
        maxAuthors = 9999999;
        $scope.authors = [];
        $ionicScrollDelegate.scrollTop();
        $scope.GetNextAuthors();
    });

}]);