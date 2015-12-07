// NLSvc: Session Service
app.service('SvcNL', ['$http', function($http) {
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
	}
}]);