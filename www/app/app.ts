/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./services/svc-download.ts" />
/// <reference path="./services/svc-myabooks.ts" />
/// <reference path="./services/svc-player.ts" />
/// <reference path="./services/svc-session.ts" />
/// <reference path="./services/svc-radio.ts" />
/// <reference path="./controllers/abook-info.ts" />
/// <reference path="./controllers/abooks-author-books.ts" />
/// <reference path="./controllers/abooks-authors.ts" />
/// <reference path="./controllers/abooks-detail.ts" />
/// <reference path="./controllers/abooks-login.ts" />
/// <reference path="./controllers/abooks-menu.ts" />
/// <reference path="./controllers/abooks-titles.ts" />
/// <reference path="./controllers/config.ts" />
/// <reference path="./controllers/controller-base.ts" />
/// <reference path="./controllers/myabooks.ts" />
/// <reference path="./controllers/myabooks-player.ts" />
/// <reference path="./controllers/myabooks-levels.ts" />
/// <reference path="./controllers/myabooks-bookmarks.ts" />
/// <reference path="./controllers/radio.ts" />

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

module NuevaLuz {
    
    // Global variables
    export var baseUrl : string = "http://nluz.dyndns.org:8080/AudioBookService/"; 
    export var abookBaseUrl : string = "http://bibliasbraille.com/ClubLibro/";
    export var radioStreamingUrl : string = "http://nlradio.dyndns.org:8294/;";
    export var workingDir : string = "";
    export var playDir : string = "";
    export var appleDevice : boolean;
    
    export var internalStorage : string = null;
    export var externalStorage : string = null;
    export var externalStorage2 : string = null;
    
    export var extStorageBase : string[] = [ "file:///Removable/", "file:///mnt/sdcard/", "file:///mnt/", "file:///mnt/", "file:///mnt/sdcard/", "file:///mnt/", "file:///mnt/", "file:///mnt/sdcard/", "file:///storage/", "file:///mnt/" ];
    export var extStorageDirs : string[] = [ "MicroSD",            "ext_sd",              "external",     "sdcard2",      "_ExternalSD",         "sdcard-ext",   "external1",    "external_sd",         "extSdCard",        "extSdCard" ];
    export var storageTypes: string[]    = [ "Interno", "Externo 1", "Externo 2" ];

    // main angular app
    export var app = angular.module('starter', ['ionic', 'ngIOS9UIWebViewPatch', 'ngCordova']);

