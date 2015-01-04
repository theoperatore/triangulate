///////////////////////////////////////////////////////////////////////////////
//
// Handles displaying and updating the title bar
//
///////////////////////////////////////////////////////////////////////////////
var React = require('react');
var Button = require('react-bootstrap/Button');

module.exports = React.createClass({
  render : function() {
    return (
      <div id="title-bar">
        <div id="hawkID-display"><span id='hawkID'>{this.props.hawkid}</span></div>
        <Button bsStyle="default" id="settings-toggle" onClick={this.props.toggleMenu}><img src="./images/icon-menu.svg" alt="Settings" /></Button>
      </div>
    );
  }
});