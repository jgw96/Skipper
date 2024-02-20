const root = await navigator.storage.getDirectory();

let saveWorker = new Worker(new URL('./storage-worker.ts', import.meta.url), { type: 'module' });

export async function saveConversation(name: string, convo: any[]): Promise<void> {
    return new Promise((resolve) => {
        saveWorker.onmessage = (e) => {
            if (e.data.type === 'saved') {
                resolve();
            }
        }

        saveWorker.postMessage({ type: 'save', name, convo: JSON.stringify(convo) });
    })
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
    return new Promise((resolve) => {
        saveWorker.onmessage = (e) => {
            if (e.data.type === 'all') {
                resolve(e.data.conversations);
            }
        }

        saveWorker.postMessage({ type: 'getall' });
    })
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