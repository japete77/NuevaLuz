/// <reference path="app.ts" />
app.controller('AuthorsCtrl', ['$scope', '$http', '$timeout', '$ionicLoading', '$ionicScrollDelegate', '$location', 'SvcNL',
    function ($scope, $http, $timeout, $ionicLoading, $ionicScrollDelegate, $location, SvcNL) {
        var index = 1;
        var maxAuthors = 9999999;
        var pageSize = 15;
        var timer = null;
        $scope.stopLoading = false;
        $scope.showScroll = true;
        $scope.authors = [];
        $scope.filterText = "";
        $scope.GetNextAuthors = function () {
            if (index < maxAuthors) {
                $scope.showScroll = true;
                if ($scope.filterText == "") {
                    $http({
                        method: 'GET',
                        url: baseUrl + 'GetAuthors?Session=' + SvcNL.GetSession() + '&Index=' + index + '&Count=' + pageSize
                    })
                        .then(function success(response) {
                        maxAuthors = response.data.GetAuthorsResult.Total;
                        response.data.GetAuthorsResult.Authors.forEach(function (element) {
                            $scope.authors.push(element);
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
                        url: baseUrl + 'SearchAuthors?Session=' + SvcNL.GetSession() + '&Text=' + $scope.filterText + '&Index=' + index + '&Count=' + pageSize
                    })
                        .then(function success(response) {
                        maxAuthors = response.data.SearchAuthorsResult.Total;
                        response.data.SearchAuthorsResult.Authors.forEach(function (element) {
                            $scope.authors.push(element);
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
                $scope.GetNextAuthors();
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
                maxAuthors = 9999999;
                $scope.authors = [];
                $ionicScrollDelegate.scrollTop();
                $scope.GetNextAuthors();
            }, 1000);
        });
    }]);
