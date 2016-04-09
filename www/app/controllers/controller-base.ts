/// <reference path="../app.ts" />

module NuevaLuz {
    export interface IBaseScope extends ng.IScope {
        control : ControllerBase;
    }
    
    export class ControllerBase {
        protected SessionSvc : SessionService;
        private scope : IBaseScope;
        private ionicHistory : ionic.navigation.IonicHistoryService;
        private location : ng.ILocationService;
        
        constructor($scope: IBaseScope, SessionSvc : SessionService, $ionicHistory : ionic.navigation.IonicHistoryService, $location : ng.ILocationService) {
            this.SessionSvc = SessionSvc;
            this.ionicHistory = $ionicHistory;
            this.location = $location;
            this.scope = $scope;
            this.scope.control = this;
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
        
        goCurrentBook() {
            if (this.isBookLoaded()) {
                this.location.path("/myabooks/player/" + this.SessionSvc.getCurrentBook().id);
            }
        }
        
        goBack() {
            this.ionicHistory.goBack();
        }
        
        getViewName() : string {
            if (this.ionicHistory.viewHistory() && this.ionicHistory.viewHistory().currentView) {
                return this.ionicHistory.viewHistory().currentView.stateName;
            }
            else {
                return "";
            }
        }
        
        showGoHome() : boolean {
            if (this.ionicHistory.viewHistory() && this.ionicHistory.viewHistory().currentView) {
                return this.ionicHistory.viewHistory().currentView.url.split("/").length>3;
            }
            else {
                return false;
            }
        }
        
        hasBackView() : boolean {
            return (this.ionicHistory.viewHistory().backView!=null);
        }
        
        goHome() {
            this.location.path("#/");
            this.ionicHistory.clearHistory();
        }
    }
};