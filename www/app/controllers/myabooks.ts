/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksScope {
        control : ABooksController;
        abooks : any;
    }
    
    export class ABooksController {
        scope : IABooksScope;
        timeout : ng.ITimeoutService;
        http : ng.IHttpService;
        myABooksSvc : MyABooksService;
    
        constructor($scope : IABooksScope, $timeout : ng.ITimeoutService, $http : ng.IHttpService, myAbooksSvc : MyABooksService) {
            this.scope = $scope;
            this.scope.control = this;
            this.timeout = $timeout;
            this.http = $http;
            this.myABooksSvc = myAbooksSvc;
            
            var _this = this;
            
            // Retrieve all my audio books
            this.myABooksSvc.getBooks(function(response) {
                _this.scope.abooks = response.data;
            });
        }
        
        getLink(id : string) {
            var index : number = this.getABookIndex(id);
            if (index>=0) {
                if (this.scope.abooks[index].status=='downloaded') {
                    return '#/myabooks/player/' + id;
                }
                else if (this.scope.abooks[index].status=='downloading') {
                    return '#/abooks/menu/detail/' + id;	
                }
            }
        } 
            
        getABookIndex(id) {
            if (this.scope.abooks!=null) {
                for (var i=0; i<this.scope.abooks.length; i++) {
                    if (this.scope.abooks[i].id==id) return i;
                }
            }
            return -1;
        }  
    }

}