import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import {rootReducer} from './reducers'
import firebase from "firebase";
import {login, logout} from "@/actions";

const store = createStore(rootReducer)

firebase.initializeApp({
    apiKey: 'AIzaSyAOQbzywYmlIoeOTJSTZVQU7X2F1Nh4nTA',
    authDomain: 'pict-proto.firebaseapp.com',
    projectId: 'pict-proto'
});

let unsubscribeUserDataListener: any = undefined;

firebase.auth().onAuthStateChanged((user) => {
    if (unsubscribeUserDataListener) {
        unsubscribeUserDataListener()
    }
    if (user) {
        const {uid, isAnonymous} = user
        unsubscribeUserDataListener = firebase.firestore().collection('users').doc(user.uid).onSnapshot((response) => {
            const userData = response.data()
            if (userData) {
                const {username, email}: any = userData
                store.dispatch(login(uid, username, email, isAnonymous))
            }
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
