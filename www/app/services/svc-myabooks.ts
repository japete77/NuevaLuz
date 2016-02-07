/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
/// <reference path="svc-download.ts" />

module NuevaLuz {
    
    export class MyABooksService {
        
        abooksIndexFilename : string = "abooks-index.json";
        abooks = new Array<AudioBook>();
        ready : boolean = false;
        cordovaFile : ngCordova.IFileService;
        q : ng.IQService;

        constructor($cordovaFile : ngCordova.IFileService, $q : ng.IQService) {
            
            this.cordovaFile = $cordovaFile;
            this.q = $q;

            ionic.Platform.ready(() => {
                this.ready = true;

                // Load my audio books
                this.getBooks((abooks : Array<AudioBook>) => { 
                    this.abooks = abooks; 
                    
                    // Remove all unconsistent books
                    this.abooks.forEach((item : AudioBook, index : number, object : Array<AudioBook>) => {
                        if (item.statusKey!=STATUS_COMPLETED) {
                            object.splice(index, 1);                        
                        }
                    });

                    this.updateABooksFile();
                });                
            });
        }

        updateABooksFile() : ng.IPromise<{}> {
            var q = this.q.defer();
            
            if (this.ready) {
                this.cordovaFile.writeFile(cordova.file.dataDirectory, this.abooksIndexFilename, JSON.stringify(this.abooks), true)
                    .then((success : any) => {
                        q.resolve();	
                    },
                    (error : any) => {
                        console.log(error);
                        q.reject();
                    });
            }
            
            return q.promise;
        }
        
        getABookIndex(id : string) : number {
            if (this.abooks) {
                for (var i=0; i<this.abooks.length; i++) {
                    if (this.abooks[i].id==id) {
                        return i;
                    }
                }
            }
            return -1;
        }
        
        existsABook(id : string) : boolean {
            if (this.abooks) {
                for (var i=0; i<this.abooks.length; i++) {
                    if (this.abooks[i].id==id) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        addUpdateBook(book : DownloadItem) {
            
            var index = this.getABookIndex(book.id); 
            if (index<0) {
                this.abooks.push({
                    id: book.id,
                    title: book.title,
                    statusKey: book.statusKey
                });                
            }
            else {
                // update book status
                this.abooks[index].statusKey = book.statusKey;	
            }            
        }
        
        deleteBook(id : string) : ng.IPromise<{}> {
            var q = this.q.defer();
            
            this.cordovaFile.removeFile(workingDir, id + ".zip");
            this.cordovaFile.removeRecursively(workingDir, id);
            this.abooks.splice(this.getABookIndex(id), 1);	
            this.updateABooksFile()
            .then(() => {
                q.resolve(); 
            });                
            
            return q.promise;
        }
        
        getBooks(callback : (response : Array<AudioBook>) => any) {
            if (this.ready) {
                this.cordovaFile.checkFile(cordova.file.dataDirectory, this.abooksIndexFilename)
                .then((success) => {
                    this.cordovaFile.readAsText(cordova.file.dataDirectory, this.abooksIndexFilename)
                    .then((result : string) => {
                        this.abooks = JSON.parse(result);
                        callback(this.abooks);
                    },
                    (error) => {
                        console.log(error);
                    });
                }, 
                (error) => {
                    this.cordovaFile.createFile(cordova.file.dataDirectory, this.abooksIndexFilename, true);
                    console.log(error);
                });
            }
        }
    }

};