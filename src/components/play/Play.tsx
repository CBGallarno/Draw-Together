import * as React from 'react';
import * as firebase from "firebase";
// tslint:disable-next-line:no-import-side-effect
import "./Play.scss";
import PlayHome from "../playHome/PlayHome";
import {AuthState, GameState, Props} from "@/types/DTRedux";
import {AppState} from "@/reducers";
import {RouteChildrenProps} from "react-router";
import {createGame, joinGame, setUsers, updateGame} from "@/actions/game";
import {connect} from "react-redux";
import RoundScreen from "@/components/roundScreen/RoundScreen";
import GameLobby from "@/components/gameLobby/GameLobby";

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

class PlayComponent extends React.Component<PlayProps, { error: string }> {
    gameDocRef: firebase.firestore.DocumentReference | undefined;
    unsubscribeCurrentGameListener: any;
    unsubscribeCurrentGameUsersListener: any;

    constructor(props: PlayProps) {
        super(props);

        this.state = {
            error: ""
        }
    }


    createGame() {
        if (this.props.auth.signedIn) {
            firebase.firestore().collection('games').add({host: this.props.auth.userId})
                .then((response) => {
                    this.props.dispatch(createGame(response.id, this.props.auth.userId));
                    this.subscribeToGameDocs(response.id);
                    this.props.history.push(`${this.props.match!.url}/${response.id}`);
                })
        } else {
            this.setState({
                error: "Need to be logged in to create a game"
            })
        }
    }

    joinGame(code: string) {
        if (code) {
            firebase.firestore().collection('games').where('joinCode', '==', code).where('lobby', '==', true).get().then((response) => {
                if (response.size === 1) {
                    const doc = response.docs[0];
                    const obj: any = {};
                    obj[this.props.auth.userId] = {
                        team: null,
                        displayName: this.props.auth.userName
                    };
                    doc.ref.collection('users').doc('users').set(obj, {merge: true}).then(() => {
                        this.props.dispatch(joinGame(doc.id, doc.get("host")));
                        this.subscribeToGameDocs(doc.id);
                        this.props.history.push(`${this.props.match!.url}/${doc.id}`);
                    })
                } else {
                    console.log('not found');
                    this.setState({error: "game not found"})
                    // TODO: game not found. Could be duplicates found??? (prevent this)
                }
            })
        } else {
            this.setState({error: "Please enter a code"})
        }

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
        let currentScreen = <div className="loading"/>;
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
                <h1 className={"error-message"}>{this.state.error}</h1>
                {currentScreen}
            </div>
        );
    }
}

export default connect(mapStateToProps)(PlayComponent);
