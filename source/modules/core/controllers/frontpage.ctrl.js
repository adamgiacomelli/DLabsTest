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
