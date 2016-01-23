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
            
            ionic.Platform.ready(() => {
                this.loadSessionInfo().then(()=>{
                }, 
                (error : any) => {
                    this.sessionInfo = new SessionInfo();
                    this.sessionInfo.session = "";
                    this.sessionInfo.currentBook = null;                    
                });
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
            
            this.cordovaFile.writeFile(workingDir, abooksSatusFilename, JSON.stringify(this.sessionInfo), true)
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
            
            this.cordovaFile.readAsBinaryString(workingDir, abooksSatusFilename)
            .then((result : string) => {
                this.sessionInfo = JSON.parse(result);
                defer.resolve(true);	
            },
            (error : any) => {
                console.log(error);
                defer.reject(false);
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

    }
    
}