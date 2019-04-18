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
        email: user.email ? user.email : null,
        username: user.displayName ? user.displayName : null,
    })
});

// noinspection JSUnusedGlobalSymbols
export const onRoundUpdate = functions.firestore.document('games/{gameId}/roundInfo/{round}').onUpdate((change: functions.Change<DocumentSnapshot>, context) => {
    if (change.after.id === "roundWords") {
        return null
    }
    const data = change.after.data();
    if (data) {
        if (data.finished) {
            return null
        }
        const guesses: [] = data.guesses;
        if (guesses && guesses.length > 0) {
            return admin.firestore().collection('games').doc(context.params.gameId).collection('roundInfo').doc('roundWords').get().then(response => {
                const words = response.data();
                if (words) {
                    const word = words[change.after.id];
                    let update = undefined;
                    guesses.some((val: any) => {
                        const guess = val.guess;
                        if (word === guess && val.team === data.team) {
                            update = change.after.ref.update({finished: true, correct: val.user, word: word})
                            return true
                        }
                        return false
                    })
                    if (update) {
                        return update
                    } else {
                        return null
                    }
                }
                return null
            })
        }
    }
    return null
})

// noinspection JSUnusedGlobalSymbols
export const onGameUpdate = functions.firestore.document('games/{gameId}').onUpdate((change: functions.Change<DocumentSnapshot>) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const docRef = change.after.ref;
    if (beforeData !== undefined && afterData !== undefined) {
        // Host clicked start game
        if (beforeData.lobby === true && afterData.lobby === false) {
            return admin.firestore().runTransaction((transaction) => {
                return transaction.get(docRef.collection('users').doc('users')).then((response: DocumentSnapshot) => {
                    const users = response.data();
                    if (users !== undefined && Object.keys(users).length !== 0) {
                        const userKeys = Object.keys(users);
                        const drawIndex = Math.floor(Math.random() * userKeys.length);
                        const drawer = userKeys[drawIndex];
                        users[drawer].drawn = true;
                        let team = 1;
                        while (userKeys.length > 0) {
                            const i = Math.floor(Math.random() * userKeys.length);
                            users[userKeys[i]].team = team;
                            if (team === 1) {
                                team = 2
                            } else {
                                team = 1
                            }
                            userKeys.splice(i, 1)
                        }
                        return [users, drawer]
                    }
                    throw new Error("no users found")
                }).then(userData => {
                    const users = userData[0] as admin.firestore.DocumentData;
                    const drawer = userData[1] as string;
                    const roundDoc = docRef.collection('roundInfo').doc();
                    return transaction.set(docRef.collection('users').doc('users'), users)
                        .create(docRef.collection('roundInfo').doc('roundWords'), {[roundDoc.id]: 'selectWord'})
                        .create(roundDoc, {drawer, round: 1, team: users[drawer].team, finished: false})
                        .update(docRef, {currentRound: roundDoc.id, joinCode: null})
                })
            })
        }
    }
    return null
});

// noinspection JSUnusedGlobalSymbols
export const initializeGameOnCreate = functions.firestore.document('games/{gameId}').onCreate((snap: DocumentSnapshot) => {

    let joinCode: string;
    if (snap) {
        const data = snap.data();
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
            return snap.ref.update({joinCode: joinCode, lobby: true})
        }
        console.error("Join code not available: " + joinCode);
        return snap.ref.update({error: true})
    })
});