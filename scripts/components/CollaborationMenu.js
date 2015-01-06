var React = require('react');
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var Button = require('react-bootstrap/Button');
var Grid = require('react-bootstrap/Grid');
var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
var config = require('../../config');
var triUtils = require('../triUtilities');

module.exports = React.createClass({
  displayName: "CollaborationMenu",
  render : function() {
    var date = new Date(parseInt(this.props.app.sessionid,10));
    var marks = [];
    var triCenter;
    var triDiameter = this.props.app.triDiameter;

    for (var i = 0; i < this.props.app.marks.length; i++) {
      var dms = triUtils.convertToDMSFromLiteral(this.props.app.marks[i].mark.getPosition().lat(), this.props.app.marks[i].mark.getPosition().lng());
      marks.push(
        <Row key={i}>
          <Col xs={6} md={6}><p>{dms.lat}</p></Col>
          <Col xs={6} md={6}><p>{dms.lng}</p></Col>
        </Row>
      );
    }

    if (this.props.app.triCenter && this.props.app.triCenter.lat) {
      triCenter = triUtils.convertToDMSFromLiteral(this.props.app.triCenter.lat, this.props.app.triCenter.lng);
    }

    return (
      <div className="container settings">
        <h3>{config.animal + " Menu"}</h3>
        <ButtonGroup vertical>
          <ButtonGroup><Button onClick={this.props.onTrackNewHawk} bsSize="large">{"Track New " + config.animal}</Button></ButtonGroup>
          <ButtonGroup><Button onClick={this.props.toggleCollaborationModal} bsSize="large">Collaborate</Button></ButtonGroup>
        </ButtonGroup>
        <Grid className="animal-info" fluid>
          <Row>
            <Col><p>current session info:</p></Col>
          </Row>
          <Row>
            <Col xs={5} md={5}><p>sessionID:</p></Col>
            <Col xs={7} md={7}><p>{this.props.app.sessionid}</p></Col>
          </Row>
          <Row>
            <Col xs={5} md={5}><p>{config.animal + " ID:"}</p></Col>
            <Col xs={7} md={7}><p>{this.props.app.hawkid}</p></Col>
          </Row>
          <Row>
            <Col xs={5} md={5}><p>start date:</p></Col>
            <Col xs={7} md={7}><p>{date.toLocaleDateString()}</p></Col>
          </Row>
          <Row>
            <Col xs={5} md={5}><p>start time:</p></Col>
            <Col xs={7} md={7}><p>{date.toLocaleTimeString()}</p></Col>
          </Row>
          <Row>
            <Col><p>current session markers:</p></Col>
          </Row>
          {marks}
          <Row>
            <Col><p>current session triangulation:</p></Col>
          </Row>
          <Row>
            <Col xs={6} md={6}><p>{(triCenter) ? triCenter.lat : ""}</p></Col>
            <Col xs={6} md={6}><p>{(triCenter) ? triCenter.lng : ""}</p></Col>
          </Row>
          <Row>
            <Col xsOffset={1} mdOffset={1}><p>{(triDiameter === -1) ? "" : triDiameter + " (m)"}</p></Col>
          </Row>
        </Grid>
      </div>
    );
  }
});