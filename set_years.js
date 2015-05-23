var mongoose = require('mongoose');

var Artwork = require('./models/artwork');
var Place = require('./models/place');

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'localhost');

var years = [];

Artwork.find({ start: { $ne: 0 } }).exec(function(err, works) {
  for (var w = 0; w < works.length; w++) {
    if (years.indexOf(works[w].start) == -1) {
      years.push(works[w].start);
    }
    years.sort();
  }
  console.log(years);

  Place.find({}).remove().exec(function(err) {
    if (err) {
      throw err;
    }
    console.log('erased old places');

    for (var y = 0; y < years.length; y++) {
      var year = years[y];
      var p = new Place();
      p.title = year;
      p.save(function(err) {
        if (err) {
          throw err;
        }
      });
    }
    console.log('saving');
  });
});
