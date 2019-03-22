import React, {Component} from 'react';
import './Profile.scss'
import firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth';
import {Redirect} from 'react-router';
import {connect} from "react-redux";
import {updateUserName} from "actions"

const mapStateToProps = state => {
  return {
    auth: state.auth
  }
}

const signout = () => {
  firebase.auth().signOut()
}

class profileComponenet extends Component {

  constructor(props) {
    super(props);
    this.displayNameInput = React.createRef();
  }

  saveDisplayName() {
    const username = this.displayNameInput.current.value
    firebase.firestore().collection('users').doc(this.props.auth.userId).update({username: username}).then(() => {
      this.props.dispatch(updateUserName(username))
      }
    )
  }

  render() {
    if (this.props.auth.signedIn) {
      let displayName = (<p>{this.props.auth.userName}</p>)
      if (this.props.auth.userName == null) {
        displayName = (<span>
        <input type="text" placeholder="Display Name" ref={this.displayNameInput}/>
        <button onClick={() => this.saveDisplayName(this.props.auth.userId)}>Save</button>
      </span>)
      }
      return (
        <div className="profile">
          <div className="profileInfo">
            <h4>Email:</h4> <p>{this.props.auth.userEmail}</p>
          </div>
          <div className="profileInfo">
            <h4>Display Name:</h4> {displayName}
          </div>
          <button onClick={() => signout()}>Sign Out</button>
        </div>
      )
    } else {
      return (<Redirect to="/Login"/>);
    }
  }
}

export default connect(mapStateToProps)(profileComponenet)
