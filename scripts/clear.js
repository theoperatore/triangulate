var btn = document.getElementById('clearMe');

module.exports = function(app, map, opts) {

  btn.addEventListener('click', function() {

    alert("I make the app start tracking a new Hawky!");

  });
}