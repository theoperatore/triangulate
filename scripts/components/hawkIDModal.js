var React = require('react');
var Modal = require('react-bootstrap/Modal');
var Button = require('react-bootstrap/Button');
var Input = require('react-bootstrap/Input');

module.exports = React.createClass({
  render : function() {
    return (<Modal title="Which hawk are you tracking?" onRequestHide={this.props.onToggleOpen}>
      <div className="modal-body">
        <Input label="HawkID (ex: 141.81) " type="text" placeholder="HawkID" />
      </div>
      <div className="modal-footer">
        <Button onClick={this.props.onToggleOpen}>Cancel</Button>
        <Button bsStyle="success">Ok</Button>
      </div>
    </Modal>);
  }
});