    app.run(["$ionicPlatform", "$cordovaSplashscreen", "$ionicPopup", "DaisyPlayerSvc", "$ionicHistory", "$cordovaFile",
    ($ionicPlatform : ionic.platform.IonicPlatformService, $cordovaSplashscreen : any, 
        $ionicPopup : ionic.popup.IonicPopupService, DaisyPlayerSvc : DaisyPlayerService, 
        $ionicHistory : ionic.navigation.IonicHistoryService, $cordovaFile: ngCordova.IFileService) => {
            
        setTimeout(function() {
            $cordovaSplashscreen.hide();
        }, 3000);
            
        function stringStartsWith (str, prefix) {
            return str.substring(0, prefix.length) == prefix;
        }
                
        $ionicPlatform.ready(() => {
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

    app.config(($stateProvider : angular.ui.IStateProvider, $urlRouterProvider : angular.ui.IUrlRouterProvider) => {
        $urlRouterProvider.otherwise("/");
       
        $stateProvider
            .state("index", {
                cache: false,
                url: "/",
                templateUrl: "templates/home.html"
            })
            .state("radio", {
                url: "/radio",
                templateUrl: "templates/radio.html"
            })
            .state("config", {
                cache: false,
                url: "/config",
                templateUrl: "templates/config.html"
            })
            .state("config-storage", {
                cache: false,
                url: "/config/storage",
                templateUrl: "templates/config-storage.html"
            })
            .state("abooks-login", {
                cache: false,
                url: "/login",
                templateUrl: "templates/abooks-login.html"
            })
            .state("abooks-menu", {
                cache: false,
                url: "/abooks/menu",
                templateUrl: "templates/abooks-menu.html"
            })
            .state("abooks-title", {
                url: "/abooks/menu/title",
                templateUrl: "templates/abooks-title.html"
            })
            .state("abooks-author", {
                url: "/abooks/menu/author",
                templateUrl: "templates/abooks-author.html"
            })
            .state("abooks-author-books", {
                url: "/abooks/menu/author/:authorId",
                templateUrl: "templates/abooks-author-books.html"
            })
            .state("abooks-detail", {
                cache: false,
                url: "/abooks/menu/detail/:abookId",
                templateUrl: "templates/abooks-detail.html"
            })
            .state("myabooks", {
                cache: false,
                url: "/myabooks/:command",
                templateUrl: "templates/myabooks.html"
            })
            .state("myabooks-player", {
                cache: false,
                url: "/myabooks/player/:abookId",
                templateUrl: "templates/myabooks-player.html"
            })
            .state("myabooks-level", {
                url: "/myabooks/player/level/:abookId",
                templateUrl: "templates/myabooks-levels.html"
            })
            .state("myabooks-bookmarks", {
                url: "/myabooks/player/bookmarks/:abookId",
                templateUrl: "templates/myabooks-bookmarks.html"
            })
            .state("myabooks-info", {
                url: "/myabooks/info/:abookId",
                templateUrl: "templates/abook-info.html"
            })
        }
    );
    
    // Register Services
    app.factory("RadioSvc",() => new RadioService());
    app.factory("SessionSvc",($http : ng.IHttpService, $q : ng.IQService, $cordovaFile : ngCordova.IFileService) => 
        new SessionService($http, $q, $cordovaFile));
    app.factory("DaisyPlayerSvc", ($cordovaMedia : any, $cordovaFile : ngCordova.IFileService, 
        $interval : ng.IIntervalService, $rootScope : ng.IScope, $q : ng.IQService, $timeout : ng.ITimeoutService) => 
        new DaisyPlayerService($cordovaMedia, $cordovaFile, $interval, $rootScope, $q, $timeout));
    app.factory("MyABooksSvc", ($cordovaFile : ngCordova.IFileService, $q : ng.IQService) => new MyABooksService($cordovaFile, $q));
    app.factory("DownloadSvc", ($rootScope : ng.IScope, $interval : ng.IIntervalService, 
        $cordovaFile : any, $q : ng.IQService, MyABooksSvc : MyABooksService, 
        $http : ng.IHttpService, SessionSvc : SessionService) => new DownloadService($rootScope, $interval, $cordovaFile, $q, MyABooksSvc, $http, SessionSvc));
    
    // Register Controllers
    app.controller("ControllerBase", (SessionSvc : SessionService) => new ControllerBase(SessionSvc));
    app.controller("ABooksMenuCtrl", ($scope : IABooksMenuScope, SessionSvc : SessionService, 
        $location : ng.ILocationService, $ionicLoading : ionic.loading.IonicLoadingService,
        $timeout : ng.ITimeoutService) => 
        new ABooksMenuController($scope, SessionSvc, $location, $ionicLoading, $timeout));
        
    app.controller("ConfigCtrl", ($scope : IConfigScope,SessionSvc : SessionService, 
        $ionicPopup : ionic.popup.IonicPopupService, $timeout: ng.ITimeoutService, 
        $ionicLoading : ionic.loading.IonicLoadingService, MyABooksSvc : MyABooksService) => 
        new ConfigController($scope, SessionSvc, $ionicPopup, $timeout, $ionicLoading, MyABooksSvc));

    app.controller("AuthorsBooksCtrl", ($scope : IAuthorsBooksScope, $http : ng.IHttpService, 
        $location : ng.ILocationService, $ionicLoading : ionic.loading.IonicLoadingService, 
        $stateParams : angular.ui.IStateParamsService, SessionSvc : SessionService) => 
        new AuthorsBooksController($scope, $http, $location, $ionicLoading, $stateParams, SessionSvc));
        
    app.controller("AuthorsCtrl", ($scope : IAuthorsScope, $timeout : ng.ITimeoutService, 
            $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
            $ionicScrollDelegate : ionic.scroll.IonicScrollDelegate, SessionSvc : SessionService,
            $location : ng.ILocationService) => 
        new AuthorsController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc, $location));
    
    app.controller("ABooksDetailCtrl", ($scope : IABooksDetailScope, $timeout : ng.ITimeoutService, 
            $http : ng.IHttpService, $location : ng.ILocationService, 
            $ionicLoading : ionic.loading.IonicLoadingService, $stateParams : angular.ui.IStateParamsService, 
            $ionicPopup : ionic.popup.IonicPopupService, SessionSvc : SessionService,
            DownloadSvc : DownloadService, MyABooksSvc : MyABooksService) => 
        new ABooksDetailController($scope, $timeout, $http, $location, $ionicLoading, $stateParams, 
        $ionicPopup, SessionSvc, DownloadSvc, MyABooksSvc));
            
    app.controller("LoginCtrl", ($scope : ILoginScope, $location : ng.ILocationService, $timeout : ng.ITimeoutService, 
        $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
        $ionicHistory : ionic.navigation.IonicHistoryService, SessionSvc : SessionService) => 
        new LoginController($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc));

    app.controller("ABooksTitlesCtrl", ($scope : IABooksTitlesScope, $timeout : ng.ITimeoutService, 
        $http : ng.IHttpService, $ionicLoading : ionic.loading.IonicLoadingService, 
        $ionicScrollDelegate : ionic.scroll.IonicScrollDelegate, SessionSvc : SessionService, $location : ng.ILocationService) => 
        new ABooksTitlesController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc, $location));
 
    app.controller("ABooksCtrl", ($scope : IABooksScope, $timeout : ng.ITimeoutService, 
        $http : ng.IHttpService, MyABooksSvc : MyABooksService, $stateParams : angular.ui.IStateParamsService, 
        $ionicHistory : ionic.navigation.IonicHistoryService, SessionSvc : SessionService) => 
        new ABooksController($scope, $timeout, $http, MyABooksSvc, $stateParams, $ionicHistory, SessionSvc));
        
    app.controller("ABooksPlayerCtrl", ($scope : IABooksPlayerScope, 
        $stateParams : angular.ui.IStateParamsService, $location : ng.ILocationService, $ionicLoading : ionic.loading.IonicLoadingService, 
        $ionicPopup : ionic.popup.IonicPopupService, DaisyPlayerSvc : DaisyPlayerService, $timeout : ng.ITimeoutService, SessionSvc : SessionService) => 
        new ABooksPlayerController($scope, $stateParams, $location, $ionicLoading, $ionicPopup, DaisyPlayerSvc, $timeout, SessionSvc));
        
    app.controller("RadioCtrl", ($scope : IRadioScope, RadioSvc : IRadioService, SessionSvc : SessionService, $controller : ng.IControllerService) => 
        new RadioController($scope, RadioSvc, SessionSvc, $controller));

    app.controller("ABookInfoCtrl", ($scope : IABookInfoScope, $ionicPopup : ionic.popup.IonicPopupService, 
        $location : ng.ILocationService, DaisyPlayerSvc : DaisyPlayerService, MyABooksSvc : MyABooksService, SessionSvc : SessionService) => 
        new ABookInfoController($scope, $ionicPopup, $location, DaisyPlayerSvc, MyABooksSvc, SessionSvc));
        
   app.controller("ABooksLevelsCtrl", ($scope : IABooksLevelsScope, $stateParams : angular.ui.IStateParamsService, 
        $location : ng.ILocationService, DaisyPlayerSvc : DaisyPlayerService) =>
        new ABooksLevelsController($scope, $stateParams, $location, DaisyPlayerSvc));

   app.controller("ABooksBookmarksCtrl", ($scope : IABooksBookmarksScope, $stateParams : angular.ui.IStateParamsService, 
        $location : ng.ILocationService, DaisyPlayerSvc : DaisyPlayerService) =>
        new ABooksBookmarksController($scope, $stateParams, $location, DaisyPlayerSvc));
};