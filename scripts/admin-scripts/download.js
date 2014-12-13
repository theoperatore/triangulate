/** @jsx React.DOM */
var React = require('react'),
    Modal = require('react-bootstrap/Modal'),
    Button = require('react-bootstrap/Button');

var Download = React.createClass({
    displayName: 'DownloadModal',
    render: function () {
      return (
        <Modal {...this.props} title="Download!">
          <div className="modal-body">
            <h4>Download Options!</h4>
            <p><Button onClick={this.props.testDownloadMarks} bsStyle="info">Test Download Marks</Button></p>
            <p><Button onClick={this.props.testDownloadSessions} bsStyle="info">Test Download Sessions</Button></p>
          </div>
          <div className="modal-footer">
            <Button onClick={this.props.onRequestHide}>Close</Button>
          </div>
        </Modal>
      );
    }
});

module.exports = Download;