import React from 'react';
import './Login.scss'
import firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/FirebaseAuth';
import {connect} from "react-redux";

const mapStateToProps = state => {
  return {
    auth: state.auth
  }
}

const signout = () => {
  firebase.auth().signOut()
}


let loginComponenet = ({dispatch, auth}) => {
  if (auth.signedIn) {
    return (
      <div>
        <p>{auth.userName}</p>
        <button onClick={() => signout()}>Signout</button>
      </div>
    )
  } else {
    return (
      <div className="Login">
        <div className="auth">
          <h3>Login with one of the options below</h3>
          <StyledFirebaseAuth className="auth" uiConfig={{
            signInFlow: 'redirect',
            signInOptions: [
              firebase.auth.EmailAuthProvider.PROVIDER_ID,
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
  }
}

export default connect(mapStateToProps)(loginComponenet)
