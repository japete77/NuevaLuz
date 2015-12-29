/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
/// <reference path="svc-download.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    // export interface IMyABooksScope extends ng.IScope {
    //     control : MyABooksService;
    // }
    var MyABooksService = (function () {
        // abooksIndexFilename : string = "abooks-index.json";
        // scope : IMyABooksScope;
        // abooks = new Array<AudioBook>();
        // ready : boolean = false;
        // cordovaFile : any;
        function MyABooksService($scope) {
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
        MyABooksService.prototype.updateABooksFile = function () {
            // if (this.ready) {
            //     this.cordovaFile.writeFile(workingDir, this.abooksIndexFilename, JSON.stringify(this.abooks), true)
            //         .then(function (success : any) {				
            //         }, 
            //         function (error : any) {
            //             console.log(error);
            //         });
            // }
        };
        MyABooksService.prototype.getABookIndex = function (id) {
            // if (this.abooks) {
            //     for (var i=0; i<this.abooks.length; i++) {
            //         if (this.abooks[i].id==id) {
            //             return i;
            //         }
            //     }
            // }
            // return -1;
        };
        MyABooksService.prototype.existsABook = function (id) {
            // if (this.abooks) {
            //     for (var i=0; i<this.abooks.length; i++) {
            //         if (this.abooks[i].id==id) {
            //             return true;
            //         }
            //     }
            // }
            // return false;
            return false;
        };
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
        MyABooksService.prototype.deleteBook = function (id) {
            // this.abooks.splice(this.getABookIndex(id), 1);	
            // this.updateABooksFile();
        };
        MyABooksService.prototype.getBooks = function (callback) {
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
        };
        return MyABooksService;
    })();
    NuevaLuz.MyABooksService = MyABooksService;
})(NuevaLuz || (NuevaLuz = {}));
