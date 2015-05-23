// data server for provenance apps

var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var mongoose = require('mongoose');

var Artwork = require('./models/artwork');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express['static'](__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression());

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'localhost');

app.get('/', function(req, res) {
  Artwork.find({}).exec(function(err, works) {
    if (err) {
      throw err;
    }

    for (var w = 0; w < works.length; w++) {
      works[w] = { name: works[w].title };
    }

    res.render('demo', { sData: { nodes: works } });
  });
});

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
});
