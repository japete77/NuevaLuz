/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/cordova/cordova.d.ts" />
/// <reference path="../../typings/cordova/plugins/Keyboard.d.ts" />
/// <reference path="../../typings/cordova/plugins/StatusBar.d.ts" />
/// <reference path="./services/svc-radio.ts" />
/// <reference path="./services/svc-session.ts" />
/// <reference path="./services/svc-myabooks.ts" />
/// <reference path="./controllers/radio.ts" />
/// <reference path="./controllers/abooks-login.ts" />
// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var NuevaLuz;
(function (NuevaLuz) {
    // Global variables
    NuevaLuz.baseUrl = "http://nluz.dyndns.org:8081/AudioBookService/";
    // export var abookBaseUrl : string = "http://bibliasbraille.com/ClubLibro/";
    NuevaLuz.abookBaseUrl = "http://www.ibgracia.es/";
    NuevaLuz.workingDir = "";
    NuevaLuz.radioStreamingUrl = "http://nlradio.dyndns.org:8294/;";
    // main angular app
    NuevaLuz.app = angular.module('starter', ['ionic', 'ngIOS9UIWebViewPatch', 'ngCordova']);
    NuevaLuz.app.run(['$ionicPlatform', '$rootScope', '$cordovaSplashscreen', '$location', 'SvcNL', 'SvcDownload', 'SvcMyABooks',
        function ($ionicPlatform, $rootScope, $cordovaSplashscreen, $location, SvcNL, SvcDownload, SvcMyABooks) {
            setTimeout(function () {
                $cordovaSplashscreen.hide();
            }, 3000);
            function stringStartsWith(str, prefix) {
                return str.substring(0, prefix.length) == prefix;
            }
            $ionicPlatform.ready(function () {
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
        });
    });
    // Register Services
    NuevaLuz.app.factory("RadioSvc", function () {
        return new NuevaLuz.RadioService();
    });
    NuevaLuz.app.factory("SessionSvc", function () {
        return new NuevaLuz.SessionService();
    });
    NuevaLuz.app.factory("MyABooksSvc", function ($scope, $cordovaFile) {
        return new NuevaLuz.MyABooksService($scope, $cordovaFile);
    });
    NuevaLuz.app.factory("DownloadSvc", function ($scope, $rootScope, $interval, $cordovaFile, MyABooksSvc) {
        return new NuevaLuz.DownloadService($scope, $rootScope, $interval, $cordovaFile, MyABooksSvc);
    });
    // Register Controllers
    NuevaLuz.app.controller("RadioCtrl", function ($scope, RadioSvc) {
        return new NuevaLuz.Radio($scope, RadioSvc);
    });
    NuevaLuz.app.controller("LoginCtrl", function ($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc) {
        return new NuevaLuz.LoginController($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc);
    });
})(NuevaLuz || (NuevaLuz = {}));
