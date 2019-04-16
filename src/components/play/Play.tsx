import * as React from 'react';
import * as firebase from "firebase";
import {connect} from "react-redux";
import GameLobby from "../gameLobby/GameLobby";
import PlayHome from "../playHome/PlayHome";
import {AuthState, GameState, Props} from "@/types/DTRedux";
import {AppState} from "@/reducers";
import {RouteChildrenProps} from "react-router";
import RoundScreen from "@/components/roundScreen/RoundScreen";
import {setUsers, updateGame} from "@/actions/game";

interface PlayProps extends RouteChildrenProps<{ gameId: string }>, Props {
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

    gameDocRef: firebase.firestore.DocumentReference | undefined;
    unsubscribeCurrentGameListener: any;
    unsubscribeCurrentGameUsersListener: any;

    createGame() {
        firebase.firestore().collection('games').add({host: this.props.auth.userId})
            .then((response) => {
                this.subscribeToGameDocs(response.id)
                this.props.history.push(`${this.props.match!.url}/${response.id}`)
            })
    }

    joinGame(code: string) {
        firebase.firestore().collection('games').where('joinCode', '==', code).where('lobby', '==', true).get().then((response) => {
            if (response.size === 1) {
                const doc = response.docs[0];
                const obj: any = {};
                obj[this.props.auth.userId] = {
                    team: null,
                    displayName: this.props.auth.userName
                };
                doc.ref.collection('users').doc('users').set(obj, {merge: true}).then(() => {
                    this.subscribeToGameDocs(doc.id)
                    this.props.history.push(`${this.props.match!.url}/${doc.id}`)
                })
            } else {
                // TODO: game not found. Could be duplicates found??? (prevent this)
            }
        })
    }

    componentDidMount() {
        if (this.props.match !== null && this.props.match !== undefined && this.props.match.params.gameId !== undefined) {

            if (this.unsubscribeCurrentGameListener !== undefined) {
                this.unsubscribeCurrentGameListener()
            }
            if (this.unsubscribeCurrentGameUsersListener !== undefined) {
                this.unsubscribeCurrentGameUsersListener()
            }
            this.subscribeToGameDocs(this.props.match.params.gameId)
        }
    }

    subscribeToGameDocs(gameId: string) {
        this.gameDocRef = firebase.firestore().collection('games').doc(gameId);

        this.unsubscribeCurrentGameListener = this.gameDocRef.onSnapshot((response) => {
            this.props.dispatch(updateGame({gameId: response.id, ...response.data()}));
        });
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
        let currentScreen = <div className="loading"/>
        if (this.props.match && this.props.match.params.gameId) {

            if (this.props.game.lobby) {
                currentScreen = (<GameLobby gameDocRef={this.gameDocRef}/>)
            } else if (this.props.game.currentRound) {
                currentScreen = (<RoundScreen gameDocRef={this.gameDocRef}/>)
            }
        } else {
            currentScreen = <PlayHome createGameClick={() => this.createGame()}
                                      joinGameClick={(code) => this.joinGame(code)}/>;
        }

        return (
            <div className="Play">
                {currentScreen}
            </div>
        );
    }
}

export default connect(mapStateToProps)(PlayComponent);
