import { FileWithHandle } from "browser-fs-access";

const root = await navigator.storage.getDirectory();

let currentName = '';

export async function saveConversation(name: string, convo: any[]) {
    console.log("name", name, "currentName", currentName)

    const file = await root.getFileHandle(name, { create: true });
    // @ts-ignore
    const writer = await file.createWritable();

    await writer.write(JSON.stringify(convo));
    await writer.close();
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

export async function getConversations() {
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
                    date: file.lastModified
                }
            })
        }));
    }
    const readyToGo = await Promise.all(conversations);

    // sort by date, which is a timestamp
    readyToGo.sort((a, b) => {
        return b.date - a.date;
    });

    return readyToGo;
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