/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    NuevaLuz.STATUS_PENDING = "pending";
    NuevaLuz.STATUS_DOWNLOADING = "downloading";
    NuevaLuz.STATUS_DOWNLOADED = "downloaded";
    NuevaLuz.STATUS_INSTALLING = "installing";
    NuevaLuz.STATUS_CANCELLED = "cancelled";
    NuevaLuz.STATUS_ERROR = "error";
    NuevaLuz.STATUS_COMPLETED = "completed";
    var DownloadService = (function () {
        function DownloadService($rootScope, $interval, $cordovaFile, $q, myABooksSvc, $http, sessionSvc) {
            var _this = this;
            this.ready = false;
            this.downloads = [];
            this.targetFolder = "";
            this.tmpFolder = "";
            this.sourceZip = "";
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.cordovaFile = $cordovaFile;
            this.myABooksSvc = myABooksSvc;
            this.q = $q;
            this.http = $http;
            this.sessionSvc = sessionSvc;
            // Check when device is ready to be used...
            ionic.Platform.ready(function () {
                _this.ready = true;
            });
            // broadcast download status every 1 sec
            this.interval(function () {
                if (_this.downloads.length > 0) {
                    _this.downloads.forEach(function (item) {
                        _this.rootScope.$broadcast(item.statusKey, item);
                    });
                }
            }, 1000);
        }
        DownloadService.prototype.getNextDownloadItem = function () {
            if (this.downloads.length > 0) {
                for (var i = 0; i < this.downloads.length; i++) {
                    if (this.downloads[i].statusKey === NuevaLuz.STATUS_PENDING) {
                        return this.downloads[i];
                    }
                    else if (this.downloads[i].statusKey === NuevaLuz.STATUS_DOWNLOADING ||
                        this.downloads[i].statusKey === NuevaLuz.STATUS_INSTALLING) {
                        return null;
                    }
                }
                return null;
            }
            else {
                return null;
            }
        };
        DownloadService.prototype.processDownloadQueue = function () {
            var _this = this;
            // Get next item to download
            var currentDownload = this.getNextDownloadItem();
            // Check that is not downloading and are still pending downloads
            if (!currentDownload) {
                return;
            }
            // Instantiate new FileTransfer object
            currentDownload.transfer = new FileTransfer();
            currentDownload.transfer.onprogress = function (event) {
                if (event.lengthComputable) {
                    currentDownload.progress = (event.loaded / event.total) * 100;
                    currentDownload.statusKey = NuevaLuz.STATUS_DOWNLOADING;
                    currentDownload.statusDescription = Math.floor(currentDownload.progress) + '% descargado...';
                    _this.rootScope.$emit(NuevaLuz.STATUS_DOWNLOADING, currentDownload);
                }
            };
            // Prepare downloading status
            currentDownload.progress = 0;
            currentDownload.statusKey = NuevaLuz.STATUS_DOWNLOADING;
            currentDownload.statusDescription = "0% descargado...";
            this.myABooksSvc.addUpdateBook(currentDownload);
            this.myABooksSvc.updateABooksFile()
                .then(function () {
                _this.rootScope.$emit(NuevaLuz.STATUS_DOWNLOADING, currentDownload);
                currentDownload.transfer.download(currentDownload.url, currentDownload.path + currentDownload.filename, function (entry) {
                    // Notify downloaded
                    currentDownload.progress = 100;
                    currentDownload.statusDescription = 'Descarga completada';
                    currentDownload.statusKey = NuevaLuz.STATUS_DOWNLOADED;
                    _this.rootScope.$broadcast(NuevaLuz.STATUS_DOWNLOADED, currentDownload);
                    // Save my audio books list
                    _this.myABooksSvc.addUpdateBook(currentDownload);
                    _this.myABooksSvc.updateABooksFile()
                        .then(function () {
                        // Unzip file
                        _this.unzip(currentDownload.id, function (result) {
                            if (result != -1) {
                                // Delete .zip
                                _this.cordovaFile.removeFile(NuevaLuz.workingDir, _this.sourceZip);
                                // Create target dir
                                var res = _this.cordovaFile.createDir(NuevaLuz.workingDir, '/' + _this.targetFolder + '/', true);
                                var callback = _this.q.defer();
                                // Read files from tmp folder to move them to target dir
                                window.resolveLocalFileSystemURI(NuevaLuz.workingDir + _this.tmpFolder, function (entry) {
                                    _this.addFileEntry(entry, callback);
                                    callback.promise.then(function (result) {
                                        if (result == 0) {
                                            // Register download
                                            _this.http({
                                                method: 'GET',
                                                url: NuevaLuz.baseUrl + 'RegisterDownload?Session=' + _this.sessionSvc.getSession() + '&IdAudio=' + currentDownload.id
                                            })
                                                .then(function (response) {
                                                currentDownload.statusDescription = "";
                                                currentDownload.statusKey = NuevaLuz.STATUS_COMPLETED;
                                                _this.rootScope.$broadcast(NuevaLuz.STATUS_COMPLETED, currentDownload);
                                                _this.myABooksSvc.addUpdateBook(currentDownload);
                                                _this.myABooksSvc.updateABooksFile()
                                                    .then(function () {
                                                    // Delete from download list
                                                    _this.downloads.splice(_this.getDownloadIndex(currentDownload.id), 1);
                                                    // go for next item to process...
                                                    _this.processDownloadQueue();
                                                });
                                            }, function (reason) {
                                                currentDownload.statusDescription = 'Error registrando descarga';
                                                currentDownload.statusKey = NuevaLuz.STATUS_ERROR;
                                                _this.rootScope.$broadcast(NuevaLuz.STATUS_ERROR, currentDownload);
                                                _this.myABooksSvc.addUpdateBook(currentDownload);
                                                _this.myABooksSvc.updateABooksFile()
                                                    .then(function () {
                                                    // go for next item to process...
                                                    _this.processDownloadQueue();
                                                });
                                            });
                                        }
                                        else {
                                            currentDownload.statusDescription = 'Error moviendo audio libro';
                                            currentDownload.statusKey = NuevaLuz.STATUS_ERROR;
                                            _this.rootScope.$broadcast(NuevaLuz.STATUS_ERROR, currentDownload);
                                            _this.myABooksSvc.addUpdateBook(currentDownload);
                                            _this.myABooksSvc.updateABooksFile()
                                                .then(function () {
                                                // go for next item to process...
                                                _this.processDownloadQueue();
                                            });
                                        }
                                    });
                                }, function (error) {
                                    currentDownload.statusDescription = "Error preparando audio libro";
                                    currentDownload.statusKey = NuevaLuz.STATUS_ERROR;
                                    _this.rootScope.$broadcast(NuevaLuz.STATUS_ERROR, currentDownload);
                                    _this.myABooksSvc.addUpdateBook(currentDownload);
                                    _this.myABooksSvc.updateABooksFile()
                                        .then(function () {
                                        // go for next item to process...
                                        _this.processDownloadQueue();
                                    });
                                });
                            }
                            else {
                                currentDownload.statusDescription = "Error instalando audio libro";
                                currentDownload.statusKey = NuevaLuz.STATUS_ERROR;
                                _this.rootScope.$broadcast(NuevaLuz.STATUS_ERROR, currentDownload);
                                _this.myABooksSvc.addUpdateBook(currentDownload);
                                _this.myABooksSvc.updateABooksFile()
                                    .then(function () {
                                    // go for next item to process...
                                    _this.processDownloadQueue();
                                });
                            }
                        }, function (item) {
                            currentDownload.progress = Math.round((item.loaded / item.total) * 100);
                            currentDownload.statusDescription = currentDownload.progress + "% instalado...";
                            currentDownload.statusKey = NuevaLuz.STATUS_INSTALLING;
                            _this.rootScope.$broadcast(NuevaLuz.STATUS_INSTALLING, currentDownload);
                        });
                    });
                }, function (error) {
                    currentDownload.errorCode = error.code;
                    console.log(error);
                    // Delete .zip
                    switch (error.code) {
                        case FileTransferError.FILE_NOT_FOUND_ERR:
                            currentDownload.statusDescription = 'Audio libro no encontrado';
                            currentDownload.statusKey = NuevaLuz.STATUS_ERROR;
                            _this.rootScope.$broadcast(NuevaLuz.STATUS_ERROR, currentDownload);
                            break;
                        case FileTransferError.INVALID_URL_ERR:
                            currentDownload.statusDescription = 'URL incorrecta';
                            currentDownload.statusKey = NuevaLuz.STATUS_ERROR;
                            _this.rootScope.$broadcast(NuevaLuz.STATUS_ERROR, currentDownload);
                            break;
                        case FileTransferError.CONNECTION_ERR:
                            currentDownload.statusDescription = 'Error en la conexión';
                            currentDownload.statusKey = NuevaLuz.STATUS_ERROR;
                            _this.rootScope.$broadcast(NuevaLuz.STATUS_ERROR, currentDownload);
                            break;
                        case FileTransferError.ABORT_ERR:
                            currentDownload.statusDescription = 'Cancelada la descarga';
                            currentDownload.statusKey = NuevaLuz.STATUS_CANCELLED;
                            _this.rootScope.$broadcast(NuevaLuz.STATUS_CANCELLED, currentDownload);
                            break;
                        case FileTransferError.NOT_MODIFIED_ERR:
                            currentDownload.statusDescription = 'Error en archivo local descargdo';
                            currentDownload.statusKey = NuevaLuz.STATUS_ERROR;
                            _this.rootScope.$broadcast(NuevaLuz.STATUS_ERROR, currentDownload);
                            break;
                    }
                    // go for next item to process...
                    _this.processDownloadQueue();
                });
            });
        };
        DownloadService.prototype.addFileEntry = function (entry, callback) {
            var _this = this;
            var dirReader = entry.createReader();
            dirReader.readEntries(function (entries) {
                var i = 0;
                for (i = 0; i < entries.length; i++) {
                    if (entries[i].isDirectory === true) {
                        // Recursive -- calback into this subdirectory
                        _this.addFileEntry(entries[i], callback);
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
                                callback.resolve(0);
                            }
                        }, function (error) {
                            // clean tmp folder in case of error
                            _this.cordovaFile.removeRecursively(NuevaLuz.workingDir, _this.tmpFolder);
                            callback.resolve(-1);
                        });
                    }
                }
            });
        };
        DownloadService.prototype.unzip = function (downloadId, sucessCallback, progressCallback) {
            // Generate tmp folder
            var d = new Date();
            this.tmpFolder = '/' + d.getTime().toString() + '/';
            // Source file and target folder using id with left padding
            this.targetFolder = downloadId;
            this.sourceZip = '/' + this.targetFolder + '.zip';
            // Unzip
            zip.unzip(NuevaLuz.workingDir + this.sourceZip, NuevaLuz.workingDir + this.tmpFolder, function (result) {
                sucessCallback(result);
            }, function (progress) {
                progressCallback(progress);
            });
        };
        DownloadService.prototype.getPlatform = function () {
            return ionic.Platform.platform();
        };
        DownloadService.prototype.getVersion = function () {
            return ionic.Platform.version();
        };
        DownloadService.prototype.getDownloadItem = function (id) {
            if (this.downloads) {
                for (var i = 0; i < this.downloads.length; i++) {
                    if (this.downloads[i].id == id) {
                        return this.downloads[i];
                    }
                }
            }
            return null;
        };
        DownloadService.prototype.download = function (id, title) {
            var _this = this;
            if (!this.ready)
                return;
            var url = NuevaLuz.abookBaseUrl + id + ".zip";
            // File name only
            var filename = url.split("/").pop();
            // Add item to the queue
            var downloadItem = {
                id: id,
                title: title,
                url: url,
                path: NuevaLuz.workingDir,
                filename: filename,
                progress: 0,
                statusDescription: 'Pendiente de descarga',
                errorCode: 0,
                transfer: null,
                statusKey: NuevaLuz.STATUS_PENDING
            };
            // push item into the download queue
            this.downloads.push(downloadItem);
            // Register item in abooks-index.json		
            this.myABooksSvc.addUpdateBook(downloadItem);
            this.myABooksSvc.updateABooksFile()
                .then(function () {
                // process item
                _this.processDownloadQueue();
            });
        };
        DownloadService.prototype.cancel = function (id) {
            var _this = this;
            var cancelDownload = this.getDownloadInfo(id);
            if (cancelDownload) {
                // abort transfer if it's in progress
                if (cancelDownload.transfer) {
                    cancelDownload.transfer.abort();
                }
                this.downloads.splice(this.getDownloadIndex(cancelDownload.id), 1);
                this.myABooksSvc.deleteBook(cancelDownload.id)
                    .then(function () {
                    // Process the next one in the queue if canceled was not in pending status
                    if (cancelDownload.statusKey != NuevaLuz.STATUS_PENDING) {
                        _this.processDownloadQueue();
                    }
                });
            }
        };
        DownloadService.prototype.getDownloadInfo = function (id) {
            if (this.downloads) {
                for (var i = 0; i < this.downloads.length; i++) {
                    if (this.downloads[i].id === id) {
                        return this.downloads[i];
                    }
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
;
