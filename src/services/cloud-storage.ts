import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore } from "firebase/firestore";
import { currentUser } from "./auth/auth";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export async function saveConvoToCloud(convo: any) {
    if (currentUser) {
        convo.convo = JSON.stringify(convo.convo);
        const docRef = await addDoc(collection(db, `users/${currentUser.userPrincipalName}/convos/`), convo);
        console.log("Document written with ID: ", docRef.id);
    }
}

export async function deleteConvoFromCloud(name: string, convo: any) {
    console.log(convo);
    if (currentUser) {
        await deleteDoc(doc(db, `users/${currentUser.userPrincipalName}/convos/saved/${name}`));
    }
}

export async function getConvosFromCloud() {
    console.log("currentUser", currentUser);
    if (currentUser) {
        let cloudConvos: any[] = [];

        const querySnapshot = await getDocs(collection(db, `users/${currentUser.userPrincipalName}/convos/`));
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