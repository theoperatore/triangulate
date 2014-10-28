var btn = document.getElementById('downloadMe');

module.exports = function(app, map, opts) {

  btn.addEventListener('click', function() {

    alert("I export the database!");

  });
}