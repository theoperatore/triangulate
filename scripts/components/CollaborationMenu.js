var React = require('react');
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var Button = require('react-bootstrap/Button');
var Grid = require('react-bootstrap/Grid');
var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
var config = require('../../config');

module.exports = React.createClass({
  displayName: "CollaborationMenu",
  render : function() {
    var date = new Date(parseInt(this.props.sessionID,10));

    return (
      <div className="container settings">
        <h3>Hawk Menu</h3>
        <ButtonGroup vertical>
          <ButtonGroup><Button onClick={this.props.onTrackNewHawk} bsSize="large">{"Track New " + config.animal}</Button></ButtonGroup>
          <ButtonGroup><Button onClick={this.props.toggleCollaborationModal} bsSize="large">Collaborate</Button></ButtonGroup>
        </ButtonGroup>
        <Grid className="animal-info" fluid>
          <Row>
            <Col xs={6} md={6}><p>sessionID:</p></Col>
            <Col xs={6} md={6}><p>{this.props.sessionID}</p></Col>
          </Row>
          <Row>
            <Col xs={6} md={6}><p>date started:</p></Col>
            <Col xs={6} md={6}><p>{date.toLocaleDateString()}</p></Col>
          </Row>
          <Row>
            <Col xs={6} md={6}><p>time started:</p></Col>
            <Col xs={6} md={6}><p>{date.toLocaleTimeString()}</p></Col>
          </Row>
        </Grid>
      </div>
    );
  }
});