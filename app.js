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
  Artwork.find({ start: { $ne: 0 } }).select('start title pts').sort('start').limit(410).exec(function(err, works) {
    if (err) {
      throw err;
    }

    Place.find({}).sort('title').exec(function(err, years) {
      if (err) {
        throw err;
      }

      res.render('demo', {
        works: works,
        years: years
      });
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
