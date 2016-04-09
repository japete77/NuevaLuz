/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ControllerBase = (function () {
        function ControllerBase($scope, SessionSvc, $ionicHistory, $location) {
            this.SessionSvc = SessionSvc;
            this.ionicHistory = $ionicHistory;
            this.location = $location;
            this.scope = $scope;
            this.scope.control = this;
        }
        ControllerBase.prototype.isBookLoaded = function () {
            return this.SessionSvc.getCurrentBook() != null && this.SessionSvc.getCurrentBook() != undefined;
        };
        ControllerBase.prototype.getCurrentBookId = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().id;
            }
            else {
                return "";
            }
        };
        ControllerBase.prototype.getCurrentBookTitle = function () {
            if (this.isBookLoaded()) {
                return this.SessionSvc.getCurrentBook().title;
            }
            else {
                return "";
            }
        };
        ControllerBase.prototype.goCurrentBook = function () {
            if (this.isBookLoaded()) {
                this.location.path("/myabooks/player/" + this.SessionSvc.getCurrentBook().id);
            }
        };
        ControllerBase.prototype.goBack = function () {
            this.ionicHistory.goBack();
        };
        ControllerBase.prototype.getViewName = function () {
            if (this.ionicHistory.viewHistory() && this.ionicHistory.viewHistory().currentView) {
                return this.ionicHistory.viewHistory().currentView.stateName;
            }
            else {
                return "";
            }
        };
        ControllerBase.prototype.showGoHome = function () {
            if (this.ionicHistory.viewHistory() && this.ionicHistory.viewHistory().currentView) {
                return this.ionicHistory.viewHistory().currentView.url.split("/").length > 3;
            }
            else {
                return false;
            }
        };
        ControllerBase.prototype.hasBackView = function () {
            return (this.ionicHistory.viewHistory().backView != null);
        };
        ControllerBase.prototype.goHome = function () {
            this.location.path("#/");
            this.ionicHistory.clearHistory();
        };
        return ControllerBase;
    })();
    NuevaLuz.ControllerBase = ControllerBase;
})(NuevaLuz || (NuevaLuz = {}));
;
