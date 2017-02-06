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
                        console.log("websocket message arrived:", parsedMsg.type);
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
