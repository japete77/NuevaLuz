/// <reference path="../app.ts" />

module NuevaLuz {
    
    declare var Stream : any;
    
    export interface IRadioService {
        switchRadio();
        status : boolean;
    }
    
    export class RadioService implements IRadioService {
        
        private stream : any = null;
        status = false;
        
        constructor() { 
            
        }
        
        // Turns On/Off radio steaming
        public switchRadio() {
            if (this.status) {
                this.initializeStream(true);
                this.stream.play();                
            }
            else {
                if (this.stream) {
                    this.stream.stop();
                }    
            }       
        }
        
        // Initialize streaming
        private initializeStream(create : boolean) {
            if (create || !this.stream) {
                this.stream = new Stream(radioStreamingUrl, this.onSucess, this.onError, this.onStatus);
            }            
        }
        
        private onSucess()
        {
            console.log("playAudio():Audio Success");
        }
        
        private onError(e)
        {
            var errors = {};
            errors[MediaError.MEDIA_ERR_ABORTED]= "Stop playing!";
            errors[MediaError.MEDIA_ERR_NETWORK]= "error in network!";
            errors[MediaError.MEDIA_ERR_DECODE] = "Could not decode file!";
            alert("Media error: " + errors[e.code]);
        }
        
        private onStatus(e)
        {
            console.log(e);
        }
    }
}