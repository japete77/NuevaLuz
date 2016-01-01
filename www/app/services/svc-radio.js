/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var RadioService = (function () {
        function RadioService() {
            this.stream = null;
            this.status = false;
        }
        // Turns On/Off radio steaming
        RadioService.prototype.switchRadio = function () {
            if (this.status) {
                this.initializeStream(true);
                this.stream.play();
            }
            else {
                if (this.stream) {
                    this.stream.stop();
                }
            }
        };
        // Initialize streaming
        RadioService.prototype.initializeStream = function (create) {
            if (create || !this.stream) {
                this.stream = new Stream(NuevaLuz.radioStreamingUrl, this.onSucess, this.onError, this.onStatus);
            }
        };
        RadioService.prototype.onSucess = function () {
            console.log("playAudio():Audio Success");
        };
        RadioService.prototype.onError = function (e) {
            var errors = {};
            errors[MediaError.MEDIA_ERR_ABORTED] = "Stop playing!";
            errors[MediaError.MEDIA_ERR_NETWORK] = "error in network!";
            errors[MediaError.MEDIA_ERR_DECODE] = "Could not decode file!";
            alert("Media error: " + errors[e.code]);
        };
        RadioService.prototype.onStatus = function (e) {
            console.log(e);
        };
        return RadioService;
    })();
    NuevaLuz.RadioService = RadioService;
})(NuevaLuz || (NuevaLuz = {}));
