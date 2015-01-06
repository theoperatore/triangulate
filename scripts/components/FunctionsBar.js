var React = require('react');
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var Button = require('react-bootstrap/Button');
var Glyphicon = require('react-bootstrap/Glyphicon');

module.exports = React.createClass({
  displayName: 'FunctionsBar',
  getInitialState : function() {
    return ({ isFinding : false, watchID : null });
  },
  findMe : function() {
    this.setState({ isFinding : true });

    if (navigator && navigator.geolocation) {
      if (this.state.watchID) {
        navigator.geolocation.clearWatch(this.state.watchID);
        this.setState({ isFinding : false, watchID : null });
        return;      
      }

      var watchID = navigator.geolocation.watchPosition(
        function(loc) {
          var out = {};
          out.lat = loc.coords.latitude;
          out.lng = loc.coords.longitude;

          console.log("found location via gps", out);

          this.props.onFind(out);
          this.setState({ watchID : watchID });
          //this.setState({ isFinding : false });
        }.bind(this),
        function (err){
          alert("Error using navigator.getCurrentPosition", err.message);
          console.log("unable to use navigator to get position", err);
          this.setState({ isFinding : false });
        }.bind(this),
        { 
          enableHighAccuracy : true,
          maximumAge : 0
        }
      );
    }
    else {
      alert("GAH! Your browser does not support the GPS function!");
      this.setState({ isFinding : false });
    }
  },
  handleMessages : function() {
    if (this.props.message) {
      alert(this.props.message);  
    }
  },
  render: function () {
    var saveIcon = "floppy-save";

    if (this.props.saveState === "error") {
      saveIcon = "floppy-remove";
    }
    else if (this.props.saveState === "ok") {
      saveIcon = "floppy-saved";
    }

    return (
      <ButtonGroup justified className="main-menu">
        <ButtonGroup>
          <Button bsSize="large" onClick={this.findMe}>
            <Glyphicon glyph="search" className={((this.state.isFinding) ? "hide" : "")}/>
            <div id="spinner" className={"spinner" + ((this.state.isFinding) ? "" : " hide")}>
              <div className="cube1"></div>
              <div className="cube2"></div>
            </div>
          </Button>
        </ButtonGroup>
        <ButtonGroup><Button bsSize="large" onClick={this.handleMessages}><Glyphicon glyph={saveIcon} /></Button></ButtonGroup>
      </ButtonGroup>
    );
  }
});