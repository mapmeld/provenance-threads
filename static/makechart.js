var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 6000 - margin.left - margin.right,
    height = 4000 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category20();

var svg = d3.select("#canvas").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([width, height]);

var path = sankey.link();

function findYear(txt) {
  return txt.match(/18\d\d|19\d\d|20\d\d/) * 1;
}

function processData(energy) {

  sankey
      .nodes(energy.nodes)
      .links(energy.links)
      .layout(32);

  var link = svg.append("g").selectAll(".link")
      .data(energy.links)
    .enter().append("path")
      .attr("class", function(d) {
        if (d.value == 0.9) {
          return "link book";
        } else {
          return "link";
        }
      })
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy / 2); })
      .sort(function(a, b) { return b.dy - a.dy; });

  var node = svg.append("g").selectAll(".node")
      .data(energy.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        if (d.start) {
          return "translate(" + (d.x + 20 * (d.start - 1887)) + "," + d.y + ")";
        } else if (findYear(d.title)) {
          var adjustX = 45 * (findYear(d.title) - 1887)
          return "translate(" + adjustX + "," + d.y + ")";

        } else {
          return "translate(" + d.x + "," + d.y + ")";
        }
      });

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.title.replace(/ .*/, "")); })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); });

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .html(function(d) { return d.title.replace('Museum of Modern Art', 'MoMA'); })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
};

var links = [];
var stops = [];

var yearlyChangesForLocation = {};
var stopsByLocale = {};

function initRecord(locale, year) {
  if (!yearlyChangesForLocation[locale]) {
    yearlyChangesForLocation[locale] = {};
  }
  if (!yearlyChangesForLocation[locale][year]) {
    yearlyChangesForLocation[locale][year] = {
      add: [],
      remove: []
    };
  }
  if (!stopsByLocale[year + "," + locale]) {
    stops.push({ title: locale + ", " + year });
    stopsByLocale[year + "," + locale] = stops.length - 1;
  }
}

var w = 0;

for (var y = 0; y < years.length; y++) {
  while (w < works.length && works[w].start <= years[y].title * 1) {
    if (works[w].start == years[y].title * 1) {
      stops.push({ title: works[w].title, start: works[w].start });
      var stopAddition = stops.length - 1;
      var lastLocale = null;
      var pts = works[w].pts;
      var previousLocales = [];

      for (var p = 0; p < pts.length; p++) {
        var locale = pts[p].split(',')[1];
        if (locale && locale != lastLocale) {
          var year = pts[p].split(',')[0] * 1;

          // make sure a record exists of these locations and years
          initRecord(locale, year);
          if (lastLocale) {
            initRecord(lastLocale, year);
            if (previousLocales.indexOf(locale) == -1) {
              // link from an existing state
              yearlyChangesForLocation[locale][year].add.push(stopsByLocale[year + "," + lastLocale]);
            }
          } else {
            // tell this location to expect an addition this year
            yearlyChangesForLocation[locale][year].add.push(stopAddition);
          }

          // tell last location to expect a removal this year
          if (lastLocale) {
            yearlyChangesForLocation[lastLocale][year].remove.push(stopsByLocale[pts[p]]);
          }

          // save location for next move
          lastLocale = locale;
          previousLocales.push(locale);
          if (lastLocale.indexOf("Museum of Modern Art") > -1) {
            break;
          }
        }
      }
    }
    w++;
  }
}

// ok, that's the major years. Let's also do locales
var locales = Object.keys(yearlyChangesForLocation);
for (var i = 0; i < locales.length; i++) {
  var changeYears = Object.keys(yearlyChangesForLocation[locales[i]]).sort();
  var currentWorks = 0;
  var lastLocation;
  for (var a = 0; a < changeYears.length; a++) {
    // locale history
    if (currentWorks > 0) {
      var toMe = stopsByLocale[changeYears[a] + "," + locales[i]];
      if (lastLocation == toMe) {
        continue;
      }
      links.push({
        source: lastLocation,
        target: toMe,
        value: currentWorks
      });
    }

    // update node cursor of this location through time
    lastLocation = stopsByLocale[changeYears[a] + "," + locales[i]];

    // add work links
    var addWorks = yearlyChangesForLocation[locales[i]][changeYears[a]].add;
    currentWorks += addWorks.length;
    for (var w = 0; w < addWorks.length; w++) {
      if (lastLocation == addWorks[w]) {
        continue;
      }
      links.push({
        source: addWorks[w],
        target: lastLocation,
        value: 0.9
      });
    }

    var removeWorks = yearlyChangesForLocation[locales[i]][changeYears[a]].remove;
    currentWorks -= removeWorks.length;
  }
}

processData({ nodes: stops, links: links });
