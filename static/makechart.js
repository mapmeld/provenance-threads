var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

function processData(energy) {

  sankey
      .nodes(energy.nodes)
      .links(energy.links)
      .layout(32);

  var link = svg.append("g").selectAll(".link")
      .data(energy.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

  link.append("title")
      .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  var node = svg.append("g").selectAll(".node")
      .data(energy.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove));

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { return d.name + "\n" + format(d.value); });

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
};

var eData = {"nodes": sData.nodes,
"links":[
{"source":0,"target":1,"value":124.729},
{"source":1,"target":2,"value":0.597},
{"source":1,"target":3,"value":26.862},
{"source":1,"target":4,"value":280.322},
{"source":1,"target":5,"value":81.144},
{"source":6,"target":2,"value":35},
{"source":7,"target":4,"value":35},
{"source":8,"target":9,"value":11.606},
{"source":10,"target":9,"value":63.965},
{"source":9,"target":4,"value":75.571},
{"source":11,"target":12,"value":10.639},
{"source":11,"target":13,"value":22.505},
{"source":11,"target":14,"value":46.184},
{"source":15,"target":16,"value":104.453},
{"source":15,"target":14,"value":113.726},
{"source":15,"target":17,"value":27.14},
{"source":15,"target":12,"value":342.165},
{"source":15,"target":18,"value":37.797},
{"source":15,"target":19,"value":4.412},
{"source":15,"target":13,"value":40.858},
{"source":15,"target":3,"value":56.691},
{"source":5,"target":13,"value":0.129},
{"source":5,"target":3,"value":1.401},
{"source":5,"target":19,"value":2.096},
{"source":5,"target":12,"value":48.58},
{"source":17,"target":3,"value":6.242},
{"source":2,"target":12,"value":121.066},
{"source":2,"target":18,"value":135.835},
{"source":2,"target":19,"value":3.64},
{"source":4,"target":19,"value":0.882},
{"source":4,"target":12,"value":46.477}
]};

processData(eData);
