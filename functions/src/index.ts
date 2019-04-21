import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";

admin.initializeApp();

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

// noinspection JSUnusedGlobalSymbols
export const addUserDataOnNewUser = functions.auth.user().onCreate((user) => {
    if (user.providerData.length === 0) {
        return admin.firestore().collection('users').doc(user.uid).set({
            email: null,
            username: "guest",
        })
    } else {
        return admin.firestore().collection('users').doc(user.uid).set({
            email: user.email ? user.email : null,
            username: user.displayName ? user.displayName : "User" + Math.floor(Math.random() * 1000),
        })
    }
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
                        if (word.localeCompare(guess, {sensitivity: 'base'}) === 0 && val.team === data.team) {
                            update = change.after.ref.update({finished: true, correct: val.user, word: word});
                            return true
                        }
                        return false
                    });
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
});

// noinspection JSUnusedGlobalSymbols
export const onGameUpdate = functions.firestore.document('games/{gameId}').onUpdate((change: functions.Change<DocumentSnapshot>) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const docRef = change.after.ref;
    if (beforeData !== undefined && afterData !== undefined) {
        // Host clicked start game
		let pictoWords: string[] = ['Angel', 'Angry', 'Baby', 'Ball', 'Beard', 'Bed', 'Bee', 'Book', 'Bowtie', 'Bucket', 'Bunny', 'Bus', 'Butterfly', 'Cake', 'Camera', 'Castle', 'Cat', 'Chain saw', 'Circus tent', 'Computer', 'Crayon', 'Dolphin', 'Dragon', 'Dumbbell', 'Eel', 'Egg', 'Eyeball', 'Ferris wheel', 'Fireworks', 'Flag', 'Flower', 'Flute', 'Frame', 'Frog', 'Garbage', 'Giraffe', 'Glasses', 'Glue', 'Hand', 'Ice cream', 'Igloo', 'Jump rope', 'Key', 'Kite', 'Kiwi', 'Koala', 'Ladybug', 'Lamp', 'Leprechaun', 'Light bulb', 'Lion', 'Lipstick', 'Lollipop', 'Magnet', 'Mailbox', 'Mask', 'Megaphone', 'Mermaid', 'Money', 'Music', 'Night', 'Nose', 'Owl', 'Pacifier', 'Peanut', 'Photo', 'Pie', 'Pizza', 'Plate', 'Pocket watch', 'Pumpkin', 'Rain', 'Robot', 'Sand castle', 'Seat belt', 'Slipper', 'Snail', 'Snowflake', 'Snowman', 'Space', 'Spider', 'Stairs', 'Starfish', 'Stethoscope', 'Strawberry', 'Sun', 'Tadpole', 'Teapot', 'Telescope', 'Thread', 'Tire', 'Toothbrush', 'Train', 'Treasure', 'Tree', 'Tricycle', 'Truck', 'Trumpet', 'Turtle', 'Zombie'];
		const index = Math.floor(Math.random() * pictoWords.length);
		if (beforeData.lobby && !afterData.lobby) {
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
                        .create(docRef.collection('roundInfo').doc('roundWords'), {[roundDoc.id]: pictoWords[index]})
                        .create(roundDoc, {drawer, round: 1, team: users[drawer].team, finished: false})
                        .update(docRef, {currentRound: roundDoc.id, joinCode: null, nextRound: false})
                })
            })
        } else if (!beforeData.nextRound && afterData.nextRound) { // nextRound goes from false, to true
            // get users, find available drawers on other team,
            const prevRoundID = beforeData.currentRound;
            return admin.firestore().runTransaction((transaction) => {
                return transaction.getAll(docRef.collection('users').doc('users'), docRef.collection('roundInfo').doc(prevRoundID)).then((docData) => {
                    const usersDoc = docData[0];
                    const prevRoundDoc = docData[1];
                    const users = usersDoc.data();
                    const prevRound = prevRoundDoc.data();
                    if (users && Object.keys(users).length !== 0 && prevRound) {
                        const userKeys = Object.keys(users);
                        const nextTeam = prevRound.team === 1 ? 2 : 1;
                        const nextDrawers = userKeys.reduce((availDrawers: string[], userKey: string) => {
                            const user = users[userKey];
                            if (user.team === nextTeam && !user.drawn) {
                                availDrawers.push(userKey)
                            }
                            return availDrawers
                        }, []);
                        if (nextDrawers.length === 0) {
                            return transaction.update(docRef, {finished: true, nextRound: false})
                        }
                        const drawIndex = Math.floor(Math.random() * nextDrawers.length);
                        const drawer = nextDrawers[drawIndex];
                        users[drawer].drawn = true;
                        const roundDoc = docRef.collection('roundInfo').doc();
                        return transaction.set(docRef.collection('users').doc('users'), users)
                            .create(roundDoc, {drawer, round: prevRound.round + 1, team: nextTeam, finished: false})
                            .update(docRef.collection('roundInfo').doc('roundWords'), {[roundDoc.id]: pictoWords[index] + (prevRound.round + 1)})
                            .update(docRef, {currentRound: roundDoc.id, nextRound: false})
                    }
                    throw new Error("no users found")
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
            return snap.ref.update({joinCode: joinCode, lobby: true, finished: false})
        }
        console.error("Join code not available: " + joinCode);
        return snap.ref.update({error: true})
    })
});