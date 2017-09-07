import firebase from 'firebase'

export const firebaseApp = firebase.initializeApp(config);

export const db = firebaseApp.database();
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebaseApp.auth();
