// import { FileWithHandle } from "browser-fs-access";

import { FileWithHandle } from "browser-fs-access";
import { get, set } from "idb-keyval";
import { currentUser } from "./auth/auth";
import { getConvosFromCloud } from "./cloud-storage";

const root = await navigator.storage.getDirectory();

let saveWorker = new Worker(new URL('./storage-worker.ts', import.meta.url), { type: 'module' });

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export async function saveConversation(name: string, convo: any[]): Promise<void> {
    return new Promise(async (resolve) => {
        console.log("saving...", name, convo, currentUser);
        if (isSafari) {
            await saveUsingIDB(name, convo);

            if (currentUser) {
                const { saveConvoToCloud } = await import("./cloud-storage");
                saveConvoToCloud(name, convo);

                resolve();
            }
            else {
                resolve();
            }
        }
        else {
            saveWorker.onmessage = async (e) => {
                if (e.data.type === 'saved') {
                    if (currentUser) {
                        const { saveConvoToCloud } = await import("./cloud-storage");
                        saveConvoToCloud(name, convo);

                        resolve();
                    }
                    else {
                        resolve();
                    }
                }
            }

            saveWorker.postMessage({ type: 'save', name, convo: JSON.stringify(convo) });
        }
    })
}

async function saveUsingIDB(name: string, convo: any[]) {
    const currentConversations = await get('convos');
    if (!currentConversations) {
        const newConvo = {
            name: name,
            content: JSON.stringify(convo)
        };

        await set('convos', [newConvo]);
    }
    else {
        const newConvo = {
            name: name,
            content: JSON.stringify(convo)
        };

        await set('convos', [...currentConversations, newConvo]);
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
                return file.text().then((text: string) => {
                    return {
                        name: file.name,
                        content: JSON.parse(text),
                        date: file.lastModified,
                        id: generateRandoID()
                    }
                })
            }));
        }
        const readyToGo = await Promise.all(conversations);

        const { addDocsToSearch } = await import("./local-search")
        addDocsToSearch(readyToGo);

        let cloudConvosParsed: any[] = [];
        const cloudConvos = await getConvosFromCloud();
        cloudConvos.forEach((convo: any) => {
            cloudConvosParsed.push({
                name: convo.name,
                content: JSON.parse(convo.convo),
                date: new Date().getTime(),
                id: generateRandoID()
            });
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
                date: new Date().getTime(),
                id: generateRandoID()
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