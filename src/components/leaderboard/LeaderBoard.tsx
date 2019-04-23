import React, {Component} from 'react';
import {GameState} from "@/types/DTRedux";
import {connect} from "react-redux";
import {AppState} from "@/reducers";

const mapStateToProps = (state: AppState) => {
    return {
        game: state.game
    }
}
interface LeaderBoardProps{
    winningID:  string
    game: GameState
}

class LeaderBoard extends Component<LeaderBoardProps> {
    constructor(props: LeaderBoardProps) {
        super(props);
    }
    render() {

        const users = this.props.game.users;

        const leaderboard = Object.keys(users).map((userId) => {
            return <tr><td>{users[userId].displayName}</td><td>{userId === this.props.winningID ? users[userId].score+ 1: users[userId].score}</td></tr>;
        });
        return (
            <div className={"leaderBoard"}>
                <table>
                <tr>
                    <th>User</th>
                    <th>Score</th>
                    </tr>
                    {leaderboard}
                </table>
            </div>
        );
    }
}

export default connect(mapStateToProps)(LeaderBoard);
