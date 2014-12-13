///////////////////////////////////////////////////////////////////////////////
//
// Sets up the "SAVE" menu button to reflect the current state of saving to 
// Firebase. 
//
// This happens through use of the exported function, setState(), which
// currently sets the icon to a green check floppy disk if saved is a success,
// a red cross floppy disk if save is unsuccessfull, and a blue download floppy
// disk if there is a save currently happening.
//
///////////////////////////////////////////////////////////////////////////////
var btn = document.getElementById('saveMe'),
    floppy = document.getElementById('floppy');

/****************************************************************************
*
*  Function to initialize the save icon. For now, it just adds an event
*  listener to the button for clicks.
*
****************************************************************************/
exports.init = function() {
  btn.addEventListener('click', function() {
    //alert(
    //  "I'm the save indicator! I'm sure I'll be more usefull in the future..." + 
    //  "but for now:\nGreen === GOOD\nRed === BAD"
    //);
  });
};

/****************************************************************************
*
*  Function to set the state of the save indicator. This function
*  should also display any helpful information to the user, like which data
*  is currently being saved, which data has been successfully saved, or an 
*  error message detailing why a save hasn't completed.
*
****************************************************************************/
exports.setState = function(state) {
  if (!state) {
    floppy.classList.remove("glyphicon-floppy-saved");
    floppy.classList.remove("glyphicon-floppy-remove");
    floppy.classList.add("glyphicon-floppy-save");
  }
  else if (state.ok) {
    floppy.classList.add("glyphicon-floppy-saved");
    floppy.classList.remove("glyphicon-floppy-remove");
    floppy.classList.remove("glyphicon-floppy-save");
  }
  else if (state.error) {
    floppy.classList.remove("glyphicon-floppy-saved");
    floppy.classList.add("glyphicon-floppy-remove");
    floppy.classList.remove("glyphicon-floppy-save");
  }
}