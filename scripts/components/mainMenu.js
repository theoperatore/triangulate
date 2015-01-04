var React = require('react');
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var Button = require('react-bootstrap/Button');
var Glyphicon = require('react-bootstrap/Glyphicon');

module.exports = React.createClass({
  displayName: 'Main Menu',
  render: function () {
    return (
      <ButtonGroup justified className="main-menu">
        <ButtonGroup><Button bsSize="large"><Glyphicon glyph="search" /></Button></ButtonGroup>
        <ButtonGroup><Button bsSize="large"><Glyphicon glyph="floppy-save" /></Button></ButtonGroup>
        <ButtonGroup><Button bsSize="large"><Glyphicon glyph="plus-sign" /></Button></ButtonGroup>
      </ButtonGroup>
    );
  }
});