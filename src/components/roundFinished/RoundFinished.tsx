import React, {Component} from 'react';
import * as firebase from "firebase"
import {AuthState, GameState, Props} from "@/types/DTRedux";

interface RoundFinishedProps extends Props {
    auth: AuthState
    game: GameState
    gameDocRef: firebase.firestore.DocumentReference | undefined
}

class RoundFinished extends Component<RoundFinishedProps, { round: any }> {
    constructor(props: RoundFinishedProps) {
        super(props);
        this.state = {
            round: {},
        };
    }

    componentDidMount(): void {
        if (this.props.gameDocRef) {
            this.props.gameDocRef.collection('roundInfo').doc(this.props.game.currentRound).get().then((result) => {
                this.setState({
                    round: result.data()
                })
            });
        }
    }

    render() {

        let correct = ""

        if (this.props.game.users[this.state.round.correct]) {
            correct = this.props.game.users[this.state.round.correct].displayName
        }

        return (
            <div className="RoundFinished">
                <p>{correct} guessed it</p>
                <p>The word was: {this.state.round.word}</p>
            </div>
        );
    }
}

export default RoundFinished;
