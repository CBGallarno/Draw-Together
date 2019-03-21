import React, {Component} from 'react';
import './Login.scss'
import firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/FirebaseAuth';

firebase.initializeApp({
  apiKey: 'AIzaSyAOQbzywYmlIoeOTJSTZVQU7X2F1Nh4nTA',
  authDomain: 'pict-proto.firebaseapp.com',
  projectId: 'pict-proto'
});

class Login extends Component {

  state = {
    isSignedIn: false, // Local signed-in state.
    userName: '',
  };

  // Listen to the Firebase Auth state and set the local state.
  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
      (user) => {
        this.setState({isSignedIn: !!user});
        if (this.state.isSignedIn) {
          firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get().then((doc) => {
            this.setState({userName: doc.data().username});
            console.log(doc.data());
          })
        }
      }
    );

  }

// Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    if (this.state.isSignedIn) {
      return (
        <div>
          <p>{this.state.userName}</p>
          <button onClick={() => firebase.auth().signOut()}>signout</button>
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
            credentialHelper: 'none'
            // callbacks: {signInSuccessWithAuthResult: () => false,}
          }}
                              firebaseAuth={firebase.auth()}
          />
          </div>
        </div>
      );
    }
  }
}

export default Login;
