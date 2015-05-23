var mongoose = require('mongoose');

var placeSchema = mongoose.Schema({
  name: String,
  type: String,
  region: String,
  owner: String,
  latlng: [Number]
});

module.exports = mongoose.model('Place', placeSchema);
