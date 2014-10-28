///////////////////////////////////////////////////////////////////////////////
//
// Sets up the settings menu by setting up event listeners for changes to 
// settings, as well as saving them to the localStorage to be read from.
//
///////////////////////////////////////////////////////////////////////////////
module.exports = function(app, map, opts) {

  // set up settings menu
  btnMenu.addEventListener('click', function() {
    document.getElementById('settings-menu').classList.toggle('hide');
  }, false);

  // add sessionID and version info to settings menu
  document.getElementById('app_version').innerHTML = version;
  document.getElementById('session_id').innerHTML = app.sessionID;
}

  
