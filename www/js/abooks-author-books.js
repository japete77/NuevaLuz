/// <reference path="app.ts" />
app.controller('AuthorsBooksCtrl', ['$scope', '$http', '$ionicLoading', '$location', '$stateParams', 'SvcNL',
    function ($scope, $http, $ionicLoading, $location, $stateParams, SvcNL) {
        var index = 1;
        var maxTitles = 9999999;
        var pageSize = 25;
        var requesting = false;
        $scope.titles = [];
        $scope.GetNextAuthors = function () {
            if (!requesting && index < maxTitles) {
                requesting = true;
                $http({
                    method: 'GET',
                    url: baseUrl + 'GetTitlesByAuthor?Session=' + SvcNL.GetSession() + '&Id=' + $stateParams.authorId + '&Index=' + index + '&Count=' + pageSize
                })
                    .then(function success(response) {
                    maxTitles = response.data.GetTitlesByAuthorResult.Total;
                    response.data.GetTitlesByAuthorResult.Titles.forEach(function (element) {
                        $scope.titles.push(element);
                    }, this);
                    index += pageSize;
                    requesting = false;
                });
            }
        };
        $scope.loadMore = function () {
            $scope.GetNextAuthors();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };
        $scope.$on('$stateChangeSuccess', function () {
            $scope.loadMore();
        });
    }]);
