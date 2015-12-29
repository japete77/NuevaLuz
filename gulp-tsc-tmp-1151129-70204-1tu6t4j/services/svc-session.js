/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var SessionService = (function () {
        function SessionService() {
            this.session = "";
        }
        SessionService.prototype.getSession = function () {
            return this.session;
        };
        SessionService.prototype.setSession = function (session) {
            this.session = session;
        };
        return SessionService;
    })();
    NuevaLuz.SessionService = SessionService;
})(NuevaLuz || (NuevaLuz = {}));
