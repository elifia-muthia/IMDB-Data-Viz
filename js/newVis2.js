'use strict';

// IIFE
(function () {
    //init data
    let data = [];
    d3.json('/load_all_data', (d) => {
        return d;
    }).then((d) => {
        data = d['movies'];
        createVis();
    }).catch((err) => {
        console.error(err);
    });

    //createVis
    function createVis() {
        //SVG 
        var svg = d3.select("#newVis2"), 
            width = svg.attr("width"),
            height = svg.attr("height");

        //ordinal scale to sort into broader color groups
        var colors = [[255,255,255], [63,0,0], [128,0,0],[200,0,0],[255,0,0],[255,128,0],[255,163,51],[255,255,0], 
            [238,221,130], [255,218,185], [222,184,135], [128,255,0],[0,255,0], [0,100,0], [0,75,0], [1, 50,32],
          [0,255,128],[0, 255, 255], [173,216,230], [134,197,218], [0, 128, 255], [0,0,255], [0,0,128], [0,0,63], 
          [75,0,130], [57,0,114],[128,0,255],[255,0,255],[255,0,128], [72, 36, 10], [50, 25, 7], [0,0,0]];

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
                return d.rgb_parent_colors[second_color]; 
            })
            .rollup(function(color) { return color.length})
            .entries(data);

        //radius
        var outerRadius = Math.min(width-10, height-10),
            innerRadius = Math.min(width/5, height/5),
            g = svg.append("g")
                .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
                .attr("class", "container");        
        
        //seeing which colors are present
        var barcolors = [];
        for(var i=0; i<colors.length; i++) {
            for(var j=0; j<moviesOrdered.length; j++) {
                if(colors[i].toString() === moviesOrdered[j].key) {
                    barcolors.push(colors[i]);
                }
            }
        }
        //x scale
        var x = d3.scaleBand()
          .range([0, 2 * Math.PI]) 
          .domain(barcolors); 

        // Y scale
        var y = d3.scaleLinear()
          .range([innerRadius+8, outerRadius/1.6])
          .domain(d3.extent(moviesOrdered, function(d) {
            return d.value;
          })); 

        // Add bars
        g.selectAll("path")
            .data(moviesOrdered)
            .enter()
            .append("path")
                .style("fill", function(d, i) {
                    return d3.rgb(moviesOrdered[i].key.split(",")[0], moviesOrdered[i].key.split(",")[1], moviesOrdered[i].key.split(",")[2])
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
                    .padAngle(0.05)
                    .padRadius(innerRadius))
                .attr("stroke", function(d, i) {
                    if(moviesOrdered[i].key == [255, 255, 255]) {
                        return "#d9d9d9";
                    }
                    else {
                        return "white";
                    }
                })
                .attr("stroke-width", 0.5)
                .style("opacity", 0.8)
                .on('mouseover', function (d, i) {
                    var index = i;
                    d3.select(this)
                        .style("opacity", 0.4);
                    var tx1 = svg.append("text")
                        .text(`${parseFloat(d.value/data.length*100).toFixed(1)}` + "%")
                        .attr("text-anchor", "middle")
                        .attr("x", "50%")
                        .attr("y", "53%")
                        .attr("id", "tx1")
                        .style("font-size", "30px")
                        .style("fill", function() {
                            if(moviesOrdered[index].key != [255, 255, 255]) {
                                return d3.rgb(moviesOrdered[index].key.split(",")[0], moviesOrdered[index].key.split(",")[1], moviesOrdered[index].key.split(",")[2]);
                            }
                            else {
                                return "black"
                            }
                        })
                })
                .each(function (d, i) {
                    this.i = i;
                })
                .on('mouseout', function(d) {
                    d3.select(this)
                        .style("opacity", 0.8);
                    d3.select("#tx1").remove();
                })
    }
})();