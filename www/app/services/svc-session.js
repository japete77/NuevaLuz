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
            this.sessionInfo = new SessionInfo();
            this.sessionInfo.session = "";
            this.sessionInfo.currentBook = null;
            this.sessionInfo.workingDir = null;
            this.sessionInfo.playDir = null;
            ionic.Platform.ready(function () {
                if (ionic.Platform.isAndroid()) {
                    NuevaLuz.internalStorage = cordova.file.dataDirectory;
                    NuevaLuz.externalStorage = cordova.file.externalDataDirectory;
                    // Check for external SD storage
                    var ps = [];
                    for (var i = 0; i < NuevaLuz.extStorageBase.length; i++) {
                        ps.push($cordovaFile.checkDir(NuevaLuz.extStorageBase[i], NuevaLuz.extStorageDirs[i]));
                    }
                    ps.forEach(function (item) {
                        item.then(function (dir) {
                            // Create a subdir in external storage 2
                            $cordovaFile.createDir(dir.toURL(), "NuevaLuz")
                                .then(function (dir) {
                                NuevaLuz.externalStorage2 = dir.toURL();
                                _this.loadSessionInfo();
                            })
                                ['finally'](function () {
                                NuevaLuz.externalStorage2 = dir.toURL() + "NuevaLuz/";
                                _this.loadSessionInfo();
                            });
                        });
                    });
                    NuevaLuz.appleDevice = false;
                }
                else {
                    NuevaLuz.workingDir = cordova.file.documentsDirectory;
                    NuevaLuz.playDir = "documents:/";
                    NuevaLuz.appleDevice = true;
                    _this.sessionInfo.workingDir = NuevaLuz.workingDir;
                    _this.sessionInfo.playDir = NuevaLuz.playDir;
                }
                _this.loadSessionInfo();
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
                                ['finally'](function () {
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
            this.cordovaFile.writeFile(cordova.file.dataDirectory, NuevaLuz.abooksSatusFilename, JSON.stringify(this.sessionInfo), true)
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
            this.cordovaFile.readAsBinaryString(cordova.file.dataDirectory, NuevaLuz.abooksSatusFilename)
                .then(function (result) {
                _this.sessionInfo = JSON.parse(result);
                defer.resolve(true);
            }, function (error) {
                console.log(error);
                defer.reject(false);
            })
                ['finally'](function () {
                NuevaLuz.workingDir = _this.sessionInfo.workingDir;
                NuevaLuz.playDir = _this.sessionInfo.playDir;
                console.log("NLUZ FROMFILE WD: " + NuevaLuz.workingDir + ", PD: " + NuevaLuz.playDir);
                if (!_this.sessionInfo.workingDir) {
                    if (ionic.Platform.isAndroid()) {
                        if (NuevaLuz.externalStorage2) {
                            NuevaLuz.workingDir = NuevaLuz.externalStorage2;
                            NuevaLuz.playDir = NuevaLuz.externalStorage2;
                        }
                        else if (NuevaLuz.externalStorage) {
                            NuevaLuz.workingDir = NuevaLuz.externalStorage;
                            NuevaLuz.playDir = NuevaLuz.externalStorage;
                        }
                        else {
                            NuevaLuz.workingDir = NuevaLuz.internalStorage;
                            NuevaLuz.playDir = NuevaLuz.internalStorage;
                        }
                        _this.sessionInfo.workingDir = NuevaLuz.workingDir;
                        _this.sessionInfo.playDir = NuevaLuz.playDir;
                    }
                    else {
                        NuevaLuz.workingDir = _this.sessionInfo.workingDir;
                        NuevaLuz.playDir = _this.sessionInfo.playDir;
                    }
                    console.log("NLUZ WD: " + NuevaLuz.workingDir + ", PD: " + NuevaLuz.playDir);
                }
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
        SessionService.prototype.deleteCurrentBook = function (id) {
            if (this.sessionInfo.currentBook.id === id) {
                this.sessionInfo.currentBook = null;
                this.saveSessionInfo();
            }
        };
        SessionService.prototype.copy2SD = function (id) {
            return this.cordovaFile.copyDir(cordova.file.dataDirectory, id, cordova.file.externalDataDirectory, id);
        };
        SessionService.prototype.copy2Phone = function (id) {
            return this.cordovaFile.copyDir(cordova.file.externalDataDirectory, id, cordova.file.dataDirectory, id);
        };
        return SessionService;
    })();
    NuevaLuz.SessionService = SessionService;
})(NuevaLuz || (NuevaLuz = {}));
;
