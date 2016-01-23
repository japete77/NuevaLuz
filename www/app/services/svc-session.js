/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    NuevaLuz.LOGIN_OK = 0;
    NuevaLuz.LOGIN_FAILED = 1;
    NuevaLuz.SERVICE_UNAVAILABLE = 2;
    NuevaLuz.abooksSatusFilename = "status.json";
    NuevaLuz.HTTP_NOT_FOUND = 404;
    NuevaLuz.HTTP_NOT_ALLOWED = 405;
    var SessionInfo = (function () {
        function SessionInfo() {
        }
        return SessionInfo;
    })();
    NuevaLuz.SessionInfo = SessionInfo;
    var SessionService = (function () {
        function SessionService($http, $q, $cordovaFile) {
            var _this = this;
            this.http = $http;
            this.q = $q;
            this.cordovaFile = $cordovaFile;
            ionic.Platform.ready(function () {
                _this.loadSessionInfo().then(function () {
                }, function (error) {
                    _this.sessionInfo = new SessionInfo();
                    _this.sessionInfo.session = "";
                    _this.sessionInfo.currentBook = null;
                });
            });
        }
        SessionService.prototype.login = function (username, password) {
            var _this = this;
            var defer = this.q.defer();
            this.sessionInfo.username = username;
            this.sessionInfo.password = password;
            this.http({
                method: 'GET',
                url: NuevaLuz.baseUrl + 'Login?Username=' + username + '&Password=' + password
            })
                .then(function (response) {
                if (response.data.LoginResult.Success) {
                    _this.sessionInfo.session = response.data.LoginResult.Session;
                    defer.resolve(_this.sessionInfo);
                }
                else {
                    defer.reject("Acceso denegado");
                }
            }, function (response) {
                defer.reject("Biblioteca de audio libros fuera de servicio");
            });
            return defer.promise;
        };
        SessionService.prototype.getSession = function () {
            return this.sessionInfo.session;
        };
        SessionService.prototype.isAuthenticated = function () {
            return this.sessionInfo.session !== "";
        };
        SessionService.prototype.isSessionValid = function () {
            var _this = this;
            var defer = this.q.defer();
            this.http({
                method: 'GET',
                url: NuevaLuz.baseUrl + 'GetTitles?Session=' + this.sessionInfo.session + '&Index=1&Count=1'
            })
                .then(function (response) {
                if (response.data.GetTitlesResult) {
                    defer.resolve(NuevaLuz.LOGIN_OK);
                }
            }, function (response) {
                if (response.status === NuevaLuz.HTTP_NOT_FOUND) {
                    defer.reject(NuevaLuz.SERVICE_UNAVAILABLE);
                }
                else if (response.status === NuevaLuz.HTTP_NOT_ALLOWED) {
                    // Invalid session...try to login again
                    _this.http({
                        method: 'GET',
                        url: NuevaLuz.baseUrl + 'Login?Username=' + _this.sessionInfo.username + '&Password=' + _this.sessionInfo.password
                    })
                        .then(function (response) {
                        if (response.data.LoginResult.Success) {
                            _this.sessionInfo.session = response.data.LoginResult.Session;
                            _this.saveSessionInfo()
                                .finally(function () {
                                defer.resolve(NuevaLuz.LOGIN_OK);
                            });
                        }
                        else {
                            defer.reject(NuevaLuz.LOGIN_FAILED);
                        }
                    }, function (response) {
                        defer.reject(NuevaLuz.SERVICE_UNAVAILABLE);
                    });
                }
                else {
                    defer.reject(NuevaLuz.SERVICE_UNAVAILABLE);
                }
            });
            return defer.promise;
        };
        SessionService.prototype.saveSessionInfo = function () {
            var defer = this.q.defer();
            this.cordovaFile.writeFile(NuevaLuz.workingDir, NuevaLuz.abooksSatusFilename, JSON.stringify(this.sessionInfo), true)
                .then(function (success) {
                defer.resolve(true);
            }, function (error) {
                console.log(error);
                defer.reject(false);
            });
            return defer.promise;
        };
        SessionService.prototype.loadSessionInfo = function () {
            var _this = this;
            var defer = this.q.defer();
            this.cordovaFile.readAsBinaryString(NuevaLuz.workingDir, NuevaLuz.abooksSatusFilename)
                .then(function (result) {
                _this.sessionInfo = JSON.parse(result);
                defer.resolve(true);
            }, function (error) {
                console.log(error);
                defer.reject(false);
            });
            return defer.promise;
        };
        SessionService.prototype.clearSessionInfo = function () {
            this.sessionInfo.username = "";
            this.sessionInfo.password = "";
            this.sessionInfo.session = "";
            return this.saveSessionInfo();
        };
        SessionService.prototype.setCurrentBook = function (abook) {
            this.sessionInfo.currentBook = abook;
        };
        SessionService.prototype.getCurrentBook = function () {
            return this.sessionInfo.currentBook;
        };
        return SessionService;
    })();
    NuevaLuz.SessionService = SessionService;
})(NuevaLuz || (NuevaLuz = {}));
