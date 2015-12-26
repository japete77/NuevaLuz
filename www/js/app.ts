/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/cordova/cordova.d.ts" />
/// <reference path="../../typings/cordova/plugins/Keyboard.d.ts" />
/// <reference path="../../typings/cordova/plugins/StatusBar.d.ts" />

// Global variables
var baseUrl : string = "http://nluz.dyndns.org:8081/AudioBookService/";

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngIOS9UIWebViewPatch', 'ngCordova']);

app.run(['$ionicPlatform', '$rootScope', '$cordovaSplashscreen', '$location', 'SvcNL', 'SvcRadio', 'SvcDownload', 'SvcMyABooks',
  function($ionicPlatform, $rootScope, $cordovaSplashscreen, $location, SvcNL, SvcRadio, SvcDownload, SvcMyABooks) {
  
  setTimeout(function() {
        $cordovaSplashscreen.hide()
  }, 3000);
    
  function stringStartsWith (str, prefix) {
    return str.substring(0, prefix.length) == prefix;
  }
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(Keyboard) {
      Keyboard.hideFormAccessoryBar(true);
    }
    if(window.StatusBar) {
      window.StatusBar.styleDefault();
    }    
  });
}]);

app.config(function($stateProvider, $urlRouterProvider) {
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
    .state('abooks-detail', {
      url: '/abooks/menu/detail/:abookId',
      templateUrl: 'templates/abooks-detail.html'
    })
    .state('myabooks', {
      url: '/myabooks',
      templateUrl: 'templates/myabooks.html'
    })
    .state('myabooks-player', {
      url: '/myabooks/player/:abookId',
      templateUrl: 'templates/myabooks-player.html'
    })
});