/// <reference path="app.ts" />
app.controller('ABooksTitlesCtrl', ['$scope', '$timeout', '$http', '$ionicLoading', '$ionicScrollDelegate', 'SvcNL',
    function ($scope, $timeout, $http, $ionicLoading, $ionicScrollDelegate, SvcNL) {
        var index = 1;
        var maxTitles = 9999999;
        var pageSize = 15;
        var timer = null;
        $scope.stopLoading = false;
        $scope.showScroll = true;
        $scope.titles = [];
        $scope.filterText = "";
        $scope.GetNextTitles = function () {
            if (index < maxTitles) {
                $scope.showScroll = true;
                if ($scope.filterText == "") {
                    $http({
                        method: 'GET',
                        url: baseUrl + 'GetTitles?Session=' + SvcNL.GetSession() + '&Index=' + index + '&Count=' + pageSize
                    })
                        .then(function success(response) {
                        maxTitles = response.data.GetTitlesResult.Total;
                        response.data.GetTitlesResult.Titles.forEach(function (element) {
                            $scope.titles.push(element);
                        }, this);
                        index += pageSize;
                        timer = null;
                        $scope.stopLoading = false;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }
                else {
                    $http({
                        method: 'GET',
                        url: baseUrl + 'SearchTitles?Session=' + SvcNL.GetSession() + '&Text=' + $scope.filterText + '&Index=' + index + '&Count=' + pageSize
                    })
                        .then(function success(response) {
                        maxTitles = response.data.SearchTitlesResult.Total;
                        response.data.SearchTitlesResult.Titles.forEach(function (element) {
                            $scope.titles.push(element);
                        }, this);
                        index += pageSize;
                        timer = null;
                        $scope.stopLoading = false;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }
            }
            else {
                $scope.showScroll = false;
            }
        };
        $scope.loadMore = function () {
            if (!$scope.stopLoading) {
                $scope.GetNextTitles();
            }
        };
        // Filter
        $scope.$watch('filterText', function () {
            $scope.stopLoading = true;
            if (timer) {
                $timeout.cancel(timer);
            }
            // delay to avoid many requests when writing search text
            timer = $timeout(function () {
                index = 1;
                maxTitles = 9999999;
                $scope.titles = [];
                $ionicScrollDelegate.scrollTop();
                $scope.GetNextTitles();
            }, 1000);
        });
    }]);
