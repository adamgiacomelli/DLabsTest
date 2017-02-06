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
            'ngWebSocket',
            'ng-showdown'
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

                /*Simple merge algorihtm*/
                function mergeStrings(sA, sB) {
                    var linesLast = sA.split('\n');
                    var linesCurrent = sB.split('\n');
                    var merged = [];
                    var j = 0,
                        i = 0;
                    while (linesLast[i] != undefined || linesCurrent[j] != undefined) {
                        if (linesLast[i] == undefined) {
                            merged.push(linesCurrent[j]);
                            j++;
                        }
                        if (linesCurrent[j] == undefined) {
                            merged.push(linesLast[i]);
                            i++;
                        }

                        if (linesLast[i] == linesCurrent[j]) {
                            merged.push(linesLast[i]);
                            j++;
                            i++;
                        } else {
                            merged.push(linesLast[i]);
                            merged.push(linesCurrent[j]);
                            j++;
                            i++;
                        }
                    }

                    return merged.join('\n');
                }

                var updateCollectionCB = function(collection, merge) {
                    $scope.changeCollection = collection;
                    var lastChangeText = $scope.changeCollection.slice(-1)[0].content;
                    if ($scope.content.text != lastChangeText) {

                        if (merge) {
                            $scope.content.text = mergeStrings(lastChangeText, $scope.content.text);
                        } else {
                            $scope.content.text = lastChangeText;
                        }
                    }
                }

                var getCollectionCB = function() {
                    return $scope.changeCollection;
                }


                $scope.users = [];

                dWebsocket.initialize('ws://10.9.0.25:1234', $scope.user, updateCollectionCB, getCollectionCB, $scope.users);
                $scope.connection = dWebsocket.connection;

                //Setup interval for backups
                $interval(function() {
                    backupContent();
                    dWebsocket.heartbeat();
                }, 2000);

                $scope.revertToChange = function(change) {
                    var index = $scope.changeCollection.findIndex(function(element) {
                        return element.user == change.user && element.timestamp == change.timestamp;
                    });

                    $scope.content.text = change.content;

                    //Remove all changes after reverted one
                    $scope.changeCollection.splice(index + 1, $scope.changeCollection.length - index);
                    dWebsocket.updateCollection($scope.changeCollection);
                    $scope.saveToLocalStorage();
                }

            }
        ])
})();

(function() {
    'use strict';
    angular.module('dlabsApp')
        .factory('dWebsocket', function($websocket) {
            var MessageTypes = Object.freeze({
                ConnectedClient: 0,
                Update: 1,
                UpdateState: 2,
                HeartBeat: 3,
                MergeOnNewConnect: 4
            });

            var connection = {
                connected: false
            }
            var dataStream;
            var client;
            var users;
            var updateCollection;
            var initFlag = false;

            function constructMessage(content, type) {
                return {
                    type: type,
                    content: content,
                    uid: client.id
                }
            }

            var initialize = function(socketUrl, user, updateCollectionCB, getCollectionCB, initUsers) {
                client = user;
                users = initUsers;
                updateCollection = updateCollectionCB;

                // Open a WebSocket connection
                dataStream = $websocket(socketUrl);
                dataStream.onMessage(function(message) {
                    var parsedMsg = JSON.parse(message.data);

                    //Ignore own messages
                    if (parsedMsg.uid != client.id) {
                        switch (parsedMsg.type) {
                            case MessageTypes.ConnectedClient:
                                dataStream.send(JSON.stringify(constructMessage(getCollectionCB(), MessageTypes.MergeOnNewConnect)));
                                break;
                            case MessageTypes.MergeOnNewConnect:
                                //Merge on new connection
                                if (initFlag) {
                                    initFlag = false;
                                    updateCollection(parsedMsg.content, true);
                                }
                                break;
                            case MessageTypes.UpdateState:
                                updateCollection(parsedMsg.content);
                                //Merge collection
                                break;
                            case MessageTypes.HeartBeat:
                                var usr = users.find(function(elem) {
                                    return elem.client.id == parsedMsg.uid;
                                })

                                if (usr) {
                                    usr.ttl = 5;
                                } else {
                                    users.push({
                                        client: parsedMsg.content,
                                        ttl: 5 //Time after declared disconnected
                                    });
                                }

                                break;
                            default:
                        }
                    }
                });

                dataStream.onOpen(function(msg) {
                    console.log("opened", msg);
                    connection.state = true;
                    initFlag = true;
                    dataStream.send(JSON.stringify(constructMessage(client, MessageTypes.ConnectedClient)));
                })

                dataStream.onClose(function(msg) {
                    console.log("closed", msg);
                    connection.state = false;
                })
            }

            var update = function(change) {
                dataStream.send(JSON.stringify(constructMessage(change, MessageTypes.Update)));
            };

            var updateCollection = function(collection) {
                dataStream.send(JSON.stringify(constructMessage(collection, MessageTypes.UpdateState)));
            }

            var heartbeat = function() {
                dataStream.send(JSON.stringify(constructMessage(client, MessageTypes.HeartBeat)));
                users.forEach(function(usr, i, arr) {
                    arr[i].ttl--;
                });
            }

            var methods = {
                connection: connection,
                update: update,
                updateCollection: updateCollection,
                heartbeat: heartbeat,
                initialize: initialize
            };

            return methods;
        })
})();
