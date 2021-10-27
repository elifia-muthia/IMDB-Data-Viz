'use strict';

// IIFE
(function () {
    // Init data
    let data = [];

    // Fetch json data
    d3.csv('../../static/data/movie_data.csv', (d) => {

        return d;
    }).then((d) => {
        // Redefine data
        data = d;
        console.log(data);

        createVis();
    }).catch((err) => {

        console.error(err);
    });

    /*
     Function :: createVis()
     */

    function createVis() {
        function hex_brightness(color) {
            const hex = color.split("#")[1];
            const c_r = parseInt(hex.substr(0, 2), 16);
            const c_g = parseInt(hex.substr(2, 2), 16);
            const c_b = parseInt(hex.substr(4, 2), 16);
            const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
            return brightness;
        }

        //going to make squares 100 by 50
        // Get svg
        var svg = d3.select("body").append("svg")
            .attr("width", 800)
            .attr("height", 400)
        //scales
        var xscale = d3.scaleLinear()
            .range([0, svg.attr("width")])
            .domain([0, 100]);
        var yscale = d3.scaleLinear()
            .range([0, svg.attr("height")])
            .domain([0, 50]);
                
        //create squares
        var x = 0;
        var y = 0;
        var squares = svg.append("g")
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .style("fill", function (d, i) {
                if (data[i].dominant_color) {
                    var color = data[i].dominant_color;
                    if (hex_brightness(color) > 70) {
                        return color;
                    }
                    else {
                        //finding secondary color
                        /*
                        var dom_colors_array = data[i].dominant_colors_array.split(",");
                        var dom_colors = [];
                        dom_colors_array.forEach(function(element, i) {
                            if(i%2==0) {
                                dom_colors.push(element.split("'")[1]);
                            }
                            else {
                                dom_colors.push(element.split("]")[0]);
                            }
                        });
                        var sec_color = 1;
                        for(var j=0; j<dom_colors.length; j++) {
                            if(j%2 !== 0) {
                                if(dom_colors[j]>dom_colors[sec_color]) {
                                    if(dom_colors[j-1] !== color) {
                                        sec_color = j-1;
                                    }
                                }
                            }
                        } */
                        return data[i].dominant_colors_array.split("'")[3];
                        //second color
                    }
                }  
            })
            .attr("x", function(d) {
                if (x > 99) {
                    x = 0;
                }
                else {
                    x = x+1;
                }
                return xscale(x);
            })
            .attr("y", function(d) {
                if (y > 49) {
                    y = 0;
                }
                else {
                    y = y+1;
                }
                return yscale(y);
            })
            .attr("width", 8)
            .attr("height", 8);
       
    }
})();