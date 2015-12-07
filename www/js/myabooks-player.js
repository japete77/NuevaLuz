// Audio books controller
app.controller('ABooksPlayerCtrl', ['$scope', '$timeout', '$http', 'SvcDownload', 
	function($scope, $timeout, $http, SvcDownload) {
		
		$scope.test = function(id) {
			// alert(SvcDownload.GetPlatform() + ' - ' + SvcDownload.GetVersion());
			SvcDownload.download(id);
		}
}]);