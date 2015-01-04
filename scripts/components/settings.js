var React = require('react');
var ListGroup = require('react-bootstrap/ListGroup');
var ListGroupItem = require('react-bootstrap/ListGroupItem');
var Input = require('react-bootstrap/Input');

module.exports = React.createClass({
  getInitialState : function() {
    return ({ clicks : 0 });
  },
  easterEgg : function() {
    if (this.state.clicks >= 7) {
      alert("Easter Egg? Yeah, you totes found it! Congrats! Now have a cookie...");
      this.setState({clicks : 0});
    }
    else {
      this.setState({ clicks : this.state.clicks + 1 });  
    }
  },
  render : function() {
    return (
      <div className="container settings">
        <h1>Settings</h1>
        <ListGroup>
          <ListGroupItem><Input type="checkbox" label="Unlock marker" /></ListGroupItem>
          <ListGroupItem><Input type="checkbox" label="Enable tap marker" /></ListGroupItem>
          <ListGroupItem><a href="#">readme</a></ListGroupItem>
          <ListGroupItem><a className="nameless" href="#" onClick={this.easterEgg}>{"version: " + this.props.version}</a></ListGroupItem>
        </ListGroup>
      </div>
    );
  }
});