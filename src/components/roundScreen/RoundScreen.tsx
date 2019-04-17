import React, {Component} from 'react';
import {connect} from "react-redux";
import {AppState} from "@/reducers";
import * as firebase from "firebase"
import {AuthState, GameState, Props} from "@/types/DTRedux";
import Canvas from "@/components/canvas/Canvas";
import {Drawing} from "@/types/drawing";

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

    constructor(props: RoundScreenProps) {
        super(props);
        this.state = {
            round: {},
            drawing: {strokes: []},
            word: undefined
        }

        this.handleOnDraw = this.handleOnDraw.bind(this);
        this.handleOnDrawStart = this.handleOnDrawStart.bind(this);
        this.handleOnDrawEnd = this.handleOnDrawEnd.bind(this);
    }

    componentDidMount(): void {
        if (this.props.gameDocRef) {
            this.unsubscribeCurrentRoundListener = this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).onSnapshot((snap) => {
                const data = snap.data()
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
                    this.setState(newState)
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
        drawing.strokes[drawing.strokes.length - 1].x.push(x);
        drawing.strokes[drawing.strokes.length - 1].y.push(y);
        this.setState({drawing});

        const currTime = Date.now();

        if (this.props.gameDocRef && Date.now() - this.lastWriteTime > 1000) {
            this.lastWriteTime = currTime;
            this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).update({
                drawing: this.state.drawing
            })
            console.log("WRITE")
        }
    }

    handleOnDrawEnd() {
        if (this.props.gameDocRef) {
            this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).update({
                drawing: this.state.drawing
            })
            console.log("WRITE")
        }
    }


    render() {
        let drawerMessage = <p></p>
        if (this.props.game.users[this.state.round.drawer]) {
            if (this.state.round.drawer === this.props.auth.userId) {
                drawerMessage = <p>You're Drawing! Your word: {this.state.word}</p>
            } else {
                drawerMessage = <p>{this.props.game.users[this.state.round.drawer].displayName} is drawing!</p>
            }
        }

        let guesser = <p></p>
        if (this.state.round.drawer === this.props.auth.userId) {
            guesser = <p>guessOne, GuessTwo</p>
        } else {
            guesser = <input type="text" placeholder="Enter Guess"></input>
        }

        return (
            <div className="RoundScreen">
                {drawerMessage}
                <Canvas drawable={!!this.state.word} currentDrawing={this.state.drawing} onDraw={this.handleOnDraw}
                        onDrawStart={this.handleOnDrawStart} onDrawEnd={this.handleOnDrawEnd}/>
                {guesser}
            </div>
        );
    }
}

export default connect(mapStateToProps)(RoundScreen);
