import React, {Component, RefObject} from 'react';
import {connect} from "react-redux";
import {AppState} from "@/reducers";
// tslint:disable-next-line:no-import-side-effect
import "./RoundScreen.scss"
import * as firebase from "firebase"
import {AuthState, GameState, Props} from "@/types/DTRedux";
import Canvas from "@/components/canvas/Canvas";
import {Drawing} from "@/types/drawing";
import RoundFinished from "@/components/roundFinished/RoundFinished";

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

class RoundScreen extends Component<RoundScreenProps, { round: any, drawing: Drawing, word: string | undefined }> {

    lastWriteTime: number = -1;
    unsubscribeCurrentRoundListener: any;
    unsubscribeCurrentDrawingListener: any;
    guessRef: RefObject<HTMLInputElement>;

    constructor(props: RoundScreenProps) {
        super(props);
        this.state = {
            round: {},
            drawing: {strokes: []},
            word: undefined
        };

        this.guessRef = React.createRef();

        this.handleOnDraw = this.handleOnDraw.bind(this);
        this.handleOnDrawStart = this.handleOnDrawStart.bind(this);
        this.handleOnDrawEnd = this.handleOnDrawEnd.bind(this);
        this.sendGuess = this.sendGuess.bind(this);
    }

    componentDidMount(): void {
        let mounting = true
        if (this.props.gameDocRef) {
            this.unsubscribeCurrentRoundListener = this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).onSnapshot((snap) => {
                const data = snap.data();
                if (data) {
                    this.setState({
                        round: data,
                    });
                    // TODO: Move this to read once per round
                    if (this.props.auth.userId === data.drawer) {
                        this.props.gameDocRef!.collection('roundInfo').doc('roundWords').get().then((response) => {
                            this.setState({word: response.get(snap.id)})
                        })
                    }
                }
            });
            this.unsubscribeCurrentDrawingListener = this.props.gameDocRef.collection('drawings').doc(this.props.game.currentRound).onSnapshot((snap) => {
                const data = snap.data();
                if (data && data.drawing && (this.props.auth.userId !== this.state.round.drawer || mounting)) {
                    this.setState({
                        drawing: data.drawing
                    });
                    mounting = false;
                }
            })
        }
    }

    componentWillUnmount(): void {
        if (this.unsubscribeCurrentDrawingListener) {
            this.unsubscribeCurrentDrawingListener()
        }
        if (this.unsubscribeCurrentRoundListener) {
            this.unsubscribeCurrentRoundListener()
        }
    }

    handleOnDrawStart() {
        this.state.drawing.strokes.push({x: [], y: []})
    }

    handleOnDraw(x: number, y: number) {
        const drawing = this.state.drawing;
        if (!(drawing.strokes[drawing.strokes.length - 1].x.findIndex(val => {
            return val === x
        }) >= 0 && drawing.strokes[drawing.strokes.length - 1].y.findIndex(val => {
            return val === y
        }) >= 0)) {
            drawing.strokes[drawing.strokes.length - 1].x.push(x);
            drawing.strokes[drawing.strokes.length - 1].y.push(y);
            this.setState({drawing});

            const currTime = Date.now();

            if (this.props.gameDocRef && Date.now() - this.lastWriteTime > 1000) {
                this.lastWriteTime = currTime;
                this.props.gameDocRef.collection('drawings').doc(this.props.game.currentRound).update({
                    drawing: this.state.drawing
                });
                console.log("WRITE")
            }
        } else {
            // console.log("OVERLAP")
        }
    }

    handleOnDrawEnd() {
        if (this.props.gameDocRef) {
            this.props.gameDocRef.collection('drawings').doc(this.props.game.currentRound).update({
                drawing: this.state.drawing
            });
            console.log("WRITE")
        }
    }

    sendGuess(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const inputRef = this.guessRef.current;
        if (inputRef && this.props.gameDocRef && this.props.auth.userId) {
            const guess = inputRef.value;
            if (guess) {
                this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).update({
                    guesses: firebase.firestore.FieldValue.arrayUnion({
                        guess,
                        user: this.props.auth.userId,
                        team: this.props.game.users[this.props.auth.userId].team,
                    })
                })
                inputRef.value = ""
                inputRef.focus()
            }
        } else {
            // not guess or error..
        }
    }


    render() {
        let drawerMessage = <p/>;
        if (this.props.game.users[this.state.round.drawer]) {
            if (this.state.round.drawer === this.props.auth.userId) {
                drawerMessage = <p>You're Drawing! Your word: {this.state.word}</p>
            } else {
                drawerMessage = <p>{this.props.game.users[this.state.round.drawer].displayName} is drawing!</p>
            }
        }

        let guesser = <p/>;
        if (this.state.round.drawer === this.props.auth.userId && this.state.round.guesses) {
            guesser = this.state.round.guesses.reduce((guessEls: JSX.Element[] = [], guess: any) => {
                if (guess.team === this.state.round.team) {
                    guessEls.push(<p>{guess.guess}</p>)
                    console.log(guess)
                }
                return guessEls
            }, [])
            console.log(guesser)
        } else if (this.state.round.drawer !== this.props.auth.userId) {
            guesser = <form onSubmit={this.sendGuess}>
                <input ref={this.guessRef} type="text" placeholder="Enter Guess"/>
                <button type="submit">Guess!</button>
            </form>
        }

        const team = this.props.game.users[this.props.auth.userId] ? this.props.game.users[this.props.auth.userId].team : 0
        const userIds = Object.keys(this.props.game.users);
        const teamMembers = userIds.reduce((members: JSX.Element[] = [], userId) => {
            const user = this.props.game.users[userId];
            // console.log(user + " " + team)
            if (user.team === team && userId !== this.props.auth.userId) {
                members.push(<p key={userId}>{user.displayName}</p>)
            }
            return members
        }, []);

        if (this.state.round.finished) {
            return (<RoundFinished {...this.props}/>)
        }

        return (
            <div className="RoundScreen">
                <div className="Team">
                    <h4>Team:</h4>
                    <div>{teamMembers}</div>
                </div>
                <div className="currentDrawer">
                    {drawerMessage}
                </div>
                <div className="canvas">
                    <Canvas drawable={!!this.state.word} currentDrawing={this.state.drawing} onDraw={this.handleOnDraw}
                            onDrawStart={this.handleOnDrawStart} onDrawEnd={this.handleOnDrawEnd}/>
                </div>
                <div className="guess">{guesser}</div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(RoundScreen);
