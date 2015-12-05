//var baseUrl = "http://win8:8080/AudioBookService/";
var baseUrl = "http://nluz.dyndns.org:8081/AudioBookService/";

angular.module('starter.controllers', ['starter.services', 'ionic'])

// Radio controller
.controller('RadioCtrl', function($scope, RadioSvc) {
  
	$scope.radioOn = RadioSvc.mplayer.status;
	
	$scope.switchRadio = function() {
		RadioSvc.switchRadio();
		$scope.radioOn = RadioSvc.mplayer.status;
	}
  
})

// Login controller
.controller('ABooksLoginCtrl', ['$scope', '$location', '$ionicLoading', '$ionicHistory', '$timeout', '$http', 'NLSvc', 
function($scope, $location, $ionicLoading, $ionicHistory, $timeout, $http, NLSvc) {

	$scope.showErrorLogin = false;
	$scope.errorMessage = '';
	
	$scope.Login = function(u, p) {
	
		$scope.errorMessage = '';
		
		$timeout(function() {
			$ionicLoading.show({
				template: 'Verificando credenciales...'
			});
		}, 0);
		
		$http({
			method: 'GET',
			url: baseUrl + 'Login?Username=' + u + '&Password=' + p
		})
		.then(function success(response) {
			if (response.data.LoginResult.Success) {           
			
				NLSvc.SetSession(response.data.LoginResult.Session);
		
				$scope.showErrorLogin = false;
		
				$ionicHistory.nextViewOptions({
					disableAnimate: true,
					disableBack: true
				});
				
				$location.path('/');
			}
			else {           
				$scope.errorMessage = 'Acceso denegado';
				$scope.showErrorLogin = true;
			}
		
			// Close dialog  
			$timeout(function() {
				$ionicLoading.hide();
			}, 0);			
		},
		function error(response) {
			$timeout(function() {
				$ionicLoading.hide();
			}, 0);
			
			$scope.errorMessage = 'Biblioteca de audio libros fuera de servicio';
			$scope.showErrorLogin = true;
		})
	}

	$scope.IsAuthenticated = function() {
		return NLSvc.IsLoggedIn();
	}
}])

// Audio books controller
.controller('ABooksCtrl', ['$scope', '$timeout', '$http', '$ionicLoading', 'NLSvc', 
function($scope, $timeout, $http, $ionicLoading, NLSvc) {

	var index = 1;
	var maxTitles = 9999999;
	var pageSize = 25;
	var requesting = false;
	
	$scope.titles = [];

	$scope.GetNextTitles = function() {
	
		if (!requesting && index<maxTitles) {
			
			requesting = true;
			
			$http({
				method: 'GET',
				url: baseUrl + 'GetTitles?Session=' + NLSvc.GetSession() + '&Index=' + index + '&Count=' + pageSize
			})
			.then(function success(response) {
			
				maxTitles = response.data.GetTitlesResult.Total;
				
				response.data.GetTitlesResult.Titles.forEach(function(element) {
					$scope.titles.push(element);
				}, this);
				
				index += pageSize;
				
				requesting = false;
			})
		}
	}
  
	$scope.loadMore = function() {
		$scope.GetNextTitles();
		$scope.$broadcast('scroll.infiniteScrollComplete');
	} 
  
	$scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();
	});  
}])

.controller('ABooksDetailCtrl', ['$scope', '$timeout', '$http', '$ionicLoading', '$stateParams', 'NLSvc', 
function($scope, $timeout, $http, $ionicLoading, $stateParams, NLSvc) {
	
	$scope.init = function() {
	
		$ionicLoading.show({
			template: 'Cargando...'
		});
				
		$http({
			method: 'GET',
			url: baseUrl + 'GetAudioBookDetail?Session=' + NLSvc.GetSession() + '&Id=' + $stateParams.abookId
		})
		.then(function success(response) {
			$scope.detail = response.data.GetAudioBookDetailResult;
			$ionicLoading.hide();
		})
	}
	
	$scope.init();
}])

// Authors
.controller('AuthorsCtrl', ['$scope', '$http', '$ionicLoading', '$location', 'NLSvc', 
function($scope, $http, $ionicLoading, $location, NLSvc) {
	var index = 1;
	var maxAuthors = 9999999;
	var pageSize = 25;
	var requesting = false;
	
	$scope.authors = [];

	$scope.GetNextAuthors = function() {
	
		if (!requesting && index<maxAuthors) {
			
			requesting = true;
			
			$http({
				method: 'GET',
				url: baseUrl + 'GetAuthors?Session=' + NLSvc.GetSession() + '&Index=' + index + '&Count=' + pageSize
			})
			.then(function success(response) {
			
				maxAuthors = response.data.GetAuthorsResult.Total;
				
				response.data.GetAuthorsResult.Authors.forEach(function(element) {
					$scope.authors.push(element);
				}, this);
				
				index += pageSize;
				
				requesting = false;
			})
		}
	}
  
	$scope.loadMore = function() {
		$scope.GetNextAuthors();
		$scope.$broadcast('scroll.infiniteScrollComplete');
	} 
  
	$scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();
	});
}])

// Authors Titles
.controller('AuthorsBooksCtrl', ['$scope', '$http', '$ionicLoading', '$location', '$stateParams', 'NLSvc', 
function($scope, $http, $ionicLoading, $location, $stateParams, NLSvc) {
	var index = 1;
	var maxTitles = 9999999;
	var pageSize = 10;
	var requesting = false;
	
	$scope.titles = [];

	$scope.GetNextAuthors = function() {
	
		if (!requesting && index<maxTitles) {
			
			requesting = true;
			
			$http({
				method: 'GET',
				url: baseUrl + 'GetTitlesByAuthor?Session=' + NLSvc.GetSession() + '&Id=' + $stateParams.authorId + '&Index=' + index + '&Count=' + pageSize
			})
			.then(function success(response) {
			
				maxTitles = response.data.GetTitlesByAuthorResult.Total;
				
				response.data.GetTitlesByAuthorResult.Titles.forEach(function(element) {
					$scope.titles.push(element);
				}, this);
				
				index += pageSize;
				
				requesting = false;
			})
		}
	}
  
	$scope.loadMore = function() {
		$scope.GetNextAuthors();
		$scope.$broadcast('scroll.infiniteScrollComplete');
	} 
  
	$scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();
	});
}])