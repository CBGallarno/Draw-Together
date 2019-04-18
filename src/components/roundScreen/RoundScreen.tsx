import React, {Component, RefObject} from 'react';
import {connect} from "react-redux";
import {AppState} from "@/reducers";
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
        if (this.props.gameDocRef) {
            this.unsubscribeCurrentRoundListener = this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).onSnapshot((snap) => {
                const data = snap.data();
                if (data) {
                    let newState: any = {
                        round: data,
                    };
                    if (data.drawing && this.state.drawing.strokes.length === 0 || this.props.auth.userId !== data.drawer) {
                        newState = {
                            round: data,
                            drawing: data.drawing
                        }
                    }
                    this.setState(newState);
                    if (this.props.auth.userId === data.drawer) {
                        this.props.gameDocRef!.collection('roundInfo').doc('roundWords').get().then((response) => {
                            this.setState({word: response.get(snap.id)})
                        })
                    }
                }
            });
        }
    }

    componentWillUnmount(): void {
        this.unsubscribeCurrentRoundListener()
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
                this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).update({
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
            this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).update({
                drawing: this.state.drawing
            });
            console.log("WRITE")
        }
    }

    sendGuess(e: React.MouseEvent<HTMLButtonElement>) {
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
        if (this.state.round.drawer === this.props.auth.userId) {
            guesser = <p>guessOne, GuessTwo</p>
        } else {
            guesser = <form>
                <input ref={this.guessRef} type="text" placeholder="Enter Guess"/>
                <button onClick={this.sendGuess} type="button">Guess!</button>
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
                <h1>TEAM</h1>
                <div>{teamMembers}</div>
                {drawerMessage}
                <Canvas drawable={!!this.state.word} currentDrawing={this.state.drawing} onDraw={this.handleOnDraw}
                        onDrawStart={this.handleOnDrawStart} onDrawEnd={this.handleOnDrawEnd}/>
                {guesser}
            </div>
        );
    }
}

export default connect(mapStateToProps)(RoundScreen);
