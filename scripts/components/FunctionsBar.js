var React = require('react');
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var Button = require('react-bootstrap/Button');
var Glyphicon = require('react-bootstrap/Glyphicon');

module.exports = React.createClass({
  displayName: 'Functions Bar',
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
          <Button bsSize="large">
            <Glyphicon glyph="search" className={((this.props.isFinding) ? "hide" : "")}/>
            <div id="spinner" className={"spinner" + ((this.props.isFinding) ? "" : " hide")}>
              <div className="cube1"></div>
              <div className="cube2"></div>
            </div>
          </Button>
        </ButtonGroup>
        <ButtonGroup><Button bsSize="large"><Glyphicon glyph={saveIcon} /></Button></ButtonGroup>
      </ButtonGroup>
    );
  }
});