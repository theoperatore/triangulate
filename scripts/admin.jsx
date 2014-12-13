/** @jsx React.DOM */
var React = require('react/addons'),
    Firebase = require('firebase'),
    db = new Firebase("https://tri-hawk-ulate.firebaseio.com/data-beta"),
    hawksdb = new Firebase("https://tri-hawk-ulate.firebaseio.com/hawks-beta"),
    utils = require('./admin-scripts/utils'),
    ReactCSSTransitionGroup = React.addons.CSSTransitionGroup,
    Download = require('./admin-scripts/download'),
    ModalTrigger = require('react-bootstrap/ModalTrigger'),
    App, Header, Session, Hawk;



// the Header of the admin page with menu
Header = React.createClass({
  displayName : "Header",
  handleSort : function() {
    var out = (this.props.options.sort === "hawkid") ? "session" : "hawkid";
    this.props.onOptionChange({ sort : out });
  },
  handleExport : function() {
    this.props.handleExport();
  },
  handleRefresh : function() {
    this.props.onRefresh();
  },
  handleExportMarks : function() {
    this.props.handleExportMarks();
  },
  handleExportSessions : function() {
    this.props.handleExportSessions();
  },
  render : function() {
    var sortClass = "btn btn-lg";
    sortClass += (this.props.options.sort === "hawkid") ? " btn-info active" : " btn-default";
    return (
      <header className="container-fluid page-header clearfix">
        <h1 className="pull-left">Tri-hawk-ulate <small>admin</small></h1>
        <ul className="nav nav-pills pull-right" role="navigation">
          <li role="presentation"><button onClick={this.handleSort} title="Sort by HawkID" className={sortClass}><span className="glyphicon glyphicon-th-large"></span></button></li>
          <li role="presentation"><button onClick={this.handleRefresh} title="Refresh" className="btn btn-default btn-lg"><span className="glyphicon glyphicon-refresh"></span><span className="badge">{this.props.numNewDatas || ""}</span></button></li>
          <li role="presentation"><ModalTrigger modal={<Download testDownloadMarks={this.handleExportMarks} testDownloadSessions={this.handleExportSessions}/>}><button title="Export from Database" className="btn btn-default btn-lg"><span className="glyphicon glyphicon-save"></span></button></ModalTrigger></li>
        </ul>
      </header>);
  }
});

