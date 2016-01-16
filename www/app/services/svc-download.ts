/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />

module NuevaLuz {
    
    declare var zip : any;
    
    declare interface IUnzipEvent {
        loaded : number;
        total : number;
    }
    
    export var STATUS_PENDING : string = "pending";
    export var STATUS_DOWNLOADING : string = "downloading";
    export var STATUS_DOWNLOADED : string = "downloaded";
    export var STATUS_INSTALLING : string = "installing";
    export var STATUS_CANCELLED : string = "cancelled";
    export var STATUS_ERROR : string = "error";
    export var STATUS_COMPLETED : string = "completed";
        
    export class DownloadService {
        private rootScope : ng.IScope;
        private interval : ng.IIntervalService;
        private cordovaFile : ngCordova.IFileService;
        private myABooksSvc : MyABooksService;
        private q : ng.IQService;
        private http : ng.IHttpService;
        private sessionSvc : SessionService;
           
        ready : boolean = false;
        downloads : Array<DownloadItem> = [];
        targetFolder : string = "";
        tmpFolder : string = "";
        sourceZip : string = "";

        
        constructor($rootScope : ng.IScope, $interval : ng.IIntervalService, 
            $cordovaFile : ngCordova.IFileService, $q : ng.IQService, myABooksSvc : MyABooksService,
            $http : ng.IHttpService, sessionSvc : SessionService) {
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.cordovaFile = $cordovaFile;
            this.myABooksSvc = myABooksSvc;
            this.q = $q;
            this.http = $http;
            this.sessionSvc = sessionSvc;
            
            // Check when device is ready to be used...
            ionic.Platform.ready(() => {
                this.ready = true;
            });
                
            // broadcast download status every 1 sec
            this.interval(() => {
                if (this.downloads.length>0) {
                    this.downloads.forEach((item : DownloadItem) => {
                        this.rootScope.$broadcast(item.statusKey, item);				
                    });
                }
            }, 1000);
        }
        
        private getNextDownloadItem() : DownloadItem {
            if (this.downloads.length>0) {
                for (var i =0; i<this.downloads.length; i++) {
                    if (this.downloads[i].statusKey===STATUS_PENDING) {
                        return this.downloads[i];
                    } else if (this.downloads[i].statusKey===STATUS_DOWNLOADING ||
                        this.downloads[i].statusKey===STATUS_INSTALLING) {
                        return null;
                    }
                }
                return null;
            }
            else {
                return null;
            }
        }
        
