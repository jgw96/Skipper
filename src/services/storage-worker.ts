let root: FileSystemDirectoryHandle | null = null;

onmessage = (e) => {
    if (e.data.type === 'save') {
        saveConversation(e.data.name, e.data.convo).then(() => {
            postMessage({ type: 'saved' });
        });
    }
    else if (e.data.type === 'getall') {
        getConversations().then((conversations) => {
            postMessage({ type: 'all', conversations });
        });

    }
}


async function saveConversation(name: string, convo: string): Promise<void> {
    return new Promise(async (resolve) => {
        if (!root) {
            root = await navigator.storage.getDirectory();
        }

        // remove any existing file
        try {
            const file = await root.getFileHandle(name);
            // @ts-ignore
            await file.remove();
        }
        catch (e) {
            // do nothing
        }

        const draftFile = await root.getFileHandle(name, { create: true });
        // Create FileSystemSyncAccessHandle on the file.
        // @ts-ignore
        const accessHandle = await draftFile.createSyncAccessHandle();
        // Get size of the file.
        const fileSize = accessHandle.getSize();
        // Read file content to a buffer.
        const readBuffer = new ArrayBuffer(fileSize);
        const readSize = accessHandle.read(readBuffer, { "at": 0 });

        // Write a sentence to the end of the file.
        const encoder = new TextEncoder();
        const writeBuffer = encoder.encode(convo);
        accessHandle.write(writeBuffer, { "at": readSize });
        // Persist changes to disk.
        accessHandle.flush();
        // Always close FileSystemSyncAccessHandle if done.
        accessHandle.close();

        resolve();
    })
}

async function getConversations() {
    if (!root) {
        root = await navigator.storage.getDirectory();
    }

    const conversations: any[] = [];

    // @ts-ignore
    for await (const entry of root.values()) {
        if (entry.kind !== 'file') {
            continue;
        }
        conversations.push(entry.getFile().then((file: any) => {
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