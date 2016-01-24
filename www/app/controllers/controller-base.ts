/// <reference path="../app.ts" />

module NuevaLuz {
    export class ControllerBase {
        protected SessionSvc : SessionService;
        
        constructor(SessionSvc : SessionService) {
            this.SessionSvc = SessionSvc;
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
    }
};