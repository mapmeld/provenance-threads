var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

var Artwork = require('./models/artwork');

var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','U','V','W','X','Z'];

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'localhost');

function findYear(txt) {
  return txt.match(/18\d\d|19\d\d|20\d\d/);
}

function processArtistPage($, callback) {
  var artists = $("#list_content h2");
  var artsets = $("#list_content .list-view-items");

  function loadArtist(index) {
    if (index >= artists.length) {
      return callback();
    }

    var artist = artists[index];
    var artworks = $(artsets[index]).find('a');
    function loadArtwork(work_index) {
      if (work_index >= artworks.length) {
        return loadArtist(index + 1);
      }

      var artwork = artworks[work_index];
      var artwork_url = $(artwork).attr("href");

      request("http://www.moma.org/collection/provenance/" + artwork_url, function(err, resp, body) {
        if (err) {
          throw err;
        }

        var search = cheerio.load(body, { normalizeWhitespace: true, decodeEntities: false });

        var title = search('.info.box h3').text();

        var artists = [];
        var artistLinks = search('.info.box h4.artist a');
        for (var a = 0; a < artistLinks.length; a++) {
          artists.push(search(artistLinks[a]).text());
        }

        var places = [];
        var medium = "";

        var dds = search(".caption dd");
        var dts = search(".caption dt");
        var start = 0;
        for (var d = 0; d < dds.length; d++) {
          var label = search(dts[d]).text();
          var val = search(dds[d]).text();

          if (label == "Date:" && val) {
            places.push(val);
            if (findYear(val)) {
              start = findYear(val);
            }
          }
          else if (label == "Medium:") {
            medium = val;
          }
        }

        var changes = search("#provenance_tabs .content_container .bodytext").html().split("<br>");
        if (!start) {
          for (var p = 0; p < changes.length; p++) {
            if(findYear(val)) {
              start = findYear(val);
              break;
            }
          }
        }
        places = places.concat(changes);

        var a = new Artwork();
        a.title = title;
        a.artists = artists;
        a.places = places;
        a.medium = medium;
        a.start = start;
        a.save(function(err) {
          if (err) {
            throw err;
          }
          console.log('Saved ' + title);
          loadArtwork(work_index + 2);
        });
      });
    }
    loadArtwork(0);
  }
  loadArtist(0);
}

function downloadLetter(l, currentPage) {
  var letter = letters[l];
  if (!letter) {
    return console.log('completed');
  }
  if (!currentPage) {
    console.log('downloading artists with last names in: ' + letter);
    currentPage = 1;
  }

  request("https://www.moma.org/collection/provenance/provenance_artist_list.php?start_initial=" + letter + "&end_initial=" + letter + "&unparsed_search=2&page_number=" + currentPage, function(err, resp, body) {
    if (err) {
      throw err;
    }

    var $ = cheerio.load(body, { normalizeWhitespace: true, decodeEntities: true });

    // get page count for this letter
    var pages = $("span.currentItems").text();
    console.log("downloading page " + pages);
    var maxPage = pages.split(" OF ")[1] * 1;
    processArtistPage($, function() {
      if (currentPage < maxPage) {
        downloadLetter(l, currentPage + 1);
      } else {
        //downloadLetter(l + 1);
      }
    });
  });
}

Artwork.find({}).remove().exec(function(err) {
  if (err) {
    throw err;
  }
  console.log('erased old art');
  downloadLetter(0);
});
