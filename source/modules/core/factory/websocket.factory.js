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
