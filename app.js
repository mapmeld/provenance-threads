// data server for provenance apps

var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var mongoose = require('mongoose');

var Artwork = require('./models/artwork');
var Place = require('./models/place');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express['static'](__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression());

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'localhost');

app.get('/', function(req, res) {
  Artwork.find({ start: { $ne: 0 } }).exec(function(err, works) {
    if (err) {
      throw err;
    }

    Place.find({}).sort('title').exec(function(err, years) {
      if (err) {
        throw err;
      }

      var links = [];

      var stops = [{ title: "Museum of Modern Art" }];
      for (var y = 0; y < years.length; y++) {
        stops.push({ title: years[y].title });
      }

      var loadedWorks = 0;
      for (var y = 0; y < years.length; y++) {
        for (var w = 0; w < works.length; w++) {
          if (works[w].start == years[y].title * 1) {
            stops.push({ title: works[w].title, start: works[w].start });
            links.push({
              source: stops.length - 1,
              target: y + 1,
              value: 0.9
            });
            loadedWorks++;
          }
        }
        if (y < years.length - 1) {
          links.push({
            source: y + 1,
            target: y + 2,
            value: loadedWorks,
          });
        }
      }
      links.push({
        source: years.length,
        target: 0,
        value: loadedWorks,
      });

      res.render('demo', { sData: { nodes: stops, links: links } });
    });
  });
});

app.get('/data/art', function(req, res) {
  Artwork.find({}).exec(function(err, works) {
    if (err) {
      throw err;
    }
    res.json(works);
  });
});

app.get('/data/places', function(req, res) {
  Place.find({}).exec(function(err, places) {
    if (err) {
      throw err;
    }
    res.json(places);
  });
});

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
});
