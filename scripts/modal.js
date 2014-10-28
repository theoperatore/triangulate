///////////////////////////////////////////////////////////////////////////////
//
// Sets up event listeners and validation for the HawkID and Azimuth Modals.
//
///////////////////////////////////////////////////////////////////////////////
var modalHawkID = document.getElementById('modal-hawkid'),
    modalAzimuth = document.getElementById('modal-azimuth'),
    modalHawkIDInput = document.getElementById('modal-hawkid-input'),
    modalAzimuthInput = document.getElementById('modal-azimuth-input'),
    modalAzimuthSignal = document.getElementById('modal-azimuth-signal-input');

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

    // add new mark to app.marks
    var mark = {};
    mark.lat = app.curr.getPosition().lat();
    mark.lng = app.curr.getPosition().lng();
    mark.az  = az;
    mark.sigStr = sig;
    mark.date = +new Date;
    app.marks.push(mark);

    // save marks to the database
    db.child(app.sessionID).update(
      { 
        "marks" : app.marks,
        "hawkID": app.hawkID
      }
    );

    // close modal
    modalAzimuthInput.value = "";
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

  // attach modal event listeners to their repsective buttons
  document.getElementById('modal-hawkid-ok').addEventListener('click', onHawkIdOk, false);
  document.getElementById('modal-azimuth-ok').addEventListener('click', onAzimuthOk, false);
  document.getElementById('modal-azimuth-cancel').addEventListener('click', onAzimuthCancel, false);
}