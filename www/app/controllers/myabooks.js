/// <reference path="../app.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var ABooksController = (function () {
        function ABooksController($scope, $timeout, $http, myAbooksSvc) {
            this.scope = $scope;
            this.scope.control = this;
            this.timeout = $timeout;
            this.http = $http;
            this.myABooksSvc = myAbooksSvc;
            var _control = this;
            // Retrieve all my audio books
            this.myABooksSvc.getBooks(function (response) {
                _control.scope.abooks = response.data;
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
