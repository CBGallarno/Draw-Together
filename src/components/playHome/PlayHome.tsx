import * as React from 'react';
import {connect} from "react-redux";
import {AuthState, GameState} from "@/types/DTRedux";
import {AppState} from "@/reducers";
import "./PlayHome.scss";

interface PlayHomeProps {
    auth: AuthState
    game: GameState
    joinGameClick: (code: string) => void
    createGameClick: () => void
}

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth,
        game: state.game
    }
};

class PlayHome extends React.Component<PlayHomeProps, any> {
    codeRef: React.RefObject<HTMLInputElement>;

    constructor(props: PlayHomeProps) {
        super(props)

        this.codeRef = React.createRef();
    }

    render() {
        return (
            <div className="PlayHome">
                <h3>Enter a game code and press Join Game</h3>
                <div className="joinGame">
                    <input ref={this.codeRef} type="input" placeholder="Game Code"/>
                    <button onClick={(() => this.props.joinGameClick(this.codeRef.current!.value))}>Join Game</button>
                </div>
                {this.props.auth.signedIn && !this.props.auth.isAnonymous &&
                <button onClick={this.props.createGameClick}>Create Game</button>}
            </div>
        );
    }
}

export default connect(mapStateToProps)(PlayHome);
