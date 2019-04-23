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

        this.startNextRound = this.startNextRound.bind(this);
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

    startNextRound() {
        if (this.props.gameDocRef) {
            this.props.gameDocRef.update({nextRound: true, currentRound: ""})// TODO: consider removing currentRound
        }
    }

    render() {

        let correct = ""

        if (this.props.game.users[this.state.round.correct]) {
            correct = this.props.game.users[this.state.round.correct].displayName
        }

        const users = this.props.game.users

        const leaderboard = Object.keys(users).map((userId) => {
            return <p>{users[userId].displayName}: {userId === this.state.round.correct ? 1: 0}</p>
        })

        return (
            <div className="RoundFinished">
                <p>{correct} guessed it</p>
                <p>The word was: {this.state.round.word}</p>
                <button type="button" onClick={this.startNextRound}>Next Round</button>
                <div className="leaderBoard">
                    {leaderboard}
                </div>
            </div>
        );
    }
}

export default RoundFinished;
