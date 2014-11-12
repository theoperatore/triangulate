///////////////////////////////////////////////////////////////////////////////
//
// Handles what happens when the user uses the spyglass button to find their
// current location.
//
///////////////////////////////////////////////////////////////////////////////
var info = new google.maps.InfoWindow(),
    spin = document.getElementById('spinner'),
    glyph= document.getElementById('glyph'),
    div  = document.createElement('div'),
    save = document.createElement('button'),
    btn = document.getElementById('findMe'),
    modalAzimuth = document.getElementById('modal-azimuth'),
    modalHawkID = document.getElementById('modal-hawkid'),
    utils = require('./utilities');

// main export function
module.exports = function(app, map, opts) {


  /****************************************************************************
  *
  *  Function to open the azimuth modal when the user tries to save a new mark
  *
  ****************************************************************************/
  function onSave() { 
    console.log('attempting to save location',
      app.curr.getPosition().lat(),
      app.curr.getPosition().lng()
    );
    modalAzimuth.classList.remove('hide');
  }

  /****************************************************************************
  *
  *  Set up the event listener for the FIND ME spyglass button.
  *
  *  Uses the window.navigator and window.navigator.geolocation function to 
  *  obtain the user's current gps location and sets up a marker at the 
  *  current location to be added if needed.
  *
  ****************************************************************************/
  btn.addEventListener('click', function() {
    if (navigator && navigator.geolocation) {

      glyph.classList.toggle('hide');
      spin.classList.toggle('hide');
      map.setZoom(opts.zoom);

      // if the hawkId hasn't been set, set it now.
      if (app.hawkID === "") {
        modalHawkID.classList.remove('hide');
      }

      // remove any event listeners before attaching them again.
      google.maps.event.clearListeners(app.curr, "click");
      google.maps.event.clearListeners(map, "drag");

      // FIND ME!
      navigator.geolocation.getCurrentPosition(

        /**********************************************************************
        *
        *  Function to handle the successful acquiring of the user's current
        *  gps location.
        *
        **********************************************************************/
        function(loc) {
          var pos = new google.maps.LatLng(
                loc.coords.latitude,
                loc.coords.longitude
              ),
              dms = utils.convertToDMS(pos);

          app.curr.setPosition(pos);
          app.curr.setMap(map);

          map.setCenter(pos);

          save.classList.add('sBtn', 'iBtn', 'good');
          save.innerHTML = "Save";
          save.removeEventListener('click', onSave, false);
          save.addEventListener('click', onSave, false);

          div.innerHTML = dms;
          div.appendChild(save);

          info.setContent(div);
          info.open(map, app.curr);

          // allow info window to be opened again if closed
          google.maps.event.addListener(app.curr, 'click', function() {
            info.open(map, app.curr);
          });

          // close window when dragging the map
          google.maps.event.addListener(map, 'drag', function() {
            info.close();
          })

          // debug/unlock mode
          if (opts.unlocked) {
            google.maps.event.clearListeners(map, 'dragend');
            google.maps.event.addListener(map, 'dragend', function() {
              
              app.curr.setPosition(map.getCenter());
              dms = utils.convertToDMS(map.getCenter());

              save.classList.add('sBtn');
              save.classList.add('good');
              save.innerHTML = "Save";
              save.removeEventListener('click', onSave, false);
              save.addEventListener('click', onSave, false);

              div.innerHTML = dms;
              div.appendChild(save);

              info.setContent(div);
              
            });
          }
          
          // let user know GPS is finished
          glyph.classList.toggle('hide');
          spin.classList.toggle('hide');
            
        },

        /**********************************************************************
        *
        *  Function to handle if there is an error obtaining the user's current
        *  gps location.
        *
        **********************************************************************/
        function(err) {
          if (console.error) {
            alert("Error, check the console for more info: " + err);
            console.error("Error using navigator.getCurrentPosition", err);
            glyph.classList.toggle('hide');
            spin.classList.toggle('hide');
          }
        },

        // options
        { enableHighAccuracy: true });
    }
    else {
      alert("GAH! Your browser does not support the GPS function!");
    }
  });
}