        private processDownloadQueue() {
            
            // Get next item to download
            var currentDownload : DownloadItem = this.getNextDownloadItem();
            
            // Check that is not downloading and are still pending downloads
            if (!currentDownload) {
                return;
            }
                    
            // Instantiate new FileTransfer object
            currentDownload.transfer = new FileTransfer();
            currentDownload.transfer.onprogress = (event : ProgressEvent) => {
                    if (event.lengthComputable) {
                        currentDownload.progress = (event.loaded / event.total) * 100;
                        currentDownload.statusKey = STATUS_DOWNLOADING;
                        currentDownload.statusDescription = Math.floor(currentDownload.progress) + '% descargado...';
                        this.rootScope.$emit(STATUS_DOWNLOADING, currentDownload);
                    }
                };
           
           // Prepare downloading status
           currentDownload.progress = 0;
           currentDownload.statusKey = STATUS_DOWNLOADING;
           currentDownload.statusDescription = "0% descargado...";
           this.myABooksSvc.addUpdateBook(currentDownload);
           this.myABooksSvc.updateABooksFile()
           .then(() => {
                this.rootScope.$emit(STATUS_DOWNLOADING, currentDownload);

                currentDownload.transfer.download(currentDownload.url, currentDownload.path + currentDownload.filename, 
                (entry : FileEntry) => {
                    // Notify downloaded
                    currentDownload.progress = 100;
                    currentDownload.statusDescription = 'Descarga completada';
                    currentDownload.statusKey = STATUS_DOWNLOADED;
                    this.rootScope.$broadcast(STATUS_DOWNLOADED, currentDownload);
                    
                    // Save my audio books list
                    this.myABooksSvc.addUpdateBook(currentDownload);
                    this.myABooksSvc.updateABooksFile()
                    .then(() => {
                        
                        // Unzip file
                        this.unzip(currentDownload.id, 
                            (result : number) => {
                                if (result!=-1) {
                                    
                                    // Delete .zip
                                    this.cordovaFile.removeFile(workingDir, this.sourceZip);

                                    // Create target dir
                                    var res = this.cordovaFile.createDir(workingDir, '/' + this.targetFolder + '/', true);
                                                    
                                    var callback = this.q.defer<number>();
                                    
                                    // Read files from tmp folder to move them to target dir
                                    window.resolveLocalFileSystemURI(
                                        workingDir + this.tmpFolder, 
                                        (entry : DirectoryEntry) => { 
                                            this.addFileEntry(entry, callback);
                                            
                                            callback.promise.then((result : number ) => {
                                                if (result==0) {
                                                    // Register download
                                                    this.http({
                                                        method: 'GET',
                                                        url: baseUrl + 'RegisterDownload?Session=' + this.sessionSvc.getSession() + '&IdAudio=' + currentDownload.id
                                                    })
                                                    .then((response : any) => {
                                                        currentDownload.statusDescription = "";
                                                        currentDownload.statusKey = STATUS_COMPLETED;
                                                        this.rootScope.$broadcast(STATUS_COMPLETED, currentDownload);
                                                        
                                                        this.myABooksSvc.addUpdateBook(currentDownload);
                                                        this.myABooksSvc.updateABooksFile()
                                                        .then(() => {
                                                            
                                                            // Delete from download list
                                                            this.downloads.splice(this.getDownloadIndex(currentDownload.id), 1);
                                                            
                                                            // go for next item to process...
                                                            this.processDownloadQueue();
                                                        });                                                    
                                                    },
                                                    (reason : any) => {
                                                        currentDownload.statusDescription = 'Error registrando descarga';
                                                        currentDownload.statusKey = STATUS_ERROR;
                                                        this.rootScope.$broadcast(STATUS_ERROR, currentDownload);
                                                        
                                                        this.myABooksSvc.addUpdateBook(currentDownload);
                                                        this.myABooksSvc.updateABooksFile()
                                                        .then(() => {
                                                            // go for next item to process...
                                                            this.processDownloadQueue();  
                                                        });                                                        
                                                    })                                                    
                                                }
                                                else {
                                                    currentDownload.statusDescription = 'Error moviendo audio libro';
                                                    currentDownload.statusKey = STATUS_ERROR;
                                                    this.rootScope.$broadcast(STATUS_ERROR, currentDownload);
                                                    
                                                    this.myABooksSvc.addUpdateBook(currentDownload);
                                                    this.myABooksSvc.updateABooksFile()
                                                    .then(() => {
                                                        // go for next item to process...
                                                        this.processDownloadQueue();  
                                                    });                                             
                                                }
                                            });
                                        },
                                        (error : any) => {
                                            currentDownload.statusDescription = "Error preparando audio libro";										
                                            currentDownload.statusKey = STATUS_ERROR;
                                            this.rootScope.$broadcast(STATUS_ERROR, currentDownload);
                                            
                                            this.myABooksSvc.addUpdateBook(currentDownload);
                                            this.myABooksSvc.updateABooksFile()
                                            .then(() => {
                                                // go for next item to process...
                                                this.processDownloadQueue();  
                                            });                                              
                                        }
                                    );					
                                }
                                else {
                                    currentDownload.statusDescription = "Error instalando audio libro";										
                                    currentDownload.statusKey = STATUS_ERROR;
                                    this.rootScope.$broadcast(STATUS_ERROR, currentDownload);
                                    
                                    this.myABooksSvc.addUpdateBook(currentDownload);
                                    this.myABooksSvc.updateABooksFile()
                                    .then(() => {
                                        // go for next item to process...
                                        this.processDownloadQueue();
                                    });
                                }    
                            },
                            (item : IUnzipEvent) => {
                                currentDownload.progress = Math.round((item.loaded / item.total) * 100);
                                currentDownload.statusDescription = currentDownload.progress + "% instalado...";
                                currentDownload.statusKey = STATUS_INSTALLING;                                
                                this.rootScope.$broadcast(STATUS_INSTALLING, currentDownload);
                            });
                            
                    });
                    
                }, (error : FileTransferError) => {			
                    
                    currentDownload.errorCode = error.code;
                    console.log(error);
                    
                    // Delete .zip
                    switch (error.code) {
                        case FileTransferError.FILE_NOT_FOUND_ERR:
                            currentDownload.statusDescription = 'Audio libro no encontrado';
                            currentDownload.statusKey = STATUS_ERROR;
                            this.rootScope.$broadcast(STATUS_ERROR, currentDownload);
                            break;
                        case FileTransferError.INVALID_URL_ERR:
                            currentDownload.statusDescription = 'URL incorrecta';
                            currentDownload.statusKey = STATUS_ERROR;
                            this.rootScope.$broadcast(STATUS_ERROR, currentDownload);
                            break;
                        case FileTransferError.CONNECTION_ERR:
                            currentDownload.statusDescription = 'Error en la conexión';
                            currentDownload.statusKey = STATUS_ERROR;
                            this.rootScope.$broadcast(STATUS_ERROR, currentDownload);
                            break;
                        case FileTransferError.ABORT_ERR:
                            currentDownload.statusDescription = 'Cancelada la descarga';
                            currentDownload.statusKey = STATUS_CANCELLED;
                            this.rootScope.$broadcast(STATUS_CANCELLED, currentDownload);
                            break;
                        case FileTransferError.NOT_MODIFIED_ERR:
                            currentDownload.statusDescription = 'Error en archivo local descargdo';
                            currentDownload.statusKey = STATUS_ERROR;
                            this.rootScope.$broadcast(STATUS_ERROR, currentDownload);
                            break;
                    }                        

                    // go for next item to process...
                    this.processDownloadQueue();    
                    
                });
           });
        }
                
