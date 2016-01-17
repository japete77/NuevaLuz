/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksScope extends ng.IScope {
        control : ABooksController;
        abooks : Array<AudioBook>;
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
            
            this.scope.abooks = new Array<AudioBook>();
            this.scope.abooks.push({ id:"", statusKey:"", title:""});
            
            // Retrieve all my audio books
            this.myABooksSvc.getBooks((response : Array<AudioBook>) => {
                this.scope.abooks = response;
            });
        }
        
        getLink(id : string) {
            var index : number = this.getABookIndex(id);
            if (index>=0) {
                if (this.scope.abooks[index].statusKey==STATUS_COMPLETED) {
                    return '#/myabooks/player/' + id;
                }
                else {
                    return '#/abooks/menu/detail/' + id;	
                }
            }
        } 
            
        getABookIndex(id) : number {
            if (this.scope.abooks!=null) {
                for (var i=0; i<this.scope.abooks.length; i++) {
                    if (this.scope.abooks[i].id==id) return i;
                }
            }
            return -1;
        }
        
        isShowable(id : string) : boolean {
            var index : number = this.getABookIndex(id);
            if (index>=0) {
                return this.scope.abooks[index].statusKey==STATUS_DOWNLOADING ||
                       this.scope.abooks[index].statusKey==STATUS_INSTALLING ||
                       this.scope.abooks[index].statusKey==STATUS_COMPLETED;
            }
            false;
        }
        
        isProgressing(id : string) : boolean {
            var index : number = this.getABookIndex(id);
            if (index>=0) {
                return this.scope.abooks[index].statusKey==STATUS_DOWNLOADING ||
                       this.scope.abooks[index].statusKey==STATUS_INSTALLING;
            }
            false;
        }
        
        isCompleted(id : string) : boolean {
            var index : number = this.getABookIndex(id);
            if (index>=0) {
                return this.scope.abooks[index].statusKey==STATUS_COMPLETED;
            }
            false;
        }  
    }

}