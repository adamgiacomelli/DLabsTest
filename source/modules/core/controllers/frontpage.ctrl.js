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
