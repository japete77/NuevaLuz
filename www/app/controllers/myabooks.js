/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksController = (function () {
        function ABooksController($scope, $timeout, $http, myAbooksSvc) {
            var _this = this;
            this.scope = $scope;
            this.scope.control = this;
            this.timeout = $timeout;
            this.http = $http;
            this.myABooksSvc = myAbooksSvc;
            // Retrieve all my audio books
            this.myABooksSvc.getBooks(function (response) {
                _this.scope.abooks = response;
            });
        }
        ABooksController.prototype.getLink = function (id) {
            var index = this.getABookIndex(id);
            if (index >= 0) {
                if (this.scope.abooks[index].status == 'downloaded') {
                    return '#/myabooks/player/' + id;
                }
                else if (this.scope.abooks[index].status == 'downloading') {
                    return '#/abooks/menu/detail/' + id;
                }
            }
        };
        ABooksController.prototype.getABookIndex = function (id) {
            if (this.scope.abooks != null) {
                for (var i = 0; i < this.scope.abooks.length; i++) {
                    if (this.scope.abooks[i].id == id)
                        return i;
                }
            }
            return -1;
        };
        return ABooksController;
    })();
    NuevaLuz.ABooksController = ABooksController;
})(NuevaLuz || (NuevaLuz = {}));
