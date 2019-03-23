import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";

admin.initializeApp();

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

// noinspection JSUnusedGlobalSymbols
export const addUserDataOnNewUser = functions.auth.user().onCreate((user) => {
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        username: user.displayName ? user.displayName : null
    })
})

// noinspection JSUnusedGlobalSymbols
export const initializeGameOnCreate = functions.firestore.document('games/{gameId}').onCreate((snap: DocumentSnapshot, context: functions.EventContext) => {

    let joinCode: string;
    if (snap) {
        const data = snap.data()
        if (data && data.host) {
            joinCode = snap.id.substr(0, 3) + data.host.substr(0, 3)
        } else {
            joinCode = "XYQZ34"
        }
    } else {
        return
    }

    return db.collection('games').where('joinCode', '==', joinCode).get().then((response) => {
        if (response.empty) {
            return
        }
        console.error("Join code not available: " + joinCode)
        return snap.ref.update({error: true})
    }).then(() => {
        return snap.ref.update({joinCode: joinCode, lobby: true})
    })
});