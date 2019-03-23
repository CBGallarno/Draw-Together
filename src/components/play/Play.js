import React, {Component} from 'react';
import * as firebase from "firebase";
import {connect} from "react-redux";
import {updateGame} from 'actions/game'

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    game: state.game
  }
}

class PlayComponent extends Component {

  createGame() {
    firebase.firestore().collection('games').add({host: this.props.auth.userId}).then((response) => {
        if (this.unsubscribeCurrentGameListener !== undefined) {
          this.unsubscribeCurrentGameListener()
        }
      const dispatch = this.props.dispatch
      this.unsubscribeCurrentGameListener = firebase.firestore().collection('games').doc(response.id).onSnapshot((response) => {
        dispatch(updateGame({gameId: response.id, ...response.data()}));
      })
      }
    ).catch((err) => {
      console.error(err)
    })
  }

  componentDidUpdate() {
    if (this.unsubscribeCurrentGameListener === undefined && this.props.game.gameId !== undefined) {
      const dispatch = this.props.dispatch
      this.unsubscribeCurrentGameListener = firebase.firestore().collection('games').doc(this.props.game.gameId).onSnapshot((response) => {
        dispatch(updateGame(response.data()));
      })
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeCurrentGameListener !== undefined) {
      this.unsubscribeCurrentGameListener()
    }
  }

  render() {
    return (
      <div className="Play">
        <h1>Play</h1>
        <button>Join Game</button>
        <button onClick={() => this.createGame()}>Create Game</button>
      </div>
    );
  }
}

export default connect(mapStateToProps)(PlayComponent);
