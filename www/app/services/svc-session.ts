/// <reference path="../app.ts" />

module NuevaLuz {
    export var LOGIN_OK : number = 0;
    export var LOGIN_FAILED : number = 1;
    export var SERVICE_UNAVAILABLE : number = 2;
    export var abooksSatusFilename : string = "status.json";
    
    export var HTTP_NOT_FOUND = 404;
    export var HTTP_NOT_ALLOWED = 405;
    
    export class SessionInfo {
        username : string;
        password : string;
        session : string;
        currentBook : AudioBook;
        workingDir : string;
        playDir : string;
    }
    
    export class SessionService {
        
        private sessionInfo : SessionInfo;
        private http : ng.IHttpService;
        private q : ng.IQService;
        private cordovaFile : ngCordova.IFileService;

        constructor($http : ng.IHttpService, $q : ng.IQService, $cordovaFile : ngCordova.IFileService) {
            this.http = $http;   
            this.q = $q;
            this.cordovaFile = $cordovaFile;
            
            this.sessionInfo = new SessionInfo();
            this.sessionInfo.session = "";
            this.sessionInfo.currentBook = null;   
            this.sessionInfo.workingDir = null;
            this.sessionInfo.playDir = null;             

            ionic.Platform.ready(() => {
                
                if (ionic.Platform.isAndroid()) {
                
                    internalStorage = cordova.file.dataDirectory;
                    externalStorage = cordova.file.externalDataDirectory;

                    // Check for external SD storage
                    var ps : ngCordova.IFilePromise<DirectoryEntry>[] = [];
                    for (var i=0; i<extStorageBase.length; i++) {
                        ps.push($cordovaFile.checkDir(extStorageBase[i], extStorageDirs[i]));
                    }
                    ps.forEach((item: ngCordova.IFilePromise<DirectoryEntry>) => {
                        item.then((dir: DirectoryEntry) => {
                            // Create a subdir in external storage 2
                            $cordovaFile.createDir(dir.toURL(), "NuevaLuz")
                            .then((dir: DirectoryEntry) => {
                                externalStorage2 = dir.toURL();
                                this.loadSessionInfo();
                            })
                            .finally(() => {
                                externalStorage2 = dir.toURL() + "NuevaLuz/";
                                this.loadSessionInfo();
                            });
                        });
                    });
                                        
                    appleDevice = false;
                }
                else {
                    workingDir = cordova.file.documentsDirectory;
                    playDir = "documents:/";
                    appleDevice = true;    
                    this.sessionInfo.workingDir = workingDir;
                    this.sessionInfo.playDir = playDir;                         
                }
                
                this.loadSessionInfo();
                
            });
        }
        
        public login(username : string, password : string) : ng.IPromise<SessionInfo> {
            
            var defer = this.q.defer<SessionInfo>();
            
            this.sessionInfo.username = username;
            this.sessionInfo.password = password;
            
            this.http({
                method: 'GET',
                url: baseUrl + 'Login?Username=' + username + '&Password=' + password
            })
            .then((response : any) => {
                if (response.data.LoginResult.Success) {
                    this.sessionInfo.session = response.data.LoginResult.Session;
                    defer.resolve(this.sessionInfo);            
                }
                else {
                    defer.reject("Acceso denegado");
                }            
            },
            (response) => {
                defer.reject("Biblioteca de audio libros fuera de servicio");
            })
            
            return defer.promise;
        }
        
        public getSession() : string {
            return this.sessionInfo.session;
        }
        
        public isAuthenticated() : boolean {
            return this.sessionInfo.session!=="";
        }
        
        public isSessionValid() : ng.IPromise<number> {
            
            var defer = this.q.defer<number>();
            
            this.http({
                method: 'GET',
                url: baseUrl + 'GetTitles?Session=' + this.sessionInfo.session + '&Index=1&Count=1'
            })
            .then((response : any) => {
                if (response.data.GetTitlesResult) {
                    defer.resolve(LOGIN_OK);
                }
            },
            (response : any) => {
                if (response.status===HTTP_NOT_FOUND) {
                    defer.reject(SERVICE_UNAVAILABLE);                    
                }
                else if (response.status===HTTP_NOT_ALLOWED) {
                    // Invalid session...try to login again
                    this.http({
                        method: 'GET',
                        url: baseUrl + 'Login?Username=' + this.sessionInfo.username + '&Password=' + this.sessionInfo.password
                    })
                    .then((response : any) => {
                        if (response.data.LoginResult.Success) {
                            this.sessionInfo.session = response.data.LoginResult.Session;
                            this.saveSessionInfo()
                            .finally(() => {
                                defer.resolve(LOGIN_OK);
                            });
                        }
                        else {
                            defer.reject(LOGIN_FAILED);
                        }            
                    },
                    (response) => {
                        defer.reject(SERVICE_UNAVAILABLE);
                    })

                }
                else {
                    defer.reject(SERVICE_UNAVAILABLE);
                }
            });
            
            return defer.promise;
            
        }
        
