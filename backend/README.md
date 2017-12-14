# IoT BackEnd
This NodeJS backEnd connects with azure IoT service in order to receive data from all sensors.

The backend also opens a websocket connection thanks to socket.io library. This will be consumed by the angular client. Every time a sensors reading is received, the backend will store the data in a mongodb collection and send it out through the websocket connection.

All the logic for this is placed at /utilities/socket.js

This backend also runs a REST API. The code to serve the methods is palced at server.js

## License
[MIT](LICENSE.txt) license.

