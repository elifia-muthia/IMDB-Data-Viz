'use strict';

// IIFE
(function () {
    //init data
    let data = [];
    d3.json('/load_intro_data', (d) => {
        return d;
    }).then((d) => {
        data = d['movies'];
        createVis();
    }).catch((err) => {
        console.error(err);
    });

    //createVis
    function createVis() {
        var index;
        var welcomeimages = d3.select("#welcomeimages");
        var welcomecontainer = welcomeimages.selectAll(".welcomecontainer")
            .data(data)
            .enter()
            .append("div")
                .attr("class", "welcomecontainer");
        var image = welcomecontainer.append("img")
            .each(function(d, i) {
                this.i = i;
            })
            .attr("class", "welcomeposter")
            .attr("src",  function(d, i) { 
                return data[i].image_url;
            })
            .attr("alt",  function(d, i) { 
                return data[i].movie_title;
            })
            .on("mouseover", function() {
                var pos1 = Number(data[this.i].dominant_colors_array[0][1].split("'")[1].split("'")[0]);
                var pos2 = Number(data[this.i].dominant_colors_array[1][1].split("'")[1].split("'")[0]);
                var pos3 = Number(data[this.i].dominant_colors_array[2][1].split("'")[1].split("'")[0]);
                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", this.width)
                    .attr("height", this.height * pos1)
                    .style("fill", data[this.i].dominant_colors_array[0][0].split("'")[1].split("'")[0]);
                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", this.height * pos1)
                    .attr("width", this.width)
                    .attr("height", this.height * pos2)
                    .style("fill", data[this.i].dominant_colors_array[1][0].split("'")[1].split("'")[0]);
                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", this.height * pos1 + this.height * pos2)
                    .attr("width", this.width)
                    .attr("height", this.height * pos3)
                    .style("fill", data[this.i].dominant_colors_array[2][0].split("'")[1].split("'")[0]);
                d3.select(this).transition().duration(0).style("opacity", 0);
                
            })
            .on("mouseout", function() {
                d3.select(this).transition().duration(0).style("opacity", 1);
                svg.selectAll("rect").remove();
            });
        var svg = welcomecontainer.append("svg")
            .attr("width", "100%")
            .attr("height", "100%");
    }
})();