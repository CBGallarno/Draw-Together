import React, {Component} from 'react';
import {connect} from "react-redux";
import {AppState} from "@/reducers";
import * as firebase from "firebase"
import {AuthState, GameState, Props} from "@/types/DTRedux";

interface RoundScreenProps extends Props {
    auth: AuthState
    game: GameState
    gameDocRef: firebase.firestore.DocumentReference | undefined
}

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth,
        game: state.game
    }
};

class RoundScreen extends Component<RoundScreenProps, any> {

    constructor(props: RoundScreenProps) {
        super(props);
    }

    render() {
        return (
            <div className="RoundScreen">
                <p>round</p>
            </div>
        );
    }
}

export default connect(mapStateToProps)(RoundScreen);
