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


                localStorageServiceProvider
                    .setPrefix('dlabs');
            }
        ]);
})();
