/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var DownloadService = (function () {
        function DownloadService($rootScope, $interval, $cordovaFile, myABooksSvc) {
            this.ready = false;
            this.downloads = [];
            this.targetFolder = "";
            this.tmpFolder = "";
            this.sourceZip = "";
            this.getPlatform = function () {
                return ionic.Platform.platform();
            };
            this.getVersion = function () {
                return ionic.Platform.version();
            };
            this.download = function (id, title, downloadId) {
                if (!this.ready)
                    return;
                var url = NuevaLuz.abookBaseUrl + downloadId + ".zip";
                // File name only
                var filename = url.split("/").pop();
                // Add item to the queue
                var downloadItem = {
                    id: id,
                    downloadId: downloadId,
                    title: title,
                    url: url,
                    path: NuevaLuz.workingDir,
                    filename: filename,
                    progress: 0,
                    downloadStatus: 'Pendiente de descarga',
                    errorCode: 0,
                    transfer: null,
                    status: ""
                };
                // push item into the download queue
                this.downloads.push(downloadItem);
                // Register item in abooks-index.json		
                this.myABooksSvc.addUpdateBook(downloadItem);
                // process item
                this.processDownloadQueue();
            };
            this.getDownloadInfo = function (id) {
                if (this.downloads) {
                    for (var i = 0; i < this.downloads.length; i++) {
                        if (this.downloads[i].id === id) {
                            return this.downloads[i];
                        }
                    }
                }
            };
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.cordovaFile = $cordovaFile;
            this.myABooksSvc = myABooksSvc;
            var _this = this;
            // Check when device is ready to be used...
            ionic.Platform.ready(function () {
                _this.ready = true;
            });
            // broadcast download status every 1 sec
            this.interval(function () {
                if (_this.downloads.length > 0) {
                    _this.downloads.forEach(function (item) {
                        _this.rootScope.$broadcast('downloading', item);
                    });
                }
            }, 1000);
        }
        DownloadService.prototype.processDownloadQueue = function () {
            var _this = this;
            // Check that is not downloading and are still pending downloads
            if (this.downloads.length == 0 || this.downloads[0].transfer) {
                return;
            }
            // Get next item to download
            var currentDownload = this.downloads[0];
            // Instantiate new FileTransfer object
            currentDownload.transfer = new FileTransfer();
            currentDownload.transfer.onprogress = function (event) {
                if (event.lengthComputable) {
                    currentDownload.progress = (event.loaded / event.total) * 100;
                    currentDownload.downloadStatus = Math.floor(currentDownload.progress) + '% descargado...';
                }
            };
            currentDownload.transfer.download(currentDownload.url, currentDownload.path + currentDownload.filename, function (entry) {
                // Notify downloaded
                currentDownload.status = 'Descarga completada';
                _this.rootScope.$broadcast('downloaded', currentDownload);
                // Save my audio books list
                _this.myABooksSvc.addUpdateBook(currentDownload);
                // remove item from download list
                _this.downloads.splice(_this.getDownloadIndex(currentDownload.id), 1);
                // Unzip file
                _this.unzip(currentDownload.downloadId);
            }, function (error) {
                currentDownload.errorCode = error.code;
                console.log(error);
                // Delete .zip
                switch (error.code) {
                    case FileTransferError.FILE_NOT_FOUND_ERR:
                        currentDownload.downloadStatus = 'Audio libro no encontrado';
                        _this.rootScope.$broadcast('error', currentDownload);
                        break;
                    case FileTransferError.INVALID_URL_ERR:
                        currentDownload.downloadStatus = 'URL incorrecta';
                        _this.rootScope.$broadcast('error', currentDownload);
                        break;
                    case FileTransferError.CONNECTION_ERR:
                        currentDownload.downloadStatus = 'Error en la conexión';
                        _this.rootScope.$broadcast('error', currentDownload);
                        break;
                    case FileTransferError.ABORT_ERR:
                        currentDownload.downloadStatus = 'Cancelada la descarga';
                        _this.rootScope.$broadcast('cancelled', currentDownload);
                        break;
                    case FileTransferError.NOT_MODIFIED_ERR:
                        currentDownload.downloadStatus = 'Error en archivo local descargdo';
                        _this.rootScope.$broadcast('error', currentDownload);
                        break;
                }
                // Delete book from list
                _this.myABooksSvc.deleteBook(currentDownload.id);
                // Delete from download list
                _this.downloads.splice(_this.getDownloadIndex(currentDownload.id), 1);
                // go for next item to process...
                _this.processDownloadQueue();
            });
        };
        DownloadService.prototype.addFileEntry = function (entry) {
            var _this = this;
            var dirReader = entry.createReader();
            dirReader.readEntries(function (entries) {
                var i = 0;
                for (i = 0; i < entries.length; i++) {
                    if (entries[i].isDirectory === true) {
                        // Recursive -- calback into this subdirectory
                        _this.addFileEntry(entries[i]);
                    }
                    else {
                        var r = /[^\/]*$/;
                        var sourcePath = entries[i].fullPath.replace(r, '');
                        var filename = entries[i].name;
                        _this.cordovaFile.moveFile(NuevaLuz.workingDir + sourcePath, filename, NuevaLuz.workingDir + '/' + _this.targetFolder + '/', filename)
                            .then(function (success) {
                            // Delete tmp folder at the end...
                            if (i == entries.length) {
                                _this.cordovaFile.removeRecursively(NuevaLuz.workingDir, _this.tmpFolder);
                            }
                        }, function (error) {
                            // clean tmp folder in case of error
                            _this.cordovaFile.removeRecursively(NuevaLuz.workingDir, _this.tmpFolder);
                        });
                    }
                }
            });
        };
        DownloadService.prototype.unzip = function (downloadId) {
            var _this = this;
            // Generate tmp folder
            var d = new Date();
            this.tmpFolder = '/' + d.getTime().toString() + '/';
            // Source file and target folder using id with left padding
            this.targetFolder = downloadId;
            this.sourceZip = '/' + this.targetFolder + '.zip';
            // Unzip
            zip.unzip(NuevaLuz.workingDir + this.sourceZip, NuevaLuz.workingDir + this.tmpFolder, function (result) {
                if (result > -1) {
                    // Delete .zip
                    _this.cordovaFile.removeFile(NuevaLuz.workingDir, _this.sourceZip);
                    // Create target dir
                    var res = _this.cordovaFile.createDir(NuevaLuz.workingDir, '/' + _this.targetFolder + '/', true);
                    // Read files from tmp folder to move them to target dir
                    window.resolveLocalFileSystemURI(NuevaLuz.workingDir + _this.tmpFolder, function (entry) { _this.addFileEntry(entry); }, function (error) {
                        alert(error);
                        _this.processDownloadQueue();
                    });
                }
                else {
                    alert('Unzip Error!');
                    _this.processDownloadQueue();
                }
            }, function (progress) {
            });
        };
        DownloadService.prototype.cancel = function (id) {
            var cancelDownload = this.getDownloadInfo(id);
            if (cancelDownload) {
                // abort transfer if it's in progress
                if (cancelDownload.transfer) {
                    cancelDownload.transfer.abort();
                }
                else {
                    this.myABooksSvc.deleteBook(cancelDownload.id);
                    this.downloads.splice(this.getDownloadIndex(cancelDownload.id), 1);
                    cancelDownload.downloadStatus = 'Cancelada la descarga';
                    this.rootScope.$broadcast('cancelled', cancelDownload);
                    this.processDownloadQueue();
                }
            }
        };
        DownloadService.prototype.getDownloadIndex = function (id) {
            if (this.downloads) {
                for (var i = 0; i < this.downloads.length; i++) {
                    if (this.downloads[i].id === id) {
                        return i;
                    }
                }
            }
        };
        return DownloadService;
    })();
    NuevaLuz.DownloadService = DownloadService;
})(NuevaLuz || (NuevaLuz = {}));
