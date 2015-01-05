var React = require('react');
var Modal = require('react-bootstrap/Modal');
var Button = require('react-bootstrap/Button');
var Input = require('react-bootstrap/Input');

module.exports = React.createClass({
  render : function() {
    return (
      <Modal title="Save this point" onRequestHide={this.props.onToggleOpen}>
        <div className="modal-body">
          <Input type="text" placeholder="0-360" label="Azimuth"/>
          <Input type="select" label="Signal Strength" defaultValue="base">
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
          <Button bsStyle="success">Ok</Button>
        </div>
      </Modal>
    );
  }
});