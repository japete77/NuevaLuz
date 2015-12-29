/// <reference path="../app.ts" />

module NuevaLuz {
    
    export interface ISessionService {
        getSession() : string;
        setSession(session : string);
    }
    
    export class SessionService implements ISessionService {
        
        private session : string = "";
        
        constructor() {
            
        }
        
        public getSession() : string {
            return this.session;
        }
        
        public setSession(session : string) {
            this.session = session;
        }
    }
    
}