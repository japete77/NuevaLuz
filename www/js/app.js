// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngIOS9UIWebViewPatch'])

.run(['$ionicPlatform', '$rootScope', '$location', 'NLSvc', 'RadioSvc', function($ionicPlatform, $rootScope, $location, NLSvc, RadioSvc) {
  
  function stringStartsWith (str, prefix) {
    return str.substring(0, prefix.length) == prefix;
  }
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

        // prevent access to protected routes unless the user is logged
        if (stringStartsWith(toState.url, '/abooks/') &&
            !NLSvc.IsLoggedIn()) {
              event.preventDefault();
              $rootScope.$evalAsync(function() {              
                $location.path('/login');                
              });
            }
    });
    
  });
}])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'templates/home.html'
    })
    .state('radio', {
      url: '/radio',
      templateUrl: 'templates/radio.html'
    })
    .state('abooks-login', {
      url: '/login',
      templateUrl: 'templates/abooks-login.html'
    })
    .state('abooks-menu', {
      url: '/abooks/menu',
      templateUrl: 'templates/abooks-menu.html'
    })
    .state('abooks-title', {
      url: '/abooks/menu/title',
      templateUrl: 'templates/abooks-title.html'
    })
    .state('abooks-author', {
      url: '/abooks/menu/author',
      templateUrl: 'templates/abooks-author.html'
    })
    .state('abooks-author-books', {
      url: '/abooks/menu/author/:authorId',
      templateUrl: 'templates/abooks-author-books.html'
    })
    .state('abooks-search', {
      url: '/abooks/menu/search',
      templateUrl: 'templates/abooks-search.html'
    })
    .state('abooks-detail', {
      url: '/abooks/menu/detail/:abookId',
      templateUrl: 'templates/abooks-detail.html'
    })
})
