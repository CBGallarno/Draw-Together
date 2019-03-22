import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

export const addUserDataOnNewUser = functions.auth.user().onCreate((user) => {
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        username: user.displayName ? user.displayName : null
    }).then((response) => {
        console.log('New User Added: ' + user.uid)
        return null;
    }).catch((err) => {
        console.error('Failed to Set User Data: ' + user.uid)
        console.error(err)
        return null;
    })
})