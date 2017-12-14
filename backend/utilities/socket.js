/**
 * Import Libraries
 */
var EventHubClient = require('azure-event-hubs').Client;
var iothub = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;
var Reading = require('../models/reading');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/**
 * Declare variables
 */
var connectionString = process.env.CONNECTION_STRING || 'HostName={YOUR AZURE CONNECTION STRING}';
var port = process.env.PORT_SOCKET || 3001;
var targetDevice = '{YOUR AZURE DEVICE NAME}';

/**
 * Open Servers
 */

// Open WebSocket at port to communicate with frontEnd
http.listen(port, function () {
  console.log('');  
  console.log('======================');
  console.log('== SERVER LAUNCHED ==');
  console.log('======================');
  console.log('Socket server listening on port ' + port);
  console.log('');
});

// Open Azure IoT Hub connection and listen to it
var client = EventHubClient.fromConnectionString(connectionString);
client.open()
  .then(client.getPartitionIds.bind(client))
  .then(function (partitionIds) {
    console.log('');    
    console.log('=========================');
    console.log('== CONNECTED TO AZURE ==');
    console.log('=========================');
    console.log('Ready to RECEIVE data from devices');
    console.log('');    
    return partitionIds.map(function (partitionId) {
      return client.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
        console.log('Created partition receiver: ' + partitionId);
        receiver.on('errorReceived', handleError);
        receiver.on('message', handleMessage);
      });
    });
  })
  .catch(handleError);

// Open Azure IoT Hub connection and send messages to it
var serviceClient = iothub.fromConnectionString(connectionString);
serviceClient.open(function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('');    
    console.log('=========================');
    console.log('== CONNECTED TO AZURE ==');
    console.log('=========================');
    console.log('Ready to SEND messages to devices');    
    console.log('');
  }
});

/**
 * Functions
 */
function handleError(err) {
  console.log(err.message);
};

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

function handleMessage(message) {
  var stringifyMessage = JSON.stringify(message.body);

  console.log('Message received: ');
  console.log(stringifyMessage);
  console.log('');

  saveReading(message.body)

  emitReading(stringifyMessage);

  sendMessageToDevice(message.body.temperature);
}

function saveReading(message) {
  var reading = new Reading();
  
  reading.deviceId = message.deviceId;
  reading.timestamp = message.timestamp;
  reading.temperature = message.temperature;
  reading.humidity = message.humidity;
  
  reading.save(function(err) {
    if (err) console.log('An error has occured');
    else console.log('Reading added to the database');
    console.log('');    
  });  
}

function emitReading(message) {
  io.emit('message', { type: 'new-message', text: message });
  console.log('Message sent to WebSocket');
  console.log('');
}

var sendMessageToDevice = function (temperature) {
  var message = new Message("");
  message.ack = 'full';
  message.messageId = "everis";

  if (temperature > 22) message.data = 'off';
  else if (temperature <= 22) message.data = 'on';

  console.log('Temperature:', temperature);
  console.log('Sending message to Device: ' + message.getData());
  console.log('');

  serviceClient.send(targetDevice, message, printResultFor('send'));
};