// handles rendering all of one hawk's sessions
Hawk = React.createClass({
  displayName : "Hawk Group",
  render : function() {

    var sessions = [],
        container;

    // loop through this.props.sessions keys to get indexes
    // into this.props.datas for info.
    Object.keys(this.props.sessions).forEach(function(key, s) {
      var data = this.props.datas[this.props.sessions[key].sessionID] || {},
          marks = [];

      // find marks data
      if (data.marks) {
        Object.keys(data.marks).forEach(function(key, i) {
          marks.push(
            <tr key={"mark"+i}>
              <td>{new Date(data.marks[key].date).toLocaleString()}</td>
              <td>{data.marks[key].lat}</td>
              <td>{data.marks[key].lng}</td>
              <td>{data.marks[key].az}</td>
              <td>{data.marks[key].sig}</td>
            </tr>
          );
        }.bind(this));

        // set up each session
        sessions.unshift(
          <div className="row" key={s}>
            <div className="container-fluid">
              <h3>{new Date(data.sessionID).toLocaleString()} <small>{data.sessionID}</small></h3>
            </div>
            <div className="col-md-6">
              <table className="table">
                <caption>Saved Marks</caption>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Azimuth</th>
                    <th>Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {marks}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <table className="table">
                <caption>Triangulation Info</caption>
                <thead>
                  <tr>
                    <th>Diameter(m)</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.triDiameter || "N/A"}</td>
                    <td>{(data.triCenter) ? data.triCenter.lat : "N/A"}</td>
                    <td>{(data.triCenter) ? data.triCenter.lng : "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      }

    }.bind(this));
  

    if (sessions.length === 0) {
      container = (<div></div>);
    }
    else {
      container = (
        <div className={"panel panel-info"}>
          <div className="panel-heading">
            <h3 className="panel-title">{this.props.hawkid.replace("_",".")}</h3>
          </div>
          <div className="panel-body">
            {sessions}
          </div>
        </div>
      );
    }


    return (
        <div>
          {container}
        </div>
    );
  }
});

// handles rendering one session
Session = React.createClass({
  displayName : "Session",
  render : function() {

    var marks = [];
    if (this.props.session.marks) {
      Object.keys(this.props.session.marks).forEach(function(key, i) {
        marks.push(
          <tr key={"mark"+i}>
            <td>{new Date(this.props.session.marks[key].date).toLocaleString()}</td>
            <td>{this.props.session.marks[key].lat}</td>
            <td>{this.props.session.marks[key].lng}</td>
            <td>{this.props.session.marks[key].az}</td>
            <td>{this.props.session.marks[key].sig}</td>
          </tr>
        );
      }.bind(this));
    }

    return (
      <div className="panel panel-info">
        <div className="panel-heading">
          <h3 className="panel-title">{this.props.session.hawkID} <small title="sessionID">{this.props.session.sessionID}</small></h3>
        </div>
        <div className="panel-body">  
          <div className="row">
            <div className="col-md-6">
              <table className="table">
                <caption>Saved Marks</caption>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Azimuth</th>
                    <th>Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {marks}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <table className="table">
                <caption>Triangulation Info</caption>
                <thead>
                  <tr>
                    <th>Diameter(m)</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{this.props.session.triDiameter || "N/A"}</td>
                    <td>{(this.props.session.triCenter) ? this.props.session.triCenter.lat : "N/A"}</td>
                    <td>{(this.props.session.triCenter) ? this.props.session.triCenter.lng : "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

// the entire admin page
App = React.createClass({
  displayName: "App",
  getInitialState : function() {
    return ({ 
      options : {
        sort : "session"
      },
      datas : {},
      hawks : {},
      pending : {},
      num : 0,
      count : 0,
      refreshed : true
    });
  },
  componentWillMount: function () {
    var datas = this.state.datas,
        hawks = this.state.hawks,
        pending = this.state.pending;

    // set up state with marks being added?
    db.orderByKey().limitToLast(10).on("child_added", function(data) {

      if (this.state.count < 10) {
        console.log("adding to current", "key:",data.key(), "data:", data.val());
        datas[data.key()] = data.val();
        this.setState({ datas : datas, count : this.state.count + 1 });
      }
      else {
        console.log("adding to pending","key:",data.key(),"data:", data.val());
        pending[data.key()] = data.val();
        this.setState({ num : this.state.num + 1, pending : pending });
      }  

    }.bind(this));

    // update children
    db.on("child_changed", function(data) {

      console.log("child_changed", data.key(), data.val());
      datas[data.key()] = data.val();
      this.setState({ datas : datas });

    }.bind(this));

    // handle a new hawk moving into view
    db.on("child_removed", function(data) {
      
      console.log("child_removed:", data.key(), data.val());
      delete datas[data.key()];
      this.setState({ datas : datas });

    }.bind(this));

    // set up state with hawks--grab all
    // and we'll only show the hawks fow which we have grabbed sessions.
    hawksdb.on("child_added", function(hawk) {
      console.log("child_added_hawksdb",hawk.key(), hawk.val());
      hawks[hawk.key()] = hawk.val();
      this.setState({ hawks : hawks });

    }.bind(this));
  },
  onOptionChange : function(options) {
    this.setState({ options : options });
  },
  onRefresh : function() {
    var pending = this.state.pending,
        datas = this.state.datas;

    // merge pending data with datas
    Object.keys(pending).forEach(function(key) {

      datas[key] = pending[key];

    }.bind(this));

    console.log("refreshing...");
    this.setState({ num : 0, count : 0, pending : {}, datas : datas });
  },
  handleExportMarks : function() {
    var all = {};
    db.once("value", function(data) {
      Object.keys(data.val()).forEach(function(key) {
        all[key] = data.val()[key];
      });

      var file = utils.getCSV(all),
        aMarks = document.createElement('a');

      aMarks.href = window.URL.createObjectURL(new Blob([file.marks], { type : "text/csv" }));
      aMarks.download = "marks.csv";
      document.body.appendChild(aMarks);
      aMarks.click();
      document.body.removeChild(aMarks);
    });
  },
  handleExportSessions : function() {
    var all = {};
    db.once("value", function(data) {
      Object.keys(data.val()).forEach(function(key) {
        all[key] = data.val()[key];
      });

      var file = utils.getCSV(all),
        aSessions = document.createElement('a');

      aSessions.href = window.URL.createObjectURL(new Blob([file.sessions], { type : "text/csv" }));
      aSessions.download = "sessions.csv";
      document.body.appendChild(aSessions);
      aSessions.click();
      document.body.removeChild(aSessions);
    });
  },
  render : function() {
    var items = [];

    // show session component for session sort
    if (this.state.options.sort === "session") {

      Object.keys(this.state.datas).forEach(function(key, i) {

        // use unshift to both keep sessions in descending order, 
        // and so transitions happen correctly.
        items.unshift(
          <Session session={this.state.datas[key]} key={"session" + key + i} />
        );
      }.bind(this));
    }

    // show hawk component for hawk sort
    else if (this.state.options.sort === "hawkid") {
      Object.keys(this.state.hawks).forEach(function(key, i) {

        items.unshift(
          <Hawk hawkid={key} datas={this.state.datas} sessions={this.state.hawks[key]} key={"hawkid" + key + i}/>
        );

      }.bind(this));
    }

    return (
      <div>
        <Header handleExportMarks={this.handleExportMarks} handleExportSessions={this.handleExportSessions} numNewDatas={this.state.num} options={this.state.options} onRefresh={this.onRefresh} onOptionChange={this.onOptionChange} testAdd={this.testAdd}/>
        <div className="container-fluid">
        <ReactCSSTransitionGroup component="div" transitionName="marks" className="container-fluid">
          {items}
        </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }
});


React.render(<App />, document.body);