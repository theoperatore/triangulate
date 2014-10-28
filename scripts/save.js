var btn = document.getElementById('saveMe'),

module.exports = function(app, map, opts) {

  btn.addEventListener('click', function() {
    alert("I make sure you save everything to the Database!");
  });
}