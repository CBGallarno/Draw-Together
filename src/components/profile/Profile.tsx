import * as React from 'react';
import {RefObject} from 'react';
import './Profile.scss'
import * as firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth';
import {Redirect} from 'react-router';
import {connect} from "react-redux";
import {updateUserName} from "@/actions"
import * as Redux from "@/types/Redux";
import {AppState} from "@/reducers";

interface ProfileProps extends Redux.Props {
  auth: Redux.AuthState
}

const mapStateToProps = (state: AppState) => {
  return {
    auth: state.auth
  }
}

const signout = () => {
  firebase.auth().signOut()
}

class profileComponent extends React.Component<ProfileProps, any> {
  displayNameInput: RefObject<HTMLInputElement>;

  constructor(props: ProfileProps) {
    super(props);
    this.displayNameInput = React.createRef();
    this.saveDisplayName.bind(this)
  }

  saveDisplayName() {
    if (this.displayNameInput.current !== null) {
      const username = this.displayNameInput.current.value;
      firebase.firestore().collection('users').doc(this.props.auth.userId).update({username: username}).then(() => {
            this.props.dispatch(updateUserName(username))
          }
      )
    }
  }

  render() {
    if (this.props.auth.signedIn) {
      let displayName = (<p>{this.props.auth.userName}</p>)
      if (this.props.auth.userName == null) {
        displayName = (<span>
        <input type="text" placeholder="Display Name" ref={this.displayNameInput}/>
        <button onClick={this.saveDisplayName}>Save</button>
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

export default connect(mapStateToProps)(profileComponent)
