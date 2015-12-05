// Radio controller
starter.controller('RadioCtrl', function($scope, RadioSvc) {
  
	$scope.radioOn = RadioSvc.mplayer.status;
	
	$scope.switchRadio = function() {
		RadioSvc.switchRadio();
		$scope.radioOn = RadioSvc.mplayer.status;
	}
});