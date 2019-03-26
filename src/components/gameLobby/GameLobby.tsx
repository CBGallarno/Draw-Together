import React, {Component} from 'react';
import {connect} from "react-redux";
import * as firebase from "firebase";
import {updateGame, setUsers} from "../../actions/game";

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    game: state.game
  }
};

class GameLobby extends Component {


  constructor(props) {
    super(props)

    this.leaveGame = this.leaveGame.bind(this);

  }

  componentDidMount() {
    this.gameRef = firebase.firestore().collection('games').doc(this.props.match.params.gameId)

    if (this.unsubscribeCurrentGameListener !== undefined) {
      this.unsubscribeCurrentGameListener()
    }
    if (this.unsubscribeCurrentGameUsersListener !== undefined) {
      this.unsubscribeCurrentGameUsersListener()
    }
    this.unsubscribeCurrentGameListener = this.gameRef.onSnapshot((response) => {
      this.props.dispatch(updateGame({gameId: response.id, ...response.data()}));
    })
    this.unsubscribeCurrentGameUsersListener = this.gameRef.collection('users').doc('users').onSnapshot((response) => {
      this.props.dispatch(setUsers(response.data()));
    })
  }

  componentWillUnmount() {
    if (this.unsubscribeCurrentGameListener !== undefined) {
      this.unsubscribeCurrentGameListener()
    }
    if (this.unsubscribeCurrentGameUsersListener !== undefined) {
      this.unsubscribeCurrentGameUsersListener()
    }
  }

  leaveGame() {
    let obj = {}
    obj[this.props.auth.userId] = firebase.firestore.FieldValue.delete();
    this.gameRef.collection('users').doc('users').update(obj).then(() =>
      this.props.history.replace('/play')
    )
  }

  render() {
    let usersEls = []

    let users = this.props.game.users
    if (users) {
      let userEntries = Object.entries(users)
      for (let i = 0; i < userEntries.length; i++) {
        usersEls.push(<li key={userEntries[i][0]}>{userEntries[i][1].displayName}</li>)
      }
    }

    /// TODO: detect error'd game
    return (
      <div className="GameLobby">
        <h1>Lobby</h1>
        <ul>
          {usersEls}
        </ul>
        <h2>Use this code to join: <span className="code">{this.props.game.joinCode}</span></h2>
        {this.props.auth.userId === this.props.game.host && <button>Start Game</button>}
        {this.props.auth.userId !== this.props.game.host && <button onClick={this.leaveGame}>Leave Game</button>}
      </div>
    );
  }
}

export default connect(mapStateToProps)(GameLobby);
