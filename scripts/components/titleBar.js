///////////////////////////////////////////////////////////////////////////////
//
// Handles displaying and updating the title bar
//
///////////////////////////////////////////////////////////////////////////////
var React = require('react');
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var Button = require('react-bootstrap/Button');
var Glyphicon = require('react-bootstrap/Glyphicon');

module.exports = React.createClass({
  displayName : "TitleBar",
  render : function() {
    return (
      <div className="title-bar">
        <ButtonGroup justified>
          <ButtonGroup>
            <Button bsSize="large" onClick={this.props.toggleHawkMenu}>
              <Glyphicon glyph="chevron-left" />
              {"   " + this.props.hawkid}
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button bsSize="large" onClick={this.props.toggleSettingsMenu}>
              <Glyphicon glyph="cog"/>
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </div>
    );
  }
});