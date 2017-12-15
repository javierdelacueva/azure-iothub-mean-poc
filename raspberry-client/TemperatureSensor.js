  'use strict';

 // GrovePi variables initialisation
 var i2c = require('i2c-bus')
 var GrovePi = require('node-grovepi').GrovePi
 var Commands = GrovePi.commands
 var Board = GrovePi.board
 var DHTDigitalSensor = GrovePi.sensors.DHTDigital
 var sleep = require('sleep')
 var os = require('os');
 var ifaces = os.networkInterfaces();

 var DISPLAY_RGB_ADDR = 0x62;
 var DISPLAY_TEXT_ADDR = 0x3e;

 // Set Grovi variables
 var board
 var led = new GrovePi.sensors.DigitalOutput(3);
 var status = 0;

 // Set Azure IoT variables
 var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
 var Message = require('azure-iot-device').Message;
 var connectionString = 'HostName={YOUR CONNECTION STRING}';
 var client = clientFromConnectionString(connectionString);

 // Generic functions
 function setRGB(i2c1, r, g, b) {
   i2c1.writeByteSync(DISPLAY_RGB_ADDR,0,0)
   i2c1.writeByteSync(DISPLAY_RGB_ADDR,1,0)
   i2c1.writeByteSync(DISPLAY_RGB_ADDR,0x08,0xaa)
   i2c1.writeByteSync(DISPLAY_RGB_ADDR,4,r)
   i2c1.writeByteSync(DISPLAY_RGB_ADDR,3,g)
   i2c1.writeByteSync(DISPLAY_RGB_ADDR,2,b)
 }

 function textCommand(i2c1, cmd) {
   i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x80, cmd);
 }

  // Obtain localhost IP
  function getIP() {
    var ip = "";
    Object.keys(ifaces).forEach(function (ifname) {
      var alias = 0;
      ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }

        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          // console.log(ifname + ':' + alias, iface.address);
          ip = iface.address;
        } else {
          // this interface has only one ipv4 adress
          // console.log(ifname, iface.address);
          ip = iface.address;
        }
        ++alias;
      });
    });

    return ip;
  }

 // Display text on display
 function setText(i2c1, text) {
   textCommand(i2c1, 0x01) //Clear display
   sleep.usleep(50000);
   textCommand(i2c1, 0x08 | 0x04) //display on, no cursor
   textCommand(i2c1, 0x28) // 2 lines
   sleep.usleep(50000);
   var count = 0;
   var row = 0;
   for (var i = 0, len = text.length; i < len; i++){
     if(text[i] === '\n' || count === 16) {
       count = 0;
       row ++;
       if (row === 2)
         break;
       textCommand(i2c1, 0xc0)
       if(text[i] === '\n')
         continue;
     }
     count++;
     i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x40, text[i].charCodeAt(0));
   }
 }

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
       if (msg.data == 'on'){
         led.turnOn();
         status = 1;
       }
       else{
         led.turnOff();
         status = 0;
       }
       client.complete(msg, printResultFor('completed'));    
     });

     console.log('Starting GrovePi board initialisation')

     board = new Board({
       debug: true,
       onError: function(err) {
         console.log('TEST ERROR')
         console.log(err)
       },
       onInit: function(res) {
         if (res) {
           var dhtSensor = new DHTDigitalSensor(4, DHTDigitalSensor.VERSION.DHT11, DHTDigitalSensor.CELSIUS)
           console.log(board)
           console.log('GrovePi Version : ' + board.version())

           // Start reading from sensor
           console.log('DHT Digital Sensor (start watch)')
           dhtSensor.on('change', function(res) {
             if (res[2] < 60 && res[1] < 100){
               var temp = Math.round(res[2]);
               var hum = Math.round(res[1]);
               console.log('DHT onChange value = ' + res)
               var timestamp = Date.now();
               var data = JSON.stringify({
                 deviceId: 'jco-device1',
                 timestamp: timestamp,
                 temperature: temp,
                 humidity: hum
               });
               var message = new Message(data);
               console.log("Sending message: " + message.getData());

               // Sending message to Azure IoT Hub
               client.sendEvent(message, printResultFor('send'));
             
               // Send text to Display
               var i2c1 = i2c.openSync(1);
               var my_ip = getIP().split(".");
               var ip_print = my_ip[2] + "." + my_ip[3];
               setText(i2c1, 'Temp:' + temp + '\n' + 'Hum:' + hum + '%   ' + ip_print);


               // Change display color
               if (temp>=30){
                 setRGB(i2c1, 255,0,0);
               }
               else if (temp<=22){
                 setRGB(i2c1,0,0,255);
               }
               else{
                 setRGB(i2c1,255,255,0);
               }
               i2c1.closeSync();
  
               sleep.sleep(5);
             }  
           })
           dhtSensor.watch(500) // milliseconds
            
         }
         else {
           console.log('TEST COULD NOT START')
         }
       }
     })
   board.init()
   }
 }  

 // Close Script
 function onExit(err) {
   console.log('ending')
   board.close()
   process.removeAllListeners()
   process.exit()
   if (typeof err != 'undefined')
     console.log(err)
 }

 // Open client and start sending information to Azure IoT Hub
 client.open(connectCallback);

 process.on('SIGINT', onExit)
