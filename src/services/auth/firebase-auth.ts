import { initializeApp } from "firebase/app";

import { getAuth, getRedirectResult, onAuthStateChanged, setPersistence, browserSessionPersistence, signInWithRedirect, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseConfig } from "../cloud-storage";

// https://firebasestorage.googleapis.com/v0/b/memos-ai.appspot.com/o/notes%2F2614300090?alt=media&token=1244f5cd-2e44-4439-b2af-157f854a4ce3


const provider = new GoogleAuthProvider();
const msprovider = new OAuthProvider('microsoft.com');
msprovider.addScope("user.read");
msprovider.addScope("mail.readwrite");
msprovider.addScope("mail.send");

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

const auth = getAuth();

export let currentUser: any;

onAuthStateChanged(auth, (user) => {
    console.log("onauth state changed", user)
    if (user) {
        currentUser = user;
        console.log("currentUser state changed", currentUser);


    } else {
        currentUser = undefined;
        console.log("user", user);
    }
});

getRedirectResult(auth)
    .then((result: any) => {
        console.log("result redirect", result);

        // User is signed in.
        // IdP data available in result.additionalUserInfo.profile.

        // Get the OAuth access token and ID Token
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential!.accessToken;
        console.log("credential", credential);

        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        }

        currentUser = result.additionalUserInfo.profile;

        // The signed-in user info.
        // const user = result.user;

        // currentUser = user;
        // console.log("currentUser", currentUser);

        // console.log("user", user);
        // console.log("user redirect", user);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log("errorCode", errorCode);
        console.log("errorMessage", errorMessage);
        // ...
    });

export async function loginWithMicrosoft() {
    try {
        await setPersistence(auth, browserSessionPersistence);
        const data = await signInWithPopup(auth, msprovider);
        console.log('data', data);

        const credential = OAuthProvider.credentialFromResult(data);
        const accessToken = credential!.accessToken;
        console.log("credential", credential);

        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        }

        return accessToken;

    }
    catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log('errorCode', errorCode);
        console.log('errorMessage', errorMessage);
        return null;
    }
}

export async function loginWithPopup() {
    try {
        await setPersistence(auth, browserSessionPersistence);
        const data = await signInWithPopup(auth, provider);

        const user = data.user;

        currentUser = user;

        console.log("user", user);

        return user;
    }
    catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log('errorCode', errorCode);
        console.log('errorMessage', errorMessage);

        return null;
    }
}

export async function login() {
    try {
        await setPersistence(auth, browserSessionPersistence);
        const data = await signInWithRedirect(auth, provider);
        console.log('data', data);
    }
    catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log('errorCode', errorCode);
        console.log('errorMessage', errorMessage);
    }
}

export async function logout() {
    try {
        await auth.signOut();
        location.reload();
    }
    catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log('errorCode', errorCode);
        console.log('errorMessage', errorMessage);
    }
}