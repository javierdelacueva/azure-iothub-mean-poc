// Load required packages
var mongoose = require('mongoose');

// Define our reading schema
var ReadingSchema   = new mongoose.Schema({
  deviceId: String,
  timestamp: String,
  temperature: String,
  humidity: String
});

// Export the Mongoose model
module.exports = mongoose.model('Reading', ReadingSchema);