/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
/// <reference path="svc-download.ts" />

module NuevaLuz {
    
    // export interface IMyABooksScope extends ng.IScope {
    //     control : MyABooksService;
    // }
    
    export class MyABooksService {
        
        // abooksIndexFilename : string = "abooks-index.json";
        // scope : IMyABooksScope;
        // abooks = new Array<AudioBook>();
        // ready : boolean = false;
        // cordovaFile : any;

        constructor($scope : ng.IScope) {
//             this.scope = $scope;
//             this.scope.control = this;
//             
//             var _control = this;
// 
//             ionic.Platform.ready(() => {
//                 _control.ready = true;
// 
//                 // Load my audio books
//                 _control.getBooks((abooks : Array<AudioBook>) => {})
//             })

        }

        updateABooksFile() {
            // if (this.ready) {
            //     this.cordovaFile.writeFile(workingDir, this.abooksIndexFilename, JSON.stringify(this.abooks), true)
            //         .then(function (success : any) {				
            //         }, 
            //         function (error : any) {
            //             console.log(error);
            //         });
            // }
        }
        
        getABookIndex(id : string) {
            // if (this.abooks) {
            //     for (var i=0; i<this.abooks.length; i++) {
            //         if (this.abooks[i].id==id) {
            //             return i;
            //         }
            //     }
            // }
            // return -1;
        }
        
        existsABook(id : string) : boolean {
            // if (this.abooks) {
            //     for (var i=0; i<this.abooks.length; i++) {
            //         if (this.abooks[i].id==id) {
            //             return true;
            //         }
            //     }
            // }
            // return false;
            return false;
        }
        
        // addUpdateBook(book : DownloadItem) {
        //     // var index = this.getABookIndex(book.id); 
        //     // if (index<0) {
        //     //     this.abooks.push({
        //     //         id: book.id,
        //     //         title: book.title,
        //     //         status: book.progress<100?'downloading':'downloaded'
        //     //     });
        //     //     
        //     //     // Create audio book info file			
        //     // }
        //     // else {
        //     //     // update book status
        //     //     this.abooks[index].status = book.progress<100?'downloading':'downloaded';	
        //     // }
        //     // this.updateABooksFile();			
        // }
        
        deleteBook(id : string) {
            // this.abooks.splice(this.getABookIndex(id), 1);	
            // this.updateABooksFile();
        }
        
        getBooks(callback) {
            // var _control = this;
            //     
            // if (this.ready) {
            //     this.cordovaFile.checkFile(workingDir, this.abooksIndexFilename)
            //     .then(function (success) {
            //         _control.cordovaFile.readAsText(workingDir, _control.abooksIndexFilename)
            //         .then(function(result : any) {
            //             _control.abooks = JSON.parse(result);
            //             callback(_control.abooks);
            //         },
            //         function(error) {
            //             console.log(error);
            //         });
            //     }, 
            //     function (error) {
            //         _control.cordovaFile.createFile(workingDir, _control.abooksIndexFilename, true);
            //         console.log(error);
            //     });
            // }
        }
    }

}