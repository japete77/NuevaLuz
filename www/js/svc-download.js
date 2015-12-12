var abookBaseUrl = "http://bibliasbraille.com/ClubLibro/";

app.service('SvcDownload', ['$rootScope', '$interval', '$cordovaFile', 'SvcMyABooks',
function($rootScope, $interval, $cordovaFile, SvcMyABooks) {
		
	var ready = false;
	var downloads = [];
	
	// Check when device is ready to be used...
	ionic.Platform.ready(function() {
  		ready = true;
	});
	
	// broadcast download status every sec
	$interval(function() {
		if (downloads.length>0) {
			downloads.forEach(function(item) {
				$rootScope.$broadcast('downloading', item);				
			});
		}
	}, 1000);
	
	var processDownloadQueue = function() {
		
		// Check that is not downloading and are still pending downloads
		if (downloads.length==0 || downloads[0].transfer) {
			return;
		}
		
		// Get next item to download
		var currentDownload = downloads[0];
		
		// Register item in abooks-index.json		
		SvcMyABooks.addBook(currentDownload);
		
		// Instantiate new FileTransfer object
		currentDownload.transfer = new FileTransfer();
		currentDownload.transfer.onprogress = function(progressEvent) {
				if (progressEvent.lengthComputable) {
					currentDownload.progress = (progressEvent.loaded / progressEvent.total) * 100;
					currentDownload.downloadStatus = Math.floor(currentDownload.progress) + '% descargado...';
				}
			};
		
		currentDownload.transfer.download(currentDownload.url, currentDownload.path + currentDownload.filename, 
			function (entry) {				
				// Notify downloaded
				currentDownload.status = 'Descarga completada';
				$rootScope.$broadcast('downloaded', currentDownload);

				// remove item
				downloads.splice(getDownloadIndex(currentDownload.id), 1);

				// Unzip file
				// Unzip(currentDownload.id);
				
			}, function (error) {			
				
				currentDownload.errorCode = error.code;
				
				// Delete .zip
				switch (error.code) {
					case FileTransferError.FILE_NOT_FOUND_ERR:
						currentDownload.downloadStatus = 'Audio libro no encontrado';
						$rootScope.$broadcast('error', currentDownload);
						break;
					case FileTransferError.INVALID_URL_ERR:
						currentDownload.downloadStatus = 'URL incorrecta';
						$rootScope.$broadcast('error', currentDownload);
						break;
					case FileTransferError.CONNECTION_ERR:
						currentDownload.downloadStatus = 'Error en la conexión';
						$rootScope.$broadcast('error', currentDownload);
						break;
					case FileTransferError.ABORT_ERR:
						currentDownload.downloadStatus = 'Cancelada la descarga';
						$rootScope.$broadcast('cancelled', currentDownload);
						break;
					case FileTransferError.NOT_MODIFIED_ERR:
						currentDownload.downloadStatus = 'Error en archivo local descargdo';
						$rootScope.$broadcast('error', currentDownload);
						break;
				}				
	
				downloads.splice(getDownloadIndex(currentDownload.id), 1);
				
				processDownloadQueue();
				
			});
	}
	
	$rootScope.targetFolder = '';
	$rootScope.tmpFolder = '';
	$rootScope.sourceZip = '';
	
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
							cordova.file.documentsDirectory + '/' + $rootScope.targetFolder + '/', filename)
							.then(function (success) {
								// Delete tmp folder at the end...
								if (i==entries.length) {
									$cordovaFile.removeRecursively(cordova.file.documentsDirectory, $rootScope.tmpFolder);
								}
							},
							function (error) {
								// clean tmp folder in case of error
								$cordovaFile.removeRecursively(cordova.file.documentsDirectory, $rootScope.tmpFolder);
							}
						);
					}
				}			
			}
		);
	}
	
	var Unzip = function(id) {
		// Generate tmp folder
		var d = new Date();
		$rootScope.tmpFolder = '/' + d.getTime().toString() + '/';
		
		// Source file and target folder using id with left padding
		var pad = "0000";
		$rootScope.targetFolder = pad.substring(0, pad.length -  id.toString().length) + id;
		$rootScope.sourceZip = '/' +  $rootScope.targetFolder + '.zip';
		
		// Unzip
		zip.unzip(
			cordova.file.documentsDirectory + $rootScope.sourceZip, 
			cordova.file.documentsDirectory + $rootScope.tmpFolder, 
			function(result) {
				if (result>-1) {
					// Delete .zip
					$cordovaFile.removeFile(cordova.file.documentsDirectory, $rootScope.sourceZip);

					// Create target dir
					var res = $cordovaFile.createDir(cordova.file.documentsDirectory, '/' + $rootScope.targetFolder + '/', true);
									
					// Read files from tmp folder to move them to target dir
					window.resolveLocalFileSystemURL(
						cordova.file.documentsDirectory + $rootScope.tmpFolder, 
						addFileEntry,
						function(error) {
							// Delete .zip file...
							$cordovaFile.removeFile(cordova.file.documentsDirectory, $rootScope.sourceZip);
				
							processDownloadQueue();
							
							alert(error);
						}
					);
				}
				else {
					// Delete .zip file...
					$cordovaFile.removeFile(cordova.file.documentsDirectory, $rootScope.sourceZip);
										
					alert('Unzip Error!');				
				
					processDownloadQueue();
				}
			}
		);
	}
	
	var getPlatform = function() {
			return ionic.Platform.platform();
	}
	
	var getVersion = function() {
			return ionic.Platform.version();
	}
	
	var download = function(id, title) {
			
			if (!ready) return;
			
			// File for download (left padding with zeros)
			var pad = "0000";
			var url = abookBaseUrl + pad.substring(0, pad.length -  id.toString().length) + id + ".zip";
			
			// File name only
			var filename = url.split("/").pop();
			
			// Add item to the queue
			var downloadItem = {
				id : id,
				title: title,
				url : url,
				path : cordova.file.documentsDirectory, // TODO: check OS to select folder...
				filename : filename,
				progress : 0,
				downloadStatus : 'Pendiente de descarga',
				errorCode : 0,
				transfer : null
			}
			
			downloads.push(downloadItem);
			
			// process item
			processDownloadQueue();
	}
	
	var cancel = function(id) {
		var cancelDownload = getDownloadInfo(id);
		
		// abort transfer if it's in progress
		if (cancelDownload)
		{
			if (cancelDownload.transfer) {
				cancelDownload.transfer.abort();
			}
			else {
				downloads.splice(getDownloadIndex(cancelDownload.id), 1);
				cancelDownload.downloadStatus = 'Cancelada la descarga';
				$rootScope.$broadcast('cancelled', cancelDownload);
				processDownloadQueue();
			}
		}
	}
	
	var getDownloadInfo = function(id) {
		if (downloads) {
			for (var i=0; i<downloads.length; i++) {
				if (downloads[i].id==id) {
					return downloads[i];
				}
			}
		}
	}
	
	var getDownloadIndex = function(id) {
		if (downloads) {
			for (var i=0; i<downloads.length; i++) {
				if (downloads[i].id==id) {
					return i;
				}
			}
		}
	}
	
	return {
		download: download,
		cancel: cancel
	}
}]);