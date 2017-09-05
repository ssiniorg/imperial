import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyDFJvGMawlU51blOHFy-5173Cj6Q6F2mVk",
    authDomain: "imperial-d5146.firebaseapp.com",
    databaseURL: "https://imperial-d5146.firebaseio.com",
    projectId: "imperial-d5146",
    storageBucket: "",
    messagingSenderId: "288385523341"
};

export const firebaseApp = firebase.initializeApp(config);

export const db = firebaseApp.database();
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebaseApp.auth();