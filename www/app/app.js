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
var NuevaLuz;
(function (NuevaLuz) {
    // Global variables
    NuevaLuz.baseUrl = "http://nluz.dyndns.org:8080/AudioBookService/";
    NuevaLuz.abookBaseUrl = "http://bibliasbraille.com/ClubLibro/";
    NuevaLuz.radioStreamingUrl = "http://nlradio.dyndns.org:8294/;";
    NuevaLuz.workingDir = "";
    NuevaLuz.playDir = "";
    NuevaLuz.internalStorage = null;
    NuevaLuz.externalStorage = null;
    NuevaLuz.externalStorage2 = null;
    NuevaLuz.extStorageBase = ["file:///Removable/", "file:///mnt/sdcard/", "file:///mnt/", "file:///mnt/", "file:///mnt/sdcard/", "file:///mnt/", "file:///mnt/", "file:///mnt/sdcard/", "file:///storage/", "file:///mnt/"];
    NuevaLuz.extStorageDirs = ["MicroSD", "ext_sd", "external", "sdcard2", "_ExternalSD", "sdcard-ext", "external1", "external_sd", "extSdCard", "extSdCard"];
    NuevaLuz.storageTypes = ["Interno", "Externo 1", "Externo 2"];
    // main angular app
    NuevaLuz.app = angular.module('starter', ['ionic', 'ngIOS9UIWebViewPatch', 'ngCordova']);
    NuevaLuz.app.run(["$ionicPlatform", "$cordovaSplashscreen", "$ionicPopup", "DaisyPlayerSvc", "$ionicHistory", "$cordovaFile",
        function ($ionicPlatform, $cordovaSplashscreen, $ionicPopup, DaisyPlayerSvc, $ionicHistory, $cordovaFile) {
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
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state("Inicio", {
            cache: false,
            url: "/",
            templateUrl: "templates/home.html"
        })
            .state("Radio", {
            url: "/radio",
            templateUrl: "templates/radio.html"
        })
            .state("Configuracion", {
            cache: false,
            url: "/config",
            templateUrl: "templates/config.html"
        })
            .state("Almacenamiento", {
            cache: false,
            url: "/config/storage",
            templateUrl: "templates/config-storage.html"
        })
            .state("Acceso", {
            cache: false,
            url: "/login",
            templateUrl: "templates/abooks-login.html"
        })
            .state("Menu", {
            cache: false,
            url: "/abooks/menu",
            templateUrl: "templates/abooks-menu.html"
        })
            .state("Por Titulo", {
            url: "/abooks/menu/title",
            templateUrl: "templates/abooks-title.html"
        })
            .state("Por Autores", {
            url: "/abooks/menu/author",
            templateUrl: "templates/abooks-author.html"
        })
            .state("Libros", {
            url: "/abooks/menu/author/:authorId",
            templateUrl: "templates/abooks-author-books.html"
        })
            .state("Detalle", {
            cache: false,
            url: "/abooks/menu/detail/:abookId",
            templateUrl: "templates/abooks-detail.html"
        })
            .state("Mis Libros", {
            cache: false,
            url: "/myabooks/:command",
            templateUrl: "templates/myabooks.html"
        })
            .state("Reproductor", {
            cache: false,
            url: "/myabooks/player/:abookId",
            templateUrl: "templates/myabooks-player.html"
        })
            .state("Niveles", {
            url: "/myabooks/player/level/:abookId",
            templateUrl: "templates/myabooks-levels.html"
        })
            .state("Marcadores", {
            url: "/myabooks/player/bookmarks/:abookId",
            templateUrl: "templates/myabooks-bookmarks.html"
        })
            .state("Informacion", {
            url: "/myabooks/info/:abookId",
            templateUrl: "templates/abook-info.html"
        });
    });
    // Register Services
    NuevaLuz.app.factory("RadioSvc", function () { return new NuevaLuz.RadioService(); });
    NuevaLuz.app.factory("SessionSvc", function ($http, $q, $cordovaFile) {
        return new NuevaLuz.SessionService($http, $q, $cordovaFile);
    });
    NuevaLuz.app.factory("DaisyPlayerSvc", function ($cordovaMedia, $cordovaFile, $interval, $rootScope, $q, $timeout) {
        return new NuevaLuz.DaisyPlayerService($cordovaMedia, $cordovaFile, $interval, $rootScope, $q, $timeout);
    });
    NuevaLuz.app.factory("MyABooksSvc", function ($cordovaFile, $q) { return new NuevaLuz.MyABooksService($cordovaFile, $q); });
    NuevaLuz.app.factory("DownloadSvc", function ($rootScope, $interval, $cordovaFile, $q, MyABooksSvc, $http, SessionSvc) {
        return new NuevaLuz.DownloadService($rootScope, $interval, $cordovaFile, $q, MyABooksSvc, $http, SessionSvc);
    });
    // Register Controllers
    NuevaLuz.app.controller("ControllerBase", function ($scope, SessionSvc, $ionicHistory, $location) { return new NuevaLuz.ControllerBase($scope, SessionSvc, $ionicHistory, $location); });
    NuevaLuz.app.controller("ABooksMenuCtrl", function ($scope, SessionSvc, $location, $ionicLoading, $timeout) {
        return new NuevaLuz.ABooksMenuController($scope, SessionSvc, $location, $ionicLoading, $timeout);
    });
    NuevaLuz.app.controller("ConfigCtrl", function ($scope, SessionSvc, $ionicPopup, $timeout, $ionicLoading, MyABooksSvc) {
        return new NuevaLuz.ConfigController($scope, SessionSvc, $ionicPopup, $timeout, $ionicLoading, MyABooksSvc);
    });
    NuevaLuz.app.controller("AuthorsBooksCtrl", function ($scope, $http, $location, $ionicLoading, $stateParams, SessionSvc) {
        return new NuevaLuz.AuthorsBooksController($scope, $http, $location, $ionicLoading, $stateParams, SessionSvc);
    });
    NuevaLuz.app.controller("AuthorsCtrl", function ($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc, $location) {
        return new NuevaLuz.AuthorsController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc, $location);
    });
    NuevaLuz.app.controller("ABooksDetailCtrl", function ($scope, $timeout, $http, $location, $ionicLoading, $stateParams, $ionicPopup, SessionSvc, DownloadSvc, MyABooksSvc) {
        return new NuevaLuz.ABooksDetailController($scope, $timeout, $http, $location, $ionicLoading, $stateParams, $ionicPopup, SessionSvc, DownloadSvc, MyABooksSvc);
    });
    NuevaLuz.app.controller("LoginCtrl", function ($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc) {
        return new NuevaLuz.LoginController($scope, $location, $timeout, $http, $ionicLoading, $ionicHistory, SessionSvc);
    });
    NuevaLuz.app.controller("ABooksTitlesCtrl", function ($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc, $location) {
        return new NuevaLuz.ABooksTitlesController($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SessionSvc, $location);
    });
    NuevaLuz.app.controller("ABooksCtrl", function ($scope, $timeout, $http, MyABooksSvc, $stateParams, $ionicHistory, SessionSvc) {
        return new NuevaLuz.ABooksController($scope, $timeout, $http, MyABooksSvc, $stateParams, $ionicHistory, SessionSvc);
    });
    NuevaLuz.app.controller("ABooksPlayerCtrl", function ($scope, $stateParams, $location, $ionicLoading, $ionicPopup, DaisyPlayerSvc, $timeout, SessionSvc) {
        return new NuevaLuz.ABooksPlayerController($scope, $stateParams, $location, $ionicLoading, $ionicPopup, DaisyPlayerSvc, $timeout, SessionSvc);
    });
    NuevaLuz.app.controller("RadioCtrl", function ($scope, RadioSvc, SessionSvc, $controller) {
        return new NuevaLuz.RadioController($scope, RadioSvc, SessionSvc, $controller);
    });
    NuevaLuz.app.controller("ABookInfoCtrl", function ($scope, $ionicPopup, $location, DaisyPlayerSvc, MyABooksSvc, SessionSvc) {
        return new NuevaLuz.ABookInfoController($scope, $ionicPopup, $location, DaisyPlayerSvc, MyABooksSvc, SessionSvc);
    });
    NuevaLuz.app.controller("ABooksLevelsCtrl", function ($scope, $stateParams, $location, DaisyPlayerSvc) {
        return new NuevaLuz.ABooksLevelsController($scope, $stateParams, $location, DaisyPlayerSvc);
    });
    NuevaLuz.app.controller("ABooksBookmarksCtrl", function ($scope, $stateParams, $location, DaisyPlayerSvc) {
        return new NuevaLuz.ABooksBookmarksController($scope, $stateParams, $location, DaisyPlayerSvc);
    });
})(NuevaLuz || (NuevaLuz = {}));
;
