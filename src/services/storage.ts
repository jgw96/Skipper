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

export async function getConversations() {
    const conversations: any[] = [];
    // @ts-ignore
    for await (const file of root.values()) {
        if (file.kind !== 'file') {
            continue;
        }
        const goodFile = await file.getFile();
        console.log("goodFile", goodFile);
        conversations.push({
            name: file.name,
            content: JSON.parse(await goodFile.text()),
            date: goodFile.lastModified
        });
    }
    console.log("conversations", conversations);

    // sort by date, which is a timestamp
    conversations.sort((a, b) => {
        return b.date - a.date;
    });

    console.log("conversations sorted", conversations);

    return conversations;
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