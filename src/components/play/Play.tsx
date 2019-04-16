import * as React from 'react';
import * as firebase from "firebase";
import "./Play.scss";
import {connect} from "react-redux";
import {Route} from "react-router-dom";
import GameLobby from "../gameLobby/GameLobby";
import PlayHome from "../playHome/PlayHome";
import {AuthState, GameState} from "@/types/DTRedux";
import {AppState} from "@/reducers";
import {RouteChildrenProps} from "react-router";

interface PlayProps extends RouteChildrenProps<{ gameId: string }> {
    game: GameState
    auth: AuthState
}

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth,
        game: state.game
    }
};

class PlayComponent extends React.Component<PlayProps, any> {
    private store = { error: "" };
    createGame() {
        if(this.props.auth.userId != "") {
            firebase.firestore().collection('games').add({host: this.props.auth.userId})
                .then((response) => {
                    this.props.history.push(`${this.props.match!.url}/lobby/${response.id}`)
                })
        }
        else{
            this.store.error = "Need to be logged in to create a game";
            this.forceUpdate();
        }
    }

    joinGame(code: string) {
        if(code !=""){
        firebase.firestore().collection('games').where('joinCode', '==', code).where('lobby', '==', true).get().then((response) => {
            if (response.size === 1) {
                const doc = response.docs[0]
                let obj: any = {}
                obj[this.props.auth.userId] = {
                    team: null,
                    displayName: this.props.auth.userName
                }
                doc.ref.collection('users').doc('users').set(obj, {merge: true}).then(() =>
                    this.props.history.push(`${this.props.match!.url}/lobby/${doc.id}`)
                )
            } else {
                console.log('not found');
                this.store.error = "game not found";
                this.forceUpdate();
                // game not found. Could be duplicates found??? (prevent this)
            }
        })}
        else{
            this.store.error = "Please enter a code";
            this.forceUpdate();
        }

    }

    render() {
        return (
            <div className="Play">
                <Route path={`${this.props.match!.path}/lobby/:gameId`} component={GameLobby}/>
                <Route
                    path={`${this.props.match!.path}`} exact
                    render={(props) => <PlayHome createGameClick={() => this.createGame()}
                                                 joinGameClick={(code) => this.joinGame(code)} {...props}/>}
                />
                <h1 className={"error-message"}>{this.store.error}</h1>
            </div>
        );
    }
}

export default connect(mapStateToProps)(PlayComponent);
