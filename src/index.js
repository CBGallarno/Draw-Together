import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import rootReducer from './reducers'
import firebase from "firebase";
import {login, logout} from "actions";

const store = createStore(rootReducer)

firebase.initializeApp({
  apiKey: 'AIzaSyAOQbzywYmlIoeOTJSTZVQU7X2F1Nh4nTA',
  authDomain: 'pict-proto.firebaseapp.com',
  projectId: 'pict-proto'
});

firebase.auth().onAuthStateChanged((user) => {
  if (!!user) {
    firebase.firestore().collection('users').doc(user.uid).get().then((response) => {
      const {username, email} = response.data()
      store.dispatch(login(user.uid, username, email))
    })
  } else {
    store.dispatch(logout())
  }
})

store.subscribe(() => {
  console.log(store.getState())
})

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>
  , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
