import React, {Component} from 'react';
import {connect} from "react-redux";
import * as firebase from "firebase";
import {setUsers, updateGame} from "@/actions/game";
import {AppState} from "@/reducers";
import {RouteChildrenProps} from "react-router";
import {AuthState, GameState, Props} from "@/types/DTRedux";

interface GameScreenProps extends RouteChildrenProps<{ gameId: string }>, Props {
    auth: AuthState
    game: GameState
}

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth,
        game: state.game
    }
};

class GameScreen extends Component<GameScreenProps, any> {

    gameDocRef: firebase.firestore.DocumentReference | undefined
    unsubscribeCurrentGameListener: any
    unsubscribeCurrentGameUsersListener: any


    constructor(props: GameScreenProps) {
        super(props)
    }

    componentDidMount() {
        this.gameDocRef = firebase.firestore().collection('games').doc(this.props.match!.params.gameId)

        if (this.unsubscribeCurrentGameListener !== undefined) {
            this.unsubscribeCurrentGameListener()
        }
        if (this.unsubscribeCurrentGameUsersListener !== undefined) {
            this.unsubscribeCurrentGameUsersListener()
        }
        this.unsubscribeCurrentGameListener = this.gameDocRef.onSnapshot((response) => {
            this.props.dispatch(updateGame({gameId: response.id, ...response.data()}));
        })
        this.unsubscribeCurrentGameUsersListener = this.gameDocRef.collection('users').doc('users').onSnapshot((response) => {
            this.props.dispatch(setUsers(response.data()));
        })
    }

    componentWillUnmount() {
        if (this.unsubscribeCurrentGameListener !== undefined) {
            this.unsubscribeCurrentGameListener()
        }
        if (this.unsubscribeCurrentGameUsersListener !== undefined) {
            this.unsubscribeCurrentGameUsersListener()
        }
    }

    render() {

        /// TODO: detect error'd game
        return (
            <div className="GameScreen">
                <h1>Screen</h1>
            </div>
        );
    }
}

export default connect(mapStateToProps)(GameScreen);
