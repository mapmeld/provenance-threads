var mongoose = require('mongoose');

var artworkSchema = mongoose.Schema({
  title: String,
  artists: [String],
  medium: String,
  start: Number,
  places: [String],
  pts: [[String]]
});

module.exports = mongoose.model('Artwork', artworkSchema);
