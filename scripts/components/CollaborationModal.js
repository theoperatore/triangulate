var React = require('react');
var Modal = require('react-bootstrap/Modal');
var Button = require('react-bootstrap/Button');
var Input = require('react-bootstrap/Input');

module.exports = React.createClass({
  displayName : "CollaborationModal",
  getInitialState : function() {
    return ({ sessionid : "session" });
  },
  handleSubmit : function() {
    this.props.onCollaborate(this.state.sessionid);
  },
  handleChange : function(e) {
    this.setState({ sessionid : e.target.value });
  },
  render : function() {
    var sessions = [];

    for (var i = 0; i < this.props.sessions.length; i++) {
      sessions.unshift(
        <option key={i} value={this.props.sessions[i]}>{new Date(this.props.sessions[i]).toLocaleString()}</option>
      );
    }

    return (<Modal title="Collaboration on which session?" onRequestHide={this.props.onToggleOpen}>
      <div className="modal-body">
        <Input onChange={this.handleChange} type="select" value={this.state.sessionid}>
          <option value="session">Select a Session</option>
          {sessions}
        </Input>
      </div>
      <div className="modal-footer">
        <Button onClick={this.props.onToggleOpen}>Cancel</Button>
        <Button onClick={this.handleSubmit} bsStyle="success">Ok</Button>
      </div>
    </Modal>);
  }
});