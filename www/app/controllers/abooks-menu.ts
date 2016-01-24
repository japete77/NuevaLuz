/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface IABooksMenuScope extends ng.IScope {
        control : ABooksMenuController;
        ready : boolean;
    }
    
    export class ABooksMenuController {
        private scope : IABooksMenuScope;
        private SessionSvc : SessionService;
        private location : ng.ILocationService;  
        private ionicLoading : ionic.loading.IonicLoadingService;  
        private timeout : ng.ITimeoutService;    
        
        constructor($scope : IABooksMenuScope, SessionSvc : SessionService, 
            $location : ng.ILocationService, ionicLoading : ionic.loading.IonicLoadingService,
            $timeout : ng.ITimeoutService) {
            
            this.scope = $scope;
            this.scope.ready = false;
            this.SessionSvc = SessionSvc;
            this.location = $location;
            this.ionicLoading = ionicLoading;
            this.timeout = $timeout;
            
            this.timeout(() => {
                this.ionicLoading.show({
                    template: 'Verificando credenciales...'
                });
            }, 0)

            this.SessionSvc.isSessionValid()
            .then((result : number) => {
                this.scope.ready = true;
            })
            .catch((reason : any) => {
                this.location.path("/login");
            })
            .finally(() => {
                this.timeout(() => {
                    this.ionicLoading.hide();
                }, 0); 
            });
        }
        
        isBookLoaded() : boolean {
            return this.SessionSvc.getCurrentBook()!=null && this.SessionSvc.getCurrentBook()!=undefined;
        }
        
        getCurrentBookId() : string {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        }
        
        getCurrentBookTitle() : string {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        }
                
    }
    
};