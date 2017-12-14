 // Libraries
 var express = require('express');
 var bodyParser = require('body-parser');
 var mongoose = require('mongoose');

  // Variables
 var mongo_string = process.env.MONGO_STRING || 'mongodb:{YOUR DATABASE}';
 var port = process.env.PORT_REST || 3000;
 process.env.NODE_ENV = 'DEV';

 // Controllers
 var readingController = require('./controllers/reading');

 // Utilities
 var socket = require('./utilities/socket');

 // Connect to MongoDB
 mongoose.connect(mongo_string, {
   useMongoClient: true,
 });
 mongoose.Promise = global.Promise;

 // Create our Express application
 var app = express();

 app.use(bodyParser.json());

 // Add headers
 app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.setHeader("Accept", "application/json");

    // Pass to next layer of middleware
    next();
});

 // Create our Express router
 var router = express.Router();

 router.route('/readings')
   .get(readingController.getReadings);

 router.get('/', function(req, res) {
    res.send("Welcome to the server. You can receive last measures going to /api/readings.       everis");
})

 // Register all our routes with /api
 app.use('/api', router);

 // Start the server
 app.listen(port);
 console.log('');
 console.log('======================');
 console.log('== SERVER LAUNCHED ==');
 console.log('======================');
 console.log('Rest server listening on port ' + port);
 console.log('');
 