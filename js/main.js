'use strict';

$(document).ready(function () {
    console.log("main.js ready");
  let movieSection = document.getElementById("moviePrediction")
  let e = movieSection.getAttribute("data-form-submit")
  
  if (e === "True") {
    movieSection.scrollIntoView();
  }    

});