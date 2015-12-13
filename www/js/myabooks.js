// Audio books controller
app.controller('ABooksCtrl', ['$scope', '$timeout', '$http', 'SvcMyABooks', 
	function($scope, $timeout, $http, SvcMyABooks) {
		
		SvcMyABooks.getBooks(function(data) {
			$scope.abooks = data;
		});
		
		$scope.getLink = function(id) {
			var index = getABookIndex(id);
			if (index>=0) {
				if ($scope.abooks[index].status=='downloaded') {
					return '#/myabooks/player/' + id;
				}
				else if ($scope.abooks[index].status=='downloading') {
					return '#/abooks/menu/detail/' + id;	
				}
			}
		} 
		
		var getABookIndex = function(id) {
			if ($scope.abooks!=null) {
				for (var i=0; i<$scope.abooks.length; i++) {
					if ($scope.abooks[i].id==id) return i;
				}
			}
			return -1;
		}
}]);