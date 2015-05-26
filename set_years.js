var mongoose = require('mongoose');

var Artwork = require('./models/artwork');
var Place = require('./models/place');

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'localhost');

function findYear(txt) {
  return txt.match(/18\d\d|19\d\d|20\d\d/) * 1;
}

var locations = [
  "Museum of Modern Art",
  "Julien Levy Gallery",
  "Rosenberg Gallery",
  "Kraushaar Gallery",
  "Charles E. Slatkin Galleries",
  "Leonard Hutton Galleries",
  "Valentine Dudensing Gallery",
  "44th Street Gallery",
  "Pierre Matisse Gallery",
  "Buchholz Gallery",
  "Iolas Gallery",
  "Perls Gallery",
  "Weyhe Gallery",
  "Nierendorf Gallery",
  "New York", // New York institutions should precede New York
  "Rome",
  "Avignon",
  "Fontainebleau",
  "Paris",
  "Meudon",
  "Zurich",
  "Connecticut",
  "Budapest",
  "London",
  "Bern",
  "Berlin",
  "Erfurt",
  "Kassel",
  "Bad Sooden-Allendorf",
  "Westchester",
  "Milan",
  "Nice",
  "Boisgeloup",
  "Antibes",
  "Chicago",
  "Moscow",
  "Ontario",
  "Cologne",
  "Hamburg",
  "Munich",
  "Santa Barbara",
  "Michigan",
  "Brussels",
  "Los Angeles",
  "Barcelona",
  "Pennsylvania",
  "Boston",
  "Amsterdam",
  "D.C.",
  "Cuba",
  "Oslo",
  "Copenhagen",
  "Norway",
  "Denmark",
  "Sweden",
  "Bremen",
  "San Francisco",
  "Neuilly",
  "Antwerp",
  "Madrid",
  "Frankfurt",
  "Germany"
];

function findLocation(txt) {
  txt = txt.toLowerCase().replace(/\s/g, '');
  for (var l = 0; l < locations.length; l++) {
    var token = locations[l].toLowerCase().replace(/\s/g, '');
    if (txt.indexOf(token) > -1) {
      return locations[l];
    }
  }
  return null;
}

var years = [];

Artwork.find({ start: { $ne: 0 } }).exec(function(err, works) {
  // collect years as checkpoints
  for (var w = 0; w < works.length; w++) {
    // make sure each artwork is associated with its start year
    if (years.indexOf(works[w].start) == -1) {
      years.push(works[w].start);
    }

    // build place-time-pts based on places
    works[w].pts = [];
    for (var p = 0; p < works[w].places.length; p++) {
      var pl = works[w].places[p];

      // replace parenthetical years from people bios (1810-1900)
      // but not (1990) digit only parentheticals
      pl = pl.replace(/\((\d+)\)/g, /$1/).replace(/\(\S+\)/g, '')

      // break off footnotes
      if(pl.indexOf("[1]") === 0) {
        break;
      }
      if(findYear(pl)) {
        works[w].pts.push([ findYear(pl), findLocation(pl) ]);
      }
    }
    works[w].save(function(err) {
      if (err) {
        throw err;
      }
    });
  }
  years.sort();

  // create a Place representing each year
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
