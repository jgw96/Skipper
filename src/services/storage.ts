// import { FileWithHandle } from "browser-fs-access";

import { FileWithHandle } from "browser-fs-access";
import { get, set } from "idb-keyval";
import { getConvosFromCloud } from "./cloud-storage";
import { auth } from "./auth/firebase-auth";
import { SimpleCrypto } from "./simplecrypto";

const root = await navigator.storage.getDirectory();

let saveWorker = new Worker(new URL('./storage-worker.ts', import.meta.url), { type: 'module' });

const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || isFirefox;

async function handleCypherKey() {
    const key = await get("cypherkey");
    if (!key) {
        const newKey = await SimpleCrypto.generateKey();
        const jwk = await SimpleCrypto.exportKey(newKey);

        const importedKey = await SimpleCrypto.importKey(jwk);
        console.log("Imported Key:", importedKey);

        await set("cypherkey", jwk);
        return importedKey;
    }
    else {
        const importedKey = await SimpleCrypto.importKey(key);
        console.log("Imported Key:", importedKey);
        return importedKey;
    }
}

export async function saveConversation(name: string, convo: any[]): Promise<void> {
    return new Promise(async (resolve) => {
        const currentUser = auth.currentUser;

        if (isSafari) {
            await saveUsingIDB(name, convo);

            if (currentUser) {
                const { saveConvoToCloud } = await import("./cloud-storage");
                saveConvoToCloud(convo);

                resolve();
            }
            else {
                resolve();
            }
        }
        else {
            const noteID = generateRandoID();
            const noteDate = new Date().getTime();

            const cryptoKey = await handleCypherKey();

            let encrypted;

            try {
                encrypted = await SimpleCrypto.encrypt(cryptoKey, JSON.stringify(convo));
                console.log("encrypted", encrypted);
                if (encrypted && encrypted.length > 0) {
                    (convo as unknown as string) = encrypted;
                }
            } catch (error) {
                console.error("Error encrypting convo", error);
            }

            const noteObject = {
                name,
                convo,
                date: noteDate,
                id: noteID
            };

            saveWorker.onmessage = async (e) => {
                if (e.data.type === 'saved') {
                    if (currentUser) {
                        const { saveConvoToCloud } = await import("./cloud-storage");
                        saveConvoToCloud(noteObject);

                        resolve();
                    }
                    else {
                        resolve();
                    }
                }
            }

            saveWorker.postMessage({
                type: 'save',
                ...noteObject
            });
        }
    })
}

async function saveUsingIDB(name: string, convo: any[]) {
    const currentConversations = await get('convos');

    const noteID = generateRandoID();
    const noteDate = new Date().getTime();

    if (!currentConversations) {
        const newConvo = {
            name: name,
            content: JSON.stringify(convo),
            date: noteDate,
            id: noteID
        };

        await set('convos', [newConvo]);
    }
    else {

        // check if convo already exists and remove if it does
        const existingConvo = currentConversations.find((convo: any) => convo.name === name);
        if (existingConvo) {
            const filteredConversations = currentConversations.filter((convo: any) => convo.name !== name);
            const newConvo = {
                name: name,
                content: JSON.stringify(convo),
                date: noteDate,
                id: noteID
            };

            await set('convos', [newConvo, ...filteredConversations]);
        }
        else {
            const newConvo = {
                name: name,
                content: JSON.stringify(convo),
                date: noteDate,
                id: noteID
            };

            await set('convos', [newConvo, ...currentConversations]);
        }
    }
}

export async function renameConvo(oldName: string, newName: string) {
    const convo: any = await root.getFileHandle(oldName);
    console.log("convo", convo)
    await convo.move(newName);
    return;
}

export async function exportAllConversations() {
    const conversations = await getConversations();
    const blob = new Blob([JSON.stringify(conversations)], { type: 'application/json' });

    // save with file-system-access api
    // @ts-ignore
    const handle = await window.showSaveFilePicker({
        suggestedName: 'conversations.json',
        types: [
            {
                description: 'JSON',
                accept: {
                    'application/json': ['.json'],
                },
            },
        ],
    });

    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close()
}

