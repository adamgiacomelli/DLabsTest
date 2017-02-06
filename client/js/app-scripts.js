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
                function($rootScope) {}
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
        .controller('FrontpageCtrl', ['$scope', '$interval', 'localStorageService',
            function($scope, $interval, localStorageService) {

                $scope.saveToLocalStorage = function() {
                    var storageBox = {
                        user: $scope.user,
                        content: $scope.content,
                        changeCollection: $scope.changeCollection
                    }
                    localStorageService.set(localStorageKey, storageBox);
                }

                function backupContent() {
                    //changeCollection is not empty
                    if ($scope.changeCollection.length != 0) {
                        var lastChangeText = $scope.changeCollection.slice(-1)[0].content;
                        if (lastChangeText != $scope.content.text) {
                            $scope.changeCollection.push({
                                user: $scope.user.name,
                                timestamp: new Date(),
                                content: $scope.content.text
                            });
                        }
                    } else {
                        $scope.changeCollection.push({
                            user: $scope.user.name,
                            timestamp: new Date(),
                            content: $scope.content.text
                        });
                    }
                    $scope.saveToLocalStorage();
                }

                //Update to local storage contents
                var localStorageKey = "dlabsAppContents";

                var localContents = localStorageService.get(localStorageKey);
                if (localContents) {
                    $scope.user = localContents.user;
                    $scope.content = localContents.content;
                    $scope.changeCollection = localContents.changeCollection;
                } else {
                    //Init defaults
                    $scope.user = {
                        name: "Anonymous"
                    }

                    $scope.content = {
                        text: ""
                    }

                    $scope.changeCollection = [];
                    $scope.saveToLocalStorage();
                }

                //Setup interval for backups
                $interval(backupContent, 500);

            }
        ])
})();
