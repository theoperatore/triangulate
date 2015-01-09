// core
var config = require('../config');
var React = require('react');
var Firebase = require('firebase');
var db = new Firebase(config.dataDB);
var sessiondb = new Firebase(config.sessionDB);
var hawkdb = new Firebase(config.hawkDB); 
var map;
var snap;

// require components
var TitleBar = require('./components/TitleBar');
var FunctionsBar = require('./components/FunctionsBar');
var SettingsMenu = require('./components/SettingsMenu');
var CollaborationMenu = require('./components/CollaborationMenu');
var HawkIDModal = require('./components/HawkIDModal');
var AzimuthModal = require('./components/AzimuthModal');
var CollaborationModal = require('./components/CollaborationModal');

// other requires
var OverlayMixin = require('react-bootstrap/OverlayMixin');
var utils = require('./triUtilities');
var mapUtils = require('./mapUtilities');
var dbUtils = require('./dbUtilities');

// main content component
var Content = React.createClass({
  displayName: "App",
  mixins : [OverlayMixin],
  getInitialState : function() {

    // vars
    var app = {};
    var sessionID = parseInt(localStorage.getItem('tri-hawk-ulate__sessionID'),10);
    var needsHawkID = false;
    var settings = JSON.parse(localStorage.getItem('tri-hawk-ulate__options')) || {
      zoom   : 17,
      azDist : 4828.03, // 3 miles
      unlock : false,   // allow marker to be dragged with center of map
      tap : true,       // allow user to tap to place marker
      watch : false     // find button toggle's GPS watchLocation
    };

    // check to make sure saved SessionID makes sense
    if (sessionID === void(0) || isNaN(sessionID)) {
      sessionID = +new Date;
      console.log("saving new session", sessionID);
      localStorage.setItem("tri-hawk-ulate__sessionID", sessionID);
      needsHawkID = true;
    }

    // set up the 'app' construct?
    app.sessionid = sessionID;
    app.hawkid = "";
    app.marks = [];
    app.curr = new google.maps.Marker();
    app.currInfo = new google.maps.InfoWindow();
    app.intersects = [];
    app.apiPolygon = null;
    app.apiCircle = null;
    app.apiCMark = new google.maps.Marker();
    app.triCenter = {};
    app.triDiameter = -1;

    // initial state
    return ({
      app : app,
      settings : settings,
      needsHawkID : needsHawkID,
      needsAzimuth : false,
      needsCollaboration : false,
      collaborationSessions : [],
      saveState : null,
      message : null,
      version : "0.9.02"
    });
  },
  componentDidMount: function () {
    var tmp = this.state.app;

    // initialize the map
    var cvs = this.refs["content-map-canvas"].getDOMNode();
    var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    cvs.style.height = height - 100 + "px";

    map = new google.maps.Map(
      cvs,
      { 
        // 4Lakes lat lng!
        center : new google.maps.LatLng(43.042825, -89.292592),
        zoom : 17
      }
    );

    // current marker
    tmp.curr.setPosition(map.getCenter());
    tmp.curr.setMap(map);

    // map event listener initial hooks
    if (this.state.settings.unlock) {
      google.maps.event.addListener(map, "dragend", function(ev) {

        tmp.curr.setPosition(map.getCenter());
        tmp.currInfo.close();
        this.setState({ app : tmp });

      }.bind(this));
    }
    if (this.state.settings.tap) {
      google.maps.event.addListener(map, "click", function(ev) {

        map.panTo(ev.latLng);
        tmp.curr.setPosition(ev.latLng);
        tmp.currInfo.close();
        this.setState({ app : tmp });

      }.bind(this));
    }

    google.maps.event.addListener(tmp.curr, "click", function() {
      var dms = utils.convertToDMS(tmp.curr.getPosition());
      var content = mapUtils.createInfoWindowContent.call(this, dms);
      tmp.currInfo.setContent(content);
      tmp.currInfo.open(map, tmp.curr);

    }.bind(this));

    // set up initial database reads
    db.child(tmp.sessionid).child('marks').on('child_added', dbUtils.add.bind(this, db, map));
    db.child(tmp.sessionid).child('marks').on('child_removed', dbUtils.remove.bind(this, db, map));
    db.child(tmp.sessionid).child('hawkID').on('child_changed', dbUtils.changeHawkid.bind(this));
    db.child(tmp.sessionid).child('hawkID').once('value', dbUtils.changeHawkid.bind(this));

    // initialize settings menu
    snap = new Snap({
      element : this.refs["content"].getDOMNode(),
      touchToDrag : false,
      hyperextensible : false
    });

    // setup collaboration sessions
    sessiondb.on("child_added", function(snapshot) {
      var out = this.state.collaborationSessions;
      var id = snapshot.val().id;
      out.push(id);
      this.setState({ collaborationSessions : out });

    }.bind(this));

    // pan to saved mark locations
    dbUtils.panToLastMark.call(this, map, db);

    this.setState({ app : tmp });
  },
  toggleSettingsMenu : function() {
    if (snap.state().state === "right") {
      snap.close();
    }
    else {
      snap.open("right");
    }
  },
  handleSettingsChange : function(data) {
    var tmpSettings = this.state.settings;
    var eventType = "click";

    tmpSettings[data.name] = data.value;

    // remove event listeners
    if (!data.value && data.name !== "watch") {
      eventType = (data.name === "unlock") ? "dragend" : eventType;
      google.maps.event.clearListeners(map, eventType);
    }

    // add event listeners
    else {
      var tmp = this.state.app;

      if (data.name === "unlock") {
        google.maps.event.addListener(map, "dragend", function(ev) {

          tmp.curr.setPosition(map.getCenter());
          tmp.currInfo.close();
          this.setState({ app : tmp });

        }.bind(this));
      }
      else if (data.name === "tap") {
        google.maps.event.addListener(map, "click", function(ev) {

          map.panTo(ev.latLng);
          tmp.curr.setPosition(ev.latLng);
          tmp.currInfo.close();
          this.setState({ app : tmp });

        }.bind(this));
      }
    }

    localStorage.setItem("tri-hawk-ulate__options", JSON.stringify(tmpSettings));
    this.setState({ settings : tmpSettings });
  },
  toggleHawkMenu : function() {
    if (snap.state().state === "left") {
      snap.close();
    }
    else {
      snap.open("left");
    }
  },
  handleTrackNewHawk : function() {
    var tmp = this.state.app;
    var sessionid = tmp.sessionid;
    
    // visually erase saved Markers
    tmp.marks.forEach(function(mark) {
      mark.mark.setMap(null);
      mark.line.setMap(null);
      mark.mark = null;
      mark.line = null;
      mark.iinfo = null;
    });
    if (tmp.apiPolygon) tmp.apiPolygon.setMap(null);
    if (tmp.apiCircle) tmp.apiCircle.setMap(null);
    if (tmp.apiCMark) tmp.apiCMark.setMap(null);
    tmp.hawkid = "";
    tmp.marks.length = 0;
    tmp.intersects.length = 0;
    tmp.triCenter = {};
    tmp.triDiameter = -1;

    // get new sessionID
    var newSessionID = +new Date;
    tmp.sessionid = newSessionID;
    localStorage.setItem("tri-hawk-ulate__sessionID", newSessionID);

    // use old sessionID to remove old Firebase bindings
    db.child(sessionid).child('marks').off('child_added', dbUtils.add.bind(this, db, map));
    db.child(sessionid).child('marks').off('child_removed', dbUtils.remove.bind(this, db, map));
    db.child(sessionid).child('hawkID').off('child_changed', dbUtils.changeHawkid.bind(this));

    // use new sessionID to create new Firebase bindings
    db.child(newSessionID).child('marks').on('child_added', dbUtils.add.bind(this, db, map));
    db.child(newSessionID).child('marks').on('child_removed', dbUtils.remove.bind(this, db, map));
    db.child(newSessionID).child('hawkID').on('child_changed', dbUtils.changeHawkid.bind(this));

    // update state
    this.setState({ app : tmp });

    // prompt for new hawkID
    this.toggleHawkIDModal();

    // close menu
    snap.close();
  },
  handleCollaborate : function(id) {
    var tmp = this.state.app;
    var old = tmp.sessionid;

    console.log("collaborate id", id);
    this.toggleCollaborationModal();

    // visually erase saved Markers
    tmp.marks.forEach(function(mark) {
      mark.mark.setMap(null);
      mark.line.setMap(null);
      mark.mark = null;
      mark.line = null;
      mark.iinfo = null;
    });
    if (tmp.apiPolygon) tmp.apiPolygon.setMap(null);
    if (tmp.apiCircle) tmp.apiCircle.setMap(null);
    if (tmp.apiCMark) tmp.apiCMark.setMap(null);
    tmp.marks.length = 0;
    tmp.intersects.length = 0;
    tmp.triCenter = {};
    tmp.triDiameter = -1;
    tmp.sessionid = parseInt(id,10);

    // use old sessionID to remove old Firebase bindings
    db.child(old).child('marks').off('child_added', dbUtils.add.bind(this, db, map));
    db.child(old).child('marks').off('child_removed', dbUtils.remove.bind(this, db, map));
    db.child(old).child('hawkID').off('child_changed', dbUtils.changeHawkid.bind(this));

    // use new sessionID to create new Firebase bindings
    db.child(id).child('marks').on('child_added', dbUtils.add.bind(this, db, map));
    db.child(id).child('marks').on('child_removed', dbUtils.remove.bind(this, db, map));
    db.child(id).child('hawkID').on('child_changed', dbUtils.changeHawkid.bind(this));

    db.child(id).child('hawkID').once('value', function(snapshot) {
      tmp.hawkid = snapshot.val();
      if (tmp.hawkid === "" || !tmp.hawkid) {
        this.setState({ needsHawkID : true });
      }

      this.setState({ app : tmp });
    }.bind(this));

    // pan to mark bounds
    dbUtils.panToLastMark.call(this, map, db);

    localStorage.setItem("tri-hawk-ulate__sessionID", id);
    this.setState({ app : tmp });
  },
  toggleHawkIDModal : function() { 
    this.setState({ needsHawkID : !this.state.needsHawkID }); 
  },
  toggleAzimuthModal : function() {
    this.setState({ needsAzimuth : !this.state.needsAzimuth });
  },
  toggleCollaborationModal : function() {
    snap.close();
    this.setState({ needsCollaboration : !this.state.needsCollaboration });
  },
  handleHawkIDSubmit : function(data) {
    // save new id to database

    var tmp = this.state.app;
    tmp.hawkid = data.hawkid;
    this.setState({ app : tmp, saveState : null });

    // save data
    db.child(tmp.sessionid).update({
      "sessionID" : tmp.sessionid,
      "hawkID" : tmp.hawkid
    }, function(err) {
      if (err) {
        this.setState({ saveState : "error", message : err });
      }
      else {
        this.setState({ saveState : "ok" });
      }
    }.bind(this));

    // save session if it doesn't exist
    sessiondb.once("value", function(sessions) {
      if (sessions.val()) {

        var keys = Object.keys(sessions.val()),
            found = false;

        for (var i = 0; i < keys.length; i++) {
          if (tmp.sessionid === sessions.val()[keys[i]].id) {
            console.log("matched saved sessionID, not adding");
            found = true;
            break;
          }
        }

        if (!found) {
          console.log("saving new sessionID");
          sessiondb.push({ id : tmp.sessionid });
        }
      }
      else {
        console.log("no sessionIDs found, adding");
        sessiondb.push({ id : tmp.sessionid });
      }
    });

    // add the sessionID to hawkdb if not yet
    hawkdb.once("value", function(hawks) {
      var cleanHawkID = tmp.hawkid.replace(".", "_");
      if (hawks.val() && hawks.val()[cleanHawkID]) {
        
        var keys = Object.keys(hawks.val()[cleanHawkID]),
            found = false;

        for (var i = 0; i < keys.length; i++) {
          if (tmp.sessionid === hawks.val()[cleanHawkID][keys[i]].sessionID) {
            console.log("sessionID found for this hawkID, not adding.");
            found = true;
            break;
          }
        }

        // push new sessionID for this hawk
        if (!found) {
          console.log("hawkID found, new sessionID saved");
          hawkdb.child(cleanHawkID).push({ sessionID : tmp.sessionid });
        }
      }
      else {
        console.log("new hawkID found, adding to db");
        //hawks.child(app.hawkID).child("sessions").push({sessionID : app.sessionID});
        hawkdb.child(cleanHawkID).push({ sessionID : tmp.sessionid });
      }
    });
  },

  /////////////////////////////////////////////////////////////////////////////
  // 
  // this function will handle submitting new mark data to firebase triggering
  // the add handler which will add the mark to state and to the map
  //
  /////////////////////////////////////////////////////////////////////////////
  handleAzimuthSubmit : function(data) {
    this.toggleAzimuthModal();
    var tmp = this.state.app;

    // make sure there is a valid hawkid first though.
    if (!tmp.hawkid || tmp.hawkid === "") {
      alert("But which hawk are you tracking? Enter a hawk id and save again.");
      this.toggleHawkIDModal();
      return;
    }

    // save mark
    this.setState({ saveState : null });
    db.child(tmp.sessionid).child("marks").push({
      lat : tmp.curr.getPosition().lat(),
      lng : tmp.curr.getPosition().lng(),
      az  : data.azimuth,
      sig : data.sig,
      date: +new Date
    }, function(err) {
      if (err) {
        this.setState({ saveState: "error", message : err });
      }
      else {
        this.setState({ saveState: "ok" });
      }
    }.bind(this));

    // make sure sessionID is saved
    db.child(tmp.sessionid).update({
      "sessionID" : tmp.sessionid
    });

    // add sessionID to db if not saved yet
    sessiondb.once("value", function(sessions) {
      if (sessions.val()) {

        var keys = Object.keys(sessions.val()),
            found = false;

        for (var i = 0; i < keys.length; i++) {
          if (tmp.sessionid === sessions.val()[keys[i]].id) {
            console.log("matched saved sessionID, not adding");
            found = true;
            break;
          }
        }

        if (!found) {
          console.log("saving new sessionID");
          sessiondb.push({ id : tmp.sessionid });
        }
      }
      else {
        console.log("no sessionIDs found, adding");
        sessiondb.push({ id : tmp.sessionid });
      }
    });

    // add the sessionID to hawkdb if not yet
    hawkdb.once("value", function(hawks) {
      var cleanHawkID = tmp.hawkid.replace(".", "_");
      if (hawks.val() && hawks.val()[cleanHawkID]) {
        
        var keys = Object.keys(hawks.val()[cleanHawkID]),
            found = false;

        for (var i = 0; i < keys.length; i++) {
          if (tmp.sessionid === hawks.val()[cleanHawkID][keys[i]].sessionID) {
            console.log("sessionID found for this hawkID, not adding.");
            found = true;
            break;
          }
        }

        // push new sessionID for this hawk
        if (!found) {
          console.log("hawkID found, new sessionID saved");
          hawkdb.child(cleanHawkID).push({ sessionID : tmp.sessionid });
        }
      }
      else {
        console.log("new hawkID found, adding to db");
        //hawks.child(app.hawkID).child("sessions").push({sessionID : app.sessionID});
        hawkdb.child(cleanHawkID).push({ sessionID : tmp.sessionid });
      }
    });

    
  },

  /////////////////////////////////////////////////////////////////////////////
  // 
  // this function will handle removing mark data from firebase triggering the
  // remove handler which will remove the mark from state
  //
  /////////////////////////////////////////////////////////////////////////////
  handleMarkerDelete : function(firebaseKey) {
    var tmp = this.state.app;

    this.setState({ saveState : null });
    db.child(tmp.sessionid).child("marks").child(firebaseKey).remove(
      function(err) {
        if (err) {
          this.setState({ saveState : "error", message : err });
        }
        else {
          this.setState({ saveState : "ok" });
        }
      }.bind(this)
    );

  },
  handleFind : function(loc) {
    var pos = new google.maps.LatLng(loc.lat, loc.lng);
    var tmp = this.state.app;

    map.panTo(pos);
    tmp.curr.setPosition(pos);
    tmp.currInfo.close();

    this.setState({ app : tmp });
  },
  renderOverlay : function() {

    // show the hawkID modal if we need a hawkID 
    if (this.state.needsHawkID) {
      return (<HawkIDModal onToggleOpen={this.toggleHawkIDModal} onHawkIDSubmit={this.handleHawkIDSubmit} />);
    }

    // show the azimuth modal if we are setting up a mark
    if (this.state.needsAzimuth) {
      return (<AzimuthModal position={this.state.app.curr.getPosition()} onToggleOpen={this.toggleAzimuthModal} onAzimuthSubmit={this.handleAzimuthSubmit} />);
    }

    // show the collaboration modal if we want to find another!
    if (this.state.needsCollaboration) {
      return (<CollaborationModal sessions={this.state.collaborationSessions} onToggleOpen={this.toggleCollaborationModal} onCollaborate={this.handleCollaborate}/>);
    }

    // show...nothing! hahahaha!
    return (<span/>);
  },
  render : function() {
    return(
      <div>
        <div className="snap-drawers">
          <div className="snap-drawer snap-drawer-left inverse">
            <CollaborationMenu toggleCollaborationModal={this.toggleCollaborationModal} onTrackNewHawk={this.handleTrackNewHawk} app={this.state.app}/>
          </div>
          <div className="snap-drawer snap-drawer-right inverse">
            <SettingsMenu onSettingsChange={this.handleSettingsChange} settings={this.state.settings} version={this.state.version}/>
          </div>
        </div>
        <div id="content" ref="content" className="snap-content">
          <TitleBar hawkid={this.state.app.hawkid} toggleSettingsMenu={this.toggleSettingsMenu} toggleHawkMenu={this.toggleHawkMenu}/>
          <div ref="content-map-canvas" id="content-map-canvas"></div>
          <FunctionsBar settings={this.state.settings} onFind={this.handleFind} saveState={this.state.saveState} message={this.state.message} />
        </div>
      </div>
    );
  }
});


// render it all!
React.render(<Content />, document.body);