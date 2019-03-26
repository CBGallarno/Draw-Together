import * as React from 'react';
import {RefObject} from 'react';
import {connect} from "react-redux";
import {GameState} from "../../types/Redux";
import {AppState} from "../../reducers";

interface PlayHomeProps {
    game: GameState
    joinGameClick: (code: string) => void
    createGameClick: () => void
}

const mapStateToProps = (state: AppState) => {
    return {
        // auth: state.auth,
        game: state.game
    }
};

class PlayHome extends React.Component<PlayHomeProps, any> {
    codeRef: RefObject<HTMLInputElement>;

    constructor(props: PlayHomeProps) {
        super(props)

        this.codeRef = React.createRef();
    }

    render() {
        return (
            <div className="Play">
                <h1>Play</h1>
                <input ref={this.codeRef} type="input" placeholder="Game Code"></input>
                <button onClick={(() => this.props.joinGameClick(this.codeRef.current!.value))}>Join Game</button>
                <button onClick={this.props.createGameClick}>Create Game</button>
            </div>
        );
    }
}

export default connect(mapStateToProps)(PlayHome);