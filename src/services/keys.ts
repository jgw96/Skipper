export async function setGoogleKey(key: string) {
    const { set } = await import("idb-keyval");
    await set("google-api-key", key);
}

export async function getGoogleKey() {
    const { get } = await import("idb-keyval");
    return await get("google-api-key");
}

export async function setOpenAIKey(key: string) {
    const { set } = await import("idb-keyval");
    await set("openai-api-key", key);
}

export async function getOpenAIKey() {
    const { get } = await import("idb-keyval");
    return await get("openai-api-key");
}