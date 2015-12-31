/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
/// <reference path="svc-download.ts" />

module NuevaLuz {
    
    export class MyABooksService {
        
        abooksIndexFilename : string = "abooks-index.json";
        abooks = new Array<AudioBook>();
        ready : boolean = false;
        cordovaFile : ngCordova.IFileService;

        constructor($cordovaFile : ngCordova.IFileService) {
            
            this.cordovaFile = $cordovaFile;

            ionic.Platform.ready(() => {
                this.ready = true;

                // Load my audio books
                this.getBooks((abooks : Array<AudioBook>) => { this.abooks = abooks; })
            })

        }

        updateABooksFile() {
            if (this.ready) {
                this.cordovaFile.writeFile(workingDir, this.abooksIndexFilename, JSON.stringify(this.abooks), true)
                    .then((success : any) => {				
                    },
                    (error : any) => {
                        console.log(error);
                    });
            }
        }
        
        getABookIndex(id : string) {
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
                    status: book.progress<100?'downloading':'downloaded'
                });
                
                // Create audio book info file			
            }
            else {
                // update book status
                this.abooks[index].status = book.progress<100?'downloading':'downloaded';	
            }
            this.updateABooksFile();			
        }
        
        deleteBook(id : string) {
            this.abooks.splice(this.getABookIndex(id), 1);	
            this.updateABooksFile();
        }
        
        getBooks(callback) {            
            if (this.ready) {
                this.cordovaFile.checkFile(workingDir, this.abooksIndexFilename)
                .then((success) => {
                    this.cordovaFile.readAsText(workingDir, this.abooksIndexFilename)
                    .then((result : any) => {
                        this.abooks = JSON.parse(result);
                        callback(this.abooks);
                    },
                    (error) => {
                        console.log(error);
                    });
                }, 
                (error) => {
                    this.cordovaFile.createFile(workingDir, this.abooksIndexFilename, true);
                    console.log(error);
                });
            }
        }
    }

}