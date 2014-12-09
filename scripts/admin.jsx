/** @jsx React.DOM */
var React = require('react/addons'),
    Firebase = require('firebase'),
    db = new Firebase("https://tri-hawk-ulate.firebaseio.com/data-beta"),
    hawksdb = new Firebase("https://tri-hawk-ulate.firebaseio.com/hawks-beta"),
    utils = require('./admin-scripts/utils'),
    ReactCSSTransitionGroup = React.addons.CSSTransitionGroup,
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
  testAdd : function() {
    this.props.testAdd();
  },
  render : function() {
    var sortClass = "btn btn-lg";
    sortClass += (this.props.options.sort === "hawkid") ? " btn-info active" : " btn-default";
    return (
      <header className="container-fluid page-header clearfix">
        <h1 className="pull-left">Tri-hawk-ulate <small>admin</small></h1>
        <ul className="nav nav-pills pull-right" role="navigation">
          <li><button onClick={this.testAdd} className={"btn btn-danger btn-lg"}>Test Add</button></li>
          <li role="presentation"><button onClick={this.handleSort} title="Sort by HawkID" className={sortClass}><span className="glyphicon glyphicon-th-large"></span></button></li>
          <li role="presentation"><button onClick={this.handleExport} title="Export from Database" className="btn btn-default btn-lg"><span className="glyphicon glyphicon-save"></span></button></li>
        </ul>
      </header>);
  }
});

// handles rendering all of one hawk's sessions
Hawk = React.createClass({
  displayName : "Hawk Group",
  render : function() {

    var sessions = [];

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

    return (
      <div className="panel panel-info">
        <div className="panel-heading">
          <h3 className="panel-title">{this.props.hawkid.replace("_",".")}</h3>
        </div>
        <div className="panel-body">
          {sessions}
        </div>
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
      hawks : {}
    });
  },
  componentWillMount: function () {
    var datas = {},
        hawks = {};

    // set up state with data
    db.orderByKey().limitToLast(10).on("child_added", function(data) {
      
      datas[data.key()] = data.val();
      this.setState({ datas : datas });

    }.bind(this));

    db.on("child_removed", function(data) {
      
      delete datas[data.key()];
      this.setState({ datas : datas });

    }.bind(this));

    // set up state with hawks
    hawksdb.orderByKey().limitToLast(5).on("child_added", function(hawk) {

      hawks[hawk.key()] = hawk.val();
      this.setState({ hawks : hawks });

    }.bind(this));

    hawksdb.on("child_removed", function(hawk) {

      delete hawks[hawk.key()];
      this.setState({ hawks : hawks });

    }.bind(this));
  },
  onOptionChange : function(options) {
    this.setState({ options : options });
  },
  testAdd : function() {
    var nDatas = this.state.datas,
        nHawks = this.state.hawks,
        sessionID = +new Date;

    nDatas[sessionID] = {
      hawkID : "Test",
      sessionID : sessionID
    };

    if (!nHawks["Test"]){
      nHawks["Test"] = {};
    } 
    nHawks["Test"][sessionID] = { sessionID : sessionID };

    this.setState( { datas : nDatas, hawks : nHawks });
  },
  handleExport : function() {

    // this should db.once("value") to get the data to download.
    // or at least give options to download specific parts of data.
    var file = utils.getCSV(this.state.datas),
        aSessions = document.createElement('a'),
        aMarks = document.createElement('a');


    aSessions.href = window.URL.createObjectURL(new Blob([file.sessions], { type : "text/csv" }));
    aSessions.download = "sessions.csv";
    document.body.appendChild(aSessions);
    aSessions.click();
    document.body.removeChild(aSessions);

    aMarks.href = window.URL.createObjectURL(new Blob([file.marks], { type : "text/csv" }));
    aMarks.download = "marks.csv";
    document.body.appendChild(aMarks);
    aMarks.click();
    document.body.removeChild(aMarks);
  },
  render : function() {
    var items = [];

    // show session component for session sort
    if (this.state.options.sort === "session") {

      Object.keys(this.state.datas).forEach(function(key) {

        // use unshift to both keep sessions in descending order, 
        // and so transitions happen correctly.
        items.unshift(
          <Session session={this.state.datas[key]} key={key} />
        );
      }.bind(this));
    }

    // show hawk component for hawk sort
    else if (this.state.options.sort === "hawkid") {
      Object.keys(this.state.hawks).forEach(function(key) {

        items.unshift(
          <Hawk hawkid={key} datas={this.state.datas} sessions={this.state.hawks[key]} key={key}/>
        );

      }.bind(this));
    }

    return (
      <div>
        <Header options={this.state.options} onOptionChange={this.onOptionChange} testAdd={this.testAdd} handleExport={this.handleExport}/>
        <ReactCSSTransitionGroup component="div" transitionName="marks" className="container-fluid">
          {items}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});


React.render(<App />, document.body);