export async function getConversations(): Promise<any> {
    if (isSafari) {
        return await getConversationsIDB();
    }
    else {
        const conversations: any[] = [];

        // @ts-ignore
        for await (const entry of root.values()) {
            if (entry.kind !== 'file') {
                continue;
            }

            conversations.push(entry.getFile().then((file: FileWithHandle) => {
                return file.text().then(async (text: string) => {
                    // return {
                    //     name: file.name,
                    //     content: JSON.parse(text),
                    //     date: file.lastModified,
                    //     id: generateRandoID()
                    // }

                    const parsedObject = JSON.parse(text);
                    await decryptConvo(parsedObject);

                    return parsedObject;
                })
            }));
        }
        const readyToGo = await Promise.all(conversations);

        // const { addDocsToSearch } = await import("./local-search")
        // addDocsToSearch(readyToGo);

        let cloudConvosParsed: any[] = [];
        const cloudConvos = await getConvosFromCloud();
        (cloudConvos || []).forEach(async (convo: any) => {
            if (!convo.convo) {
                convo.convo = convo.content;
            }

            console.log("cloud convo", convo);
            convo.convo = JSON.parse(convo.convo);

            if (typeof (convo.convo) === 'string') {
                const key = await handleCypherKey();
                const decrypted = await SimpleCrypto.decrypt(key, convo.convo);
                convo.convo = JSON.parse(decrypted);
            }

            // cloudConvosParsed.push({
            //     name: convo.name,
            //     content: JSON.parse(convo.convo),
            //     // date: new Date().getTime(),
            //     // id: generateRandoID()
            // });
            cloudConvosParsed.push(convo);
        });

        console.log("cloudConvos", cloudConvosParsed);

        const allConvos = [...readyToGo, ...cloudConvosParsed];

        // remove duplicates
        const uniqueConvos = allConvos.filter((convo, index, self) =>
            index === self.findIndex((t) => (
                t.name === convo.name
            ))
        );

        // sort by date, which is a timestamp
        uniqueConvos.sort((a, b) => {
            return b.date - a.date;
        });

        return uniqueConvos;
    }
}

export async function decryptConvo(parsedObject: any) {
    if (typeof (parsedObject.convo) === 'string') {
        const key = await handleCypherKey();
        const decrypted = await SimpleCrypto.decrypt(key, parsedObject.convo);
        parsedObject.convo = JSON.parse(decrypted);

        return parsedObject;
    }
    else {
        return null;
    }
}

export async function getConversationsIDB() {
    return new Promise(async (resolve) => {
        const formattedConversations: any[] = [];

        const conversations = await get('convos');
        if (!conversations) {
            resolve([]);
        }

        conversations.forEach((convo: any) => {
            formattedConversations.push({
                name: convo.name,
                content: JSON.parse(convo.content),
                // date: new Date().getTime(),
                // id: generateRandoID()
            });
        });

        console.log("formattedConversations", formattedConversations)

        formattedConversations.sort((a, b) => {
            return b.date - a.date;
        });

        resolve(formattedConversations);
    });
}

export async function deleteConversation(name: string) {
    const file = await root.getFileHandle(name);
    // @ts-ignore
    await file.remove();
}

export async function getConversation(name: string) {
    const file = await root.getFileHandle(name);
    const goodFile = await file.getFile();
    return JSON.parse(await goodFile.text());
}

export async function editConvoName(oldName: string, newName: string) {
    const file = await root.getFileHandle(oldName);
    // @ts-ignore
    await file.rename(newName);
}

function generateRandoID() {
    // generate random id using web crypto
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    let str = '';
    for (let i = 0; i < array.length; i++) {
        str += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4);
    }
    return str;
}