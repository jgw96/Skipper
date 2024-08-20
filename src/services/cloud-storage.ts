import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore } from "firebase/firestore";
import { auth } from "./auth/firebase-auth";
// import { currentUser } from "./auth/firebase-auth";

export const firebaseConfig = {
    apiKey: "AIzaSyDj1Q61aEMhjcsEDU_R_G4ssygfiyZKM1U",
    authDomain: "skipper-ef960.firebaseapp.com",
    projectId: "skipper-ef960",
    storageBucket: "skipper-ef960.appspot.com",
    messagingSenderId: "820903332879",
    appId: "1:820903332879:web:d494e07d11ca23163ca77a"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export async function saveConvoToCloud(convo: any) {
    const syncFlag = localStorage.getItem("cloudSync") === "true" ? true : false;
    let currentUser = auth.currentUser;

    if (!currentUser) {
        window.addEventListener('auth-changed', async (e: any) => {
            console.log("auth changed", e.detail.currentUser);
            currentUser = e.detail.currentUser;

            if (currentUser && syncFlag) {
                convo.convo = JSON.stringify(convo.convo);
                const docRef = await addDoc(collection(db, `users/${currentUser.email || currentUser.displayName}/convos/`), convo);
                console.log("Document written with ID: ", docRef.id);
            }
        });
    }
    else if (currentUser && syncFlag) {
        convo.convo = JSON.stringify(convo.convo);
        const docRef = await addDoc(collection(db, `users/${currentUser.email || currentUser.displayName}/convos/`), convo);
        console.log("Document written with ID: ", docRef.id);
    }
    else {
        return;
    }
}

export async function deleteConvoFromCloud(name: string, convo: any) {
    console.log(convo);
    const currentUser = auth.currentUser;
    if (currentUser) {
        await deleteDoc(doc(db, `users/${currentUser.email || currentUser.displayName}/convos/saved/${name}`));
    }
}

export async function getConvosFromCloud() {
    let currentUser = auth.currentUser;

    if (!currentUser) {
        window.addEventListener('auth-changed', async (e: any) => {
            console.log("auth changed", e.detail.currentUser);
            currentUser = e.detail.currentUser;

            console.log("currentUser", currentUser);
            const syncFlag = localStorage.getItem("cloudSync") === "true" ? true : false;
            if (currentUser && syncFlag) {
                let cloudConvos: any[] = [];

                const querySnapshot = await getDocs(collection(db, `users/${currentUser.email || currentUser.displayName}/convos/`));
                querySnapshot.forEach(async (doc) => {
                    console.log(`${doc.id} => ${doc.data().convo}`);

                    // doc.data().convo = JSON.parse(doc.data().convo);

                    cloudConvos.push(doc.data());
                });

                return cloudConvos;
            }
            else {
                return [];
            }
        });
    }
    else {
        console.log("currentUser", currentUser);
        const syncFlag = localStorage.getItem("cloudSync") === "true" ? true : false;
        if (currentUser && syncFlag) {
            let cloudConvos: any[] = [];

            const querySnapshot = await getDocs(collection(db, `users/${currentUser.email || currentUser.displayName}/convos/`));
            querySnapshot.forEach(async (doc) => {
                console.log(`${doc.id} => ${doc.data().convo}`);

                // doc.data().convo = JSON.parse(doc.data().convo);

                cloudConvos.push(doc.data());
            });

            return cloudConvos;
        }
        else {
            return [];
        }
    }

    // Add a return statement here
    return [];
}
