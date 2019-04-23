import * as React from 'react';
import logo from '../logo.svg';
import './App.scss';
import Home from "./home/Home";
import Login from "./login/Login";
import Profile from "./profile/Profile";
import 'firebase/firestore'
import 'firebase/auth';
import Play from "./play/Play";

import {BrowserRouter as Router, NavLink, Route} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "@/reducers";
import {AuthState} from "@/types/DTRedux";
// import CanvasTest from "@/components/canvasTest/CanvasTest"

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth
    }
};

interface Props {
    auth: AuthState
}

class App extends React.Component<Props, any> {

    render() {
        let loginEl = (<NavLink className="login" activeClassName="active-link" to="/login">
            <span>Login</span>
            <span>Register</span>
        </NavLink>);
        if (this.props.auth.signedIn && !this.props.auth.isAnonymous) {
            loginEl = (<NavLink className="register" activeClassName="active-link" to="/profile">
                <span>Profile</span>
                <span>{this.props.auth.userName}</span>
            </NavLink>)
        }

        return (
            <div className="App">
                <Router>
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo"/>
                        <NavLink exact activeClassName="active-link" to="/">Home</NavLink>
                        <NavLink activeClassName="active-link" to="/play">Play</NavLink>
                        {loginEl}
                    </header>
                    <div className="App-content">
                        <Route path="/" exact component={Home}/>
                        <Route path="/play/:gameId?" component={Play}/>
                        <Route path="/login" component={Login}/>
                        <Route path="/profile" component={Profile}/>
                        {/*<Route path="/canvas" component={CanvasTest}/>*/}
                    </div>
                </Router>
            </div>
        );
    }
}

export default connect(mapStateToProps)(App);
