(function() {
    'use strict';
    angular.module('dlabsApp', [
            'ngResource',
            'ui.router',
            'ngMaterial', //Material design libs
            'ngMdIcons',
            'LocalStorageModule',
            'datetime',
            'angular-uuid',
            'ngWebSocket'
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
        .controller('FrontpageCtrl', ['$scope', '$interval', 'localStorageService', 'dWebsocket', 'uuid',
            function($scope, $interval, localStorageService, dWebsocket, uuid) {

                dWebsocket.initialize('ws://10.9.0.25:1234');
                $scope.connection = dWebsocket.connection;

                var userId = uuid.v4();

                $scope.saveToLocalStorage = function() {
                    var storageBox = {
                        user: $scope.user,
                        content: $scope.content,
                        changeCollection: $scope.changeCollection
                    }
                    localStorageService.set(localStorageKey, storageBox);
                }

                function backupContent() {
                    var change = {
                        user: $scope.user.name,
                        timestamp: new Date(),
                        content: $scope.content.text
                    };

                    //changeCollection is not empty
                    if ($scope.changeCollection.length != 0) {
                        var lastChangeText = $scope.changeCollection.slice(-1)[0].content;
                        if (lastChangeText != $scope.content.text) {
                            $scope.changeCollection.push(change);
                            dWebsocket.updateCollection($scope.changeCollection);
                        }
                    } else {
                        $scope.changeCollection.push(change);
                    }
                    $scope.saveToLocalStorage();

                    console.log("socket collection", dWebsocket.collection);
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
                        name: "Anonymous",
                        id: userId
                    }

                    $scope.content = {
                        text: ""
                    }

                    $scope.changeCollection = [];
                    $scope.saveToLocalStorage();
                }

                //Setup interval for backups
                $interval(backupContent, 500);

                $scope.revertToChange = function(change) {
                    var index = $scope.changeCollection.findIndex(function(element) {
                        return element.user == change.user && element.timestamp == change.timestamp;
                    });

                    $scope.content.text = change.content;

                    //Remove all changes after reverted one
                    $scope.changeCollection.splice(index + 1, $scope.changeCollection.length - index);
                    $scope.saveToLocalStorage();
                }

            }
        ])
})();

(function() {
    'use strict';
    angular.module('dlabsApp')
        .factory('dWebsocket', function($websocket) {
            var collection = [];
            var connection = {
                connected: false
            }
            var dataStream;

            var initialize = function(socketUrl) {
                // Open a WebSocket connection
                dataStream = $websocket(socketUrl);
                dataStream.onMessage(function(message) {
                    console.log("websocket message arrived:", message);
                    collection.push(JSON.parse(message.data));
                });

                dataStream.onOpen(function(msg) {
                    console.log("opened", msg);
                    connection.state = true;
                })

                dataStream.onClose(function(msg) {
                    console.log("closed", msg);
                    connection.state = false;
                })
            }

            var update = function(change) {
                dataStream.send(JSON.stringify(change));
            };

            var updateCollection = function(collection) {
                dataStream.send(JSON.stringify(collection));
            }

            var heartbeat = function(username) {

            }

            var methods = {
                connection: connection,
                collection: collection,
                update: update,
                updateCollection: updateCollection,
                initialize: initialize
            };

            return methods;
        })
})();
