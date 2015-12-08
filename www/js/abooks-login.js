// Login controller
app.controller('ABooksLoginCtrl', ['$cordovaFile', '$scope', '$location', '$ionicLoading', '$ionicHistory', '$timeout', '$http', 'SvcNL', 
function($cordovaFile, $scope, $location, $ionicLoading, $ionicHistory, $timeout, $http, SvcNL) {

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
	
	$scope.targetFolder = '';
	$scope.tmpFolder = '';
	$scope.sourceZip = '';
	
	function addFileEntry(entry) {		
		var dirReader = entry.createReader();
		
		dirReader.readEntries(
			function (entries) {
				var i = 0;
				for (i = 0; i < entries.length; i++) {
					if (entries[i].isDirectory === true) {
						// Recursive -- call back into this subdirectory
						addFileEntry(entries[i]);
					} else {
						var r = /[^\/]*$/;
						var sourcePath = entries[i].fullPath.replace(r,'');
						var filename = entries[i].name;
						$cordovaFile.moveFile(cordova.file.documentsDirectory + sourcePath, filename, 
							cordova.file.documentsDirectory + '/' + $scope.targetFolder + '/', filename)
							.then(function (success) {
								// Delete tmp folder at the end...
								if (i==entries.length) {
									$cordovaFile.removeRecursively(cordova.file.documentsDirectory, $scope.tmpFolder);
								}
							},
							function (error) {
								// clean tmp folder in case of error
								$cordovaFile.removeRecursively(cordova.file.documentsDirectory, $scope.tmpFolder);
							}
						);
					}
				}			
			}
		);
	}
	
	$scope.Unzip = function(id) {
		// Generate tmp folder
		var d = new Date();
		$scope.tmpFolder = '/' + d.getTime().toString() + '/';
		
		// Source file and target folder using id with left padding
		var pad = "0000";
		$scope.targetFolder = pad.substring(0, pad.length -  id.toString().length) + id;
		$scope.sourceZip = '/' +  $scope.targetFolder + '.zip';
		
		// Unzip
		zip.unzip(
			cordova.file.documentsDirectory + $scope.sourceZip, 
			cordova.file.documentsDirectory + $scope.tmpFolder, 
			function(result) {
				if (result>-1) {
					// Delete .zip
					$cordovaFile.removeFile(cordova.file.documentsDirectory, $scope.sourceZip);

					// Create target dir
					var res = $cordovaFile.createDir(cordova.file.documentsDirectory, '/' + $scope.targetFolder + '/', true);
									
					// Read files from tmp folder to move them to target dir
					window.resolveLocalFileSystemURL(
						cordova.file.documentsDirectory + $scope.tmpFolder, 
						addFileEntry,
						function(error) {
							// Delete .zip file...
							$cordovaFile.removeFile(cordova.file.documentsDirectory, $scope.sourceZip);
				
							alert(error);
						}
					);
				}
				else {
					// Delete .zip file...
					$cordovaFile.removeFile(cordova.file.documentsDirectory, $scope.sourceZip);
					
					alert('Unzip Error!');				
				}
			}
		);
	}
}]);