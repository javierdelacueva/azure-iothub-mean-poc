// Load required packages
var Reading = require('../models/reading');

// Create endpoint /api/sensors for GET
exports.getReadings = function(req, res) {
  var oneHour = 3600000000;
  var now = new Date();
  var timeNow = now.getTime() - oneHour;
  // Use the Sensor model to find all sensor
  Reading.find({timestamp: {$gte: timeNow} }, function(err, readings) {
    if (err)
      res.send(err);

    res.json(readings);
  }).sort({timestamp: 1});
};
