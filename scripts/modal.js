///////////////////////////////////////////////////////////////////////////////
//
// Sets up event listeners and validation for the HawkID and Azimuth Modals.
//
///////////////////////////////////////////////////////////////////////////////
var modalHawkID = document.getElementById('modal-hawkid'),
    modalAzimuth = document.getElementById('modal-azimuth'),
    modalCollab = document.getElementById('modal-collaborate'),
    modalSnapshot = document.getElementById('modal-snapshot'),
    modalHawkIDInput = document.getElementById('modal-hawkid-input'),
    modalAzimuthInput = document.getElementById('modal-azimuth-input'),
    modalAzimuthSignal = document.getElementById('modal-azimuth-signal-input'),
    modalCollabInput = document.getElementById('modal-collaborate-input'),
    modalSnapshotSelect = document.getElementById('modal-snapshot-select'),
    save = require('./save'),
    dbHandler = require('./database');

module.exports = function(app, db, map, opts) {

  /****************************************************************************
  *
  *  Function event for the HawkID modal 'Ok' button. 
  *
  *  Validates only that there is an ID--a valid ID can be anything that
  *  doesn't result in undefined or an empty string.
  *
  *  Assigns app.hawkID to the inputted ID, then sets the display id. This
  *  function does not save to the database.
  *
  ****************************************************************************/
  function onHawkIdOk() {
    
    // get hawkid input
    id = modalHawkIDInput.value.trim();

    // validate
    if (id === (void(0)) || id === "") {
      alert('Please enter a valid hawk ID');
      return false;
    }

    // set tracking name at top
    app.hawkID = id;
    document.getElementById('hawkID').innerHTML = id;

    // save hawkID to database
    save.setState(null);
    db.child(app.sessionID).update({
      "hawkID" : app.hawkID
    }, function(err) {
      if (err) {
        save.setState({ error : err});
      }
      else {
        save.setState({ ok : true });
      }
    });

    // close modal
    modalHawkIDInput.value = "";
    modalHawkID.classList.add('hide');
  }

  /****************************************************************************
  *
  *  Function event for ok button on the Azimuth Modal.
  *
  *  Takes azimuth input and seleced signal strength input and validates both.
  *  A valid azimuth is an input that can be parsed as an integer. A valid 
  *  signal strength is any option that isn't the first option, which is a 
  *  label.
  *
  ****************************************************************************/
  function onAzimuthOk() {
    var azStr, az, sig;

    // get azimuth input
    azStr = modalAzimuthInput.value.trim();
    az = parseInt(azStr, 10);

    // validate that it's an integer
    if (isNaN(az) || az === void(0)) {
      alert('Need a valid Azimuth to Tri-hawk-ulate!');
      return;
    }

    // get signal strength and validate that a selection has been made
    sig = modalAzimuthSignal.options[modalAzimuthSignal.selectedIndex].value;
    if (sig === "null") {
      alert("Please select a Signal Strength");
      return;
    }

    // validate hawkID one more time in case something crazy unexpected happens
    if (app.hawkID === "") {
      alert("Oh Snap! Enter a HawkID to track and try saving again.");
      modalAzimuth.classList.add('hide');
      modalHawkID.classList.remove('hide');
      return;
    }

    // push new mark to the database
    save.setState(null);
    db.child(app.sessionID).child("marks").push({
      lat : app.curr.getPosition().lat(),
      lng : app.curr.getPosition().lng(),
      az  : az,
      sig : sig,
      date: +new Date
    }, function(err) {
      if (err) {
        save.setState({ error : err });
      }
      else {
        save.setState({ ok : true });
      }
    });

    // close modal
    modalAzimuthInput.value = "";
    modalAzimuthSignal.value = "null";
    modalAzimuth.classList.add('hide');
  }

  /****************************************************************************
  *
  *  Function for handling the cancel button on the Azimuth Modal.
  *
  ****************************************************************************/
  function onAzimuthCancel() {
    modalAzimuth.classList.add('hide');
  }

  /****************************************************************************
  *
  *  Function for handling the set up of collaboration mode.
  *
  ****************************************************************************/
  function onCollabOk() {
    var collaborateID;
    
    // validate that sessionID is a number.
    console.log("trying collaborate sessionID", modalCollabInput.value)
    collaborateID = parseInt(modalCollabInput.value);
    if (isNaN(collaborateID) || collaborateID === void(0)) {
      alert("Bummer! Please enter a valid sessionID number");
      return;
    }

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
    app.sessionID = collaborateID;
    localStorage.setItem("tri-hawk-ulate__sessionID", app.sessionID);
    console.log("saved new sessionID on collaborate", app.sessionID);

    dbHandler.setRead(oldID, app);
    modalCollab.classList.add('hide');

    console.log("collaboration mode set", app.sessionID);
  }

  /****************************************************************************
  *
  *  Function for handling the cancel button on the Collaboration Modal.
  *
  ****************************************************************************/
  function onCollabCancel() {
    modalCollab.classList.add('hide');
  }

  /****************************************************************************
  *
  *  Function for loading a particular session from the Snapshot Modal.
  *
  ****************************************************************************/
  function onSnapshotOk() {
    var selected = modalSnapshotSelect.options[modalSnapshotSelect.selectedIndex].value;

     // visually erase saved Markers to get ready for saved data
    app.marks.forEach(function(mark) {
      mark.m.setMap(null);
      mark.l.setMap(null);
      mark.m = null;
      mark.l = null;
      mark.i = null;
    });

    // delete and reinitialize properties to get ready for saved data
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

    // get old session ID and save snapshot id
    var oldID = app.sessionID;
    app.sessionID = parseInt(selected,10);
    localStorage.setItem("tri-hawk-ulate__sessionID", app.sessionID);
    console.log("saved new sessionID on snapshot", app.sessionID);

    // get data and close modal
    dbHandler.setRead(oldID, app);
    modalSnapshot.classList.add('hide');

    // clear snapshots from select
    while (modalSnapshotSelect.firstChild) {
      modalSnapshotSelect.removeChild(modalSnapshotSelect.firstChild);
    }

    var first = document.createElement('option');
    first.id = 'snapshot-select-default';
    first.value = "null";
    first.selected = true;
    first.disabled = true;
    first.innerHTML = "Loading...";
    modalSnapshotSelect.disabled = true;
    modalSnapshotSelect.appendChild(first);
    console.log("snapshot set", app.sessionID);
  }

  /****************************************************************************
  *
  *  Function for handling the cancel button on the Snapshot Modal.
  *
  ****************************************************************************/
  function onSnapshotCancel() {
    modalSnapshot.classList.add('hide');

    // clear snapshots from select
    while (modalSnapshotSelect.firstChild) {
      modalSnapshotSelect.removeChild(modalSnapshotSelect.firstChild);
    }

    var first = document.createElement('option');
    first.id = 'snapshot-select-default';
    first.value = "null";
    first.selected = true;
    first.disabled = true;
    first.innerHTML = "Loading...";
    modalSnapshotSelect.disabled = true;
    modalSnapshotSelect.appendChild(first);
  }

  // attach modal event listeners to their repsective buttons
  document.getElementById('modal-hawkid-ok').addEventListener('click', onHawkIdOk, false);
  document.getElementById('modal-azimuth-ok').addEventListener('click', onAzimuthOk, false);
  document.getElementById('modal-azimuth-cancel').addEventListener('click', onAzimuthCancel, false);
  document.getElementById('modal-collaborate-ok').addEventListener('click', onCollabOk, false);
  document.getElementById('modal-collaborate-cancel').addEventListener('click', onCollabCancel, false);
  document.getElementById('modal-snapshot-ok').addEventListener('click', onSnapshotOk, false);
  document.getElementById('modal-snapshot-cancel').addEventListener('click', onSnapshotCancel, false);
}