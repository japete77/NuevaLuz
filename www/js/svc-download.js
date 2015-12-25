/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/ionic/ionic.d.ts" />
/// <reference path="../../typings/cordova/plugins/FileTransfer.d.ts" />
/// <reference path="app.ts" />
var abookBaseUrl = "http://bibliasbraille.com/ClubLibro/";
var workingDir = "";
app.service('SvcDownload', ['$rootScope', '$interval', '$cordovaFile', 'SvcMyABooks',
    function ($rootScope, $interval, $cordovaFile, SvcMyABooks) {
        var ready = false;
        var downloads = [];
        // Check when device is ready to be used...
        ionic.Platform.ready(function () {
            ready = true;
        });
        document.addEventListener('deviceready', function () {
            ready = true;
            var deviceType = (navigator.userAgent.match(/iPad/i)).toString() === "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i)).toString() === "iPhone" ? "iPhone" : "Android";
            switch (deviceType) {
                case "iPad":
                case "iPhone":
                    workingDir = cordova.file.documentsDirectory;
                    break;
                default:
                    workingDir = cordova.file.dataDirectory;
                    break;
            }
        });
        // broadcast download status every 1 sec
        $interval(function () {
            if (downloads.length > 0) {
                downloads.forEach(function (item) {
                    console.log(item);
                    $rootScope.$broadcast('downloading', item);
                });
            }
        }, 1000);
        var processDownloadQueue = function () {
            // Check that is not downloading and are still pending downloads
            if (downloads.length == 0 || downloads[0].transfer) {
                return;
            }
            // Get next item to download
            var currentDownload = downloads[0];
            // Instantiate new FileTransfer object
            currentDownload.transfer = new FileTransfer();
            currentDownload.transfer.onprogress = function (progressEvent) {
                if (progressEvent.lengthComputable) {
                    currentDownload.progress = (progressEvent.loaded / progressEvent.total) * 100;
                    currentDownload.downloadStatus = Math.floor(currentDownload.progress) + '% descargado...';
                }
            };
            currentDownload.transfer.download(currentDownload.url, currentDownload.path + currentDownload.filename, function (entry) {
                // Notify downloaded
                currentDownload.status = 'Descarga completada';
                $rootScope.$broadcast('downloaded', currentDownload);
                // Save my audio books list
                SvcMyABooks.addUpdateBook(currentDownload);
                // remove item from download list
                downloads.splice(getDownloadIndex(currentDownload.id), 1);
                // Unzip file
                Unzip(currentDownload.id);
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
        };
        $rootScope.targetFolder = '';
        $rootScope.tmpFolder = '';
        $rootScope.sourceZip = '';
        function addFileEntry(entry) {
            var dirReader = entry.createReader();
            dirReader.readEntries(function (entries) {
                var i = 0;
                for (i = 0; i < entries.length; i++) {
                    if (entries[i].isDirectory === true) {
                        // Recursive -- call back into this subdirectory
                        addFileEntry(entries[i]);
                    }
                    else {
                        var r = /[^\/]*$/;
                        var sourcePath = entries[i].fullPath.replace(r, '');
                        var filename = entries[i].name;
                        $cordovaFile.moveFile(workingDir + sourcePath, filename, workingDir + '/' + $rootScope.targetFolder + '/', filename)
                            .then(function (success) {
                            // Delete tmp folder at the end...
                            if (i == entries.length) {
                                $cordovaFile.removeRecursively(workingDir, $rootScope.tmpFolder);
                            }
                        }, function (error) {
                            // clean tmp folder in case of error
                            $cordovaFile.removeRecursively(workingDir, $rootScope.tmpFolder);
                        });
                    }
                }
            });
        }
        var Unzip = function (id) {
            // Generate tmp folder
            var d = new Date();
            $rootScope.tmpFolder = '/' + d.getTime().toString() + '/';
            // Source file and target folder using id with left padding
            var pad = "0000";
            $rootScope.targetFolder = pad.substring(0, pad.length - id.toString().length) + id;
            $rootScope.sourceZip = '/' + $rootScope.targetFolder + '.zip';
            // Unzip
            zip.unzip(workingDir + $rootScope.sourceZip, workingDir + $rootScope.tmpFolder, function (result) {
                if (result > -1) {
                    // Delete .zip
                    $cordovaFile.removeFile(workingDir, $rootScope.sourceZip);
                    // Create target dir
                    var res = $cordovaFile.createDir(workingDir, '/' + $rootScope.targetFolder + '/', true);
                    // Read files from tmp folder to move them to target dir
                    window.resolveLocalFileSystemURI(workingDir + $rootScope.tmpFolder, addFileEntry, function (error) {
                        alert(error);
                        processDownloadQueue();
                    });
                }
                else {
                    alert('Unzip Error!');
                    processDownloadQueue();
                }
            }, function (progress) {
            });
        };
        var getPlatform = function () {
            return ionic.Platform.platform();
        };
        var getVersion = function () {
            return ionic.Platform.version();
        };
        var download = function (id, title) {
            if (!ready)
                return;
            // File for download (left padding with zeros)
            var pad = "0000";
            var url = abookBaseUrl + pad.substring(0, pad.length - id.toString().length) + id + ".zip";
            // File name only
            var filename = url.split("/").pop();
            // Add item to the queue
            var downloadItem = {
                id: id,
                title: title,
                url: url,
                path: workingDir,
                filename: filename,
                progress: 0,
                downloadStatus: 'Pendiente de descarga',
                errorCode: 0,
                transfer: null
            };
            // push item into the download queue
            downloads.push(downloadItem);
            // Register item in abooks-index.json		
            SvcMyABooks.addUpdateBook(downloadItem);
            // process item
            processDownloadQueue();
        };
        var cancel = function (id) {
            var cancelDownload = getDownloadInfo(id);
            if (cancelDownload) {
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
        };
        var getDownloadInfo = function (id) {
            if (downloads) {
                for (var i = 0; i < downloads.length; i++) {
                    if (downloads[i].id == id) {
                        return downloads[i];
                    }
                }
            }
        };
        var getDownloadIndex = function (id) {
            if (downloads) {
                for (var i = 0; i < downloads.length; i++) {
                    if (downloads[i].id == id) {
                        return i;
                    }
                }
            }
        };
        return {
            download: download,
            cancel: cancel
        };
    }]);
