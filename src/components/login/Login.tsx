import * as React from 'react';
import './Login.scss'
import * as firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/FirebaseAuth';
import {connect} from "react-redux";
import * as Redux from "@/types/Redux"
import {Redirect} from 'react-router';
import {AppState} from "@/reducers";
import {AuthState} from "@/types/Redux";

const mapStateToProps = (state: AppState) => {
  return {
    auth: state.auth
  }
}

interface LoginProps extends Redux.Props {
  auth: AuthState
}

let loginComponenet: React.FunctionComponent<LoginProps> = ({dispatch, auth}: LoginProps) => {
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
