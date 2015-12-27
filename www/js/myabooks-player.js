/// <reference path="../../typings/cordova/plugins/Media.d.ts" />
/// <reference path="app.ts" />
app.controller('ABooksPlayerCtrl', ['$scope', '$cordovaMedia', 'SvcDownload',
    function ($scope, $cordovaMedia, SvcDownload) {
        $scope.test = function (id) {
            var media = $cordovaMedia.newMedia('documents://1108/a000009.mp3');
            media.play();
        };
    }]);
