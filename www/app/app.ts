/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./services/svc-radio.ts" />
/// <reference path="./services/svc-session.ts" />
/// <reference path="./services/svc-myabooks.ts" />
/// <reference path="./services/svc-download.ts" />
/// <reference path="./controllers/abooks-author-books.ts" />
/// <reference path="./controllers/abooks-authors.ts" />
/// <reference path="./controllers/abooks-detail.ts" />
/// <reference path="./controllers/abooks-login.ts" />
/// <reference path="./controllers/abooks-titles.ts" />
/// <reference path="./controllers/myabooks.ts" />
/// <reference path="./controllers/myabooks-player.ts" />
/// <reference path="./controllers/radio.ts" />

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

module NuevaLuz {
    
    // Global variables
    export var baseUrl : string = "http://nluz.dyndns.org:8081/AudioBookService/"; 
    // export var abookBaseUrl : string = "http://bibliasbraille.com/ClubLibro/";
    export var abookBaseUrl : string = "http://www.ibgracia.es/";
    export var workingDir : string = "";
    export var radioStreamingUrl : string = "http://nlradio.dyndns.org:8294/;";

    // main angular app
    export var app = angular.module('starter', ['ionic', 'ngIOS9UIWebViewPatch', 'ngCordova']);

    app.run(['$ionicPlatform', '$cordovaSplashscreen',
    function($ionicPlatform, $cordovaSplashscreen) {
    
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
        }
    );
    
    // Register Services
    app.service("RadioSvc",() => new RadioService());
    app.service("SessionSvc",() => new SessionService());
    app.service('MyABooksSvc', ($scope : ng.IScope) => new MyABooksService($scope))
    app.service('DownloadSvc', ($scope : IDownloadScope, $rootScope : ng.IScope, $interval : ng.IIntervalService, $cordovaFile : any, MyABooksSvc : MyABooksService) =>
        new DownloadService($scope, $rootScope, $interval, $cordovaFile, MyABooksSvc))
    
    // Register Controllers
    app.controller("AuthorsBooksCtrl", ($scope : IAuthorsBooksScope, $http : ng.IHttpService, $location : ng.ILocationService, $ionicLoading : ionic.loading.IonicLoadingService, $stateParams : any, SessionSvc : SessionService) => 
        new AuthorsBooksController($scope, $http, $location, $ionicLoading, $stateParams, SessionSvc));
        
    app.controller("AuthorsCtrl", ($scope : IAuthorsScope, $timeout : ng.ITimeoutService, 
            $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
            $ionicScrollDelegate : ionic.scroll.IonicScrollDelegate, SessionSvc : SessionService) => 
        new AuthorsController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc));
    
    app.controller("ABooksDetailCtrl", ($scope : IABooksDetailScope, $timeout : ng.ITimeoutService, 
            $http : ng.IHttpService, $location : ng.ILocationService, 
            $ionicLoading : ionic.loading.IonicLoadingService, $stateParams : any, 
            $ionicPopup : ionic.popup.IonicPopupService, SessionSvc : SessionService,
            DownloadSvc : DownloadService, MyABooksSvc : MyABooksService) => 
        new ABooksDetailController($scope, $timeout, $http, $location, $ionicLoading, $stateParams, 
        $ionicPopup, SessionSvc, DownloadSvc, MyABooksSvc));
            
    app.controller("LoginCtrl", ($scope : ILoginScope, $location : ng.ILocationService, $timeout : ng.ITimeoutService, $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, $ionicHistory : ionic.navigation.IonicHistoryService, SessionSvc : ISessionService) => 
        new LoginController($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc));

    app.controller("ABooksTitlesCtrl", ($scope : IABooksTitlesScope, $timeout : ng.ITimeoutService, 
        $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
        $ionicScrollDelegate : ionic.scroll.IonicScrollDelegate, SessionSvc : SessionService) => 
        new ABooksTitlesController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc));
 
    app.controller("ABooksCtrl", ($scope : IABooksScope, $timeout : ng.ITimeoutService, $http : ng.IHttpService, MyAbooksSvc : MyABooksService) => 
        new ABooksController($scope, $timeout, $http, MyAbooksSvc));

    app.controller("ABooksPlayerCtrl", ($scope : IABooksPlayerScope, $cordovaMedia : any) => 
        new ABooksPlayerController($scope, $cordovaMedia));
        
    app.controller("RadioCtrl", ($scope : IRadioScope, RadioSvc : IRadioService) => 
        new RadioController($scope, RadioSvc));
}