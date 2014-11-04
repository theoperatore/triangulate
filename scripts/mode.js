///////////////////////////////////////////////////////////////////////////////
//
// Sets up the "NEW" main menu button.
//
// Also sets up collaboration and snapshot modes, as well as starting to track
// a new hawk by reinitializing the app.
//
// Collaboration mode allows multiple users to track the same hawk in real-time
// by setting the same app.sessionID across mutliple devices and pulling in 
// the most recent data from the database.
//
// Snapshot Mode allows users to either type in a sessionID or select from a
// history of sessionIDs from the current device. However, the user will not be
// able to manipulate any of the saved data by default. The user will have to 
// go into the settings menu and manually select a checkbox that will allow
// the saving/deleting of data.
//
// Both of these modes will end the current session.
//
// The "Track New Hawk" button will reinitialize the app and get ready to 
// track a new hawk. 
//
///////////////////////////////////////////////////////////////////////////////
var btn = document.getElementById('clearMe'),
    mmenu = document.getElementById('mode-menu'),
    nmode = document.getElementById('nmode'),
    cmode = document.getElementById('cmode'),
    smode = document.getElementById('smode'),
    modalCollaborate = document.getElementById('modal-collaborate'),
    modalSnapshot = document.getElementById('modal-snapshot'),
    collaborateID = document.getElementById('collaborate-sessionid'),
    snapshotSelect = document.getElementById('modal-snapshot-select');

module.exports = function(app, snaps, map, opts) {

  /****************************************************************************
  *
  *  Event Listener for Normal Mode, track new hawk, Button.
  *
  *  This will reinitialize the app by erasing any polygons, lines, marks on
  *  the screen as well as reinitialize this device with a new sessionID.
  *
  *  This function DOES NOT in any way update the database. It only handles the
  *  local app object
  *
  ****************************************************************************/
  nmode.addEventListener('click', function() {

    // visually erase saved Markers
    app.marks.forEach(function(mark) {
      mark.m.setMap(null);
      mark.l.setMap(null);
      mark.m = null;
      mark.l = null;
      mark.i = null;
    });

    // delete and reinitialize properties
    app.hawkID = "";
    app.marks.length = 0;
    app.intersects.length = 0;
    if (app.apiPolygon) app.apiPolygon.setMap(null);
    if (app.apiCircle) app.apiCircle.setMap(null);
    if (app.apiCMark) app.apiCMark.setMap(null);
    delete app.triCenter;
    delete app.triDiameter;
    delete app.apiPolygon;
    delete app.apiCircle;
    delete app.apiCMark;

    // get and save new sessionID
    var oldID = app.sessionID;
    app.sessionID = +new Date;
    localStorage.setItem("tri-hawk-ulate__sessionID", app.sessionID);
    console.log("saved new sessionID upon clear", app.sessionID);

    // reset database reads
    require('./database').setRead(oldID, app);

    // update settings menu with session id and clear hawkID display
    document.getElementById('session_id').innerHTML = app.sessionID;
    document.getElementById('hawkID').innerHTML = "";
    document.getElementById('modal-hawkid').classList.remove('hide');

    // add new sessionID to the snapshot database
    snaps.push({ id : app.sessionID });

    // close mode menu
    mmenu.classList.add('hide');
  }, false);

  /****************************************************************************
  *
  *  Event listener for inititating collaboration mode. Opens collaboration
  *  modal to enter a sessionID.
  *
  ****************************************************************************/
  cmode.addEventListener("click", function() {
    collaborateID.innerHTML = app.sessionID;
    modalCollaborate.classList.remove('hide');
    mmenu.classList.add("hide");
  }, false);

  /****************************************************************************
  *
  *  Event Listener for viewing past snapshots. Loads a list of all dates from
  *  the database.
  *
  ****************************************************************************/
  smode.addEventListener('click', function() {

    // read all saved sessionIDs
    snaps.once("value", function(ids) {

      // loop through and set as an option, newest to oldest
      var keys = Object.keys(ids.val());

      for (var i = keys.length - 1, id; i >= 0; i--) {
        var opt = document.createElement("option"),
            dateOpts = {};

        dateOpts.weekday = "short";
        dateOpts.month = "short";
        dateOpts.day = "numeric";
        dateOpts.year = "numeric";
        dateOpts.hour = "numeric";
        dateOpts.minute = "numeric";
        dateOpts.second = "numeric";

        id = keys[i];
        opt.value = ids.val()[id].id;
        opt.innerHTML = new Date(ids.val()[id].id).toLocaleString("en-US", dateOpts);
        snapshotSelect.appendChild(opt);

      };

      // let the user know the loading is done.
      document.getElementById('snapshot-select-default').innerHTML = "Select a Date";
      snapshotSelect.disabled = false;
    });


    modalSnapshot.classList.remove('hide');
    mmenu.classList.add('hide');
  }, false);

  /****************************************************************************
  *
  *  Event Listener to show the mode menu when the user clicks on the "NEW"
  *  main menu button.
  *
  ****************************************************************************/
  btn.addEventListener('click', function() {
    mmenu.classList.toggle("hide");
  }, false);
}