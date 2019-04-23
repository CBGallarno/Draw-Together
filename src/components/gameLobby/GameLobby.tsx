import React, {Component} from 'react';
import {connect} from "react-redux";
import * as firebase from "firebase";
import {AppState} from "@/reducers";
import {AuthState, GameState, Props} from "@/types/DTRedux";
import {RouteChildrenProps} from "react-router";
import "./GameLobby.scss"

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
                usersEls.push(<p key={userEntry[0]} className={userEntry[0] === this.props.auth.userId ? "currentPlayer" : ""}>{userEntry[1].displayName}</p>)
            }
        }

        return (
            <div className="GameLobby">
                <h1>Lobby</h1>
                <div className="playerList">
                    {usersEls}
            </div>
                <h3>Use this code to join: <span className="code">{this.props.game.joinCode!.toLowerCase()}</span></h3>
                <h4>{Object.keys(this.props.game.users).length} Rounds</h4>
                {this.props.auth.userId === this.props.game.host && <button onClick={this.startGame}>Start Game</button>}
                {this.props.auth.userId !== this.props.game.host &&
                <button onClick={this.leaveGame}>Leave Game</button>}
            </div>
        );
    }
}

export default connect(mapStateToProps)(GameLobby);
