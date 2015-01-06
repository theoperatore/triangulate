var React = require('react');
var Modal = require('react-bootstrap/Modal');
var Button = require('react-bootstrap/Button');
var Input = require('react-bootstrap/Input');
var utils = require('../triUtilities');

module.exports = React.createClass({
  displayName : "AzimuthModal",
  getInitialState : function() {
    return ({ inp : "", az : -1, sig : "base", azValidation : null, sigValidation : null });
  },
  onAzimuthChange : function(e) {
    var input = e.target.value;
    var az = parseInt(e.target.value,10);

    if (isNaN(az) || (az < 0 || az > 360)) {
      this.setState({ inp : input, azValidation : "error" });
      return;
    }

    this.setState({ inp : input, az : az, azValidation : "success" });
  },
  onSigStrChange : function(e) {
    var validate = (e.target.value === "base") ? "error" : "success";
    this.setState({ sig : e.target.value, sigValidation : validate });
  },
  onModalSubmit : function() {
    if (!this.state.azValidation || this.state.azValidation === "error" || this.state.az === -1) {
      alert("Oh noes! Your azimuth isn't quite right. Ensure it's a number between 0 and 360");
      return;
    }
    else if (this.state.sig === "base") {
      alert("On noes! Choose a signal strength.");
      return;
    }
    else {
      var out = {};
      out.azimuth = this.state.az;
      out.sig = this.state.sig;

      this.props.onAzimuthSubmit(out);
    }
  },
  render : function() {
    var position = utils.convertToDMSObject(this.props.position);

    return (
      <Modal title="Save this point" onRequestHide={this.props.onToggleOpen}>
        <div className="modal-body">
          <Input type="static" value={position.lat + " : " + position.lng} label="Latitude and Longitude to save"/>
          <Input onChange={this.onAzimuthChange} bsStyle={this.state.azValidation} type="text" placeholder="0-360" label="Azimuth" value={this.state.inp} hasFeedback/>
          <Input onChange={this.onSigStrChange} bsStyle={this.state.sigValidation} type="select" label="Signal Strength" value={this.state.sig} >
            <option value="base">Select a Strength</option>
            <option value="0">0%</option>
            <option value="<25">less than 25%</option>
            <option value="50">50%</option>
            <option value=">75">greater than 75%</option>
            <option value="100">100%</option>
          </Input>
        </div>
        <div className="modal-footer">
          <Button onClick={this.props.onToggleOpen}>Cancel</Button>
          <Button onClick={this.onModalSubmit} bsStyle="success">Ok</Button>
        </div>
      </Modal>
    );
  }
});