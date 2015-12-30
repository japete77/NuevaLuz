/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />

module NuevaLuz {
    
    declare var zip : any;
    
    export interface IDownloadScope {
        control : DownloadService;
    }
    
    export class DownloadService {
        scope : IDownloadScope;
        rootScope : ng.IScope;
        interval : ng.IIntervalService;
        cordovaFile : any;
        myABooksSvc : MyABooksService;
           
        ready : boolean = false;
        downloads : Array<DownloadItem> = [];
        targetFolder : string = "";
        tmpFolder : string = "";
        sourceZip : string = "";

        
        constructor($scope : IDownloadScope, $rootScope : ng.IScope, $interval : ng.IIntervalService, $cordovaFile : any, myABooksSvc : MyABooksService) {
            this.scope = $scope;
            this.scope.control = this;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.cordovaFile = $cordovaFile;
            this.myABooksSvc = myABooksSvc;
            
            var _this = this;
            
            // Check when device is ready to be used...
            ionic.Platform.ready(() => {
                _this.ready = true;

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
            this.interval(() => {
                if (_this.downloads.length>0) {
                    _this.downloads.forEach(function(item : DownloadItem) {
                        _this.rootScope.$broadcast('downloading', item);				
                    });
                }
            }, 1000);
        }
        
        
        private processDownloadQueue() {
            var _this = this;
            
            // Check that is not downloading and are still pending downloads
            if (this.downloads.length==0 || this.downloads[0].transfer) {
                return;
            }
            
            // Get next item to download
            var currentDownload : DownloadItem = this.downloads[0];
                    
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
                    _this.rootScope.$broadcast('downloaded', currentDownload);
                    
                    // Save my audio books list
                    //_this.myABooksSvc.addUpdateBook(currentDownload);

                    // remove item from download list
                    _this.downloads.splice(this.getDownloadIndex(currentDownload.id), 1);

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
        }
                
        private addFileEntry(entry : DirectoryEntry) {	
            var _this = this;	
            var dirReader = entry.createReader();       
            dirReader.readEntries(
                function (entries : DirectoryEntry[]) {
                    var i : number = 0;
                    for (i = 0; i < entries.length; i++) {
                        if (entries[i].isDirectory === true) {
                            // Recursive -- call back into this subdirectory
                            this.addFileEntry(entries[i]);
                        } else {
                            var r : RegExp = /[^\/]*$/;
                            var sourcePath : string = entries[i].fullPath.replace(r,'');
                            var filename : string = entries[i].name;
                            this.cordovaFile.moveFile(workingDir + sourcePath, filename, 
                                workingDir + '/' + this.rootScope.targetFolder + '/', filename)
                                .then(function (success) {
                                    // Delete tmp folder at the end...
                                    if (i==entries.length) {
                                        _this.cordovaFile.removeRecursively(workingDir, _this.tmpFolder);
                                    }
                                },
                                function (error) {
                                    // clean tmp folder in case of error
                                    this.cordovaFile.removeRecursively(workingDir, _this.tmpFolder);
                                }
                            );
                        }
                    }			
                }
            );
        }
        
        private unzip(downloadId : string) {
            var _this = this;
            
            // Generate tmp folder
            var d = new Date();
            this.tmpFolder = '/' + d.getTime().toString() + '/';
            
            // Source file and target folder using id with left padding
            this.targetFolder = downloadId;
            this.sourceZip = '/' +  this.targetFolder + '.zip';
            
            // Unzip
            zip.unzip(
                workingDir + this.sourceZip, 
                workingDir + this.tmpFolder, 
                function(result) {
                    if (result>-1) {
                        // Delete .zip
                        _this.cordovaFile.removeFile(workingDir, _this.sourceZip);

                        // Create target dir
                        var res = _this.cordovaFile.createDir(workingDir, '/' + _this.targetFolder + '/', true);
                                        
                        // Read files from tmp folder to move them to target dir
                        window.resolveLocalFileSystemURI(
                            workingDir + _this.tmpFolder, 
                            _this.addFileEntry,
                            function(error) {
                                alert(error);
                                _this.processDownloadQueue();							
                            }
                        );					
                    }
                    else {										
                        alert('Unzip Error!');
                        _this.processDownloadQueue();
                    }
                },
                function (progress) {
                }
            );
        }
        
        private getPlatform = function() {
            return ionic.Platform.platform();
        }
        
        private getVersion = function() {
            return ionic.Platform.version();
        }
        
        public download = function(id : string, title : string, downloadId : string) {  
                  			
            if (!this.ready) return;
                        
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
            this.downloads.push(downloadItem);
            
            // Register item in abooks-index.json		
            this.myABooksSvc.addUpdateBook(downloadItem);

            // process item
            this.processDownloadQueue();
        }
        
        public cancel(id : string) {
            var cancelDownload = this.getDownloadInfo(id);
            
            if (cancelDownload)
            {
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
        }
        
        private getDownloadInfo = function(id : string) {
            if (this.downloads) {
                for (var i=0; i<this.downloads.length; i++) {
                    if (this.downloads[i].id===id) {
                        return this.downloads[i];
                    }
                }
            }
        }
        
        private getDownloadIndex(id : string) {
            if (this.downloads) {
                for (var i=0; i<this.downloads.length; i++) {
                    if (this.downloads[i].id===id) {
                        return i;
                    }
                }
            }
        }
    }
    
}