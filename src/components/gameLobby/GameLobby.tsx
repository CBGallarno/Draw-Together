import React, {Component} from 'react';
import {connect} from "react-redux";
import * as firebase from "firebase";
import {setUsers, updateGame} from "@/actions/game";
import {AppState} from "@/reducers";
import {RouteChildrenProps} from "react-router";
import {AuthState, GameState, Props} from "@/types/DTRedux";

interface GameLobbyProps extends RouteChildrenProps<{ gameId: string }>, Props {
    auth: AuthState
    game: GameState
}

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth,
        game: state.game
    }
};

class GameLobby extends Component<GameLobbyProps, any> {

    gameDocRef: firebase.firestore.DocumentReference | undefined
    unsubscribeCurrentGameListener: any
    unsubscribeCurrentGameUsersListener: any


    constructor(props: GameLobbyProps) {
        super(props)

        this.leaveGame = this.leaveGame.bind(this);

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

    leaveGame() {
        if (this.gameDocRef !== undefined) {
            let obj: any = {}
            obj[this.props.auth.userId] = firebase.firestore.FieldValue.delete();
            this.gameDocRef.collection('users').doc('users').update(obj).then(() =>
                this.props.history.replace('/play')
            )
        }
    }

    render() {
        let usersEls = []

        let users = this.props.game.users
        if (users) {
            let userEntries = Object.entries(users)
            for (let i = 0; i < userEntries.length; i++) {
                usersEls.push(<li key={userEntries[i][0]}>{userEntries[i][1].displayName}</li>)
            }
        }

        /// TODO: detect error'd game
        return (
            <div className="GameLobby">
                <h1>Lobby</h1>
                <ul>
                    {usersEls}
                </ul>
                <h2>Use this code to join: <span className="code">{this.props.game.joinCode}</span></h2>
                {this.props.auth.userId === this.props.game.host && <button>Start Game</button>}
                {this.props.auth.userId !== this.props.game.host &&
                <button onClick={this.leaveGame}>Leave Game</button>}
            </div>
        );
    }
}

export default connect(mapStateToProps)(GameLobby);
