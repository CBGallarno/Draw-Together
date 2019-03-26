import React, {Component} from 'react';
import * as firebase from "firebase";
import {connect} from "react-redux";
import {Route} from "react-router-dom";
import GameLobby from "../gameLobby/GameLobby";
import PlayHome from "../playHome/PlayHome";

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    game: state.game
  }
};

class PlayComponent extends Component {

  createGame() {
    firebase.firestore().collection('games').add({host: this.props.auth.userId})
      .then((response) => {
        this.props.history.push(`${this.props.match.url}/lobby/${response.id}`)
      })
  }

  joinGame(code) {
    firebase.firestore().collection('games').where('joinCode', '==', code).where('lobby', '==', true).get().then((response) => {
      if (response.size === 1) {
        const doc = response.docs[0]
        let obj = {}
        obj[this.props.auth.userId] = {
          team: null,
          displayName: this.props.auth.userName
        }
        doc.ref.collection('users').doc('users').set(obj, {merge: true}).then(() =>
          this.props.history.push(`${this.props.match.url}/lobby/${doc.id}`)
        )
      } else {
        // game not found. Could be duplicates found??? (prevent this)
      }
    })
  }

  render() {
    return (
      <div className="Play">
        <Route path={`${this.props.match.path}/lobby/:gameId`} component={GameLobby}/>
        <Route
          path={`${this.props.match.path}`} exact
          render={(props) => <PlayHome createGameClick={() => this.createGame()}
                                       joinGameClick={(code) => this.joinGame(code)} {...props}/>}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps)(PlayComponent);
