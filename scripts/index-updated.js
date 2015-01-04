// core
var React = require('react');
var snap;

// require components
var TitleBar = require('./components/titleBar');
var MainMenu = require('./components/mainMenu');
var Settings = require('./components/settings');

// maps
var map;

// main content component
var Content = React.createClass({
  displayName: "Main Content",
  getInitialState : function() {
    return ({});
  },
  toggleSettingsMenu : function() {
    if (snap.state().state === "right") {
      snap.close();
    }
    else {
      snap.open("right");
    }
  },
  componentDidMount: function () {

    // initialize the map
    var cvs = this.refs["content-map-canvas"].getDOMNode();
    cvs.style.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 100 + "px";

    map = new google.maps.Map(
      cvs,
      { 
        zoom : 17,
        center : new google.maps.LatLng(43.042825, -89.292592)
        // 4Lakes lat lng!
      }
    );

    snap = new Snap({
      element : this.refs["content"].getDOMNode(),
      touchToDrag : false,
      hyperextensible : false,
      tapToClose : false
    });

    // initialize firebase?
  },
  render : function() {
    return(
      <div>
        <div className="snap-drawers">
          <div className="snap-drawer snap-drawer-left"></div>
          <div className="snap-drawer snap-drawer-right inverse">
            <Settings version={"0.9.0a"}/>
          </div>
        </div>
        <div id="content" ref="content" className="snap-content">
          <TitleBar snap={snap} hawkid={"TEST RALF"} toggleMenu={this.toggleSettingsMenu}/>
          <div ref="content-map-canvas" id="content-map-canvas"></div>
          <div>
            <MainMenu />
          </div>
        </div>
      </div>
    );
  }
});


// render it all!
React.render(<Content />, document.body);