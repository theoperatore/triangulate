// core
var React = require('react');
var snap;

// require components
var TitleBar = require('./components/TitleBar');
var FunctionsBar = require('./components/FunctionsBar');
var SettingsMenu = require('./components/SettingsMenu');
var CollaborationMenu = require('./components/CollaborationMenu');
var HawkIDModal = require('./components/HawkIDModal');
var AzimuthModal = require('./components/AzimuthModal');

// maps
var map;

// other requires
var OverlayMixin = require('react-bootstrap/OverlayMixin');

// main content component
var Content = React.createClass({
  displayName: "App",
  mixins : [OverlayMixin],
  getInitialState : function() {

    // load saved sessionID
    var sessionID = parseInt(localStorage.getItem('tri-hawk-ulate__sessionID'),10);
    var needsHawkID = false;

    // check to make sure saved SessionID makes sense
    if (sessionID === void(0) || isNaN(sessionID)) {
      sessionID = +new Date;
      console.log("saving new session", sessionID);
      localStorage.setItem("tri-hawk-ulate__sessionID", sessionID);
      needsHawkID = true;
    }

    // set up the 'app' construct?
    return ({

      app : {
        sessionID : sessionID
      },
      needsHawkID : needsHawkID,
      needsAzimuth : false,
      saveState : null,
      isFinding : null,
      version : "0.9.0a"

    });
  },
  componentWillMount: function () {
      // initialize firebase reads  
  },
  componentDidMount: function () {

    // initialize the map
    var cvs = this.refs["content-map-canvas"].getDOMNode();
    cvs.style.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 100 + "px";
    //map = new google.maps.Map(
    //  cvs,
    //  { 
    //    // 4Lakes lat lng!
    //    center : new google.maps.LatLng(43.042825, -89.292592),
    //    zoom : 17
    //  }
    //);

    // initialize settings menu
    snap = new Snap({
      element : this.refs["content"].getDOMNode(),
      touchToDrag : false,
      hyperextensible : false
    });

  },
  toggleSettingsMenu : function() {
    if (snap.state().state === "right") {
      snap.close();
    }
    else {
      snap.open("right");
    }
  },
  toggleHawkMenu : function() {
    if (snap.state().state === "left") {
      snap.close();
    }
    else {
      snap.open("left");
    }
  },
  toggleHawkIDModal : function() { 
    this.setState({ needsHawkID : !this.state.needsHawkID }); 
  },
  toggleAzimuthModal : function() {
    this.setState({ needsAzimuth : !this.state.needsAzimuth });
  },
  handleHawkIDSubmit : function() {},
  handleAzimuthSubmit : function() {},
  renderOverlay : function() {

    // show the hawkID modal if we need a hawkID 
    if (this.state.needsHawkID) {
      return (<HawkIDModal onToggleOpen={this.toggleHawkIDModal} onHawkIDSubmit={this.handleHawkIDSubmit} />);
    }

    // show the azimuth modal if we are setting up a mark
    if (this.state.needsAzimuth) {
      return (<AzimuthModal onToggleOpen={this.toggleAzimuthModal} onAzimuthSubmit={this.handleAzimuthSubmit} />);
    }

    // show...nothing! hahahaha!
    return (<span/>);
  },
  render : function() {
    return(
      <div>
        <div className="snap-drawers">
          <div className="snap-drawer snap-drawer-left inverse">
            <CollaborationMenu sessionID={this.state.app.sessionID}/>
          </div>
          <div className="snap-drawer snap-drawer-right inverse">
            <SettingsMenu version={this.state.version}/>
          </div>
        </div>
        <div id="content" ref="content" className="snap-content">
          <TitleBar snap={snap} hawkid={"TestID 141.81"} toggleSettingsMenu={this.toggleSettingsMenu} toggleHawkMenu={this.toggleHawkMenu}/>
          <div ref="content-map-canvas" id="content-map-canvas"></div>
          <FunctionsBar isFinding={this.state.isFinding} saveState={this.state.saveState} />
        </div>
      </div>
    );
  }
});


// render it all!
React.render(<Content />, document.body);