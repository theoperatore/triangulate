///////////////////////////////////////////////////////////////////////////////
//
// Sets up the settings menu by setting up event listeners for changes to 
// settings, as well as saving them to the localStorage to be read from.
//
///////////////////////////////////////////////////////////////////////////////
var btnMenu = document.getElementById('settings-toggle'),
    menu_anchor = document.getElementById('settings-menu'),
    React = require('react'),
    Menu;

module.exports = function(app, map, opts, version) {

  /****************************************************************************
  *
  *  Handles showing and hiding the settings menu.
  *
  ****************************************************************************/
  btnMenu.addEventListener('click', function() {
    menu_anchor.classList.toggle('hide');
  }, false);

  Menu = React.createClass({
    getInitialState : function() {
      return (
        { checked : opts.unlocked });
    },
    handleUnlock : function(e) {
      var checked = e.target.checked;
      
      // if not unlocked, remove event listener from map immediately
      if (!checked) {
        google.maps.event.clearListeners(map, 'dragend');  
      }

      // reflect new change in state
      opts.unlocked = checked;
      this.setState({ checked : checked });
      localStorage.setItem("tri-hawk-ulate__options", JSON.stringify(opts));
    },
    render : function() {
      return(
        React.DOM.table(null,
          React.DOM.tbody(null,
            React.DOM.tr(null,
              React.DOM.td(null, "Unlock Mark"),
              React.DOM.td(null, React.DOM.input({
                type : 'checkbox',
                defaultChecked : this.state.checked,
                onChange : this.handleUnlock
              }))
            ),
            React.DOM.tr(null,
              React.DOM.td(null, "app version"),
              React.DOM.td(null, version)
            )
          )
        )
      );
    }
  });



  React.render(Menu(), menu_anchor);
  // add sessionID and version info to settings menu
  //document.getElementById('app_version').innerHTML = opts.version;
}

  
