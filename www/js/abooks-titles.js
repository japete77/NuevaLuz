// Audio books controller
app.controller('ABooksTitlesCtrl', ['$scope', '$timeout', '$http', '$ionicLoading', '$ionicScrollDelegate', 'SvcNL', 
function($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SvcNL) {

	var index = 1;
	var maxTitles = 9999999;
	var pageSize = 15;
	var requesting = false;
	
	$scope.titles = [];
    $scope.filterText = "";

	$scope.GetNextTitles = function() {
	
		if (!requesting && index<maxTitles) {
			
			requesting = true;
			
            if ($scope.filterText=="") {
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
            else {
                $http({
                    method: 'GET',
                    url: baseUrl + 'SearchTitles?Session=' + SvcNL.GetSession() + '&Text=' + $scope.filterText + '&Index=' + index + '&Count=' + pageSize
                })
                .then(function success(response) {
                
                    maxTitles = response.data.SearchTitlesResult.Total;
                    
                    response.data.SearchTitlesResult.Titles.forEach(function(element) {
                        $scope.titles.push(element);                            
                    }, this);
                    
                    index += pageSize;
                    
                    requesting = false;
                })                
            }
		}
	}
  
	$scope.loadMore = function() {
		$scope.GetNextTitles();
		$scope.$broadcast('scroll.infiniteScrollComplete');
	} 
  
	$scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();
	});
    
    // Filter
    $scope.$watch('filterText', function() {
        index = 1;
        maxTitles = 9999999;
        $scope.titles = [];
        $ionicScrollDelegate.scrollTop();
        $scope.GetNextTitles();
    });
}]);