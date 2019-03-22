import React from 'react';
import './Login.scss'
import firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/FirebaseAuth';
import {connect} from "react-redux";
import {Redirect} from 'react-router';

const mapStateToProps = state => {
  return {
    auth: state.auth
  }
}

let loginComponenet = ({dispatch, auth}) => {
  if (!auth.signedIn) {
    return (
      <div className="Login">
        <div className="auth">
          <h3>Login with one of the options below</h3>
          <StyledFirebaseAuth uiConfig={{
            signInFlow: 'redirect',
            signInOptions: [
              {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                requireDisplayName: false
              },
              firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            ],
            credentialHelper: 'none',
            callbacks: {
              signInSuccessWithAuthResult: ({user}) => {
                return false
              },
            }
          }} firebaseAuth={firebase.auth()}
          />
        </div>
      </div>
    );
  } else {
    return (
      <Redirect to="/profile"/>
    )
  }
}

export default connect(mapStateToProps)(loginComponenet)
