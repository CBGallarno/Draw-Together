import * as React from 'react';
import logo from '@/logo.svg';
import './App.scss';
import Home from "./home/Home";
import Login from "./login/Login";
import Profile from "./profile/Profile";
import 'firebase/firestore'
import 'firebase/auth';
import Play from "./play/Play";

import {BrowserRouter as Router, Link, Route} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "@/reducers";
import {AuthState} from "@/types/DTRedux";
import CanvasTest from "@/components/canvasTest/CanvasTest"

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
        let loginEl = (<Link to="/login">Login</Link>);
        if (this.props.auth.signedIn && !this.props.auth.isAnonymous) {
            loginEl = (<Link to="/profile" style={{display: "flex", flexDirection: "column", lineHeight: "initial", justifyContent: "center", textAlign: "center"}}><span style={{marginTop: "auto"}}>Profile</span><span style={{fontSize: "0.5em", marginTop: "auto", marginBottom: "10px"}}>{this.props.auth.userName}</span></Link>)
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
                    <Route path="/play/:gameId?" component={Play}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/profile" component={Profile}/>
                    <Route path="/canvas" component={CanvasTest}/>
                </Router>
            </div>
        );
    }
}

export default connect(mapStateToProps)(App);
