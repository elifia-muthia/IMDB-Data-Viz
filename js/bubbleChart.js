'use strict';

// IIFE
(function () {
    var genre;
    var filter;
    var sec_color;
    //init data

    let data = [];
    d3.json('/load_top_data', (d) => {
        return d;
    }).then((d) => {
        data = d['movies'];
        filter = "profit";
        sec_color = "no";
        createVis(data);
    }).catch((err) => {
        console.error(err);
    });

    // event listeners for dropdown menus
    
    d3.select('#genreDropdown')
        .on('change', function() {
            d3.select(this).selectAll('option')
                .each(function() {
                    if (this.selected) {
                        genre = this.value;
                        d3.json(`/load_genre_data/${genre}`, function(d) {
                            return d;
                        }).then((d) => {
                            data = d['movies'];
                            updateVis(data, filter, sec_color);
                            //createVis(data, filter, sec_color);
                        }).catch((err) => {
                            console.error(err);
                        })
                    }
                })
        });
    d3.select('#filterDropdown')
        .on('change', function() {
            d3.select(this).selectAll('option')
                .each(function() {
                    if (this.selected) {
                        filter = this.value;
                        console.log(filter);
                        updateVis(data, filter, sec_color);
                    }
                })
        });
    d3.select('#includeSecColor')
        .on('change', function() {
            d3.select(this).selectAll('option')
                .each(function() {
                    if (this.selected) {
                        sec_color = this.value;
                        console.log(sec_color);
                        updateVis(data, filter, sec_color);
                    }
                })
        });
    //SVG 
    var svg = d3.select("#bubbleChart"), 
        width = svg.attr("width"),
        height = svg.attr("height");
    //setup
    var margin = {top: 50, right: 50, bottom: 50, left: 50},
        plot_dx = svg.attr("width") - margin.right - margin.left,
        plot_dy = svg.attr("height") - margin.top - margin.bottom;
    var colors = [[255,255,255],  [63,0,0], [128,0,0],[200,0,0],[255,0,0],[255,128,0],[255,163,51],[255,255,0], 
            [238,221,130], [255,218,185], [222,184,135], [128,255,0],[0,255,0], [0,100,0], [0,75,0], [1, 50,32],
          [0,255,128],[0, 255, 255], [173,216,230], [134,197,218], [0, 128, 255], [0,0,255], [0,0,128], [0,0,63], 
          [75,0,130], [57,0,114],[128,0,255],[255,0,255],[255,0,128], [72, 36, 10], [50, 25, 7], [0,0,0]]
    //yscale
    var yscale1 = d3.scaleOrdinal() //needs to distribute based on grouped color
        .domain(colors)
        .range([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]);
    var yscale2 = d3.scaleLinear() //needs to distribute based on grouped color
        .domain([1, 32])
        .range([plot_dy, margin.top]);

    for (var i in colors) {
        svg.append("rect")
            .attr("x", 10)
            .attr("y", yscale2(yscale1(colors[i])))
            .attr("width", "5px")
            .attr("height", (plot_dy)/32)
            .style("opacity", 0.6)
            .style("fill", function() {
                return d3.rgb(colors[i][0], colors[i][1], colors[i][2]);
            })
    }
    //createVis
    function createVis(data) {
        var xscale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) {
                return parseFloat(d.gross);
            })) 
            .range([margin.left, plot_dx]);
        var yscale = d3.scaleLinear() //needs to distribute based on grouped color
            .domain([0, 1])
            .range([plot_dy, margin.top]);
        var circleScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) {
                return parseFloat(d.gross);
            }))
            .range([10, 50]);

        //axes
        var axis_x = d3.axisBottom(plot_dx)
            .tickSize(5)
            .scale(xscale)
            .tickFormat(d3.format("1"));
        svg.append("g")
            .attr("id", "axis_x")
            .attr("transform", "translate(0," + (plot_dy + margin.bottom / 2) + ")")
            .call(axis_x
                .ticks(5));
        svg.append("text")  
            .attr("class", "xLabel")
            .attr("x", width/2 )
            .attr("y", height-30 )
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text("Movie Gross (USD)");
        //creating bubbles
        svg.append("g")
            .attr("class", "circleGroup")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
                .on("mouseover", function(d, i) {
                    d3.select('#movieImageContainer').selectAll("img").remove();
                    d3.select('#movieTitle').selectAll("text").remove();
                    d3.select('#movieMetaData').selectAll("text").remove();
                    d3.select('#colorsSvg').selectAll("rect").remove();
                    let poster = d3.select(".moviePoster")
                        .remove();
                    d3.select(this).style("opacity", 1);
                    var image = d3.select('#movieImageContainer')
                        .append("img")
                        .attr("class", "moviePoster")
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .attr("src", d.image_url)
                        .attr("alt", d.movie_title);
                    d3.select('#movieTitle').append("text")
                        .text(d.movie_title);
                    d3.select('#movieYear').append("text")
                        .text("Year: " + parseInt(d.title_year));
                    d3.select('#movieGenre').append("text")
                        .text("Genres: " + d.genres);
                    d3.select('#movieRating').append("text")
                        .text("Rating: " + d.content_rating);
                    d3.select('#movieGross').append("text")
                        .text("Gross: " + parseInt(d.gross));
                    d3.select('#movieBudget').append("text")
                        .text("Budget: " + parseInt(d.budget));
                    d3.select('#movieScore').append("text")
                        .text("IMDb Score: " + parseFloat(d.imdb_score));
                    var pos1 = Number(d.dominant_colors_array[0][1].split("'")[1].split("'")[0])*100;
                    var pos2 = Number(d.dominant_colors_array[1][1].split("'")[1].split("'")[0])*100;
                    var pos3 = Number(d.dominant_colors_array[2][1].split("'")[1].split("'")[0])*100;
                    d3.select("#colorsSvg").append("rect")
                        .attr("width", `${pos1}%`)
                        .attr("height", "100%")
                        .attr("x", 0)
                        .attr("y", 0)
                        .style("fill", d.dominant_colors_array[0][0].split("'")[1].split("'")[0]);
                    d3.select("#colorsSvg").append("rect")
                        .attr("width", `${pos2}%`)
                        .attr("height", "100%")
                        .attr("x", `${pos1}%`)
                        .attr("y", 0)
                        .style("fill", d.dominant_colors_array[1][0].split("'")[1].split("'")[0]);
                    d3.select("#colorsSvg").append("rect")
                        .attr("width", `${pos3}%`)
                        .attr("height", "100%")
                        .attr("x", `${pos1 + pos2}%`)
                        .attr("y", 0)
                        .style("fill", d.dominant_colors_array[2][0].split("'")[1].split("'")[0]);
                })
                .on("mouseout", function(d, i) {
                    d3.select(this).style("opacity", 0.6);
                })
            .style("fill", function(d, i) {
                return data[i].dominant_color;              
            })
            .style("opacity", 0.6)
            .style("stroke", "black")
            .style("stroke-width", 0.2)
            .attr("r", function(d, i) {
                return circleScale(data[i].gross);
            })
            .attr("cx", function(d, i) {
                return xscale(data[i].gross)
            })
            .each(function(d, i) {
                var second_color;
                var dom_color;
                if(data[i].dominant_colors_array[0][0].split("'")[1].split("'")[0] == data[i].dominant_color) {
                    second_color = 1;
                }
                else {
                    second_color = 0;
                }
                for(var n=0; n<3; n++) {         
                    if(data[i].dominant_colors_array[n][0].split("'")[1].split("'")[0] != data[i].dominant_color) {
                        if (Number(data[i].dominant_colors_array[n][1].split("'")[1].split("'")[0]) > Number(data[i].dominant_colors_array[second_color][1].split("'")[1].split("'")[0])) {
                            second_color = n;
                        }
                    }
                    else {
                        dom_color = n;
                    }
                }
                this.second_color = second_color;
                this.dom_color = dom_color;
            })
            .attr("cy", function(d, i) {
                return yscale2(yscale1(data[i].rgb_parent_colors[this.dom_color])) + (plot_dy)/64;
            });
    }
    function updateVis(newdata, filter, sec_color) {
        //scales
        var xscale = d3.scaleLinear();
        if(filter=="date") {
            xscale.domain(d3.extent(data, function(d) {
                return d.title_year;
            }))
                .range([margin.left, plot_dx]);
        }
        else if(filter=="profit"){
            xscale.domain(d3.extent(data, function(d) {
                return parseFloat(d.gross);
            })) 
                .range([margin.left, plot_dx]);
        }
        else {
            xscale.domain(d3.extent(data, function(d) {
                return parseFloat(d.imdb_score);
            })) 
                .range([margin.left, plot_dx]);
        }
        var yscale = d3.scaleLinear() //needs to distribute based on grouped color
            .domain([0, 1])
            .range([plot_dy, margin.top]);
        var circleScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) {
                return parseFloat(d.gross);
            }))
            .range([10, 50]);
        //axes
        var axis_x = d3.axisBottom(plot_dx)
            .tickSize(5)
            .scale(xscale)
            .tickFormat(d3.format("1"));
        var axisxGroup = svg.select("g")
            .attr("id", "axis_x")
            .attr("transform", "translate(0," + (plot_dy + margin.bottom / 2) + ")")
            .call(axis_x
                .ticks(5));
        svg.select(".xLabel")  
            .attr("x", width/2 )
            .attr("y", height-30 )
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text(function() {
                if(filter=="date") {
                    return "Title Year"
                }
                if(filter=="profit") {
                    return "Movie Gross (USD)"
                }
                if(filter=="score") {
                    return "IMDb Score"
                }
        });
        var circles = d3.selectAll("circle")
            .data(newdata)
            .transition()
            .duration(1000)
            .style("opacity", 0.6)
            .style("stroke", "black")
            .style("stroke-width", 0.2)
            .attr("r", function(d, i) {
                return circleScale(data[i].gross);
            })
            .each(function(d, i) {
                var second_color;
                var dom_color;
                if(data[i].dominant_colors_array[0][0].split("'")[1].split("'")[0] == data[i].dominant_color) {
                    second_color = 1;
                }
                else {
                    second_color = 0;
                }
                for(var n=0; n<3; n++) {         
                    if(data[i].dominant_colors_array[n][0].split("'")[1].split("'")[0] != data[i].dominant_color) {
                        if (Number(data[i].dominant_colors_array[n][1].split("'")[1].split("'")[0]) > Number(data[i].dominant_colors_array[second_color][1].split("'")[1].split("'")[0])) {
                            second_color = n;
                        }
                    }
                    else {
                        dom_color = n;
                    }
                }
                this.second_color = second_color;
                this.dom_color = dom_color;
            })
            .attr("cx", function(d, i) {
                if(filter=="date") {
                    return xscale(data[i].title_year);
                }
                else if(filter=="profit"){
                    return xscale(data[i].gross)
                }
                else {
                    return xscale(data[i].imdb_score)
                }
            })
            .style("fill", function(d, i) {
                if(sec_color == "no") {
                    return data[i].dominant_color;
                }
                else {
                    if(hex_brightness(data[i].dominant_color) > 40 && hex_brightness(data[i].dominant_color) < 250) {
                        return data[i].dominant_color;
                    }
                    else {
                        return data[i].dominant_colors_array[this.second_color][0].split("'")[1].split("'")[0];
                    
                    }
                }                
            })
            .attr("cy", function(d, i) {
                if(sec_color == "no") {
                    return yscale2(yscale1(data[i].rgb_parent_colors[this.dom_color])) + (plot_dy)/64;
                }
                else {
                    if(hex_brightness(data[i].dominant_color) > 35 && hex_brightness(data[i].dominant_color) < 250) {
                        return yscale2(yscale1(data[i].rgb_parent_colors[this.dom_color])) + (plot_dy)/64;
                    }
                    else {
                        return yscale2(yscale1(data[i].rgb_parent_colors[this.second_color])) + (plot_dy)/64;
                    
                    }
                } 
            });
        function hex_brightness(color) {
            const hex = color.split("#")[1];
            const c_r = parseInt(hex.substr(0, 2), 16);
            const c_g = parseInt(hex.substr(2, 2), 16);
            const c_b = parseInt(hex.substr(4, 2), 16);
            const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
            return brightness;
        }
    }
})();