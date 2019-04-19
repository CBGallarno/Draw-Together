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
        if (this.props.auth.signedIn && !this.props.auth.isAnonymous) {
            firebase.firestore().collection('games').add({host: this.props.auth.userId})
                .then((response) => {
                    this.setState({error: ""});
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

    static generateGuestUsername(): string {
        const suffixes = ["Colorful", "Artistic", "Creative", "Boundless", "Inspiring", "Bold", "Beautiful",
            "Daring", "Dazzling", "Detailed", "Dreamy", "Elevating", "Exceptional", "Exotic", "Honest", "Luminous", "Mysterious", "Mystical", "Pictorial", "Provoking", "Skilled"];
        const names = ["Picasso", "van Gogh", "da Vinci", "Monet", "Warhol", "Michelangelo",
            "Raphael", "Chagall", "Kernighan", "Ritchie"];
        return suffixes[Math.floor(Math.random() * suffixes.length)] + " " + names[Math.floor(Math.random() * names.length)]
    }

    joinGame(code: string) {
        if (code) {
            if (!this.props.auth.signedIn || this.props.auth.isAnonymous) {
                firebase.auth().signInAnonymously().catch(function (error) {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode);
                    console.log(errorMessage);
                }).then((user) => {
                    if (user) {
                        const userCred = user as firebase.auth.UserCredential
                        firebase.firestore().collection('games').where('joinCode', '==', code).where('lobby', '==', true).get().then((response) => {
                            if (response.size === 1) {
                                const doc = response.docs[0];
                                const obj: any = {};
                                obj[userCred.user!.uid] = {
                                    team: null,
                                    displayName: "* " + PlayComponent.generateGuestUsername()
                                };
                                doc.ref.collection('users').doc('users').set(obj, {merge: true}).then(() => {
                                    this.setState({error: ""});
                                    this.props.dispatch(joinGame(doc.id, doc.get("host")));
                                    this.subscribeToGameDocs(doc.id);
                                    this.props.history.push(`${this.props.match!.url}/${doc.id}`);
                                })
                            } else {
                                console.log('not found');
                                this.setState({error: "game not found"})
                                // TODO: game not found. Could be duplicates found??? (prevent this)
                            }
                        });
                    }
                });
            } else {
                firebase.firestore().collection('games').where('joinCode', '==', code).where('lobby', '==', true).get().then((response) => {
                    if (response.size === 1) {
                        const doc = response.docs[0];
                        const obj: any = {};
                        obj[this.props.auth.userId] = {
                            team: null,
                            displayName: this.props.auth.userName
                        };
                        doc.ref.collection('users').doc('users').set(obj, {merge: true}).then(() => {
                            this.setState({error: ""});
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
            }
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
            const data = response.data();
            if (data && data.joinCode && this.gameDocRef && this.props.auth.userName) {
                if (this.props.auth.userId === data.host) {

                    const obj: any = {};
                    obj[this.props.auth.userId] = {
                        team: null,
                        displayName: this.props.auth.userName
                    };
                    this.gameDocRef.collection('users').doc('users').set(obj, {merge: true}).then(() => {
                        console.log("set successful")
                    }); //use to join user
                }
            }
            this.props.dispatch(updateGame({gameId: response.id, ...response.data()}));
        });
        this.unsubscribeCurrentGameUsersListener = this.gameDocRef.collection('users').doc('users').onSnapshot((response) => {
            this.props.dispatch(setUsers(response.data()));
        })
    }

    unsubscribeFromGameDocs() {
        this.props.dispatch(updateGame({}))
        if (this.unsubscribeCurrentGameListener !== undefined) {
            this.unsubscribeCurrentGameListener()
        }
        if (this.unsubscribeCurrentGameUsersListener !== undefined) {
            this.unsubscribeCurrentGameUsersListener()
        }
    }

    componentWillUnmount() {
        this.unsubscribeFromGameDocs()
    }

    render() {
        let currentScreen = <div className="loading"><p>Loading</p></div>;
        if (this.props.match && this.props.match.params.gameId) {

            if (this.props.game.lobby) {
                currentScreen = (<GameLobby onLeaveGame={() => this.unsubscribeFromGameDocs()} {...this.props} gameDocRef={this.gameDocRef}/>)
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
