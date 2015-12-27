/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/ionic/ionic.d.ts" />
/// <reference path="../../typings/cordova/plugins/FileTransfer.d.ts" />
/// <reference path="app.ts" />
/// <reference path="../../typings/nluz/nluz.d.ts" />

declare var zip : any;

var abookBaseUrl : string = "http://bibliasbraille.com/ClubLibro/";
var workingDir : string = "";

app.service('SvcDownload', ['$rootScope', '$interval', '$cordovaFile', 'SvcMyABooks',
function($rootScope, $interval, $cordovaFile, SvcMyABooks) {
		
	var ready : boolean = false;
	var downloads : Array<DownloadItem> = [];
	
	// Check when device is ready to be used...
	ionic.Platform.ready(() => {
  		ready = true;

        var userAgent : RegExpMatchArray;
        userAgent = navigator.userAgent.match(/iPad/i);
        if (userAgent && userAgent.toString()==="iPad") {
            workingDir = cordova.file.documentsDirectory;            
        }
        else {
            userAgent = navigator.userAgent.match(/iPhone/i);
            if (userAgent && userAgent.toString()==="iPhone") {
                workingDir = cordova.file.documentsDirectory;            
            }
            else {
                workingDir = cordova.file.dataDirectory;
            }            
        }
	});
    	
	// broadcast download status every 1 sec
	$interval(function() {
		if (downloads.length>0) {
			downloads.forEach(function(item : DownloadItem) {
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
		var currentDownload : DownloadItem = downloads[0];
				
		// Instantiate new FileTransfer object
		currentDownload.transfer = new FileTransfer();
		currentDownload.transfer.onprogress = function(progressEvent) {
				if (progressEvent.lengthComputable) {
					currentDownload.progress = (progressEvent.loaded / progressEvent.total) * 100;
					currentDownload.downloadStatus = Math.floor(currentDownload.progress) + '% descargado...';
				}
			};

		currentDownload.transfer.download(currentDownload.url, currentDownload.path + currentDownload.filename, 
			function (entry : FileEntry) {				
				// Notify downloaded
				currentDownload.status = 'Descarga completada';
				$rootScope.$broadcast('downloaded', currentDownload);
				
				// Save my audio books list
				SvcMyABooks.addUpdateBook(currentDownload);

				// remove item from download list
				downloads.splice(getDownloadIndex(currentDownload.id), 1);

				// Unzip file
				Unzip(currentDownload.downloadId);
				
			}, function (error) {			
				
				currentDownload.errorCode = error.code;
				console.log(error);
				
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
	
				// Delete book from list
				SvcMyABooks.deleteBook(currentDownload.id);

				// Delete from download list
				downloads.splice(getDownloadIndex(currentDownload.id), 1);
				
				// go for next item to process...
				processDownloadQueue();
					
			});
	}
	
	$rootScope.targetFolder = '';
	$rootScope.tmpFolder = '';
	$rootScope.sourceZip = '';
	
	function addFileEntry(entry : DirectoryEntry) {		
		var dirReader = entry.createReader();
		
		dirReader.readEntries(
			function (entries : DirectoryEntry[]) {
				var i : number = 0;
				for (i = 0; i < entries.length; i++) {
					if (entries[i].isDirectory === true) {
						// Recursive -- call back into this subdirectory
						addFileEntry(entries[i]);
					} else {
						var r : RegExp = /[^\/]*$/;
						var sourcePath : string = entries[i].fullPath.replace(r,'');
						var filename : string = entries[i].name;
						$cordovaFile.moveFile(workingDir + sourcePath, filename, 
							workingDir + '/' + $rootScope.targetFolder + '/', filename)
							.then(function (success) {
								// Delete tmp folder at the end...
								if (i==entries.length) {
									$cordovaFile.removeRecursively(workingDir, $rootScope.tmpFolder);
								}
							},
							function (error) {
								// clean tmp folder in case of error
								$cordovaFile.removeRecursively(workingDir, $rootScope.tmpFolder);
							}
						);
					}
				}			
			}
		);
	}
	
	var Unzip = function(downloadId) {
				
		// Generate tmp folder
		var d = new Date();
		$rootScope.tmpFolder = '/' + d.getTime().toString() + '/';
		
		// Source file and target folder using id with left padding
		$rootScope.targetFolder = downloadId;
		$rootScope.sourceZip = '/' +  $rootScope.targetFolder + '.zip';
		
		// Unzip
		zip.unzip(
			workingDir + $rootScope.sourceZip, 
			workingDir + $rootScope.tmpFolder, 
			function(result) {
				if (result>-1) {
					// Delete .zip
					$cordovaFile.removeFile(workingDir, $rootScope.sourceZip);

					// Create target dir
					var res = $cordovaFile.createDir(workingDir, '/' + $rootScope.targetFolder + '/', true);
									
					// Read files from tmp folder to move them to target dir
					window.resolveLocalFileSystemURI(
						workingDir + $rootScope.tmpFolder, 
						addFileEntry,
						function(error) {
							alert(error);
							processDownloadQueue();							
						}
					);					
				}
				else {										
					alert('Unzip Error!');
					processDownloadQueue();
				}
			},
			function (progress) {
			}
		);
	}
	
	var getPlatform = function() {
			return ionic.Platform.platform();
	}
	
	var getVersion = function() {
			return ionic.Platform.version();
	}
	
	var download = function(id : string, title : string, downloadId : string) {        			
        if (!ready) return;
                    
        var url : string = abookBaseUrl + downloadId + ".zip";
        
        // File name only
        var filename : string = url.split("/").pop();
                
        // Add item to the queue
        var downloadItem : DownloadItem = {
            id : id,
            downloadId : downloadId,
            title: title,
            url : url,
            path : workingDir,
            filename : filename,
            progress : 0,
            downloadStatus : 'Pendiente de descarga',
            errorCode : 0,
            transfer : null,
            status : ""
        }
        
        // push item into the download queue
        downloads.push(downloadItem);
        
        // Register item in abooks-index.json		
        SvcMyABooks.addUpdateBook(downloadItem);

        // process item
        processDownloadQueue();
	}
	
	var cancel = function(id : string) {
		var cancelDownload = getDownloadInfo(id);
		
		if (cancelDownload)
		{
			// abort transfer if it's in progress
			if (cancelDownload.transfer) {
				cancelDownload.transfer.abort();
			} 
			else {
				SvcMyABooks.deleteBook(cancelDownload.id);
	
				downloads.splice(getDownloadIndex(cancelDownload.id), 1);
				cancelDownload.downloadStatus = 'Cancelada la descarga';
				$rootScope.$broadcast('cancelled', cancelDownload);
				
				processDownloadQueue();
			}
		}
	}
	
	var getDownloadInfo = function(id : string) {
		if (downloads) {
			for (var i=0; i<downloads.length; i++) {
				if (downloads[i].id===id) {
					return downloads[i];
				}
			}
		}
	}
	
	var getDownloadIndex = function(id : string) {
		if (downloads) {
			for (var i=0; i<downloads.length; i++) {
				if (downloads[i].id===id) {
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