        saveSessionInfo() : ng.IPromise<boolean> {
            var defer = this.q.defer<boolean>();
            
            this.cordovaFile.writeFile(cordova.file.dataDirectory, abooksSatusFilename, JSON.stringify(this.sessionInfo), true)
            .then((success : any) => {
                defer.resolve(true);	
            },
            (error : any) => {
                console.log(error);
                defer.reject(false);
            });
            
            return defer.promise;
        }
        
        loadSessionInfo() : ng.IPromise<boolean> {
            var defer = this.q.defer<boolean>();
            
            this.cordovaFile.readAsBinaryString(cordova.file.dataDirectory, abooksSatusFilename)
            .then((result : string) => {
                this.sessionInfo = JSON.parse(result);
                
                defer.resolve(true);	
            },
            (error : any) => {
                console.log(error);
                defer.reject(false);
            })
            .finally(() => {
                
                workingDir = this.sessionInfo.workingDir;
                playDir = this.sessionInfo.playDir;
                
                console.log("NLUZ FROMFILE WD: " + workingDir + ", PD: " + playDir);
                
                if (!this.sessionInfo.workingDir) {
                    if (ionic.Platform.isAndroid()) {
                        if (externalStorage2) {
                            workingDir = externalStorage2;
                            playDir = externalStorage2;
                        }
                        else if (externalStorage) {
                            workingDir = externalStorage;
                            playDir = externalStorage;
                        }
                        else {
                            workingDir = internalStorage;
                            playDir = internalStorage;
                        }
                        this.sessionInfo.workingDir = workingDir;
                        this.sessionInfo.playDir = playDir;
                    }
                    else {
                        workingDir = this.sessionInfo.workingDir;
                        playDir = this.sessionInfo.playDir;
                    }
                    
                    console.log("NLUZ WD: " + workingDir + ", PD: " + playDir);
                }
            });
            
            return defer.promise;
        }
        
        clearSessionInfo() : ng.IPromise<boolean> {
            this.sessionInfo.username = "";
            this.sessionInfo.password = "";
            this.sessionInfo.session = "";
            return this.saveSessionInfo();
        }
        
        setCurrentBook(abook : AudioBook) {
            this.sessionInfo.currentBook = abook;
        }
        
        getCurrentBook() : AudioBook {
            return this.sessionInfo.currentBook;
        }
        
        getStoragePath(storage: string) {
            switch (storage) {
                case storageTypes[0]:
                    return internalStorage;
                    break;
                case storageTypes[1]:
                    return  externalStorage;
                    break;
                case storageTypes[2]:
                    return externalStorage2;
                    break;
            }
        }
        
        setStorage(storage: string) {

            switch (storage) {
                case storageTypes[0]:
                    workingDir = internalStorage;
                    playDir = internalStorage;
                    break;
                case storageTypes[1]:
                    workingDir = externalStorage;
                    playDir = externalStorage;
                    break;
                case storageTypes[2]:
                    workingDir = externalStorage2;
                    playDir = externalStorage2;
                    break;
            }
            
            this.sessionInfo.workingDir = workingDir;
            this.sessionInfo.playDir = playDir;
        }
        
        getStorage() : string {
            switch (this.sessionInfo.workingDir) {
                case internalStorage:
                    return storageTypes[0];
                    break;
                case externalStorage:
                    return storageTypes[1];
                    break;
                case externalStorage2:
                    return storageTypes[2];
                    break;
            }
        }
        
        deleteCurrentBook(id: string) {
            if (this.sessionInfo.currentBook.id===id) {
                this.sessionInfo.currentBook = null;
                this.saveSessionInfo();
            }
        }
        
        copy2SD(id: string) : ngCordova.IFilePromise<DirectoryEntry> {
            return this.cordovaFile.copyDir(cordova.file.dataDirectory, id, cordova.file.externalDataDirectory, id);
        }

        copy2Phone(id: string) : ngCordova.IFilePromise<DirectoryEntry> {
            return this.cordovaFile.copyDir(cordova.file.externalDataDirectory, id, cordova.file.dataDirectory, id);
        }
    }
    
};