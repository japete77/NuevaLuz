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
/// <reference path="./controllers/abooks-titles.ts" />
/// <reference path="./controllers/myabooks.ts" />
/// <reference path="./controllers/myabooks-player.ts" />
/// <reference path="./controllers/radio.ts" />
// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var NuevaLuz;
(function (NuevaLuz) {
    // Global variables
    NuevaLuz.baseUrl = "http://nluz.dyndns.org:8081/AudioBookService/";
    NuevaLuz.abookBaseUrl = "http://bibliasbraille.com/ClubLibro/";
    // export var abookBaseUrl : string = "http://www.ibgracia.es/";
    NuevaLuz.workingDir = "";
    NuevaLuz.radioStreamingUrl = "http://nlradio.dyndns.org:8294/;";
    // main angular app
    NuevaLuz.app = angular.module('starter', ['ionic', 'ngIOS9UIWebViewPatch', 'ngCordova']);
    NuevaLuz.app.run(['$ionicPlatform', '$cordovaSplashscreen',
        function ($ionicPlatform, $cordovaSplashscreen) {
            setTimeout(function () {
                $cordovaSplashscreen.hide();
            }, 3000);
            function stringStartsWith(str, prefix) {
                return str.substring(0, prefix.length) == prefix;
            }
            $ionicPlatform.ready(function () {
                var userAgent;
                userAgent = navigator.userAgent.match(/iPad/i);
                if (userAgent && userAgent.toString() === "iPad") {
                    NuevaLuz.workingDir = cordova.file.documentsDirectory;
                }
                else {
                    userAgent = navigator.userAgent.match(/iPhone/i);
                    if (userAgent && userAgent.toString() === "iPhone") {
                        NuevaLuz.workingDir = cordova.file.documentsDirectory;
                    }
                    else {
                        NuevaLuz.workingDir = cordova.file.dataDirectory;
                    }
                }
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (Keyboard) {
                    Keyboard.hideFormAccessoryBar(true);
                }
                if (window.StatusBar) {
                    window.StatusBar.styleDefault();
                }
            });
        }]);
    NuevaLuz.app.config(function ($stateProvider, $urlRouterProvider) {
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
            .state('myabooks-info', {
            url: '/myabooks/info/:abookId',
            templateUrl: 'templates/abook-info.html'
        });
    });
    // Register Services
    NuevaLuz.app.factory("RadioSvc", function () { return new NuevaLuz.RadioService(); });
    NuevaLuz.app.factory("SessionSvc", function () { return new NuevaLuz.SessionService(); });
    NuevaLuz.app.factory("DaisyPlayerSvc", function ($cordovaMedia, $cordovaFile, $interval, $rootScope) {
        return new NuevaLuz.DaisyPlayerService($cordovaMedia, $cordovaFile, $interval, $rootScope);
    });
    NuevaLuz.app.factory('MyABooksSvc', function ($cordovaFile) { return new NuevaLuz.MyABooksService($cordovaFile); });
    NuevaLuz.app.factory('DownloadSvc', function ($rootScope, $interval, $cordovaFile, MyABooksSvc) {
        return new NuevaLuz.DownloadService($rootScope, $interval, $cordovaFile, MyABooksSvc);
    });
    // Register Controllers
    NuevaLuz.app.controller("AuthorsBooksCtrl", function ($scope, $http, $location, $ionicLoading, $stateParams, SessionSvc) {
        return new NuevaLuz.AuthorsBooksController($scope, $http, $location, $ionicLoading, $stateParams, SessionSvc);
    });
    NuevaLuz.app.controller("AuthorsCtrl", function ($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc) {
        return new NuevaLuz.AuthorsController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc);
    });
    NuevaLuz.app.controller("ABooksDetailCtrl", function ($scope, $timeout, $http, $location, $ionicLoading, $stateParams, $ionicPopup, SessionSvc, DownloadSvc, MyABooksSvc) {
        return new NuevaLuz.ABooksDetailController($scope, $timeout, $http, $location, $ionicLoading, $stateParams, $ionicPopup, SessionSvc, DownloadSvc, MyABooksSvc);
    });
    NuevaLuz.app.controller("LoginCtrl", function ($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc) {
        return new NuevaLuz.LoginController($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc);
    });
    NuevaLuz.app.controller("ABooksTitlesCtrl", function ($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc) {
        return new NuevaLuz.ABooksTitlesController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc);
    });
    NuevaLuz.app.controller("ABooksCtrl", function ($scope, $timeout, $http, MyABooksSvc) {
        return new NuevaLuz.ABooksController($scope, $timeout, $http, MyABooksSvc);
    });
    NuevaLuz.app.controller("ABooksPlayerCtrl", function ($scope, $stateParams, $location, $ionicLoading, DaisyPlayerSvc) {
        return new NuevaLuz.ABooksPlayerController($scope, $stateParams, $location, $ionicLoading, DaisyPlayerSvc);
    });
    NuevaLuz.app.controller("RadioCtrl", function ($scope, RadioSvc) {
        return new NuevaLuz.RadioController($scope, RadioSvc);
    });
    NuevaLuz.app.controller("ABookInfoCtrl", function ($scope, $ionicPopup, $location, DaisyPlayerSvc, MyABooksSvc) {
        return new NuevaLuz.ABookInfoController($scope, $ionicPopup, $location, DaisyPlayerSvc, MyABooksSvc);
    });
})(NuevaLuz || (NuevaLuz = {}));
