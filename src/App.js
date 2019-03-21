import React, {Component} from 'react';
import logo from './logo.svg';
import './App.scss';
import Home from "./components/home/Home";
import Login from "./components/login/Login";
import Play from "./components/play/Play";

import {BrowserRouter as Router, Link, Route} from "react-router-dom";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navPages: {
        'Home': Home,
      }
    }
  }


  render() {
    return (
      <div className="App">
        <Router>
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <Link to="/">Home</Link>
            <Link to="/play">Play</Link>
            <Link to="/login">Login</Link>
          </header>
          <Route path="/" exact component={Home}/>
          <Route path="/play" exact component={Play}/>
          <Route path="/login" exact component={Login}/>
        </Router>
      </div>
    );
  }
}

export default App;
