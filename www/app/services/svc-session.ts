/// <reference path="../app.ts" />

module NuevaLuz {
    
    export class SessionService {
        
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