var mongoose = require('mongoose');

var artworkSchema = mongoose.Schema({
  title: String,
  artists: [String],
  medium: String,
  start: Number,
  places: [String]
});

module.exports = mongoose.model('Artwork', artworkSchema);
