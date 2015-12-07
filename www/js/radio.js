// Radio controller
app.controller('RadioCtrl', function($scope, SvcRadio) {
  
	$scope.radioOn = SvcRadio.mplayer.status;
	
	$scope.switchRadio = function() {
		SvcRadio.switchRadio();
		$scope.radioOn = SvcRadio.mplayer.status;
	}
});