import React, {Component} from 'react';
import {connect} from "react-redux";
import * as firebase from "firebase";
import {AppState} from "@/reducers";
import {AuthState, GameState, Props} from "@/types/DTRedux";

interface GameLobbyProps extends Props {
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

class GameLobby extends Component<GameLobbyProps, any> {


    constructor(props: GameLobbyProps) {
        super(props);

        this.leaveGame = this.leaveGame.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    startGame() {
        if (this.props.gameDocRef !== undefined) {
            this.props.gameDocRef.update({lobby: false}).then((response) => {
                console.log(response)
            })
        }
    }

    leaveGame() {
        if (this.props.gameDocRef !== undefined) {
            const obj: any = {};
            obj[this.props.auth.userId] = firebase.firestore.FieldValue.delete();
            this.props.gameDocRef.collection('users').doc('users').update(obj).then(() =>
                console.log()
                // dispatch leaveGame()
            )
        }
    }

    render() {
        const usersEls = [];

        const users = this.props.game.users;
        if (users) {
            const userEntries = Object.entries(users);
            for (const userEntry of userEntries) {
                usersEls.push(<li key={userEntry[0]}>{userEntry[1].displayName}</li>)
            }
        }

        return (
            <div className="GameLobby">
                <h1>Lobby</h1>
                <ul>
                    {usersEls}
                </ul>
                <h2>Use this code to join: <span className="code">{this.props.game.joinCode}</span></h2>
                {this.props.auth.userId === this.props.game.host && <button onClick={this.startGame}>Start Game</button>}
                {this.props.auth.userId !== this.props.game.host &&
                <button onClick={this.leaveGame}>Leave Game</button>}
            </div>
        );
    }
}

export default connect(mapStateToProps)(GameLobby);
