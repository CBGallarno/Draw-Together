import React, {Component} from 'react';
import logo from '../logo.svg';
import './App.scss';
import Home from "./components/home/Home";
import Login from "./components/login/Login";
import firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth';
import Play from "./components/play/Play";

import {BrowserRouter as Router, Link, Route} from "react-router-dom";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false,
      navPages: {
        'Home': Home,
      }
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({signedIn: !!user})
    });
  }

  render() {
    let loginEl = (<Link to="/login">Login</Link>)
    if (this.state.signedIn) {
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
          <Route path="/profile" component={Login}/>
        </Router>
      </div>
    );
  }
}

export default App;
