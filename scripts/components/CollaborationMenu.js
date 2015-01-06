var React = require('react');
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var Button = require('react-bootstrap/Button');

module.exports = React.createClass({
  displayName: "CollaborationMenu",
  render : function() {
    return (
      <div className="container settings">
        <h3>Hawk Menu</h3>
        <ButtonGroup vertical>
          <ButtonGroup><Button onClick={this.props.onTrackNewHawk} bsSize="large">Track New Hawk</Button></ButtonGroup>
          <ButtonGroup><Button onClick={this.props.toggleCollaborationModal} bsSize="large">Collaborate</Button></ButtonGroup>
        </ButtonGroup>
        <p>sessionID: {this.props.sessionID}</p>
      </div>
    );
  }
});