        addFileEntry(entry : DirectoryEntry, callback : ng.IDeferred<number>) {
            var dirReader = entry.createReader();       
            dirReader.readEntries((entries : DirectoryEntry[]) => {
                    var i : number = 0;
                    for (i = 0; i < entries.length; i++) {
                        if (entries[i].isDirectory === true) {
                            // Recursive -- calback into this subdirectory
                            this.addFileEntry(entries[i], callback);
                        } else {
                            var r : RegExp = /[^\/]*$/;
                            var sourcePath : string = entries[i].fullPath.replace(r,'');
                            var filename : string = entries[i].name;
                            this.cordovaFile.moveFile(workingDir + sourcePath, filename, 
                                workingDir + '/' + this.targetFolder + '/', filename)
                                .then((success : any) => {
                                    // Delete tmp folder at the end...
                                    if (i==entries.length) {
                                        this.cordovaFile.removeRecursively(workingDir, this.tmpFolder);
                                        callback.resolve(0);
                                    }
                                },
                                (error : any) => {
                                    // clean tmp folder in case of error
                                    this.cordovaFile.removeRecursively(workingDir, this.tmpFolder);
                                    callback.resolve(-1);
                                }
                            );
                        }
                    }			
                }
            );
        }
        
        private unzip(downloadId : string, sucessCallback : (result : number) => any, progressCallback : (progressEvent : IUnzipEvent) => any) {
            
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
                (result : number) => {
                    sucessCallback(result);
                },
                (progress : IUnzipEvent) => {
                    progressCallback(progress);
                }
            );
        }
        
        private getPlatform() {
            return ionic.Platform.platform();
        }
        
        private getVersion() {
            return ionic.Platform.version();
        }
        
        getDownloadItem(id : string) {
            if (this.downloads) {
                for (var i=0; i<this.downloads.length; i++) {
                    if (this.downloads[i].id==id) {
                        return this.downloads[i];
                    }
                }
            }
            return null;
        }
        
        download(id : string, title : string) {  
                  			
            if (!this.ready) return;
            
            var url : string = abookBaseUrl + id + ".zip";
            
            // File name only
            var filename : string = url.split("/").pop();
                    
            // Add item to the queue
            var downloadItem : DownloadItem = {
                id : id,
                title: title,
                url : url,
                path : workingDir,
                filename : filename,
                progress : 0,
                statusDescription : 'Pendiente de descarga',
                errorCode : 0,
                transfer : null,
                statusKey : STATUS_PENDING
            }
            
            // push item into the download queue
            this.downloads.push(downloadItem);
            
            // Register item in abooks-index.json		
            this.myABooksSvc.addUpdateBook(downloadItem);
            this.myABooksSvc.updateABooksFile()
            .then(() => {
                // process item
                this.processDownloadQueue();                
            });
        }
        
        cancel(id : string) {
            var cancelDownload = this.getDownloadInfo(id);
            
            if (cancelDownload)
            {
                // abort transfer if it's in progress
                if (cancelDownload.transfer) {
                    cancelDownload.transfer.abort();
                } 

                this.downloads.splice(this.getDownloadIndex(cancelDownload.id), 1);
                this.myABooksSvc.deleteBook(cancelDownload.id)
                .then(() => {
                    // Process the next one in the queue if canceled was not in pending status
                    if (cancelDownload.statusKey!=STATUS_PENDING) {                
                        this.processDownloadQueue();                
                    }                    
                });
            }
        }
        
        private getDownloadInfo(id : string) {
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