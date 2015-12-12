// Audio books controller
app.controller('ABooksCtrl', ['$scope', '$timeout', '$http', 'SvcMyABooks', 
	function($scope, $timeout, $http, SvcMyABooks) {
		
		$scope.abooks = SvcMyABooks.getBooks();
}]);