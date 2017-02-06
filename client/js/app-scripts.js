(function() {
    'use strict';
    angular.module('dlabsApp', [
            'ngResource',
            'ui.router',
            'ngMaterial', //Material design libs
            'ngMdIcons',
            'LocalStorageModule',
            'datetime',
            'textAngular'
        ])
        .run(
            ['$rootScope',
                function($rootScope) {
                    console.log("CORE");
                }
            ]);
})();

(function() {
    'use strict';
    angular.module('dlabsApp')
        .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'localStorageServiceProvider',
            function($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider) {
                $urlRouterProvider.otherwise("/");

                $stateProvider
                    .state('home', {
                        url: "/",
                        templateUrl: "partials/core/home.html",
                        controller: 'FrontpageCtrl'
                    })

                $locationProvider.html5Mode({
                    enabled: true,
                    requireBase: false
                });

                localStorageServiceProvider
                    .setPrefix('dlabs');
            }
        ]);
})();

(function() {
    'use strict';
    angular.module('dlabsApp')
        .controller('FrontpageCtrl', ['$scope', 'localStorageService',
            function($scope, localStorageService) {
                console.log("FrontpageCtrl");


                $scope.user = {
                    name: "Anonymous"
                }

                $scope.content = {
                    text: ""
                }

                $scope.changeCollection = [];
            }
        ])
})();
