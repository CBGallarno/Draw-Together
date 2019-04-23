import React, {Component} from 'react';
import {connect} from "react-redux";
import * as firebase from "firebase";
import {AppState} from "@/reducers";
import {AuthState, GameState, Props} from "@/types/DTRedux";
import {RouteChildrenProps} from "react-router";

interface GameLobbyProps extends Props, RouteChildrenProps<{ gameId: string }> {
    auth: AuthState
    game: GameState
    gameDocRef: firebase.firestore.DocumentReference | undefined
    onLeaveGame: () => void
    handleError: (message: string) => void
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
        if (this.props.gameDocRef && Object.keys(this.props.game.users).length >= 4) {
            this.props.gameDocRef.update({lobby: false})
        } else {
            this.props.handleError("Not enough players (minimum: 4)")
        }
    }

    leaveGame() {
        if (this.props.gameDocRef) {
            const obj: any = {};
            obj[this.props.auth.userId] = firebase.firestore.FieldValue.delete();
            this.props.gameDocRef.collection('users').doc('users').update(obj).then(() =>
                this.props.history.replace("/play")
            )
            this.props.onLeaveGame()
        }
    }

    render() {
        const usersEls = [];

        const users = this.props.game.users;
        if (users) {
            const userEntries = Object.entries(users);
            for (const userEntry of userEntries) {
                usersEls.push(<li key={userEntry[0]}><p>{userEntry[1].displayName}</p></li>)
            }
        }

        return (
            <div className="GameLobby">
                <h1>Lobby</h1>
                <div className={"list-type1"}>
                <ol>
                    {usersEls}
                </ol>
            </div>
                <h2>Use this code to join: <span className="code">{this.props.game.joinCode!.toLowerCase()}</span></h2>
                {this.props.auth.userId === this.props.game.host && <button onClick={this.startGame}>Start Game</button>}
                {this.props.auth.userId !== this.props.game.host &&
                <button onClick={this.leaveGame}>Leave Game</button>}
            </div>
        );
    }
}

export default connect(mapStateToProps)(GameLobby);
