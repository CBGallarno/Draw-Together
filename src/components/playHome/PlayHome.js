import React, {Component} from 'react';
import {connect} from "react-redux";

const mapStateToProps = (state) => {
  return {
    // auth: state.auth,
    game: state.game
  }
};

class PlayHome extends Component {

  constructor(props) {
    super(props)

    this.codeRef = React.createRef();
  }

  render() {
    return (
      <div className="Play">
        <h1>Play</h1>
        <input ref={this.codeRef} type="input" placeholder="Game Code"></input>
        <button onClick={(() => this.props.joinGameClick(this.codeRef.current.value))}>Join Game</button>
        <button onClick={this.props.createGameClick}>Create Game</button>
      </div>
    );
  }
}

export default connect(mapStateToProps)(PlayHome);
