## Server used:
- sudo npm install -g http-server
- $cd client //Go to client folder
- http-server -o //Run basic server from /client

## Basic setup
The interesting stuff is in:
### source/modules/core/controllers/frontpage.ctrl.js
The frontpage controller that has the logic regarding the frontpage
- All clients get an UUID which is then used throughout the application to identify them (the id is included in all websocket messages)

### source/modules/core/factory/websocket.factory.js
The websocket factory that has all of the websocket related logic.
- There is a message wrapper that enables message types.
- When a client connects to the socket, a message is emited which is replied by everyone with the current state data which is then merged (Only the first time).
