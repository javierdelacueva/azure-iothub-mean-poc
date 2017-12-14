'use strict';

// Set Grovi and Azure IoT variables
var status = 0;

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = 'HostName=jco-iothub.azure-devices.net;DeviceId=jco-device1;SharedAccessKey=43Ye6OI/idPEsKgy0zjInsR2qvnKwMIkITB1P55Inx8=';
var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

// Handle request from Azure
var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');
     
        // Handle actions from Azure IoT Hub
        client.on('message', function(msg){
            console.log('=====================');
            console.log(msg.data);
            if (msg.data == 'on') {
                console.log("led.turnOn()");
                status = 1;
            } else {
                console.log("led.turnOff()");
                status = 0;
            }
            client.complete(msg, printResultFor('completed'));    
        });

        setInterval(function(){
            // Start reading from sensor
            var timestamp = Date.now();
            var data = JSON.stringify({
                deviceId: 'jco-device1',
                timestamp: timestamp,
                temperature: getRandomIntInclusive(21, 24),
                humidity: getRandomIntInclusive(13, 18),
            });

            var message = new Message(data);
            console.log("Sending message: " + message.getData());

            // Sending message to Azure IoT Hub
            client.sendEvent(message, printResultFor('send'));
        }, 10000);
    }
}  

// Close Script
function onExit(err) {
    console.log('ending')
    process.exit()
    if (typeof err != 'undefined')
        console.log(err)
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Open client and start sending information to Azure IoT Hub
client.open(connectCallback);

process.on('SIGINT', onExit)
