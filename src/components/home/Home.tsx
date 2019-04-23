import * as React from 'react';
import "./Home.scss";
import banner from "./banner.png"
import {Link} from "react-router-dom";
import {AuthState} from "@/types/DTRedux";
import {AppState} from "@/reducers";
import {connect} from "react-redux";

interface HomeProps {
    auth: AuthState
}

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth,
    }
};

class Home extends React.Component<HomeProps, any> {
    render() {

        let welcomeLinks = (<div>
            <Link className="button" to="/play">Join a Game!</Link>
            <p>OR</p>
            <Link className="button" to="/login">Login to create games!</Link>
        </div>)

        if (this.props.auth.signedIn && !this.props.auth.isAnonymous) {
            welcomeLinks = (<Link className="button" to="/play">Join or Create a Game!</Link>)
        }

        return (
            <div className="Home">
                <h1>Welcome to Draw Together!</h1>
                {welcomeLinks}
                <p>Draw Together is the real-time party game that brings out everyone's drawing skills!</p>
                <div className="banner">
                    <img src={banner}/>
                    <img src={banner}/>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(Home);
