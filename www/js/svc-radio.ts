/// <reference path="app.ts" />

declare var Stream : any;

app.service('SvcRadio', function() {
	var mplayer = {
		stream : null,
		status : false
	}
	
	var switchRadio = function() {
		if (mplayer.status) {
			mplayer.stream.stop();
		}
		else {
			initializeStream(true);
			mplayer.stream.play();
		}

		mplayer.status = !mplayer.status;			
	}
	
	var initializeStream = function(create) {		
		if (create || !mplayer.stream) {
			mplayer.stream = new Stream("http://nlradio.dyndns.org:8294/;", onSucess, onError, onStatus);
		}
	}

	function onSucess()
	{
		console.log("playAudio():Audio Success");
	}
	
	function onError(e)
	{
		var errors = {};
		errors[MediaError.MEDIA_ERR_ABORTED]= "Stop playing!";
		errors[MediaError.MEDIA_ERR_NETWORK]= "error in network!";
		errors[MediaError.MEDIA_ERR_DECODE] = "Could not decode file!";
		alert("Media error: " + errors[e.code]);
	}
	
	function onStatus(e)
	{
		console.log(e);
	}
		
	return {
		mplayer : mplayer,
		switchRadio : switchRadio,
		initializeStream : initializeStream
	}
});