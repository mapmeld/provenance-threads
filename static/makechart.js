var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 5800 - margin.left - margin.right,
    height = 1800 - margin.top - margin.bottom;

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
          return "translate(" + (d.x + (d.start - 1887) * 15) + "," + d.y + ")";
        } else {
          return "translate(" + d.x + "," + d.y + ")";
        }
      })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove));

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
      .html(function(d) { return d.title; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
};

processData(sData);
