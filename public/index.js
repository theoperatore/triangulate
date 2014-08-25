var cvs = document.createElement('canvas'),
    ctx = cvs.getContext('2d'),
    map,
    opts = {};

cvs = require('hd-canvas')(cvs, window.innerWidth, window.innerHeight * (3/4));
document.body.appendChild(cvs);
document.addEventListener('resize', function() {
  cvs= require('hd-canvas')(cvs, window.innerWidth, window.innerHeight * (3/4));
}, false);

// initial text
ctx.beginPath();
ctx.font = "100 24px 'Helvetica Neue', 'Helvetica' ";
ctx.fillText("fetching location...", 0,
  (parseInt(cvs.style.height) ? parseInt(cvs.style.height) / 2 : cvs.height/2)
);

if (navigator && navigator.geolocation) {
  var pos = navigator.geolocation.getCurrentPosition(
    // success
    function(loc) {
      console.log(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy, loc);
    },
    function(error) {
      console.log(error);
    }, {enableHighAccuracy: true});
}

//map = new google.maps.Map(cvs, opts);
