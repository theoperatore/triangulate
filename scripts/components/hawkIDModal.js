var React = require('react');
var Modal = require('react-bootstrap/Modal');
var Button = require('react-bootstrap/Button');
var Input = require('react-bootstrap/Input');

module.exports = React.createClass({
  displayName : "HawkIDModal",
  getInitialState : function() {
    return ({ hawkid : "" });
  },
  handleChange : function(e) {
    this.setState({ hawkid : e.target.value });
  },
  handleSubmit : function() {
    this.props.onHawkIDSubmit({ hawkid : this.state.hawkid });
    this.props.onToggleOpen();
  },
  render : function() {
    return (<Modal title="Which hawk are you tracking?" onRequestHide={this.props.onToggleOpen}>
      <div className="modal-body">
        <Input onChange={this.handleChange} label="HawkID (ex: 141.81) " type="text" value={this.state.hawkid} placeholder="HawkID" />
      </div>
      <div className="modal-footer">
        <Button onClick={this.props.onToggleOpen}>Cancel</Button>
        <Button onClick={this.handleSubmit} bsStyle="success">Ok</Button>
      </div>
    </Modal>);
  }
});