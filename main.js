// Map code taken from datavis-interactive lab

// Set up the SVG
var svg_width = window.innerWidth;
var svg_height = window.innerHeight;

// Use d3's built in projection object 
var projection = d3.geoMercator();
var path = d3.geoPath().projection(projection);

// Generate an SVG element on the page
var svg = d3.select("body").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height);

d3.json('world-110m.json', function(error, world) {
  // Decode the topojson file
  var land = topojson.feature(world, world.objects.land);
  var countries = topojson.mesh(world, world.objects.countries);
  
  // Fit our projection so it fills the window
  projection.fitSize([svg_width, svg_height], land);
  
  // Create land area
  svg.append('path')
    .datum(land)
    .attr('class', 'land')
    .attr('d', path);

  // Create state boundaries
  svg.append('path')
    .datum(countries)
    .attr('class', 'state-boundary')
    .attr('d', path);
});
