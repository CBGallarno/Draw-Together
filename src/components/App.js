import React, {Component} from 'react';
import logo from '../logo.svg';
import './App.scss';
import Home from "./home/Home";
import Login from "./login/Login";
import Profile from "./profile/Profile";
import 'firebase/firestore'
import 'firebase/auth';
import Play from "./play/Play";

import {BrowserRouter as Router, Link, Route} from "react-router-dom";
import {connect} from "react-redux";

const mapStateToProps = state => {
  return {
    auth: state.auth
  }
}

class App extends Component {

  render() {
    let loginEl = (<Link to="/login">Login</Link>)
    if (this.props.auth.signedIn) {
      loginEl = (<Link to="/profile">Profile</Link>)
    }

    return (
      <div className="App">
        <Router>
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <Link to="/">Home</Link>
            <Link to="/play">Play</Link>
            {loginEl}
          </header>
          <Route path="/" exact component={Home}/>
          <Route path="/play" component={Play}/>
          <Route path="/login" component={Login}/>
          <Route path="/profile" component={Profile}/>
        </Router>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
