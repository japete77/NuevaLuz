/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../app.ts" />
/// <reference path="svc-download.ts" />
var NuevaLuz;
(function (NuevaLuz) {
    var MyABooksService = (function () {
        function MyABooksService($scope) {
            this.abooksIndexFilename = "abooks-index.json";
            this.abooks = new Array();
            this.ready = false;
            this.scope = $scope;
            this.scope.control = this;
            var _control = this;
            ionic.Platform.ready(function () {
                _control.ready = true;
                // Load my audio books
                _control.getBooks(function (abooks) { });
            });
        }
        return MyABooksService;
    })();
    NuevaLuz.MyABooksService = MyABooksService;
})(NuevaLuz || (NuevaLuz = {}));
