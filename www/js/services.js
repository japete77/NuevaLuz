// var baseUrl = "http://win8:8080/AudioBookService/";
var baseUrl = "http://nluz.dyndns.org:8081/AudioBookService/";
	
angular.module('starter.services', ['angularSoap'])

// RadioSvc: Service to control Nueva Luz radio streaming
.service('RadioSvc', function() {
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
		errors[MediaError.MEDIA_ERR_NONE_SUPPORTED] = "Format not supported!";
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
})

.service('xmlParser', function () {
  var x2js = new X2JS();
  return {
    xml2json: function (args) {
      return angular.bind(x2js, x2js.xml2json, args)();
    },
    xml_str2json: function (args) {
      return angular.bind(x2js, x2js.xml_str2json, args)();
    },
    json2xml_str: function (args) {
      return angular.bind(x2js, x2js.json2xml_str, args)();
    }
  }
})

// NLSvc: SOAP Service to access Daisy books
.service('NLSvc', ['$http', function($http) {
	var session;
	
	return {
				
		GetSession : function() {
			return session;
		},
		
		SetSession : function(data)
		{
			session = data;
		},
		
		IsLoggedIn : function() {
			return session;
		},
		
		GetTitles : function() {
			return $http({
				method: 'GET',
				url: baseUrl + 'GetTitles?Session=' + session + '&Index=1&Count=10'
			})
		},
		
		GetAuthors: function() {
			return $http({
				method: 'GET',
				url: baseUrl + 'GetAuthors?Session=' + session + '&Index=1&Count=10'
			})
		},
				
	}
}])