exports.save = function(lat, lng) {
  "use strict";
  var local = localStorage.getItem('points'),
      points = (local) ? JSON.parse(local) : [],
      out = {};

  out.latitude  = lat;
  out.longitude = lng;
  points.push(out);

  localStorage.setItem('points', JSON.stringify(points));
};

exports.load = function() {
  "use strict";
  var out = localStorage.getItem('points');
  return (out) ? JSON.parse(out) : [];
};

exports.saveComputedData = function(data) {
  "use strict";

  // expand to append to computed
  // each new array entry should be one bird
  localStorage.setItem('computed', JSON.stringify(data));
}

exports.loadComputedData = function() {
  "use strict";
  return JSON.parse(localStorage.getItem('computed')) || [];
}