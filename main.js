// Pull in FAO data 
d3.csv("2013.csv", function(sample) {
  d3.tsv("world-country-names.tsv", function(country_names) {

// Use crossfilter for FAO data
  var amounts = crossfilter(sample);
  // Make a dimension with the Country field
  var countryDim = amounts.dimension(function (d) { return d.Country; } );
  // Sum all values for each country, adding for production and subtracting for domestic supply
  // NEEDS ATTENTION: Fix this formula to be ((production/domestic supply quantity)/100)
  var suffs = countryDim.group().reduceSum(function(d) 
      {
        if (d.Element == "Domestic supply quantity")  
          {return (d.Value * -1) }
        else 
          {
            return d.Value
          }
      } ).all();

  console.log(suffs);

  for (suff of suffs)
  {
    console.log(suff)
  }

// Map code taken from datavis-interactive lab

// Set up the SVG
var svg_width = window.innerWidth;
var svg_height = window.innerHeight;

// Use d3's built in projection object 
var projection = d3.geoMercator();
var path = d3.geoPath().projection(projection);

//Citation: Interpolate color functions taken from
//https://graphicdesign.stackexchange.com/questions/83866/generating-a-series-of-colors-between-two-colors
var interpolateColor = function (color1, color2, factor) {
    if (arguments.length < 3) { 
        factor = 0.5; 
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

var interpolateColors = function (color1, color2, steps) {
    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);

    for(var i = 0; i < steps; i++) {
        interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
    }

    return interpolatedColorArray;
}

var colorSet = interpolateColors("rgb(138, 255, 132)", "rgb(0, 56, 0)", 25);

for (var j = 0; j < 25; j++) {
  colorSet[j] = "rgb(" + colorSet[j][0] + "," + colorSet[j][1] + "," + colorSet[j][2] + ")";
}

var color = d3.scaleOrdinal(colorSet);

// Generate an SVG element on the page
var svg = d3.select("body").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height);

d3.json('world-110m.json', function(error, world) {
  // Decode the topojson file
  var land = topojson.feature(world, world.objects.land);
  var boundaries = topojson.mesh(world, world.objects.countries);
  var countries = topojson.feature(world, world.objects.countries).features;
  console.log (countries);
  var neighbors = topojson.neighbors(world.objects.countries.geometries);
  // Fit our projection so it fills the window
  projection.fitSize([svg_width, svg_height], land);

  // Loop over countries to match map ids with naes
  for (country of countries)
  {
    country.name = find_name(country.id);
    current_suff = find_suff(country.name)
    if (!current_suff)
    {
      country.suff = 0;
    }
    else 
      country.suff = current_suff;
    console.log(country.name)
    console.log(country.suff)
  }

  // Function to find id in country_names
  function find_name (id) {
    for (entry of country_names) 
    {
      if (entry.id == id)
        return entry.name;
    }
  }

  // Function to find sufficiency given country name
  function find_suff (name) {
    for (suff of suffs) 
    {
      if (name == suff.key)
        return suff.value;
    }
  }
  
  // Create land area
  svg.append('path')
    .datum(land)
     //This is the property that sets map-wide color.
			 //Need to figure out how to do this on a country
			 //basis.
    .attr('d', path);

  //Fill in countries by distinct colors
  svg.selectAll('.country')
      .data(countries)
      .enter()
      .append('path')
      	.attr('class', 'country')
      	.attr('d', path)
      	.style('fill', function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0); })
      	.style('stroke', '#fff')
      	.on("mouseover", function () {
      		this.parentNode.appendChild(this);
    		d3.select(this)
    		  .style('stroke', '#000');
    	})
    	.on("mouseout", function() {
    	    d3.select(this)
    		  .style('stroke', '#fff');
    	})
      .on("click", function(d) {
        d3.select(this)
        console.log(d.name);
      });
   });
});
});