var React = require('react');
var ListGroup = require('react-bootstrap/ListGroup');
var ListGroupItem = require('react-bootstrap/ListGroupItem');
var Input = require('react-bootstrap/Input');
var Glyphicon = require('react-bootstrap/Glyphicon');

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
        <h3>Settings</h3>
        <ListGroup>
          <ListGroupItem><Input type="checkbox" label="Unlock marker" /></ListGroupItem>
          <ListGroupItem><Input type="checkbox" label="Enable tap marker" /></ListGroupItem>
          <ListGroupItem><a href="#">Readme</a></ListGroupItem>
          <ListGroupItem><a className="nameless" role="button" href="#" onClick={this.easterEgg}>{"app version: " + this.props.version}</a></ListGroupItem>
        </ListGroup>
        <p>Made with <Glyphicon glyph="heart"/> using cool tech like <a href="http://facebook.github.io/react/">React.js</a>, <a href="https://github.com/jakiestfu/Snap.js/">Snap.js</a>, <a href="http://react-bootstrap.github.io/">React-Bootstrap</a>, <a href="https://www.firebase.com/">Firebase</a>, and <a href="http://pages.github.com">GitHub Pages</a></p>
        <p>{ "Check out the " } <a href="#">repo</a> { " for issues, contributing, and other cool code-y stuff! " + String.fromCharCode(169) + "2015"}</p>
        <p></p>
      </div>
    );
  }
});