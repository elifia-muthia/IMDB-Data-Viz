'use strict';

// IIFE
(function () {
    //init data
    let data = [];
    d3.json('/load_all_data', (d) => {
        return d;
    }).then((d) => {
        data = d['movies'];
        console.log(data);
        createVis();
    }).catch((err) => {
        console.error(err);
    });

    //createVis
    function createVis() {
        //SVG 
        var svg = d3.select("#newVis"), 
            width = svg.attr("width"),
            height = svg.attr("height");

        //ordinal scale to sort into broader color groups
        var colorScale = d3.scaleOrdinal()
            .domain([[255,255,255],  [63,0,0], [128,0,0],[200,0,0],[255,0,0],[255,128,0],[255,163,51],[255,255,0], 
            [238,221,130], [255,218,185], [222,184,135], [128,255,0],[0,255,0], [0,100,0], [0,75,0], [1, 50,32],
          [0,255,128],[0, 255, 255], [173,216,230], [134,197,218], [0, 128, 255], [0,0,255], [0,0,128], [0,0,63], 
          [75,0,130], [57,0,114],[128,0,255],[255,0,255],[255,0,128], [72, 36, 10], [50, 25, 7], [0,0,0]])
            .range(["white", "red", "red", "red", "red", "orange", "orange", "yellow", "beige", "beige", "beige", 
                "green", "green",  "green",  "green",  "green",  "green", "blue", "blue", "blue", "blue", "blue", "blue", 
                "purple", "purple", "purple", "purple", "pink", "pink", "brown", "brown", "black"])

        //nested data
        var moviesOrdered = d3.nest()
            .key(function(d, i) {
                var second_color;
                var dom_color;
                if(d.dominant_colors_array[0][0].split("'")[1].split("'")[0] == d.dominant_color) {
                    second_color = 1;
                }
                else {
                    second_color = 0;
                }
                for(var n=0; n<3; n++) {         
                    if(d.dominant_colors_array[n][0].split("'")[1].split("'")[0] != d.dominant_color) {
                        if (Number(d.dominant_colors_array[n][1].split("'")[1].split("'")[0]) > Number(d.dominant_colors_array[second_color][1].split("'")[1].split("'")[0])) {
                            second_color = n;
                        }
                    }
                    else {
                        dom_color = n;
                    }
                }
                return colorScale(d.rgb_parent_colors[second_color]); 
            })
            .rollup(function(color) { return color.length})
            .entries(data);

        //colors for pie
        var pieColors = d3.scaleOrdinal()
            .domain(["black", "brown", "beige", "white", "pink", "red", "orange", "yellow", "green", "blue", "purple"])
            .range(["#000000", "#a26739", "#e5cb9d", "#ffffff", "#eda5ca", "#d74247", "#f29c45", "#fbd746", "#aad778", "#78c5d7", "#c58cde"])
        
        //radius
        var outerRadius = Math.min(width, height),
            innerRadius = 100,
            g = svg.append("g")
                .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
                .attr("class", "container");        
        
        var x = d3.scaleBand()
          .range([0, 2 * Math.PI])
          .domain(pieColors.domain());

        // Y scale
        var y = d3.scaleLinear()
          .range([innerRadius, outerRadius]) 
          .domain([50, 3500]); 

        // Add bars
        g.selectAll("path")
            .data(moviesOrdered)
            .enter()
            .append("path")
                .style("fill", function(d, i) {
                    return pieColors(moviesOrdered[i].key)
                })
                .attr("d", d3.arc() 
                    .innerRadius(innerRadius)
                    .outerRadius(function(d, i) { 
                        return y(moviesOrdered[i].value); 
                    })
                    .startAngle(function(d, i) { 
                        return x(moviesOrdered[i].key); 
                    })
                    .endAngle(function(d, i) { return x(moviesOrdered[i].key) + x.bandwidth(); })
                    .padAngle(0.1)
                    .padRadius(innerRadius))
                .attr("stroke", function(d, i) {
                    if(pieColors(moviesOrdered[i].key) == "#ffffff") {
                        return "#d9d9d9";
                    }
                    else {
                        return "white";
                    }
                })
                .attr("stroke-width", 0.5)
                .on('mouseover', function (d, i) {
                    var index = i;
                    d3.select(this)
                        .style("opacity", 0.4);
                    var tx1 = svg.append("text")
                        .text(`${d.value}`)
                        .attr("text-anchor", "middle")
                        .attr("x", "50%")
                        .attr("y", "53%")
                        .attr("id", "tx1")
                        .style("font-size", "30px")
                        .style("fill", function() {
                            if(pieColors(moviesOrdered[index].key) != "#ffffff") {
                                return pieColors(moviesOrdered[index].key);
                            }
                            else {
                                return "black"
                            }
                        })
                    var tx2 = svg.append("text")
                        .text(`${d.key}`)
                        .attr("text-anchor", "middle")
                        .attr("id", "tx2")
                        .attr("x", "50%")
                        .attr("y", "45%")
                        .style("font-size", "20px")
                        .style("fill", function() {
                            if(pieColors(moviesOrdered[index].key) != "#ffffff") {
                                return pieColors(moviesOrdered[index].key);
                            }
                            else {
                                return "black"
                            }
                        });
                })
                .each(function (d, i) {
                    this.i = i;
                })
                .on('mouseout', function(d) {
                    d3.select(this)
                        .style("opacity", 1);
                    d3.select("#tx1").remove();
                    d3.select("#tx2").remove();
                })
    }
})();