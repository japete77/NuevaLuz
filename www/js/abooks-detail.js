app.controller('ABooksDetailCtrl', ['$scope', '$timeout', '$http', '$ionicLoading', '$stateParams', 'SvcNL', 'SvcDownload', 
function($scope, $timeout, $http, $ionicLoading, $stateParams, SvcNL, SvcDownload) {
	
	$scope.downloadInfo = null;
	
	$scope.isDownloading = function(id) {
		var currentInfo = SvcDownload.getDownloadInfo(id);
		if (currentInfo) {
			return true;
		}
		else {
			return false;
		}
	}
	
	$scope.init = function() {
	
		$ionicLoading.show({
			template: 'Cargando...'
		});
				
		$http({
			method: 'GET',
			url: baseUrl + 'GetAudioBookDetail?Session=' + SvcNL.GetSession() + '&Id=' + $stateParams.abookId
		})
		.then(function success(response) {
			$scope.detail = response.data.GetAudioBookDetailResult;
			$ionicLoading.hide();
		})
	}
	
	$scope.downloadBook = function(id) {
		SvcDownload.download(id);
	}
	
	$scope.cancelDownload = function(id) {
		SvcDownload.cancel(id);
	}
	
	$scope.$on('downloading', function(event, download) {
		if ($stateParams.abookId==download.id) {
			$scope.downloadInfo = download;
		}
	});
	
	$scope.$on('downloaded', function(event, download) {
		if ($stateParams.abookId==download.id) {
			$scope.downloadInfo = null;
		}
	});
	
	$scope.$on('cancelled', function(event, download) {
		if ($stateParams.abookId==download.id) {
			$scope.downloadInfo = null;
		}
	});

	$scope.$on('error', function(event, download) {
		if ($stateParams.abookId==download.id) {
			alert(download.downloadStatus);
			$scope.downloadInfo = null;
		}
	});

	$scope.init();
}]);