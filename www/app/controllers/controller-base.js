/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ControllerBase = (function () {
        function ControllerBase(SessionSvc) {
            this.SessionSvc = SessionSvc;
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
        return ControllerBase;
    })();
    NuevaLuz.ControllerBase = ControllerBase;
})(NuevaLuz || (NuevaLuz = {}));
